import { useEffect, useRef, useState } from 'react'
import './ProjectGateway.css'

const ARTWORK = '/project-gate-original.png'
const PHOTO = { size: 1254, left: 367, middle: 625, right: 882, top: 257, bottom: 1017 }
const ENTRY_DURATION = 1550
const percent = value => `${value / PHOTO.size * 100}%`

export const gatewayTimingStyles = {
  '--gateway-entry-duration': `${ENTRY_DURATION}ms`,
  '--gateway-room-delay': '600ms',
  '--gateway-room-duration': '850ms',
}

const apertureStyle = {
  left: percent(PHOTO.left), top: percent(PHOTO.top),
  width: percent(PHOTO.right - PHOTO.left), height: percent(PHOTO.bottom - PHOTO.top),
}

// Only the photographed aperture is removed. Nothing redraws the architecture,
// and no closed door remains behind the two original-image leaf crops.
const frameClip = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0,
  ${percent(PHOTO.left)} ${percent(PHOTO.top)},
  ${percent(PHOTO.left)} ${percent(PHOTO.bottom)},
  ${percent(PHOTO.right)} ${percent(PHOTO.bottom)},
  ${percent(PHOTO.right)} ${percent(PHOTO.top)},
  ${percent(PHOTO.left)} ${percent(PHOTO.top)}, 0 0)`

function DoorPanel({ side }) {
  const x = side === 'left' ? PHOTO.left : PHOTO.middle
  const width = side === 'left' ? PHOTO.middle - PHOTO.left : PHOTO.right - PHOTO.middle
  const height = PHOTO.bottom - PHOTO.top
  return (
    <span className={`gateway-door gateway-door-${side}`} style={{ width: `${width / (PHOTO.right - PHOTO.left) * 100}%` }}>
      <span className="gateway-door-edge" />
      <span className="gateway-door-face">
        <img className="gateway-panel-photo" src={ARTWORK} alt="" draggable="false"
          style={{ width: `${PHOTO.size / width * 100}%`, height: `${PHOTO.size / height * 100}%`,
            left: `${-x / width * 100}%`, top: `${-PHOTO.top / height * 100}%` }} />
      </span>
    </span>
  )
}

export default function ProjectGateway({ open, onOpen, onEntered }) {
  const requested = useRef(false)
  const completed = useRef(false)
  const onEnteredRef = useRef(onEntered)
  const [ready, setReady] = useState(false)
  const [entered, setEntered] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  onEnteredRef.current = onEntered

  function finishEntry() {
    if (completed.current) return
    completed.current = true
    setEntered(true)
    onEnteredRef.current?.()
  }

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (open && reducedMotion) finishEntry()
  }, [open, reducedMotion])

  function requestOpen() {
    if (open || requested.current || !ready) return
    requested.current = true
    onOpen()
  }

  if (entered) return null

  return (
    <div className="project-gateway">
      <div className="gateway-camera" onAnimationEnd={event => {
        if (event.target === event.currentTarget && event.animationName === 'gateway-camera-travel') finishEntry()
      }}>
        <div className="gateway-scene">
          <img className="gateway-frame-photo" src={ARTWORK} alt="" aria-hidden="true" draggable="false"
            style={{ clipPath: open ? frameClip : undefined }} onLoad={() => setReady(true)} />
          <button type="button" className="gateway-opening" style={apertureStyle}
            aria-label="推开大门进入项目书架" aria-controls="project-bookshelf" aria-expanded={open}
            aria-hidden={open} inert={open ? '' : undefined} disabled={!ready} onClick={requestOpen}>
            <span className="gateway-panels" aria-hidden="true">
              <DoorPanel side="left" />
              <DoorPanel side="right" />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
