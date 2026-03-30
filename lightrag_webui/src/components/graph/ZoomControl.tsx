/**
 * ZoomControl – zoom controls for the ForceGraph2D viewer.
 */
import { useCallback } from 'react'
import { ZoomInIcon, ZoomOutIcon, FullscreenIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/ui/Button'
import { controlButtonVariant } from '@/lib/constants'
import { FGMethods } from '@/features/GraphViewer'

interface ZoomControlProps {
  fgRef: React.RefObject<FGMethods | undefined>
}

const ZoomControl = ({ fgRef }: ZoomControlProps) => {
  const { t } = useTranslation()

  const handleZoomIn = useCallback(() => {
    const fg = fgRef.current
    if (!fg) return
    const current = (fg.zoom as any)() as number | undefined
    fg.zoom((current ?? 1) * 1.4, 300)
  }, [fgRef])

  const handleZoomOut = useCallback(() => {
    const fg = fgRef.current
    if (!fg) return
    const current = (fg.zoom as any)() as number | undefined
    fg.zoom((current ?? 1) / 1.4, 300)
  }, [fgRef])

  const handleResetZoom = useCallback(() => {
    fgRef.current?.zoomToFit(600, 60)
  }, [fgRef])

  return (
    <>
      <Button
        variant={controlButtonVariant}
        onClick={handleResetZoom}
        tooltip={t('graphPanel.sideBar.zoomControl.resetZoom')}
        size="icon"
      >
        <FullscreenIcon />
      </Button>
      <Button
        variant={controlButtonVariant}
        onClick={handleZoomIn}
        tooltip={t('graphPanel.sideBar.zoomControl.zoomIn')}
        size="icon"
      >
        <ZoomInIcon />
      </Button>
      <Button
        variant={controlButtonVariant}
        onClick={handleZoomOut}
        tooltip={t('graphPanel.sideBar.zoomControl.zoomOut')}
        size="icon"
      >
        <ZoomOutIcon />
      </Button>
    </>
  )
}

export default ZoomControl
