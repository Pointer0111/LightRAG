/**
 * GraphSearch – node search bar for the 3D graph viewer.
 *
 * Replaced @react-sigma/graph-search with a self-contained implementation
 * that reads node data from rawGraph (via useGraphStore) instead of sigmaGraph,
 * so it works independently of the Sigma rendering context.
 */
import { FC, useCallback, useEffect } from 'react'
import MiniSearch from 'minisearch'
import { useTranslation } from 'react-i18next'

import { AsyncSearch } from '@/components/ui/AsyncSearch'
import { searchResultLimit } from '@/lib/constants'
import { useGraphStore } from '@/stores/graph'

// ── Shared option type (consumed by both GraphSearch and GraphViewer) ────
export interface SearchOptionItem {
  id: string
  type: 'nodes' | 'message'
  message?: string
}
// Backward-compat alias
export type OptionItem = SearchOptionItem

// ── Node option rendered in the dropdown ─────────────────────────────────
const NodeOption = ({ id }: { id: string }) => {
  const rawGraph = useGraphStore.use.rawGraph()
  if (!rawGraph) return null

  const node = rawGraph.getNode(id)
  if (!node) return null

  const label = node.labels.join(', ') || id
  const color = node.color || '#4DE8FF'
  const size = node.size || 6

  return (
    <div className="flex items-center gap-2 p-2 text-sm">
      <div
        className="flex-shrink-0 rounded-full"
        style={{
          width: Math.max(8, Math.min(size * 1.5, 16)),
          height: Math.max(8, Math.min(size * 1.5, 16)),
          backgroundColor: color
        }}
      />
      <span className="truncate">{label}</span>
    </div>
  )
}

function OptionComponent(item: SearchOptionItem) {
  if (item.type === 'nodes') return <NodeOption id={item.id} />
  if (item.type === 'message') return <div className="p-2 text-xs text-muted-foreground">{item.message}</div>
  return null
}

// ── Main search input ─────────────────────────────────────────────────────
interface GraphSearchProps {
  value?: SearchOptionItem | null
  onFocus?: (item: SearchOptionItem | null) => void
  onChange: (item: SearchOptionItem | null) => void
}

const GraphSearch: FC<GraphSearchProps> = ({ value, onFocus, onChange }) => {
  const { t } = useTranslation()
  const rawGraph = useGraphStore.use.rawGraph()
  const searchEngine = useGraphStore.use.searchEngine()

  // Rebuild search engine when rawGraph changes
  useEffect(() => {
    if (!rawGraph || !rawGraph.nodes.length) {
      useGraphStore.getState().resetSearchEngine()
      return
    }

    const engine = new MiniSearch<{ id: string; label: string }>({
      idField: 'id',
      fields: ['label'],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { label: 2 } }
    })

    const docs = rawGraph.nodes.map(n => ({
      id: n.id,
      label: n.labels.join(', ')
    }))
    if (docs.length) engine.addAll(docs)

    useGraphStore.getState().setSearchEngine(engine)
  }, [rawGraph])

  const loadOptions = useCallback(
    async (query?: string): Promise<SearchOptionItem[]> => {
      if (!rawGraph || !searchEngine) return []

      const allIds = rawGraph.nodes.map(n => n.id)

      if (!query) {
        return allIds.slice(0, searchResultLimit).map(id => ({ id, type: 'nodes' as const }))
      }

      // Prefix / fuzzy search
      let result: SearchOptionItem[] = (searchEngine.search(query) as { id: string }[])
        .filter(r => rawGraph.getNode(r.id))
        .map(r => ({ id: r.id, type: 'nodes' as const }))

      // Supplement with mid-string matches if results are sparse
      if (result.length < 5) {
        const matched = new Set(result.map(r => r.id))
        const mid = rawGraph.nodes
          .filter(n => {
            if (matched.has(n.id)) return false
            const lbl = n.labels.join(', ').toLowerCase()
            return !lbl.startsWith(query.toLowerCase()) && lbl.includes(query.toLowerCase())
          })
          .map(n => ({ id: n.id, type: 'nodes' as const }))
        result = [...result, ...mid]
      }

      if (result.length <= searchResultLimit) return result

      return [
        ...result.slice(0, searchResultLimit),
        {
          id: '__message_item',
          type: 'message' as const,
          message: t('graphPanel.search.message', { count: result.length - searchResultLimit })
        }
      ]
    },
    [rawGraph, searchEngine, t]
  )

  return (
    <AsyncSearch
      className="bg-background/60 w-24 rounded-xl border-1 opacity-60 backdrop-blur-lg transition-all hover:w-fit hover:opacity-100 w-full"
      fetcher={loadOptions}
      renderOption={OptionComponent}
      getOptionValue={item => item.id}
      value={value && value.type !== 'message' ? value.id : null}
      onChange={id => {
        if (id !== '__message_item') onChange(id ? { id, type: 'nodes' } : null)
      }}
      onFocus={id => {
        if (id !== '__message_item' && onFocus) onFocus(id ? { id, type: 'nodes' } : null)
      }}
      ariaLabel={t('graphPanel.search.placeholder')}
      placeholder={t('graphPanel.search.placeholder')}
      noResultsMessage={t('graphPanel.search.placeholder')}
    />
  )
}

export default GraphSearch
