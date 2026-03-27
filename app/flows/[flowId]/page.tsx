'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getFlowById, getNodeById, appData, getRoleById } from '@/lib/data'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Navigation from '@/components/navigation'
import FlowViewer from '@/components/flow-viewer'
import { ChevronRight, Copy, Check, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

export default function FlowDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const flowId = params.flowId as string
  const nodeParam = searchParams.get('node')

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodeParam)
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load role from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('selectedRole')
    if (saved) {
      setSelectedRole(saved)
    }
  }, [])

  const flow = getFlowById(flowId)
  const selectedNode = selectedNodeId ? getNodeById(flowId, selectedNodeId) : null

  useEffect(() => {
    if (nodeParam) {
      setSelectedNodeId(nodeParam)
      // Auto-scroll to panel
      setTimeout(() => {
        const panel = document.getElementById('node-panel')
        panel?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    }
  }, [nodeParam])

  if (!mounted || !flow) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navigation />
        <main className="container max-w-6xl mx-auto px-4 py-12">
          <p>Flow not found</p>
        </main>
      </div>
    )
  }

  const team = appData.teams.find((t) => t.id === flow.teamId)

  const handleCopyTemplate = (content: string) => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navigation />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Flowchart Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 p-4 shadow-sm">
            <div className="container max-w-6xl mx-auto px-4">
              <div className="flex items-center gap-2 mb-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/flows" className="gap-1">
                    <ArrowLeft className="w-4 h-4" />
                    Flows
                  </Link>
                </Button>
                <ChevronRight className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">{flow.title}</span>
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{flow.title}</h1>
                  <p className="text-slate-600">{flow.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-700">{team?.name}</p>
                  <div className="flex gap-1 mt-2 justify-end">
                    {flow.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Flowchart Viewer */}
          <div className="flex-1 overflow-hidden">
            <FlowViewer
              flow={flow}
              selectedNodeId={selectedNodeId || ''}
              onNodeSelect={setSelectedNodeId}
              selectedRole={selectedRole}
            />
          </div>
        </div>

        {/* Right Panel - Node Details */}
        <div
          id="node-panel"
          className="w-96 bg-white border-l border-slate-200 overflow-y-auto shadow-lg"
        >
          {selectedNode ? (
            <div className="p-6">
              {/* Node Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={`text-sm capitalize ${
                      selectedNode.type === 'action'
                        ? 'bg-slate-100'
                        : selectedNode.type === 'decision'
                          ? 'bg-blue-100'
                          : selectedNode.type === 'artifact'
                            ? 'bg-purple-100'
                            : selectedNode.type === 'qa'
                              ? 'bg-amber-100'
                              : 'bg-red-100'
                    }`}
                  >
                    {selectedNode.type}
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">{selectedNode.id}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">
                  {selectedNode.title}
                </h2>
                <p className="text-sm text-slate-600">{selectedNode.description}</p>
              </div>

              <Separator className="my-4" />

              {/* Owner Roles */}
              {selectedNode.ownerRoleIds.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Owner Roles
                  </p>
                  <div className="space-y-1">
                    {selectedNode.ownerRoleIds.map((roleId) => {
                      const role = getRoleById(roleId)
                      return (
                        <p key={roleId} className="text-sm text-slate-700">
                          {role?.name}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tools */}
              {selectedNode.toolIds.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Tools
                  </p>
                  <div className="space-y-1">
                    {selectedNode.toolIds.map((toolId) => {
                      const tool = appData.tools.find((t) => t.id === toolId)
                      return (
                        <p key={toolId} className="text-sm text-slate-700">
                          {tool?.name}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Artifacts */}
              {selectedNode.artifactIds.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Artifacts
                  </p>
                  <div className="space-y-1">
                    {selectedNode.artifactIds.map((artifactId) => {
                      const artifact = appData.artifacts.find((a) => a.id === artifactId)
                      return (
                        <p key={artifactId} className="text-sm text-slate-700">
                          {artifact?.name}
                        </p>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedNode.tags.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* SLA */}
              {selectedNode.sla && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    SLA
                  </p>
                  <p className="text-sm text-slate-700 bg-amber-50 p-2 rounded">
                    {selectedNode.sla}
                  </p>
                </div>
              )}

              <Separator className="my-4" />

              {/* KB Article Link */}
              {selectedNode.kbArticleId && (
                <Button asChild className="w-full mb-4" variant="default">
                  <Link href={`/kb/${selectedNode.kbArticleId}?node=${selectedNode.id}&flow=${flowId}`}>
                    Open KB Article
                  </Link>
                </Button>
              )}

              {/* Outputs */}
              {selectedNode.outputs && selectedNode.outputs.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Outputs
                  </p>
                  <div className="space-y-1">
                    {selectedNode.outputs.map((output) => (
                      <p key={output} className="text-sm text-slate-700">
                        • {output}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500">
              <p className="text-sm">Click on a node in the flowchart to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
