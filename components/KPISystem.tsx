'use client'

import { useState } from 'react'

interface KPI {
  name: string
  nameAr: string
  target: string
  type: 'up' | 'down' | 'range'
  rationale: string
}

interface Task {
  en: string
  ar: string
}

interface Team {
  id: string
  name: string
  nameAr: string
  icon: string
  color: string
  lightBg: string
  borderColor: string
  tagBg: string
  tagText: string
  desc: string
  descAr: string
  value: string
  valueAr: string
  tasks: Task[]
  kpis: KPI[]
  example: string
  exampleAr: string
}

const teams: Team[] = [
  {
    id: 'chat',
    name: 'Chat Team',
    nameAr: 'فريق المحادثات',
    icon: '💬',
    color: '#0ea5e9',
    lightBg: '#f0f9ff',
    borderColor: '#bae6fd',
    tagBg: '#e0f2fe',
    tagText: '#0369a1',
    desc: 'Frontline communication role responsible for invitations, reminders, confirmations, brief sharing, and real-time influencer support.',
    descAr: 'دور التواصل الأمامي المسؤول عن الدعوات، التذكيرات، التأكيدات، إرسال البريف، والدعم الفوري للمؤثرين.',
    value: 'This role shapes confirmation volume, response speed, and communication quality before execution starts.',
    valueAr: 'هذا الدور يحدد حجم التأكيدات، سرعة الرد، وجودة التواصل قبل بدء التنفيذ.',
    tasks: [
      { en: 'Run daily influencer communication across WhatsApp and related channels.', ar: 'إدارة التواصل اليومي مع المؤثرين عبر واتساب والقنوات المرتبطة.' },
      { en: 'Send invitations and reminder waves for active campaigns.', ar: 'إرسال الدعوات وموجات التذكير للحملات الجارية.' },
      { en: 'Share briefs before visit time and send same-day reminders.', ar: 'إرسال البريف قبل وقت الزيارة والتذكير في نفس اليوم.' },
      { en: 'Answer inquiries quickly and remove blockers delaying confirmation.', ar: 'الرد السريع على الاستفسارات وإزالة أي عوائق تمنع التأكيد.' },
    ],
    kpis: [
      { name: 'Invitation → Confirmation Rate', nameAr: 'معدل الدعوة → التأكيد', target: '≥ 30%', type: 'up', rationale: 'Measures how effectively invitations convert into committed influencers. Below 30% signals weak messaging or poor list targeting.' },
      { name: 'First Response Time', nameAr: 'زمن أول رد', target: '≤ 5 min', type: 'down', rationale: 'Speed of first reply directly impacts confirmation rates. Influencers who wait too long often disengage or confirm with competitors.' },
      { name: 'Reminder Conversion Rate', nameAr: 'معدل تحويل التذكيرات', target: '≥ 25%', type: 'up', rationale: 'Tracks how many undecided influencers are converted after follow-up reminders. Key recovery metric for the chat funnel.' },
      { name: 'Chat QA Score', nameAr: 'درجة جودة المحادثة', target: '≥ 90%', type: 'up', rationale: 'Ensures tone, accuracy, and professionalism across all conversations. Directly affects influencer trust and brand perception.' },
      { name: 'Confirmation Accuracy', nameAr: 'دقة التأكيدات', target: '≥ 95%', type: 'up', rationale: 'Ensures confirmed slots are correctly recorded with right date, location, and brief. Errors here cascade into coordination failures.' },
    ],
    example: '200 invitations → 68 confirmations, first response avg 4 min, QA score 93% → All KPIs On Target ✓',
    exampleAr: '200 دعوة → 68 تأكيد، متوسط أول رد 4 دقائق، جودة 93% → جميع المؤشرات على الهدف ✓',
  },
  {
    id: 'coverage',
    name: 'Coverage Team',
    nameAr: 'فريق التغطية',
    icon: '📡',
    color: '#10b981',
    lightBg: '#f0fdf4',
    borderColor: '#a7f3d0',
    tagBg: '#d1fae5',
    tagText: '#065f46',
    desc: 'Delivery control role responsible for tracking posted content, validating it against the brief, downloading proof, and closing missing coverage.',
    descAr: 'دور التحكم في التسليم والمسؤول عن متابعة المحتوى المنشور، مراجعته مقابل البريف، حفظ الإثباتات، وإغلاق حالات النقص.',
    value: 'This is the closest operational role to client delivery and revenue protection.',
    valueAr: 'هذا هو أقرب دور تشغيلي إلى تسليم العميل وحماية الإيراد.',
    tasks: [
      { en: 'Track expected posting dates from confirmation sheets.', ar: 'متابعة تواريخ النشر المتوقعة من شيتات التأكيد.' },
      { en: 'Check influencer accounts and verify on-time coverage.', ar: 'مراجعة حسابات المؤثرين والتأكد من النشر في الموعد.' },
      { en: 'Validate coverage against the brief and required format.', ar: 'مراجعة التغطية مقابل البريف والصيغة المطلوبة.' },
      { en: 'Download approved assets and record delays or exceptions.', ar: 'تحميل المواد المعتمدة وتسجيل التأخيرات أو الاستثناءات.' },
    ],
    kpis: [
      { name: 'Visit → Posting Coverage Rate', nameAr: 'معدل الزيارة → التغطية', target: '≥ 85%', type: 'up', rationale: 'Core delivery metric. Measures what percentage of confirmed visits actually result in valid published content. The primary revenue-protection KPI.' },
      { name: 'Same-Day Upload Rate', nameAr: 'معدل رفع الإثبات في نفس اليوم', target: '≥ 80%', type: 'up', rationale: 'Ensures the team captures proof while content is still live and verifiable. Delays increase the risk of missing or deleted posts.' },
      { name: 'Missing Coverage Rate', nameAr: 'معدل التغطية الناقصة', target: '≤ 15%', type: 'down', rationale: 'The inverse of coverage success — tracks how much is unaccounted for. High rates trigger client escalations and delivery deductions.' },
      { name: 'Brief Compliance Rate', nameAr: 'معدل الالتزام بالبريف', target: '≥ 90%', type: 'up', rationale: 'Validates that content matches client requirements: format, hashtags, mention, caption style. Non-compliant content is typically rejected.' },
      { name: 'Daily Coverage Output', nameAr: 'إنتاجية التغطية اليومية', target: '10–20 / day', type: 'range', rationale: 'Capacity benchmark per team member. Below 10 signals inefficiency; above 20 risks quality shortcuts. Calibrated to campaign volume.' },
    ],
    example: '100 influencers visit → 88 valid coverages uploaded same-day = 88% Visit-to-Posting Rate → Above Target ✓',
    exampleAr: '100 مؤثر يزورون → 88 تغطية صحيحة مرفوعة في نفس اليوم = 88% → أعلى من الهدف ✓',
  },
  {
    id: 'followup',
    name: 'Follow-Up Team',
    nameAr: 'فريق المتابعة',
    icon: '🔁',
    color: '#f59e0b',
    lightBg: '#fffbeb',
    borderColor: '#fde68a',
    tagBg: '#fef3c7',
    tagText: '#92400e',
    desc: 'Recovery role focused on old dates, missing coverage points, incomplete deliverables, and late-stage issue closure before reporting is affected.',
    descAr: 'دور الاسترجاع والمتابعة ويركز على الحالات القديمة، النقاط الناقصة، التسليمات غير المكتملة، وإغلاق المشاكل قبل تأثيرها على التقارير.',
    value: 'This team protects final campaign completion and reduces waste after the campaign is already in motion.',
    valueAr: 'هذا الفريق يحمي اكتمال الحملة النهائي ويقلل الهدر بعد دخول الحملة مرحلة التنفيذ.',
    tasks: [
      { en: 'Review old dates and unresolved statuses daily.', ar: 'مراجعة الحالات القديمة والحالات غير المغلقة يومياً.' },
      { en: 'Contact influencers with incomplete or incorrect coverage.', ar: 'التواصل مع المؤثرين أصحاب التغطية غير المكتملة أو الخاطئة.' },
      { en: 'Follow up with chat and community on missing notes or blockers.', ar: 'المتابعة مع المحادثات والكوميونيتي بشأن الملاحظات أو المعوقات الناقصة.' },
      { en: 'Escalate unresolved issues before reporting is affected.', ar: 'تصعيد المشاكل غير المحلولة قبل أن تتأثر التقارير.' },
    ],
    kpis: [
      { name: 'Old-Date Closure Rate', nameAr: 'معدل إغلاق الحالات القديمة', target: '≥ 85%', type: 'up', rationale: 'Measures how effectively past-due cases are resolved. Unresolved old dates accumulate and directly reduce final campaign delivery scores.' },
      { name: 'Recovery Rate', nameAr: 'معدل الاسترجاع', target: '≥ 60%', type: 'up', rationale: 'Tracks how many incomplete coverage cases are successfully recovered through re-engagement. Each recovery saves a lost campaign unit.' },
      { name: 'Resolution Turnaround', nameAr: 'زمن حل المشكلة', target: '≤ 24h', type: 'down', rationale: 'Cases older than 24h reduce the window for influencer compliance. Speed is critical to recovering content before it becomes unrecoverable.' },
      { name: 'Unanswered Message Rate', nameAr: 'معدل الرسائل غير المجابة', target: '≤ 5%', type: 'down', rationale: 'Monitors response gaps from the follow-up team itself. Unanswered messages from this team create operational dead zones.' },
      { name: 'Reopen Rate', nameAr: 'معدل إعادة الفتح', target: '≤ 10%', type: 'down', rationale: 'Tracks cases that were marked resolved but required reopening. High reopen rates indicate surface-level fixes rather than root resolution.' },
    ],
    example: '40 old-date cases received → 36 closed on same day = 90% Closure Rate, 0 reopens → Healthy Performance ✓',
    exampleAr: '40 حالة قديمة → 36 مغلقة في نفس اليوم = 90% معدل إغلاق، 0 إعادة فتح → أداء صحي ✓',
  },
  {
    id: 'coordination',
    name: 'Coordination Team',
    nameAr: 'فريق التنسيق',
    icon: '🗼',
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    borderColor: '#ddd6fe',
    tagBg: '#ede9fe',
    tagText: '#5b21b6',
    desc: 'Operational control-tower role responsible for campaign setup, folder creation, sheet building, brief preparation, system configuration, and launch readiness.',
    descAr: 'دور برج التحكم التشغيلي والمسؤول عن إعداد الحملة، إنشاء المجلدات، بناء الشيتات، تحضير البريفات، إعداد السيستم، وجاهزية الإطلاق.',
    value: 'Errors here spread to every other team — this role is critical for launch quality and data integrity across all downstream operations.',
    valueAr: 'أي خطأ هنا ينتقل إلى باقي الفرق، لذلك هذا الدور محوري في جودة الإطلاق وسلامة البيانات عبر جميع العمليات اللاحقة.',
    tasks: [
      { en: 'Review booking orders and verify target, timing, geography, and brief requirements.', ar: 'مراجعة أوامر الحجز والتأكد من الهدف، التوقيت، الجغرافيا، ومتطلبات البريف.' },
      { en: 'Create official folder structure and campaign storage paths.', ar: 'إنشاء هيكل المجلدات الرسمي ومسارات التخزين للحملة.' },
      { en: 'Prepare invitations, briefs, visit sheets, and delivery sheets.', ar: 'إعداد الدعوات والبريفات وشيتات الزيارة أو التوصيل.' },
      { en: 'Create the campaign in the system and publish daily files on time.', ar: 'إنشاء الحملة على السيستم ونشر الملفات اليومية في موعدها.' },
    ],
    kpis: [
      { name: 'Campaign Setup Turnaround', nameAr: 'زمن إعداد الحملة', target: '≤ 24h', type: 'down', rationale: 'Time from receiving a booking order to a fully configured, system-ready campaign. Every hour of delay pushes back the entire execution chain.' },
      { name: 'Zero-Error Setup Rate', nameAr: 'معدل الإعداد بدون أخطاء', target: '≥ 95%', type: 'up', rationale: 'A single error in briefing, date, or influencer list can corrupt downstream delivery. This KPI tracks structural quality at source.' },
      { name: 'Sheet–System Sync Accuracy', nameAr: 'دقة تطابق الشيت مع السيستم', target: '≥ 98%', type: 'up', rationale: 'Mismatches between master sheets and system data cause double work, wrong reports, and missed influencers. Critical for data trust.' },
      { name: 'On-Time Launch Readiness', nameAr: 'جاهزية الإطلاق في الموعد', target: '100%', type: 'up', rationale: 'Non-negotiable. A campaign that misses its launch window creates client dissatisfaction and cascading delays across all teams.' },
      { name: 'Final Report SLA', nameAr: 'الالتزام بموعد التقرير النهائي', target: '100%', type: 'up', rationale: 'Reports must be delivered on schedule as part of client contract fulfilment. Late reports directly risk invoice disputes.' },
    ],
    example: '20 campaigns set up in the week → 19 launched error-free within SLA = 95% Zero-Error Rate, 100% on-time launch → On Target ✓',
    exampleAr: '20 حملة أُعدت خلال الأسبوع → 19 أُطلقت بدون أخطاء داخل الـ SLA = 95% بدون أخطاء، 100% إطلاق في الموعد → على الهدف ✓',
  },
  {
    id: 'community',
    name: 'Community Team',
    nameAr: 'فريق الكوميونيتي',
    icon: '🌐',
    color: '#ef4444',
    lightBg: '#fff5f5',
    borderColor: '#fecaca',
    tagBg: '#fee2e2',
    tagText: '#991b1b',
    desc: 'Client-facing planning role responsible for campaign needs translation, influencer list building, approvals management, activation, and the full feedback loop after delivery.',
    descAr: 'دور تخطيطي ومواجه للعميل مسؤول عن ترجمة احتياجات الحملة، بناء قوائم المؤثرين، إدارة الموافقات، التفعيل، وإغلاق دائرة الفيدباك بعد التسليم.',
    value: 'Community translates client demand into workable supply and strongly affects list quality and campaign activation speed.',
    valueAr: 'فريق الكوميونيتي يحول طلب العميل إلى عرض قابل للتنفيذ ويؤثر مباشرة على جودة القوائم وسرعة التفعيل.',
    tasks: [
      { en: 'Align with clients on creator criteria and campaign objectives.', ar: 'التوافق مع العميل على معايير المؤثرين وأهداف الحملة.' },
      { en: 'Build influencer lists and submit them for approval.', ar: 'بناء قوائم المؤثرين وإرسالها للموافقة.' },
      { en: 'Convert approved lists into booking orders and activation.', ar: 'تحويل القوائم المعتمدة إلى أوامر حجز وتفعيل.' },
      { en: 'Track campaign status, missing coverage, and final reports with the client.', ar: 'متابعة حالة الحملة والتغطية الناقصة والتقارير النهائية مع العميل.' },
    ],
    kpis: [
      { name: 'List Quality Score', nameAr: 'مؤشر جودة القائمة', target: '≥ 20%', type: 'up', rationale: 'Calculated as (posting coverages / list size). A 20%+ rate means at least 1 in 5 creators on the submitted list deliver final content — commercially viable threshold.' },
      { name: 'List Approval Turnaround', nameAr: 'زمن اعتماد القائمة', target: '≤ 48h', type: 'down', rationale: 'Time from list submission to client approval. Delays here push back activation and compress the execution window for all teams.' },
      { name: 'Campaign Activation Rate', nameAr: 'معدل تفعيل الحملات', target: '≥ 90%', type: 'up', rationale: 'Measures how many approved campaigns actually go live. A low rate indicates friction in handoff from community to coordination/chat.' },
      { name: 'Client Feedback Capture Rate', nameAr: 'معدل إغلاق الفيدباك', target: '≥ 90%', type: 'up', rationale: 'Tracks whether post-campaign feedback is collected and documented. Critical for campaign learning, renewal proposals, and issue resolution.' },
      { name: 'Repeat Campaign Rate', nameAr: 'معدل تكرار الحملات', target: '≥ 50%', type: 'up', rationale: 'Percentage of clients who run more than one campaign. The ultimate client satisfaction signal and primary growth driver for the business.' },
    ],
    example: '300-creator list submitted → 72 posting coverages delivered = 24% List Quality Score → Commercially Strong ✓',
    exampleAr: 'قائمة من 300 مؤثر → 72 تغطية منشورة = 24% مؤشر جودة القائمة → قوي تجارياً ✓',
  },
  {
    id: 'onboarding',
    name: 'Onboarding Team',
    nameAr: 'فريق التهيئة',
    icon: '🚀',
    color: '#059669',
    lightBg: '#ecfdf5',
    borderColor: '#6ee7b7',
    tagBg: '#d1fae5',
    tagText: '#064e3b',
    desc: 'Creator activation role responsible for attracting new influencers, explaining collaboration policies clearly, resolving setup blockers, and building complete usable creator profiles.',
    descAr: 'دور تهيئة المؤثرين والمسؤول عن جذب المؤثرين الجدد، شرح سياسات التعاون بوضوح، حل معوقات الإعداد، وبناء ملفات كاملة وقابلة للاستخدام.',
    value: 'A healthy onboarding process creates usable supply and reduces future campaign friction. Every influencer onboarded correctly reduces chat team load.',
    valueAr: 'عملية التهيئة الصحية تخلق عرضاً قابلاً للاستخدام وتقلل الاحتكاك في الحملات القادمة. كل مؤثر يُهيّأ بشكل صحيح يقلل من عبء فريق المحادثات.',
    tasks: [
      { en: 'Activate new influencers into the ecosystem.', ar: 'تفعيل المؤثرين الجدد داخل المنظومة.' },
      { en: 'Explain policies and collaboration expectations clearly.', ar: 'شرح السياسات وتوقعات التعاون بوضوح.' },
      { en: 'Resolve setup blockers before they become operational delays.', ar: 'حل معوقات الإعداد قبل أن تتحول إلى تأخير تشغيلي.' },
      { en: 'Complete creator profiles and track onboarding outcomes.', ar: 'استكمال ملفات المؤثرين ومتابعة نتائج التهيئة.' },
    ],
    kpis: [
      { name: 'Activation Rate', nameAr: 'معدل التفعيل', target: '≥ 60%', type: 'up', rationale: 'How many contacted influencers successfully complete onboarding and become active in the system. The primary output metric for this role.' },
      { name: 'Time to Onboard', nameAr: 'زمن التهيئة', target: '≤ 24h', type: 'down', rationale: 'From first contact to a fully active, campaign-ready creator. Long onboarding cycles delay list availability for community and coordination.' },
      { name: 'Profile Completeness', nameAr: 'اكتمال الملف الشخصي', target: '≥ 90%', type: 'up', rationale: 'Incomplete profiles block campaign targeting. Fields include niche, reach, location, phone, WhatsApp, and content samples.' },
      { name: 'No-Response Ratio', nameAr: 'معدل عدم الرد', target: '≤ 20%', type: 'down', rationale: 'Tracks how many outreach contacts never respond. High ratios indicate poor list sourcing or low-relevance outreach messages.' },
      { name: 'Reactivation Rate', nameAr: 'معدل إعادة التفعيل', target: '≥ 25%', type: 'up', rationale: 'Percentage of dormant or inactive influencers re-engaged successfully. Important for growing supply without purely sourcing net-new creators.' },
    ],
    example: '100 creators contacted → 65 fully active with complete profiles in under 1 day = 65% Activation Rate → Above Target ✓',
    exampleAr: '100 مؤثر تم التواصل معهم → 65 نشطين بملفات مكتملة خلال أقل من يوم = 65% معدل تفعيل → أعلى من الهدف ✓',
  },
  {
    id: 'support',
    name: 'Shared Support',
    nameAr: 'الدعم المشترك',
    icon: '🛠',
    color: '#ec4899',
    lightBg: '#fdf2f8',
    borderColor: '#f9a8d4',
    tagBg: '#fce7f3',
    tagText: '#9d174d',
    desc: 'Cross-functional support lane handling account fixes, WhatsApp number changes, list additions, dashboard updates, data corrections, and escalations to the development team.',
    descAr: 'مسار دعم مشترك متعدد الوظائف لمعالجة مشاكل الحسابات، تغييرات أرقام واتساب، إضافات القوائم، تحديثات الداشبورد، التصحيحات، والتصعيد لفريق التطوير.',
    value: 'Shared support reduces downtime and protects productivity across all operational teams. Without it, blockers accumulate silently until they cause campaign failures.',
    valueAr: 'الدعم المشترك يقلل التوقف ويحمي إنتاجية جميع الفرق التشغيلية. بدونه تتراكم المعوقات بصمت حتى تتسبب في فشل الحملات.',
    tasks: [
      { en: 'Fix creator account issues and profile changes.', ar: 'حل مشاكل الحسابات وتغييرات بروفايل المؤثرين.' },
      { en: 'Resolve WhatsApp number or API link issues.', ar: 'حل مشاكل أرقام واتساب أو روابط الـ API.' },
      { en: 'Support list additions and data requests across teams.', ar: 'دعم إضافة القوائم وطلبات البيانات عبر الفرق.' },
      { en: 'Escalate system-level blockers to development when needed.', ar: 'تصعيد المعوقات الخاصة بالسيستم إلى فريق التطوير عند الحاجة.' },
    ],
    kpis: [
      { name: 'Average Resolution Time', nameAr: 'متوسط زمن الحل', target: '≤ 12h', type: 'down', rationale: 'Every hour a support ticket stays open means an operational team member is blocked. Resolving within 12h keeps the overall system flowing.' },
      { name: 'First-Contact Resolution Rate', nameAr: 'معدل الحل من أول تواصل', target: '≥ 80%', type: 'up', rationale: 'Cases solved on first contact avoid escalation, re-assignment, and repeated context-sharing. Tracks support efficiency and knowledge depth.' },
      { name: 'SLA Adherence', nameAr: 'الالتزام بالـ SLA', target: '≥ 95%', type: 'up', rationale: 'Percentage of all support tickets resolved within their agreed SLA window. The master health metric for the support function.' },
      { name: 'Correction Accuracy', nameAr: 'دقة التصحيح', target: '≥ 95%', type: 'up', rationale: 'Measures whether corrections made (data edits, account updates, sheet fixes) were applied correctly without introducing new errors.' },
      { name: 'Ticket Reopen Rate', nameAr: 'معدل إعادة فتح التذاكر', target: '≤ 8%', type: 'down', rationale: 'Tickets reopened because the fix was incomplete or incorrect. High reopen rates waste capacity and delay other team operations.' },
    ],
    example: '120 support tickets received → 116 solved within SLA, 5 reopened = 96.7% SLA Adherence, 4.2% Reopen Rate → All KPIs Above Target ✓',
    exampleAr: '120 تذكرة دعم → 116 محلولة داخل الـ SLA، 5 أُعيد فتحها = 96.7% التزام بالـ SLA، 4.2% معدل إعادة الفتح → جميع المؤشرات أعلى من الهدف ✓',
  },
]

export default function KPISystem() {
  const [activeTeam, setActiveTeam] = useState(teams[0].id)
  const [isArabic, setIsArabic] = useState(false)

  const currentTeam = teams.find(t => t.id === activeTeam)

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg2 to-bg3">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg2 backdrop-blur-sm">
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white font-bold text-sm">
                GC
              </div>
              <div>
                <h1 className="text-sm font-bold uppercase tracking-wider text-text">Knowledge Base</h1>
                <p className="text-xs text-muted">Team KPI System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsArabic(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  !isArabic
                    ? 'bg-primary text-white'
                    : 'border border-border bg-bg3 text-muted hover:border-border2 hover:text-text2'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setIsArabic(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isArabic
                    ? 'bg-primary text-white'
                    : 'border border-border bg-bg3 text-muted hover:border-border2 hover:text-text2'
                }`}
              >
                AR
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        {currentTeam && (
          <div className="mb-12 animate-fade-in">
            <div
              className="rounded-xl border-2 p-8 sm:p-10 text-white"
              style={{
                backgroundColor: currentTeam.color,
                borderColor: currentTeam.borderColor,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{currentTeam.icon}</span>
                    <h2 className="text-3xl sm:text-4xl font-bold">
                      {isArabic ? currentTeam.nameAr : currentTeam.name}
                    </h2>
                  </div>
                  <p className="text-base sm:text-lg opacity-95 mb-4 leading-relaxed">
                    {isArabic ? currentTeam.descAr : currentTeam.desc}
                  </p>
                  <p className="text-sm sm:text-base font-semibold opacity-90 italic">
                    💡 {isArabic ? currentTeam.valueAr : currentTeam.value}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted">Teams</p>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setActiveTeam(team.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    activeTeam === team.id
                      ? 'bg-bg2 border-l-4 shadow-sm'
                      : 'hover:bg-bg2/50 border-l-4 border-transparent'
                  }`}
                  style={{
                    borderColor: activeTeam === team.id ? team.color : 'transparent',
                    backgroundColor: activeTeam === team.id ? team.lightBg : undefined,
                  }}
                >
                  <span className="text-2xl">{team.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">
                      {isArabic ? team.nameAr : team.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          {currentTeam && (
            <div className="lg:col-span-2 space-y-8">
              {/* Tasks Section */}
              <section className="animate-slide-in">
                <h3 className="mb-4 text-xl font-bold text-text">
                  {isArabic ? '📋 المهام الرئيسية' : '📋 Key Responsibilities'}
                </h3>
                <div className="grid gap-3">
                  {currentTeam.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-bg2 p-4 hover:border-border2 hover:shadow-sm transition-all"
                    >
                      <p className="text-sm leading-relaxed text-text">
                        {isArabic ? task.ar : task.en}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* KPIs Section */}
              <section className="animate-slide-in">
                <h3 className="mb-4 text-xl font-bold text-text">
                  {isArabic ? '🎯 مؤشرات الأداء الرئيسية' : '🎯 Key Performance Indicators'}
                </h3>
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                  {currentTeam.kpis.map((kpi, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-bg2 p-5 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-semibold text-text text-sm sm:text-base">
                          {isArabic ? kpi.nameAr : kpi.name}
                        </h4>
                        <span
                          className="whitespace-nowrap rounded px-2.5 py-1 text-xs font-bold"
                          style={{
                            backgroundColor: currentTeam.tagBg,
                            color: currentTeam.tagText,
                          }}
                        >
                          {kpi.target}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-text2 leading-relaxed">
                        {kpi.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Example Section */}
              {currentTeam.example && (
                <section className="animate-slide-in">
                  <div
                    className="rounded-lg border-2 p-6 sm:p-8"
                    style={{
                      borderColor: currentTeam.borderColor,
                      backgroundColor: currentTeam.lightBg,
                    }}
                  >
                    <p className="text-sm sm:text-base font-semibold text-text2 leading-relaxed">
                      ✓ {isArabic ? currentTeam.exampleAr : currentTeam.example}
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
