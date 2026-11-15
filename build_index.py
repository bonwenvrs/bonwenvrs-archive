import json
import shutil
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
STORIES_DIR = BASE_DIR / "stories"
OUTPUT_JSON = BASE_DIR / "stories.json"


def _is_ignored_member(member_name: str) -> bool:
    parts = Path(member_name).parts
    return any(
        part == "__MACOSX" or part.startswith(".")
        for part in parts
    )


def _safe_extract_zip(zip_path: Path, target_dir: Path) -> None:
    target_dir.mkdir(parents=True, exist_ok=True)
    resolved_target = target_dir.resolve()

    with zipfile.ZipFile(zip_path, "r") as zf:
        for info in zf.infolist():
            if _is_ignored_member(info.filename):
                continue

            out_path = (target_dir / info.filename).resolve()
            if not str(out_path).startswith(str(resolved_target)):
                raise ValueError(f"Unsafe path in zip archive: {info.filename}")

            if info.is_dir():
                out_path.mkdir(parents=True, exist_ok=True)
            else:
                out_path.parent.mkdir(parents=True, exist_ok=True)
                with zf.open(info, "r") as src, open(out_path, "wb") as dst:
                    shutil.copyfileobj(src, dst)


def _flatten_single_wrapper_dir(target_dir: Path) -> None:
    visible_items = [
        item for item in target_dir.iterdir()
        if not item.name.startswith(".") and item.name != "__MACOSX"
    ]
    if len(visible_items) == 1 and visible_items[0].is_dir():
        wrapper = visible_items[0]
        for child in list(wrapper.iterdir()):
            dest = target_dir / child.name
            if dest.exists():
                if dest.is_dir():
                    shutil.rmtree(dest)
                else:
                    dest.unlink()
            shutil.move(str(child), str(dest))
        shutil.rmtree(wrapper, ignore_errors=True)


def extract_zip_archives() -> None:
    if not STORIES_DIR.exists():
        STORIES_DIR.mkdir(parents=True, exist_ok=True)
        return

    # 1. Extract top-level .zip files in stories/<slug>.zip -> stories/<slug>/
    for zip_file in sorted(STORIES_DIR.glob("*.zip"), key=lambda p: p.name.lower()):
        slug = zip_file.stem
        if not slug or slug.startswith("."):
            continue
        story_dir = STORIES_DIR / slug
        _safe_extract_zip(zip_file, story_dir)
        _flatten_single_wrapper_dir(story_dir)

    # 2. Extract nested .zip files inside existing story folders
    for folder in sorted(STORIES_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not folder.is_dir() or folder.name.startswith("."):
            continue
        for nested_zip in sorted(folder.glob("*.zip"), key=lambda p: p.name.lower()):
            _safe_extract_zip(nested_zip, folder)
            _flatten_single_wrapper_dir(folder)


def read_story_intro(story_folder: Path) -> str:
    for candidate in story_folder.rglob("*"):
        if candidate.is_file() and candidate.name.lower() == "intro.txt":
            if not _is_ignored_member(str(candidate.relative_to(story_folder))):
                return candidate.read_text(encoding="utf-8", errors="replace").strip()
    return ""


def format_title_from_slug(slug: str) -> str:
    return slug.replace("-", " ").replace("_", " ").strip().title()


def build_stories_index() -> list[dict]:
    extract_zip_archives()

    entries: list[dict] = []

    for folder in sorted(STORIES_DIR.iterdir(), key=lambda p: p.name.lower()):
        if not folder.is_dir():
            continue
        if (
            folder.name.startswith(".")
            or folder.name == "__MACOSX"
            or folder.name.upper().startswith("ADD-YOUR-STORY")
        ):
            continue

        slug = folder.name
        intro_text = read_story_intro(folder)

        chapters = sorted(
            [
                f.name
                for f in folder.iterdir()
                if f.is_file()
                and f.name.lower() != "intro.txt"
                and not f.name.lower().endswith(".zip")
                and not f.name.startswith(".")
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
