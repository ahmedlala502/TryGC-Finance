'use client'

import { Handle, Position } from 'reactflow'
import { Badge } from '@/components/ui/badge'

interface FlowNodeProps {
  data: {
    id: string
    type: 'action' | 'decision' | 'artifact' | 'qa' | 'escalation'
    title: string
    description: string
    selected?: boolean
  }
  selected?: boolean
}

const typeStyles: Record<string, { bg: string; border: string; icon: string }> =
  {
    action: { bg: 'bg-slate-100', border: 'border-slate-300', icon: '→' },
    decision: { bg: 'bg-blue-100', border: 'border-blue-300', icon: '◊' },
    artifact: { bg: 'bg-purple-100', border: 'border-purple-300', icon: '📄' },
    qa: { bg: 'bg-amber-100', border: 'border-amber-300', icon: '✓' },
    escalation: { bg: 'bg-red-100', border: 'border-red-300', icon: '⚠' },
  }

export default function FlowNode({ data, selected }: FlowNodeProps) {
  const style = typeStyles[data.type]

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-48 max-w-xs shadow-md transition-all ${
        style.bg
      } ${style.border} ${
        selected ? 'ring-2 ring-purple-500 scale-105' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-start gap-2 mb-2">
        <span className="text-lg">{style.icon}</span>
        <h3 className="font-semibold text-sm text-slate-900 flex-1">{data.title}</h3>
      </div>

      <p className="text-xs text-slate-700 mb-2 line-clamp-2">
        {data.description}
      </p>

      <Badge variant="outline" className="text-xs">
        {data.type}
      </Badge>

      <Handle type="source" position={Position.Bottom} />
    </div>
  )
}
