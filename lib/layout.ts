import { Node, Edge } from 'reactflow'
import dagre from 'dagre'
import { FlowNode, Edge as DataEdge } from '@/lib/data'

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}))

export function layoutNodes(
  flowNodes: FlowNode[],
  flowEdges: DataEdge[]
): Node[] {
  dagreGraph.setGraph({ rankdir: 'TB', ranksep: 100, nodesep: 80 })

  flowNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 200, height: 100 })
  })

  flowEdges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  return flowNodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id)

    return {
      id: node.id,
      data: {
        id: node.id,
        type: node.type,
        title: node.title,
        description: node.description,
      },
      position: { x, y },
      type: 'flowNode',
    }
  })
}
