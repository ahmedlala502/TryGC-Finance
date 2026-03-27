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
    value: 'Keeping influencers engaged and informed at every step of the journey',
    valueAr: 'الحفاظ على تفاعل المؤثرين واطلاعهم في كل خطوة من خطوات الرحلة',
    tasks: [
      { en: 'Send personalized event invitations', ar: 'إرسال دعوات الأحداث المخصصة' },
      { en: 'Send event reminders 48h and 24h before', ar: 'إرسال تذكيرات الحدث قبل 48 و 24 ساعة' },
      { en: 'Send event confirmation messages', ar: 'إرسال رسائل تأكيد الحدث' },
      { en: 'Share event brief with influencers', ar: 'مشاركة موجز الحدث مع المؤثرين' },
      { en: 'Provide real-time support during live events', ar: 'توفير الدعم الفوري أثناء الأحداث المباشرة' },
    ],
    kpis: [
      {
        name: 'Chat Engagement Rate',
        nameAr: 'معدل تفاعل المحادثات',
        target: '85%',
        type: 'up',
        rationale: 'Measure percentage of influencers who respond to chat messages within 2 hours',
      },
      {
        name: 'Influencer Attendance Rate',
        nameAr: 'معدل حضور المؤثرين',
        target: '90%',
        type: 'up',
        rationale: 'Track percentage of invited influencers who attend the event',
      },
      {
        name: 'Message Delivery Time',
        nameAr: 'وقت توصيل الرسالة',
        target: '< 5 mins',
        type: 'down',
        rationale: 'Ensure all messages are delivered within 5 minutes of sending',
      },
    ],
    example: 'Sending a personalized invitation message: "Hi [Name], you&apos;re invited to our exclusive product launch on [Date]. This is a VIP opportunity to connect with fellow creators and our brand leadership team. Confirm your attendance here: [Link]"',
    exampleAr: 'إرسال رسالة دعوة مخصصة: "مرحبا [الاسم]، أنت مدعو لحدثنا الحصري لإطلاق المنتج في [التاريخ]. هذه فرصة VIP للتواصل مع صناع المحتوى الآخرين وفريق القيادة. تأكد حضورك هنا: [الرابط]"',
  },
  {
    id: 'content',
    name: 'Content Team',
    nameAr: 'فريق المحتوى',
    icon: '📸',
    color: '#8b5cf6',
    lightBg: '#faf5ff',
    borderColor: '#ddd6fe',
    tagBg: '#ede9fe',
    tagText: '#6d28d9',
    desc: 'Creative team responsible for designing visual assets, creating campaign narratives, and coordinating with influencers on content creation.',
    descAr: 'الفريق الإبداعي المسؤول عن تصميم الأصول المرئية وإنشاء سرديات الحملات والتنسيق مع المؤثرين على إنشاء المحتوى.',
    value: 'Crafting authentic, visually stunning content that resonates with audiences',
    valueAr: 'صياغة محتوى أصلي وخلاب بصريًا يتفاعل مع الجماهير',
    tasks: [
      { en: 'Design campaign visual assets', ar: 'تصميم الأصول المرئية للحملة' },
      { en: 'Create content briefs and guidelines', ar: 'إنشاء موجزات المحتوى والإرشادات' },
      { en: 'Coordinate content creation with influencers', ar: 'تنسيق إنشاء المحتوى مع المؤثرين' },
      { en: 'Review and approve influencer content', ar: 'مراجعة والموافقة على محتوى المؤثرين' },
      { en: 'Create behind-the-scenes content', ar: 'إنشاء محتوى من وراء الكواليس' },
    ],
    kpis: [
      {
        name: 'Content Approval Time',
        nameAr: 'وقت الموافقة على المحتوى',
        target: '24 hours',
        type: 'down',
        rationale: 'Average time to review and approve influencer-created content',
      },
      {
        name: 'Content Quality Score',
        nameAr: 'درجة جودة المحتوى',
        target: '4.5/5',
        type: 'up',
        rationale: 'Brand satisfaction rating of influencer-created content',
      },
      {
        name: 'Asset Reusability Rate',
        nameAr: 'معدل إعادة استخدام الأصول',
        target: '75%',
        type: 'up',
        rationale: 'Percentage of created content assets used across multiple channels',
      },
    ],
    example: 'Providing a content brief that includes: Brand messaging guidelines, Visual style reference (mood board), Required hashtags, Posting timeline, Performance metrics to track',
    exampleAr: 'تقديم موجز محتوى يتضمن: إرشادات الرسائل المتعلقة بالعلامة التجارية، مرجع نمط بصري (لوحة الحالة المزاجية)، علامات التصنيف المطلوبة، جدول النشر، مقاييس الأداء للتتبع',
  },
  {
    id: 'analytics',
    name: 'Analytics Team',
    nameAr: 'فريق التحليلات',
    icon: '📊',
    color: '#ec4899',
    lightBg: '#fdf2f8',
    borderColor: '#fbcfe8',
    tagBg: '#fce7f3',
    tagText: '#be185d',
    desc: 'Data-driven team responsible for tracking campaign performance, measuring ROI, and providing actionable insights to optimize influencer marketing strategies.',
    descAr: 'فريق يركز على البيانات مسؤول عن تتبع أداء الحملة وقياس العائد على الاستثمار وتقديم رؤى قابلة للتنفيذ لتحسين استراتيجيات التسويق المؤثر.',
    value: 'Transforming data into strategic insights that drive measurable business results',
    valueAr: 'تحويل البيانات إلى رؤى استراتيجية تحقق نتائج أعمال قابلة للقياس',
    tasks: [
      { en: 'Track campaign metrics and KPIs', ar: 'تتبع مقاييس الحملة والمؤشرات الرئيسية' },
      { en: 'Measure influencer engagement and reach', ar: 'قياس تفاعل المؤثرين والوصول' },
      { en: 'Calculate campaign ROI', ar: 'حساب العائد على الاستثمار للحملة' },
      { en: 'Generate performance reports', ar: 'إنشاء تقارير الأداء' },
      { en: 'Provide optimization recommendations', ar: 'تقديم توصيات التحسين' },
    ],
    kpis: [
      {
        name: 'Report Delivery Time',
        nameAr: 'وقت تسليم التقرير',
        target: '5 days',
        type: 'down',
        rationale: 'Deliver comprehensive campaign performance reports within 5 business days of campaign end',
      },
      {
        name: 'Campaign ROI',
        nameAr: 'العائد على الاستثمار للحملة',
        target: '400%',
        type: 'up',
        rationale: 'Achieve minimum 4x return on marketing investment across all campaigns',
      },
      {
        name: 'Data Accuracy Rate',
        nameAr: 'معدل دقة البيانات',
        target: '99.5%',
        type: 'up',
        rationale: 'Ensure tracking and measurement accuracy across all platforms',
      },
    ],
    example: 'Weekly analytics dashboard showing: Total reach and impressions, Engagement rate by influencer, Cost per engagement, Conversion rate, Brand mention sentiment analysis',
    exampleAr: 'لوحة معلومات تحليلات أسبوعية تعرض: إجمالي الوصول والانطباعات، معدل التفاعل حسب المؤثر، التكلفة لكل تفاعل، معدل التحويل، تحليل مشاعر ذكر العلامة التجارية',
  },
]

export default function KPISystem() {
  const [activeTeam, setActiveTeam] = useState('chat')
  const [isArabic, setIsArabic] = useState(false)

  const currentTeam = teams.find((t) => t.id === activeTeam)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fc' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm" style={{ borderBottom: '1px solid #e2e5ef', backgroundColor: '#ffffff' }}>
        <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, #563593, #e9640d)' }}>
                GC
              </div>
              <div>
                <h1 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#1a1d2e' }}>Knowledge Base</h1>
                <p className="text-xs" style={{ color: '#8890b0' }}>Team KPI System</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setIsArabic(false)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{
                  backgroundColor: !isArabic ? '#563593' : '#f1f3f8',
                  color: !isArabic ? '#ffffff' : '#8890b0',
                  border: !isArabic ? 'none' : '1px solid #e2e5ef',
                }}
              >
                EN
              </button>
              <button
                onClick={() => setIsArabic(true)}
                className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all"
                style={{
                  backgroundColor: isArabic ? '#563593' : '#f1f3f8',
                  color: isArabic ? '#ffffff' : '#8890b0',
                  border: isArabic ? 'none' : '1px solid #e2e5ef',
                }}
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

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-2">
              <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: '#8890b0' }}>Teams</p>
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setActiveTeam(team.id)}
                  className="w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all border-l-4"
                  style={{
                    backgroundColor: activeTeam === team.id ? team.lightBg : 'transparent',
                    borderColor: activeTeam === team.id ? team.color : 'transparent',
                    color: '#1a1d2e',
                  }}
                >
                  <span className="text-2xl">{team.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {isArabic ? team.nameAr : team.name}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Tasks Section */}
            {currentTeam && (
              <section className="rounded-xl border p-6 sm:p-8" style={{ borderColor: '#e2e5ef', backgroundColor: '#ffffff' }}>
                <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#1a1d2e' }}>
                  {isArabic ? 'المهام الرئيسية' : 'Key Responsibilities'}
                </h3>
                <div className="space-y-3">
                  {currentTeam.tasks.map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 sm:p-4 rounded-lg"
                      style={{ backgroundColor: '#f1f3f8' }}
                    >
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: currentTeam.color }}
                      >
                        {idx + 1}
                      </div>
                      <p className="text-sm sm:text-base" style={{ color: '#3d4162' }}>
                        {isArabic ? task.ar : task.en}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* KPIs Section */}
            {currentTeam && (
              <section>
                <h3 className="text-xl sm:text-2xl font-bold mb-6" style={{ color: '#1a1d2e' }}>
                  {isArabic ? 'مؤشرات الأداء الرئيسية' : 'Key Performance Indicators'}
                </h3>
                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {currentTeam.kpis.map((kpi, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border p-6 sm:p-8 transition-all hover:shadow-lg"
                      style={{
                        borderColor: '#e2e5ef',
                        backgroundColor: '#ffffff',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <h4 className="font-semibold text-sm sm:text-base" style={{ color: '#1a1d2e' }}>
                          {isArabic ? kpi.nameAr : kpi.name}
                        </h4>
                        <span
                          className="text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap"
                          style={{
                            backgroundColor: kpi.type === 'up' ? '#dbeafe' : kpi.type === 'down' ? '#fef3c7' : '#dbeafe',
                            color: kpi.type === 'up' ? '#0369a1' : kpi.type === 'down' ? '#92400e' : '#0369a1',
                          }}
                        >
                          {kpi.type === 'up' ? '📈 Higher' : kpi.type === 'down' ? '📉 Lower' : '↔️ Range'}
                        </span>
                      </div>
                      <div className="mb-4 pb-4" style={{ borderBottom: '1px solid #e2e5ef' }}>
                        <p className="text-xs" style={{ color: '#8890b0' }}>
                          {isArabic ? 'الهدف' : 'Target'}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold" style={{ color: currentTeam.color }}>
                          {kpi.target}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm" style={{ color: '#6b7280' }}>
                        {kpi.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Example Section */}
            {currentTeam && (
              <section className="rounded-xl border p-6 sm:p-8" style={{ borderColor: '#e2e5ef', backgroundColor: '#ffffff' }}>
                <h3 className="text-xl sm:text-2xl font-bold mb-4" style={{ color: '#1a1d2e' }}>
                  {isArabic ? 'مثال عملي' : 'Practical Example'}
                </h3>
                <div
                  className="p-4 sm:p-6 rounded-lg italic text-sm sm:text-base leading-relaxed"
                  style={{
                    backgroundColor: currentTeam.lightBg,
                    borderLeft: `4px solid ${currentTeam.color}`,
                    color: '#3d4162',
                  }}
                >
                  {isArabic ? currentTeam.exampleAr : currentTeam.example}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
