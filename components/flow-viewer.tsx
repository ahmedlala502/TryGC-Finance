'use client'

import React from "react"

import { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MiniMap,
  OnNodesChange,
  OnEdgesChange,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Flow, FlowNode as FlowNodeType } from '@/lib/data'
import FlowNode from './flow-node'
import { layoutNodes } from '@/lib/layout'

interface FlowViewerProps {
  flow: Flow
  selectedNodeId?: string
  onNodeSelect?: (nodeId: string) => void
  selectedRole?: string
}

const nodeTypes = {
  flowNode: FlowNode,
}

export default function FlowViewer({
  flow,
  selectedNodeId,
  onNodeSelect,
  selectedRole,
}: FlowViewerProps) {
  const [nodes, setNodes, onNodesState] = useNodesState([])
  const [edges, setEdges, onEdgesState] = useEdgesState([])
  const onNodesChange: OnNodesChange = useCallback((changes) => {
    onNodesState(changes)
  }, [onNodesState])

  const onEdgesChange: OnEdgesChange = useCallback((changes) => {
    onEdgesState(changes)
  }, [onEdgesState])

  // Initialize nodes and edges with layout
  useEffect(() => {
    const layoutedNodes = layoutNodes(flow.nodes, flow.edges)
    
    // Add role-based styling if a role is selected
    if (selectedRole) {
      const enhancedNodes = layoutedNodes.map((node) => {
        const flowNode = flow.nodes.find((n) => n.id === node.data.id)
        const isRelatedToRole = flowNode?.ownerRoleIds.includes(selectedRole)
        
        return {
          ...node,
          data: {
            ...node.data,
            isRelatedToRole,
          },
          style: {
            opacity: isRelatedToRole ? 1 : 0.3,
            borderWidth: isRelatedToRole ? 3 : 2,
          },
        }
      })
      setNodes(enhancedNodes)
    } else {
      setNodes(layoutedNodes)
    }
    
    setEdges(flow.edges)
  }, [flow, setNodes, setEdges, selectedRole])

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const nodeId = node.data.id as string
      onNodeSelect?.(nodeId)
    },
    [onNodeSelect]
  )

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesState}
        onEdgesChange={onEdgesState}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
