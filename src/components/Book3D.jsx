import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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
    gutter = 0.22,
    crown = 0.12,
    outerLift = 0.08,
    outerSag = 0.04,
    cornerCurl = 0.06,
    turnCurl = 0,
  } = options

  const edgeV = Math.abs(v - 0.5) * 2
  const nearSpine = Math.exp(-u * 10)
  const nearOuter = Math.pow(u, 2.2)
  const sideEdges = Math.pow(edgeV, 3)
  const corner = Math.pow(u, 2.4) * sideEdges
  const pageBelly = Math.sin(u * Math.PI) * crown
  const gutterDrop = -gutter * nearSpine
  const outsideLift = outerLift * Math.pow(u, 1.7)
  const outsideDrop = -outerSag * nearOuter * (0.35 + sideEdges * 0.65)
  const curledCorners = cornerCurl * corner
  const dynamicCurl = turnCurl * Math.sin(u * Math.PI) * (0.45 + sideEdges * 0.55)

  return gutterDrop + pageBelly + outsideLift + outsideDrop + curledCorners + dynamicCurl
}

function makeCurvedPageGeometry(side = 'right', width = 3.05, height = 4.18, options = {}) {
  const xSegments = 72
  const ySegments = 46
  const direction = side === 'right' ? 1 : -1
  const thickness = options.thickness ?? 0.026
  const vertices = []
  const indices = []
  const uvs = []

  for (let layer = 0; layer < 2; layer += 1) {
    const isBottom = layer === 1
    for (let y = 0; y <= ySegments; y += 1) {
      const v = y / ySegments
      const localY = (v - 0.5) * height

      for (let x = 0; x <= xSegments; x += 1) {
        const u = x / xSegments
        const pageX = direction * u * width
        const crownPinch = Math.pow(Math.sin(u * Math.PI), 2) * Math.pow(Math.abs(v - 0.5) * 2, 2) * 0.018
        const z = pageZ(u, v, options) - (isBottom ? thickness : 0) - crownPinch

        vertices.push(pageX, localY, z)
        uvs.push(side === 'right' ? u : 1 - u, 1 - v)
      }
    }
  }

  const row = xSegments + 1
  const layerSize = row * (ySegments + 1)

  for (let y = 0; y < ySegments; y += 1) {
    for (let x = 0; x < xSegments; x += 1) {
      const a = y * (xSegments + 1) + x
      const b = a + 1
      const c = a + (xSegments + 1)
      const d = c + 1
      indices.push(a, b, c, b, d, c)

      const ab = a + layerSize
      const bb = b + layerSize
      const cb = c + layerSize
      const db = d + layerSize
      indices.push(ab, cb, bb, bb, cb, db)
    }
  }

  for (let y = 0; y < ySegments; y += 1) {
    const topA = y * row
    const topB = (y + 1) * row
    const bottomA = topA + layerSize
    const bottomB = topB + layerSize
    indices.push(topA, bottomA, topB, bottomA, bottomB, topB)

    const outerA = y * row + xSegments
    const outerB = (y + 1) * row + xSegments
    const outerBottomA = outerA + layerSize
    const outerBottomB = outerB + layerSize
    indices.push(outerA, outerB, outerBottomA, outerBottomA, outerB, outerBottomB)
  }

  for (let x = 0; x < xSegments; x += 1) {
    const topA = x
    const topB = x + 1
    const bottomA = topA + layerSize
    const bottomB = topB + layerSize
    indices.push(topA, topB, bottomA, bottomA, topB, bottomB)

    const lowerA = ySegments * row + x
    const lowerB = lowerA + 1
    const lowerBottomA = lowerA + layerSize
    const lowerBottomB = lowerB + layerSize
    indices.push(lowerA, lowerBottomA, lowerB, lowerBottomA, lowerBottomB, lowerB)
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

  const half = position.count / 2
  const thickness = options.thickness ?? 0.026
  for (let index = 0; index < position.count; index += 1) {
    const textureU = uv.getX(index)
    const textureV = uv.getY(index)
    const u = side === 'right' ? textureU : 1 - textureU
    const v = 1 - textureV
    position.setZ(index, pageZ(u, v, options) - (index >= half ? thickness : 0))
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

function makeRoundedSlabGeometry(width, height, depth, radius = 0.16) {
  const shape = new THREE.Shape()
  const x = -width / 2
  const y = -height / 2
  const r = Math.min(radius, width / 2, height / 2)

  shape.moveTo(x + r, y)
  shape.lineTo(x + width - r, y)
  shape.quadraticCurveTo(x + width, y, x + width, y + r)
  shape.lineTo(x + width, y + height - r)
  shape.quadraticCurveTo(x + width, y + height, x + width - r, y + height)
  shape.lineTo(x + r, y + height)
  shape.quadraticCurveTo(x, y + height, x, y + height - r)
  shape.lineTo(x, y + r)
  shape.quadraticCurveTo(x, y, x + r, y)

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.035,
    bevelThickness: 0.03,
    bevelSegments: 5,
    curveSegments: 12,
  })
  geometry.translate(0, 0, -depth / 2)
  geometry.computeVertexNormals()
  return geometry
}

function makeSpineGeometry(width = 0.82, height = 4.86, depth = 0.74) {
  const segments = 34
  const rows = 44
  const vertices = []
  const indices = []

  for (let y = 0; y <= rows; y += 1) {
    const v = y / rows
    const localY = (v - 0.5) * height

    for (let x = 0; x <= segments; x += 1) {
      const t = x / segments
      const localX = (t - 0.5) * width
      const arch = Math.cos((t - 0.5) * Math.PI) * 0.16
      const groove = -Math.exp(-Math.pow((t - 0.5) * 7, 2)) * 0.08
      const z = -depth * 0.34 + arch + groove
      vertices.push(localX, localY, z)
    }
  }

  const row = segments + 1
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < segments; x += 1) {
      const a = y * row + x
      const b = a + 1
      const c = a + row
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

function makeGutterFoldGeometry(width = 0.76, height = 4.2) {
  const xSegments = 36
  const ySegments = 42
  const vertices = []
  const indices = []

  for (let y = 0; y <= ySegments; y += 1) {
    const v = y / ySegments
    const localY = (v - 0.5) * height
    for (let x = 0; x <= xSegments; x += 1) {
      const t = x / xSegments
      const localX = (t - 0.5) * width
      const centerSink = -Math.exp(-Math.pow((t - 0.5) * 8, 2)) * 0.12
      const shoulderLift = Math.pow(Math.abs(t - 0.5) * 2, 1.6) * 0.08
      const endSoftness = -Math.pow(Math.abs(v - 0.5) * 2, 4) * 0.025
      vertices.push(localX, localY, 0.12 + centerSink + shoulderLift + endSoftness)
    }
  }

  const row = xSegments + 1
  for (let y = 0; y < ySegments; y += 1) {
    for (let x = 0; x < xSegments; x += 1) {
      const a = y * row + x
      const b = a + 1
      const c = a + row
      const d = c + 1
      indices.push(a, c, b, b, c, d)
    }
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setIndex(indices)
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  geometry.computeVertexNormals()
  return geometry
}

const BOOK_SCALE = 0.66
const PAGE_WIDTH = 3.05
const PAGE_HEIGHT = 4.18

function HardCover({ side, book }) {
  const direction = side === 'right' ? 1 : -1
  const coverGeometry = useMemo(() => makeRoundedSlabGeometry(3.86, 5.02, 0.46, 0.2), [])
  const liningGeometry = useMemo(() => makeRoundedSlabGeometry(3.42, 4.58, 0.055, 0.14), [])

  return (
    <group position={[direction * 1.92, 0, -0.46]}>
      <mesh geometry={coverGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={book.color || '#282014'}
          roughness={0.7}
          metalness={0.08}
          clearcoat={0.18}
          clearcoatRoughness={0.72}
        />
      </mesh>
      <mesh geometry={liningGeometry} position={[0, 0, 0.22]} receiveShadow>
        <meshPhysicalMaterial color="#504d36" roughness={0.78} metalness={0.03} clearcoat={0.08} />
      </mesh>
      <mesh position={[-direction * 1.78, 0, 0.06]} receiveShadow castShadow>
        <boxGeometry args={[0.18, 4.72, 0.56]} />
        <meshPhysicalMaterial color={book.color || '#21180d'} roughness={0.78} metalness={0.06} clearcoat={0.1} />
      </mesh>
      {[-2.24, 2.24].map((y) => (
        <mesh key={y} position={[0, y, 0.1]} receiveShadow castShadow>
          <boxGeometry args={[3.48, 0.045, 0.12]} />
          <meshPhysicalMaterial color="#171107" roughness={0.82} metalness={0.04} />
        </mesh>
      ))}
    </group>
  )
}

function Spine({ book }) {
  const spineSurface = useMemo(() => makeSpineGeometry(), [])

  return (
    <group position={[0, 0, -0.3]}>
      <mesh position={[0, 0, -0.12]} castShadow receiveShadow>
        <boxGeometry args={[0.58, 4.92, 0.56]} />
        <meshPhysicalMaterial color={book.color || '#20190f'} roughness={0.74} metalness={0.08} clearcoat={0.12} />
      </mesh>
      <mesh geometry={spineSurface} position={[0, 0, 0.16]} receiveShadow castShadow>
        <meshPhysicalMaterial color="#2b2114" roughness={0.84} metalness={0.05} clearcoat={0.08} side={THREE.DoubleSide} />
      </mesh>
      {[-0.17, 0.17].map(x => (
        <mesh key={x} position={[x * 1.55, 0, 0.03]} receiveShadow castShadow>
          <boxGeometry args={[0.045, 4.42, 0.22]} />
          <meshPhysicalMaterial color={book.accent || '#bda779'} roughness={0.66} metalness={0.12} />
        </mesh>
      ))}
      {[-1.55, -0.55, 0.55, 1.55].map(y => (
        <mesh key={y} position={[0, y, 0.18]} receiveShadow castShadow>
          <boxGeometry args={[0.5, 0.09, 0.2]} />
          <meshPhysicalMaterial color="#1b1309" roughness={0.72} metalness={0.08} clearcoat={0.08} />
        </mesh>
      ))}
    </group>
  )
}

function PageCutLines({ side }) {
  const direction = side === 'right' ? 1 : -1
  const lines = useMemo(() => Array.from({ length: 22 }), [])

  return (
    <group>
      {lines.map((_, index) => {
        const y = -PAGE_HEIGHT / 2 + 0.2 + index * ((PAGE_HEIGHT - 0.4) / (lines.length - 1))
        const z = -0.18 + (index % 5) * 0.012
        return (
          <mesh key={index} position={[direction * (PAGE_WIDTH + 0.075), y, z]} receiveShadow>
            <boxGeometry args={[0.028, 0.012, 0.34]} />
            <meshStandardMaterial color={index % 2 ? '#b8a98d' : '#e3d7be'} roughness={0.98} />
          </mesh>
        )
      })}
      {[-1, 1].map((edge) => (
        <group key={edge}>
          {Array.from({ length: 16 }).map((_, index) => (
            <mesh
              key={index}
              position={[
                direction * (1.7 + index * 0.085),
                edge * (PAGE_HEIGHT / 2 + 0.02),
                -0.2 + (index % 4) * 0.014,
              ]}
              receiveShadow
            >
              <boxGeometry args={[0.06, 0.012, 0.32]} />
              <meshStandardMaterial color={index % 2 ? '#cabda1' : '#eadfc8'} roughness={0.98} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

function PageStack({ side }) {
  const direction = side === 'right' ? 1 : -1
  const sheets = useMemo(() => Array.from({ length: 34 }), [])
  const geometry = useMemo(() => makeCurvedPageGeometry(side, 3.02, 4.12, {
    gutter: 0.2,
    crown: 0.055,
    outerLift: 0.075,
    outerSag: 0.035,
    cornerCurl: 0.045,
    thickness: 0.018,
  }), [side])
  const edgeGeometry = useMemo(() => makePageEdgeGeometry(side, 'outer', 3.02, 4.12, 0.018, {
    gutter: 0.2,
    crown: 0.055,
    outerLift: 0.075,
    outerSag: 0.035,
    cornerCurl: 0.045,
  }), [side])
  const edgeMaterial = usePaperEdgeMaterial()

  return (
    <group position={[0, 0, -0.09]}>
      {sheets.map((_, index) => {
        const z = -0.27 + index * 0.0105
        const yOffset = Math.sin(index * 1.7) * 0.003
        const xOffset = direction * Math.sin(index * 0.9) * 0.004
        return (
          <group key={index} position={[xOffset, yOffset, z]}>
            <mesh geometry={geometry} receiveShadow castShadow={index % 11 === 0}>
              <meshStandardMaterial color={index % 2 ? '#eadfc8' : '#f1e7d3'} roughness={0.94} />
            </mesh>
            <mesh geometry={edgeGeometry} material={edgeMaterial} receiveShadow position={[0, 0, -0.002]} />
          </group>
        )
      })}
      <mesh position={[direction * 3.08, 0, 0.02]} receiveShadow castShadow>
        <boxGeometry args={[0.16, 4.08, 0.46]} />
        <meshStandardMaterial color="#d6c7a9" roughness={0.96} />
      </mesh>
      <PageCutLines side={side} />
    </group>
  )
}

function CurrentPage({ side, book, page, number }) {
  const pageOptions = useMemo(() => ({
    gutter: 0.24,
    crown: 0.11,
    outerLift: 0.12,
    outerSag: side === 'right' ? 0.055 : 0.05,
    cornerCurl: 0.085,
    thickness: 0.03,
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

  return (
    <group position={[0, 0, 0.19]}>
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
    gutter: 0.24,
    crown: 0.12,
    outerLift: 0.12,
    outerSag: 0.06,
    cornerCurl: 0.1,
    turnCurl: 0.08,
    thickness: 0.026,
  }), [side])
  const undersideGeometry = useMemo(() => makeCurvedPageGeometry(side, 3.05, 4.18, {
    gutter: 0.25,
    crown: 0.09,
    outerLift: 0.1,
    outerSag: 0.07,
    cornerCurl: 0.08,
    turnCurl: 0.06,
    thickness: 0.026,
  }), [side])
  const outerEdge = useMemo(() => makePageEdgeGeometry(side, 'outer', 3.05, 4.18, 0.03, {
    gutter: 0.24,
    crown: 0.12,
    outerLift: 0.12,
    outerSag: 0.06,
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
      gutter: 0.24 + arc * 0.08,
      crown: 0.11 + arc * 0.25,
      outerLift: 0.12 + arc * 0.08,
      outerSag: 0.055 + arc * 0.04,
      cornerCurl: 0.1 + arc * 0.13,
      turnCurl: arc * 0.42,
      thickness: 0.026,
    })
    reshapePageGeometry(undersideGeometry, side, {
      gutter: 0.25 + arc * 0.08,
      crown: 0.09 + arc * 0.2,
      outerLift: 0.1 + arc * 0.07,
      outerSag: 0.065 + arc * 0.04,
      cornerCurl: 0.08 + arc * 0.1,
      turnCurl: arc * 0.34,
      thickness: 0.026,
    })

    if (direction === 'next') {
      ref.current.rotation.y = -t * Math.PI
      ref.current.position.z = 0.16 + bendLift
      ref.current.rotation.z = -arc * 0.08
    } else {
      ref.current.rotation.y = t * Math.PI
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

function GutterFold() {
  const foldGeometry = useMemo(() => makeGutterFoldGeometry(), [])

  return (
    <group>
      <mesh geometry={foldGeometry} receiveShadow castShadow>
        <meshStandardMaterial color="#3a2e1d" roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, 0, 0.1]} rotation={[0, 0.03, 0]}>
        <planeGeometry args={[0.42, 4.16, 12, 1]} />
        <meshBasicMaterial color="#2a1d10" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position={[0.2, 0, 0.1]} rotation={[0, -0.03, 0]}>
        <planeGeometry args={[0.42, 4.16, 12, 1]} />
        <meshBasicMaterial color="#2a1d10" transparent opacity={0.07} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0.205]}>
        <planeGeometry args={[0.8, 4.1, 16, 1]} />
        <meshBasicMaterial color="#120c06" transparent opacity={0.16} depthWrite={false} />
      </mesh>
      <mesh position={[0, 2.13, 0.28]}>
        <planeGeometry args={[6.1, 0.26]} />
        <meshBasicMaterial color="#2c1d0e" transparent opacity={0.08} depthWrite={false} />
      </mesh>
      <mesh position={[0, -2.13, 0.28]}>
        <planeGeometry args={[6.1, 0.26]} />
        <meshBasicMaterial color="#2c1d0e" transparent opacity={0.1} depthWrite={false} />
      </mesh>
    </group>
  )
}

function Desk() {
  const deskY = -1.9

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, deskY, -0.56]} receiveShadow>
        <planeGeometry args={[15, 10]} />
        <meshStandardMaterial color="#21140c" roughness={0.92} />
      </mesh>
      {Array.from({ length: 13 }).map((_, index) => (
        <mesh key={index} rotation={[-Math.PI / 2, 0, 0]} position={[-6.5 + index * 1.08, deskY + 0.002, -0.555]}>
          <planeGeometry args={[0.014, 10]} />
          <meshBasicMaterial color="#583419" transparent opacity={0.38} />
        </mesh>
      ))}
    </group>
  )
}

function CenteredCamera() {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.set(0, 5.1, 8.6)
    camera.lookAt(0, 0.1, 0)
    camera.updateProjectionMatrix()
    console.log('[Book3D] camera.position', camera.position.toArray())
  }, [camera])

  return null
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

  useEffect(() => {
    if (!groupRef.current) return
    console.log('[Book3D] book.group.position', groupRef.current.position.toArray())
    console.log('[Book3D] book.group.scale', groupRef.current.scale.toArray())
  }, [])

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
    <group ref={groupRef} rotation={[-0.58, 0, 0.01]} position={[0, -0.28, -0.18]} scale={BOOK_SCALE}>
      <HardCover side="left" book={book} />
      <HardCover side="right" book={book} />
      <PageStack side="left" />
      <PageStack side="right" />
      <Spine book={book} />
      <CurrentPage side="left" book={book} page={leftPage} number={pageIndex + 1} />
      <CurrentPage side="right" book={book} page={rightPage} number={pageIndex + 2} />
      <GutterFold />
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

  const stage = (
    <div className={`book3d-stage is-${phase}`}>
      {onClose ? (
        <button type="button" className="book3d-close" onClick={onClose}>
          CLOSE BOOK
        </button>
      ) : null}

      <div className="book3d-canvas-wrap">
        <Canvas
          shadows
          camera={{ position: [0, 4.35, 10.4], fov: 38 }}
          gl={{ antialias: true, alpha: false, physicallyCorrectLights: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping
            gl.toneMappingExposure = 1.05
          }}
        >
          <color attach="background" args={['#080604']} />
          <CenteredCamera />
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
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
          z-index: 12;
          overflow: hidden;
          background:
            radial-gradient(circle at 42% 16%, rgba(225,190,125,0.14), transparent 34%),
            linear-gradient(180deg, #090705, #030302);
        }

        .book3d-canvas-wrap {
          position: fixed;
          left: 0;
          top: 0;
          width: 100vw;
          height: 100vh;
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
          }
          64% {
            opacity: 1;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes book3dSettle {
          from { opacity: 0.98; }
          to { opacity: 1; }
        }

        @keyframes book3dReturn {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )

  return createPortal(stage, document.body)
}
