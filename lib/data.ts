// Data types
export interface Team {
  id: string
  name: string
  description: string
}

export interface Role {
  id: string
  name: string
  teamId: string
  description: string
}

export interface Tool {
  id: string
  name: string
  description: string
  category: string
}

export interface Artifact {
  id: string
  name: string
  type: "document" | "sheet" | "folder" | "system"
  description: string
}

export type NodeType = "action" | "decision" | "artifact" | "qa" | "escalation"

export interface FlowNode {
  id: string
  flowId: string
  type: NodeType
  title: string
  description: string
  ownerRoleIds: string[]
  toolIds: string[]
  artifactIds: string[]
  sla?: string
  outputs?: string[]
  kbArticleId?: string
  tags: string[]
  x?: number
  y?: number
}

export interface Edge {
  id: string
  source: string
  target: string
  label?: string
}

export interface Flow {
  id: string
  title: string
  description: string
  teamId: string
  nodes: FlowNode[]
  edges: Edge[]
  tags: string[]
}

export interface KBArticle {
  id: string
  title: string
  teamId: string
  flowId?: string
  relatedNodeIds: string[]
  tags: string[]
  triggers?: string[]
  inputs?: string[]
  steps: string[]
  outputs?: string[]
  templates?: Array<{
    id: string
    name: string
    recipientType: 'client' | 'influencer' | 'both'
    nameAr: string
    contentEn: string
    contentAr: string
  }>
  dos: string[]
  donts: string[]
  escalationRules?: string[]
  qaChecklist?: string[]
  sla?: string
  content?: string
}

export interface AppData {
  teams: Team[]
  roles: Role[]
  tools: Tool[]
  artifacts: Artifact[]
  flows: Flow[]
  kbArticles: KBArticle[]
}

// TEAMS
const teams: Team[] = [
  {
    id: "team-onboarding",
    name: "Onboarding Team",
    description: "Responsible for contacting and adding influencers to the dashboard",
  },
  {
    id: "team-lead-gen",
    name: "Lead Generation Team",
    description:
      "Responsible for contacting brands and managing sales in each country",
  },
  {
    id: "team-coordination",
    name: "Coordination Team",
    description: "Manages campaigns from start to finish, ensuring smooth workflow",
  },
  {
    id: "team-chat",
    name: "Chat Team",
    description: "Manages WhatsApp communication and provides support",
  },
  {
    id: "team-coverage",
    name: "Coverage Team",
    description: "Monitors and documents influencer coverage for campaigns",
  },
  {
    id: "team-performance",
    name: "Performance Team",
    description: "Monitors staff performance and ensures tasks are on track",
  },
]

// ROLES
const roles: Role[] = [
  {
    id: "role-onboarding-agent",
    name: "Onboarding Agent",
    teamId: "team-onboarding",
    description: "Adds influencers and manages influencer data",
  },
  {
    id: "role-lead-agent",
    name: "Lead Generation Agent",
    teamId: "team-lead-gen",
    description: "Contacts brands and manages sales pipeline",
  },
  {
    id: "role-coordinator",
    name: "Campaign Coordinator",
    teamId: "team-coordination",
    description: "Coordinates campaigns and manages all operational details",
  },
  {
    id: "role-chat-agent",
    name: "Chat Support Agent",
    teamId: "team-chat",
    description: "Handles WhatsApp communication with influencers",
  },
  {
    id: "role-coverage-agent",
    name: "Coverage Auditor",
    teamId: "team-coverage",
    description: "Monitors and verifies influencer coverage",
  },
  {
    id: "role-performance-lead",
    name: "Performance Lead",
    teamId: "team-performance",
    description: "Tracks performance metrics and escalates issues",
  },
]

// TOOLS
const tools: Tool[] = [
  {
    id: "tool-dashboard",
    name: "GC Dashboard",
    description: "Main platform for campaign management and influencer lists",
    category: "Platform",
  },
  {
    id: "tool-pcloud",
    name: "PCloud",
    description: "Cloud storage for campaign files and coverage documentation",
    category: "Storage",
  },
  {
    id: "tool-dropbox",
    name: "Dropbox",
    description: "File storage and organization for campaign materials",
    category: "Storage",
  },
  {
    id: "tool-whatsapp",
    name: "WhatsApp",
    description: "Primary communication channel with influencers and teams",
    category: "Communication",
  },
  {
    id: "tool-google-sheets",
    name: "Google Sheets",
    description: "Spreadsheets for campaign tracking and communication",
    category: "Spreadsheet",
  },
  {
    id: "tool-system",
    name: "Coverage System",
    description: "Internal system for uploading and tracking coverage",
    category: "System",
  },
]

// ARTIFACTS
const artifacts: Artifact[] = [
  {
    id: "artifact-booking-order",
    name: "Booking Order",
    type: "document",
    description: "Campaign details including target, dates, and deliverables",
  },
  {
    id: "artifact-influencer-list",
    name: "Influencer Lists",
    type: "sheet",
    description: "Lists of influencers exported from dashboard",
  },
  {
    id: "artifact-brief",
    name: "Campaign Brief",
    type: "document",
    description:
      "Detailed instructions for influencers about what to share and mention",
  },
  {
    id: "artifact-confirmation-sheet",
    name: "Confirmation Sheet",
    type: "sheet",
    description: "Tracks confirmations, coverage, and status updates",
  },
  {
    id: "artifact-reminder-sheet",
    name: "Reminder Sheet",
    type: "sheet",
    description: "Daily reminders for influencer visits and tasks",
  },
  {
    id: "artifact-google-sheet",
    name: "Google Sheet",
    type: "sheet",
    description: "Client communication sheet with updates and confirmations",
  },
  {
    id: "artifact-campaign-folder",
    name: "Campaign Folder",
    type: "folder",
    description: "PCloud folder with campaign files and coverage documentation",
  },
  {
    id: "artifact-coverage-system",
    name: "Coverage System",
    type: "system",
    description: "System for uploading and verifying campaign coverage",
  },
]

// FLOWS
const flows: Flow[] = [
  {
    id: "flow-coordination",
    title: "Campaign Coordination Flow",
    description:
      "Complete workflow for coordinating campaigns from setup to delivery",
    teamId: "team-coordination",
    tags: ["campaign", "coordination", "core-process"],
    nodes: [
      {
        id: "coord-1",
        flowId: "flow-coordination",
        type: "action",
        title: "Receive New Campaign",
        description: "Receive campaign brief from brand in Whatsapp",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-whatsapp"],
        artifactIds: [],
        tags: ["initiation"],
        outputs: ["Campaign details noted"],
      },
      {
        id: "coord-2",
        flowId: "flow-coordination",
        type: "action",
        title: "Create Booking Order",
        description:
          "Create booking order with campaign name, target, dates, gift, and talking points",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-dashboard", "tool-pcloud"],
        artifactIds: ["artifact-booking-order"],
        sla: "Same day",
        kbArticleId: "kb-booking-order",
        tags: ["documentation"],
      },
      {
        id: "coord-3",
        flowId: "flow-coordination",
        type: "action",
        title: "Create Campaign Folders",
        description: "Create folder structure in Dropbox and PCloud",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-dropbox", "tool-pcloud"],
        artifactIds: ["artifact-campaign-folder"],
        tags: ["organization"],
      },
      {
        id: "coord-4",
        flowId: "flow-coordination",
        type: "action",
        title: "Download Influencer List",
        description: "Download influencer list from dashboard",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-dashboard"],
        artifactIds: ["artifact-influencer-list"],
        tags: ["data-management"],
      },
      {
        id: "coord-5",
        flowId: "flow-coordination",
        type: "action",
        title: "Create Brief Document",
        description:
          "Create brief with campaign details, talking points, and deliverables",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-google-sheets"],
        artifactIds: ["artifact-brief"],
        sla: "Same day",
        kbArticleId: "kb-brief-creation",
        tags: ["documentation"],
      },
      {
        id: "coord-6",
        flowId: "flow-coordination",
        type: "action",
        title: "Create Invitations",
        description: "Send invitations (REM1 & REM2) to influencers",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-whatsapp"],
        artifactIds: [],
        sla: "2 hours",
        kbArticleId: "kb-reminders",
        tags: ["communication"],
      },
      {
        id: "coord-7",
        flowId: "flow-coordination",
        type: "action",
        title: "Create Audit List",
        description: "Create audit list for campaign coverage verification",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-google-sheets"],
        artifactIds: ["artifact-confirmation-sheet"],
        tags: ["qa"],
      },
      {
        id: "coord-8",
        flowId: "flow-coordination",
        type: "action",
        title: "Update Confirmation Sheet",
        description: "Track confirmations and coverage in sheet",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-google-sheets"],
        artifactIds: ["artifact-confirmation-sheet"],
        tags: ["tracking"],
      },
      {
        id: "coord-9",
        flowId: "flow-coordination",
        type: "decision",
        title: "All Targets Met?",
        description: "Check if campaign reached all target influencers",
        ownerRoleIds: ["role-coordinator"],
        toolIds: [],
        artifactIds: [],
        outputs: ["Yes - Campaign complete", "No - Continue outreach"],
        tags: ["checkpoint"],
      },
      {
        id: "coord-10",
        flowId: "flow-coordination",
        type: "action",
        title: "Send Scanner Link to Client",
        description: "Send link for client to track coverage and visits",
        ownerRoleIds: ["role-coordinator"],
        toolIds: ["tool-system"],
        artifactIds: [],
        tags: ["client-delivery"],
      },
    ],
    edges: [
      { id: "e1", source: "coord-1", target: "coord-2" },
      { id: "e2", source: "coord-2", target: "coord-3" },
      { id: "e3", source: "coord-3", target: "coord-4" },
      { id: "e4", source: "coord-4", target: "coord-5" },
      { id: "e5", source: "coord-5", target: "coord-6" },
      { id: "e6", source: "coord-6", target: "coord-7" },
      { id: "e7", source: "coord-7", target: "coord-8" },
      { id: "e8", source: "coord-8", target: "coord-9" },
      { id: "e9", source: "coord-9", target: "coord-10", label: "Yes" },
      { id: "e10", source: "coord-9", target: "coord-6", label: "No" },
    ],
  },

  {
    id: "flow-coverage",
    title: "Coverage Verification Flow",
    description:
      "Workflow for monitoring and documenting influencer coverage for campaigns",
    teamId: "team-coverage",
    tags: ["coverage", "verification", "qa"],
    nodes: [
      {
        id: "cov-1",
        flowId: "flow-coverage",
        type: "action",
        title: "Check Influencer Posts",
        description:
          "Monitor influencer social media accounts (Instagram, Facebook, TikTok, Snapchat)",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: [],
        artifactIds: [],
        tags: ["monitoring"],
      },
      {
        id: "cov-2",
        flowId: "flow-coverage",
        type: "decision",
        title: "Post Mentions Brand?",
        description: "Verify post mentions the brand (required)",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: [],
        artifactIds: [],
        outputs: ["Yes - Continue", "No - Reject"],
        tags: ["qa-check"],
      },
      {
        id: "cov-3",
        flowId: "flow-coverage",
        type: "decision",
        title: "Matches Brief?",
        description: "Verify coverage matches brief requirements",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: ["tool-google-sheets"],
        artifactIds: ["artifact-brief"],
        outputs: ["Matches - Done", "Doesn't match - Need confirmation"],
        tags: ["qa-check"],
      },
      {
        id: "cov-4",
        flowId: "flow-coverage",
        type: "action",
        title: "Screenshot Profile",
        description: "Take screenshot of influencer profile showing post",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: [],
        artifactIds: [],
        tags: ["documentation"],
      },
      {
        id: "cov-5",
        flowId: "flow-coverage",
        type: "action",
        title: "Upload to PCloud",
        description:
          "Upload coverage to PCloud in organized folder structure (Platform/Influencer folder)",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: ["tool-pcloud"],
        artifactIds: ["artifact-campaign-folder"],
        sla: "2 hours after post",
        kbArticleId: "kb-pcloud-upload",
        tags: ["storage"],
      },
      {
        id: "cov-6",
        flowId: "flow-coverage",
        type: "action",
        title: "Enter in Coverage System",
        description: "Upload coverage details to coverage system",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: ["tool-system"],
        artifactIds: ["artifact-coverage-system"],
        tags: ["tracking"],
      },
      {
        id: "cov-7",
        flowId: "flow-coverage",
        type: "action",
        title: "Update Confirmation Sheet",
        description: "Mark coverage as complete in sheet",
        ownerRoleIds: ["role-coverage-agent"],
        toolIds: ["tool-google-sheets"],
        artifactIds: ["artifact-confirmation-sheet"],
        tags: ["tracking"],
      },
    ],
    edges: [
      { id: "e1", source: "cov-1", target: "cov-2" },
      { id: "e2", source: "cov-2", target: "cov-3", label: "Yes" },
      { id: "e3", source: "cov-2", target: "cov-7", label: "No" },
      { id: "e4", source: "cov-3", target: "cov-4", label: "Matches" },
      { id: "e5", source: "cov-3", target: "cov-7", label: "No match" },
      { id: "e6", source: "cov-4", target: "cov-5" },
      { id: "e7", source: "cov-5", target: "cov-6" },
      { id: "e8", source: "cov-6", target: "cov-7" },
    ],
  },

  {
    id: "flow-chat",
    title: "Chat Support Flow",
    description: "Workflow for providing WhatsApp support to influencers",
    teamId: "team-chat",
    tags: ["communication", "support"],
    nodes: [
      {
        id: "chat-1",
        flowId: "flow-chat",
        type: "action",
        title: "Receive Message",
        description: "Receive WhatsApp message from influencer",
        ownerRoleIds: ["role-chat-agent"],
        toolIds: ["tool-whatsapp"],
        artifactIds: [],
        tags: ["communication"],
      },
      {
        id: "chat-2",
        flowId: "flow-chat",
        type: "decision",
        title: "Query Type?",
        description: "Determine the type of inquiry",
        ownerRoleIds: ["role-chat-agent"],
        toolIds: [],
        artifactIds: [],
        outputs: ["Coverage issue", "Campaign details", "Payment", "Other"],
        tags: ["triage"],
      },
      {
        id: "chat-3",
        flowId: "flow-chat",
        type: "action",
        title: "Provide Campaign Details",
        description: "Send brief, talking points, and location to influencer",
        ownerRoleIds: ["role-chat-agent"],
        toolIds: ["tool-whatsapp"],
        artifactIds: ["artifact-brief"],
        tags: ["information"],
      },
      {
        id: "chat-4",
        flowId: "flow-chat",
        type: "action",
        title: "Escalate to Coordinator",
        description: "Send issue to coordination team for resolution",
        ownerRoleIds: ["role-chat-agent"],
        toolIds: ["tool-whatsapp"],
        artifactIds: [],
        tags: ["escalation"],
      },
    ],
    edges: [
      { id: "e1", source: "chat-1", target: "chat-2" },
      { id: "e2", source: "chat-2", target: "chat-3", label: "Campaign details" },
      { id: "e3", source: "chat-2", target: "chat-4", label: "Other" },
    ],
  },
]

// KNOWLEDGE BASE ARTICLES
const kbArticles: KBArticle[] = [
  {
    id: "kb-booking-order",
    title: "Creating a Booking Order",
    teamId: "team-coordination",
    flowId: "flow-coordination",
    relatedNodeIds: ["coord-2"],
    tags: ["coordination", "campaign-setup"],
    triggers: ["New campaign received"],
    inputs: ["Campaign brief", "Target influencer count", "Campaign dates", "Gift details"],
    steps: [
      "Go to Active Campaigns in dashboard",
      "Click New Campaign or select existing campaign",
      "Name the campaign: [Brand] - [Campaign Type] - [Country] - [Month] - [Year]",
      "Fill in campaign information tab with: campaign type, target, visit dates, gift details",
      "Create invitation template with campaign name, branch, date, time, gift",
      "Add brief with key talking points influencers must mention",
      "Create booking plan distributed across the campaign dates",
    ],
    outputs: ["Booking order created", "Campaign folders created", "Brief ready"],
    templates: [],
    dos: [
      "Use consistent naming convention for all campaigns",
      "Include all brand mention requirements in brief",
      "Set realistic influencer targets",
      "Plan visits across the campaign timeline",
      "Review brief for completeness before sending",
    ],
    donts: [
      "Don't create booking orders without approved brief",
      "Don't forget to mention the brand name is mandatory",
      "Don't overlap visit dates for same influencer",
      "Don't include payment details in brief",
    ],
    sla: "Complete within same day of campaign receipt",
  },

  {
    id: "kb-reminders",
    title: "Sending Reminders (REM1 & REM2)",
    teamId: "team-coordination",
    flowId: "flow-coordination",
    relatedNodeIds: ["coord-6"],
    tags: ["communication", "outreach"],
    triggers: ["Campaign ready for influencer outreach"],
    steps: [
      "Prepare invitation list with confirmed influencers",
      "REM1: Send initial invitation with campaign details and brief",
      "REM2: Send follow-up reminder after 24 hours if no response",
      "Include visit date, time, location, and gift in messages",
      "Use professional and friendly tone in all communications",
      "Monitor responses and track confirmations in sheet",
      "Document any declines or issues",
    ],
    outputs: ["Invitations sent", "Confirmations tracked", "Issue list identified"],
    templates: [
      {
        id: "tpl-rem1-influencer",
        name: "REM1 - Initial Invitation to Influencer",
        nameAr: "الرسالة الأولى - دعوة أولية للمؤثر",
        recipientType: "influencer",
        contentEn:
          "Hi [Influencer Name],\n\nWe're excited to invite you to participate in an exclusive [Campaign Name] campaign with [Brand Name]!\n\nCampaign Details:\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Location: [Location]\n🎁 Gift: [Gift Description]\n\nWe believe your audience will love this experience. Please find the complete brief with all details here: [Brief Link]\n\nPlease confirm your attendance at your earliest convenience.\n\nLooking forward to working with you!\n\nBest regards,\n[Your Name]\n[Company Name]",
        contentAr:
          "مرحباً [اسم المؤثر],\n\nنحن متحمسون لدعوتك للمشاركة في حملة حصرية [اسم الحملة] مع [اسم الماركة]!\n\nتفاصيل الحملة:\n📅 التاريخ: [التاريخ]\n⏰ الوقت: [الوقت]\n📍 المكان: [المكان]\n🎁 الهدية: [وصف الهدية]\n\nنعتقد أن جمهورك سيحب هذه التجربة. يرجى العثور على الملخص الكامل مع جميع التفاصيل هنا: [رابط الملخص]\n\nيرجى تأكيد حضورك في أسرع وقت ممكن.\n\nنتطلع للعمل معك!\n\nأطيب التحيات،\n[اسمك]\n[اسم الشركة]",
      },
      {
        id: "tpl-rem2-influencer",
        name: "REM2 - Follow-up Reminder to Influencer",
        nameAr: "الرسالة الثانية - تذكير متابعة للمؤثر",
        recipientType: "influencer",
        contentEn:
          "Hi [Influencer Name],\n\nJust following up on our previous invitation for the [Campaign Name] campaign.\n\nIf you're interested in joining this exclusive event, please confirm by [Deadline Date].\n\nQuick Reminder:\n📅 Date: [Date]\n⏰ Time: [Time]\n📍 Location: [Location]\n\nIf you have any questions or concerns, feel free to reach out. We'd love to have you on board!\n\nBest regards,\n[Your Name]\n[Company Name]",
        contentAr:
          "مرحباً [اسم المؤثر],\n\nنتابع دعوتنا السابقة لك للمشاركة في حملة [اسم الحملة].\n\nإذا كنت مهتماً بالانضمام إلى هذا الحدث الحصري، يرجى التأكيد بحلول [تاريخ الموعد النهائي].\n\nتذكير سريع:\n📅 التاريخ: [التاريخ]\n⏰ الوقت: [الوقت]\n📍 المكان: [المكان]\n\nإذا كان لديك أي أسئلة أو استفسارات، لا تتردد في التواصل معنا. نود أن نعمل معك!\n\nأطيب التحيات،\n[اسمك]\n[اسم الشركة]",
      },
    ],
    dos: [
      "Send REM1 at least 3-5 days before campaign date",
      "Send REM2 24 hours after REM1 if no response",
      "Always include campaign brief link",
      "Track confirmations in real-time",
      "Customize message with influencer and campaign details",
    ],
    donts: [
      "Don't send reminders without approved brief",
      "Don't use template without personalizing",
      "Don't exceed 2 reminder messages per influencer per campaign",
      "Don't forget to include date and location",
    ],
    sla: "Send REM1 within 2 hours of campaign approval",
  },

  {
    id: "kb-brief-creation",
    title: "Creating Campaign Brief",
    teamId: "team-coordination",
    flowId: "flow-coordination",
    relatedNodeIds: ["coord-5"],
    tags: ["documentation", "campaign-details"],
    triggers: ["Campaign approved by brand"],
    inputs: ["Brand requirements", "Campaign talking points", "Deliverables list"],
    steps: [
      "Open campaign brief template in Google Sheets",
      "Enter campaign name, brand, and date",
      "List all brand mentions (mandatory)",
      "Include key talking points influencer must cover",
      "Add campaign hashtags if any",
      "Specify deliverables: number of posts, stories, reels, etc.",
      "Add any visual requirements or guidelines",
      "Review with brand for approval",
      "Share link with influencers in reminder messages",
    ],
    outputs: ["Brief document created", "Brief shared with influencers"],
    templates: [
      {
        id: "tpl-brief-client",
        name: "Campaign Brief - Client Communication",
        nameAr: "ملخص الحملة - التواصل مع العميل",
        recipientType: "client",
        contentEn:
          "Dear [Client Name],\n\nPlease find below the complete brief for [Campaign Name]:\n\n📋 Campaign Overview\nCampaign Name: [Campaign Name]\nBrand: [Brand Name]\nCampaign Date: [Date]\nCampaign Location: [Location]\nBudget: [Budget Amount]\n\n🎯 Key Objectives\n[Objective 1]\n[Objective 2]\n[Objective 3]\n\n📢 Brand Mentions (Mandatory)\n[Mention 1]\n[Mention 2]\n[Mention 3]\n\n💬 Talking Points Influencers Must Cover\n[Point 1]\n[Point 2]\n[Point 3]\n\n📦 Required Deliverables\n[Deliverable 1]\n[Deliverable 2]\n[Deliverable 3]\n\n#️⃣ Campaign Hashtags\n[Hashtag 1] #[Hashtag 2]\n\nPlease confirm receipt and approval of this brief.\n\nBest regards,\n[Your Name]",
        contentAr:
          "السيد/السيدة [اسم العميل],\n\nيرجى العثور أدناه على الملخص الكامل لحملة [اسم الحملة]:\n\n📋 نظرة عامة على الحملة\nاسم الحملة: [اسم الحملة]\nالماركة: [اسم الماركة]\nتاريخ الحملة: [التاريخ]\nمكان الحملة: [المكان]\nالميزانية: [مبلغ الميزانية]\n\n🎯 الأهداف الرئيسية\n[الهدف 1]\n[الهدف 2]\n[الهدف 3]\n\n📢 ذكر الماركة (إلزامي)\n[ذكر 1]\n[ذكر 2]\n[ذكر 3]\n\n💬 نقاط حوارية يجب على المؤثرين تغطيتها\n[النقطة 1]\n[النقطة 2]\n[النقطة 3]\n\n📦 المسلمات المطلوبة\n[المسلم 1]\n[المسلم 2]\n[المسلم 3]\n\n#️⃣ هاشتاجات الحملة\n[الهاشتاج 1] #[الهاشتاج 2]\n\nيرجى تأكيد استقبالك واعتمادك لهذا الملخص.\n\nأطيب التحيات،\n[اسمك]",
      },
    ],
    dos: [
      "Always include brand name and what it does",
      "Be specific about talking points",
      "List deliverables clearly",
      "Use simple language",
      "Proofread before sharing",
    ],
    donts: [
      "Don't leave brief incomplete before sharing",
      "Don't forget mandatory brand mentions",
      "Don't make talking points too technical",
      "Don't change brief mid-campaign without notifying influencers",
    ],
    sla: "Complete within 4 hours of campaign booking",
  },

  {
    id: "kb-pcloud-upload",
    title: "Uploading Coverage to PCloud",
    teamId: "team-coverage",
    flowId: "flow-coverage",
    relatedNodeIds: ["cov-5"],
    tags: ["storage", "documentation", "coverage"],
    triggers: ["Coverage needs to be stored"],
    inputs: ["Screenshots of posts", "Influencer username", "Platform name"],
    steps: [
      "Navigate to PCloud > Operation-Head Office > Coverage-final > pCloud Active Campaigns",
      "Select your office location (UAE, EGY, KSA, KW)",
      "Open campaign folder",
      "Click on Coverage folder",
      "Create folder with influencer username (no spaces, exact dashboard format)",
      "Create subfolder with platform name (Instagram, Facebook, TikTok, Snapchat)",
      "Upload screenshots of posts showing brand mention and profile",
      "Include profile screenshot as proof influencer posted",
      "Ensure file naming is clear with date and platform",
    ],
    outputs: ["Coverage uploaded to PCloud", "File organized and documented"],
    dos: [
      "Use exact influencer username without spaces",
      "Include profile screenshot as proof",
      "Organize by platform in subfolders",
      "Upload within 2 hours of post",
      "Keep file names consistent and dated",
    ],
    donts: [
      "Don't modify influencer username",
      "Don't forget profile screenshot",
      "Don't mix platforms in single folder",
      "Don't delay uploads - do immediately after post",
    ],
    sla: "Upload within 2 hours of post publication",
  },

  {
    id: "kb-coverage-system",
    title: "Using the Coverage System",
    teamId: "team-coverage",
    flowId: "flow-coverage",
    relatedNodeIds: ["cov-6"],
    tags: ["system", "coverage-tracking"],
    triggers: ["Coverage uploaded and needs to be logged"],
    steps: [
      "Open coverage system",
      "Click Campaigns > Coverage",
      "Search for the campaign name",
      "Verify correct campaign details match booking order",
      "For each coverage, select the platform (Instagram, Facebook, TikTok, Snapchat)",
      "Upload the coverage file",
      "Update coverage status to Done or Need",
      "System counts total coverage automatically (Overall Cov)",
      "Done = All deliverables uploaded",
      "Need = Still missing items from brief",
      "Write notes about missing items if applicable",
    ],
    outputs: ["Coverage logged in system", "Campaign tracking updated"],
    dos: [
      "Verify campaign details before uploading",
      "Count coverage against brief requirements",
      "Update status accurately (Done/Need)",
      "Add notes for any issues or missing items",
      "Check Overall Cov count matches expected",
    ],
    donts: [
      "Don't upload coverage to wrong campaign",
      "Don't mark as Done if items are missing",
      "Don't forget to add notes for incomplete coverage",
    ],
    sla: "Log coverage in system same day as upload",
  },

  {
    id: "kb-list-management",
    title: "Influencer List Management",
    teamId: "team-coordination",
    flowId: "flow-coordination",
    relatedNodeIds: ["coord-4"],
    tags: ["data-management", "lists"],
    triggers: ["Need to create or modify influencer lists"],
    steps: [
      "Go to Brands > Accounts",
      "Search for brand name",
      "Click Wish Lists tab",
      "For new list: Click + to create group, name the group",
      "For merging lists: Select source group and use Merge Group option",
      "For importing: Use Import/Export feature, download sample",
      "Add influencer usernames exactly as they appear on dashboard",
      "Export list as CSV",
      "Clean up list in Dropbox sheet",
      "Create new folder with date for version tracking",
    ],
    outputs: ["Updated influencer list", "List ready for campaign"],
    templates: [],
    dos: [
      "Use exact influencer usernames",
      "Version control lists with dates",
      "Export and clean before using",
      "Maintain separate groups for different campaigns",
    ],
    donts: [
      "Don't modify usernames",
      "Don't mix different list versions",
      "Don't share lists without approval",
    ],
  },

  {
    id: "kb-brand-mention-requirement",
    title: "Brand Mention Requirements",
    teamId: "team-coverage",
    flowId: "flow-coverage",
    relatedNodeIds: ["cov-2"],
    tags: ["qa", "requirements", "coverage"],
    triggers: ["Verifying coverage"],
    steps: [
      "Check coverage post mentions brand name",
      "Verify brand mention is clear and visible",
      "Do not accept coverage without brand mention",
      "Brand mention is not optional - it is mandatory",
      "Coverage team tag is prohibited - only brand tag allowed",
    ],
    outputs: ["Coverage verified or rejected"],
    dos: [
      "Always check for brand mention first",
      "Brand must be tagged or mentioned in caption",
      "Accept only clear, visible mentions",
    ],
    donts: [
      "Don't accept posts without brand mention",
      "Don't allow TryGC tag - only brand tag",
      "Don't make exceptions for brand mention requirement",
    ],
  },

  {
    id: "kb-daily-checklist",
    title: "Daily Operations Checklist",
    teamId: "team-coordination",
    flowId: "flow-coordination",
    relatedNodeIds: [],
    tags: ["daily", "checklist", "operations"],
    steps: [
      "Check all campaigns for status: In Progress, Not Started, Completed",
      "Review influencer confirmations vs targets",
      "Verify all coverage uploaded to PCloud",
      "Check confirmation sheets updated",
      "Review chat messages for urgent issues",
      "Update client with daily progress",
      "Flag campaigns at risk of missing targets",
      "Coordinate with coverage team on outstanding coverage",
    ],
    dos: [
      "Complete daily by end of shift",
      "Update all sheets before handoff",
      "Flag issues immediately",
      "Communicate delays to client",
    ],
    donts: [
      "Don't skip status updates",
      "Don't leave coverage unuploaded",
      "Don't delay issue escalation",
    ],
    qaChecklist: [
      "All campaigns have booking orders",
      "All influencers have been contacted",
      "All confirmations tracked",
      "All coverage uploaded",
      "Client scanner link sent",
    ],
  },

  {
    id: "kb-common-issues",
    title: "Common Issues & Troubleshooting",
    teamId: "team-chat",
    flowId: "flow-chat",
    relatedNodeIds: [],
    tags: ["troubleshooting", "support"],
    steps: [
      "Influencer didn't receive brief: Resend link via WhatsApp",
      "Coverage doesn't match brief: Request re-post with required mentions",
      "Missing confirmations: Follow up with REM2 message",
      "Technical issues accessing system: Contact tech support in GC group",
      "Client wants changes mid-campaign: Notify coordinator immediately",
      "PCloud access issues: Verify correct folder permissions",
    ],
    dos: [
      "Respond to issues within 2 hours",
      "Document all issues and resolutions",
      "Escalate after 2 failed attempts",
      "Keep influencer informed of status",
    ],
    donts: [
      "Don't ignore messages without response",
      "Don't make promises without checking first",
      "Don't change campaign without client approval",
    ],
    escalationRules: [
      "If influencer unresponsive for 24 hours: escalate to coordinator",
      "If multiple coverage issues: escalate to performance team",
      "If client urgent request: notify senior immediately",
    ],
  },

  {
    id: "kb-communication-templates",
    title: "Communication Templates",
    teamId: "team-coordination",
    tags: ["communication", "templates", "client", "influencer"],
    triggers: ["Need to send campaign communication"],
    steps: [
      "Select appropriate template based on recipient (Client or Influencer)",
      "Choose language (English or Arabic)",
      "Customize with campaign and brand details",
      "Review before sending",
      "Send through appropriate channel",
    ],
    outputs: ["Professional communication sent"],
    templates: [
      {
        id: "tpl-campaign-confirmation-client",
        name: "Campaign Confirmation - Client",
        nameAr: "تأكيد الحملة - العميل",
        recipientType: "client",
        contentEn:
          "Dear [Client Name],\n\nWe're pleased to confirm that the [Campaign Name] campaign has been successfully set up and is ready to launch.\n\n✅ Campaign Status: CONFIRMED\n\n📊 Campaign Details:\n• Campaign Name: [Campaign Name]\n• Start Date: [Start Date]\n• End Date: [End Date]\n• Number of Influencers: [Number]\n• Total Reach: [Reach]\n• Expected Impressions: [Impressions]\n\n📋 Key Milestones:\n✓ Brief finalized and approved\n✓ Influencers identified and invited\n✓ Campaign tracking setup complete\n✓ PCloud folders organized\n\n💬 Next Steps:\nWe will begin outreach to influencers immediately and keep you updated on confirmations and campaign progress.\n\nPlease feel free to reach out if you have any questions or need modifications.\n\nBest regards,\n[Your Name]\nCampaign Team",
        contentAr:
          "السيد/السيدة [اسم العميل],\n\nيسعدنا أن نؤكد أن حملة [اسم الحملة] تم إعدادها بنجاح وهي جاهزة للإطلاق.\n\n✅ حالة الحملة: مؤكد\n\n📊 تفاصيل الحملة:\n• اسم الحملة: [اسم الحملة]\n• تاريخ البدء: [تاريخ البدء]\n• تاريخ الانتهاء: [تاريخ الانتهاء]\n• عدد المؤثرين: [العدد]\n• إجمالي الوصول: [الوصول]\n• الانطباعات المتوقعة: [الانطباعات]\n\n📋 المراحل الرئيسية:\n✓ تم الانتهاء من الملخص واعتماده\n✓ تم تحديد المؤثرين ودعوتهم\n✓ اكتمل إعداد تتبع الحملة\n✓ تم تنظيم مجلدات PCloud\n\n💬 الخطوات التالية:\nسنبدأ بالتواصل مع المؤثرين على الفور وسنبقيك على اطلاع بالتأكيدات وتقدم الحملة.\n\nلا تتردد في التواصل معنا إذا كان لديك أي أسئلة أو تحتاج إلى تعديلات.\n\nأطيب التحيات،\n[اسمك]\nفريق الحملة",
      },
      {
        id: "tpl-campaign-update-client",
        name: "Campaign Progress Update - Client",
        nameAr: "تحديث تقدم الحملة - العميل",
        recipientType: "client",
        contentEn:
          "Dear [Client Name],\n\nHere's your weekly update on the [Campaign Name] campaign:\n\n📊 Campaign Progress:\n• Confirmed Influencers: [Number] / [Total Invited]\n• Posts Published: [Number]\n• Total Reach: [Reach]\n• Total Impressions: [Impressions]\n• Engagement Rate: [Rate]\n\n📈 Performance Metrics:\n• Brand Mentions: [Number]\n• Hashtag Usage: [Number]\n• Click-through Rate: [Rate]\n\n👥 Top Performing Posts:\n1. [Influencer Name] - [Metrics]\n2. [Influencer Name] - [Metrics]\n3. [Influencer Name] - [Metrics]\n\n⚠️ Any Issues:\n[Issue 1 if any]\n[Issue 2 if any]\n\n📅 Next Week's Plan:\n[Plan details]\n\nPlease don't hesitate to contact us if you need any adjustments or have questions.\n\nBest regards,\n[Your Name]\nCampaign Team",
        contentAr:
          "السيد/السيدة [اسم العميل],\n\nإليك تحديثك الأسبوعي عن حملة [اسم الحملة]:\n\n📊 تقدم الحملة:\n• المؤثرون المؤكدون: [العدد] / [إجمالي المدعوين]\n• المنشورات المنشورة: [العدد]\n• إجمالي الوصول: [الوصول]\n• الانطباعات الإجمالية: [الانطباعات]\n• معدل التفاعل: [المعدل]\n\n📈 مقاييس الأداء:\n• ذكر الماركة: [العدد]\n• استخدام الهاشتاج: [العدد]\n• معدل النقر: [المعدل]\n\n👥 أفضل المنشورات أداءً:\n1. [اسم المؤثر] - [المقاييس]\n2. [اسم المؤثر] - [المقاييس]\n3. [اسم المؤثر] - [المقاييس]\n\n⚠️ أي مشاكل:\n[المشكلة 1 إن وجدت]\n[المشكلة 2 إن وجدت]\n\n📅 خطة الأسبوع القادم:\n[تفاصيل الخطة]\n\nلا تتردد في التواصل معنا إذا كنت تحتاج إلى أي تعديلات أو لديك أسئلة.\n\nأطيب التحيات،\n[اسمك]\nفريق الحملة",
      },
      {
        id: "tpl-post-confirmation-influencer",
        name: "Post Confirmation - Influencer",
        nameAr: "تأكيد المنشور - المؤثر",
        recipientType: "influencer",
        contentEn:
          "Hi [Influencer Name],\n\nThank you so much for your amazing post for [Brand Name]! 🎉\n\nWe've confirmed receipt of your post on [Platform] and it looks fantastic!\n\n✅ Post Verified:\n• Platform: [Platform]\n• Posted On: [Date]\n• Brand Mentions: ✓ Confirmed\n• Content Quality: ✓ Excellent\n\n📊 Early Metrics:\n• Likes: [Count]\n• Comments: [Count]\n• Shares: [Count]\n• Reach: [Count]\n\nYour content is resonating really well with your audience. Thanks for the great effort!\n\nIf you have any questions or need anything else, feel free to reach out.\n\nBest regards,\n[Your Name]\n[Company Name]",
        contentAr:
          "مرحباً [اسم المؤثر],\n\nشكراً لك على منشورك الرائع لـ [اسم الماركة]! 🎉\n\nلقد تأكدنا من استقبال منشورك على [المنصة] وهو يبدو رائعاً!\n\n✅ تم التحقق من المنشور:\n• المنصة: [المنصة]\n• تاريخ النشر: [التاريخ]\n• ذكر الماركة: ✓ مؤكد\n• جودة المحتوى: ✓ ممتاز\n\n📊 المقاييس الأولية:\n• الإعجابات: [العدد]\n• التعليقات: [العدد]\n• المشاركات: [العدد]\n• الوصول: [العدد]\n\nمحتواك يتفاعل بشكل رائع مع جمهورك. شكراً على الجهد الرائع!\n\nإذا كان لديك أي أسئلة أو احتجت إلى أي شيء آخر، لا تتردد في التواصل معنا.\n\nأطيب التحيات،\n[اسمك]\n[اسم الشركة]",
      },
      {
        id: "tpl-issue-escalation-client",
        name: "Issue Escalation - Client",
        nameAr: "تصعيد المشكلة - العميل",
        recipientType: "client",
        contentEn:
          "Dear [Client Name],\n\nWe want to inform you of an issue that occurred during the [Campaign Name] campaign that requires your attention.\n\n⚠️ Issue Summary:\nType: [Issue Type]\nInfluencer: [Influencer Name]\nDate Occurred: [Date]\nSeverity: [High/Medium/Low]\n\n📝 Issue Details:\n[Detailed description of the issue]\n\n✅ Actions Taken:\n• [Action 1]\n• [Action 2]\n• [Action 3]\n\n💡 Recommended Resolution:\n[Recommended next steps]\n\n📞 Next Steps:\nWe recommend [recommendation] to resolve this issue.\nPlease let us know your preferred course of action.\n\nWe sincerely apologize for this issue and are committed to resolving it quickly.\n\nBest regards,\n[Your Name]\nCampaign Team",
        contentAr:
          "السيد/السيدة [اسم العميل],\n\nنود أن نخبرك بمشكلة حدثت أثناء حملة [اسم الحملة] تتطلب انتباهك.\n\n⚠️ ملخص المشكلة:\nالنوع: [نوع المشكلة]\nالمؤثر: [اسم المؤثر]\nتاريخ الحدوث: [التاريخ]\nمستوى الشدة: [عالي/متوسط/منخفض]\n\n📝 تفاصيل المشكلة:\n[وصف تفصيلي للمشكلة]\n\n✅ الإجراءات المتخذة:\n• [الإجراء 1]\n• [الإجراء 2]\n• [الإجراء 3]\n\n💡 الحل الموصى به:\n[الخطوات التالية الموصى بها]\n\n📞 الخطوات التالية:\nنوصي بـ [التوصية] لحل هذه المشكلة.\nيرجى إخبارنا بمسار العمل المفضل لديك.\n\nنعتذر بصدق عن هذه المشكلة ونلتزم بحلها بسرعة.\n\nأطيب التحيات،\n[اسمك]\nفريق الحملة",
      },
    ],
    dos: [
      "Customize templates with specific campaign details",
      "Use appropriate template for recipient type",
      "Select correct language preference",
      "Proofread before sending",
      "Keep tone professional and friendly",
    ],
    donts: [
      "Don't send generic template without customization",
      "Don't use wrong template for wrong recipient",
      "Don't send in language recipient doesn't understand",
      "Don't include incomplete information",
    ],
  },
]

// Export data
export const appData: AppData = {
  teams,
  roles,
  tools,
  artifacts,
  flows,
  kbArticles,
}

// Helper functions
export function getRoleById(roleId: string): Role | undefined {
  return roles.find((r) => r.id === roleId)
}

export function getFlowById(flowId: string): Flow | undefined {
  return flows.find((f) => f.id === flowId)
}

export function getNodeById(flowId: string, nodeId: string): FlowNode | undefined {
  const flow = getFlowById(flowId)
  return flow?.nodes.find((n) => n.id === nodeId)
}

export function getArticleById(articleId: string): KBArticle | undefined {
  return kbArticles.find((a) => a.id === articleId)
}

export function getTeamById(teamId: string): Team | undefined {
  return teams.find((t) => t.id === teamId)
}

export function getToolById(toolId: string): Tool | undefined {
  return tools.find((t) => t.id === toolId)
}

export function getArtifactById(artifactId: string): Artifact | undefined {
  return artifacts.find((a) => a.id === artifactId)
}

export function searchArticles(query: string): KBArticle[] {
  if (!query.trim()) {
    return kbArticles
  }

  const q = query.toLowerCase()
  return kbArticles.filter((article) => {
    const matchTitle = article.title.toLowerCase().includes(q)
    const matchContent = article.content?.toLowerCase().includes(q) ?? false
    const matchSteps = article.steps.some((s) => s.toLowerCase().includes(q))
    const matchTags = article.tags.some((t) => t.toLowerCase().includes(q))
    const matchTriggers = article.triggers?.some((t) =>
      t.toLowerCase().includes(q)
    )

    return matchTitle || matchContent || matchSteps || matchTags || matchTriggers
  })
}
