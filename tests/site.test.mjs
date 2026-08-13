import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders SolarPermitPrepAI precheck", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /SolarPermitPrepAI/);
  assert.match(html, /Run free precheck first/);
  assert.match(html, /Check paid fit/);
  assert.match(html, /Generate permit precheck/);
  assert.match(html, /id="utility"/);
  assert.match(html, /Utility provider/);
  assert.match(html, /Email de-identified fit summary/);
  assert.match(html, /Complete free precheck first/);
  assert.match(html, /Free packet precheck first/);
  assert.match(html, /\$49 only after quote-fit/);
  assert.match(html, /No portal login or upload by default/);
  assert.match(html, /No approval or PE-stamp guarantee/);
  assert.match(html, /Buy only when the packet is ready/);
  assert.match(html, /Good fit for the \$49 review/);
  assert.match(html, /Keep the official steps separate/);
  assert.match(html, /Skip payment when/);
  assert.equal((html.match(/href="#precheck"/g) || []).length >= 6, true);
  assert.doesNotMatch(html, /href="https:\/\/namebatch\.pagecheckai\.com\/api\/checkout/);
  assert.doesNotMatch(html, /href="https:\/\/www\.paypal\.com\/ncp\/payment/);
  assert.match(html, /id="downloadPack"[^>]*disabled/);
  assert.match(html, /id="copyAll"[^>]*disabled/);
  assert.match(html, /id="emailQuote"[^>]*disabled/);
  assert.match(html, /After payment, enter the <strong>SP-<\/strong> activation code above/);
  assert.match(html, /href="\/support\.html">open support<\/a>/);
  assert.match(html, /not an engineering stamp/);
  assert.match(html, /Permit prep guides/);
  assert.match(html, /Panel photos/);
  assert.match(html, /Installer handoff/);
  assert.match(html, /Application/);
  assert.match(html, /Corrections/);
  assert.match(html, /Structural intake/);
  assert.match(html, /Version control/);
  assert.match(html, /Rejection checklist/);
  assert.match(html, /EV charger notes/);
  assert.match(html, /HOA packet/);
  assert.match(html, /Inspection ready/);
  assert.match(html, /Battery spec sheets/);
  assert.match(html, /Utility documents/);
  assert.match(html, /Homeowner quote/);
  assert.match(html, /Permit renewal/);
  assert.match(html, /Pool equipment/);
  assert.match(html, /Generator interlock/);
  assert.match(html, /Roof obstructions/);
  assert.match(html, /Breaker space/);
  assert.match(html, /Inspection correction/);
  assert.match(html, /PTO handoff/);
});

test("ships browser-local permit generator", async () => {
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
  assert.match(script, /function generate/);
  assert.match(script, /Utility provider is missing; interconnection and meter requirements cannot be scoped/);
  assert.match(script, /Utility provider: \$\{v\.utility \|\| "not provided"\}/);
  assert.match(script, /SolarPermitPrepAI packet/);
  assert.match(script, /function paidPacketText/);
  assert.match(script, /Document and review tracker/);
  assert.match(script, /solarpermitprepai-permit-packet-handoff\.txt/);
  assert.match(script, /https:\/\/namebatch\.pagecheckai\.com\/api\/licenses\/verify/);
  assert.match(script, /JSON\.stringify\(\{ code, product: "solarpermitprepai" \}\)/);
  assert.doesNotMatch(script, /JSON\.stringify\(\{[^}]*projectAddress/i);
  assert.match(script, /not a permit approval/);
  assert.match(script, /precheckGenerated/);
  assert.match(script, /precheckQualified/);
  assert.match(script, /permitForm\.addEventListener\("input", invalidatePrecheck\)/);
  assert.match(script, /paidPackActive && precheckQualified/);
  assert.match(script, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 1000\)/);
  assert.match(script, /Paid handoff download started\. Wait for your browser to confirm the file\./);
  assert.match(script, /Your current precheck and activation are still available; try again\./);
  assert.doesNotMatch(script, /link\.remove\(\);\s*URL\.revokeObjectURL\(url\);/);
  assert.match(script, /clearGenerated\(\);\s+setPurchaseState\(false\);/);
});

test("requires current real project inputs before external handoff", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");

  assert.doesNotMatch(
    html,
    /value="installer@example\.com"|value="123 Solar Way|value="7\.6"|value="19"|value="REC 400W|value="Enphase IQ8|value="200A main panel"/,
  );
  for (const id of [
    "contactEmail",
    "projectAddress",
    "state",
    "ahj",
    "utility",
    "systemSize",
    "moduleCount",
    "moduleModel",
    "inverterModel",
    "servicePanel",
    "projectNotes",
  ]) {
    assert.match(html, new RegExp(`id="${id}"[^>]*required`));
  }
  assert.match(script, /function packetText\(\) \{\s+generate\(\);/);
  assert.match(script, /permitForm\.reportValidity\(\)/);
  assert.match(script, /at least 2 available core documents/);
  assert.match(script, /at least 80 characters of verified constraints and open questions/);
  assert.match(script, /Generate a current ready precheck before downloading the paid handoff/);
  assert.doesNotMatch(script, /\ngenerate\(\);\s*$/);
});

test("emails only a de-identified paid-fit summary", async () => {
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
  const start = script.indexOf("function approvedInquiryText()");
  const end = script.indexOf("function emailQuote()", start);
  const inquiryFunction = script.slice(start, end);

  assert.notEqual(start, -1);
  assert.notEqual(end, -1);
  assert.match(inquiryFunction, /Approximate system size/);
  assert.match(inquiryFunction, /Available document types/);
  assert.match(inquiryFunction, /full packet are intentionally not included/);
  assert.doesNotMatch(
    inquiryFunction,
    /v\.(?:projectAddress|utility|moduleModel|inverterModel|servicePanel|projectNotes)|packetText\(/,
  );
  assert.match(script, /const subject = "SolarPermitPrepAI paid fit inquiry"/);
  assert.match(script, /encodeURIComponent\(approvedInquiryText\(\)\)/);
});

test("includes policy support and SEO discovery files", async () => {
  const robots = await readFile(new URL("../dist/robots.txt", import.meta.url), "utf8");
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  const terms = await readFile(new URL("../dist/terms.html", import.meta.url), "utf8");
  const support = await readFile(new URL("../dist/support.html", import.meta.url), "utf8");
  const indexNowKey = await readFile(new URL("../dist/cf398b202197d60941bf17f97fffe12b.txt", import.meta.url), "utf8");
  const indexNowScript = await readFile(new URL("../scripts/submit-indexnow.mjs", import.meta.url), "utf8");
  assert.match(robots, /Sitemap: https:\/\/solar\.pagecheckai\.com\/sitemap\.xml/);
  assert.match(sitemap, /residential-solar-permit-precheck/);
  assert.match(sitemap, /solarapp-permit-intake/);
  assert.match(sitemap, /solar-roof-layout-permit-checklist/);
  assert.match(sitemap, /solar-utility-bill-meter-checklist/);
  assert.match(sitemap, /main-service-panel-photo-checklist/);
  assert.match(sitemap, /solar-battery-backup-permit-intake/);
  assert.match(sitemap, /solar-service-upgrade-permit-notes/);
  assert.match(sitemap, /solar-permit-revision-checklist/);
  assert.match(sitemap, /solar-equipment-cut-sheet-checklist/);
  assert.match(sitemap, /solar-site-survey-packet/);
  assert.match(sitemap, /solar-fire-setback-checklist/);
  assert.match(sitemap, /solar-installer-handoff-checklist/);
  assert.match(sitemap, /solar-permit-application-checklist/);
  assert.match(sitemap, /solar-permit-correction-response-letter/);
  assert.match(sitemap, /solar-structural-review-intake-checklist/);
  assert.match(sitemap, /solar-racking-mounting-cut-sheet-checklist/);
  assert.match(sitemap, /solar-rapid-shutdown-documentation-checklist/);
  assert.match(sitemap, /solar-placard-label-schedule-checklist/);
  assert.match(sitemap, /solar-interconnection-application-handoff/);
  assert.match(sitemap, /solar-load-calculation-intake-checklist/);
  assert.match(sitemap, /solar-plan-set-version-control-checklist/);
  for (const route of [
    "solar-permit-rejection-checklist",
    "solar-ev-charger-ready-panel-notes",
    "solar-meter-main-combo-photo-checklist",
    "solar-detached-garage-pv-permit-notes",
    "solar-hoa-approval-packet-checklist",
    "solar-fire-department-review-handoff",
    "solar-as-built-plan-set-intake-checklist",
    "solar-inspection-ready-packet-checklist",
    "solar-permit-portal-upload-checklist",
    "solar-equipment-substitution-permit-notes",
    "solar-battery-spec-sheet-handoff",
    "solar-inverter-cut-sheet-checklist",
    "solar-pv-module-data-sheet-checklist",
    "solar-ground-mount-permit-intake",
    "solar-carport-pv-permit-notes",
    "solar-roof-replacement-pv-coordination",
    "solar-utility-interconnection-document-checklist",
    "solar-homeowner-permit-quote-checklist",
    "solar-permit-expiration-renewal-notes",
    "solar-field-change-handoff-checklist",
    "solar-pool-equipment-clearance-notes",
    "solar-generator-interlock-permit-notes",
    "solar-skylight-vent-obstruction-checklist",
    "solar-attic-access-photo-checklist",
    "solar-tile-roof-hook-cut-sheet-checklist",
    "solar-flat-roof-ballast-permit-intake",
    "solar-breaker-space-photo-checklist",
    "solar-monitoring-gateway-permit-notes",
    "solar-inspection-correction-note-checklist",
    "solar-permission-to-operate-handoff",
    "solar-property-address-parcel-intake-checklist",
    "solar-roof-material-condition-photo-notes",
    "solar-equipment-nameplate-photo-checklist",
    "solar-site-plan-dimension-source-checklist",
    "solar-conduit-trench-route-photo-log",
    "solar-permit-fee-payment-handoff-checklist",
    "solar-revision-cover-sheet-checklist",
    "solar-contractor-license-document-handoff",
    "solar-plan-review-comment-tracker",
    "solar-final-document-owner-handoff",
    "solar-ahj-contact-record-checklist",
    "solar-approved-plan-storage-handoff",
    "solar-inspection-appointment-handoff",
    "solar-neighbor-notice-document-checklist",
    "solar-utility-bill-name-match-checklist",
    "solar-permit-email-thread-index",
    "solar-manufacturer-warranty-document-handoff",
    "solar-change-order-permit-impact-notes",
    "solar-roof-access-pathway-photo-log",
    "solar-closeout-support-contact-sheet",
  ]) {
    assert.match(sitemap, new RegExp(route));
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, 79);
  assert.match(terms, /not an engineering service/i);
  assert.match(terms, /does not log into permit portals/i);
  assert.match(support, /SolarPermitPrepAI support/);
  assert.match(support, /utm_content=support_paid_fit#precheck/);
  assert.match(support, /Generate a ready precheck before payment/);
  assert.match(support, /Missing activation code or rejected code/);
  assert.match(support, /Send only the PayPal receipt ID, checkout email/);
  assert.match(support, /Do not include a project address, owner or customer name, utility bill, permit packet/i);
  assert.match(support, /de-identified scope summary/);
  assert.match(support, /Wait for support to confirm whether a private transfer method is appropriate/);
  assert.doesNotMatch(support, /include the generated packet, project state, AHJ, system size, equipment/i);
  assert.doesNotMatch(support, /namebatch\.pagecheckai\.com\/api\/checkout/);
  assert.doesNotMatch(support, /paypal\.com\/ncp\/payment/);
  assert.equal(indexNowKey.trim(), "cf398b202197d60941bf17f97fffe12b");
  assert.match(indexNowScript, /api\.indexnow\.org\/indexnow/);
});

test("builds rejection, HOA, portal, and inspection pages with boundaries", async () => {
  const rejectionPage = await readFile(new URL("../dist/solar-permit-rejection-checklist/index.html", import.meta.url), "utf8");
  const hoaPage = await readFile(new URL("../dist/solar-hoa-approval-packet-checklist/index.html", import.meta.url), "utf8");
  const portalPage = await readFile(new URL("../dist/solar-permit-portal-upload-checklist/index.html", import.meta.url), "utf8");
  const inspectionPage = await readFile(new URL("../dist/solar-inspection-ready-packet-checklist/index.html", import.meta.url), "utf8");
  assert.match(rejectionPage, /does not decide the technical answer to a permit rejection/i);
  assert.match(rejectionPage, /qualified review/i);
  assert.match(hoaPage, /does not provide HOA legal advice/i);
  assert.match(hoaPage, /HOA, AHJ, utility, and inspection milestones/i);
  assert.match(portalPage, /does not log into permit portals, pay fees, sign forms, or submit applications/i);
  assert.match(portalPage, /Keep portal credentials out of generated notes/i);
  assert.match(inspectionPage, /does not determine inspection readiness or guarantee inspection approval/i);
  assert.match(inspectionPage, /Check paid fit after the precheck/);
});

test("builds thick permit SEO pages with professional boundaries", async () => {
  const precheckPage = await readFile(new URL("../dist/residential-solar-permit-precheck/index.html", import.meta.url), "utf8");
  const solarAppPage = await readFile(new URL("../dist/solarapp-permit-intake/index.html", import.meta.url), "utf8");
  assert.match(precheckPage, /Packet quality checklist/);
  assert.match(precheckPage, /Professional review boundary/);
  assert.match(precheckPage, /Missing-item triggers/);
  assert.match(precheckPage, /Quote handoff review/);
  assert.match(precheckPage, /When the \$49 packet prep is worth it/);
  assert.match(precheckPage, /Pay only after the free precheck has an address, AHJ/);
  assert.match(precheckPage, /Skip payment if you need an engineering design, PE stamp/);
  assert.match(precheckPage, /utm_content=seo_residential-solar-permit-precheck#precheck/);
  assert.match(precheckPage, /Check paid fit after the precheck/);
  assert.doesNotMatch(precheckPage, /namebatch\.pagecheckai\.com\/api\/checkout/);
  assert.doesNotMatch(precheckPage, /paypal\.com\/ncp\/payment/);
  assert.match(precheckPage, /licensed contractor, electrician, engineer, or permit professional/);
  assert.match(solarAppPage, /does not determine SolarAPP\+ eligibility/);
  assert.match(solarAppPage, /Project scope unclear enough to need manual screening/);
});

test("routes all 75 SEO pages through the attributed free precheck", async () => {
  const sitemap = await readFile(new URL("../dist/sitemap.xml", import.meta.url), "utf8");
  const slugs = [...sitemap.matchAll(/<loc>https:\/\/solar\.pagecheckai\.com\/([^<]+)<\/loc>/g)]
    .map((match) => match[1])
    .filter((slug) => !slug.endsWith(".html") && !["privacy", "support", "terms"].includes(slug));

  assert.equal(slugs.length, 75);
  for (const slug of slugs) {
    const html = await readFile(new URL(`../dist/${slug}/index.html`, import.meta.url), "utf8");
    assert.match(html, /Check paid fit after the precheck/);
    assert.match(html, new RegExp(`utm_content=seo_${slug}#precheck`));
    assert.doesNotMatch(html, /namebatch\.pagecheckai\.com\/api\/checkout/);
    assert.doesNotMatch(html, /paypal\.com\/ncp\/payment/);
  }
});

test("builds new solar intake SEO pages with boundaries", async () => {
  const panelPage = await readFile(new URL("../dist/main-service-panel-photo-checklist/index.html", import.meta.url), "utf8");
  const firePage = await readFile(new URL("../dist/solar-fire-setback-checklist/index.html", import.meta.url), "utf8");
  const handoffPage = await readFile(new URL("../dist/solar-installer-handoff-checklist/index.html", import.meta.url), "utf8");
  assert.match(panelPage, /Electrical service ratings, breaker sizing, busbar limits/i);
  assert.match(panelPage, /does not calculate electrical compliance/i);
  assert.match(firePage, /Fire setback and access pathway requirements are local/i);
  assert.match(firePage, /does not interpret fire code/i);
  assert.match(handoffPage, /not a final design, permit packet, or construction authorization/i);
});

test("builds application, structural, electrical, and revision handoff pages safely", async () => {
  const applicationPage = await readFile(new URL("../dist/solar-permit-application-checklist/index.html", import.meta.url), "utf8");
  const structuralPage = await readFile(new URL("../dist/solar-structural-review-intake-checklist/index.html", import.meta.url), "utf8");
  const loadPage = await readFile(new URL("../dist/solar-load-calculation-intake-checklist/index.html", import.meta.url), "utf8");
  const correctionPage = await readFile(new URL("../dist/solar-permit-correction-response-letter/index.html", import.meta.url), "utf8");
  assert.match(applicationPage, /does not complete official forms, pay fees, sign applications, or guarantee acceptance/i);
  assert.match(structuralPage, /does not calculate loads, verify spans, design attachments, or provide structural approval/i);
  assert.match(loadPage, /does not perform load calculations, service sizing, breaker sizing, conductor sizing, or compliance review/i);
  assert.match(correctionPage, /does not interpret code or decide the technical response/i);
  assert.match(correctionPage, /Check paid fit after the precheck/);
});

test("builds equipment, site, utility, and lifecycle pages with boundaries", async () => {
  const batteryPage = await readFile(new URL("../dist/solar-battery-spec-sheet-handoff/index.html", import.meta.url), "utf8");
  const inverterPage = await readFile(new URL("../dist/solar-inverter-cut-sheet-checklist/index.html", import.meta.url), "utf8");
  const groundMountPage = await readFile(new URL("../dist/solar-ground-mount-permit-intake/index.html", import.meta.url), "utf8");
  const roofPage = await readFile(new URL("../dist/solar-roof-replacement-pv-coordination/index.html", import.meta.url), "utf8");
  const utilityPage = await readFile(new URL("../dist/solar-utility-interconnection-document-checklist/index.html", import.meta.url), "utf8");
  const quotePage = await readFile(new URL("../dist/solar-homeowner-permit-quote-checklist/index.html", import.meta.url), "utf8");
  const renewalPage = await readFile(new URL("../dist/solar-permit-expiration-renewal-notes/index.html", import.meta.url), "utf8");
  const fieldChangePage = await readFile(new URL("../dist/solar-field-change-handoff-checklist/index.html", import.meta.url), "utf8");
  assert.match(batteryPage, /does not approve battery design or code compliance/i);
  assert.match(inverterPage, /does not select, size, approve, or verify inverter compatibility/i);
  assert.match(groundMountPage, /does not design foundations, verify soil, interpret zoning/i);
  assert.match(roofPage, /does not design roof work, approve removal methods/i);
  assert.match(utilityPage, /does not submit utility applications, interpret tariffs/i);
  assert.match(quotePage, /does not provide a binding quote, engineering design/i);
  assert.match(renewalPage, /does not interpret AHJ renewal rules, extend permits/i);
  assert.match(fieldChangePage, /does not validate as-built accuracy, approve construction changes/i);
  for (const page of [batteryPage, inverterPage, groundMountPage, roofPage, utilityPage, quotePage, renewalPage, fieldChangePage]) {
    assert.match(page, /Check paid fit after the precheck/);
    assert.match(page, /Professional review boundary/);
  }
});

test("builds new site-constraint, inspection, and PTO pages with boundaries", async () => {
  const poolPage = await readFile(new URL("../dist/solar-pool-equipment-clearance-notes/index.html", import.meta.url), "utf8");
  const generatorPage = await readFile(
    new URL("../dist/solar-generator-interlock-permit-notes/index.html", import.meta.url),
    "utf8",
  );
  const obstructionPage = await readFile(
    new URL("../dist/solar-skylight-vent-obstruction-checklist/index.html", import.meta.url),
    "utf8",
  );
  const breakerPage = await readFile(new URL("../dist/solar-breaker-space-photo-checklist/index.html", import.meta.url), "utf8");
  const correctionPage = await readFile(
    new URL("../dist/solar-inspection-correction-note-checklist/index.html", import.meta.url),
    "utf8",
  );
  const ptoPage = await readFile(new URL("../dist/solar-permission-to-operate-handoff/index.html", import.meta.url), "utf8");
  assert.match(poolPage, /does not determine equipment clearance, code compliance, or inspection acceptance/i);
  assert.match(generatorPage, /does not approve generator interlocks/i);
  assert.match(obstructionPage, /does not determine final array layout/i);
  assert.match(breakerPage, /does not determine breaker capacity/i);
  assert.match(correctionPage, /does not interpret code, approve fixes, or guarantee reinspection approval/i);
  assert.match(ptoPage, /does not submit utility documents, grant permission to operate/i);
});

test("builds property, payment, revision, review, and closeout pages safely", async () => {
  const parcelPage = await readFile(new URL("../dist/solar-property-address-parcel-intake-checklist/index.html", import.meta.url), "utf8");
  const roofPage = await readFile(new URL("../dist/solar-roof-material-condition-photo-notes/index.html", import.meta.url), "utf8");
  const feePage = await readFile(new URL("../dist/solar-permit-fee-payment-handoff-checklist/index.html", import.meta.url), "utf8");
  const licensePage = await readFile(new URL("../dist/solar-contractor-license-document-handoff/index.html", import.meta.url), "utf8");
  const commentPage = await readFile(new URL("../dist/solar-plan-review-comment-tracker/index.html", import.meta.url), "utf8");
  const finalPage = await readFile(new URL("../dist/solar-final-document-owner-handoff/index.html", import.meta.url), "utf8");
  assert.match(parcelPage, /does not verify ownership, parcel boundaries, zoning, jurisdiction/i);
  assert.match(roofPage, /does not assess roof condition, remaining life, structural capacity/i);
  assert.match(feePage, /does not calculate fees, access portals, make payments, issue refunds/i);
  assert.match(licensePage, /does not verify licensure, insurance coverage, identity, standing/i);
  assert.match(commentPage, /does not interpret code, answer technical comments/i);
  assert.match(finalPage, /does not confirm project completion, approval, warranty coverage/i);
});

test("builds administrative handoff, warranty, and closeout pages safely", async () => {
  const ahjPage = await readFile(new URL("../dist/solar-ahj-contact-record-checklist/index.html", import.meta.url), "utf8");
  const inspectionPage = await readFile(
    new URL("../dist/solar-inspection-appointment-handoff/index.html", import.meta.url),
    "utf8",
  );
  const utilityPage = await readFile(
    new URL("../dist/solar-utility-bill-name-match-checklist/index.html", import.meta.url),
    "utf8",
  );
  const warrantyPage = await readFile(
    new URL("../dist/solar-manufacturer-warranty-document-handoff/index.html", import.meta.url),
    "utf8",
  );
  const changePage = await readFile(
    new URL("../dist/solar-change-order-permit-impact-notes/index.html", import.meta.url),
    "utf8",
  );
  const closeoutPage = await readFile(
    new URL("../dist/solar-closeout-support-contact-sheet/index.html", import.meta.url),
    "utf8",
  );
  assert.match(ahjPage, /does not interpret AHJ policy, provide code advice, submit requests/i);
  assert.match(inspectionPage, /does not schedule inspections, access portals, determine readiness/i);
  assert.match(utilityPage, /does not access utility accounts, change account names, verify identity/i);
  assert.match(warrantyPage, /does not verify warranty coverage, register products, file claims/i);
  assert.match(changePage, /does not determine permit impact, approve change orders, revise designs/i);
  assert.match(closeoutPage, /does not provide warranty, performance, utility, emergency, legal, or repair advice/i);
});
