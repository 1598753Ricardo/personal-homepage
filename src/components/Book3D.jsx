import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

const FALLBACK_PAGE = {
  title: 'ARCHIVE PAGE',
  date: 'DRAFT',
  content: '这一页暂时留白，后续会补充真实项目细节、过程记录和成果链接。',
  note: '待补充',
}

function getPage(book, index) {
  return book?.pages?.[index] || {
    ...FALLBACK_PAGE,
    title: book?.title || FALLBACK_PAGE.title,
    date: book?.year || FALLBACK_PAGE.date,
  }
}

function makeCurvedPageGeometry(side = 'right', width = 3.05, height = 4.18, lift = 0.2) {
  const xSegments = 44
  const ySegments = 32
  const direction = side === 'right' ? 1 : -1
  const vertices = []
  const indices = []
  const uvs = []

  for (let y = 0; y <= ySegments; y += 1) {
    const v = y / ySegments
    const localY = (v - 0.5) * height
    const cornerLift = Math.pow(Math.abs(v - 0.5) * 2, 2.1) * 0.035

    for (let x = 0; x <= xSegments; x += 1) {
      const u = x / xSegments
      const pageX = direction * u * width
      const spineDrop = -0.22 * Math.exp(-u * 8.5)
      const outerLift = lift * Math.pow(u, 1.85)
      const pageBelly = Math.sin(u * Math.PI) * 0.08
      const z = spineDrop + outerLift + pageBelly + cornerLift

      vertices.push(pageX, localY, z)
      uvs.push(side === 'right' ? u : 1 - u, 1 - v)
    }
  }

  for (let y = 0; y < ySegments; y += 1) {
    for (let x = 0; x < xSegments; x += 1) {
      const a = y * (xSegments + 1) + x
      const b = a + 1
      const c = a + (xSegments + 1)
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.computeVertexNormals()
  return geometry
}

function makePageTexture(book, page, pageNumber, side) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1400
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = '#efe4cf'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.strokeStyle = 'rgba(86, 58, 28, 0.12)'
  ctx.lineWidth = 2
  for (let y = 120; y < 1270; y += 56) {
    ctx.beginPath()
    ctx.moveTo(96, y)
    ctx.lineTo(930, y)
    ctx.stroke()
  }

  ctx.fillStyle = 'rgba(34, 25, 16, 0.45)'
  ctx.font = '30px Consolas, monospace'
  ctx.fillText(`NO. ${String(pageNumber).padStart(2, '0')}`, 90, 88)
  ctx.textAlign = 'right'
  ctx.fillText(page.date || book.year || '', 930, 88)
  ctx.textAlign = 'left'

  ctx.fillStyle = 'rgba(105, 70, 35, 0.72)'
  ctx.font = '34px Consolas, monospace'
  ctx.fillText(`${book.title || 'PROJECT ARCHIVE'} / ${side.toUpperCase()}`, 90, 740)

  ctx.fillStyle = '#17120c'
  ctx.font = 'bold 82px Microsoft YaHei, SimHei, sans-serif'
  wrapText(ctx, page.title || book.title, 90, 860, 760, 92)

  ctx.fillStyle = 'rgba(29, 23, 15, 0.74)'
  ctx.font = '42px Microsoft YaHei, SimHei, sans-serif'
  wrapText(ctx, page.content || '', 90, 1030, 790, 66)

  ctx.save()
  ctx.translate(side === 'right' ? 700 : 120, 1140)
  ctx.rotate(side === 'right' ? -0.08 : 0.08)
  ctx.fillStyle = '#c6aa70'
  ctx.fillRect(0, 0, 230, 165)
  ctx.fillStyle = 'rgba(52, 39, 24, 0.74)'
  ctx.font = '36px KaiTi, Microsoft YaHei, cursive'
  wrapText(ctx, page.note || '', 26, 58, 180, 48)
  ctx.restore()

  if (page.image) {
    ctx.fillStyle = '#d8ccb8'
    ctx.fillRect(120, 155, 620, 420)
    ctx.strokeStyle = 'rgba(36, 24, 12, 0.2)'
    ctx.lineWidth = 6
    ctx.strokeRect(120, 155, 620, 420)
    ctx.fillStyle = 'rgba(31, 22, 14, 0.42)'
    ctx.font = '32px Consolas, monospace'
    ctx.fillText('MATERIAL SCREENSHOT', 170, 385)
    ctx.fillText(page.image, 170, 435)
  } else {
    ctx.strokeStyle = 'rgba(31, 22, 14, 0.18)'
    ctx.lineWidth = 5
    ctx.strokeRect(140, 160, 560, 360)
    ctx.beginPath()
    ctx.moveTo(210, 420)
    ctx.lineTo(610, 265)
    ctx.lineTo(690, 420)
    ctx.stroke()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8
  return texture
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const chars = String(text || '').split('')
  let line = ''
  let currentY = y

  chars.forEach((char) => {
    const next = line + char
    if (ctx.measureText(next).width > maxWidth && line) {
      ctx.fillText(line, x, currentY)
      line = char
      currentY += lineHeight
    } else {
      line = next
    }
  })

  if (line) ctx.fillText(line, x, currentY)
}

function usePageMaterial(book, page, number, side) {
  return useMemo(() => {
    const texture = makePageTexture(book, page, number, side)
    return new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.88,
      metalness: 0,
      side: THREE.DoubleSide,
    })
  }, [book, page, number, side])
}

function HardCover({ side, book }) {
  const direction = side === 'right' ? 1 : -1
  const angle = side === 'right' ? -0.46 : 0.46

  return (
    <group rotation={[0, angle, 0]} position={[0, 0, -0.3]}>
      <mesh position={[direction * 1.78, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.45, 4.65, 0.22]} />
        <meshStandardMaterial color={book.color || '#282014'} roughness={0.7} metalness={0.05} />
      </mesh>
      <mesh position={[direction * 1.78, 0, 0.13]} receiveShadow>
        <boxGeometry args={[3.28, 4.48, 0.026]} />
        <meshStandardMaterial color="#4b4933" roughness={0.82} metalness={0.02} />
      </mesh>
    </group>
  )
}

function Spine({ book }) {
  return (
    <group position={[0, 0, -0.12]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 4.78, 0.46]} />
        <meshStandardMaterial color="#15110b" roughness={0.8} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0, 0.25]} receiveShadow>
        <boxGeometry args={[0.18, 4.55, 0.08]} />
        <meshStandardMaterial color="#050403" roughness={0.96} />
      </mesh>
      {[-0.17, 0.17].map(x => (
        <mesh key={x} position={[x, 0, 0.28]} receiveShadow>
          <boxGeometry args={[0.025, 4.28, 0.035]} />
          <meshStandardMaterial color={book.accent || '#bda779'} roughness={0.68} metalness={0.12} />
        </mesh>
      ))}
    </group>
  )
}

function PageStack({ side }) {
  const direction = side === 'right' ? 1 : -1
  const angle = side === 'right' ? -0.43 : 0.43
  const pages = useMemo(() => Array.from({ length: 86 }), [])

  return (
    <group rotation={[0, angle, 0]}>
      {pages.map((_, index) => {
        const inset = index * 0.003
        const z = -0.19 + index * 0.0042
        return (
          <mesh key={index} position={[direction * (1.61 + inset), 0, z]} receiveShadow castShadow={index % 13 === 0}>
            <boxGeometry args={[3.02 - inset * 2, 4.1 - inset, 0.004]} />
            <meshStandardMaterial color={index % 2 ? '#eadfc8' : '#f1e7d3'} roughness={0.92} />
          </mesh>
        )
      })}
    </group>
  )
}

function CurrentPage({ side, book, page, number }) {
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, side === 'right' ? 0.22 : 0.17), [side])
  const material = usePageMaterial(book, page, number, side)
  const angle = side === 'right' ? -0.43 : 0.43

  return (
    <group rotation={[0, angle, 0]} position={[0, 0, 0.1]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <mesh geometry={geometry} position={[0, 0, -0.012]} receiveShadow>
        <meshStandardMaterial color="#d9ccb4" roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function TurningPage({ direction, book, page, backPage, number, onDone }) {
  const ref = useRef(null)
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const side = direction === 'next' ? 'right' : 'left'
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, 0.34), [side])
  const frontMaterial = usePageMaterial(book, page, number, side)
  const backMaterial = usePageMaterial(book, backPage, number + (direction === 'next' ? 1 : -1), direction === 'next' ? 'left' : 'right')

  useEffect(() => {
    progressRef.current = 0
    doneRef.current = false
  }, [direction, page])

  useFrame((_, delta) => {
    if (!ref.current) return
    progressRef.current = Math.min(1, progressRef.current + delta * 1.45)
    const t = 1 - Math.pow(1 - progressRef.current, 3)
    const bendLift = Math.sin(t * Math.PI) * 0.5

    if (direction === 'next') {
      ref.current.rotation.y = -0.43 - t * Math.PI
      ref.current.position.z = 0.16 + bendLift
    } else {
      ref.current.rotation.y = 0.43 + t * Math.PI
      ref.current.position.z = 0.16 + bendLift
    }

    if (progressRef.current >= 1 && !doneRef.current) {
      doneRef.current = true
      onDone()
    }
  })

  return (
    <group ref={ref} position={[0, 0, 0.16]}>
      <mesh geometry={geometry} material={frontMaterial} castShadow receiveShadow />
      <mesh geometry={geometry} material={backMaterial} rotation={[0, Math.PI, 0]} castShadow receiveShadow />
    </group>
  )
}

function EdgeHitbox({ side, onClick }) {
  const x = side === 'right' ? 3.15 : -3.15

  return (
    <mesh position={[x, 0, 0.55]} onPointerDown={(event) => {
      event.stopPropagation()
      onClick()
    }}>
      <boxGeometry args={[0.72, 4.1, 0.8]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

function Desk() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.56]} receiveShadow>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#21140c" roughness={0.92} />
      </mesh>
      {Array.from({ length: 13 }).map((_, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[-6.5 + index * 1.08, 0, -0.555]}>
          <planeGeometry args={[0.014, 10]} />
          <meshBasicMaterial color="#583419" transparent opacity={0.38} />
        </mesh>
      ))}
    </group>
  )
}

function BookModel({ book }) {
  const [pageIndex, setPageIndex] = useState(0)
  const [turning, setTurning] = useState(null)
  const groupRef = useRef(null)
  const maxStart = Math.max(0, (book.pages?.length || 1) - 2)

  useEffect(() => {
    setPageIndex(0)
    setTurning(null)
  }, [book.id])

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.35) * 0.008
  })

  function nextPage() {
    if (turning || pageIndex >= maxStart) return
    setTurning('next')
  }

  function prevPage() {
    if (turning || pageIndex <= 0) return
    setTurning('prev')
  }

  function finishTurn() {
    setPageIndex(index => {
      if (turning === 'next') return Math.min(maxStart, index + 2)
      if (turning === 'prev') return Math.max(0, index - 2)
      return index
    })
    setTurning(null)
  }

  const leftPage = getPage(book, pageIndex)
  const rightPage = getPage(book, pageIndex + 1)

  return (
    <group ref={groupRef} rotation={[-0.88, 0, 0.03]} position={[0, 0.2, 0]}>
      <HardCover side="left" book={book} />
      <HardCover side="right" book={book} />
      <PageStack side="left" />
      <PageStack side="right" />
      <Spine book={book} />
      <CurrentPage side="left" book={book} page={leftPage} number={pageIndex + 1} />
      <CurrentPage side="right" book={book} page={rightPage} number={pageIndex + 2} />
      {turning ? (
        <TurningPage
          direction={turning}
          book={book}
          page={turning === 'next' ? rightPage : leftPage}
          backPage={turning === 'next' ? getPage(book, pageIndex + 2) : getPage(book, pageIndex - 1)}
          number={turning === 'next' ? pageIndex + 2 : pageIndex + 1}
          onDone={finishTurn}
        />
      ) : null}
      <EdgeHitbox side="left" onClick={prevPage} />
      <EdgeHitbox side="right" onClick={nextPage} />
    </group>
  )
}

export default function Book3D({ book, phase = 'open', origin = { x: 0, y: 0, scale: 0.12 }, onClose }) {
  const bookVars = useMemo(() => ({
    '--origin-x': `${origin.x || 0}px`,
    '--origin-y': `${origin.y || 0}px`,
    '--origin-scale': origin.scale || 0.12,
  }), [origin])

  if (!book) return null

  return (
    <div className={`book3d-stage is-${phase}`} style={bookVars}>
      {onClose ? (
        <button type="button" className="book3d-close" onClick={onClose}>
          CLOSE BOOK
        </button>
      ) : null}

      <div className="book3d-canvas-wrap">
        <Canvas
          shadows
          camera={{ position: [0, 4.9, 7.2], fov: 40 }}
          gl={{ antialias: true, alpha: false }}
        >
          <color attach="background" args={['#080604']} />
          <ambientLight intensity={0.45} />
          <directionalLight
            position={[-3.5, 6, 5]}
            intensity={2.35}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[3.2, 2.7, 3]} intensity={0.75} color="#d7b36f" />
          <spotLight position={[0, 6, 2.2]} angle={0.5} penumbra={0.7} intensity={1.2} castShadow />
          <Desk />
          <BookModel book={book} />
        </Canvas>
      </div>

      <style>{`
        .book3d-stage {
          position: absolute;
          inset: 0;
          z-index: 12;
          overflow: hidden;
          background:
            radial-gradient(circle at 42% 16%, rgba(225,190,125,0.14), transparent 34%),
            linear-gradient(180deg, #090705, #030302);
        }

        .book3d-canvas-wrap {
          position: absolute;
          inset: 0;
          transform-origin: center center;
          animation: book3dExtract 980ms cubic-bezier(.16,1,.3,1) both;
        }

        .book3d-stage.is-open .book3d-canvas-wrap {
          animation: book3dSettle 620ms cubic-bezier(.16,1,.3,1) both;
        }

        .book3d-stage.is-closing .book3d-canvas-wrap {
          animation: book3dReturn 900ms cubic-bezier(.16,1,.3,1) both;
        }

        .book3d-stage canvas {
          display: block;
          width: 100%;
          height: 100%;
        }

        .book3d-close {
          appearance: none;
          position: absolute;
          right: clamp(22px, 4vw, 58px);
          top: calc(var(--nav-h) + 28px);
          z-index: 2;
          padding: 0 0 6px;
          border: 0;
          border-bottom: 1px solid rgba(232,216,182,0.48);
          color: #ead9b7;
          background: transparent;
          font-family: var(--font-mono);
          font-size: var(--caption);
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        @keyframes book3dExtract {
          0% {
            opacity: 0;
            transform: translate3d(var(--origin-x), var(--origin-y), -260px) scale(var(--origin-scale));
          }
          64% {
            opacity: 1;
            transform: translate3d(0, 10px, 0) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
        }

        @keyframes book3dSettle {
          from { transform: translate3d(0, -8px, 0) scale(0.985); }
          to { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes book3dReturn {
          from {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(1);
          }
          to {
            opacity: 0;
            transform: translate3d(var(--origin-x), var(--origin-y), -260px) scale(var(--origin-scale));
          }
        }
      `}</style>
    </div>
  )
}
