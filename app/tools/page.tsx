'use client'

import { appData } from '@/lib/data'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wrench, Files } from 'lucide-react'

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Tools & Artifacts</h1>
          <p className="text-slate-600">
            Complete directory of tools and artifacts used across operations
          </p>
        </div>

        <Tabs defaultValue="tools" className="w-full space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools">
              <Wrench className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="artifacts">
              <Files className="w-4 h-4 mr-2" />
              Artifacts
            </TabsTrigger>
          </TabsList>

          {/* Tools Tab */}
          <TabsContent value="tools">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appData.tools.map((tool) => {
                const toolColor = {
                  Communication: 'from-blue-500 to-cyan-500',
                  'Core System': 'from-purple-500 to-pink-500',
                  Storage: 'from-amber-500 to-orange-500',
                }[tool.category] || 'from-gray-500 to-slate-500'

                return (
                  <Card
                    key={tool.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className={`h-1 bg-gradient-to-r ${toolColor}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <Wrench className="w-5 h-5 text-blue-600" />
                        <Badge variant="secondary">{tool.category}</Badge>
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                        <p className="font-semibold mb-2">Used in workflows:</p>
                        <ul className="space-y-1 text-xs">
                          {appData.flows
                            .filter((flow) =>
                              flow.nodes.some((node) =>
                                node.toolIds.includes(tool.id)
                              )
                            )
                            .map((flow) => (
                              <li key={flow.id} className="text-slate-600">
                                • {flow.title}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Artifacts Tab */}
          <TabsContent value="artifacts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appData.artifacts.map((artifact) => {
                const typeColor = {
                  document: 'from-blue-500 to-cyan-500',
                  sheet: 'from-green-500 to-emerald-500',
                  folder: 'from-amber-500 to-orange-500',
                  system: 'from-purple-500 to-pink-500',
                }[artifact.type] || 'from-gray-500 to-slate-500'

                const typeEmoji = {
                  document: '📄',
                  sheet: '📊',
                  folder: '📁',
                  system: '⚙️',
                }[artifact.type] || '📦'

                return (
                  <Card
                    key={artifact.id}
                    className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden"
                  >
                    <div className={`h-1 bg-gradient-to-r ${typeColor}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-2xl">{typeEmoji}</span>
                        <Badge variant="secondary" className="capitalize">
                          {artifact.type}
                        </Badge>
                      </div>
                      <CardTitle>{artifact.name}</CardTitle>
                      <CardDescription>{artifact.description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="bg-slate-50 p-3 rounded text-sm text-slate-700">
                        <p className="font-semibold mb-2">Referenced in:</p>
                        <ul className="space-y-1 text-xs">
                          {appData.flows
                            .filter((flow) =>
                              flow.nodes.some((node) =>
                                node.artifactIds.includes(artifact.id)
                              )
                            )
                            .map((flow) => (
                              <li key={flow.id} className="text-slate-600">
                                • {flow.title}
                              </li>
                            ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
