from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
SHEET = ROOT.parent / "rejected-first-pass" / "phase1-concept-sheet-chromakey.png"
OUT = ROOT / "sheet-extracted"
REPORT = OUT / "extract-report.json"


@dataclass(frozen=True)
class RowSpec:
    name: str
    frames: int
    y_min: int
    y_max: int


ROWS = [
    RowSpec("surprised", 6, 40, 235),
    RowSpec("clap", 6, 260, 450),
    RowSpec("idle_tail", 4, 465, 650),
    RowSpec("salute", 6, 670, 850),
    RowSpec("sleepy", 5, 860, 1035),
    RowSpec("sulk", 5, 1045, 1220),
    RowSpec("eat", 6, 1230, 1395),
    RowSpec("happy_jump", 8, 1400, 1570),
]


def is_background(r: int, g: int, b: int) -> bool:
    return g > 120 and g > r * 1.22 and g > b * 1.22


def make_mask(im: Image.Image) -> bytearray:
    w, h = im.size
    pix = im.load()
    mask = bytearray(w * h)
    for y in range(h):
        for x in range(w):
            r, g, b, a = pix[x, y]
            if a and not is_background(r, g, b):
                mask[y * w + x] = 1
    return mask


def components(mask: bytearray, w: int, h: int) -> list[dict[str, object]]:
    seen = bytearray(w * h)
    found: list[dict[str, object]] = []
    for y in range(h):
        for x in range(w):
            idx = y * w + x
            if not mask[idx] or seen[idx]:
                continue
            stack = [(x, y)]
            seen[idx] = 1
            xs: list[int] = []
            ys: list[int] = []
            for cx, cy in stack:
                xs.append(cx)
                ys.append(cy)
                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h:
                        nidx = ny * w + nx
                        if mask[nidx] and not seen[nidx]:
                            seen[nidx] = 1
                            stack.append((nx, ny))
            bbox = (min(xs), min(ys), max(xs) + 1, max(ys) + 1)
            area = len(xs)
            if area >= 4800 and bbox[0] > 110 and bbox[2] - bbox[0] >= 70 and bbox[3] - bbox[1] >= 90:
                found.append({"bbox": bbox, "area": area})
    return found


def remove_background(crop: Image.Image) -> Image.Image:
    out = crop.convert("RGBA")
    data = []
    for r, g, b, a in out.getdata():
        if is_background(r, g, b):
            data.append((0, 0, 0, 0))
            continue
        # Remove minor green spill near transparent edges.
        if a and g > max(r, b) + 14:
            g = round((r + b) / 2)
        data.append((r, g, b, a))
    out.putdata(data)
    return out


def fit_to_cell(sprite: Image.Image) -> Image.Image:
    sprite = remove_background(sprite)
    bbox = sprite.getchannel("A").getbbox()
    canvas = Image.new("RGBA", (192, 208), (0, 0, 0, 0))
    if not bbox:
        return canvas
    sprite = sprite.crop(bbox)
    max_w, max_h = 176, 190
    scale = min(max_w / sprite.width, max_h / sprite.height, 1.0)
    if scale < 1.0:
        sprite = sprite.resize(
            (max(1, round(sprite.width * scale)), max(1, round(sprite.height * scale))),
            Image.Resampling.LANCZOS,
        )
    x = (192 - sprite.width) // 2
    y = 208 - sprite.height - 8
    canvas.alpha_composite(sprite, (x, y))
    return canvas


def extract_row(sheet: Image.Image, comps: list[dict[str, object]], spec: RowSpec) -> dict[str, object]:
    row_comps = [
        comp
        for comp in comps
        if spec.y_min <= ((comp["bbox"][1] + comp["bbox"][3]) / 2) <= spec.y_max
    ]
    row_comps.sort(key=lambda item: item["bbox"][0])
    selected = row_comps[: spec.frames]

    strip = Image.new("RGBA", (192 * spec.frames, 208), (0, 0, 0, 0))
    bboxes = []
    for i, comp in enumerate(selected):
        left, top, right, bottom = comp["bbox"]
        pad = 8
        crop = sheet.crop(
            (
                max(0, left - pad),
                max(0, top - pad),
                min(sheet.width, right + pad),
                min(sheet.height, bottom + pad),
            )
        )
        frame = fit_to_cell(crop)
        strip.alpha_composite(frame, (i * 192, 0))
        bboxes.append(comp["bbox"])

    out_path = OUT / f"{spec.name}.png"
    strip.save(out_path)
    return {
        "name": spec.name,
        "expected_frames": spec.frames,
        "found_frames": len(selected),
        "output": str(out_path),
        "bboxes": bboxes,
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(SHEET).convert("RGBA")
    mask = make_mask(sheet)
    comps = components(mask, sheet.width, sheet.height)
    report = [extract_row(sheet, comps, row) for row in ROWS]
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    print(REPORT)


if __name__ == "__main__":
    main()
