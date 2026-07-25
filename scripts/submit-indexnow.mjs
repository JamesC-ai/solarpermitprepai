import { readFile } from "node:fs/promises";

const host = "solar.pagecheckai.com";
const key = "cf398b202197d60941bf17f97fffe12b";
const keyLocation = `https://${host}/${key}.txt`;
const sitemap = await readFile("dist/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);

if (urlList.length === 0) {
  throw new Error("No URLs found in dist/sitemap.xml");
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "content-type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList,
  }),
});

const body = await response.text();
console.log(`IndexNow submitted ${urlList.length} URLs: ${response.status} ${response.statusText}`);
if (body.trim()) {
  console.log(body);
}

if (!response.ok && response.status !== 202) {
  throw new Error(`IndexNow submission failed with ${response.status}`);
}
