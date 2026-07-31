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

function pageZ(u, v, options = {}) {
  const {
    gutter = 0.34,
    crown = 0.17,
    outerSag = 0.11,
    cornerCurl = 0.08,
    turnCurl = 0,
  } = options

  const edgeV = Math.abs(v - 0.5) * 2
  const nearSpine = Math.exp(-u * 10)
  const nearOuter = Math.pow(u, 2.2)
  const sideEdges = Math.pow(edgeV, 3)
  const corner = Math.pow(u, 2.4) * sideEdges
  const pageBelly = Math.sin(u * Math.PI) * crown
  const gutterDrop = -gutter * nearSpine
  const outsideDrop = -outerSag * nearOuter
  const curledCorners = cornerCurl * corner
  const dynamicCurl = turnCurl * Math.sin(u * Math.PI) * (0.45 + sideEdges * 0.55)

  return gutterDrop + pageBelly + outsideDrop + curledCorners + dynamicCurl
}

function makeCurvedPageGeometry(side = 'right', width = 3.05, height = 4.18, options = {}) {
  const xSegments = 64
  const ySegments = 42
  const direction = side === 'right' ? 1 : -1
  const vertices = []
  const indices = []
  const uvs = []

  for (let y = 0; y <= ySegments; y += 1) {
    const v = y / ySegments
    const localY = (v - 0.5) * height

    for (let x = 0; x <= xSegments; x += 1) {
      const u = x / xSegments
      const pageX = direction * u * width
      const z = pageZ(u, v, options)

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

function makePageEdgeGeometry(side = 'right', edge = 'outer', width = 3.05, height = 4.18, thickness = 0.028, options = {}) {
  const segments = 56
  const direction = side === 'right' ? 1 : -1
  const vertices = []
  const indices = []

  for (let i = 0; i <= segments; i += 1) {
    const t = i / segments
    const u = edge === 'outer' ? 1 : t
    const v = edge === 'outer' ? t : edge === 'top' ? 0 : 1
    const x = direction * u * width
    const y = edge === 'outer' ? (t - 0.5) * height : (v - 0.5) * height
    const z = pageZ(u, v, options)

    vertices.push(x, y, z)
    vertices.push(x, y, z - thickness)

    if (i < segments) {
      const a = i * 2
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

function reshapePageGeometry(geometry, side, options = {}) {
  const position = geometry.attributes.position
  const uv = geometry.attributes.uv
  if (!position || !uv) return

  for (let index = 0; index < position.count; index += 1) {
    const textureU = uv.getX(index)
    const textureV = uv.getY(index)
    const u = side === 'right' ? textureU : 1 - textureU
    const v = 1 - textureV
    position.setZ(index, pageZ(u, v, options))
  }

  position.needsUpdate = true
  geometry.computeVertexNormals()
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
    return new THREE.MeshPhysicalMaterial({
      map: texture,
      color: '#f3ead8',
      roughness: 0.82,
      metalness: 0,
      clearcoat: 0.04,
      clearcoatRoughness: 0.9,
      side: THREE.DoubleSide,
    })
  }, [book, page, number, side])
}

function usePaperEdgeMaterial() {
  return useMemo(() => new THREE.MeshStandardMaterial({
    color: '#c9ba9c',
    roughness: 0.95,
    metalness: 0,
  }), [])
}

function HardCover({ side, book }) {
  const direction = side === 'right' ? 1 : -1
  const angle = side === 'right' ? -0.5 : 0.5

  return (
    <group rotation={[0, angle, 0]} position={[0, 0, -0.36]}>
      <mesh position={[direction * 1.78, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.55, 4.75, 0.32]} />
        <meshPhysicalMaterial
          color={book.color || '#282014'}
          roughness={0.64}
          metalness={0.08}
          clearcoat={0.18}
          clearcoatRoughness={0.72}
        />
      </mesh>
      <mesh position={[direction * 1.78, 0, 0.18]} receiveShadow>
        <boxGeometry args={[3.32, 4.52, 0.034]} />
        <meshPhysicalMaterial color="#504d36" roughness={0.78} metalness={0.03} clearcoat={0.08} />
      </mesh>
    </group>
  )
}

function Spine({ book }) {
  return (
    <group position={[0, 0, -0.16]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.66, 4.86, 0.62]} />
        <meshPhysicalMaterial color="#15110b" roughness={0.72} metalness={0.1} clearcoat={0.1} />
      </mesh>
      <mesh position={[0, 0, 0.34]} receiveShadow>
        <boxGeometry args={[0.28, 4.58, 0.1]} />
        <meshStandardMaterial color="#050403" roughness={0.98} />
      </mesh>
      {[-0.17, 0.17].map(x => (
        <mesh key={x} position={[x * 1.35, 0, 0.38]} receiveShadow>
          <boxGeometry args={[0.028, 4.32, 0.055]} />
          <meshPhysicalMaterial color={book.accent || '#bda779'} roughness={0.62} metalness={0.16} />
        </mesh>
      ))}
    </group>
  )
}

function PageStack({ side }) {
  const direction = side === 'right' ? 1 : -1
  const angle = side === 'right' ? -0.5 : 0.5
  const pages = useMemo(() => Array.from({ length: 74 }), [])
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.02, 4.12, {
    gutter: 0.3,
    crown: 0.08,
    outerSag: 0.08,
    cornerCurl: 0.03,
  }), [side])
  const edgeGeometry = useMemo(() => makePageEdgeGeometry(side, 'outer', 3.02, 4.12, 0.018, {
    gutter: 0.3,
    crown: 0.08,
    outerSag: 0.08,
    cornerCurl: 0.03,
  }), [side])
  const edgeMaterial = usePaperEdgeMaterial()

  return (
    <group rotation={[0, angle, 0]} position={[0, 0, -0.02]}>
      {pages.map((_, index) => {
        const z = -0.19 + index * 0.005
        const yOffset = (index - pages.length / 2) * 0.0008
        return (
          <group key={index} position={[0, yOffset, z]}>
            <mesh geometry={geometry} receiveShadow castShadow={index % 11 === 0}>
              <meshStandardMaterial color={index % 2 ? '#eadfc8' : '#f1e7d3'} roughness={0.94} />
            </mesh>
            <mesh geometry={edgeGeometry} material={edgeMaterial} receiveShadow position={[0, 0, -0.002]} />
          </group>
        )
      })}
      <mesh position={[direction * 3.08, 0, 0.04]} receiveShadow castShadow>
        <boxGeometry args={[0.12, 4.05, 0.38]} />
        <meshStandardMaterial color="#d6c7a9" roughness={0.96} />
      </mesh>
    </group>
  )
}

function CurrentPage({ side, book, page, number }) {
  const pageOptions = useMemo(() => ({
    gutter: 0.42,
    crown: 0.2,
    outerSag: side === 'right' ? 0.14 : 0.12,
    cornerCurl: 0.1,
  }), [side])
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, pageOptions), [side, pageOptions])
  const undersideGeometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, {
    ...pageOptions,
    gutter: pageOptions.gutter + 0.015,
    outerSag: pageOptions.outerSag + 0.01,
  }), [side, pageOptions])
  const outerEdge = useMemo(() => makePageEdgeGeometry(side, 'outer', 3.05, 4.18, 0.032, pageOptions), [side, pageOptions])
  const topEdge = useMemo(() => makePageEdgeGeometry(side, 'top', 3.05, 4.18, 0.024, pageOptions), [side, pageOptions])
  const bottomEdge = useMemo(() => makePageEdgeGeometry(side, 'bottom', 3.05, 4.18, 0.024, pageOptions), [side, pageOptions])
  const material = usePageMaterial(book, page, number, side)
  const edgeMaterial = usePaperEdgeMaterial()
  const angle = side === 'right' ? -0.5 : 0.5

  return (
    <group rotation={[0, angle, 0]} position={[0, 0, 0.18]}>
      <mesh geometry={geometry} material={material} castShadow receiveShadow />
      <mesh geometry={undersideGeometry} position={[0, 0, -0.032]} receiveShadow>
        <meshStandardMaterial color="#d5c8af" roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={outerEdge} material={edgeMaterial} receiveShadow castShadow />
      <mesh geometry={topEdge} material={edgeMaterial} receiveShadow />
      <mesh geometry={bottomEdge} material={edgeMaterial} receiveShadow />
    </group>
  )
}

function TurningPage({ direction, book, page, backPage, number, onDone }) {
  const ref = useRef(null)
  const progressRef = useRef(0)
  const doneRef = useRef(false)
  const side = direction === 'next' ? 'right' : 'left'
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, {
    gutter: 0.42,
    crown: 0.22,
    outerSag: 0.12,
    cornerCurl: 0.1,
    turnCurl: 0.08,
  }), [side])
  const undersideGeometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, {
    gutter: 0.44,
    crown: 0.18,
    outerSag: 0.14,
    cornerCurl: 0.08,
    turnCurl: 0.06,
  }), [side])
  const outerEdge = useMemo(() => makePageEdgeGeometry(side, 'outer', 3.05, 4.18, 0.03, {
    gutter: 0.42,
    crown: 0.22,
    outerSag: 0.12,
    cornerCurl: 0.1,
  }), [side])
  const frontMaterial = usePageMaterial(book, page, number, side)
  const backMaterial = usePageMaterial(book, backPage, number + (direction === 'next' ? 1 : -1), direction === 'next' ? 'left' : 'right')
  const edgeMaterial = usePaperEdgeMaterial()

  useEffect(() => {
    progressRef.current = 0
    doneRef.current = false
  }, [direction, page])

  useFrame((_, delta) => {
    if (!ref.current) return
    progressRef.current = Math.min(1, progressRef.current + delta * 1.45)
    const t = 1 - Math.pow(1 - progressRef.current, 3)
    const arc = Math.sin(t * Math.PI)
    const bendLift = arc * 0.56

    reshapePageGeometry(geometry, side, {
      gutter: 0.42 + arc * 0.08,
      crown: 0.18 + arc * 0.28,
      outerSag: 0.1 + arc * 0.04,
      cornerCurl: 0.1 + arc * 0.13,
      turnCurl: arc * 0.42,
    })
    reshapePageGeometry(undersideGeometry, side, {
      gutter: 0.45 + arc * 0.08,
      crown: 0.15 + arc * 0.22,
      outerSag: 0.13 + arc * 0.04,
      cornerCurl: 0.08 + arc * 0.1,
      turnCurl: arc * 0.34,
    })

    if (direction === 'next') {
      ref.current.rotation.y = -0.43 - t * Math.PI
      ref.current.position.z = 0.16 + bendLift
      ref.current.rotation.z = -arc * 0.08
    } else {
      ref.current.rotation.y = 0.43 + t * Math.PI
      ref.current.position.z = 0.16 + bendLift
      ref.current.rotation.z = arc * 0.08
    }

    if (progressRef.current >= 1 && !doneRef.current) {
      doneRef.current = true
      onDone()
    }
  })

  return (
    <group ref={ref} position={[0, 0, 0.16]}>
      <mesh geometry={geometry} material={frontMaterial} castShadow receiveShadow />
      <mesh geometry={undersideGeometry} material={backMaterial} position={[0, 0, -0.03]} rotation={[0, Math.PI, 0]} castShadow receiveShadow />
      <mesh geometry={outerEdge} material={edgeMaterial} receiveShadow castShadow />
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

function BookOcclusion() {
  return (
    <group>
      <mesh position={[0, 0, 0.34]} rotation={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[0.38, 4.25, 0.018]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <mesh position={[-0.34, 0, 0.29]} rotation={[0, 0.28, 0]}>
        <planeGeometry args={[0.8, 4.18]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0.34, 0, 0.29]} rotation={[0, -0.28, 0]}>
        <planeGeometry args={[0.8, 4.18]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.18} depthWrite={false} />
      </mesh>
      <mesh position={[0, 2.13, 0.28]}>
        <planeGeometry args={[6.1, 0.26]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.1} depthWrite={false} />
      </mesh>
      <mesh position={[0, -2.13, 0.28]}>
        <planeGeometry args={[6.1, 0.26]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.13} depthWrite={false} />
      </mesh>
    </group>
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
    <group ref={groupRef} rotation={[-0.98, 0, 0.01]} position={[0, 0, 0]}>
      <HardCover side="left" book={book} />
      <HardCover side="right" book={book} />
      <PageStack side="left" />
      <PageStack side="right" />
      <Spine book={book} />
      <CurrentPage side="left" book={book} page={leftPage} number={pageIndex + 1} />
      <CurrentPage side="right" book={book} page={rightPage} number={pageIndex + 2} />
      <BookOcclusion />
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

export default function Book3D({ book, phase = 'open', onClose }) {
  if (!book) return null

  return (
    <div className={`book3d-stage is-${phase}`}>
      {onClose ? (
        <button type="button" className="book3d-close" onClick={onClose}>
          CLOSE BOOK
        </button>
      ) : null}

      <div className="book3d-canvas-wrap">
        <Canvas
          shadows
          camera={{ position: [0, 5.25, 6.55], fov: 38 }}
          gl={{ antialias: true, alpha: false, physicallyCorrectLights: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <color attach="background" args={['#080604']} />
          <ambientLight intensity={0.32} />
          <directionalLight
            position={[-3.8, 6.4, 4.8]}
            intensity={2.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-5}
            shadow-camera-right={5}
            shadow-camera-top={5}
            shadow-camera-bottom={-5}
          />
          <pointLight position={[3.2, 2.8, 3.2]} intensity={0.62} color="#d7b36f" />
          <spotLight position={[0, 6.4, 2.4]} angle={0.48} penumbra={0.78} intensity={1.55} castShadow />
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
            transform: translate3d(0, 0, -220px) scale(0.86);
          }
          64% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(0.94);
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
            transform: translate3d(0, 0, -220px) scale(0.86);
          }
        }
      `}</style>
    </div>
  )
}
