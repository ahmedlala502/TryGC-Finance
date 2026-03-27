'use client'

import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getArticleById, appData, getFlowById, getNodeById } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import Navigation from '@/components/navigation'
import { ChevronRight, Copy, Check, ArrowLeft, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export default function KBArticlePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const articleId = params.articleId as string
  const nodeParam = searchParams.get('node')
  const flowParam = searchParams.get('flow')

  const [copied, setCopied] = useState<string | null>(null)
  const [templateLanguage, setTemplateLanguage] = useState<'en' | 'ar'>('en')

  const article = getArticleById(articleId)
  const team = article ? appData.teams.find((t) => t.id === article.teamId) : null
  const flow = article?.flowId ? getFlowById(article.flowId) : null
  const relatedNode = nodeParam && flowParam ? getNodeById(flowParam, nodeParam) : null

  const handleCopyTemplate = (content: string, templateName: string) => {
    navigator.clipboard.writeText(content)
    setCopied(templateName)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(null), 2000)
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation />
        <main className="container max-w-4xl mx-auto px-4 py-12">
          <p>Article not found</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <main className="container max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Button asChild variant="ghost" size="sm">
            <Link href="/kb" className="gap-1">
              <ArrowLeft className="w-4 h-4" />
              Knowledge Base
            </Link>
          </Button>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">{article.title}</span>
        </div>

        {/* Article Header */}
        <Card className="mb-8 border-0 shadow-lg overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {article.title}
                </h1>
                <div className="flex gap-4 text-sm text-slate-600">
                  <span>{team?.name}</span>
                  {flow && <span>• {flow.title}</span>}
                </div>
              </div>
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {article.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Related Node Highlight */}
            {relatedNode && (
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                <p className="text-sm text-purple-900">
                  <strong>Related Node:</strong> {relatedNode.title}
                </p>
                {flowParam && (
                  <Button asChild size="sm" variant="outline" className="mt-2 bg-transparent">
                    <Link href={`/flows/${flowParam}?node=${nodeParam}`}>
                      View in Flowchart <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Purpose/Content */}
          {article.content && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Overview</h2>
              <p className="text-slate-700 leading-relaxed">{article.content}</p>
            </section>
          )}

          {/* Triggers / When to Use */}
          {article.triggers && article.triggers.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-3">When to Use</h2>
              <ul className="space-y-2">
                {article.triggers.map((trigger, idx) => (
                  <li key={idx} className="text-slate-700 flex gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    {trigger}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Inputs */}
          {article.inputs && article.inputs.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Inputs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {article.inputs.map((input, idx) => (
                  <Card key={idx} className="border border-slate-200">
                    <CardContent className="pt-4">
                      <p className="text-sm text-slate-700">{input}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Steps */}
          <section className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Steps</h2>
            <ol className="space-y-3">
              {article.steps.map((step, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Outputs */}
          {article.outputs && article.outputs.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-3">Outputs</h2>
              <div className="space-y-2">
                {article.outputs.map((output, idx) => (
                  <div
                    key={idx}
                    className="bg-green-50 border border-green-200 rounded p-3 text-sm text-green-900"
                  >
                    ✓ {output}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Templates */}
          {article.templates && article.templates.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Communication Templates</h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={templateLanguage === 'en' ? 'default' : 'outline'}
                    onClick={() => setTemplateLanguage('en')}
                  >
                    English
                  </Button>
                  <Button
                    size="sm"
                    variant={templateLanguage === 'ar' ? 'default' : 'outline'}
                    onClick={() => setTemplateLanguage('ar')}
                  >
                    العربية
                  </Button>
                </div>
              </div>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {article.templates.map((template, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`template-${idx}`}
                    className="border border-slate-200 rounded-lg px-4"
                  >
                    <AccordionTrigger className="py-3 hover:bg-slate-50">
                      <div className="flex items-center gap-2 text-left">
                        <span>
                          {templateLanguage === 'en' ? template.name : template.nameAr}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {template.recipientType === 'client' && '👤 Client'}
                          {template.recipientType === 'influencer' && '⭐ Influencer'}
                          {template.recipientType === 'both' && '👥 Both'}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-0 pb-3">
                      <pre className="bg-slate-100 p-4 rounded text-xs overflow-x-auto mb-3 whitespace-pre-wrap text-right" dir={templateLanguage === 'ar' ? 'rtl' : 'ltr'}>
                        {templateLanguage === 'en'
                          ? template.contentEn
                          : template.contentAr}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCopyTemplate(
                            templateLanguage === 'en'
                              ? template.contentEn
                              : template.contentAr,
                            `${template.id}-${templateLanguage}`
                          )
                        }
                        className="w-full"
                      >
                        {copied === `${template.id}-${templateLanguage}` ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Template
                          </>
                        )}
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          )}

          {/* Do's & Don'ts */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-green-500">
              <h3 className="text-lg font-bold text-green-900 mb-3">Do's ✓</h3>
              <ul className="space-y-2">
                {article.dos.map((item, idx) => (
                  <li key={idx} className="text-slate-700 flex gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md border-l-4 border-red-500">
              <h3 className="text-lg font-bold text-red-900 mb-3">Don'ts ✗</h3>
              <ul className="space-y-2">
                {article.donts.map((item, idx) => (
                  <li key={idx} className="text-slate-700 flex gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* QA Checklist */}
          {article.qaChecklist && article.qaChecklist.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                QA Checklist
              </h2>
              <div className="space-y-2">
                {article.qaChecklist.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <input
                      type="checkbox"
                      id={`qa-${idx}`}
                      className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                    />
                    <label htmlFor={`qa-${idx}`} className="text-slate-700 cursor-pointer">
                      {item}
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Escalation Rules */}
          {article.escalationRules && article.escalationRules.length > 0 && (
            <section className="bg-white rounded-lg p-6 shadow-md border-l-4 border-amber-500">
              <h2 className="text-xl font-bold text-amber-900 mb-3">
                Escalation Rules
              </h2>
              <ul className="space-y-2">
                {article.escalationRules.map((rule, idx) => (
                  <li key={idx} className="text-amber-900 flex gap-2">
                    <span className="text-amber-600 font-bold">⚠</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* SLA */}
          {article.sla && (
            <section className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-6 shadow-md border border-blue-200">
              <h3 className="text-lg font-bold text-blue-900 mb-2">SLA / Timing</h3>
              <p className="text-blue-800">{article.sla}</p>
            </section>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-12">
          <Button asChild variant="outline">
            <Link href="/kb">Back to Knowledge Base</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
