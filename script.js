document.addEventListener("DOMContentLoaded", () => {
  const container =
    document.querySelector("#stories-container") ||
    document.querySelector("[data-stories-list]") ||
    document.querySelector("main");

  if (!container) return;

  function createStoryCard(story) {
    const card = document.createElement("article");
    card.className = "story-card";
    card.dataset.slug = story.slug || "";

    const titleEl = document.createElement("h2");
    titleEl.className = "story-title";
    titleEl.textContent = story.title || story.slug || "Untitled Story";
    card.appendChild(titleEl);

    // Automatically flash intro.txt content as the story description when present
    if (story.intro && story.intro.trim().length > 0) {
      const introEl = document.createElement("p");
      introEl.className = "story-intro story-description";
      introEl.textContent = story.intro.trim();
      card.appendChild(introEl);

      requestAnimationFrame(() => {
        introEl.classList.add("is-flashed");
      });
    }

    if (story.path) {
      const linkEl = document.createElement("a");
      linkEl.className = "story-link";
      linkEl.href = `#story/${encodeURIComponent(story.slug)}`;
      linkEl.dataset.storyPath = story.path;
      linkEl.textContent = "Open Story";
      card.appendChild(linkEl);
    }

    return card;
  }

  async function loadStories() {
    try {
      const response = await fetch("./stories.json", { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const stories = await response.json();
      container.innerHTML = "";

      if (!Array.isArray(stories) || stories.length === 0) {
        const emptyMsg = document.createElement("p");
        emptyMsg.className = "story-empty";
        emptyMsg.textContent = "No stories found in the archive yet.";
        container.appendChild(emptyMsg);
        return;
      }

      const fragment = document.createDocumentFragment();
      stories.forEach((story) => {
        fragment.appendChild(createStoryCard(story));
      });
      container.appendChild(fragment);
    } catch (err) {
      console.error("Failed to load stories.json:", err);
    }
  }

  loadStories();
});
