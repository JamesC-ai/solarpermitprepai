const fields = {
  ahj: document.querySelector("#ahj"),
  activatePack: document.querySelector("#activatePack"),
  battery: document.querySelector("#battery"),
  contactEmail: document.querySelector("#contactEmail"),
  copyAll: document.querySelector("#copyAll"),
  downloadPack: document.querySelector("#downloadPack"),
  emailQuote: document.querySelector("#emailQuote"),
  handoffOutput: document.querySelector("#handoffOutput"),
  inverterModel: document.querySelector("#inverterModel"),
  missingOutput: document.querySelector("#missingOutput"),
  moduleCount: document.querySelector("#moduleCount"),
  moduleModel: document.querySelector("#moduleModel"),
  projectAddress: document.querySelector("#projectAddress"),
  projectNotes: document.querySelector("#projectNotes"),
  proCode: document.querySelector("#proCode"),
  proStatus: document.querySelector("#proStatus"),
  quoteOutput: document.querySelector("#quoteOutput"),
  roofType: document.querySelector("#roofType"),
  servicePanel: document.querySelector("#servicePanel"),
  state: document.querySelector("#state"),
  summaryOutput: document.querySelector("#summaryOutput"),
  systemSize: document.querySelector("#systemSize"),
};

const LICENSE_VERIFY_URL = "https://namebatch.pagecheckai.com/api/licenses/verify";
const LICENSE_STORAGE_KEY = "solarpermitprepai.packet-prep-code";
let paidPackActive = false;

const requiredDocs = [
  "site plan",
  "roof layout",
  "single-line diagram inputs",
  "module and inverter cut sheets",
  "racking data sheet",
  "utility bill or meter number",
];

const paymentUrl = "https://namebatch.pagecheckai.com/api/checkout?v=solarpermit-20260731&product=solarpermitprepai&utm_source=solarpermitprepai&utm_medium=owned&utm_campaign=conversion&utm_content=app_quote_email";

function textValue(node, fallback = "") {
  return node.value.trim() || fallback;
}

function checkedDocs() {
  return Array.from(document.querySelectorAll(".doc-check:checked")).map((node) => node.value);
}

function values() {
  return {
    ahj: textValue(fields.ahj, "AHJ not identified"),
    battery: fields.battery.value,
    contactEmail: textValue(fields.contactEmail),
    docs: checkedDocs(),
    inverterModel: textValue(fields.inverterModel, "inverter model not provided"),
    moduleCount: Math.max(Number(fields.moduleCount.value) || 0, 0),
    moduleModel: textValue(fields.moduleModel, "module model not provided"),
    projectAddress: textValue(fields.projectAddress, "project address not provided"),
    projectNotes: textValue(fields.projectNotes),
    roofType: fields.roofType.value,
    servicePanel: textValue(fields.servicePanel, "service panel details not provided"),
    state: fields.state.value,
    systemSize: Math.max(Number(fields.systemSize.value) || 0, 0),
  };
}

function missingDocs(docs) {
  return requiredDocs.filter((doc) => !docs.includes(doc));
}

function riskFlags(v, missing) {
  const flags = [];
  if (!v.contactEmail) flags.push("Contact email is missing.");
  if (v.state === "Other") flags.push("State-specific AHJ rules must be checked manually.");
  if (v.battery === "Battery included") flags.push("Battery/ESS details may trigger additional electrical, fire, and equipment requirements.");
  if (v.roofType === "unknown") flags.push("Roof type is unknown; structural and attachment assumptions cannot be checked.");
  if (v.systemSize > 10) flags.push("System is above 10 kW; many expedited residential workflows may not apply.");
  if (missing.length >= 3) flags.push("Several core documents are missing before a useful plan-set quote.");
  return flags;
}

function generate() {
  const v = values();
  const missing = missingDocs(v.docs);
  const flags = riskFlags(v, missing);
  const readiness = flags.length === 0 ? "Ready for a human plan-set quote." : "Needs cleanup before quote or AHJ review.";

  fields.summaryOutput.textContent = `Project: ${v.projectAddress}
State: ${v.state}
City / AHJ: ${v.ahj}
System size: ${v.systemSize} kW
Modules: ${v.moduleCount} x ${v.moduleModel}
Inverter / optimizer: ${v.inverterModel}
Battery: ${v.battery}
Roof: ${v.roofType}
Main service panel: ${v.servicePanel}
Readiness: ${readiness}

Boundary: this precheck organizes intake details only. It is not a permit approval, engineering design, utility approval, contractor license review, or PE stamp.`;

  fields.missingOutput.textContent = missing.length
    ? missing.map((item, index) => `${index + 1}. Missing: ${item}`).join("\n")
    : "No core intake documents are marked missing. Confirm AHJ-specific forms, plan sheet format, fire setbacks, labels, and utility interconnection steps.";

  fields.handoffOutput.textContent = `CAD / reviewer handoff:
- Confirm AHJ: ${v.ahj}
- Draft site plan, roof layout, and electrical single-line based on verified field measurements.
- Confirm module, inverter, racking, disconnect, conductor, breaker, grounding, placard, and utility details.
- Check roof structure, attachment method, fire pathway, rapid shutdown, and local code adoption.
- Escalate to a licensed contractor, engineer, or PE when required by the AHJ or project conditions.

Risk flags:
${flags.length ? flags.map((flag, index) => `${index + 1}. ${flag}`).join("\n") : "1. No obvious intake risk flags from the provided fields."}

Notes:
${v.projectNotes || "No notes provided."}`;

  fields.quoteOutput.textContent = `Subject: SolarPermitPrepAI permit packet review - ${v.projectAddress}

Hello,

Please review this residential PV project for permit packet readiness and quote the next step.

${fields.summaryOutput.textContent}

Available documents:
${v.docs.length ? v.docs.map((doc) => `- ${doc}`).join("\n") : "- none marked available"}

Missing / follow-up:
${fields.missingOutput.textContent}

Requested scope:
- Intake cleanup and quote for plan-set drafting coordination.
- Do not treat this request as approval-ready engineering work until a qualified reviewer confirms AHJ, utility, structural, and electrical requirements.

Payment link:
${paymentUrl}

Contact: ${v.contactEmail || "not provided"}`;
}

function packetText() {
  return `SolarPermitPrepAI packet

Readiness summary:
${fields.summaryOutput.textContent}

Missing items:
${fields.missingOutput.textContent}

CAD handoff:
${fields.handoffOutput.textContent}

Quote email:
${fields.quoteOutput.textContent}`;
}

function paidPacketText() {
  const v = values();
  return `SolarPermitPrepAI Paid Permit Packet Handoff

Generated locally from the current browser precheck. Review every project fact, field measurement, equipment model, document, AHJ note, utility requirement, and professional decision before sharing.

${packetText()}

Paid handoff checklist:
1. Confirm the project address, AHJ, state, utility, site plan, roof layout, service-panel details, equipment models, and battery scope from the responsible project owner.
2. Keep roof photos, utility bills, permit records, engineering documents, credentials, and homeowner information in a private project folder.
3. Mark assumptions separately from verified field facts. Do not fill unknown values with guesses.
4. Route structural, electrical, fire-access, rapid-shutdown, equipment, utility, and local-code questions to the qualified professional responsible for the project.
5. Do not treat this file as a stamped plan set, official application, permit approval, utility approval, inspection approval, or construction authorization.
6. Record which documents are owned by the homeowner, installer, drafter, engineer, AHJ, utility, or other responsible party.
7. Keep permit portal login, payment, signature, submission, inspection scheduling, and account changes outside this tool.

Document and review tracker:
Item | Owner | Private location | Reviewer | Status | Last checked | Next authorized step
Site plan | _____ | _____ | _____ | ${v.docs.includes("site plan") ? "available" : "missing"} | _____ | _____
Roof layout | _____ | _____ | _____ | ${v.docs.includes("roof layout") ? "available" : "missing"} | _____ | _____
SLD inputs | _____ | _____ | _____ | ${v.docs.includes("single-line diagram inputs") ? "available" : "missing"} | _____ | _____
Equipment cut sheets | _____ | _____ | _____ | ${v.docs.includes("module and inverter cut sheets") ? "available" : "missing"} | _____ | _____
Racking data | _____ | _____ | _____ | ${v.docs.includes("racking data sheet") ? "available" : "missing"} | _____ | _____
Utility or meter record | _____ | _____ | _____ | ${v.docs.includes("utility bill or meter number") ? "available" : "missing"} | _____ | _____
Professional review | _____ | _____ | _____ | pending | _____ | _____
AHJ submission | _____ | _____ | _____ | not performed by this tool | _____ | _____

Operating boundary:
SolarPermitPrepAI organizes intake and quote-prep notes. It does not log into permit portals, submit applications, pay fees, sign forms, calculate electrical or structural compliance, interpret AHJ rules, verify licensure, certify inspection readiness, or guarantee permit approval, utility approval, safety, schedule, quote, payment, ranking, traffic, sales, or revenue.`;
}

function setPaidPackState(active, message) {
  paidPackActive = active;
  fields.downloadPack.disabled = !active;
  fields.proStatus.textContent = message;
}

async function verifyPaidPackCode(rawCode, { quiet = false } = {}) {
  const code = rawCode.trim().toUpperCase();
  if (!/^SP-[A-F0-9]{4}(?:-[A-F0-9]{4}){3}$/.test(code)) {
    setPaidPackState(false, quiet ? "Enter your paid handoff code." : "That activation code format is not valid.");
    return false;
  }
  fields.activatePack.disabled = true;
  if (!quiet) setPaidPackState(false, "Checking activation code...");
  try {
    const response = await fetch(LICENSE_VERIFY_URL, {
      body: JSON.stringify({ code, product: "solarpermitprepai" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.valid !== true || result.entitlement !== "permit_packet_prep_pack") {
      localStorage.removeItem(LICENSE_STORAGE_KEY);
      setPaidPackState(false, "The code could not be verified. Check it or contact support.");
      return false;
    }
    localStorage.setItem(LICENSE_STORAGE_KEY, code);
    fields.proCode.value = code;
    setPaidPackState(true, "Paid permit packet handoff unlocked on this browser.");
    return true;
  } catch {
    setPaidPackState(false, "Activation is temporarily unavailable. Your project notes remain on this device.");
    return false;
  } finally {
    fields.activatePack.disabled = false;
  }
}

function downloadPaidPack() {
  if (!paidPackActive) {
    setPaidPackState(false, "Activate the paid handoff before downloading.");
    fields.proCode.focus();
    return;
  }
  const blob = new Blob([paidPacketText()], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "solarpermitprepai-permit-packet-handoff.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function copyAll() {
  await navigator.clipboard.writeText(packetText());
  fields.copyAll.textContent = "Copied";
  setTimeout(() => {
    fields.copyAll.textContent = "Copy";
  }, 1400);
}

function emailQuote() {
  const v = values();
  const subject = `SolarPermitPrepAI permit packet review - ${v.projectAddress}`;
  location.href = `mailto:support@pagecheckai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(packetText())}`;
}

document.querySelector("#permitForm").addEventListener("submit", (event) => {
  event.preventDefault();
  generate();
});

fields.copyAll.addEventListener("click", copyAll);
fields.emailQuote.addEventListener("click", emailQuote);
fields.activatePack?.addEventListener("click", () => verifyPaidPackCode(fields.proCode.value));
fields.downloadPack?.addEventListener("click", downloadPaidPack);
document.querySelectorAll(".doc-check").forEach((node) => node.addEventListener("change", generate));

const savedCode = localStorage.getItem(LICENSE_STORAGE_KEY);
if (savedCode) {
  fields.proCode.value = savedCode;
  verifyPaidPackCode(savedCode, { quiet: true });
}

generate();
