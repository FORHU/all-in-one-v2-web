import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const apiCalls = [];
page.on("response", async (res) => {
  const url = res.url();
  if (url.includes("/api/v2/") || url.includes(":5002")) {
    let bodySnippet = "";
    try {
      const text = await res.text();
      bodySnippet = text.slice(0, 300);
    } catch {}
    apiCalls.push(
      `${res.status()} ${res.request().method()} ${url}\n  -> ${bodySnippet}`,
    );
  }
});

await page.goto("http://addictstyle.com:3000/categories/shoes", {
  waitUntil: "networkidle",
  timeout: 30000,
});
await page.waitForTimeout(2000);

console.log("=== all /api/v2 calls ===");
console.log(apiCalls.join("\n\n"));

await browser.close();
