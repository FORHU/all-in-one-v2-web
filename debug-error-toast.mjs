import { chromium } from "playwright";

const browser = await chromium.launch();
const context = await browser.newContext({ ignoreHTTPSErrors: true });
const page = await context.newPage();

const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
const nonOkResponses = [];

page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("pageerror", (err) => pageErrors.push(err.message));
page.on("requestfailed", (req) => {
  failedRequests.push(
    `${req.method()} ${req.url()} -> ${req.failure()?.errorText}`,
  );
});
page.on("response", (res) => {
  if (res.status() >= 400) {
    nonOkResponses.push(
      `${res.status()} ${res.request().method()} ${res.url()}`,
    );
  }
});

await page.goto("http://addictstyle.com:3000/categories/shoes", {
  waitUntil: "networkidle",
  timeout: 30000,
});
await page.waitForTimeout(3000);

console.log("=== console errors ===");
console.log(consoleErrors.join("\n") || "(none)");
console.log("=== page errors (uncaught exceptions) ===");
console.log(pageErrors.join("\n") || "(none)");
console.log("=== failed requests (network-level) ===");
console.log(failedRequests.join("\n") || "(none)");
console.log("=== non-2xx responses ===");
console.log(nonOkResponses.join("\n") || "(none)");

const toastVisible = await page
  .locator('text="Unexpected error occurred"')
  .count();
console.log("=== toast visible on load? ===", toastVisible);

await page.screenshot({ path: "debug-shoes.png", fullPage: false });
await browser.close();
