/**
 * FullScreenControl – fullscreen toggle using the native browser Fullscreen API.
 *
 * Replaces the previous useFullScreen hook from @react-sigma/core.
 */
import { useState, useEffect, useCallback } from 'react'
import { MaximizeIcon, MinimizeIcon } from 'lucide-react'
import { controlButtonVariant } from '@/lib/constants'
import Button from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

interface FullScreenControlProps {
  /** The container element to make fullscreen. Defaults to document.documentElement. */
  containerRef?: React.RefObject<HTMLElement | null>
}

const FullScreenControl = ({ containerRef }: FullScreenControlProps) => {
  const { t } = useTranslation()
  const [isFullScreen, setIsFullScreen] = useState(false)

  // Sync state with native fullscreenchange events
  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggle = useCallback(() => {
    if (!document.fullscreenElement) {
      const el = containerRef?.current ?? document.documentElement
      el.requestFullscreen?.().catch(err => {
        console.warn('Fullscreen request failed:', err)
      })
    } else {
      document.exitFullscreen?.().catch(err => {
        console.warn('Exit fullscreen failed:', err)
      })
    }
  }, [containerRef])

  return (
    <>
      {isFullScreen ? (
        <Button
          variant={controlButtonVariant}
          onClick={toggle}
          tooltip={t('graphPanel.sideBar.fullScreenControl.windowed')}
          size="icon"
        >
          <MinimizeIcon />
        </Button>
      ) : (
        <Button
          variant={controlButtonVariant}
          onClick={toggle}
          tooltip={t('graphPanel.sideBar.fullScreenControl.fullScreen')}
          size="icon"
        >
          <MaximizeIcon />
        </Button>
      )}
    </>
  )
}

export default FullScreenControl
