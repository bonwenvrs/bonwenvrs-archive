const storyList = document.getElementById("story-list");
const storyCount = document.getElementById("story-count");
const searchInput = document.getElementById("search");
const emptyState = document.getElementById("empty-state");
const reader = document.getElementById("reader");
const readerTitle = document.getElementById("reader-title");
const pdfList = document.getElementById("pdf-list");
const viewerWrap = document.getElementById("pdf-viewer-wrap");
const viewer = document.getElementById("pdf-viewer");
const viewerFilename = document.getElementById("viewer-filename");
const openPdf = document.getElementById("open-pdf");

let stories = [];

function safeAssetPath(path) {
  return path.split("/").map(part => encodeURIComponent(part)).join("/");
}

function showPdf(pdf) {
  const url = safeAssetPath(pdf.path);
  viewer.src = url;
  openPdf.href = url;
  viewerFilename.textContent = pdf.name;
  viewerWrap.classList.remove("hidden");
}

function openStory(story) {
  readerTitle.textContent = story.title;
  pdfList.replaceChildren();
  viewer.src = "about:blank";
  viewerWrap.classList.add("hidden");

  story.pdfs.forEach((pdf, index) => {
    const item = document.createElement("div");
    item.className = "pdf-item";
    const icon = document.createElement("span");
    icon.className = "pdf-icon";
    icon.textContent = "PDF";
    const choose = document.createElement("button");
    choose.type = "button";
    choose.textContent = pdf.name;
    choose.addEventListener("click", () => showPdf(pdf));
    const download = document.createElement("a");
    download.className = "download-link";
    download.href = safeAssetPath(pdf.path);
    download.download = pdf.name;
    download.textContent = "Download";
    item.append(icon, choose, download);
    pdfList.append(item);
    if (index === 0) showPdf(pdf);
  });

  reader.classList.remove("hidden");
  reader.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderStories(query = "") {
  storyList.replaceChildren();
  const normalized = query.trim().toLocaleLowerCase();
  const visible = stories.filter(story => story.title.toLocaleLowerCase().includes(normalized));
  storyCount.textContent = `(${visible.length})`;
  emptyState.classList.toggle("hidden", visible.length !== 0);

  visible.forEach(story => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "story-card";
    const title = document.createElement("h3");
    title.textContent = story.title;
    const meta = document.createElement("div");
    meta.className = "story-meta";
    const count = document.createElement("span");
    count.textContent = `${story.pdfs.length} PDF${story.pdfs.length === 1 ? "" : "s"}`;
    const arrow = document.createElement("span");
    arrow.className = "story-arrow";
    arrow.textContent = "↗";
    meta.append(count, arrow);
    card.append(title, meta);
    card.addEventListener("click", () => openStory(story));
    storyList.append(card);
  });
}

document.getElementById("close-reader").addEventListener("click", () => {
  reader.classList.add("hidden");
  viewer.src = "about:blank";
});
searchInput.addEventListener("input", event => renderStories(event.target.value));

fetch("./stories.json", { cache: "no-store" })
  .then(response => {
    if (!response.ok) throw new Error("The story index could not be loaded.");
    return response.json();
  })
  .then(data => {
    stories = Array.isArray(data.stories) ? data.stories : [];
    renderStories();
    if (stories.length === 0) {
      storyList.innerHTML = '<p class="status-message">No stories yet. Add a folder containing PDF files inside <code>stories/</code>, then push your changes to GitHub.</p>';
    }
  })
  .catch(() => {
    storyList.innerHTML = '<p class="status-message">The archive index is not available yet. Check that the GitHub Actions workflow has completed successfully.</p>';
  });
