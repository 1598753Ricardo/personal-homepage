import { useEffect, useMemo, useRef, useState } from 'react'
import orbitItems from '../data/orbitItems'

const ROTATION_SECONDS = 35
const FULL_TURN = 360
const IMAGE_CARDS = {
  2: '/orbit-legal-ai.png',
  3: '/orbit-legal-internship.png',
  4: '/orbit-fund-intelligence.png',
  7: '/orbit-social-impact.png',
}

function normalizeAngle(angle) {
  return ((angle % FULL_TURN) + FULL_TURN) % FULL_TURN
}

function distanceFromFront(angle) {
  const normalized = normalizeAngle(angle)
  return Math.min(normalized, FULL_TURN - normalized)
}

function getCardDepth(angle, isMuted, isHovered, isSelected) {
  const distance = distanceFromFront(angle)
  const frontness = 1 - Math.min(distance / 180, 1)
  const baseOpacity = 0.32 + frontness * 0.68
  const opacity = isMuted ? 0.2 : baseOpacity
  const blur = isHovered || isSelected ? 0 : (1 - frontness) * 2.2
  const scale = isSelected ? 1.35 : isHovered ? 1.15 : 1
  const lift = isSelected ? 120 : isHovered ? 80 : 0

  return {
    opacity,
    filter: `blur(${blur.toFixed(2)}px)`,
    transform: `translateZ(${lift}px) scale(${scale})`,
    zIndex: Math.round(1000 - distance),
  }
}

function RingCard({
  card,
  index,
  total,
  rotation,
  hoveredId,
  selectedId,
  onHover,
  onSelect,
}) {
  const baseAngle = (FULL_TURN / total) * index
  const currentAngle = baseAngle + rotation
  const isHovered = hoveredId === card.id
  const isSelected = selectedId === card.id
  const hasFocusCard = hoveredId !== null || selectedId !== null
  const isMuted = hasFocusCard && !isHovered && !isSelected
  const depth = getCardDepth(currentAngle, isMuted, isHovered, isSelected)
  const imageSrc = IMAGE_CARDS[card.id]

  return (
    <button
      type="button"
      className="orbit-card"
      style={{
        '--card-angle': `${baseAngle}deg`,
        '--card-opacity': depth.opacity,
        '--card-filter': depth.filter,
        '--card-transform': depth.transform,
        zIndex: depth.zIndex,
      }}
      onMouseEnter={() => onHover(card.id)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(card.id)}
      onBlur={() => onHover(null)}
      onClick={() => {
        console.log(card)
        onSelect(card.id)
      }}
    >
      <span className={`orbit-card-surface${imageSrc ? ' orbit-card-surface-image' : ''}`}>
        {imageSrc ? (
          <img src={imageSrc} alt={card.title} />
        ) : (
          <>
            <span className="orbit-card-number">{String(index + 1).padStart(2, '0')}</span>
            <span>
              <span className="orbit-card-category">{card.category}</span>
              <strong>{card.title}</strong>
              {card.year ? <span className="orbit-card-year">{card.year}</span> : null}
            </span>
          </>
        )}
      </span>
    </button>
  )
}

export default function RingCarousel() {
  const [rotation, setRotation] = useState(0)
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const rotationRef = useRef(0)
  const lastFrameRef = useRef(null)
  const pausedRef = useRef(false)
  const selectedIdRef = useRef(null)

  const selectedIndex = useMemo(
    () => orbitItems.findIndex(card => card.id === selectedId),
    [selectedId]
  )

  useEffect(() => {
    pausedRef.current = hoveredId !== null
  }, [hoveredId])

  useEffect(() => {
    selectedIdRef.current = selectedId
  }, [selectedId])

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return undefined

    let frameId
    const degreesPerMs = FULL_TURN / (ROTATION_SECONDS * 1000)

    const tick = time => {
      if (lastFrameRef.current === null) lastFrameRef.current = time
      const delta = time - lastFrameRef.current
      lastFrameRef.current = time

      if (!pausedRef.current && selectedIdRef.current === null) {
        rotationRef.current = rotationRef.current + delta * degreesPerMs
        setRotation(rotationRef.current)
      }

      frameId = requestAnimationFrame(tick)
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [])

  useEffect(() => {
    if (selectedIndex < 0) return

    const targetRotation = normalizeAngle(-selectedIndex * (FULL_TURN / orbitItems.length))
    rotationRef.current = targetRotation
    setRotation(targetRotation)
  }, [selectedIndex])

  return (
    <div
      className="orbit-ring-container"
      aria-label="Personal orbit ring"
      onMouseLeave={() => setHoveredId(null)}
    >
      <div className="ring-world">
        <div className="orbit-center" aria-label="林汇川头像">
          <img src="/avatar.jpg" alt="林汇川" onError={event => { event.currentTarget.style.display = 'none' }} />
          <span>林</span>
        </div>

        <div
          className="orbit-ring"
          style={{ '--ring-rotation': `${rotation}deg` }}
        >
          {orbitItems.map((card, index) => (
            <RingCard
              key={card.id}
              card={card}
              index={index}
              total={orbitItems.length}
              rotation={rotation}
              hoveredId={hoveredId}
              selectedId={selectedId}
              onHover={setHoveredId}
              onSelect={setSelectedId}
            />
          ))}
        </div>
      </div>

      <style>{`
        .orbit-ring-container {
          --ring-size: min(624px, 82vw);
          --ring-radius: 374px;
          --card-width: 165px;
          --card-height: 225px;
          width: 100%;
          min-height: min(58vh, 580px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: clip;
          perspective: 1100px;
          perspective-origin: 50% 50%;
        }

        .ring-world {
          position: relative;
          width: var(--ring-size);
          height: var(--ring-size);
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
          transform: rotateZ(20deg) rotateY(-25deg);
        }

        .ring-world::before {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: calc(var(--ring-radius) * 2);
          height: calc(var(--ring-radius) * 2);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.48;
          pointer-events: none;
        }

        .ring-world::after {
          content: '';
          position: absolute;
          left: 50%;
          top: 50%;
          width: 34%;
          height: 34%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%);
          transform: translate(-50%, -50%);
          opacity: 0.32;
          pointer-events: none;
        }

        .orbit-center {
          position: absolute;
          left: 50%;
          top: 50%;
          z-index: 1100;
          width: clamp(285px, 22.5vw, 330px);
          height: clamp(285px, 22.5vw, 330px);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 50%;
          background:
            radial-gradient(circle at 42% 30%, rgba(255,255,255,0.18), transparent 38%),
            rgba(255,255,255,0.06);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.14),
            0 28px 82px rgba(0,0,0,0.42);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transform: translate(-50%, -50%) rotateY(25deg) rotateZ(-20deg);
          pointer-events: none;
        }

        .orbit-center img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .orbit-center span {
          color: rgba(255,255,255,0.82);
          font-size: clamp(3.2rem, 5vw, 4.4rem);
          font-weight: 590;
          line-height: 1;
        }

        .orbit-ring {
          position: relative;
          width: var(--ring-size);
          height: var(--ring-size);
          transform-style: preserve-3d;
          transform: rotateY(var(--ring-rotation));
          will-change: transform;
        }

        .orbit-card {
          appearance: none;
          position: absolute;
          left: 50%;
          top: 50%;
          width: var(--card-width);
          height: var(--card-height);
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
          transform: translate(-50%, -50%) rotateY(var(--card-angle)) translateZ(var(--ring-radius));
          transform-style: preserve-3d;
        }

        .orbit-card-surface {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 20px;
          color: var(--text-heading);
          text-align: left;
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 16px;
          background: rgba(255,255,255,0.05);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.12),
            0 20px 54px rgba(0,0,0,0.34);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          opacity: var(--card-opacity);
          filter: var(--card-filter);
          transform: var(--card-transform);
          transform-style: preserve-3d;
          transition:
            opacity var(--dur-base) ease,
            filter var(--dur-base) ease,
            border-color var(--dur-fast) ease,
            background var(--dur-fast) ease,
            box-shadow var(--dur-base) ease,
            transform var(--dur-base) var(--ease-out);
          will-change: opacity, filter, transform;
        }

        .orbit-card-surface-image {
          padding: 0;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
        }

        .orbit-card-surface-image img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .orbit-card:hover .orbit-card-surface,
        .orbit-card:focus-visible .orbit-card-surface {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.09);
          box-shadow:
            inset 0 1px 0 rgba(255,255,255,0.18),
            0 30px 82px rgba(0,0,0,0.46);
          outline: 0;
        }

        .orbit-card-number,
        .orbit-card-category,
        .orbit-card-year {
          display: block;
          font-family: var(--font-mono);
          font-size: var(--caption);
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }

        .orbit-card-number {
          color: rgba(255,255,255,0.76);
        }

        .orbit-card-category {
          margin-bottom: 12px;
          color: var(--text-muted);
        }

        .orbit-card strong {
          display: block;
          max-width: 7em;
          color: var(--text-heading);
          font-size: 1.28rem;
          font-weight: 590;
          line-height: 1.08;
          letter-spacing: 0;
        }

        .orbit-card-year {
          margin-top: 14px;
          color: rgba(255,255,255,0.68);
        }

        @media (max-width: 900px) {
          .orbit-ring-container {
            --ring-size: min(560px, 88vw);
            --ring-radius: 328px;
            --card-width: 150px;
            --card-height: 210px;
            min-height: 560px;
            perspective: 940px;
          }

          .orbit-card-surface {
            padding: 16px;
          }
        }

        @media (max-width: 560px) {
          .orbit-ring-container {
            --ring-size: min(390px, 94vw);
            --ring-radius: 222px;
            --card-width: 112px;
            --card-height: 158px;
            min-height: 410px;
            perspective: 720px;
          }

          .ring-world {
            transform: rotateZ(18deg) rotateY(-28deg);
          }

          .orbit-center {
            width: clamp(180px, 51vw, 225px);
            height: clamp(180px, 51vw, 225px);
            transform: translate(-50%, -50%) rotateY(28deg) rotateZ(-18deg);
          }

          .orbit-card-surface {
            padding: 12px;
            border-radius: 13px;
          }

          .orbit-card strong {
            font-size: 0.86rem;
            line-height: 1.08;
          }

          .orbit-card-number,
          .orbit-card-category,
          .orbit-card-year {
            font-size: 0.64rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .orbit-ring {
            transform: rotateY(0deg);
          }
        }
      `}</style>
    </div>
  )
}
