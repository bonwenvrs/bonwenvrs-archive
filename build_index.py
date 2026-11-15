import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STORIES_DIR = BASE_DIR / "stories"
OUTPUT_JSON = BASE_DIR / "stories.json"


def read_story_intro(story_folder: Path) -> str:
    intro_file = story_folder / "intro.txt"
    if not intro_file.is_file():
        return ""
    raw_text = intro_file.read_text(encoding="utf-8", errors="replace")
    return raw_text.strip()


def format_title_from_slug(slug: str) -> str:
    return slug.replace("-", " ").replace("_", " ").strip().title()


def build_stories_index() -> list[dict]:
    if not STORIES_DIR.exists():
        STORIES_DIR.mkdir(parents=True, exist_ok=True)

    entries: list[dict] = []

    for folder in sorted(STORIES_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not folder.is_dir():
            continue
        if folder.name.startswith(".") or folder.name.upper().startswith("ADD-YOUR-STORY"):
            continue

        slug = folder.name
        intro_text = read_story_intro(folder)

        # Collect text/chapter files inside the story folder if present
        chapters = sorted(
            [
                f.name
                for f in folder.iterdir()
                if f.is_file() and f.name.lower() != "intro.txt" and not f.name.startswith(".")
            ],
            key=lambda name: name.lower(),
        )

        entries.append(
            {
                "slug": slug,
                "title": format_title_from_slug(slug),
                "intro": intro_text,
                "has_intro": bool(intro_text),
                "path": f"stories/{slug}",
                "files": chapters,
            }
        )

    return entries


def main() -> None:
    index_data = build_stories_index()
    OUTPUT_JSON.write_text(
        json.dumps(index_data, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Generated {OUTPUT_JSON.name} with {len(index_data)} story entries.")


if __name__ == "__main__":
    main()
