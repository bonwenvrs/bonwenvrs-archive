#!/usr/bin/env python3
"""Generate stories.json from folders and PDF files in stories/."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
STORIES_DIR = ROOT / "stories"
OUTPUT = ROOT / "stories.json"

stories = []
if STORIES_DIR.exists():
    for folder in sorted((p for p in STORIES_DIR.iterdir() if p.is_dir()), key=lambda p: p.name.casefold()):
        pdfs = sorted(
            (p for p in folder.rglob("*") if p.is_file() and p.suffix.lower() == ".pdf"),
            key=lambda p: p.name.casefold()
        )
        if not pdfs:
            continue
        intro_file = folder / "intro.txt"
        description = intro_file.read_text(encoding="utf-8").strip() if intro_file.is_file() else ""

        stories.append({
            "title": folder.name,
            "description": description,
            "pdfs": [
                {
                    "name": pdf.name,
                    "path": pdf.relative_to(ROOT).as_posix()
                }
                for pdf in pdfs
            ]
        })

OUTPUT.write_text(
    json.dumps({"stories": stories}, ensure_ascii=False, indent=2) + "\n",
    encoding="utf-8"
)
print(f"Generated {OUTPUT.name} with {len(stories)} story folder(s).")
