# TARA · Across Viewpoints and Time

Project page for **Across Viewpoints and Time: Trajectory-Generalizable Physical Attacks on World Models and Video Understanding Models**.

**Website:** https://xiasong0501.github.io/TARA/

Song Xia, Meiewen Ding, Chenqi Kong, Wenhan Yang, and Xudong Jiang.

## Contents

- `dist/index.html`: project overview, authors, method, physical evaluation, benchmark, and citation.
- `dist/app.js`: interactive result tables and video-gallery controls.
- `dist/styles.css`: responsive layout and typography.
- `dist/data/`: metadata for 40 labeled video examples (10 per cohort).
- `dist/assets/`: manuscript PDF, paper figures, video examples, and 32-frame contact sheets.
- `.github/workflows/pages.yml`: deploys only `dist/` to GitHub Pages.

The gallery defaults to real-world print-and-capture videos. Quantitative results are transcribed from the submitted manuscript. Digital projection and physical print-and-recapture results are labeled separately. The examples are illustrative, not claims of success on each shown clip.

This repository contains the **project website only**. Research code, model checkpoints, and full datasets are not included; the research-code release remains to be updated.

## Preview

```bash
python3 -m http.server 8765 --directory dist
```

Open http://localhost:8765/. No build, npm installation, or GPU is required.

## Publish and maintain

Repository Settings → Pages → Source must be set to **GitHub Actions**. A push to `main` runs the publishing workflow; it can also be triggered manually from the Actions tab.

Edit `dist/` and push to `main` to update the page. Asset paths are relative so the `/TARA/` project path works. Keep canonical, Open Graph, and citation URLs in `dist/index.html` consistent with the public website.
