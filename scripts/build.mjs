import { cp, mkdir, rm, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const publicDir = new URL("public/", root);
const distDir = new URL("dist/", root);
const site = "https://solar.pagecheckai.com";
const reviewUrl = "https://namebatch.pagecheckai.com/api/checkout?v=solarpermit-20260731&product=solarpermitprepai";
const fallbackReviewUrl = "https://www.paypal.com/ncp/payment/SSX7PVFVEGTHL";

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
  {
    slug: "solar-permit-application-checklist",
    title: "Solar Permit Application Checklist",
    description: "Organize application forms, property details, contractor information, plan attachments, fees, and open questions before residential solar permit submission.",
    audience: "homeowners, installers, and permit coordinators preparing an application package for local review",
    checklist: ["Current AHJ application form", "Property and applicant details", "Required plan attachments", "Fee and submission-channel notes"],
    steps: ["Download the current AHJ checklist.", "Inventory required fields and attachments.", "Flag missing signatures or facts.", "Route the package to the responsible permit professional."],
    packetQuality: [
      "Record the source and revision date for every local form or checklist.",
      "Keep applicant, owner, contractor, and project details consistent across forms and plans.",
      "Mark fees, signatures, and portal steps as pending until the responsible person confirms them.",
    ],
    reviewBoundary: [
      "Only the AHJ and responsible permit team can confirm current submission requirements.",
      "SolarPermitPrepAI does not complete official forms, pay fees, sign applications, or guarantee acceptance.",
      "Use the checklist to organize a handoff before final professional and local review.",
    ],
    missingItemTriggers: [
      "Current AHJ form or checklist not found",
      "Applicant, contractor, or owner information incomplete",
      "Required plan attachment status unclear",
      "Signature, fee, or portal requirement not confirmed",
    ],
    faq: [
      ["Does this submit the permit application?", "No. It organizes the application checklist; the responsible party must review and submit through the official channel."],
      ["Can requirements change?", "Yes. Always confirm the current forms, fees, and instructions with the AHJ."],
    ],
  },
  {
    slug: "solar-plan-set-turnaround-time-checklist",
    title: "Solar Plan Set Turnaround Time Checklist",
    description: "Prepare a realistic solar plan-set timing brief with intake readiness, review dependencies, missing files, revision risk, and target dates.",
    audience: "sales and operations teams setting expectations before residential solar drafting begins",
    checklist: ["Requested delivery date", "Intake-complete date", "Known review dependencies", "Revision and approval assumptions"],
    steps: ["Set the target date.", "Check whether intake is complete.", "List professional and AHJ dependencies.", "Share a conditional timeline without promising approval."],
    packetQuality: [
      "Separate drafting turnaround from professional review, permit review, utility review, and construction scheduling.",
      "State which missing items can pause work and who owns each one.",
      "Update the timing brief when equipment, layout, or AHJ requirements change.",
    ],
    reviewBoundary: [
      "Turnaround estimates are planning notes, not guarantees of permit or utility approval.",
      "SolarPermitPrepAI does not control drafter, engineer, AHJ, utility, or contractor schedules.",
      "Use dates as conditional targets and confirm them with every responsible party.",
    ],
    missingItemTriggers: [
      "Intake package is incomplete",
      "Structural or electrical review is required",
      "AHJ turnaround is unknown",
      "Equipment or layout may change",
    ],
    faq: [
      ["Does the tool guarantee a delivery date?", "No. It helps expose dependencies so the responsible team can set a realistic target."],
      ["Is permit review included in drafting time?", "Usually it is a separate dependency and should be tracked separately."],
    ],
  },
  {
    slug: "solar-permit-correction-response-letter",
    title: "Solar Permit Correction Response Letter",
    description: "Organize AHJ correction comments into a response-letter brief with verbatim comments, sheet references, responsible owners, evidence, and unresolved questions.",
    audience: "permit coordinators preparing a clean response handoff after plan review comments",
    checklist: ["Verbatim correction comment", "Affected sheet or document", "Proposed response owner", "Evidence and completion status"],
    steps: ["Preserve every AHJ comment verbatim.", "Map each item to a sheet or document.", "Assign the qualified response owner.", "Have the responsible professional approve the final response."],
    packetQuality: [
      "Keep AHJ wording separate from internal notes and proposed responses.",
      "Use one row per correction so no item disappears during revision.",
      "Attach revised-sheet references and supporting evidence only after they are confirmed.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not interpret code or decide the technical response to an AHJ.",
      "The responsible designer, contractor, engineer, electrician, or permit professional must approve each response.",
      "Do not submit generated wording as an official response without qualified review.",
    ],
    missingItemTriggers: [
      "Correction comment is paraphrased or incomplete",
      "Affected sheet or owner is unknown",
      "Technical interpretation is required",
      "Revised evidence has not been checked",
    ],
    faq: [
      ["Can it answer code corrections automatically?", "No. It structures the response workflow; qualified professionals must decide and approve technical answers."],
      ["Should AHJ comments be edited for clarity?", "Keep the original wording intact and add separate internal notes."],
    ],
  },
  {
    slug: "solar-structural-review-intake-checklist",
    title: "Solar Structural Review Intake Checklist",
    description: "Prepare roof framing, attachment, span, loading, site-photo, and plan references before routing a residential solar project for structural review.",
    audience: "solar coordinators gathering field information for a qualified structural reviewer",
    checklist: ["Roof framing and span notes", "Attachment and racking references", "Array and equipment locations", "Site photos and available plans"],
    steps: ["Collect existing structural facts.", "Label photos and measurements.", "Flag unknown or damaged conditions.", "Route the packet to the qualified reviewer."],
    packetQuality: [
      "Separate measured field facts from estimates and sales-stage assumptions.",
      "Label framing, attic, roof, attachment, and equipment-location photos clearly.",
      "Include available plans and product documents without claiming they prove structural adequacy.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not calculate loads, verify spans, design attachments, or provide structural approval.",
      "A qualified engineer or other locally authorized professional must determine structural requirements.",
      "Do not use the intake packet as construction authorization.",
    ],
    missingItemTriggers: [
      "Framing size, spacing, span, or condition unknown",
      "Attachment or racking system not selected",
      "Roof damage or unusual construction observed",
      "AHJ requires structural calculations or a sealed review",
    ],
    faq: [
      ["Does this perform structural calculations?", "No. It organizes field information for a qualified structural reviewer."],
      ["Can product cut sheets replace engineering review?", "No. Product documents support intake but do not determine site-specific structural adequacy."],
    ],
  },
  {
    slug: "solar-racking-mounting-cut-sheet-checklist",
    title: "Solar Racking and Mounting Cut Sheet Checklist",
    description: "Organize racking, attachment, flashing, rail, clamp, roof-type, and manufacturer documents before a residential solar plan-set review.",
    audience: "installers and permit coordinators assembling product documentation for drafting and professional review",
    checklist: ["Racking manufacturer and model", "Attachment and flashing products", "Module clamp compatibility", "Roof type and installation-document revision"],
    steps: ["List the selected products.", "Collect current manufacturer documents.", "Match documents to the project scope.", "Send the packet for qualified design review."],
    packetQuality: [
      "Record exact manufacturer names, model numbers, and document revision dates.",
      "Keep roof-type and attachment assumptions visible.",
      "Remove obsolete or unrelated product documents from the active handoff.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not select mounting hardware or verify product compatibility, spacing, loading, or installation.",
      "The installer, designer, engineer, manufacturer guidance, and AHJ requirements control the final design.",
      "Use cut sheets as supporting documents, not as proof of project approval.",
    ],
    missingItemTriggers: [
      "Racking or attachment model is unknown",
      "Manufacturer document revision is unclear",
      "Roof type does not match the selected attachment assumption",
      "Site-specific spacing or loading review is required",
    ],
    faq: [
      ["Can the checklist choose a mounting system?", "No. It organizes selected product documents for qualified review."],
      ["Should old cut sheets stay in the packet?", "Keep only the documents that match the current selected products and archive older versions separately."],
    ],
  },
  {
    slug: "solar-rapid-shutdown-documentation-checklist",
    title: "Solar Rapid Shutdown Documentation Checklist",
    description: "Prepare rapid-shutdown equipment, compatibility, diagram, labeling, cut-sheet, and verification questions for professional solar permit review.",
    audience: "solar coordinators collecting rapid-shutdown documentation before electrical design and permit review",
    checklist: ["Module-level and inverter equipment", "Compatibility documentation", "Diagram and conductor notes", "Label and verification questions"],
    steps: ["List the current equipment configuration.", "Collect manufacturer documents.", "Flag unknown compatibility or field details.", "Route the packet to the responsible electrical professional."],
    packetQuality: [
      "Use exact model numbers and current manufacturer documentation.",
      "Keep design assumptions, field facts, and unanswered questions separate.",
      "Connect rapid-shutdown notes to the current one-line diagram and equipment schedule.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not design, test, certify, or approve rapid-shutdown systems.",
      "Code applicability, equipment compatibility, conductor routing, and field verification require qualified review.",
      "Confirm requirements with the responsible professional and AHJ before submission or installation.",
    ],
    missingItemTriggers: [
      "Exact equipment model is unknown",
      "Compatibility documentation is missing",
      "Diagram and field configuration do not match",
      "Local code or AHJ interpretation is required",
    ],
    faq: [
      ["Does this verify rapid-shutdown compliance?", "No. It prepares documentation questions for qualified electrical and AHJ review."],
      ["Are model numbers important?", "Yes. Compatibility and documentation should be tied to the exact equipment configuration."],
    ],
  },
  {
    slug: "solar-placard-label-schedule-checklist",
    title: "Solar Placard and Label Schedule Checklist",
    description: "Organize proposed solar placards, equipment labels, locations, source references, and verification status before plan-set and field review.",
    audience: "permit coordinators preparing a label-schedule handoff for designers, installers, and inspectors",
    checklist: ["Proposed label text", "Equipment or location", "Source and revision reference", "Professional verification status"],
    steps: ["Inventory proposed labels.", "Map each label to a location.", "Record the source reference.", "Have the responsible professional approve text and placement."],
    packetQuality: [
      "Keep label wording tied to the current equipment and diagram revision.",
      "Use location notes or photos so installers can identify intended placement.",
      "Track unverified labels separately from approved schedule entries.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not prescribe code-required label wording, materials, size, or placement.",
      "The responsible professional, installer, AHJ, and inspector determine final label requirements.",
      "Do not fabricate or install labels from an unreviewed generated checklist.",
    ],
    missingItemTriggers: [
      "Label source or revision is unknown",
      "Equipment or location has changed",
      "Diagram and label schedule do not match",
      "AHJ-specific wording needs confirmation",
    ],
    faq: [
      ["Does this generate code-compliant labels?", "No. It organizes a proposed schedule for qualified review."],
      ["When should the schedule be updated?", "Whenever equipment, diagrams, locations, or local requirements change."],
    ],
  },
  {
    slug: "solar-interconnection-application-handoff",
    title: "Solar Interconnection Application Handoff",
    description: "Prepare utility, account, meter, equipment, system-size, document, and status notes before handing a residential solar project to the interconnection team.",
    audience: "solar operations teams organizing utility application inputs without making approval claims",
    checklist: ["Utility and service account context", "Meter and system-size details", "Equipment and diagram status", "Application owner and open questions"],
    steps: ["Identify the utility and current process.", "Inventory account and project inputs.", "Flag missing documents or approvals.", "Route the handoff through the utility's official workflow."],
    packetQuality: [
      "Protect account details and use the team's approved secure system.",
      "Keep permit, interconnection, inspection, and permission-to-operate milestones separate.",
      "Record the official application owner, status, and next required action.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not submit utility applications, interpret tariffs, or guarantee interconnection or permission to operate.",
      "Utility rules and forms must be confirmed through official channels and responsible professionals.",
      "Do not include unnecessary sensitive account information in generated shared notes.",
    ],
    missingItemTriggers: [
      "Utility or application pathway is unknown",
      "Account or meter details are incomplete",
      "Equipment or one-line diagram is not final",
      "Utility review, upgrade, or study may be required",
    ],
    faq: [
      ["Is permit approval the same as interconnection approval?", "No. Track permit, utility, inspection, and permission-to-operate milestones separately."],
      ["Does this submit to the utility?", "No. It prepares an internal handoff for the official utility process."],
    ],
  },
  {
    slug: "solar-load-calculation-intake-checklist",
    title: "Solar Load Calculation Intake Checklist",
    description: "Gather service, panel, major-load, equipment, photo, and project-scope details before a qualified professional performs any required electrical load calculation.",
    audience: "solar coordinators collecting electrical intake without calculating or approving service capacity",
    checklist: ["Service and panel information", "Major existing and proposed loads", "PV, battery, and backup scope", "Photos and available electrical documents"],
    steps: ["Collect known service facts.", "Inventory relevant loads and project changes.", "Mark unknown values clearly.", "Send the intake to a qualified electrical professional."],
    packetQuality: [
      "Record exact source documents or photos for every known electrical value.",
      "Keep existing loads, proposed loads, and solar or battery equipment clearly separated.",
      "Do not estimate missing ratings or convert the intake into an unreviewed calculation.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not perform load calculations, service sizing, breaker sizing, conductor sizing, or compliance review.",
      "A licensed electrician, engineer, or other authorized professional must perform and approve required calculations.",
      "Use the page only to reduce missing intake information.",
    ],
    missingItemTriggers: [
      "Service or panel rating is unknown",
      "Major load nameplate data is missing",
      "Battery, backup, EV, HVAC, or service upgrade scope is unclear",
      "A signed or sealed calculation is required",
    ],
    faq: [
      ["Does this calculate electrical load?", "No. It gathers inputs for a qualified professional who performs the required calculation."],
      ["Should unknown ratings be estimated?", "No. Mark them missing and obtain reliable source information."],
    ],
  },
  {
    slug: "solar-plan-set-version-control-checklist",
    title: "Solar Plan Set Version Control Checklist",
    description: "Track solar plan-set revisions, equipment changes, sheet dates, AHJ comments, approval status, and superseded files in one handoff.",
    audience: "solar operations and permit teams managing multiple drawing and correction cycles",
    checklist: ["Current plan-set revision", "Changed sheets and equipment", "AHJ comment status", "Superseded-file archive"],
    steps: ["Name the current source of truth.", "Log every changed sheet or attachment.", "Archive superseded files.", "Confirm the approved issue before submission or construction."],
    packetQuality: [
      "Use consistent filenames, revision dates, and issue status across every attachment.",
      "Keep submitted, reviewed, approved, and construction versions clearly separated.",
      "Record equipment substitutions and their effect on drawings and supporting documents.",
    ],
    reviewBoundary: [
      "Version control does not validate design accuracy, code compliance, approval, or construction readiness.",
      "The responsible designer, contractor, engineer, electrician, AHJ, and utility must review the applicable issue.",
      "Do not build from a file until the responsible team confirms the authorized version.",
    ],
    missingItemTriggers: [
      "More than one file is labeled final",
      "Revision date or owner is missing",
      "Equipment changed without updated sheets or cut sheets",
      "Submitted and approved versions cannot be distinguished",
    ],
    faq: [
      ["Should old plan sets be deleted?", "Archive superseded files clearly rather than deleting the project history."],
      ["Can version control confirm construction readiness?", "No. The responsible team must confirm the authorized construction issue."],
    ],
  },
  {
    slug: "solar-permit-rejection-checklist",
    title: "Solar Permit Rejection Checklist",
    description: "Organize rejected residential solar permit notes, AHJ comments, missing attachments, owner assignments, and professional review routing.",
    audience: "permit coordinators, installers, and homeowners trying to understand why a residential solar permit packet was rejected or returned",
    checklist: ["Original rejection or return notice", "Affected sheet or form", "Missing attachment list", "Response owner and due date"],
    steps: ["Preserve the notice text verbatim.", "Group items by form, plan sheet, electrical, structural, or fire topic.", "Flag technical decisions for the responsible professional.", "Send a clean response handoff before resubmission."],
    packetQuality: [
      "Keep AHJ wording separate from internal notes and proposed next steps.",
      "Record every missing attachment and whether a revised file has been created.",
      "Track owner, due date, and status for each rejection item so nothing is lost during resubmittal.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not decide the technical answer to a permit rejection.",
      "A contractor, designer, engineer, electrician, or permit professional must approve any response before resubmission.",
      "Do not submit generated wording as an official response without qualified review.",
    ],
    missingItemTriggers: [
      "Rejection notice is incomplete or paraphrased",
      "Affected plan sheet or attachment is unknown",
      "Technical code interpretation is required",
      "Resubmission owner or deadline is unclear",
    ],
    faq: [
      ["Can this fix a rejected permit automatically?", "No. It organizes the rejection packet and response workflow for qualified review."],
      ["Should I rewrite AHJ comments?", "No. Preserve the original comments and add separate internal notes."],
    ],
  },
  {
    slug: "solar-ev-charger-ready-panel-notes",
    title: "Solar EV Charger Ready Panel Notes",
    description: "Prepare EV charger, solar, battery, service-panel, load, and future-equipment notes before routing a residential project for electrical review.",
    audience: "solar teams and homeowners adding EV charger readiness or future-load notes to a residential PV project",
    checklist: ["Existing and proposed EV charger notes", "Main panel and breaker context", "Battery or backup assumptions", "Load calculation review status"],
    steps: ["Separate current PV scope from future EV scope.", "Record panel and major-load facts.", "Mark unknown values clearly.", "Route the packet to a qualified electrical reviewer."],
    packetQuality: [
      "Keep existing loads, proposed EV charger loads, battery loads, and PV equipment clearly separated.",
      "Attach panel photos and nameplate references through a secure project channel.",
      "Flag any future-ready assumption that should not appear as an approved design decision.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not perform load calculations, service sizing, breaker sizing, or EV charger design.",
      "A licensed electrician, engineer, contractor, or other authorized professional must verify electrical requirements.",
      "Use future-ready notes as intake context, not as installation or permit approval.",
    ],
    missingItemTriggers: [
      "EV charger rating or circuit is unknown",
      "Panel rating or breaker space is unclear",
      "Battery, backup, or service-upgrade scope may affect review",
      "Required load calculation has not been completed by a qualified professional",
    ],
    faq: [
      ["Can this approve an EV charger circuit?", "No. It only organizes intake notes for qualified electrical review."],
      ["Should future EV notes be separated from current solar scope?", "Yes. Mixing future loads with the active permit scope can confuse handoffs."],
    ],
  },
  {
    slug: "solar-meter-main-combo-photo-checklist",
    title: "Solar Meter Main Combo Photo Checklist",
    description: "Prepare meter-main combo photos, labels, breaker positions, service ratings, and missing field details before residential PV plan review.",
    audience: "field teams, sales teams, and permit coordinators collecting service-equipment photos for solar intake",
    checklist: ["Full meter-main photo", "Label and rating close-ups", "Breaker and busbar context", "Workspace and service-entry photos"],
    steps: ["Capture wide and close-up photos.", "Record ratings only from visible labels.", "Flag any missing or unreadable values.", "Send the packet to the electrical reviewer."],
    packetQuality: [
      "Capture the whole meter-main area plus readable labels and breaker locations.",
      "Do not guess ratings from similar equipment or old notes.",
      "Keep photos tied to the correct address and current project scope.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not approve service equipment, interconnection methods, or electrical compliance.",
      "A qualified reviewer must verify meter-main details, ratings, and field conditions.",
      "Use photos as intake evidence, not as design approval.",
    ],
    missingItemTriggers: [
      "Label is unreadable or missing",
      "Main breaker or busbar rating is unknown",
      "Meter-main layout does not match previous notes",
      "Line-side tap, service upgrade, or backup equipment may be involved",
    ],
    faq: [
      ["Can the checklist determine panel compatibility?", "No. It helps collect photos and labels for a qualified reviewer."],
      ["Are wide photos or close-ups more useful?", "Both. Wide photos show context; close-ups show ratings and labels."],
    ],
  },
  {
    slug: "solar-detached-garage-pv-permit-notes",
    title: "Solar Detached Garage PV Permit Notes",
    description: "Organize detached garage solar notes with structure, feeder, roof, trenching, equipment, and AHJ review questions.",
    audience: "solar coordinators and homeowners preparing a residential PV project involving a detached garage or accessory structure",
    checklist: ["Detached structure description", "Feeder or subpanel context", "Roof and structural notes", "Equipment and trenching assumptions"],
    steps: ["Describe the accessory structure.", "Separate garage scope from main-house scope.", "Flag unknown feeder or structural facts.", "Route to the responsible professionals before permit work."],
    packetQuality: [
      "Record whether equipment is on the main dwelling, detached structure, or both.",
      "Keep feeder, subpanel, trenching, structural, and fire-access questions visible.",
      "Attach photos and site notes through the project's secure channel.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not determine whether a detached structure is suitable for PV or permitted equipment.",
      "Electrical, structural, trenching, zoning, and AHJ requirements need qualified review.",
      "Do not treat intake notes as construction authorization.",
    ],
    missingItemTriggers: [
      "Detached structure framing or roof details are unknown",
      "Feeder, subpanel, or trenching details are unclear",
      "Equipment location affects utility or AHJ requirements",
      "Zoning, fire, or structural review may be required",
    ],
    faq: [
      ["Can this approve a detached garage installation?", "No. It organizes questions for the professionals and AHJ involved."],
      ["Why separate garage and house scope?", "Detached structures often add feeder, structural, and local-review questions."],
    ],
  },
  {
    slug: "solar-hoa-approval-packet-checklist",
    title: "Solar HOA Approval Packet Checklist",
    description: "Prepare a solar HOA approval handoff with layout images, equipment appearance notes, owner questions, and separate permit boundaries.",
    audience: "homeowners and solar teams preparing HOA-facing solar packet notes without confusing them with permit approval",
    checklist: ["HOA form or architectural checklist", "Visible equipment and array notes", "Owner authorization status", "Separate permit and utility status"],
    steps: ["Collect current HOA requirements.", "Prepare visual and equipment notes.", "Separate HOA review from AHJ permit review.", "Have the owner or responsible team submit through the official channel."],
    packetQuality: [
      "Use the HOA's current form or architectural request checklist when available.",
      "Keep visible-equipment and roof-layout notes clear but separate from technical permit documents.",
      "Track HOA, AHJ, utility, and installation milestones separately.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not provide HOA legal advice, approval, or architectural-control determinations.",
      "HOA requirements, owner rights, and local laws must be reviewed by the responsible party or professional.",
      "Do not treat an HOA packet as a permit packet or utility application.",
    ],
    missingItemTriggers: [
      "Current HOA form is missing",
      "Visible equipment or array layout is unclear",
      "Owner authorization or property rules are uncertain",
      "HOA, permit, and utility review statuses are mixed together",
    ],
    faq: [
      ["Does this submit to the HOA?", "No. It prepares a handoff checklist for the owner or responsible team."],
      ["Is HOA approval the same as permit approval?", "No. HOA, AHJ, utility, and inspection milestones should be tracked separately."],
    ],
  },
  {
    slug: "solar-fire-department-review-handoff",
    title: "Solar Fire Department Review Handoff",
    description: "Organize fire department solar review notes with access pathways, setbacks, labels, roof layout references, and AHJ questions.",
    audience: "permit coordinators and installers preparing fire-review questions for residential solar plan-set work",
    checklist: ["Access pathway notes", "Setback or ridge clearance questions", "Label and disconnect references", "Roof plan and photo status"],
    steps: ["Collect local fire review notes.", "Map questions to roof layout or label schedule.", "Flag unresolved local requirements.", "Send the handoff to the responsible designer or permit professional."],
    packetQuality: [
      "Tie each fire-review question to a roof plane, plan sheet, label, or equipment location.",
      "Separate known local requirements from assumptions or old templates.",
      "Include only current layout and label references in the active handoff.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not interpret fire code, approve access pathways, or prescribe label wording.",
      "The AHJ, fire authority, installer, designer, or qualified professional must confirm requirements.",
      "Use the page to organize review questions, not as fire-code advice.",
    ],
    missingItemTriggers: [
      "Local fire access requirements not confirmed",
      "Roof layout or obstruction notes are unclear",
      "Label or disconnect locations have changed",
      "Fire department comments require technical interpretation",
    ],
    faq: [
      ["Can this approve fire setbacks?", "No. It organizes fire-review questions for local and professional review."],
      ["Should old fire templates be reused?", "Only after confirming they match the current AHJ and project scope."],
    ],
  },
  {
    slug: "solar-as-built-plan-set-intake-checklist",
    title: "Solar As-Built Plan Set Intake Checklist",
    description: "Prepare solar as-built plan-set notes with field changes, equipment substitutions, inspection comments, and approved-version tracking.",
    audience: "solar operations teams documenting field changes after installation or inspection feedback",
    checklist: ["Installed equipment and layout changes", "Field photo references", "Inspection or correction notes", "Approved and superseded files"],
    steps: ["Record field changes from the approved plan set.", "Attach photos and marked-up notes.", "Separate as-built questions from permit revisions.", "Route to the responsible professional for review."],
    packetQuality: [
      "Record exact changed equipment, locations, labels, or wiring notes with source photos.",
      "Keep approved, installed, inspection, and as-built versions clearly separated.",
      "Log who verified each field change and which document should be updated.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not validate as-built accuracy or approve construction changes.",
      "The responsible contractor, designer, engineer, electrician, AHJ, or utility must determine required updates.",
      "Do not rely on generated notes as an authorized as-built record.",
    ],
    missingItemTriggers: [
      "Installed field condition does not match approved plans",
      "Equipment substitution lacks documentation",
      "Inspection comment requires a revised drawing or professional response",
      "Current approved version is unclear",
    ],
    faq: [
      ["Can this create official as-built drawings?", "No. It prepares intake notes for the responsible professional or drafter."],
      ["Should field changes be photographed?", "Yes. Clear photos and marked-up notes make the as-built handoff safer."],
    ],
  },
  {
    slug: "solar-inspection-ready-packet-checklist",
    title: "Solar Inspection Ready Packet Checklist",
    description: "Organize solar inspection readiness notes with approved plans, placards, equipment photos, permit card, access, and open punch-list items.",
    audience: "installers and operations teams preparing for residential solar inspection scheduling",
    checklist: ["Approved plan set and permit card", "Placards and labels", "Equipment access and photos", "Open punch-list items"],
    steps: ["Confirm approved documents are available.", "Check labels and equipment access status.", "List open field items.", "Route any uncertainty to the responsible installer before inspection."],
    packetQuality: [
      "Keep approved plans, permit card, labels, equipment documents, and site-access notes in one handoff.",
      "Mark open punch-list items instead of hiding them in general comments.",
      "Confirm who will meet the inspector and what backup documents they need.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not determine inspection readiness or guarantee inspection approval.",
      "The installer, contractor, electrician, AHJ, and inspector determine inspection requirements and outcomes.",
      "Use the checklist only as an operations preparation aid.",
    ],
    missingItemTriggers: [
      "Approved plan set or permit card is missing",
      "Placards, labels, or equipment access are not verified",
      "Open field items remain before inspection",
      "Inspection jurisdiction or scheduling rules are unclear",
    ],
    faq: [
      ["Does this guarantee passing inspection?", "No. It organizes readiness notes; inspection outcome belongs to the AHJ and responsible professionals."],
      ["Should open punch-list items be listed?", "Yes. Make open items visible before scheduling or field handoff."],
    ],
  },
  {
    slug: "solar-permit-portal-upload-checklist",
    title: "Solar Permit Portal Upload Checklist",
    description: "Prepare solar permit portal upload notes with file names, attachment types, form status, payment owner, and sensitive-login boundaries.",
    audience: "permit coordinators organizing residential solar files before official portal submission",
    checklist: ["Portal attachment list", "Required file names and formats", "Form and signature status", "Fee and submitter owner"],
    steps: ["Inventory every required upload.", "Label final files clearly.", "Keep portal credentials private.", "Have the responsible submitter review before upload."],
    packetQuality: [
      "Separate draft files from final upload files so the wrong plan set is not submitted.",
      "Record required file formats, attachment categories, and form status.",
      "Keep payment, signature, and official submitter steps visible for the responsible person.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not log into permit portals, pay fees, sign forms, or submit applications.",
      "Only the responsible permit team should handle official uploads and sensitive portal credentials.",
      "Use the checklist to prepare files before the final authorized submission.",
    ],
    missingItemTriggers: [
      "Required attachment list is incomplete",
      "Final file version is unclear",
      "Signature, fee, or official submitter is not confirmed",
      "Portal credentials or sensitive account steps are being requested in shared notes",
    ],
    faq: [
      ["Can the tool upload permit files?", "No. It only organizes the upload checklist; official portal action requires the authorized submitter."],
      ["Should credentials be placed in the brief?", "No. Keep portal credentials out of generated notes and shared documents."],
    ],
  },
  {
    slug: "solar-equipment-substitution-permit-notes",
    title: "Solar Equipment Substitution Permit Notes",
    description: "Organize solar equipment substitution notes with old and new model numbers, cut sheets, plan-set impacts, and approval routing.",
    audience: "solar operations teams handling module, inverter, battery, racking, or rapid-shutdown substitutions before permit or construction updates",
    checklist: ["Original and proposed equipment models", "Updated cut sheets", "Affected plan sheets and labels", "Professional and AHJ review status"],
    steps: ["List the original approved equipment.", "List the proposed substitution.", "Collect matching documents.", "Route impacts to the responsible designer, AHJ, utility, or installer."],
    packetQuality: [
      "Use exact model numbers and current cut sheets for both old and new equipment.",
      "Map substitutions to affected sheets, labels, calculations, and utility documents.",
      "Track whether the change requires revision, resubmission, or field-only documentation.",
    ],
    reviewBoundary: [
      "SolarPermitPrepAI does not approve equipment substitutions or verify compatibility, listings, code, utility, or manufacturer requirements.",
      "The responsible professional, installer, AHJ, and utility must determine whether a substitution is acceptable.",
      "Do not install or submit changed equipment based only on generated notes.",
    ],
    missingItemTriggers: [
      "Original approved model is unknown",
      "New cut sheet or certification document is missing",
      "Plan set, label schedule, or utility application may be affected",
      "Professional, AHJ, or utility approval status is unclear",
    ],
    faq: [
      ["Can this approve a module or inverter swap?", "No. It organizes substitution notes for qualified review."],
      ["Should old equipment documents stay in the packet?", "Archive them separately and keep the active handoff focused on the current proposed equipment."],
    ],
  },
  {
    slug: "solar-battery-spec-sheet-handoff",
    title: "Solar Battery Spec Sheet Handoff",
    description: "Organize battery model, capacity, installation, backup, disconnect, and manufacturer-document notes before solar permit review.",
    audience: "solar coordinators and homeowners preparing battery documents for a drafter or permit professional",
    checklist: ["Exact battery model", "Capacity and backup scope", "Disconnect and equipment notes", "Current manufacturer documents"],
    steps: ["Record the proposed battery model.", "Separate backup assumptions from confirmed scope.", "Collect current documentation.", "Route the handoff for qualified review."],
    packetQuality: ["Use exact model numbers and document dates.", "Separate confirmed facts from homeowner assumptions.", "Track which plan sheets or utility documents may be affected."],
    reviewBoundary: ["SolarPermitPrepAI does not approve battery design or code compliance.", "A qualified designer, electrician, AHJ, and utility determine requirements and acceptance.", "Do not treat a spec-sheet handoff as a final design."],
    missingItemTriggers: ["Battery model is unknown", "Backup loads or operating mode are unclear", "Disconnect or location notes are missing", "Current manufacturer documents are unavailable"],
    faq: [["Can this size a battery system?", "No. It organizes intake facts for qualified design review."], ["Should backup loads be listed?", "Yes, as project context, but a qualified professional must determine the actual system design."]],
  },
  {
    slug: "solar-inverter-cut-sheet-checklist",
    title: "Solar Inverter Cut Sheet Checklist",
    description: "Prepare inverter cut sheet notes with model, ratings, disconnects, communications, mounting, and permit packet attachment status.",
    audience: "solar sales teams, permit coordinators, and installers assembling equipment documents",
    checklist: ["Exact inverter model", "Electrical ratings", "Disconnect and mounting notes", "Current cut sheet and listing documents"],
    steps: ["Record the selected inverter.", "Attach the current manufacturer document.", "Flag missing ratings or accessories.", "Route for designer and permit review."],
    packetQuality: ["Keep model numbers consistent across drawings and forms.", "Record document revision dates.", "Separate equipment facts from code conclusions."],
    reviewBoundary: ["SolarPermitPrepAI does not select, size, approve, or verify inverter compatibility.", "The responsible professional and AHJ determine design and compliance.", "A cut sheet is supporting documentation, not an approval."],
    missingItemTriggers: ["Model number differs across files", "Cut sheet revision is missing", "Disconnect or accessory scope is unclear", "Utility or AHJ document impact is unknown"],
    faq: [["Can this check inverter compliance?", "No. It identifies missing intake information for qualified review."], ["Should obsolete cut sheets stay in the active packet?", "Archive them separately and label the current document clearly."]],
  },
  {
    slug: "solar-pv-module-data-sheet-checklist",
    title: "Solar PV Module Data Sheet Checklist",
    description: "Organize PV module model, electrical ratings, dimensions, mounting context, and current data-sheet notes before plan-set work.",
    audience: "solar coordinators collecting module documentation for residential permit preparation",
    checklist: ["Exact module model", "Electrical ratings", "Dimensions and weight", "Current manufacturer data sheet"],
    steps: ["Record the proposed module model.", "Collect the current data sheet.", "Flag missing dimensions or ratings.", "Send the package to the responsible designer."],
    packetQuality: ["Use one consistent model number.", "Keep module count and layout assumptions separate from verified design.", "Record document dates and source."],
    reviewBoundary: ["SolarPermitPrepAI does not design arrays, calculate electrical values, or approve module compatibility.", "A qualified designer or engineer must verify the actual project.", "Do not treat this checklist as a permit drawing."],
    missingItemTriggers: ["Module model is unknown", "Data sheet is outdated or incomplete", "Array count is not confirmed", "Mounting or structural impacts are unresolved"],
    faq: [["Can this calculate the array?", "No. It prepares documentation notes only."], ["Do module dimensions replace roof layout review?", "No. Roof layout and structural review remain separate professional tasks."]],
  },
  {
    slug: "solar-ground-mount-permit-intake",
    title: "Solar Ground Mount Permit Intake",
    description: "Prepare ground-mount solar permit intake notes for site location, foundation questions, setbacks, access, fencing, and utility scope.",
    audience: "homeowners and solar teams preparing a ground-mount PV project for professional review",
    checklist: ["Ground-mount location", "Foundation and soil questions", "Setbacks and access", "Fencing and equipment scope"],
    steps: ["Describe the proposed location.", "Collect site photos and measurements.", "Separate known facts from open foundation questions.", "Route the intake to the responsible designer or engineer."],
    packetQuality: ["Mark whether dimensions are measured or estimated.", "Keep property, zoning, fire, and structural questions visible.", "Record utility and equipment scope separately."],
    reviewBoundary: ["SolarPermitPrepAI does not design foundations, verify soil, interpret zoning, or approve ground-mount suitability.", "A qualified engineer, contractor, AHJ, and utility determine requirements.", "Do not use intake notes as construction authorization."],
    missingItemTriggers: ["Site location or dimensions are uncertain", "Foundation or soil information is missing", "Access and setback requirements are unclear", "Equipment and fencing scope is incomplete"],
    faq: [["Can this determine if a ground mount is permitted?", "No. It organizes questions for local and professional review."], ["Are site photos useful?", "Yes, but photos do not replace measurements or engineering review."]],
  },
  {
    slug: "solar-carport-pv-permit-notes",
    title: "Solar Carport PV Permit Notes",
    description: "Organize solar carport permit notes for structure scope, parking layout, equipment, drainage, access, and separate electrical review.",
    audience: "solar teams and property owners preparing carport PV information for designers and permitting professionals",
    checklist: ["Carport structure scope", "Parking and access layout", "PV equipment notes", "Drainage and electrical questions"],
    steps: ["Describe the existing or proposed structure.", "Collect site and parking notes.", "Separate structural and electrical questions.", "Route the handoff for qualified review."],
    packetQuality: ["Identify whether the structure is new or existing.", "Keep parking, access, drainage, and equipment assumptions explicit.", "Track which discipline owns each open question."],
    reviewBoundary: ["SolarPermitPrepAI does not design carports, calculate structural loads, or approve electrical systems.", "Licensed professionals and the AHJ determine structural, fire, zoning, and electrical requirements.", "The output is an intake handoff only."],
    missingItemTriggers: ["Structure ownership or scope is unclear", "Parking and access impacts are not documented", "Structural documents are missing", "Electrical equipment scope is incomplete"],
    faq: [["Does this replace structural design?", "No. It helps organize questions before structural and electrical design."], ["Can an existing carport be assumed adequate?", "No. Existing conditions require qualified verification."]],
  },
  {
    slug: "solar-roof-replacement-pv-coordination",
    title: "Solar Roof Replacement Coordination Notes",
    description: "Prepare coordination notes for solar removal, roof replacement, reinstall scope, equipment status, photos, and permit-team handoff.",
    audience: "homeowners, roofers, solar installers, and coordinators managing roof work with PV equipment",
    checklist: ["Removal and reinstall scope", "Roof work schedule", "PV equipment condition", "Permit and inspection dependencies"],
    steps: ["Record who owns each scope.", "Separate roof work from PV work.", "Collect current equipment and site notes.", "Route permit and inspection questions to the responsible team."],
    packetQuality: ["Record dates as planning targets, not guarantees.", "Keep removal, storage, replacement, and reinstall steps distinct.", "Track permit, utility, and inspection dependencies separately."],
    reviewBoundary: ["SolarPermitPrepAI does not design roof work, approve removal methods, or guarantee reinstallation or inspection outcomes.", "Roofing and solar professionals must coordinate the actual work.", "Do not treat the notes as a construction sequence or permit approval."],
    missingItemTriggers: ["Scope owner is unclear", "Equipment condition is not documented", "Roof and PV schedules conflict", "Permit or inspection dependency is unknown"],
    faq: [["Can this tell me whether panels can be reused?", "No. The installer and responsible professionals must inspect equipment and decide."], ["Should roof work and PV work be separate scopes?", "Yes. Clear ownership reduces missed handoff items."]],
  },
  {
    slug: "solar-utility-interconnection-document-checklist",
    title: "Solar Utility Interconnection Document Checklist",
    description: "Organize utility interconnection document notes for account details, equipment, one-line references, signatures, and separate permit milestones.",
    audience: "solar coordinators and homeowners preparing utility handoff information",
    checklist: ["Utility account and service notes", "Equipment references", "Required forms and signatures", "Permit and utility milestone separation"],
    steps: ["Inventory current utility requirements.", "Record known project and account facts.", "Flag missing forms or signatures.", "Route the package to the authorized utility submitter."],
    packetQuality: ["Use the utility's current checklist.", "Keep permit, interconnection, inspection, and permission-to-operate milestones separate.", "Do not place credentials or payment details in the brief."],
    reviewBoundary: ["SolarPermitPrepAI does not submit utility applications, interpret tariffs, or guarantee interconnection or permission to operate.", "The utility and responsible permit team determine current requirements.", "Use the checklist as a handoff aid only."],
    missingItemTriggers: ["Utility checklist is outdated", "Account or service facts are missing", "Signature owner is unclear", "Permit and utility milestones are mixed together"],
    faq: [["Is utility approval the same as permit approval?", "No. Track utility, AHJ permit, inspection, and permission-to-operate milestones separately."], ["Can the tool submit the application?", "No. An authorized submitter must use the official utility channel."]],
  },
  {
    slug: "solar-homeowner-permit-quote-checklist",
    title: "Solar Homeowner Permit Quote Checklist",
    description: "Prepare homeowner-facing permit quote notes with project scope, site facts, missing documents, professional review needs, and next-step questions.",
    audience: "homeowners and solar sales teams preparing a clear permit-prep quote conversation",
    checklist: ["Project scope", "Property and service facts", "Missing documents", "Quote assumptions and exclusions"],
    steps: ["Describe the project in plain language.", "List known site and equipment facts.", "Flag missing information.", "Ask the responsible provider to confirm scope and pricing."],
    packetQuality: ["Separate intake assumptions from confirmed design.", "List what the quote includes and excludes.", "Record who handles engineering, permitting, utility, and inspection work."],
    reviewBoundary: ["SolarPermitPrepAI does not provide a binding quote, engineering design, permit approval, or contractor recommendation.", "Qualified providers must confirm scope, pricing, licensing, and local requirements.", "Use the notes to improve the next conversation."],
    missingItemTriggers: ["Project scope is vague", "Site facts are unverified", "Professional owner for each task is unclear", "Quote exclusions are missing"],
    faq: [["Is this a contractor quote?", "No. It organizes questions for a contractor or permit provider to answer."], ["Can it compare providers?", "No. It helps you prepare comparable scope questions."]],
  },
  {
    slug: "solar-permit-expiration-renewal-notes",
    title: "Solar Permit Expiration Renewal Notes",
    description: "Organize solar permit expiration or renewal notes with permit dates, plan versions, inspection status, AHJ questions, and responsible owners.",
    audience: "permit coordinators, installers, and homeowners handling an aging or expiring solar permit",
    checklist: ["Permit number and dates", "Current plan-set version", "Inspection status", "AHJ and owner questions"],
    steps: ["Record the permit timeline.", "Compare the approved plan version to current files.", "List completed and open inspections.", "Ask the AHJ or responsible permit team about renewal steps."],
    packetQuality: ["Use official permit records for dates.", "Separate renewal questions from technical design changes.", "Keep a named owner for every next step."],
    reviewBoundary: ["SolarPermitPrepAI does not interpret AHJ renewal rules, extend permits, or guarantee reactivation.", "The AHJ and responsible permit team determine expiration and renewal requirements.", "Do not rely on generated notes as official status."],
    missingItemTriggers: ["Permit number or expiration date is unknown", "Approved plan version is unclear", "Inspection record is incomplete", "AHJ renewal process is not confirmed"],
    faq: [["Can this renew an expired permit?", "No. It organizes information for the authorized permit team to confirm with the AHJ."], ["Should the approved plan set be preserved?", "Yes. Keep it separate from draft or revised plan files."]],
  },
  {
    slug: "solar-field-change-handoff-checklist",
    title: "Solar Field Change Handoff Checklist",
    description: "Prepare a solar field-change handoff with marked-up photos, installed equipment notes, plan differences, punch-list items, and professional review routing.",
    audience: "installers, field supervisors, permit coordinators, and operations teams documenting project changes",
    checklist: ["Marked-up site photos", "Installed equipment notes", "Plan-versus-field differences", "Open punch-list and reviewer owner"],
    steps: ["Record the field change clearly.", "Attach dated photos and notes.", "Separate minor observations from design-impacting changes.", "Route the handoff to the responsible professional."],
    packetQuality: ["Use dates and exact locations.", "Keep approved plans and field notes separate.", "Make unresolved changes visible instead of silently editing the record."],
    reviewBoundary: ["SolarPermitPrepAI does not validate as-built accuracy, approve construction changes, or determine inspection readiness.", "The responsible contractor, designer, engineer, electrician, AHJ, and utility determine next steps.", "Use this as documentation intake only."],
    missingItemTriggers: ["Change location is unclear", "Photos are undated or incomplete", "Plan impact is unknown", "Reviewer owner is not assigned"],
    faq: [["Can this create as-built drawings?", "No. It prepares a field-change handoff for the responsible professional."], ["Should every change be documented?", "Document changes that could affect design, permit, utility, inspection, or future service."]],
  },
  {
    slug: "solar-pool-equipment-clearance-notes",
    title: "Solar Pool Equipment Clearance Notes",
    description: "Organize solar permit notes when pool equipment, pumps, heaters, clearances, or service access may affect equipment placement or inspection routing.",
    audience: "solar coordinators and installers documenting site constraints near pool equipment",
    checklist: ["Pool equipment location", "Clearance and access photos", "Proposed solar equipment placement", "Reviewer and installer questions"],
    steps: ["Capture photos of pool equipment and nearby walls.", "Mark proposed solar equipment locations.", "Separate access questions from design decisions.", "Route the handoff to the responsible installer or designer."],
    packetQuality: ["Use dated photos and clear location notes.", "Keep pool equipment, electrical equipment, and working-space assumptions separate.", "Flag anything that may affect access, labels, or inspection walk paths."],
    reviewBoundary: ["SolarPermitPrepAI does not determine equipment clearance, code compliance, or inspection acceptance.", "A qualified installer, electrician, AHJ, and applicable trade professionals must verify requirements.", "Do not move or place equipment based only on generated notes."],
    missingItemTriggers: ["Pool equipment photos are missing", "Proposed equipment location is unclear", "Service access or working-space assumptions are unresolved", "AHJ or inspection requirements are unknown"],
    faq: [["Can this approve equipment placement near pool equipment?", "No. It only organizes photos and questions for qualified review."], ["Should pool equipment be included in site photos?", "Yes, when it may affect access, electrical routing, or inspection context."]],
  },
  {
    slug: "solar-generator-interlock-permit-notes",
    title: "Solar Generator Interlock Permit Notes",
    description: "Prepare intake notes when an existing generator, transfer switch, or interlock may affect a residential solar permit review.",
    audience: "solar teams and homeowners documenting backup-power context before professional review",
    checklist: ["Generator or transfer equipment", "Panel and interlock photos", "Battery or backup scope", "Open electrical-review questions"],
    steps: ["Record existing backup equipment.", "Attach panel and transfer-device photos.", "Separate known facts from assumptions.", "Route the packet to the responsible electrician or designer."],
    packetQuality: ["Use exact equipment labels when available.", "Keep generator, solar, battery, and interconnection notes clearly separated.", "Flag any existing backup equipment before plan-set work begins."],
    reviewBoundary: ["SolarPermitPrepAI does not approve generator interlocks, transfer equipment, backup design, or electrical code compliance.", "A qualified electrician, designer, AHJ, and utility must determine acceptable configurations.", "Do not treat intake notes as wiring or operating instructions."],
    missingItemTriggers: ["Generator or transfer equipment model is unknown", "Panel photos are unclear", "Backup operating mode is not documented", "Qualified reviewer has not been assigned"],
    faq: [["Can this decide if solar works with a generator?", "No. It gathers context for a qualified professional to review."], ["Should existing backup equipment be disclosed early?", "Yes. It can materially affect design, permitting, and inspection questions."]],
  },
  {
    slug: "solar-skylight-vent-obstruction-checklist",
    title: "Solar Skylight and Vent Obstruction Checklist",
    description: "Collect roof obstruction notes for skylights, vents, chimneys, pipes, and roof features before solar layout and permit review.",
    audience: "site surveyors, sales teams, and permit coordinators preparing roof-layout handoffs",
    checklist: ["Skylights and vents", "Chimneys and pipes", "Roof feature photos", "Array and setback questions"],
    steps: ["Photograph all roof obstructions.", "Mark their approximate locations.", "Flag layout questions.", "Route to the designer or installer for verification."],
    packetQuality: ["Use multiple roof photos and a simple sketch when possible.", "Do not hide obstructions that may affect module placement or setbacks.", "Label unknown distances as approximate."],
    reviewBoundary: ["SolarPermitPrepAI does not determine final array layout, fire setbacks, roof access, or structural suitability.", "A qualified designer, installer, and AHJ must verify layout and local rules.", "Do not submit obstruction notes as construction drawings."],
    missingItemTriggers: ["Obstruction photos are incomplete", "Roof plane or distance estimates are unclear", "Setback rules have not been confirmed", "Array layout has not been reviewed"],
    faq: [["Can this place modules around vents?", "No. It organizes obstruction notes for layout review."], ["Should small vents be photographed?", "Yes. Even small obstructions can affect layout, access, and inspection questions."]],
  },
  {
    slug: "solar-attic-access-photo-checklist",
    title: "Solar Attic Access Photo Checklist",
    description: "Prepare attic access and framing photo notes that may be requested during solar structural or site-survey intake.",
    audience: "solar coordinators and field teams collecting supplemental photos for professional review",
    checklist: ["Attic access location", "Framing photos", "Roof plane context", "Structural-review routing notes"],
    steps: ["Record whether attic access is available.", "Capture safe, clear photos only when appropriate.", "Label roof plane context.", "Route photos to the responsible structural reviewer."],
    packetQuality: ["Do not take unsafe photos or enter restricted spaces.", "Label every photo with location and date.", "Keep structural observations separate from conclusions."],
    reviewBoundary: ["SolarPermitPrepAI does not inspect attics, verify framing, calculate loads, or approve structural conditions.", "Qualified professionals must determine what photos are needed and what they mean.", "Follow safety rules and property access limits."],
    missingItemTriggers: ["Attic access status is unknown", "Framing photos are missing or unsafe to capture", "Roof plane context is unclear", "Structural reviewer requirements are not known"],
    faq: [["Does this tell me whether attic photos are required?", "No. It helps organize requests from the responsible reviewer."], ["Should anyone enter an unsafe attic?", "No. Safety and qualified access come first."]],
  },
  {
    slug: "solar-tile-roof-hook-cut-sheet-checklist",
    title: "Solar Tile Roof Hook Cut Sheet Checklist",
    description: "Organize tile-roof mounting, hook, flashing, roof type, and cut-sheet notes before solar permit packet review.",
    audience: "solar installers and permit coordinators preparing tile-roof mounting documentation",
    checklist: ["Tile roof type", "Mounting or hook model", "Flashing notes", "Current cut sheets"],
    steps: ["Record roof and mounting assumptions.", "Attach current product documents.", "Flag unknown attachment details.", "Route to the responsible designer or installer."],
    packetQuality: ["Use exact mounting product names where available.", "Separate roof type observations from approved attachment design.", "Keep current cut sheets clearly labeled."],
    reviewBoundary: ["SolarPermitPrepAI does not design attachments, verify roof suitability, or approve mounting systems.", "A qualified installer, engineer, manufacturer guidance, and AHJ determine requirements.", "Do not treat cut-sheet notes as installation instructions."],
    missingItemTriggers: ["Roof tile type is unknown", "Mounting model is missing", "Flashing or attachment detail is unclear", "Structural or manufacturer review is required"],
    faq: [["Can this select the right roof hook?", "No. It organizes documentation for qualified review."], ["Should the cut sheet match the exact product?", "Yes. Exact and current documents reduce permit-review confusion."]],
  },
  {
    slug: "solar-flat-roof-ballast-permit-intake",
    title: "Solar Flat Roof Ballast Permit Intake",
    description: "Prepare flat-roof solar permit intake notes for ballast assumptions, roof membrane, drainage, wind exposure, attachments, and structural review routing.",
    audience: "solar teams documenting flat-roof PV projects before design and permit review",
    checklist: ["Roof membrane and condition", "Ballast or attachment assumptions", "Drainage and access notes", "Structural-review questions"],
    steps: ["Capture roof photos and membrane context.", "Record proposed racking approach as an assumption.", "Flag drainage and access questions.", "Route to qualified design and structural review."],
    packetQuality: ["Separate measured facts from design assumptions.", "Keep drainage, parapet, access, and roof-condition notes visible.", "Track which professional owns structural or wind-load review."],
    reviewBoundary: ["SolarPermitPrepAI does not calculate ballast, wind loads, structural capacity, or roof suitability.", "Qualified designers, engineers, installers, manufacturers, and AHJs determine requirements.", "Do not use intake notes as installation or permit approval."],
    missingItemTriggers: ["Roof membrane or condition is unclear", "Ballast assumptions are not verified", "Drainage or access constraints are undocumented", "Structural reviewer has not been assigned"],
    faq: [["Can this calculate ballast?", "No. It organizes intake notes for professional review."], ["Should roof condition photos be included?", "Yes, when they are safely collected and relevant to the review."]],
  },
  {
    slug: "solar-breaker-space-photo-checklist",
    title: "Solar Breaker Space Photo Checklist",
    description: "Collect breaker-space photos, panel labels, circuit notes, and missing electrical details before solar permit or plan-set review.",
    audience: "field teams and permit coordinators documenting service-panel conditions",
    checklist: ["Breaker area photo", "Panel label photo", "Known breaker spaces", "Electrical-review questions"],
    steps: ["Capture clear panel and breaker photos.", "Record known labels without guessing.", "Flag unknown spaces or circuits.", "Route to a qualified electrical reviewer."],
    packetQuality: ["Use clear photos with the panel cover and labels visible when safe and allowed.", "Mark unknown circuits as unknown.", "Keep homeowner notes separate from verified electrical facts."],
    reviewBoundary: ["SolarPermitPrepAI does not determine breaker capacity, busbar limits, load calculations, or interconnection compliance.", "Qualified electricians, designers, AHJs, and utilities must verify electrical conditions.", "Do not use photo notes as wiring guidance."],
    missingItemTriggers: ["Breaker photos are unclear", "Panel label is missing", "Circuit labels are unreliable", "Electrical reviewer has not confirmed available capacity"],
    faq: [["Can this tell if there is room for a solar breaker?", "No. It prepares photos and questions for qualified review."], ["Should circuit labels be trusted?", "Treat labels as context only until a qualified person verifies them."]],
  },
  {
    slug: "solar-monitoring-gateway-permit-notes",
    title: "Solar Monitoring Gateway Permit Notes",
    description: "Organize monitoring gateway, communications, internet, data, and equipment notes that may need to be tracked alongside solar project handoff.",
    audience: "solar operations teams and homeowners documenting monitoring hardware and commissioning context",
    checklist: ["Monitoring gateway model", "Network or communication notes", "Equipment location", "Commissioning owner"],
    steps: ["Record monitoring equipment assumptions.", "Keep network details out of public notes.", "Track owner for commissioning.", "Route open questions to the installer or support team."],
    packetQuality: ["Do not include Wi-Fi passwords or private credentials.", "Separate monitoring notes from permit approval claims.", "Record who is responsible for post-install setup."],
    reviewBoundary: ["SolarPermitPrepAI does not configure monitoring, connect accounts, troubleshoot networks, or guarantee commissioning success.", "The installer, manufacturer, and account owner handle setup and support.", "Keep credentials out of generated text."],
    missingItemTriggers: ["Gateway model is unknown", "Network owner is unclear", "Equipment location is missing", "Commissioning responsibility has not been assigned"],
    faq: [["Does this connect the monitoring account?", "No. It only organizes non-sensitive handoff notes."], ["Should passwords be included?", "No. Never put credentials in generated notes or shared packets."]],
  },
  {
    slug: "solar-inspection-correction-note-checklist",
    title: "Solar Inspection Correction Note Checklist",
    description: "Prepare solar inspection correction notes with inspector comments, photos, plan references, responsible owner, and professional review routing.",
    audience: "installers, field teams, and permit coordinators responding to inspection comments",
    checklist: ["Inspector correction text", "Photo evidence", "Affected plan references", "Responsible owner and deadline"],
    steps: ["Copy the correction exactly.", "Attach dated photos.", "Assign each item to the responsible trade or reviewer.", "Route the response through the official process."],
    packetQuality: ["Preserve inspector wording without paraphrasing away details.", "Separate completed fixes from proposed responses.", "Track who verifies each correction before resubmission or reinspection."],
    reviewBoundary: ["SolarPermitPrepAI does not interpret code, approve fixes, or guarantee reinspection approval.", "The responsible contractor, electrician, designer, AHJ, and inspector determine acceptable corrections.", "Do not submit generated notes without qualified review."],
    missingItemTriggers: ["Inspector comment is incomplete", "Photos are missing", "Owner for the correction is unclear", "Official response path is not confirmed"],
    faq: [["Can this answer an inspection correction?", "No. It organizes the correction packet for qualified review and official response."], ["Should inspector wording be copied exactly?", "Yes. Keep the original correction text visible."]],
  },
  {
    slug: "solar-permission-to-operate-handoff",
    title: "Solar Permission to Operate Handoff",
    description: "Organize permission-to-operate handoff notes for final inspection, utility milestones, interconnection status, customer communications, and next-step ownership.",
    audience: "solar operations teams and homeowners tracking post-install utility and activation milestones",
    checklist: ["Final inspection status", "Utility application status", "Meter or PTO milestone", "Customer communication owner"],
    steps: ["Separate AHJ inspection from utility milestones.", "Record current status and open items.", "Assign owner for customer updates.", "Use official utility channels for PTO follow-up."],
    packetQuality: ["Keep permit, inspection, interconnection, and PTO milestones separate.", "Avoid promising activation dates.", "Document who communicates with the customer and utility."],
    reviewBoundary: ["SolarPermitPrepAI does not submit utility documents, grant permission to operate, activate systems, or guarantee PTO timing.", "The AHJ, utility, installer, and authorized submitter determine next steps.", "Use the handoff as a status organizer only."],
    missingItemTriggers: ["Final inspection status is unclear", "Utility application status is missing", "Meter or interconnection milestone is unknown", "Customer communication owner is not assigned"],
    faq: [["Can this grant PTO?", "No. Only the utility or authorized process can confirm permission to operate."], ["Should PTO be treated separately from permit approval?", "Yes. Permit, inspection, interconnection, and PTO are separate milestones."]],
  },
  {
    slug: "solar-property-address-parcel-intake-checklist",
    title: "Solar Property Address and Parcel Intake Checklist",
    description: "Organize site address, parcel identifier, owner-provided records, jurisdiction clues, and location questions before solar permit packet review.",
    audience: "homeowners and permit coordinators reconciling project location records",
    checklist: ["Site address as shown on owner records", "Parcel or assessor identifier if available", "Owner-provided jurisdiction records", "Location mismatch questions"],
    steps: ["Copy the address from a reliable owner record.", "Record the parcel identifier without guessing.", "Flag conflicting jurisdiction details.", "Ask the AHJ or qualified submitter to confirm official values."],
    packetQuality: ["Keep mailing and installation addresses distinct.", "Preserve the source of each identifier.", "Do not treat third-party lookup results as official confirmation."],
    reviewBoundary: ["SolarPermitPrepAI does not verify ownership, parcel boundaries, zoning, jurisdiction, or legal property records.", "The owner, assessor, surveyor, AHJ, and authorized submitter confirm official property data.", "Do not submit unverified identifiers."],
    missingItemTriggers: ["Installation address conflicts across records", "Parcel identifier is missing", "Jurisdiction is uncertain", "Owner record source is not documented"],
    faq: [["Can this verify a parcel number?", "No. It records owner-provided information for official confirmation."], ["Does this determine the correct AHJ?", "No. Confirm jurisdiction through official channels."]],
  },
  {
    slug: "solar-roof-material-condition-photo-notes",
    title: "Solar Roof Material and Condition Photo Notes",
    description: "Prepare labeled roof material and condition photos for solar design and permit intake without making structural or installation judgments.",
    audience: "site survey teams and homeowners preparing roof context for qualified reviewers",
    checklist: ["Wide roof photos", "Material close-ups", "Visible repair or wear notes", "Photo date and viewpoint"],
    steps: ["Capture wide and close views safely.", "Label viewpoints and visible materials.", "Record observed damage without diagnosing it.", "Route concerns to the contractor or qualified professional."],
    packetQuality: ["Use dated, readable photos.", "Do not crop out visible roof context.", "Separate observed conditions from professional conclusions."],
    reviewBoundary: ["SolarPermitPrepAI does not assess roof condition, remaining life, structural capacity, waterproofing, or installation suitability.", "A qualified roofer, contractor, engineer, and AHJ determine acceptable conditions.", "Do not climb or access unsafe areas for photos."],
    missingItemTriggers: ["Roof material is unclear", "Photos omit affected areas", "Visible damage has no reviewer assigned", "Photo date or viewpoint is missing"],
    faq: [["Can this say whether a roof is solar-ready?", "No. It only organizes photos and observed-condition notes."], ["Should damaged areas be photographed?", "Only when they can be captured safely; qualified reviewers decide next steps."]],
  },
  {
    slug: "solar-equipment-nameplate-photo-checklist",
    title: "Solar Equipment Nameplate Photo Checklist",
    description: "Collect readable equipment nameplate photos and model references for solar permit packet intake and professional compatibility review.",
    audience: "field teams and permit coordinators matching installed or proposed equipment records",
    checklist: ["Full equipment view", "Readable nameplate photo", "Manufacturer and model text", "Location and date label"],
    steps: ["Photograph the equipment context.", "Capture the complete nameplate without glare.", "Transcribe identifiers exactly.", "Ask the designer or electrician to verify equipment use."],
    packetQuality: ["Do not infer unreadable characters.", "Keep serial numbers private when not required.", "Match photos to the correct equipment location."],
    reviewBoundary: ["SolarPermitPrepAI does not verify ratings, listings, compatibility, electrical design, or code compliance.", "The manufacturer, electrician, designer, AHJ, and utility determine acceptable equipment.", "Do not expose credentials or unnecessary serial data."],
    missingItemTriggers: ["Nameplate is unreadable", "Model transcription is uncertain", "Equipment location is not labeled", "Qualified compatibility review is unassigned"],
    faq: [["Can this confirm equipment compatibility?", "No. It organizes nameplate evidence for qualified review."], ["Should serial numbers be shared?", "Only when the official process requires them and the recipient is authorized."]],
  },
  {
    slug: "solar-site-plan-dimension-source-checklist",
    title: "Solar Site Plan Dimension Source Checklist",
    description: "Track where site plan dimensions came from, which values are field-measured, and which distances still require qualified verification.",
    audience: "permit coordinators and design teams receiving survey or homeowner measurements",
    checklist: ["Dimension label", "Measurement source", "Date and person recorded", "Verification status"],
    steps: ["List each dimension used in the intake packet.", "Record its source.", "Mark approximate or owner-provided values.", "Route final verification to the qualified designer or surveyor."],
    packetQuality: ["Never present estimates as surveyed values.", "Keep units consistent and visible.", "Record discrepancies instead of silently choosing a number."],
    reviewBoundary: ["SolarPermitPrepAI does not survey property, measure setbacks, establish boundaries, or validate dimensions.", "A qualified surveyor, designer, contractor, and AHJ determine required accuracy.", "Generated notes are not a site plan or survey."],
    missingItemTriggers: ["Dimension source is unknown", "Units are missing", "Conflicting measurements exist", "Required professional verification is incomplete"],
    faq: [["Does this create a surveyed site plan?", "No. It tracks dimension sources for professional review."], ["Can homeowner measurements be included?", "Yes, when clearly labeled as owner-provided and unverified."]],
  },
  {
    slug: "solar-conduit-trench-route-photo-log",
    title: "Solar Conduit and Trench Route Photo Log",
    description: "Organize route photos, landmarks, dates, open questions, and responsible reviewers for proposed or completed solar conduit and trench work.",
    audience: "field teams and coordinators documenting route context for qualified trades",
    checklist: ["Wide route photos", "Start and end landmarks", "Date and project phase", "Open routing questions"],
    steps: ["Photograph the route context safely.", "Label start, end, and direction.", "Separate proposed from completed conditions.", "Route technical questions to qualified trades and the AHJ."],
    packetQuality: ["Do not expose private access or security details publicly.", "Keep proposed and as-built photos separate.", "Use landmarks without claiming exact underground locations."],
    reviewBoundary: ["SolarPermitPrepAI does not design conduit routes, locate utilities, determine trench depth, inspect work, or approve code compliance.", "Qualified contractors, utility locating services, designers, inspectors, and the AHJ control those decisions.", "Do not excavate based on generated notes."],
    missingItemTriggers: ["Route direction is unclear", "Project phase is not labeled", "Utility locate status is unknown", "Technical reviewer is not assigned"],
    faq: [["Can this determine trench depth?", "No. It only organizes photo evidence and routing questions."], ["Does the log replace utility locating?", "No. Use authorized locating services and qualified professionals."]],
  },
  {
    slug: "solar-permit-fee-payment-handoff-checklist",
    title: "Solar Permit Fee Payment Handoff Checklist",
    description: "Prepare a non-sensitive handoff for official solar permit fee notices, payer responsibility, receipt storage, and status tracking.",
    audience: "homeowners and permit coordinators tracking official fee milestones",
    checklist: ["Official fee notice source", "Amount and due date as displayed", "Authorized payer", "Receipt and status location"],
    steps: ["Save the official notice.", "Confirm who is authorized to pay.", "Use the official portal or office.", "Store a redacted receipt and update status."],
    packetQuality: ["Do not place card or bank details in the handoff.", "Distinguish estimates from official fees.", "Record payment status only from an official receipt."],
    reviewBoundary: ["SolarPermitPrepAI does not calculate fees, access portals, make payments, issue refunds, or guarantee application processing.", "The AHJ, authorized payer, and official payment channel control fees and receipts.", "Never enter payment credentials into generated text."],
    missingItemTriggers: ["Fee notice source is unofficial", "Authorized payer is unclear", "Due date is missing", "Official receipt has not been confirmed"],
    faq: [["Can this pay a permit fee?", "No. It only organizes the handoff; payment requires an authorized person using an official channel."], ["Does a payment receipt mean approval?", "No. Payment and permit approval are separate statuses."]],
  },
  {
    slug: "solar-revision-cover-sheet-checklist",
    title: "Solar Revision Cover Sheet Checklist",
    description: "Organize revision number, changed sheets, reviewer comments, response owners, and resubmission status for a solar permit packet.",
    audience: "design and permit teams preparing a qualified revision handoff",
    checklist: ["Revision number and date", "Changed sheet list", "Comment references", "Response owner and status"],
    steps: ["Assign a clear revision identifier.", "List changed sheets without rewriting technical content.", "Link each change to its review comment.", "Obtain qualified approval before resubmission."],
    packetQuality: ["Do not mix superseded and current sheets.", "Keep reviewer wording visible.", "Separate drafted responses from approved responses."],
    reviewBoundary: ["SolarPermitPrepAI does not decide technical revisions, seal plans, sign responses, upload files, or guarantee acceptance.", "The designer, engineer, contractor, AHJ, and authorized submitter approve and submit revisions.", "The checklist is administrative only."],
    missingItemTriggers: ["Revision identifier is missing", "Changed sheets are not listed", "Comment-to-change mapping is unclear", "Authorized approval is incomplete"],
    faq: [["Can this approve a revision response?", "No. Qualified reviewers and the official process control approval."], ["Should superseded sheets remain in the packet?", "Keep them archived separately, not mixed into the current submission set."]],
  },
  {
    slug: "solar-contractor-license-document-handoff",
    title: "Solar Contractor License Document Handoff",
    description: "Organize contractor-provided license, insurance, contact, expiration, and verification-source fields for official permit intake review.",
    audience: "permit coordinators collecting contractor documents required by an AHJ",
    checklist: ["Contractor-provided license record", "Insurance document if requested", "Expiration dates as displayed", "Official verification owner"],
    steps: ["Collect documents from the authorized contractor.", "Record displayed identifiers exactly.", "Flag expiration or mismatch questions.", "Verify through the required official channel."],
    packetQuality: ["Do not alter contractor documents.", "Do not publish private policy or license data.", "Keep verification evidence separate from assumptions."],
    reviewBoundary: ["SolarPermitPrepAI does not verify licensure, insurance coverage, identity, standing, scope, or legal sufficiency.", "The contractor, insurer, licensing authority, AHJ, and authorized reviewer confirm validity.", "Do not treat document presence as verification."],
    missingItemTriggers: ["Required contractor record is missing", "Displayed expiration date has passed or is unclear", "Names do not match", "Official verification has not been assigned"],
    faq: [["Can this verify a contractor license?", "No. Use the official licensing authority and AHJ process."], ["Does an insurance document prove current coverage?", "No. An authorized reviewer or insurer must confirm coverage."]],
  },
  {
    slug: "solar-plan-review-comment-tracker",
    title: "Solar Plan Review Comment Tracker",
    description: "Track solar plan review comments, exact source wording, responsible owner, affected sheets, response status, and official resolution evidence.",
    audience: "permit teams coordinating comments across designers, contractors, and reviewers",
    checklist: ["Exact comment text", "Comment source and date", "Affected sheets", "Owner, response, and status"],
    steps: ["Copy each comment exactly.", "Assign an owner without interpreting the answer.", "Link proposed changes and response drafts.", "Record closure only from official evidence."],
    packetQuality: ["Preserve comment numbering.", "Do not mark items resolved based on an internal draft.", "Keep technical answers attributed to qualified reviewers."],
    reviewBoundary: ["SolarPermitPrepAI does not interpret code, answer technical comments, approve responses, or determine resolution.", "Qualified professionals and the AHJ control technical responses and closure.", "The tracker is an administrative coordination aid."],
    missingItemTriggers: ["Comment source is missing", "Owner is unassigned", "Affected sheet is unclear", "Official closure evidence is absent"],
    faq: [["Can this answer plan review comments?", "No. It tracks comments and routes them to qualified reviewers."], ["When should a comment be marked closed?", "Only when the official reviewer or process provides closure evidence."]],
  },
  {
    slug: "solar-final-document-owner-handoff",
    title: "Solar Final Document Owner Handoff",
    description: "Prepare a private closeout index for approved plans, inspection records, utility notices, warranties, contacts, and future document ownership.",
    audience: "homeowners and solar operations teams organizing final project records",
    checklist: ["Final approved document list", "Inspection and utility records", "Warranty and support contacts", "Private storage owner"],
    steps: ["Separate final documents from drafts.", "Label each record by source and date.", "Assign a private storage owner.", "Record where future corrections or support requests belong."],
    packetQuality: ["Do not publish customer or property records.", "Keep credentials out of the archive.", "Do not label a draft as approved without official evidence."],
    reviewBoundary: ["SolarPermitPrepAI does not confirm project completion, approval, warranty coverage, system performance, or record retention law.", "The AHJ, utility, installer, manufacturer, owner, and qualified advisers confirm final status and retention needs.", "This handoff is a private file index only."],
    missingItemTriggers: ["Final and draft files are mixed", "Official source or date is missing", "Private storage owner is unassigned", "Support contact is unclear"],
    faq: [["Does this prove the project is complete?", "No. It indexes records; official sources determine final status."], ["Should account credentials be archived?", "No. Keep credentials in an appropriate secure system, not in generated notes."]],
  },
  {
    slug: "solar-ahj-contact-record-checklist",
    title: "Solar AHJ Contact Record Checklist",
    description: "Organize AHJ contact names, public office channels, case references, dates, and unanswered administrative questions for permit follow-up.",
    audience: "permit coordinators tracking official contact history without relying on memory",
    checklist: ["Official AHJ office channel", "Case or permit reference", "Date and contact note", "Open question owner"],
    steps: ["Use public or official contact channels.", "Record dates and reference numbers exactly.", "Separate confirmed answers from assumptions.", "Route technical or code questions to qualified reviewers."],
    packetQuality: ["Do not store private staff phone numbers unless authorized.", "Do not paraphrase official requirements as final if wording is uncertain.", "Keep contact notes tied to a source and date."],
    reviewBoundary: ["SolarPermitPrepAI does not interpret AHJ policy, provide code advice, submit requests, or guarantee office response.", "The AHJ and authorized permit owner control official communication.", "The checklist is an administrative log only."],
    missingItemTriggers: ["Official channel is missing", "Case reference is unclear", "Source date is absent", "Technical question has no qualified owner"],
    faq: [["Can this contact the AHJ?", "No. It organizes notes for a person to use."], ["Does an informal answer prove approval?", "No. Official written process controls permit status."]],
  },
  {
    slug: "solar-approved-plan-storage-handoff",
    title: "Solar Approved Plan Storage Handoff",
    description: "Prepare a private storage handoff for approved plan sets, stamped sheets, revision history, inspection notes, and access owners.",
    audience: "homeowners and installers preserving approved plan records after permit review",
    checklist: ["Approved plan set source", "Revision and approval date", "Private storage location", "Access owner"],
    steps: ["Separate approved plans from drafts.", "Label every file by source and date.", "Assign a private storage owner.", "Keep credentials and customer data out of the index."],
    packetQuality: ["Do not relabel drafts as approved.", "Do not publish property records.", "Keep superseded revisions archived separately."],
    reviewBoundary: ["SolarPermitPrepAI does not verify approval, stamps, record retention law, or plan accuracy.", "The AHJ, engineer, installer, and owner confirm approved status and storage requirements.", "This is a file organization aid only."],
    missingItemTriggers: ["Approval source is missing", "Revision date is unclear", "Drafts and approved plans are mixed", "Storage owner is unassigned"],
    faq: [["Does this prove a plan is approved?", "No. Official evidence determines approval."], ["Should passwords be stored here?", "No."]],
  },
  {
    slug: "solar-inspection-appointment-handoff",
    title: "Solar Inspection Appointment Handoff",
    description: "Organize inspection appointment date, access window, responsible party, site contact, documents, and rescheduling notes.",
    audience: "solar project teams coordinating inspection logistics",
    checklist: ["Inspection appointment source", "Access window and site contact", "Responsible party", "Required documents list"],
    steps: ["Record the official appointment source.", "Confirm access and responsible person.", "Prepare documents without changing technical content.", "Reschedule only through authorized channels."],
    packetQuality: ["Do not promise inspector arrival times beyond official notice.", "Do not include gate codes or credentials in generated text.", "Keep inspection result status separate from appointment status."],
    reviewBoundary: ["SolarPermitPrepAI does not schedule inspections, access portals, determine readiness, or guarantee approval.", "The AHJ, inspector, contractor, and property owner control scheduling and readiness.", "The handoff is logistics only."],
    missingItemTriggers: ["Appointment source is missing", "Access contact is unclear", "Required documents are unknown", "Responsible party is unassigned"],
    faq: [["Can this schedule an inspection?", "No. Use the official channel."], ["Does an appointment mean the project is ready?", "No. Qualified review controls readiness."]],
  },
  {
    slug: "solar-neighbor-notice-document-checklist",
    title: "Solar Neighbor Notice Document Checklist",
    description: "Prepare neighbor notice document notes for address, required template, delivery evidence, deadline, and privacy-safe storage.",
    audience: "permit teams handling administrative neighbor notice requirements where applicable",
    checklist: ["Required notice template", "Affected address list source", "Delivery deadline", "Proof of delivery record"],
    steps: ["Confirm whether a notice is required through official sources.", "Use the approved template without legal interpretation.", "Record delivery evidence privately.", "Submit or mail only through authorized people."],
    packetQuality: ["Do not invent notice requirements.", "Do not publish neighbor personal data.", "Keep delivery evidence tied to dates and source rules."],
    reviewBoundary: ["SolarPermitPrepAI does not provide legal notice advice, determine affected parties, mail notices, or prove compliance.", "The AHJ, owner, contractor, and qualified advisers control notice requirements.", "This checklist is administrative only."],
    missingItemTriggers: ["Requirement source is missing", "Address list source is unclear", "Delivery evidence is absent", "Deadline has not been confirmed"],
    faq: [["Is this legal notice advice?", "No."], ["Can it mail notices?", "No."]],
  },
  {
    slug: "solar-utility-bill-name-match-checklist",
    title: "Solar Utility Bill Name Match Checklist",
    description: "Check utility bill name, service address, meter number, account holder notes, and mismatch questions for interconnection handoff.",
    audience: "solar coordinators preparing utility documents before qualified review",
    checklist: ["Utility bill account name", "Service address", "Meter number", "Mismatch question owner"],
    steps: ["Use a current utility bill or official source.", "Record displayed values exactly.", "Flag name or address mismatches.", "Ask the utility or authorized owner before changing records."],
    packetQuality: ["Do not alter bills or account records.", "Do not include full account numbers unless required and approved.", "Keep mismatch notes separate from corrections."],
    reviewBoundary: ["SolarPermitPrepAI does not access utility accounts, change account names, verify identity, submit applications, or interpret tariff rules.", "The utility, account holder, installer, and authorized submitter control account records.", "The checklist is a handoff aid only."],
    missingItemTriggers: ["Utility bill is outdated", "Service address mismatch", "Meter number unclear", "Authorized account holder is not identified"],
    faq: [["Can this change a utility account?", "No."], ["Does a name match guarantee interconnection approval?", "No."]],
  },
  {
    slug: "solar-permit-email-thread-index",
    title: "Solar Permit Email Thread Index",
    description: "Create a private index of permit email threads with sender, date, subject, attachment list, open question, and owner.",
    audience: "teams cleaning up scattered permit correspondence",
    checklist: ["Thread subject and date", "Sender and recipient role", "Attachment summary", "Open question owner"],
    steps: ["Collect relevant permit emails.", "Index subjects and attachments without exposing secrets.", "Separate official responses from internal discussion.", "Assign owners for unanswered questions."],
    packetQuality: ["Do not paste private credentials, payment data, or unnecessary personal details.", "Do not treat internal guesses as AHJ answers.", "Keep attachments linked to source emails."],
    reviewBoundary: ["SolarPermitPrepAI does not read inboxes, send emails, interpret official requirements, or decide response strategy.", "Authorized team members and qualified reviewers control email handling.", "The index is a private organization aid."],
    missingItemTriggers: ["Thread source is missing", "Attachment list is incomplete", "Official versus internal answer is unclear", "Open question has no owner"],
    faq: [["Can this access my email?", "No."], ["Can it send replies?", "No."]],
  },
  {
    slug: "solar-manufacturer-warranty-document-handoff",
    title: "Solar Manufacturer Warranty Document Handoff",
    description: "Organize manufacturer warranty documents, model numbers, registration notes, installer contacts, and future support ownership.",
    audience: "homeowners and solar teams preserving warranty records after installation",
    checklist: ["Warranty document source", "Model and serial reference", "Registration status note", "Support contact owner"],
    steps: ["Collect manufacturer-provided documents.", "Match model references without editing records.", "Record registration questions.", "Use manufacturer or installer channels for warranty claims."],
    packetQuality: ["Do not alter warranty documents.", "Do not claim coverage from a file name alone.", "Keep serial numbers private where appropriate."],
    reviewBoundary: ["SolarPermitPrepAI does not verify warranty coverage, register products, file claims, or provide legal advice.", "The manufacturer, installer, owner, and qualified advisers confirm warranty rights and support paths.", "The handoff is a document index only."],
    missingItemTriggers: ["Warranty source is missing", "Model reference mismatch", "Registration status unknown", "Support owner is unclear"],
    faq: [["Does this prove warranty coverage?", "No. The manufacturer or qualified reviewer confirms coverage."], ["Can it file warranty claims?", "No."]],
  },
  {
    slug: "solar-change-order-permit-impact-notes",
    title: "Solar Change Order Permit Impact Notes",
    description: "Track proposed change order notes, affected documents, responsible reviewer, permit impact questions, and approval status.",
    audience: "teams coordinating project changes before resubmission or qualified review",
    checklist: ["Proposed change summary", "Affected document list", "Reviewer owner", "Permit impact question"],
    steps: ["Record the proposed change without approving it.", "List affected plans, equipment, or schedules.", "Assign qualified review.", "Update permit documents only after authorization."],
    packetQuality: ["Do not mix proposed changes with approved scope.", "Do not edit technical documents without an owner.", "Keep client, contractor, and AHJ approvals distinct."],
    reviewBoundary: ["SolarPermitPrepAI does not determine permit impact, approve change orders, revise designs, or provide contract advice.", "Qualified professionals, contractors, owners, and the AHJ determine impact and approval.", "The notes are administrative only."],
    missingItemTriggers: ["Change summary is vague", "Affected documents are unknown", "Qualified reviewer missing", "Approval status unclear"],
    faq: [["Can this approve a change order?", "No."], ["Does every change require permit revision?", "Ask the AHJ or qualified reviewer."]],
  },
  {
    slug: "solar-roof-access-pathway-photo-log",
    title: "Solar Roof Access Pathway Photo Log",
    description: "Prepare a roof access pathway photo log with photo source, location notes, date, visibility limits, and reviewer questions.",
    audience: "solar teams collecting site photos for qualified pathway review",
    checklist: ["Photo date and source", "Roof plane or area note", "Visible obstruction notes", "Reviewer question list"],
    steps: ["Collect photos from authorized site access.", "Label location and date.", "Flag poor visibility or missing angles.", "Route layout decisions to qualified reviewers."],
    packetQuality: ["Do not mark pathways code-compliant from photos alone.", "Do not publish property photos.", "Keep access notes private."],
    reviewBoundary: ["SolarPermitPrepAI does not determine roof access compliance, fire setbacks, array layout, or construction authorization.", "The AHJ, designer, contractor, and qualified reviewers determine pathway requirements.", "The photo log is evidence organization only."],
    missingItemTriggers: ["Photo date is missing", "Roof area is unlabeled", "Obstruction visibility is poor", "Qualified reviewer is unassigned"],
    faq: [["Can photos prove access compliance?", "No. Qualified review and AHJ requirements control compliance."], ["Can this design the pathway?", "No."]],
  },
  {
    slug: "solar-closeout-support-contact-sheet",
    title: "Solar Closeout Support Contact Sheet",
    description: "Prepare a closeout support contact sheet for installer, utility, AHJ, manufacturer, monitoring, warranty, and document owners.",
    audience: "homeowners and operations teams organizing who to contact after project closeout",
    checklist: ["Installer support contact", "Utility and AHJ references", "Manufacturer support links", "Document owner"],
    steps: ["Collect public or approved support channels.", "Label each contact by issue type.", "Avoid storing passwords or private account data.", "Review contact accuracy before sharing."],
    packetQuality: ["Do not list private personal numbers without permission.", "Do not mix emergency and routine support paths.", "Keep credentials out of the sheet."],
    reviewBoundary: ["SolarPermitPrepAI does not provide warranty, performance, utility, emergency, legal, or repair advice.", "The installer, utility, AHJ, manufacturer, owner, and qualified advisers control support outcomes.", "The sheet is a routing aid only."],
    missingItemTriggers: ["Support owner missing", "Issue type unclear", "Private contact not approved", "Document owner not assigned"],
    faq: [["Can this resolve support issues?", "No. It only organizes contacts."], ["Should monitoring passwords be included?", "No."]],
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
        <a class="secondary" href="${fallbackReviewUrl}">PayPal fallback</a>
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
        <article class="panel seo-card">
          <h2>When the $49 packet prep is worth it</h2>
          <p>Pay only after the free precheck has an address, AHJ, project scope, equipment notes, first document list, and a qualified reviewer who can make the official decisions. The $49 review is useful for missing-item, document-owner, field-verification, reviewer-question, and quote-handoff structure. Skip payment if you need an engineering design, PE stamp, permit submission, portal login, fee payment, utility or AHJ contact, code interpretation, licensure verification, inspection readiness, construction authorization, safety advice, or guaranteed approval, interconnection, inspection, schedule, quote, payment, ranking, traffic, sales, or revenue.</p>
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
