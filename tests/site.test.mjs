import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("renders SolarPermitPrepAI precheck", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
  assert.match(html, /SolarPermitPrepAI/);
  assert.match(html, /Generate permit precheck/);
  assert.match(html, /Email quote request/);
  assert.match(html, /https:\/\/www\.paypal\.com\/ncp\/payment\/SSX7PVFVEGTHL/);
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
});

test("ships browser-local permit generator", async () => {
  const script = await readFile(new URL("../dist/app.js", import.meta.url), "utf8");
  assert.match(script, /function generate/);
  assert.match(script, /SolarPermitPrepAI packet/);
  assert.match(script, /SSX7PVFVEGTHL/);
  assert.match(script, /not a permit approval/);
  assert.doesNotMatch(script, /fetch\(/);
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
  ]) {
    assert.match(sitemap, new RegExp(route));
  }
  assert.equal((sitemap.match(/<loc>/g) || []).length, 39);
  assert.match(terms, /not an engineering service/i);
  assert.match(support, /SolarPermitPrepAI support/);
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
  assert.match(inspectionPage, /https:\/\/www\.paypal\.com\/ncp\/payment\/SSX7PVFVEGTHL/);
});

test("builds thick permit SEO pages with professional boundaries", async () => {
  const precheckPage = await readFile(new URL("../dist/residential-solar-permit-precheck/index.html", import.meta.url), "utf8");
  const solarAppPage = await readFile(new URL("../dist/solarapp-permit-intake/index.html", import.meta.url), "utf8");
  assert.match(precheckPage, /Packet quality checklist/);
  assert.match(precheckPage, /Professional review boundary/);
  assert.match(precheckPage, /Missing-item triggers/);
  assert.match(precheckPage, /Quote handoff review/);
  assert.match(precheckPage, /licensed contractor, electrician, engineer, or permit professional/);
  assert.match(solarAppPage, /does not determine SolarAPP\+ eligibility/);
  assert.match(solarAppPage, /Project scope unclear enough to need manual screening/);
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
  assert.match(correctionPage, /https:\/\/www\.paypal\.com\/ncp\/payment\/SSX7PVFVEGTHL/);
});
