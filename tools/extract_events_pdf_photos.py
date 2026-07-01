from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SOURCE_IMAGE = ROOT.parent / "tmp" / "pdfs" / "202605_pages" / "page_08.png"
PUBLIC_OUTPUT = ROOT / "public" / "assets" / "photos" / "events"
TMP_OUTPUT = ROOT / "tmp" / "events-photo-crops"
CONTACT_SHEET = ROOT / "tmp" / "events-pdf-photo-contact-sheet.png"


@dataclass(frozen=True)
class CropSpec:
    image_id: str
    title: str
    source_label: str
    box: tuple[int, int, int, int]
    decision: str
    safety: str


CROPS: tuple[CropSpec, ...] = (
    CropSpec(
        "pdf-kazenotani-forest",
        "風の谷 森林の楽校",
        "202605.pdf p.8-9 / No.9",
        (382, 142, 646, 306),
        "採用",
        "遠景中心。顔は主題ではない。",
    ),
    CropSpec(
        "pdf-hokushin-ringo",
        "北信りんごの里 田畑の楽校",
        "202605.pdf p.8-9 / No.7",
        (688, 527, 951, 690),
        "採用",
        "集合写真だが顔は小さめ。必要なら再確認。",
    ),
    CropSpec(
        "pdf-azumino-tour",
        "安曇野ツアー 2月",
        "202605.pdf p.8-9 / No.8",
        (688, 910, 951, 1058),
        "採用",
        "遠景集合。顔は小さい。",
    ),
    CropSpec(
        "pdf-iijima-farm",
        "農業体験＆竹林整備 @ 飯島農園",
        "202605.pdf p.8-9 / No.3",
        (994, 142, 1256, 306),
        "採用",
        "後ろ姿・作業中心。",
    ),
    CropSpec(
        "pdf-kaminosen-forest",
        "神の泉 森林の楽校",
        "202605.pdf p.8-9 / No.2",
        (1295, 527, 1558, 690),
        "採用",
        "作業風景中心。顔は主題ではない。",
    ),
    CropSpec(
        "pdf-forest-volunteer-tokyo",
        "里山・森林ボランティア入門講座 in 東京",
        "202605.pdf p.8-9 / No.5",
        (994, 910, 1257, 1058),
        "採用",
        "作業風景中心。顔は主題ではない。",
    ),
    CropSpec(
        "pdf-shimanto-forest",
        "四万十川 森林の楽校",
        "202605.pdf p.8-9 / No.14",
        (78, 910, 340, 1058),
        "採用",
        "遠景・作業風景中心。",
    ),
    CropSpec(
        "pdf-workshop-shikoku",
        "里山・森林ボランティア入門講座 in 四国",
        "202605.pdf p.8-9 / No.13",
        (78, 527, 340, 690),
        "要許諾確認",
        "集合写真で顔が見えるため公開資産には使わない。",
    ),
    CropSpec(
        "pdf-okutama-potato",
        "おくたま治助芋植付け",
        "202605.pdf p.8-9 / No.6",
        (688, 142, 951, 306),
        "採用",
        "手元作業中心。顔は主題ではない。",
    ),
    CropSpec(
        "pdf-town-walk",
        "町並みと民家を訪ねる会",
        "202605.pdf p.8-9 / No.10",
        (382, 527, 646, 690),
        "要許諾確認",
        "集合写真で顔が見えるため公開資産には使わない。",
    ),
)


def center_crop_to_ratio(image: Image.Image, ratio: float) -> Image.Image:
    width, height = image.size
    current_ratio = width / height
    if abs(current_ratio - ratio) < 0.01:
        return image

    if current_ratio < ratio:
        new_height = int(width / ratio)
        top = max((height - new_height) // 2, 0)
        return image.crop((0, top, width, top + new_height))

    new_width = int(height * ratio)
    left = max((width - new_width) // 2, 0)
    return image.crop((left, 0, left + new_width, height))


def render_crop(source: Image.Image, spec: CropSpec, size: tuple[int, int]) -> Image.Image:
    crop = source.crop(spec.box)
    crop = center_crop_to_ratio(crop, size[0] / size[1])
    return crop.resize(size, Image.Resampling.LANCZOS)


def save_contact_sheet(items: list[tuple[CropSpec, Image.Image]]) -> None:
    CONTACT_SHEET.parent.mkdir(parents=True, exist_ok=True)
    thumb_w, thumb_h = 320, 180
    label_h = 74
    cols = 2
    rows = (len(items) + cols - 1) // cols
    gap = 18
    margin = 24
    sheet_w = margin * 2 + cols * thumb_w + (cols - 1) * gap
    sheet_h = margin * 2 + rows * (thumb_h + label_h) + (rows - 1) * gap
    sheet = Image.new("RGB", (sheet_w, sheet_h), "#f6f3ea")
    draw = ImageDraw.Draw(sheet)

    try:
        font = ImageFont.truetype("arial.ttf", 18)
        small = ImageFont.truetype("arial.ttf", 14)
    except OSError:
        font = ImageFont.load_default()
        small = ImageFont.load_default()

    for index, (spec, image) in enumerate(items):
        col = index % cols
        row = index // cols
        x = margin + col * (thumb_w + gap)
        y = margin + row * (thumb_h + label_h + gap)
        sheet.paste(image.resize((thumb_w, thumb_h), Image.Resampling.LANCZOS), (x, y))
        status_color = "#1f7a3f" if spec.decision == "採用" else "#a15c15"
        draw.rectangle((x, y + thumb_h, x + thumb_w, y + thumb_h + label_h), fill="#ffffff")
        draw.text((x + 10, y + thumb_h + 8), f"{spec.image_id}", fill="#123b2a", font=font)
        draw.text((x + 10, y + thumb_h + 32), f"{spec.title}", fill="#1e2722", font=small)
        draw.text((x + 10, y + thumb_h + 52), f"{spec.decision}", fill=status_color, font=small)

    sheet.save(CONTACT_SHEET)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--force", action="store_true", help="overwrite existing public files")
    parser.add_argument("--public", action="store_true", help="copy adopted crops to public assets")
    args = parser.parse_args()

    if not SOURCE_IMAGE.exists():
        raise SystemExit(f"source page image not found: {SOURCE_IMAGE}")

    source = Image.open(SOURCE_IMAGE).convert("RGB")
    TMP_OUTPUT.mkdir(parents=True, exist_ok=True)
    generated: list[tuple[CropSpec, Image.Image]] = []

    for spec in CROPS:
        image = render_crop(source, spec, (1000, 563))
        tmp_path = TMP_OUTPUT / f"{spec.image_id}.png"
        image.save(tmp_path)
        generated.append((spec, image))

        if args.public and spec.decision == "採用":
            PUBLIC_OUTPUT.mkdir(parents=True, exist_ok=True)
            public_path = PUBLIC_OUTPUT / f"{spec.image_id}.png"
            if public_path.exists() and not args.force:
                raise SystemExit(f"refusing to overwrite without --force: {public_path}")
            image.save(public_path)

    save_contact_sheet(generated)
    print(f"generated {len(generated)} review crops: {TMP_OUTPUT}")
    print(f"contact sheet: {CONTACT_SHEET}")
    if args.public:
        adopted = sum(1 for spec, _ in generated if spec.decision == "採用")
        print(f"public assets written: {adopted} files -> {PUBLIC_OUTPUT}")


if __name__ == "__main__":
    main()
