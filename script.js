document.addEventListener("DOMContentLoaded", () => {
  const storiesContainer = document.getElementById("stories-container");
  const readerView = document.getElementById("reader-view");
  const backButton = document.getElementById("back-to-archive");
  const readerTitle = document.getElementById("reader-title");
  const readerIntro = document.getElementById("reader-intro");
  const readerChapters = document.getElementById("reader-chapters");
  const readerContent = document.getElementById("reader-content");

  let storiesCache = [];

  function createStoryCard(story) {
    const card = document.createElement("article");
    card.className = "story-card";

    const topGroup = document.createElement("div");

    const titleEl = document.createElement("h2");
    titleEl.className = "story-title";
    titleEl.textContent = story.title || story.slug;
    topGroup.appendChild(titleEl);

    if (story.intro && story.intro.trim().length > 0) {
      const introEl = document.createElement("p");
      introEl.className = "story-intro";
      introEl.textContent = story.intro.trim();
      topGroup.appendChild(introEl);

      requestAnimationFrame(() => {
        introEl.classList.add("is-flashed");
      });
    }

    card.appendChild(topGroup);

    const metaRow = document.createElement("div");
    metaRow.className = "story-meta";

    const countEl = document.createElement("span");
    countEl.className = "chapter-count";
    const count = Array.isArray(story.files) ? story.files.length : 0;
    countEl.textContent = `${count} ${count === 1 ? "part" : "parts"}`;
    metaRow.appendChild(countEl);

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "story-link";
    openBtn.textContent = "Read";
    openBtn.addEventListener("click", () => openStory(story));
    metaRow.appendChild(openBtn);

    card.appendChild(metaRow);
    return card;
  }

  async function loadChapterText(storyPath, fileName) {
    readerContent.textContent = "Loading...";
    try {
      const encodedPath = `${storyPath}/${encodeURIComponent(fileName)}`;
      const response = await fetch(encodedPath, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const text = await response.text();
      readerContent.textContent = text;
    } catch (error) {
      readerContent.textContent = `Unable to load ${fileName}.`;
      console.error(error);
    }
  }

  function openStory(story) {
    storiesContainer.classList.add("hidden");
    readerView.classList.remove("hidden");
    readerView.setAttribute("aria-hidden", "false");

    readerTitle.textContent = story.title || story.slug;

    if (story.intro && story.intro.trim().length > 0) {
      readerIntro.textContent = story.intro.trim();
      readerIntro.classList.remove("hidden");
      readerIntro.classList.remove("is-flashed");
      requestAnimationFrame(() => readerIntro.classList.add("is-flashed"));
    } else {
      readerIntro.textContent = "";
      readerIntro.classList.add("hidden");
    }

    readerChapters.innerHTML = "";
    readerContent.textContent = "";

    const files = Array.isArray(story.files) ? story.files : [];
    if (files.length === 0) {
      readerContent.textContent = "No chapter files found in this folder yet.";
      return;
    }

    files.forEach((fileName, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "chapter-btn";
      btn.textContent = fileName.replace(/\.[^/.]+$/, "");
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".chapter-btn")
          .forEach((el) => el.classList.remove("active"));
        btn.classList.add("active");
        loadChapterText(story.path, fileName);
      });
      readerChapters.appendChild(btn);

      if (index === 0) {
        btn.classList.add("active");
        loadChapterText(story.path, fileName);
      }
    });
  }

  backButton.addEventListener("click", () => {
    readerView.classList.add("hidden");
    readerView.setAttribute("aria-hidden", "true");
    storiesContainer.classList.remove("hidden");
  });

  async function init() {
    try {
      const response = await fetch("./stories.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      storiesCache = await response.json();
      storiesContainer.innerHTML = "";

      if (!Array.isArray(storiesCache) || storiesCache.length === 0) {
        const empty = document.createElement("p");
        empty.className = "story-empty";
        empty.textContent = "No stories found. Add folders inside stories/ and rebuild.";
        storiesContainer.appendChild(empty);
        return;
      }

      const fragment = document.createDocumentFragment();
      storiesCache.forEach((story) => {
        fragment.appendChild(createStoryCard(story));
      });
      storiesContainer.appendChild(fragment);
    } catch (error) {
      console.error("Failed to load stories.json:", error);
      storiesContainer.innerHTML =
        '<p class="story-empty">Could not load stories.json. Run build_index.py first.</p>';
    }
  }

  init();
});
