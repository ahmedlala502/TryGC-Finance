'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { appData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import { BarChart3, BookOpen, CheckSquare, Zap, TrendingUp, Users, AlertCircle, CheckCircle } from 'lucide-react'

export default function HomePage() {
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('selectedRole')
    if (saved) {
      setSelectedRole(saved)
    }
  }, [])

  const handleRoleChange = (roleId: string) => {
    setSelectedRole(roleId)
    localStorage.setItem('selectedRole', roleId)
  }

  if (!mounted) return null

  const selectedRoleObj = appData.roles.find((r) => r.id === selectedRole)
  const selectedTeamObj = selectedRoleObj ? appData.teams.find((t) => t.id === selectedRoleObj.teamId) : null

  // KPI Metrics
  const metrics = [
    {
      label: language === 'en' ? 'Total Flows' : 'إجمالي التدفقات',
      value: appData.flows.length,
      icon: BarChart3,
      color: 'from-purple-500 to-purple-600',
      description: language === 'en' ? 'Decision trees & workflows' : 'أشجار القرار والعمليات',
    },
    {
      label: language === 'en' ? 'KB Articles' : 'مقالات قاعدة المعرفة',
      value: appData.kbArticles.length,
      icon: BookOpen,
      color: 'from-orange-500 to-orange-600',
      description: language === 'en' ? 'Knowledge base articles' : 'مقالات المعرفة',
    },
    {
      label: language === 'en' ? 'Active Teams' : 'الفرق النشطة',
      value: appData.teams.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      description: language === 'en' ? 'Operations teams' : 'فرق العمليات',
    },
    {
      label: language === 'en' ? 'Templates' : 'القوالب',
      value: appData.kbArticles.reduce((sum, a) => sum + (a.templates?.length || 0), 0),
      icon: Zap,
      color: 'from-amber-500 to-amber-600',
      description: language === 'en' ? 'Communication templates' : 'قوالب الاتصال',
    },
  ]

  const performanceData = [
    {
      title: language === 'en' ? 'Coordination Flow' : 'تدفق التنسيق',
      status: 'active',
      percentage: 85,
      team: 'Coordination',
    },
    {
      title: language === 'en' ? 'Coverage Flow' : 'تدفق التغطية',
      status: 'active',
      percentage: 92,
      team: 'Coverage',
    },
    {
      title: language === 'en' ? 'Chat Support' : 'دعم الدردشة',
      status: 'active',
      percentage: 78,
      team: 'Chat',
    },
  ]

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Navigation selectedRole={selectedRole} />

      <main style={{ maxWidth: '1180px', margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Header with Language Toggle */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)', marginBottom: '8px' }}>
                {language === 'en' ? 'Operations KPI Dashboard' : 'لوحة مفاتيح KPI للعمليات'}
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
                {language === 'en'
                  ? 'Real-time performance metrics and operational insights'
                  : 'مقاييس الأداء في الوقت الفعلي والرؤى التشغيلية'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                onClick={() => setLanguage('en')}
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                style={{
                  background: language === 'en' ? 'var(--accent)' : 'transparent',
                  color: language === 'en' ? 'white' : 'var(--text)',
                  border: `1px solid ${language === 'en' ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                English
              </Button>
              <Button
                onClick={() => setLanguage('ar')}
                variant={language === 'ar' ? 'default' : 'outline'}
                size="sm"
                style={{
                  background: language === 'ar' ? 'var(--accent)' : 'transparent',
                  color: language === 'ar' ? 'white' : 'var(--text)',
                  border: `1px solid ${language === 'ar' ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                العربية
              </Button>
            </div>
          </div>

          {/* Role & Team Selectors */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text2)', marginBottom: '8px' }}>
                {language === 'en' ? 'Select Role' : 'اختر الدور'}
              </label>
              <Select value={selectedRole} onValueChange={handleRoleChange}>
                <SelectTrigger style={{ borderColor: 'var(--border)' }}>
                  <SelectValue placeholder={language === 'en' ? 'Choose a role...' : 'اختر دوراً...'} />
                </SelectTrigger>
                <SelectContent>
                  {appData.roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {metrics.map((metric, idx) => {
            const Icon = metric.icon
            return (
              <div
                key={idx}
                style={{
                  background: 'var(--bg2)',
                  border: `1px solid var(--border)`,
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: '500', color: 'var(--muted)' }}>{metric.label}</h3>
                  <div
                    style={{
                      background: `linear-gradient(135deg, ${metric.color.split(' ')[1]}, ${metric.color.split(' ')[3]})`,
                      padding: '8px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={16} color="white" />
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text)' }}>{metric.value}</div>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>{metric.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Performance Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {/* Active Workflows */}
          <div style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={18} color="var(--accent)" />
              {language === 'en' ? 'Flow Performance' : 'أداء التدفق'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {performanceData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text)', marginBottom: '6px' }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        background: 'var(--bg3)',
                        height: '6px',
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          background: `linear-gradient(90deg, var(--accent), var(--accent2))`,
                          height: '100%',
                          width: `${item.percentage}%`,
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--accent)', minWidth: '40px', textAlign: 'right' }}>
                    {item.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: '12px', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
              {language === 'en' ? 'Quick Access' : 'وصول سريع'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/flows">
                <Button style={{ width: '100%', background: 'var(--accent)', color: 'white' }}>
                  {language === 'en' ? 'View All Flows' : 'عرض جميع التدفقات'}
                </Button>
              </Link>
              <Link href="/kb">
                <Button variant="outline" style={{ width: '100%', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {language === 'en' ? 'Browse Knowledge Base' : 'استعرض قاعدة المعرفة'}
                </Button>
              </Link>
              <Link href="/qa">
                <Button variant="outline" style={{ width: '100%', borderColor: 'var(--border)', color: 'var(--text)' }}>
                  {language === 'en' ? 'QA & Audits' : 'ضمان الجودة والتدقيق'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Teams Overview */}
        <div style={{ background: 'var(--bg2)', border: `1px solid var(--border)`, borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text)', marginBottom: '20px' }}>
            {language === 'en' ? 'Teams Overview' : 'نظرة عامة على الفرق'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {appData.teams.map((team) => (
              <div
                key={team.id}
                style={{
                  padding: '16px',
                  background: 'var(--bg3)',
                  border: `1px solid var(--border)`,
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)' }}>{team.name}</div>
                <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  {appData.roles.filter((r) => r.teamId === team.id).length} {language === 'en' ? 'roles' : 'أدوار'}
                </div>
                <Badge style={{ width: 'fit-content', background: 'var(--accent)', color: 'white' }}>
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
