from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
REF = ROOT / "references" / "standing.png"
REF_BLINK = ROOT / "references" / "standing_smile.png"
OUT = ROOT / "approved"


def shift_opaque(im: Image.Image, dx: int = 0, dy: int = 0) -> Image.Image:
    canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
    canvas.alpha_composite(im, (dx, dy))
    return canvas


def tail_mask(im: Image.Image) -> Image.Image:
    # Tail is on the right side of the original standing frame.
    mask = Image.new("L", im.size, 0)
    source_alpha = im.getchannel("A")
    for y in range(96, 145):
        for x in range(139, 178):
            if source_alpha.getpixel((x, y)) > 0:
                mask.putpixel((x, y), 255)
    return mask


def shift_tail(im: Image.Image, dx: int) -> Image.Image:
    body = im.copy()
    mask = tail_mask(im)
    transparent = Image.new("RGBA", im.size, (0, 0, 0, 0))
    body.paste(transparent, mask=mask)

    tail = Image.new("RGBA", im.size, (0, 0, 0, 0))
    tail.alpha_composite(im)
    empty = Image.new("RGBA", im.size, (0, 0, 0, 0))
    tail_bg_removed = empty.copy()
    tail_bg_removed.paste(tail, mask=mask)

    shifted = Image.new("RGBA", im.size, (0, 0, 0, 0))
    shifted.alpha_composite(tail_bg_removed, (dx, 0))
    body.alpha_composite(shifted)
    return body


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    base = Image.open(REF).convert("RGBA")
    blink = Image.open(REF_BLINK).convert("RGBA")
    frames = [
        base,
        shift_opaque(shift_tail(base, 2), 0, -1),
        shift_tail(base, -2),
        blink,
    ]

    strip = Image.new("RGBA", (192 * len(frames), 208), (0, 0, 0, 0))
    for i, frame in enumerate(frames):
        strip.alpha_composite(frame, (i * 192, 0))

    strip.save(OUT / "idle_tail.png")
    print(OUT / "idle_tail.png")


if __name__ == "__main__":
    main()
