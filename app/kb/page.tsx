'use client'

import { useState } from 'react'
import Link from 'next/link'
import { appData, searchArticles } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Navigation from '@/components/navigation'
import { BookOpen, Copy, Check, ArrowRight, FileText } from 'lucide-react'
import { toast } from 'sonner'

export default function KBPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('articles')
  const [templateLanguage, setTemplateLanguage] = useState<'en' | 'ar'>('en')
  const [templateRecipient, setTemplateRecipient] = useState<'all' | 'client' | 'influencer'>('all')

  // Get all unique tags
  const allTags = Array.from(
    new Set(appData.kbArticles.flatMap((a) => a.tags))
  ).sort()

  // Filter articles
  const filteredArticles = searchArticles(searchQuery).filter((article) => {
    const matchesTeam = selectedTeam === 'all' || article.teamId === selectedTeam
    const matchesTag = selectedTag === 'all' || article.tags.includes(selectedTag)
    return matchesTeam && matchesTag
  })

  // Get all communication templates
  const allTemplates = appData.kbArticles
    .flatMap((article) =>
      (article.templates || []).map((template) => ({
        ...template,
        articleId: article.id,
        articleTitle: article.title,
      }))
    )
    .filter((template) => {
      if (templateRecipient === 'all') return true
      return template.recipientType === templateRecipient || template.recipientType === 'both'
    })
    .sort((a, b) => a.articleTitle.localeCompare(b.articleTitle))

  const handleCopyTemplate = (content: string, templateId: string) => {
    navigator.clipboard.writeText(content)
    setCopied(templateId)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Knowledge Base</h1>
          <p className="text-black">
            SOPs, templates, playbooks, and checklists for all operations
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="articles">
              <FileText className="w-4 h-4 mr-2" />
              Articles
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Copy className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="text-sm font-semibold text-black block mb-2">
                Search articles
              </label>
                  <Input
                    placeholder="Search by title, content, or tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="min-w-48">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Filter by team
                  </label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger>
                      <SelectValue placeholder="All teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All teams</SelectItem>
                      {appData.teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="min-w-48">
                  <label className="text-sm font-semibold text-slate-700 block mb-2">
                    Filter by tag
                  </label>
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger>
                      <SelectValue placeholder="All tags" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      <SelectItem value="all">All tags</SelectItem>
                      {allTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            {filteredArticles.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
                <CardContent className="py-12 text-center">
                  <p className="text-black">No articles match your filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredArticles.map((article) => {
                  const team = appData.teams.find((t) => t.id === article.teamId)
                  const flow = appData.flows.find((f) => f.id === article.flowId)

                  return (
                    <Card
                      key={article.id}
                      className="border-0 shadow-md hover:shadow-lg transition-all flex flex-col"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <BookOpen className="w-5 h-5 text-purple-600" />
                          <Badge variant="secondary" className="text-xs">
                            {article.steps.length} steps
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{article.title}</CardTitle>
                        <CardDescription className="text-sm">
                          {team?.name}
                          {flow && ` • ${flow.title}`}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="flex-1 space-y-4">
                        {/* Tags */}
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {article.tags.slice(0, 4).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Preview */}
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {article.content || article.steps.join(' • ')}
                        </p>

                        {/* Metadata */}
                        <div className="text-xs text-slate-500 space-y-1">
                          {article.inputs && article.inputs.length > 0 && (
                            <p>
                              <strong>Inputs:</strong> {article.inputs.join(', ')}
                            </p>
                          )}
                          {article.outputs && article.outputs.length > 0 && (
                            <p>
                              <strong>Outputs:</strong> {article.outputs.join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Action */}
                        <Button asChild className="w-full mt-4">
                          <Link href={`/kb/${article.id}`}>
                            Read More <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            {/* Template Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
              <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="text-sm font-semibold text-black block mb-2">
                Filter by tag
              </label>
                  <Select value={templateRecipient} onValueChange={(v: any) => setTemplateRecipient(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All recipients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Recipients</SelectItem>
                      <SelectItem value="client">Client Only</SelectItem>
                      <SelectItem value="influencer">Influencer Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-48">
                  <label className="text-sm font-semibold text-black block mb-2">
                    Language
                  </label>
                  <Select value={templateLanguage} onValueChange={(v: any) => setTemplateLanguage(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {allTemplates.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
              <CardContent className="py-12 text-center">
                <p className="text-black">No templates match your filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {allTemplates.map((template, idx) => {
                  const templateId = `${template.articleId}-${idx}`
                  return (
                    <Card key={templateId} className="border-0 shadow-md overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CardTitle className="text-base">
                                {templateLanguage === 'en' ? template.name : template.nameAr}
                              </CardTitle>
                              <Badge variant="outline" className="text-xs">
                                {template.recipientType === 'client' && '👤 Client'}
                                {template.recipientType === 'influencer' && '⭐ Influencer'}
                                {template.recipientType === 'both' && '👥 Both'}
                              </Badge>
                            </div>
                            <CardDescription>
                              From:{' '}
                              <Link
                                href={`/kb/${template.articleId}`}
                                className="text-purple-600 hover:underline"
                              >
                                {template.articleTitle}
                              </Link>
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleCopyTemplate(
                                templateLanguage === 'en'
                                  ? template.contentEn
                                  : template.contentAr,
                                templateId
                              )
                            }
                          >
                            {copied === templateId ? (
                              <>
                                <Check className="w-4 h-4" />
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <pre className="bg-slate-100 p-4 rounded text-xs overflow-x-auto mb-3 whitespace-pre-wrap">
                          {templateLanguage === 'en'
                            ? template.contentEn
                            : template.contentAr}
                        </pre>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
