import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders SolarPermitPrepAI precheck", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /SolarPermitPrepAI/);
  assert.match(html, /Generate permit precheck/);
  assert.match(html, /Email quote request/);
  assert.match(html, /not an engineering stamp/);
});

test("ships browser-local permit generator", async () => {
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
  assert.match(script, /function generate/);
  assert.match(script, /SolarPermitPrepAI packet/);
  assert.match(script, /not a permit approval/);
  assert.doesNotMatch(script, /fetch\(/);
});

test("includes policy support and SEO discovery files", async () => {
  const robots = await readFile(new URL("../dist/robots.txt", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  const terms = await readFile(new URL("../dist/terms.html", import.meta.url), "utf8");
  const support = await readFile(new URL("../dist/support.html", import.meta.url), "utf8");
  assert.match(robots, /Sitemap: https:\/\/solar\.pagecheckai\.com\/sitemap\.xml/);
  assert.match(sitemap, /residential-solar-permit-precheck/);
  assert.match(sitemap, /solarapp-permit-intake/);
  assert.match(terms, /not an engineering service/i);
  assert.match(support, /SolarPermitPrepAI support/);
});
