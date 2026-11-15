# Bonwenvrs' Archive

A static public archive for your AUs and stories. GitHub Pages hosts the website; GitHub Actions automatically rebuilds the story index whenever you push to `main`.

## Add a story

1. Open the `stories/` folder.
2. Create a folder named after your AU, for example `The Space Between Us`.
3. Upload one or more PDF files into that folder.
4. Commit/push your changes to the `main` branch.
5. Wait for **Actions → Build and deploy archive** to finish. Your new title will appear on the website.

Example:

```text
stories/
├── The Space Between Us/
│   ├── Chapter 01.pdf
│   └── Chapter 02.pdf
└── Until We Meet Again/
    └── Complete Story.pdf
```

The folder name becomes the displayed title. PDFs inside nested subfolders are also indexed. Empty folders and folders without PDFs are ignored.

## Publish with GitHub Pages

1. Create a **public** GitHub repository (for example, `bonwenvrs-archive`).
2. Upload the contents of this project to the repository root. Keep the `.github` folder.
3. Make sure the default branch is named `main`.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment → Source**, select **GitHub Actions**.
6. Open the **Actions** tab and wait for **Build and deploy archive** to complete.
7. Your site URL will be shown in the deployment job and in **Settings → Pages**.

After the initial setup, adding or replacing PDFs and pushing to `main` automatically triggers a new deployment.

## Notes

- The repository and its PDFs are public. Anyone with the website or repository link can access and download the stories.
- GitHub Pages is static hosting; no server or database is needed.
- The PDF viewer uses the visitor's browser PDF support. The Open and Download links are provided as alternatives.
- GitHub Pages deployment may take a few minutes after a push.
