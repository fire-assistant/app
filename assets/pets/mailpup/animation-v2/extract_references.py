from __future__ import annotations

import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parent
ATLAS = ROOT.parent / "spritesheet.webp"
REFS = ROOT / "references"

CELLS = {
    "standing": (0, 0),
    "standing_smile": (3, 0),
    "run_right": (1, 1),
    "wave": (2, 3),
    "clap_like": (2, 4),
    "sad": (0, 5),
    "happy": (3, 6),
}

PALETTE = {
    "fur": "#f6ddb8",
    "shirt": "#f59038",
    "navy": "#2e394e",
    "cheek": "#f2a25f",
    "outline": "#111111",
    "badge": "#f2c84b",
}


def crop_cell(atlas: Image.Image, col: int, row: int) -> Image.Image:
    return atlas.crop((col * 192, row * 208, (col + 1) * 192, (row + 1) * 208))


def main() -> None:
    REFS.mkdir(parents=True, exist_ok=True)
    atlas = Image.open(ATLAS).convert("RGBA")
    for name, (col, row) in CELLS.items():
        crop_cell(atlas, col, row).save(REFS / f"{name}.png")

    (ROOT / "palette-lock.json").write_text(
        json.dumps(PALETTE, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(REFS)


if __name__ == "__main__":
    main()
