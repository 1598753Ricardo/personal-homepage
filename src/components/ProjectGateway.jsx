import { useEffect, useId, useRef, useState } from 'react'
import './ProjectGateway.css'

const ARTWORK = '/project-gate-refined-v2.png'
const SCALE = '/project-gate.png'
const ARTWORK_BOUNDS = { x: 136, width: 1400, height: 941 }
const CENTER = { x: 836, y: 260 }
const ANCHORS = { left: { x: 690, y: 277 }, right: { x: 982, y: 277 } }
const OPEN_DURATION = 2200

function DoorArtwork({ ready }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className="gateway-artwork" viewBox={`${ARTWORK_BOUNDS.x} 0 ${ARTWORK_BOUNDS.width} ${ARTWORK_BOUNDS.height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <path id={`${id}-beam-outline`} d="M 818 244 C 797 230 769 238 742 250 C 720 260 706 264 689 257 C 676 251 665 249 659 257 C 652 266 658 274 667 274 C 679 274 681 262 671 261 C 680 263 683 271 698 275 C 724 281 747 266 773 263 C 791 260 805 265 818 276 Z" />
        <g id={`${id}-pan-outline`} fill="white">
          <ellipse cx="690" cy="279" rx="7.5" ry="5.5" />
          <path d="M 690 283 C 681 287 686 293 690 295 C 697 291 696 286 690 283" />
          <path d="M 689 291 L 626 423 M 692 291 L 756 423" fill="none" stroke="white" strokeWidth="7" strokeLinecap="round" />
          <path d="M 690 291 L 690 424" fill="none" stroke="white" strokeWidth="6" strokeLinecap="round" />
          <path d="M 613 422 L 771 422 L 770 432 C 751 453 724 461 691 461 C 659 461 631 452 616 436 Z" />
        </g>
        <clipPath id={`${id}-beam`}>
          <use href={`#${id}-beam-outline`} />
          <use href={`#${id}-beam-outline`} transform="translate(1672 0) scale(-1 1)" />
          <rect x="685" y="257" width="10" height="22" />
          <rect x="977" y="257" width="10" height="22" />
        </clipPath>
        <mask id={`${id}-left`} maskUnits="userSpaceOnUse" x="590" y="260" width="215" height="220"><use href={`#${id}-pan-outline`} /></mask>
        <mask id={`${id}-right`} maskUnits="userSpaceOnUse" x="868" y="260" width="215" height="220"><use href={`#${id}-pan-outline`} transform="translate(1672 0) scale(-1 1)" /></mask>
        <clipPath id={`${id}-stand`}>
          <path d="M826 179 C824 185 824 190 820 195 C817 196 815 198 816 202 L820 205 L820 209 C811 210 810 214 814 219 C817 223 823 225 827 226 L823 229 C815 230 809 232 807 234 Q804 237 812 240 L812 281 L824 283 L807 285 Q800 286 801 290 Q802 294 810 297 L813 299 L813 302 L812 304 L810 425 L807 426 L808 432 L803 434 Q799 437 804 441 L809 444 L809 449 L812 451 C810 461 803 470 790 475 L790 478 Q790 480 798 481 L780 482 L779 485 L768 486 L767 491 L760 493 L758 495 L749 496 L749 505 L923 505 L923 496 L914 495 L912 493 L905 491 L904 486 L893 485 L892 482 L874 481 Q882 480 882 478 L882 475 C869 470 862 461 860 451 L863 449 L863 444 L868 441 Q873 437 869 434 L864 432 L865 426 L862 425 L860 304 L859 302 L859 299 L862 297 Q870 294 871 290 Q872 286 865 285 L848 283 L860 281 L860 240 Q868 237 865 234 C863 232 857 230 849 229 L845 226 C849 225 855 223 858 219 C862 214 861 210 852 209 L852 205 L856 202 C857 198 855 196 852 195 C848 190 848 185 846 179 Z" />
        </clipPath>
      </defs>
      <image href={ready ? ARTWORK : SCALE} width="1672" height="941" />
      {ready && (
        <g className="gateway-scale-art">
          <image href={SCALE} width="1672" height="941" clipPath={`url(#${id}-stand)`} />
          <g data-scale-part="beam" className="gateway-scale-part">
            <image href={SCALE} width="1672" height="941" clipPath={`url(#${id}-beam)`} />
          </g>
          <g data-scale-part="left" className="gateway-scale-part">
            <image href={SCALE} width="1672" height="941" mask={`url(#${id}-left)`} />
          </g>
          <g data-scale-part="right" className="gateway-scale-part">
            <image href={SCALE} width="1672" height="941" mask={`url(#${id}-right)`} />
          </g>
        </g>
      )}
    </svg>
  )
}

export default function ProjectGateway({ open, onOpen, onEntered }) {
  const gateRef = useRef(null)
  const pose = useRef({ angle: 0, sway: 0 })
  const interaction = useRef({ hovered: false, settling: null })
  const onOpenRef = useRef(onOpen)
  const onEnteredRef = useRef(onEntered)
  const [ready, setReady] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [settling, setSettling] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  onOpenRef.current = onOpen
  onEnteredRef.current = onEntered

  useEffect(() => {
    if (!open) return undefined
    const timer = window.setTimeout(() => onEnteredRef.current?.(), reducedMotion ? 0 : OPEN_DURATION)
    return () => window.clearTimeout(timer)
  }, [open, reducedMotion])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    media.addEventListener('change', update)
    let disposed = false
    Promise.all([ARTWORK, SCALE].map(src => {
      const image = new Image()
      image.src = src
      return image.decode()
    })).then(() => { if (!disposed) setReady(true) }).catch(() => {})
    return () => { disposed = true; media.removeEventListener('change', update) }
  }, [])

  useEffect(() => {
    if (!ready) return undefined
    const parts = [...gateRef.current.querySelectorAll('[data-scale-part]')]
    function paint(angle, sway) {
      pose.current = { angle, sway }
      const radians = angle * Math.PI / 180
      for (const part of parts) {
        const name = part.dataset.scalePart
        if (name === 'beam') {
          part.setAttribute('transform', `rotate(${angle} ${CENTER.x} ${CENTER.y})`)
          continue
        }
        const anchor = ANCHORS[name]
        const x = anchor.x - CENTER.x
        const y = anchor.y - CENTER.y
        // Translate the suspension points with the beam; the pans stay upright.
        const dx = x * Math.cos(radians) - y * Math.sin(radians) - x
        const dy = x * Math.sin(radians) + y * Math.cos(radians) - y
        part.setAttribute('transform', `translate(${dx} ${dy}) rotate(${sway} ${anchor.x} ${anchor.y})`)
      }
    }
    if (open || reducedMotion) {
      paint(0, 0)
      if (!open && interaction.current.settling) {
        interaction.current.settling = null
        onOpenRef.current()
      }
      return undefined
    }
    let frame
    let previous = performance.now()
    const started = previous
    function animate(now) {
      const dt = Math.min(now - previous, 50)
      previous = now
      const pending = interaction.current.settling
      if (pending) {
        const progress = Math.min((now - pending.time) / 360, 1)
        const remaining = (1 - progress) ** 3
        paint(pending.angle * remaining, pending.sway * remaining)
        if (progress === 1) {
          interaction.current.settling = null
          onOpenRef.current()
          return
        }
      } else {
        const phase = (now - started) / 4800 * Math.PI * 2
        const amplitude = interaction.current.hovered ? 9 : 7
        const target = Math.sin(phase) * amplitude
        const sway = Math.sin(phase - .8) * 1.1
        const smoothing = 1 - Math.exp(-dt / 110)
        paint(pose.current.angle + (target - pose.current.angle) * smoothing, pose.current.sway + (sway - pose.current.sway) * smoothing)
      }
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [ready, open, reducedMotion])

  function highlight(value) {
    interaction.current.hovered = value
    setHovered(value)
  }

  function movePointer(event) {
    if (event.pointerType !== 'mouse' || settling) return
    const rect = event.currentTarget.getBoundingClientRect()
    const scale = Math.max(rect.width / ARTWORK_BOUNDS.width, rect.height / ARTWORK_BOUNDS.height)
    const x = ARTWORK_BOUNDS.x + (event.clientX - rect.left - (rect.width - ARTWORK_BOUNDS.width * scale) / 2) / scale
    const y = (event.clientY - rect.top - (rect.height - ARTWORK_BOUNDS.height * scale) / 2) / scale
    const near = x > 580 && x < 1090 && y > 150 && y < 540
    if (near !== interaction.current.hovered) highlight(near)
  }

  function requestOpen() {
    if (open || interaction.current.settling) return
    if (reducedMotion || !ready) { onOpenRef.current(); return }
    interaction.current.settling = { ...pose.current, time: performance.now() }
    setSettling(true)
    highlight(false)
  }

  return (
    <button
      ref={gateRef}
      type="button"
      className={`project-gateway${hovered ? ' is-hovered' : ''}${settling ? ' is-settling' : ''}`}
      style={{ '--gateway-open-duration': `${OPEN_DURATION}ms` }}
      aria-label="推开大门进入项目书架"
      aria-controls="project-bookshelf"
      aria-expanded={open}
      aria-hidden={open}
      aria-busy={settling && !open}
      inert={open ? '' : undefined}
      onPointerMove={movePointer}
      onPointerLeave={() => highlight(false)}
      onFocus={() => highlight(true)}
      onBlur={() => highlight(false)}
      onClick={requestOpen}
    >
      <span className="gateway-scene" aria-hidden="true">
        <span className="gateway-door gateway-door-left"><span className="gateway-door-face"><DoorArtwork ready={ready} /></span></span>
        <span className="gateway-door gateway-door-right"><span className="gateway-door-face"><DoorArtwork ready={ready} /></span></span>
        <span className="gateway-seam" />
      </span>
    </button>
  )
}
