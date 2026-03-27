'use client'

import { useState } from 'react'
import { appData } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Navigation from '@/components/navigation'
import { CheckSquare, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react'

export default function QAPage() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [activeTeam, setActiveTeam] = useState<string>(appData.teams[0].id)

  const toggleCheck = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)
  }

  // Get QA articles for the selected team
  const teamQaArticles = appData.kbArticles.filter(
    (article) =>
      article.teamId === activeTeam &&
      (article.tags.includes('QA') ||
        article.tags.includes('Audit') ||
        article.qaChecklist)
  )

  // Get articles with QA checklists
  const articlesWithChecklists = teamQaArticles.filter(
    (a) => a.qaChecklist && a.qaChecklist.length > 0
  )

  const topIssues = [
    {
      id: 'pcloud-mismatch',
      title: 'P-Cloud vs Confirmation Sheet Mismatch',
      description: 'Count of downloaded files does not match Done statuses',
      severity: 'high',
      team: 'team-coverage',
      relatedArticle: 'kb-coverage-reconcile',
    },
    {
      id: 'wrong-invitation',
      title: 'Wrong Invitation/Reminder Sent',
      description: 'Incorrect campaign details sent to influencers',
      severity: 'critical',
      team: 'team-chat',
      relatedArticle: 'kb-chat-correction',
    },
    {
      id: 'missing-points',
      title: 'Missing Points Follow-up Backlog',
      description: 'Influencers with incomplete coverage needing follow-up',
      severity: 'medium',
      team: 'team-followup',
      relatedArticle: 'kb-template-missing-points',
    },
    {
      id: 'confirmation-gaps',
      title: 'Confirmation Data Quality Issues',
      description: 'Missing or incorrect fields in Confirmation Sheet',
      severity: 'medium',
      team: 'team-coordination',
      relatedArticle: 'kb-audit-confirmations',
    },
    {
      id: 'response-time',
      title: 'Chat Response Time SLA Violations',
      description: 'Replies not sent within 2-hour SLA',
      severity: 'high',
      team: 'team-chat',
      relatedArticle: 'kb-chat-quality',
    },
  ]

  const selectedTeam = appData.teams.find((t) => t.id === activeTeam)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">QA & Audits</h1>
          <p className="text-slate-600">Daily checklists, reconciliation checks, and quality audits</p>
        </div>

        <Tabs defaultValue="checklists" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="checklists">
              <CheckSquare className="w-4 h-4 mr-2" />
              Daily Checklists
            </TabsTrigger>
            <TabsTrigger value="issues">
              <AlertCircle className="w-4 h-4 mr-2" />
              Top Issues
            </TabsTrigger>
            <TabsTrigger value="metrics">
              <TrendingUp className="w-4 h-4 mr-2" />
              QA Metrics
            </TabsTrigger>
          </TabsList>

          {/* Daily Checklists Tab */}
          <TabsContent value="checklists" className="space-y-6">
            {/* Team Selector */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <label className="text-sm font-semibold text-slate-700 block mb-3">
                Select Team for Daily Checklist
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {appData.teams.map((team) => (
                  <Button
                    key={team.id}
                    variant={activeTeam === team.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTeam(team.id)}
                    className="text-xs"
                  >
                    {team.name.split(' ')[0]}
                  </Button>
                ))}
              </div>
            </div>

            {/* Team Info Card */}
            <Card className="border-0 shadow-md bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-900">{selectedTeam?.name}</CardTitle>
                <CardDescription className="text-blue-800">
                  {selectedTeam?.description}
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Checklists */}
            {articlesWithChecklists.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                <CardContent className="py-12 text-center">
                  <p className="text-slate-600">No QA checklists available for this team</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {articlesWithChecklists.map((article) => (
                  <Card key={article.id} className="border-0 shadow-md overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50">
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                      <CardDescription>{article.content}</CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6 space-y-4">
                      {article.qaChecklist?.map((item, idx) => {
                        const itemId = `${article.id}-${idx}`
                        const isChecked = checkedItems.has(itemId)

                        return (
                          <div key={itemId} className="flex items-start gap-3 p-2 rounded hover:bg-slate-50">
                            <Checkbox
                              id={itemId}
                              checked={isChecked}
                              onCheckedChange={() => toggleCheck(itemId)}
                              className="mt-1"
                            />
                            <label
                              htmlFor={itemId}
                              className={`flex-1 cursor-pointer text-sm leading-relaxed ${
                                isChecked
                                  ? 'line-through text-slate-500'
                                  : 'text-slate-700'
                              }`}
                            >
                              {item}
                            </label>
                          </div>
                        )
                      })}

                      {/* Progress */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex justify-between items-center text-sm mb-2">
                          <span className="font-semibold text-slate-700">Progress</span>
                          <span className="text-slate-600">
                            {Array.from(checkedItems).filter((id) =>
                              id.startsWith(`${article.id}-`)
                            ).length}{' '}
                            / {article.qaChecklist?.length}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                (Array.from(checkedItems).filter((id) =>
                                  id.startsWith(`${article.id}-`)
                                ).length /
                                  (article.qaChecklist?.length || 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Top Issues Tab */}
          <TabsContent value="issues" className="space-y-4">
            <Card className="border-0 shadow-md bg-amber-50 border-l-4 border-amber-500">
              <CardHeader>
                <CardTitle className="text-amber-900">Critical Quality Checks</CardTitle>
                <CardDescription className="text-amber-800">
                  Common issues to monitor and resolve
                </CardDescription>
              </CardHeader>
            </Card>

            {topIssues.map((issue) => {
              const issueTeam = appData.teams.find((t) => t.id === issue.team)
              const severityColors: Record<string, { bg: string; text: string; badge: string }> =
                {
                  critical: {
                    bg: 'bg-red-50',
                    text: 'text-red-900',
                    badge: 'bg-red-100 text-red-800',
                  },
                  high: {
                    bg: 'bg-orange-50',
                    text: 'text-orange-900',
                    badge: 'bg-orange-100 text-orange-800',
                  },
                  medium: {
                    bg: 'bg-yellow-50',
                    text: 'text-yellow-900',
                    badge: 'bg-yellow-100 text-yellow-800',
                  },
                }

              const colors = severityColors[issue.severity] || severityColors.medium

              return (
                <Card
                  key={issue.id}
                  className={`border-0 shadow-md border-l-4 ${
                    issue.severity === 'critical'
                      ? 'border-red-500'
                      : issue.severity === 'high'
                        ? 'border-orange-500'
                        : 'border-yellow-500'
                  } ${colors.bg}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className={colors.text}>
                            {issue.title}
                          </CardTitle>
                          <Badge className={colors.badge}>{issue.severity}</Badge>
                        </div>
                        <CardDescription className={colors.text}>
                          {issue.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      {issueTeam?.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const article = appData.kbArticles.find(
                          (a) => a.id === issue.relatedArticle
                        )
                        if (article) {
                          window.location.href = `/kb/${article.id}`
                        }
                      }}
                    >
                      View Guidelines
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* QA Metrics Tab */}
          <TabsContent value="metrics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">
                    {appData.teams.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    QA Guidelines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">
                    {articlesWithChecklists.length}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Checklist Items
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-900">
                    {articlesWithChecklists.reduce(
                      (sum, a) => sum + (a.qaChecklist?.length || 0),
                      0
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* QA Summary by Team */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                QA Coverage by Team
              </h3>
              <div className="space-y-3">
                {appData.teams.map((team) => {
                  const teamArticles = appData.kbArticles.filter(
                    (a) =>
                      a.teamId === team.id &&
                      (a.tags.includes('QA') || a.qaChecklist)
                  )

                  return (
                    <Card key={team.id} className="border-0 shadow-sm">
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-slate-900">
                            {team.name}
                          </span>
                          <Badge variant="secondary">
                            {teamArticles.length} guidelines
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600">
                          {teamArticles
                            .map((a) => a.title)
                            .slice(0, 3)
                            .join(', ')}
                          {teamArticles.length > 3 &&
                            ` +${teamArticles.length - 3} more`}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
