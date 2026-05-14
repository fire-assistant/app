from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "spritesheet.webp"
DRAFTS = ROOT / "phase1-strips"
OUT = ROOT / "processed"
REPORT = ROOT / "qa-report.json"

FRAME_SPECS = {
    "surprised": 6,
    "clap": 6,
    "idle_tail": 4,
    "salute": 6,
    "sleepy": 5,
    "sulk": 5,
    "eat": 6,
    "happy_jump": 8,
}

TARGETS = {
    "fur": (246, 221, 184),
    "shirt": (245, 144, 56),
    "navy": (46, 57, 78),
    "cheek": (242, 162, 95),
    "outline": (17, 17, 17),
}


def dist2(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return sum((a[i] - b[i]) ** 2 for i in range(3))


def classify(rgb: tuple[int, int, int]) -> str | None:
    r, g, b = rgb
    if g > 120 and g > r * 1.25 and g > b * 1.25:
        return "key"
    if r < 45 and g < 45 and b < 45:
        return "outline"
    if r > 215 and 175 <= g <= 245 and 120 <= b <= 225:
        return "fur"
    if r > 205 and 85 <= g <= 180 and b < 95:
        return "shirt"
    if r < 90 and g < 105 and 45 <= b <= 120:
        return "navy"
    if r > 210 and 125 <= g <= 190 and 70 <= b <= 140:
        return "cheek"
    return None


def normalize_pixel(px: tuple[int, int, int, int]) -> tuple[int, int, int, int]:
    r, g, b, a = px
    if a < 8:
        return (0, 0, 0, 0)

    label = classify((r, g, b))
    if label == "key":
        return (0, 0, 0, 0)
    if label in TARGETS:
        tr, tg, tb = TARGETS[label]
        if label == "outline":
            return (tr, tg, tb, 255)
        # Pull generated colors toward the source palette without erasing all shading.
        return (
            round(tr * 0.72 + r * 0.28),
            round(tg * 0.72 + g * 0.28),
            round(tb * 0.72 + b * 0.28),
            a,
        )
    return (r, g, b, a)


def despill_green(im: Image.Image) -> Image.Image:
    src = im.convert("RGBA")
    out = []
    for r, g, b, a in src.getdata():
        if a == 0:
            out.append((0, 0, 0, 0))
            continue
        if g > max(r, b) + 18:
            g = round((r + b) / 2)
        out.append((r, g, b, a))
    src.putdata(out)
    return src


def transparent_bounds(im: Image.Image) -> tuple[int, int, int, int] | None:
    alpha = im.getchannel("A")
    return alpha.getbbox()


def fit_frame(frame: Image.Image) -> Image.Image:
    frame = frame.convert("RGBA")
    bbox = transparent_bounds(frame)
    canvas = Image.new("RGBA", (192, 208), (0, 0, 0, 0))
    if not bbox:
        return canvas

    sprite = frame.crop(bbox)
    max_w, max_h = 168, 188
    scale = min(max_w / sprite.width, max_h / sprite.height, 1.0)
    new_size = (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale)))
    if new_size != sprite.size:
        sprite = sprite.resize(new_size, Image.Resampling.LANCZOS)

    x = (192 - sprite.width) // 2
    y = 208 - sprite.height - 8
    canvas.alpha_composite(sprite, (x, y))
    return canvas


def split_strip(im: Image.Image, frames: int) -> list[Image.Image]:
    w, h = im.size
    cell_w = w / frames
    result = []
    for i in range(frames):
        left = round(i * cell_w)
        right = round((i + 1) * cell_w)
        result.append(im.crop((left, 0, right, h)))
    return result


def palette_stats(im: Image.Image) -> dict[str, object]:
    counts = {key: 0 for key in TARGETS}
    sums = {key: [0, 0, 0] for key in TARGETS}
    for r, g, b, a in im.convert("RGBA").getdata():
        if a < 200:
            continue
        label = classify((r, g, b))
        if label in TARGETS:
            counts[label] += 1
            sums[label][0] += r
            sums[label][1] += g
            sums[label][2] += b

    averages = {}
    for key, count in counts.items():
        if count:
            averages[key] = [round(v / count) for v in sums[key]]
        else:
            averages[key] = None
    return {"counts": counts, "averages": averages}


def process_one(path: Path, name: str, frames: int) -> dict[str, object]:
    source = Image.open(path).convert("RGBA")
    mapped = Image.new("RGBA", source.size)
    mapped.putdata([normalize_pixel(px) for px in source.getdata()])

    mapped = despill_green(mapped)
    out_frames = [fit_frame(frame) for frame in split_strip(mapped, frames)]
    strip = Image.new("RGBA", (192 * frames, 208), (0, 0, 0, 0))
    for i, frame in enumerate(out_frames):
        strip.alpha_composite(frame, (i * 192, 0))

    OUT.mkdir(parents=True, exist_ok=True)
    out_path = OUT / f"{name}.png"
    strip.save(out_path)

    return {
        "name": name,
        "frames": frames,
        "draft": str(path),
        "processed": str(out_path),
        "draft_size": list(source.size),
        "processed_size": list(strip.size),
        "stats": palette_stats(strip),
    }


def main() -> None:
    results = []
    for name, frames in FRAME_SPECS.items():
        candidates = [
            DRAFTS / f"{name}-strict-chromakey.png",
            DRAFTS / f"{name}-chromakey.png",
        ]
        path = next((p for p in candidates if p.exists()), None)
        if not path:
            results.append({"name": name, "status": "missing", "frames": frames})
            continue
        item = process_one(path, name, frames)
        item["status"] = "processed"
        results.append(item)

    REPORT.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(REPORT)


if __name__ == "__main__":
    main()
