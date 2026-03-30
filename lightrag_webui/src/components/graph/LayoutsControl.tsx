/**
 * LayoutsControl – 2D layout presets for ForceGraph2D.
 */
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { GripIcon } from 'lucide-react'
import {
  forceManyBody,
  forceCenter,
  forceCollide,
  forceRadial
} from 'd3-force'

import Button from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/Command'
import { controlButtonVariant } from '@/lib/constants'
import { FGMethods } from '@/features/GraphViewer'
import { useGraphStore } from '@/stores/graph'

interface LayoutsControlProps {
  fgRef: React.RefObject<FGMethods | undefined>
}

// ── Layout names ────────────────────────────────────────────────────────────
type Layout2D =
  | 'Force Atlas'
  | 'Radial Shell'
  | 'Center Pull'
  | 'Spread'

const LAYOUT_KEYS: Layout2D[] = [
  'Force Atlas',
  'Radial Shell',
  'Center Pull',
  'Spread',
]

// ─────────────────────────────────────────────────────────────────────────────

const LayoutsControl = ({ fgRef }: LayoutsControlProps) => {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const [activeLayout, setActiveLayout] = useState<Layout2D>('Force Atlas')

  const reheat = useCallback(() => {
    // Restart simulation so new forces take effect
    const fg = fgRef.current as any
    if (fg?.d3ReheatSimulation) {
      fg.d3ReheatSimulation()
    }
  }, [fgRef])

  const applyLayout = useCallback(
    (layout: Layout2D) => {
      const fg = fgRef.current
      if (!fg) return
      setActiveLayout(layout)
      setOpened(false)

      const rawGraph = useGraphStore.getState().rawGraph
      const nodes = rawGraph?.nodes ?? []

      const centerNode = nodes.length
        ? nodes.reduce((m, n) => ((n.degree ?? 0) > (m.degree ?? 0) ? n : m), nodes[0])
        : null
      const centerDeg = centerNode?.degree ?? 1

      switch (layout) {
        // ── Standard force-directed (2D) ─────────────────────────────────
        case 'Force Atlas': {
          fg.d3Force('charge', forceManyBody().strength(-180))
          fg.d3Force('center', forceCenter(0, 0))
          fg.d3Force('radial', null)
          fg.d3Force(
            'collide',
            forceCollide((n: any) => (n.size ?? 6) * 1.6).strength(0.8)
          )
          fg.d3VelocityDecay?.(0.4)
          break
        }

        // ── Two concentric circle shells ─────────────────────────────────
        case 'Radial Shell': {
          fg.d3Force('charge', forceManyBody().strength(-100))
          fg.d3Force('center', forceCenter(0, 0))
          fg.d3Force(
            'radial',
            forceRadial(
              (n: any) => {
                if (n.id === centerNode?.id) return 0
                return (n.degree ?? 0) >= centerDeg * 0.45 ? 80 : 200
              },
              0, 0
            ).strength(0.55)
          )
          fg.d3Force(
            'collide',
            forceCollide((n: any) => (n.size ?? 6) * 1.5).strength(0.7)
          )
          fg.d3VelocityDecay?.(0.5)
          break
        }

        // ── All nodes pulled tightly to center ───────────────────────────
        case 'Center Pull': {
          fg.d3Force('charge', forceManyBody().strength(-50))
          fg.d3Force('center', forceCenter(0, 0))
          fg.d3Force('radial', null)
          fg.d3Force(
            'collide',
            forceCollide((n: any) => (n.size ?? 6) * 1.3).strength(0.9)
          )
          fg.d3VelocityDecay?.(0.55)
          break
        }

        // ── Maximum spread, high repulsion ───────────────────────────────
        case 'Spread': {
          fg.d3Force('charge', forceManyBody().strength(-350))
          fg.d3Force('center', forceCenter(0, 0))
          fg.d3Force('radial', null)
          fg.d3Force(
            'collide',
            forceCollide((n: any) => (n.size ?? 6) * 2.5).strength(0.6)
          )
          fg.d3VelocityDecay?.(0.3)
          break
        }
      }

      reheat()
    },
    [fgRef, reheat]
  )

  return (
    <div>
      <Popover open={opened} onOpenChange={setOpened}>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant={controlButtonVariant}
            onClick={() => setOpened(e => !e)}
            tooltip={t('graphPanel.sideBar.layoutsControl.layoutGraph')}
          >
            <GripIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          sideOffset={8}
          collisionPadding={5}
          sticky="always"
          className="min-w-auto p-1"
        >
          <Command>
            <CommandList>
              <CommandGroup>
                {LAYOUT_KEYS.map(name => (
                  <CommandItem
                    key={name}
                    onSelect={() => applyLayout(name)}
                    className="cursor-pointer text-xs"
                    data-active={name === activeLayout}
                  >
                    {name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}

export default LayoutsControl
