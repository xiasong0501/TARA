"use strict";

// Tables 2–4 and Appendix Table 7 of ICLR_2027_XIASONG.pdf.
const RESULTS = {
  anticipation: {
    title: "EK100 · future action anticipation", models: ["V-JEPA2-L", "V-JEPA2.1-B", "AVT-B", "Avg."],
    rows: [
      ["Black texture", [4.8, 5.7, 8.2, 6.2], [3.3, 5.0, 5.0, 4.4]],
      ["Random texture", [5.5, 8.9, 7.4, 7.3], [4.7, 5.5, 6.1, 5.4]],
      ["EOT", [30.3, 59.3, 32.9, 40.8], [25.1, 57.1, 25.0, 35.7]],
      ["Patch-Fool", [6.5, 46.9, 28.2, 27.2], [9.0, 27.9, 18.3, 18.4]],
      ["UPA-RFAS", [9.5, 17.1, 17.6, 14.7], [10.4, 15.7, 18.3, 14.8]],
      ["BTC-UAP", [13.9, 11.4, 36.5, 20.6], [10.4, 13.6, 28.3, 17.4]],
      ["PhyCamo", [13.9, 58.3, 42.4, 38.2], [13.7, 29.3, 30.0, 24.3]],
      ["TARA", [37.7, 70.6, 37.6, 48.6], [26.1, 67.1, 30.0, 41.1]]
    ]
  },
  recognition: {
    title: "SSV2 · action recognition", models: ["V-JEPA2-L", "VideoMAE-B", "InternVideo2", "Avg."],
    rows: [
      ["Black texture", [9.2, 5.7, 4.0, 6.3], [5.6, 10.8, 2.9, 6.4]],
      ["Random texture", [7.4, 1.1, 2.1, 3.5], [4.9, 1.8, 0.3, 2.3]],
      ["EOT", [25.5, 14.9, 15.8, 18.7], [30.6, 16.9, 13.2, 20.2]],
      ["Patch-Fool", [12.5, 13.7, 5.1, 10.4], [8.3, 16.9, 2.2, 9.1]],
      ["UPA-RFAS", [9.8, 14.3, 11.9, 12.0], [3.5, 16.9, 9.6, 10.0]],
      ["BTC-UAP", [12.5, 15.4, 14.1, 14.0], [5.6, 17.7, 15.7, 13.0]],
      ["PhyCamo", [17.9, 15.4, 24.3, 19.2], [12.5, 16.9, 23.5, 17.6]],
      ["TARA", [38.6, 17.1, 41.2, 32.3], [34.7, 17.7, 25.7, 26.0]]
    ]
  },
  generation: {
    title: "SSV2 · DiLA future frame generation", models: ["Train PSNR ↓", "Train MSE ↑", "Val PSNR ↓", "Val MSE ↑"],
    rows: [
      ["Clean", [17.37, 24.42, 17.19, 24.33]],
      ["Black patch", [16.48, 27.70, 16.51, 26.74]],
      ["Random patch", [17.10, 24.88, 17.12, 24.37]],
      ["EOT", [16.30, 29.96, 16.25, 29.03]],
      ["Patch-Fool", [15.94, 33.83, 16.41, 28.48]],
      ["UPA-RFAS", [15.32, 34.47, 15.58, 33.27]],
      ["BTC-UAP", [16.83, 25.07, 16.78, 25.54]],
      ["TARA", [11.38, 90.38, 12.66, 67.37]]
    ]
  }
};
const GENERALIZATION = [
  ["Seen content", "Seen trajectory", 40.5, 32.4],
  ["Seen content", "Unseen trajectory", 31.5, 24.3],
  ["Unseen content", "Seen trajectory", 43.2, 32.4],
  ["Unseen content", "Unseen trajectory", 28.8, 16.2]
];
let resultTask = "anticipation";
let resultSplit = "val";
let galleryGroup = "practical_anticipation";
let galleryOffset = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderResults() {
  const data = RESULTS[resultTask];
  const generation = resultTask === "generation";
  const index = generation || resultSplit === "train" ? 1 : 2;
  document.querySelector(".split-control").hidden = generation;
  document.querySelector("#generation-figure").hidden = !generation;
  const summary = document.querySelector("#result-summary");
  summary.textContent = `${data.title} · ${generation ? "Train and Val" : resultSplit === "val" ? "Validation" : "Training"}`;
  const table = element("table", `result-table${generation ? " generation-table" : ""}`);
  const caption = element("caption", "sr-only", `${data.title}; ${generation ? "Train and Val" : resultSplit}; ${generation ? "PSNR in dB and MSE in units of 0.001" : "Top-1 ASR in percent"}`);
  table.append(caption);
  const thead = element("thead");
  const header = element("tr");
  ["Attack", ...data.models].forEach(text => { const th = element("th", "", text); th.scope = "col"; header.append(th); });
  thead.append(header); table.append(thead);
  const best = data.models.map((_, col) => {
    const values = data.rows.map(row => row[index][col]);
    return generation && col % 2 === 0 ? Math.min(...values) : Math.max(...values);
  });
  const tbody = element("tbody");
  data.rows.forEach(row => {
    const tr = element("tr", row[0] === "TARA" ? "ours-row" : "");
    const th = element("th", "", row[0]); th.scope = "row"; tr.append(th);
    row[index].forEach((value, col) => tr.append(element("td", value === best[col] ? "best" : "", value.toFixed(generation ? 2 : 1))));
    tbody.append(tr);
  });
  table.append(tbody);
  document.querySelector("#result-table").replaceChildren(table);
  document.querySelector("#result-note").textContent = generation
    ? "PSNR (dB) ↓; MSE (×10⁻³) ↑, measured against clean target frames. 155 Train / 82 Val clips."
    : "Top-1 ASR (%) ↑, conditioned on clean-correct predictions. Avg. is the mean across models; bold marks the best result in each column.";
}

function renderGeneralization() {
  const cards = GENERALIZATION.map(([content, trajectory, ours, eot]) => {
    const card = element("article", "generalization-cell");
    const heading = element("h4"); heading.append(content, element("br"), trajectory); card.append(heading);
    [["TARA", ours, "ours"], ["EOT", eot, "baseline"]].forEach(([name, value, className]) => {
      const row = element("div", `mini-bar ${className}`);
      row.setAttribute("aria-label", `${name}: ${value.toFixed(1)}% Top-1 ASR`);
      const track = element("span", "bar-track");
      const bar = element("span", "bar"); bar.style.width = `${value / 50 * 100}%`;
      track.append(bar); row.append(track, element("strong", "", `${value.toFixed(1)}%`)); card.append(row);
    });
    return card;
  });
  document.querySelector("#generalization-grid").replaceChildren(...cards);
}

function renderGallery() {
  const gallery = window.TARA_GALLERY || [];
  const rows = gallery.filter(row => row.group === galleryGroup);
  const grid = document.querySelector("#gallery-grid");
  grid.querySelectorAll("video").forEach(video => { video.pause(); video.removeAttribute("src"); video.replaceChildren(); video.load(); });
  const cards = rows.slice(galleryOffset, galleryOffset + 2).map(row => {
    const card = element("article", "video-card");
    const video = element("video");
    video.controls = true; video.loop = true; video.muted = true; video.playsInline = true;
    video.preload = "none"; video.poster = row.poster;
    [[row.video, "video/mp4"], [row.webm, "video/webm"]].forEach(([path, type]) => {
      if (!path) return;
      const source = element("source"); source.src = path; source.type = type; video.append(source);
    });
    video.setAttribute("aria-label", `${row.label}; ${row.kind}; 32 sampled input frames`);
    const body = element("div", "video-card-body");
    const meta = element("div", "video-meta");
    const link = element("a", "", "View all 32 frames"); link.href = row.montage; link.target = "_blank"; link.rel = "noopener";
    meta.append(link);
    body.append(element("h3", "", row.label), meta);
    card.append(video, body); return card;
  });
  grid.replaceChildren(...cards);
  document.querySelector("#gallery-range").textContent = `Examples ${galleryOffset + 1}–${Math.min(galleryOffset + 2, rows.length)} of ${rows.length}`;
  document.querySelector("#gallery-prev").disabled = galleryOffset === 0;
  document.querySelector("#gallery-next").disabled = galleryOffset + 2 >= rows.length;
  document.querySelector("#gallery-panel").setAttribute("aria-labelledby", `tab-${galleryGroup}`);
}

document.querySelectorAll("[data-result]").forEach(button => button.addEventListener("click", () => {
  resultTask = button.dataset.result;
  document.querySelectorAll("[data-result]").forEach(item => { const selected = item === button; item.classList.toggle("selected", selected); item.setAttribute("aria-pressed", String(selected)); });
  renderResults();
}));
document.querySelectorAll("[data-split]").forEach(button => button.addEventListener("click", () => {
  resultSplit = button.dataset.split;
  document.querySelectorAll("[data-split]").forEach(item => { const selected = item === button; item.classList.toggle("selected", selected); item.setAttribute("aria-pressed", String(selected)); });
  renderResults();
}));
const tabs = [...document.querySelectorAll("[data-group]")];
tabs.forEach((button, index) => {
  button.addEventListener("click", () => {
    galleryGroup = button.dataset.group; galleryOffset = 0;
    tabs.forEach(item => { const selected = item === button; item.setAttribute("aria-selected", String(selected)); item.tabIndex = selected ? 0 : -1; });
    renderGallery();
  });
  button.addEventListener("keydown", event => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  });
});
document.querySelector("#gallery-prev").addEventListener("click", () => { galleryOffset -= 2; renderGallery(); });
document.querySelector("#gallery-next").addEventListener("click", () => { galleryOffset += 2; renderGallery(); });
document.querySelector("#copy-citation").addEventListener("click", async () => {
  const text = document.querySelector("#bibtex").textContent;
  const status = document.querySelector("#copy-status");
  try { await navigator.clipboard.writeText(text); status.textContent = "BibTeX copied."; }
  catch { const range = document.createRange(); range.selectNodeContents(document.querySelector("#bibtex")); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); status.textContent = "Citation selected. Press Ctrl+C or ⌘C to copy."; }
});
renderResults();
renderGeneralization();
renderGallery();
