import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://addictstyle.com:5000/", {
  waitUntil: "networkidle",
  timeout: 30000,
});
await page.waitForTimeout(1500);
await page.screenshot({ path: "check-home.png", fullPage: false });
console.log(
  await page
    .locator("body")
    .innerText()
    .then((t) => t.slice(0, 600)),
);
await browser.close();
