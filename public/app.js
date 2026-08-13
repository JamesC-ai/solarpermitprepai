const fields = {
  ahj: document.querySelector("#ahj"),
  activationFallbackLink: document.querySelector("#activationFallbackLink"),
  activationPaymentLink: document.querySelector("#activationPaymentLink"),
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
  permitForm: document.querySelector("#permitForm"),
  paymentFallbackLink: document.querySelector("#paymentFallbackLink"),
  paymentLink: document.querySelector("#paymentLink"),
  projectAddress: document.querySelector("#projectAddress"),
  projectNotes: document.querySelector("#projectNotes"),
  proCode: document.querySelector("#proCode"),
  proStatus: document.querySelector("#proStatus"),
  quoteOutput: document.querySelector("#quoteOutput"),
  quoteRequestLink: document.querySelector("#quoteRequestLink"),
  roofType: document.querySelector("#roofType"),
  servicePanel: document.querySelector("#servicePanel"),
  state: document.querySelector("#state"),
  summaryOutput: document.querySelector("#summaryOutput"),
  systemSize: document.querySelector("#systemSize"),
  utility: document.querySelector("#utility"),
};

const LICENSE_VERIFY_URL = "https://namebatch.pagecheckai.com/api/licenses/verify";
const LICENSE_STORAGE_KEY = "solarpermitprepai.packet-prep-code";
let paidPackActive = false;
let precheckGenerated = false;
let precheckQualified = false;

const requiredDocs = [
  "site plan",
  "roof layout",
  "single-line diagram inputs",
  "module and inverter cut sheets",
  "racking data sheet",
  "utility bill or meter number",
];

const paymentBaseLinks = {
  checkout: "https://namebatch.pagecheckai.com/api/checkout?v=solarpermit-20260731&product=solarpermitprepai",
  fallback: "https://www.paypal.com/ncp/payment/SSX7PVFVEGTHL",
};

function textValue(node, fallback = "") {
  return node.value.trim() || fallback;
}

function checkedDocs() {
  return Array.from(document.querySelectorAll(".doc-check:checked")).map((node) => node.value);
}

function values() {
  return {
    ahj: textValue(fields.ahj),
    battery: fields.battery.value,
    contactEmail: textValue(fields.contactEmail),
    docs: checkedDocs(),
    inverterModel: textValue(fields.inverterModel),
    moduleCount: Math.max(Number(fields.moduleCount.value) || 0, 0),
    moduleModel: textValue(fields.moduleModel),
    projectAddress: textValue(fields.projectAddress),
    projectNotes: textValue(fields.projectNotes),
    roofType: fields.roofType.value,
    servicePanel: textValue(fields.servicePanel),
    state: fields.state.value,
    systemSize: Math.max(Number(fields.systemSize.value) || 0, 0),
    utility: textValue(fields.utility),
  };
}

function checkoutHref(content) {
  const url = new URL(paymentBaseLinks.checkout);
  const inbound = new URLSearchParams(location.search);
  url.searchParams.set("utm_source", "solarpermitprepai");
  url.searchParams.set("utm_medium", "owned");
  url.searchParams.set("utm_campaign", "conversion");
  url.searchParams.set("utm_content", content);
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content"]) {
    const value = inbound.get(key)?.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "").slice(0, 80);
    if (value) url.searchParams.set(key, value);
  }
  return url.toString();
}

function missingDocs(docs) {
  return requiredDocs.filter((doc) => !docs.includes(doc));
}

function qualificationIssues(v = values()) {
  const issues = [];
  if (!v.contactEmail || !fields.contactEmail.validity.valid) issues.push("a valid contact email");
  if (!v.projectAddress) issues.push("the current project address");
  if (!v.state) issues.push("the project state");
  if (!v.ahj) issues.push("the city or AHJ");
  if (!v.utility) issues.push("the utility provider");
  if (v.systemSize <= 0) issues.push("the system size");
  if (v.moduleCount <= 0 || !v.moduleModel) issues.push("the module count and exact model");
  if (!v.inverterModel) issues.push("the inverter or optimizer model");
  if (!v.servicePanel) issues.push("verified service-panel notes");
  if (v.battery === "Unknown") issues.push("a confirmed battery scope");
  if (v.roofType === "unknown") issues.push("a confirmed roof type");
  if (v.docs.length < 2) issues.push("at least 2 available core documents");
  if (v.projectNotes.length < 80) issues.push("at least 80 characters of verified constraints and open questions");
  return issues;
}

function riskFlags(v, missing) {
  const flags = [];
  if (!v.contactEmail || !fields.contactEmail.validity.valid) flags.push("A valid contact email is missing.");
  if (!v.projectAddress) flags.push("Project address is missing.");
  if (!v.state) flags.push("Project state is missing.");
  if (!v.ahj) flags.push("City or permitting authority is missing.");
  if (!v.utility) flags.push("Utility provider is missing; interconnection and meter requirements cannot be scoped.");
  if (v.systemSize <= 0) flags.push("System size is missing.");
  if (v.moduleCount <= 0 || !v.moduleModel) flags.push("Module count or model is missing.");
  if (!v.inverterModel) flags.push("Inverter or optimizer model is missing.");
  if (!v.servicePanel) flags.push("Main service panel details are missing.");
  if (v.state === "Other") flags.push("State-specific AHJ rules must be checked manually.");
  if (v.battery === "Unknown") flags.push("Battery scope is unknown; ESS requirements cannot be screened.");
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
  const issues = qualificationIssues(v);
  const readiness = issues.length === 0 ? "Ready for a human plan-set quote." : "Needs current intake details before quote review.";

  fields.summaryOutput.textContent = `Project: ${v.projectAddress || "not provided"}
State: ${v.state || "not selected"}
City / AHJ: ${v.ahj || "not provided"}
Utility provider: ${v.utility || "not provided"}
System size: ${v.systemSize || "not provided"} kW
Modules: ${v.moduleCount || "not provided"} x ${v.moduleModel || "model not provided"}
Inverter / optimizer: ${v.inverterModel || "not provided"}
Battery: ${v.battery}
Roof: ${v.roofType}
Main service panel: ${v.servicePanel || "not provided"}
Readiness: ${readiness}

Boundary: this precheck organizes intake details only. It is not a permit approval, engineering design, utility approval, contractor license review, or PE stamp.`;

  fields.missingOutput.textContent = missing.length
    ? missing.map((item, index) => `${index + 1}. Missing: ${item}`).join("\n")
    : "No core intake documents are marked missing. Confirm AHJ-specific forms, plan sheet format, fire setbacks, labels, and utility interconnection steps.";

  fields.handoffOutput.textContent = `CAD / reviewer handoff:
  - Confirm AHJ: ${v.ahj || "not provided"}
- Confirm utility / interconnection provider: ${v.utility || "not provided"}
- Draft site plan, roof layout, and electrical single-line based on verified field measurements.
- Confirm module, inverter, racking, disconnect, conductor, breaker, grounding, placard, and utility details.
- Check roof structure, attachment method, fire pathway, rapid shutdown, and local code adoption.
- Escalate to a licensed contractor, engineer, or PE when required by the AHJ or project conditions.

Risk flags:
${flags.length ? flags.map((flag, index) => `${index + 1}. ${flag}`).join("\n") : "1. No obvious intake risk flags from the provided fields."}

Notes:
${v.projectNotes || "No notes provided."}`;

  fields.quoteOutput.textContent = `Subject: SolarPermitPrepAI permit packet review - ${v.projectAddress || "address not provided"}

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

Payment:
${issues.length ? "Complete the current precheck before payment is available." : checkoutHref("app_quote_email")}

Contact: ${v.contactEmail || "not provided"}`;
  return issues;
}

function syncDownloadButton() {
  fields.downloadPack.disabled = !(paidPackActive && precheckQualified);
}

function setPurchaseState(qualified) {
  precheckQualified = qualified;
  fields.paymentLink.href = qualified ? checkoutHref("home_review") : "#precheck";
  fields.paymentFallbackLink.href = qualified ? paymentBaseLinks.fallback : "#precheck";
  fields.activationPaymentLink.href = qualified ? checkoutHref("activation_review") : "#precheck";
  fields.activationFallbackLink.href = qualified ? paymentBaseLinks.fallback : "#precheck";
  fields.quoteRequestLink.href = qualified
    ? "mailto:support@pagecheckai.com?subject=SolarPermitPrepAI%20permit%20packet%20review"
    : "#precheck";
  fields.paymentLink.textContent = qualified ? "Pay $49 for this current precheck" : "Complete free precheck first";
  fields.quoteRequestLink.textContent = qualified ? "Request quote with current precheck" : "Generate precheck before quote";
  fields.activationPaymentLink.textContent = qualified ? "Buy for $49 after fit" : "Generate a ready precheck before buying";
  fields.copyAll.disabled = !qualified;
  fields.emailQuote.disabled = !qualified;
  syncDownloadButton();
  if (paidPackActive) {
    fields.proStatus.textContent = qualified
      ? "Paid permit packet handoff ready for this current precheck."
      : "Activation verified. Generate a current ready precheck before downloading.";
  }
}

function clearGenerated(message = "Complete the current project details, then generate a permit precheck.") {
  fields.summaryOutput.textContent = message;
  fields.missingOutput.textContent = "No current missing-item list yet.";
  fields.handoffOutput.textContent = "No current CAD or reviewer handoff yet.";
  fields.quoteOutput.textContent = "No current quote email yet.";
}

function invalidatePrecheck() {
  precheckGenerated = false;
  setPurchaseState(false);
  clearGenerated("Project inputs changed. Generate the current precheck again before copying, emailing, paying, or downloading.");
}

function packetText() {
  generate();
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
  fields.proStatus.textContent = message;
  syncDownloadButton();
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
    setPaidPackState(
      true,
      precheckQualified
        ? "Paid permit packet handoff ready for this current precheck."
        : "Activation verified. Generate a current ready precheck before downloading.",
    );
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
  if (!precheckGenerated || !precheckQualified || !fields.permitForm.reportValidity()) {
    setPaidPackState(true, "Generate a current ready precheck before downloading the paid handoff.");
    fields.permitForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  try {
    const blob = new Blob([paidPacketText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "solarpermitprepai-permit-packet-handoff.txt";
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setPaidPackState(true, "Paid handoff download started. Wait for your browser to confirm the file.");
  } catch {
    setPaidPackState(true, "Paid handoff download could not start. Your current precheck and activation are still available; try again.");
  }
}

async function copyAll() {
  if (!precheckGenerated || !precheckQualified) return;
  await navigator.clipboard.writeText(packetText());
  fields.copyAll.textContent = "Copied";
  setTimeout(() => {
    fields.copyAll.textContent = "Copy";
  }, 1400);
}

function approvedInquiryText() {
  const v = values();
  const equipmentCategories = ["modules", "inverter or optimizer", "service panel", v.battery]
    .filter(Boolean)
    .join(", ");
  return `SolarPermitPrepAI paid fit inquiry

Contact email: ${v.contactEmail}
State: ${v.state}
AHJ: ${v.ahj}
Approximate system size: ${v.systemSize} kW
Equipment categories: ${equipmentCategories}
Available document types: ${v.docs.length ? v.docs.join(", ") : "none selected"}
Readiness: A current free precheck is ready for professional review.

Privacy note: Street address, parcel number, owner or customer names, account numbers, exact equipment models, service-panel details, project notes, signatures, private links, and the full packet are intentionally not included. Please reply with scope and transfer guidance before requesting any additional approved detail.`;
}

function emailQuote() {
  if (!precheckGenerated || !precheckQualified || !fields.permitForm.reportValidity()) return;
  const subject = "SolarPermitPrepAI paid fit inquiry";
  location.href = `mailto:support@pagecheckai.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(approvedInquiryText())}`;
}

fields.permitForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const issues = generate();
  precheckGenerated = true;
  setPurchaseState(issues.length === 0);
});
fields.permitForm.addEventListener("input", invalidatePrecheck);
fields.permitForm.addEventListener("change", invalidatePrecheck);

fields.copyAll.addEventListener("click", copyAll);
fields.emailQuote.addEventListener("click", emailQuote);
fields.activatePack?.addEventListener("click", () => verifyPaidPackCode(fields.proCode.value));
fields.downloadPack?.addEventListener("click", downloadPaidPack);

const savedCode = localStorage.getItem(LICENSE_STORAGE_KEY);
if (savedCode) {
  fields.proCode.value = savedCode;
  verifyPaidPackCode(savedCode, { quiet: true });
}

clearGenerated();
setPurchaseState(false);
