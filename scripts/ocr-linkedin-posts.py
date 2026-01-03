import os, re, json
from pathlib import Path

try:
    import pytesseract
    from PIL import Image, ImageOps, ImageFilter
except Exception as e:
    raise SystemExit("Missing deps. Run: python3 -m pip install --user pillow pytesseract")

ROOT = Path.cwd()
PUBLIC = ROOT / "public" / "sources" / "linkedin" / "david-reid"
DATA = ROOT / "data" / "tastings" / "experts" / "david-reid"

def clean_text(t: str) -> str:
    t = t.replace("\r", "")
    t = re.sub(r"[ \t]+\n", "\n", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()

def ocr_image(img_path: Path) -> str:
    img = Image.open(img_path)
    img = ImageOps.grayscale(img)
    img = img.filter(ImageFilter.SHARPEN)
    img = ImageOps.autocontrast(img)
    # Tesseract config: treat as a block of text
    cfg = "--oem 1 --psm 6"
    txt = pytesseract.image_to_string(img, lang="eng", config=cfg)
    return clean_text(txt)

def update_json(file_slug: str, ocr_txt: str):
    json_path = DATA / f"{file_slug}.json"
    if not json_path.exists():
        print(f"SKIP (no JSON): {json_path}")
        return

    j = json.loads(json_path.read_text(encoding="utf-8"))
    j.setdefault("source", {})
    j["source"]["original_text"] = ocr_txt

    json_path.write_text(json.dumps(j, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"UPDATED JSON: {json_path}")

def main():
    if not PUBLIC.exists():
        raise SystemExit(f"Missing: {PUBLIC}")

    folders = sorted([p for p in PUBLIC.glob("**/*") if p.is_dir()])

    did = 0
    for d in folders:
        post = d / "post-text.jpg"
        if not post.exists():
            continue

        file_slug = d.name
        try:
            txt = ocr_image(post)
        except Exception as e:
            print(f"FAIL OCR: {post} :: {e}")
            continue

        if not txt:
            print(f"EMPTY OCR: {post}")
            continue

        # write an OCR text file beside the images (useful for manual correction)
        out_txt = d / "post-text.ocr.txt"
        out_txt.write_text(txt + "\n", encoding="utf-8")
        print(f"WROTE TXT:   {out_txt}")

        update_json(file_slug, txt)
        did += 1

    print(f"\nDone. Updated {did} post(s).")

if __name__ == "__main__":
    main()
