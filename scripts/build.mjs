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
