'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Navigation from '@/components/navigation'
import { ArrowRight, BarChart3 } from 'lucide-react'

const nodeTypeColors: Record<string, { bg: string; text: string }> = {
  action: { bg: 'bg-slate-100', text: 'text-slate-700' },
  decision: { bg: 'bg-blue-100', text: 'text-blue-700' },
  artifact: { bg: 'bg-purple-100', text: 'text-purple-700' },
  qa: { bg: 'bg-amber-100', text: 'text-amber-700' },
  escalation: { bg: 'bg-red-100', text: 'text-red-700' },
}

export default function FlowsPage() {
  const [selectedTeam, setSelectedTeam] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFlows = appData.flows.filter((flow) => {
    const matchesTeam = selectedTeam === 'all' || flow.teamId === selectedTeam
    const matchesSearch =
      !searchQuery ||
      flow.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flow.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTeam && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navigation />

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Decision Trees</h1>
          <p className="text-slate-600">
            Explore all operational workflows visualized as interactive flowcharts
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 mb-8 shadow-sm">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <label className="text-sm font-semibold text-slate-700 block mb-2">
                Search flows
              </label>
              <Input
                placeholder="Search by title or description..."
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
          </div>
        </div>

        {/* Flows Grid */}
        {filteredFlows.length === 0 ? (
          <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
            <CardContent className="py-12 text-center">
              <p className="text-slate-600">No flows match your filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFlows.map((flow) => {
              const team = appData.teams.find((t) => t.id === flow.teamId)
              const actionCount = flow.nodes.filter((n) => n.type === 'action').length
              const decisionCount = flow.nodes.filter((n) => n.type === 'decision').length
              const qaCount = flow.nodes.filter((n) => n.type === 'qa').length

              return (
                <Card
                  key={flow.id}
                  className="border-0 shadow-md hover:shadow-lg transition-all hover:scale-105 flex flex-col"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      <Badge variant="secondary" className="text-xs">
                        {flow.nodes.length} nodes
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{flow.title}</CardTitle>
                    <CardDescription>{flow.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 space-y-4">
                    {/* Team */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Team
                      </p>
                      <p className="text-sm text-slate-700">{team?.name}</p>
                    </div>

                    {/* Node Breakdown */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                        Node Types
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {actionCount > 0 && (
                          <Badge
                            variant="outline"
                            className={`${nodeTypeColors.action.bg} ${nodeTypeColors.action.text} border-0`}
                          >
                            {actionCount} Actions
                          </Badge>
                        )}
                        {decisionCount > 0 && (
                          <Badge
                            variant="outline"
                            className={`${nodeTypeColors.decision.bg} ${nodeTypeColors.decision.text} border-0`}
                          >
                            {decisionCount} Decisions
                          </Badge>
                        )}
                        {qaCount > 0 && (
                          <Badge
                            variant="outline"
                            className={`${nodeTypeColors.qa.bg} ${nodeTypeColors.qa.text} border-0`}
                          >
                            {qaCount} QA
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {flow.tags.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                          Tags
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {flow.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action */}
                    <Button asChild className="w-full mt-4">
                      <Link href={`/flows/${flow.id}`}>
                        View Flowchart <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
