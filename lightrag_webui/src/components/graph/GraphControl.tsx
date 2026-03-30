/**
 * GraphControl – 2D force simulation configuration for ForceGraph2D.
 */
import { useEffect, useRef } from 'react'
import { forceManyBody, forceCenter, forceCollide, forceRadial } from 'd3-force'

import { FGMethods } from '@/features/GraphViewer'

interface GraphControlProps {
  fgRef: React.RefObject<FGMethods | undefined>
  graphData: { nodes: any[]; links: any[] }
}

const GraphControl = ({ fgRef, graphData }: GraphControlProps) => {
  const forcesConfiguredRef = useRef(false)

  useEffect(() => {
    const fg = fgRef.current
    if (!fg || !graphData.nodes.length) {
      forcesConfiguredRef.current = false
      return
    }
    if (forcesConfiguredRef.current) return
    forcesConfiguredRef.current = true

    // Highest-degree node anchors the center
    const centerNode = graphData.nodes.reduce(
      (max, n) => ((n.degree ?? 0) > (max.degree ?? 0) ? n : max),
      graphData.nodes[0]
    )
    const centerDegree: number = centerNode?.degree ?? 1

    // Many-body repulsion – stronger for 2D so nodes spread nicely
    fg.d3Force('charge', forceManyBody().strength(-180))

    // Weak centering
    fg.d3Force('center', forceCenter(0, 0).strength(0.05))

    // Radial shells: hub nodes closer to center, leaf nodes further out
    fg.d3Force(
      'radial',
      forceRadial(
        (node: any) => {
          if (node.id === centerNode?.id) return 0
          const deg: number = node.degree ?? 0
          return deg >= centerDegree * 0.45 ? 80 : 200
        },
        0,
        0
      ).strength(0.3)
    )

    // Collision radius based on visual node size
    fg.d3Force(
      'collide',
      forceCollide((node: any) => (node.size ?? 6) * 1.8).strength(0.9)
    )

    // Link distance scales with target node size
    const linkForce = fg.d3Force('link')
    if (linkForce) {
      linkForce.distance?.((link: any) => {
        const srcSize = (link.source?.size ?? 6)
        const tgtSize = (link.target?.size ?? 6)
        return 40 + (srcSize + tgtSize) * 2
      })
      linkForce.strength?.(0.5)
    }

    fg.d3VelocityDecay?.(0.45)
    fg.d3AlphaMin?.(0.001)
  }, [fgRef, graphData.nodes])

  return null
}

export default GraphControl
