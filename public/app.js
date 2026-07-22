const fields = {
  ahj: document.querySelector("#ahj"),
  battery: document.querySelector("#battery"),
  contactEmail: document.querySelector("#contactEmail"),
  copyAll: document.querySelector("#copyAll"),
  emailQuote: document.querySelector("#emailQuote"),
  handoffOutput: document.querySelector("#handoffOutput"),
  inverterModel: document.querySelector("#inverterModel"),
  missingOutput: document.querySelector("#missingOutput"),
  moduleCount: document.querySelector("#moduleCount"),
  moduleModel: document.querySelector("#moduleModel"),
  projectAddress: document.querySelector("#projectAddress"),
  projectNotes: document.querySelector("#projectNotes"),
  quoteOutput: document.querySelector("#quoteOutput"),
  roofType: document.querySelector("#roofType"),
  servicePanel: document.querySelector("#servicePanel"),
  state: document.querySelector("#state"),
  summaryOutput: document.querySelector("#summaryOutput"),
  systemSize: document.querySelector("#systemSize"),
};

const requiredDocs = [
  "site plan",
  "roof layout",
  "single-line diagram inputs",
  "module and inverter cut sheets",
  "racking data sheet",
  "utility bill or meter number",
];

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
document.querySelectorAll(".doc-check").forEach((node) => node.addEventListener("change", generate));

generate();
