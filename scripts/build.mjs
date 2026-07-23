import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const publicDir = new URL("public/", root);
const distDir = new URL("dist/", root);
const site = "https://solar.pagecheckai.com";
const reviewUrl = "https://www.paypal.com/ncp/payment/SSX7PVFVEGTHL";

const seoPages = [
  {
    slug: "residential-solar-permit-precheck",
    title: "Residential Solar Permit Precheck",
    description: "Check whether a residential PV project has the basic AHJ, roof, equipment, and document details needed before requesting a plan-set quote.",
    audience: "homeowners, solar sales teams, and permit coordinators preparing a residential PV packet",
    checklist: ["Project address and AHJ", "Roof and array notes", "Module and inverter model details", "Missing documents for quote review"],
    steps: ["Fill the precheck fields.", "Copy the generated packet.", "Send it to a drafter or installer.", "Use paid review only for packet prep, not engineering approval."],
    packetQuality: [
      "Record the full address, utility, AHJ, roof type, and known service-panel details before requesting a quote.",
      "Separate confirmed facts from assumptions so a drafter can see what still needs verification.",
      "Attach photos, cut sheets, and utility notes through your own secure project channel.",
    ],
    reviewBoundary: [
      "A licensed contractor, electrician, engineer, or permit professional must verify code and local requirements.",
      "Do not treat the generated packet as a final design, permit submission, or approval decision.",
      "Use the review as preparation for a cleaner handoff, not as a substitute for professional judgment.",
    ],
    missingItemTriggers: [
      "Unknown main service panel rating",
      "Missing module or inverter model numbers",
      "Unclear roof layout, setbacks, or structural notes",
      "Battery, backup, or service upgrade details that may require manual review",
    ],
    faq: [
      ["Is this an engineering stamp?", "No. SolarPermitPrepAI organizes intake data and quote notes; it does not provide engineering or permit approval."],
      ["Can I use it before a plan set quote?", "Yes. It helps gather the information a drafter or installer usually asks for first."],
    ],
  },
  {
    slug: "solar-plan-set-intake-checklist",
    title: "Solar Plan Set Intake Checklist",
    description: "Prepare the address, site plan, roof layout, one-line diagram inputs, labels, cut sheets, and utility details a drafter will ask for.",
    audience: "teams that need a cleaner handoff before requesting residential solar drawings",
    checklist: ["Site plan notes", "Roof layout inputs", "Equipment cut sheets", "Utility and service-panel details"],
    steps: ["Collect known project facts.", "Mark missing items.", "Generate the handoff checklist.", "Attach supporting files through your own secure channel."],
    packetQuality: [
      "Label every attachment clearly: site photos, roof notes, equipment cut sheets, utility bill, and panel photos.",
      "Include the current project stage so the drafter knows whether this is sales intake, quote prep, or revision cleanup.",
      "Use one source of truth for address, homeowner name, equipment models, and AHJ notes.",
    ],
    reviewBoundary: [
      "The checklist helps prepare a drawing request; it does not create stamped construction documents.",
      "Local AHJ forms, utility interconnection rules, and electrical code requirements still need qualified review.",
      "Confirm all assumptions before anyone submits drawings or orders materials.",
    ],
    missingItemTriggers: [
      "No site plan or roof layout sketch",
      "Missing equipment cut sheets",
      "Unclear utility or meter information",
      "No panel photo or breaker information",
    ],
    faq: [
      ["Does it create drawings?", "No. It creates an intake checklist and quote request, not a stamped plan set."],
      ["What if details are missing?", "The output calls out missing items so you can ask the homeowner, installer, or utility coordinator."],
    ],
  },
  {
    slug: "pv-single-line-diagram-checklist",
    title: "PV Single-Line Diagram Checklist",
    description: "Organize the electrical details commonly needed for a residential PV single-line diagram review and handoff.",
    audience: "solar coordinators gathering electrical notes before a licensed reviewer or drafter works on the file",
    checklist: ["Main service panel size", "Inverter and battery details", "Breaker and disconnect notes", "Utility interconnection context"],
    steps: ["Enter the electrical assumptions.", "Flag unknown values.", "Generate the checklist.", "Route it to the responsible professional."],
    packetQuality: [
      "Capture service-panel rating, bus rating, breaker location, inverter type, disconnect notes, and battery assumptions.",
      "Mark unknown electrical values as missing instead of inventing numbers.",
      "Add photos or labels in the project handoff so a professional can verify the field condition.",
    ],
    reviewBoundary: [
      "Single-line diagrams require qualified professional review before permitting or installation.",
      "SolarPermitPrepAI does not calculate load, wire sizing, breaker compliance, or utility acceptance.",
      "Use the output to reduce intake back-and-forth, then route it to the responsible reviewer.",
    ],
    missingItemTriggers: [
      "Unknown panel or busbar rating",
      "Battery backup or critical-loads panel included",
      "Line-side tap, service upgrade, or nonstandard interconnection",
      "Utility rules not yet confirmed",
    ],
    faq: [
      ["Can it verify code compliance?", "No. It helps organize inputs for review; qualified professionals must verify compliance."],
      ["Can I add battery notes?", "Yes. Include battery, backup, and inverter notes in the project description."],
    ],
  },
  {
    slug: "solar-ahj-permit-readiness",
    title: "Solar AHJ Permit Readiness",
    description: "Create a practical quote request for your local authority having jurisdiction without promising engineering approval.",
    audience: "installers and homeowners preparing questions for a local AHJ or permit helper",
    checklist: ["Jurisdiction name", "Known local constraints", "Required form notes", "Follow-up questions"],
    steps: ["Add city, state, and AHJ.", "List known constraints.", "Generate readiness notes.", "Confirm requirements with the AHJ or installer."],
    packetQuality: [
      "Name the AHJ, utility, city, state, and any known local forms before asking for review.",
      "Keep local rule notes separate from assumptions so they can be confirmed or corrected.",
      "List unresolved questions in the packet instead of hiding uncertainty.",
    ],
    reviewBoundary: [
      "AHJs decide acceptance. This tool only makes the preparation packet clearer.",
      "Local ordinances, fire setbacks, structural rules, and utility requirements may change and must be verified.",
      "Do not submit generated text as an official interpretation of AHJ rules.",
    ],
    missingItemTriggers: [
      "Unknown AHJ or utility",
      "No local form requirements collected",
      "Fire setback or roof access path questions",
      "Manual review needed because project conditions are unusual",
    ],
    faq: [
      ["Does this guarantee AHJ acceptance?", "No. It helps prepare a clearer request; the AHJ determines acceptance."],
      ["Can it handle unusual jurisdictions?", "Use the notes field to capture local rules, then verify them with the authority or installer."],
    ],
  },
  {
    slug: "solarapp-permit-intake",
    title: "SolarAPP Permit Intake",
    description: "Collect the design details installers often need before checking whether a residential PV project may fit a SolarAPP+ style workflow.",
    audience: "solar installers and permit coordinators checking if a simple residential project may fit a faster intake path",
    checklist: ["Residential project basics", "Equipment configuration", "Battery or backup exceptions", "Manual review triggers"],
    steps: ["Describe the project.", "Add equipment notes.", "Flag exceptions.", "Use the output as a conversation starter, not a determination."],
    packetQuality: [
      "Collect basic residential scope, equipment configuration, battery notes, and any exception triggers before screening.",
      "Record why the project may need manual review so the next person does not repeat the same intake questions.",
      "Confirm all SolarAPP+ and AHJ requirements with official sources before proceeding.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not determine SolarAPP+ eligibility.",
      "Official SolarAPP+, utility, and AHJ requirements must be checked by the installer or responsible professional.",
      "Use this as an intake organizer, not as approval, design, or code advice.",
    ],
    missingItemTriggers: [
      "Battery, backup, service upgrade, or structural exception",
      "Missing equipment model details",
      "AHJ not participating or requiring local forms",
      "Project scope unclear enough to need manual screening",
    ],
    faq: [
      ["Does it determine SolarAPP eligibility?", "No. It only collects inputs that may be relevant before a proper eligibility check."],
      ["Should I still verify manually?", "Yes. Confirm all SolarAPP+ and local requirements through official or professional channels."],
    ],
  },
];

function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function list(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function faq(items) {
  return items.map(([q, a]) => `<article class="seo-card"><h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}</p></article>`).join("");
}

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
      <div class="button-row">
        <a class="primary" href="/#precheck">Run precheck</a>
        <a class="secondary" href="${reviewUrl}">Request $49 review</a>
      </div>
      <section class="seo-grid" aria-label="SolarPermitPrepAI page details">
        <article class="panel seo-card">
          <h2>Who this helps</h2>
          <p>${escapeHtml(page.audience)}.</p>
        </article>
        <article class="panel seo-card">
          <h2>What to gather</h2>
          ${list(page.checklist)}
        </article>
      </section>
      <section class="panel seo-card">
        <h2>Suggested workflow</h2>
        ${list(page.steps)}
      </section>
      <section class="panel seo-card">
        <h2>Boundary</h2>
        <p>SolarPermitPrepAI is an intake and precheck workflow. It is not an engineering stamp, permit approval, electrical design service, or legal advice.</p>
      </section>
      <section class="seo-grid" aria-label="Solar permit preparation safeguards">
        <article class="panel seo-card">
          <h2>Packet quality checklist</h2>
          ${list(page.packetQuality)}
        </article>
        <article class="panel seo-card">
          <h2>Professional review boundary</h2>
          ${list(page.reviewBoundary)}
        </article>
        <article class="panel seo-card">
          <h2>Missing-item triggers</h2>
          ${list(page.missingItemTriggers)}
        </article>
        <article class="panel seo-card">
          <h2>Quote handoff review</h2>
          <p>Before paying for review, confirm the address, AHJ, utility, project scope, equipment models, attachment list, and open questions. The cleaner the packet, the easier it is for a qualified professional to price and route the next step.</p>
        </article>
      </section>
      <section class="seo-grid" aria-label="Frequently asked questions">
        ${faq(page.faq)}
      </section>
      <p><a href="https://tools.pagecheckai.com">More PageCheckAI tools</a></p>
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
