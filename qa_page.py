#!/usr/bin/env python3
"""Check the static project page with Playwright; no GPU or model required.

Run a static server for dist/, then: python qa_page.py --url http://localhost:8765
Screenshots are written to the ignored .local-preview/ directory.
"""
import argparse
from pathlib import Path

from playwright.sync_api import sync_playwright


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:8765/")
    parser.add_argument("--chromium", default=None)
    args = parser.parse_args()
    preview = Path(__file__).resolve().parent / ".local-preview"
    preview.mkdir(exist_ok=True)
    errors = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(
            headless=True, executable_path=args.chromium, args=["--no-sandbox"]
        )
        page = browser.new_page(viewport={"width": 1440, "height": 1060})
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on("response", lambda response: errors.append(f"HTTP {response.status}: {response.url}") if response.status >= 400 else None)
        assert page.goto(args.url, wait_until="networkidle").status == 200
        assert page.locator("h1").count() == 1
        assert page.locator("[data-group='practical_anticipation']").get_attribute("aria-selected") == "true"
        assert page.locator(".code-placeholder").is_disabled()
        assert "note =" not in page.locator("#bibtex").inner_text()
        assert page.locator("#physical-results tbody tr:not(.protocol-row)").count() == 8
        assert page.locator("#physical-results .ours-row").last.inner_text().split() == ["Printed", "TARA", "32.1", "—", "28.2", "—"]
        for group in ("practical_anticipation", "practical_recognition", "ek100", "ssv2"):
            page.locator(f"[data-group='{group}']").click()
            for offset in range(0, 10, 2):
                assert page.locator("#gallery-grid video").count() == 2
                assert page.locator("#gallery-range").inner_text() == f"Examples {offset + 1}–{offset + 2} of 10"
                if offset < 8:
                    page.locator("#gallery-next").click()
        for task, val, train in (("anticipation", "41.1", "48.6"), ("recognition", "26.0", "32.3")):
            page.locator(f"[data-result='{task}']").click()
            page.locator("[data-split='val']").click()
            assert page.locator("#result-table .ours-row td").last.inner_text() == val
            page.locator("[data-split='train']").click()
            assert page.locator("#result-table .ours-row td").last.inner_text() == train
        page.locator("[data-result='generation']").click()
        assert page.locator("#generation-figure").is_visible()
        assert page.locator("#result-table .ours-row td").last.inner_text() == "67.37"
        assert page.locator(".generalization-table .ours-row td").all_inner_texts() == ["40.5", "31.5", "43.2", "28.8"]
        page.locator("[data-result='anticipation']").click()
        page.locator("[data-split='val']").click()
        page.locator("[data-group='practical_anticipation']").click()
        video = page.locator("#gallery-grid video").first
        video.evaluate("el => el.play()")
        page.wait_for_function("document.querySelector('#gallery-grid video').currentTime > 0.2")
        assert video.evaluate("el => el.videoWidth > 0")
        video.evaluate("el => el.pause()")
        page.locator("#copy-citation").click()
        assert page.locator("#copy-status").inner_text()
        page.evaluate("window.getSelection().removeAllRanges()")
        for width, height, name in ((1440, 1060, "desktop"), (768, 1024, "tablet"), (390, 844, "mobile"), (320, 740, "small-mobile")):
            page.set_viewport_size({"width": width, "height": height})
            page.evaluate("window.scrollTo({top: 0, behavior: 'instant'})")
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), name
            page.screenshot(path=str(preview / f"{name}.png"), full_page=True)
            if name == "desktop":
                page.screenshot(path=str(preview / "first-screen.png"))
            if name == "mobile":
                assert page.locator(".figure-note").first.evaluate("el => parseFloat(getComputedStyle(el).fontSize)") >= 15
        assert not errors, errors
        print("PASS: 40 examples, physical/results tables, video playback, citation copy, and 4 responsive layouts.")
        print(f"Previews: {preview}")
        browser.close()


if __name__ == "__main__":
    main()
