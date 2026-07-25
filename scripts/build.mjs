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
  {
    slug: "solar-roof-layout-permit-checklist",
    title: "Solar Roof Layout Permit Checklist",
    description: "Organize roof layout notes, array locations, setbacks, obstructions, and photo requirements before a residential PV permit review.",
    audience: "installers, sales teams, and permit coordinators preparing roof layout details for a drafter",
    checklist: ["Roof planes and orientation", "Array placement notes", "Fire setback questions", "Obstructions and access paths"],
    steps: ["Collect roof photos and sketch notes.", "Mark confirmed and unknown setbacks.", "Generate the roof layout checklist.", "Route it to the drafter or installer for verification."],
    packetQuality: [
      "Separate each roof plane, azimuth assumption, and array area so the reviewer can see the intended layout.",
      "Flag vents, skylights, chimneys, hips, valleys, and access pathways instead of hiding them in general notes.",
      "Attach clear roof photos and any site survey material through your own project channel.",
    ],
    reviewBoundary: [
      "Roof layout, setbacks, structural suitability, and fire access requirements need local professional review.",
      "SolarPermitPrepAI does not create construction drawings or verify roof capacity.",
      "Confirm local AHJ and fire requirements before submitting a permit packet.",
    ],
    missingItemTriggers: [
      "No clear roof photos or layout sketch",
      "Unknown fire setback requirements",
      "Unclear roof type, pitch, or obstruction locations",
      "Structural or racking questions that need manual review",
    ],
    faq: [
      ["Can this draw the roof layout?", "No. It organizes roof layout notes for a drafter or qualified reviewer."],
      ["Should fire setbacks be verified?", "Yes. Fire access and setback rules must be checked against local AHJ requirements."],
    ],
  },
  {
    slug: "solar-utility-bill-meter-checklist",
    title: "Solar Utility Bill and Meter Checklist",
    description: "Prepare utility bill, meter, account, rate, and interconnection notes commonly requested before residential solar permit and plan-set work.",
    audience: "homeowners, installers, and coordinators gathering utility details for residential PV intake",
    checklist: ["Utility provider", "Meter number or service account reference", "Rate or interconnection notes", "Bill or usage attachment status"],
    steps: ["Collect the latest utility bill.", "Record safe meter and utility context.", "Flag missing account or rate details.", "Send the checklist to the project coordinator."],
    packetQuality: [
      "Use safe labels for account information and avoid exposing unnecessary personal data in shared notes.",
      "Keep utility bill, meter photo, and interconnection questions clearly labeled.",
      "Record whether the utility bill is attached, requested, or unavailable.",
    ],
    reviewBoundary: [
      "Utility interconnection, rate rules, net metering, and application requirements must be verified through official channels.",
      "SolarPermitPrepAI does not interpret utility tariffs or guarantee interconnection acceptance.",
      "Use the output to reduce missing intake items before professional review.",
    ],
    missingItemTriggers: [
      "No utility bill or meter photo",
      "Unknown utility provider",
      "Battery or backup project requiring extra utility review",
      "Unclear interconnection or rate-program requirements",
    ],
    faq: [
      ["Should I include the full utility account number?", "Use your project team's secure process and avoid exposing unnecessary sensitive account details in shared text."],
      ["Does this decide interconnection rules?", "No. Utility and interconnection requirements must be verified with the utility or responsible professional."],
    ],
  },
  {
    slug: "main-service-panel-photo-checklist",
    title: "Main Service Panel Photo Checklist",
    description: "Prepare main service panel photos, ratings, breaker notes, labels, and missing electrical details before solar plan-set review.",
    audience: "field teams and permit coordinators collecting electrical intake details for a residential PV packet",
    checklist: ["Main panel photo", "Label and rating visibility", "Breaker location notes", "Known service upgrade or interconnection assumptions"],
    steps: ["Capture panel and label photos.", "Record known ratings without guessing.", "Flag unclear electrical values.", "Route the packet to a qualified reviewer."],
    packetQuality: [
      "Capture the full panel, close-up label, breaker area, and surrounding working space when possible.",
      "Mark unknown ratings as missing rather than filling in assumed values.",
      "Keep service-panel notes connected to the project address and equipment scope.",
    ],
    reviewBoundary: [
      "Electrical service ratings, breaker sizing, busbar limits, and interconnection method require qualified review.",
      "SolarPermitPrepAI does not calculate electrical compliance or approve service equipment.",
      "Use the checklist as intake preparation for the responsible electrician, engineer, or designer.",
    ],
    missingItemTriggers: [
      "No clear panel label photo",
      "Unknown busbar or main breaker rating",
      "Line-side tap, service upgrade, or backup panel",
      "Old, damaged, unlabeled, or crowded panel conditions",
    ],
    faq: [
      ["Can it tell me if the panel is compliant?", "No. It flags missing information for qualified review."],
      ["What photos are useful?", "A full panel photo, label close-up, breaker area, and meter/service context are commonly useful."],
    ],
  },
  {
    slug: "solar-battery-backup-permit-intake",
    title: "Solar Battery Backup Permit Intake",
    description: "Organize battery, backup, critical-loads, inverter, disconnect, and exception notes before a residential solar permit review.",
    audience: "installers and coordinators preparing PV plus battery projects that may need extra manual review",
    checklist: ["Battery model and quantity", "Backup or critical-loads scope", "Inverter configuration", "Disconnect and location notes"],
    steps: ["Describe the battery scope.", "Separate backup from non-backup assumptions.", "Flag missing equipment details.", "Route for professional review before permit work."],
    packetQuality: [
      "Record battery model, quantity, location, backup type, and critical-loads panel assumptions.",
      "Keep battery exceptions visible so the project is not treated like a simple PV-only job.",
      "Attach manufacturer cut sheets and photos through your secure project channel.",
    ],
    reviewBoundary: [
      "Battery backup, critical loads, rapid shutdown, disconnects, and equipment placement require qualified review.",
      "SolarPermitPrepAI does not approve battery design or code compliance.",
      "Confirm AHJ, utility, manufacturer, and professional requirements before submission.",
    ],
    missingItemTriggers: [
      "Unknown battery model or quantity",
      "Critical-loads panel included",
      "Backup mode, disconnect, or placement unclear",
      "AHJ battery requirements not confirmed",
    ],
    faq: [
      ["Can this handle PV plus battery?", "It can organize intake notes, but battery projects usually need careful manual review."],
      ["Does it approve backup design?", "No. A responsible professional must verify battery and backup design requirements."],
    ],
  },
  {
    slug: "solar-service-upgrade-permit-notes",
    title: "Solar Service Upgrade Permit Notes",
    description: "Prepare service upgrade notes, panel photos, utility context, project scope, and missing information before solar permit review.",
    audience: "solar teams and homeowners working on projects that may include a main panel or service upgrade",
    checklist: ["Existing panel details", "Proposed service upgrade notes", "Utility coordination status", "Photos and equipment assumptions"],
    steps: ["Record existing service facts.", "Describe the proposed upgrade.", "Flag unknown utility requirements.", "Send notes to the qualified reviewer."],
    packetQuality: [
      "Separate existing conditions from proposed upgrade assumptions.",
      "Include panel, meter, service entrance, and workspace photos when available.",
      "Record whether utility coordination has started or is still unknown.",
    ],
    reviewBoundary: [
      "Service upgrades require licensed professional, utility, and AHJ review.",
      "SolarPermitPrepAI does not design service upgrades, calculate loads, or approve equipment.",
      "Use the output to clarify what is known before formal design or permit submission.",
    ],
    missingItemTriggers: [
      "Existing service rating unknown",
      "Utility upgrade requirements not confirmed",
      "Meter/main arrangement unclear",
      "Load calculation or service design needed",
    ],
    faq: [
      ["Can this determine whether a service upgrade is needed?", "No. It only organizes notes for review by qualified people."],
      ["Should utility coordination be tracked?", "Yes. Service upgrades often depend on utility process and timing."],
    ],
  },
  {
    slug: "solar-permit-revision-checklist",
    title: "Solar Permit Revision Checklist",
    description: "Prepare a solar permit revision checklist with AHJ comments, missing documents, plan-set changes, and response notes.",
    audience: "permit coordinators responding to AHJ comments or plan review corrections",
    checklist: ["AHJ correction comments", "Plan sheet references", "Changed equipment or layout", "Response owner and due date"],
    steps: ["Paste correction comments.", "Group comments by sheet or topic.", "Mark missing evidence.", "Send a clean revision request to the drafter or reviewer."],
    packetQuality: [
      "Keep AHJ comments verbatim and separate from internal assumptions.",
      "Group corrections by sheet, electrical, structural, fire, utility, or form requirement.",
      "Record which comments require field confirmation or professional judgment.",
    ],
    reviewBoundary: [
      "Only the responsible professional or permit team can decide the correct revision response.",
      "SolarPermitPrepAI does not interpret AHJ comments as official code advice.",
      "Use the checklist to prevent missed items during revision handoff.",
    ],
    missingItemTriggers: [
      "AHJ comments not copied clearly",
      "Sheet numbers or affected documents unknown",
      "Equipment changes after original submission",
      "Structural, electrical, or fire comments needing professional response",
    ],
    faq: [
      ["Can it answer AHJ comments?", "No. It organizes comments and handoff notes so the right person can respond."],
      ["Should I rewrite AHJ comments?", "Keep them verbatim, then add internal notes separately."],
    ],
  },
  {
    slug: "solar-equipment-cut-sheet-checklist",
    title: "Solar Equipment Cut Sheet Checklist",
    description: "Organize module, inverter, racking, battery, rapid shutdown, and label cut sheets before a solar plan-set request.",
    audience: "solar coordinators preparing equipment attachments for drafters, permit teams, or plan review",
    checklist: ["Module cut sheet", "Inverter and optimizer cut sheets", "Racking data", "Battery or rapid shutdown documents"],
    steps: ["List selected equipment.", "Check which cut sheets are attached.", "Flag missing or outdated documents.", "Send labeled files with the intake packet."],
    packetQuality: [
      "Use exact model numbers and version labels where available.",
      "Keep cut sheets in a clearly named folder rather than mixing them with photos.",
      "Flag substitutions or equivalent equipment so a reviewer can confirm acceptability.",
    ],
    reviewBoundary: [
      "Equipment suitability, listings, compatibility, and AHJ acceptance require professional review.",
      "SolarPermitPrepAI does not approve equipment substitutions or verify listings.",
      "Confirm model numbers and cut sheet versions before final plan-set work.",
    ],
    missingItemTriggers: [
      "Equivalent equipment listed without exact model",
      "Missing racking or rapid shutdown documentation",
      "Battery or optimizer cut sheets not attached",
      "Cut sheets do not match the proposed equipment",
    ],
    faq: [
      ["Can I use equivalent equipment?", "Record it as an assumption and ask the responsible reviewer to confirm."],
      ["Should files be renamed?", "Yes. Clear filenames for module, inverter, racking, battery, and labels reduce confusion."],
    ],
  },
  {
    slug: "solar-site-survey-packet",
    title: "Solar Site Survey Packet",
    description: "Prepare a solar site survey packet with roof, attic, panel, meter, utility, shading, and access notes before plan-set work.",
    audience: "site surveyors, installers, and operations teams collecting field details for residential solar projects",
    checklist: ["Roof and attic photos", "Panel and meter photos", "Obstruction and shading notes", "Access and equipment location notes"],
    steps: ["Collect field photos.", "Label survey notes by area.", "Flag missing values.", "Send the packet for professional review."],
    packetQuality: [
      "Label photos by roof, attic, panel, meter, conduit path, and equipment location.",
      "Record uncertain field conditions instead of hiding them.",
      "Keep survey notes tied to the project address and date.",
    ],
    reviewBoundary: [
      "Site survey data must be verified by the responsible installer, designer, or professional.",
      "SolarPermitPrepAI does not inspect sites or validate field measurements.",
      "Use it to organize what was collected before plan-set drafting.",
    ],
    missingItemTriggers: [
      "No panel, meter, or roof photos",
      "Attic, rafter, or structural details unknown",
      "Shading or obstruction notes missing",
      "Equipment location not documented",
    ],
    faq: [
      ["Can it replace a site survey?", "No. It organizes site survey information after it is collected."],
      ["Should every photo be labeled?", "Yes. Clear labels help drafters and reviewers avoid guessing."],
    ],
  },
  {
    slug: "solar-fire-setback-checklist",
    title: "Solar Fire Setback Checklist",
    description: "Prepare fire setback and access pathway questions for a residential solar permit packet before AHJ or professional review.",
    audience: "permit coordinators and designers checking whether roof layout notes are ready for local fire access review",
    checklist: ["Roof access pathways", "Ridge and edge setback questions", "Obstruction locations", "Local AHJ or fire notes"],
    steps: ["Identify the AHJ.", "Record known roof layout constraints.", "Flag uncertain setback rules.", "Verify with the local authority or responsible professional."],
    packetQuality: [
      "Keep setback assumptions separate from confirmed local requirements.",
      "Attach roof diagrams or photos showing ridges, hips, valleys, and obstructions.",
      "Record any local fire notes that still require confirmation.",
    ],
    reviewBoundary: [
      "Fire setback and access pathway requirements are local and must be verified.",
      "SolarPermitPrepAI does not interpret fire code or approve roof layout.",
      "Use the checklist to capture questions for the AHJ, installer, or designer.",
    ],
    missingItemTriggers: [
      "AHJ or fire jurisdiction unknown",
      "Roof layout missing access-path notes",
      "Complex roof planes or obstructions",
      "Battery, rapid shutdown, or equipment location questions",
    ],
    faq: [
      ["Can it tell me the exact setback?", "No. Setbacks must be verified with local rules and the responsible professional."],
      ["Should I mark uncertain setbacks?", "Yes. Uncertain setback assumptions should be clearly flagged before review."],
    ],
  },
  {
    slug: "solar-installer-handoff-checklist",
    title: "Solar Installer Handoff Checklist",
    description: "Create a solar installer handoff checklist for quote prep, plan-set request, missing items, and professional review routing.",
    audience: "sales teams, permit coordinators, and operations staff handing a project to an installer, drafter, or permit reviewer",
    checklist: ["Project scope", "Attachment list", "Known missing items", "Review owner and next action"],
    steps: ["Summarize the project.", "Group attachments.", "List missing items.", "Send the handoff with clear boundaries and next owner."],
    packetQuality: [
      "Put address, AHJ, utility, system size, equipment, roof, electrical, and attachment status in one summary.",
      "Separate required missing items from optional nice-to-have notes.",
      "Name the next owner for design, permit, utility, or field verification.",
    ],
    reviewBoundary: [
      "The handoff is not a final design, permit packet, or construction authorization.",
      "Installers, drafters, electricians, engineers, and AHJs still need to perform their own review.",
      "Use it to reduce intake back-and-forth and clarify next steps.",
    ],
    missingItemTriggers: [
      "No clear next owner",
      "Attachments mixed together or unnamed",
      "Assumptions not separated from confirmed facts",
      "Open AHJ, utility, or electrical questions",
    ],
    faq: [
      ["Who should receive the handoff?", "The installer, drafter, permit coordinator, or professional responsible for the next step."],
      ["Can this be used as a permit packet?", "No. It is an intake handoff, not a permit submission."],
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
