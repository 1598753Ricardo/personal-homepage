import { useEffect, useRef, useState } from 'react'
import './ProjectGateway.css'

const ARTWORK = '/project-gate-original.png'
// Pixel coordinates in the untouched 1254 × 1254 reference photograph.
// Only these two central leaves move; the photographed frame stays in place.
const PHOTO = { size: 1254, left: 367, middle: 625, right: 882, top: 257, bottom: 1017 }
const CLICK_DELAY = 300
const LEAF_DURATION = 1600
const LEAF_STAGGER = 30
const HANDOFF_DURATION = 350
const OPEN_DURATION = LEAF_DURATION + LEAF_STAGGER + HANDOFF_DURATION
const percent = value => `${value / PHOTO.size * 100}%`

export const gatewayTimingStyles = {
  '--gateway-leaf-duration': `${LEAF_DURATION}ms`,
  '--gateway-leaf-stagger': `${LEAF_STAGGER}ms`,
  '--gateway-handoff-delay': `${LEAF_DURATION + LEAF_STAGGER}ms`,
  '--gateway-handoff-duration': `${HANDOFF_DURATION}ms`,
  '--gateway-approach-delay': `${LEAF_DURATION * .8}ms`,
  '--gateway-approach-duration': `${OPEN_DURATION - LEAF_DURATION * .8}ms`,
  '--gateway-open-duration': `${OPEN_DURATION}ms`,
}

const apertureStyle = {
  left: percent(PHOTO.left),
  top: percent(PHOTO.top),
  width: percent(PHOTO.right - PHOTO.left),
  height: percent(PHOTO.bottom - PHOTO.top),
}

// An even-odd cutout removes the ORIGINAL leaves from the stationary photo.
// There is no closed door left underneath the rotating panels.
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
      <span className="gateway-door-back" />
      <span className="gateway-door-edge gateway-door-edge-free" />
      <span className="gateway-door-edge gateway-door-edge-hinge" />
      <span className="gateway-door-cap gateway-door-cap-top" />
      <span className="gateway-door-cap gateway-door-cap-bottom" />
      <span className="gateway-door-face">
        <img
          className="gateway-panel-photo"
          src={ARTWORK}
          alt=""
          draggable="false"
          style={{
            width: `${PHOTO.size / width * 100}%`,
            height: `${PHOTO.size / height * 100}%`,
            left: `${-x / width * 100}%`,
            top: `${-PHOTO.top / height * 100}%`,
          }}
        />
      </span>
    </span>
  )
}

export default function ProjectGateway({ open, onOpen, onEntered }) {
  const requested = useRef(false)
  const onOpenRef = useRef(onOpen)
  const onEnteredRef = useRef(onEntered)
  const [ready, setReady] = useState(false)
  const [waiting, setWaiting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  onOpenRef.current = onOpen
  onEnteredRef.current = onEntered

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!waiting || open) return undefined
    const timer = window.setTimeout(() => onOpenRef.current(), reducedMotion ? 0 : CLICK_DELAY)
    return () => window.clearTimeout(timer)
  }, [waiting, open, reducedMotion])

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => onEnteredRef.current?.(), reducedMotion ? 0 : OPEN_DURATION)
    return () => window.clearTimeout(timer)
  }, [open, reducedMotion])

  function requestOpen() {
    if (open || requested.current || !ready) return
    requested.current = true
    setWaiting(true)
  }

  return (
    <div className={`project-gateway${waiting ? ' is-waiting' : ''}`}>
      <div className="gateway-scene">
        <img
          className="gateway-frame-photo"
          src={ARTWORK}
          alt=""
          aria-hidden="true"
          draggable="false"
          // At rest show the single untouched photograph. On the same render
          // that starts opening, cut out its leaves and reveal the image panels.
          // This also avoids subpixel crop seams on small screens while closed.
          style={{ clipPath: open ? frameClip : undefined }}
          onLoad={() => setReady(true)}
        />
        <button
          type="button"
          className="gateway-opening"
          style={apertureStyle}
          aria-label="推开大门进入项目书架"
          aria-controls="project-bookshelf"
          aria-expanded={open}
          aria-hidden={open}
          aria-busy={waiting && !open}
          inert={open ? '' : undefined}
          disabled={!ready}
          onClick={requestOpen}
        >
          <span className="gateway-panels" aria-hidden="true">
            <DoorPanel side="left" />
            <DoorPanel side="right" />
          </span>
        </button>
        <span className="gateway-photo-feedback" aria-hidden="true" />
      </div>
    </div>
  )
}
