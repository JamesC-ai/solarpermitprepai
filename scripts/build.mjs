import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const publicDir = new URL("public/", root);
const distDir = new URL("dist/", root);
const site = "https://solar.pagecheckai.com";

const seoPages = [
  {
    slug: "residential-solar-permit-precheck",
    title: "Residential Solar Permit Precheck",
    description: "Check whether a residential PV project has the basic AHJ, roof, equipment, and document details needed before requesting a plan-set quote.",
  },
  {
    slug: "solar-plan-set-intake-checklist",
    title: "Solar Plan Set Intake Checklist",
    description: "Prepare the address, site plan, roof layout, one-line diagram inputs, labels, cut sheets, and utility details a drafter will ask for.",
  },
  {
    slug: "pv-single-line-diagram-checklist",
    title: "PV Single-Line Diagram Checklist",
    description: "Organize the electrical details commonly needed for a residential PV single-line diagram review and handoff.",
  },
  {
    slug: "solar-ahj-permit-readiness",
    title: "Solar AHJ Permit Readiness",
    description: "Create a practical quote request for your local authority having jurisdiction without promising engineering approval.",
  },
  {
    slug: "solarapp-permit-intake",
    title: "SolarAPP Permit Intake",
    description: "Collect the design details installers often need before checking whether a residential PV project may fit a SolarAPP+ style workflow.",
  },
];

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(publicDir, distDir, { recursive: true });

for (const page of seoPages) {
  await mkdir(new URL(`${page.slug}/`, distDir), { recursive: true });
  await writeFile(
    new URL(`${page.slug}/index.html`, distDir),
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${page.title} - SolarPermitPrepAI</title>
    <meta name="description" content="${page.description}" />
    <link rel="icon" href="/favicon.svg" />
    <link rel="stylesheet" href="/styles.css" />
  </head>
  <body>
    <main class="shell seo-page">
      <a class="eyebrow" href="/">SolarPermitPrepAI</a>
      <h1>${page.title}</h1>
      <p>${page.description}</p>
      <section class="panel">
        <h2>What this tool prepares</h2>
        <p>Use the precheck to organize residential PV project data before a drafter, installer, utility coordinator, or licensed engineer reviews the job.</p>
        <ul>
          <li>Project address, state, city, and AHJ notes.</li>
          <li>Roof, module, inverter, battery, and service panel details.</li>
          <li>Missing permit packet documents and follow-up questions.</li>
          <li>Quote request language for a human plan-set review.</li>
        </ul>
        <a class="primary" href="/#precheck">Run precheck</a>
      </section>
    </main>
  </body>
</html>`,
  );
}

const urls = [
  "",
  "privacy.html",
  "terms.html",
  "support.html",
  ...seoPages.map((page) => page.slug),
];

await writeFile(
  new URL("robots.txt", distDir),
  `User-agent: *
Allow: /
Sitemap: ${site}/sitemap.xml
`,
);

await writeFile(
  new URL("sitemap.xml", distDir),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => `  <url><loc>${site}/${url}</loc></url>`)
  .join("\n")}
</urlset>
`,
);

console.log("Built SolarPermitPrepAI.");
