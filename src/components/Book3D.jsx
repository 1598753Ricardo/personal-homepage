import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const PHOTOBOOK_SCRIPT_ID = 'photo-flipbook-pageflip'
const PAGE_WIDTH = 512
const PAGE_HEIGHT = 640

function loadPageFlipRuntime() {
  if (window.St?.PageFlip) return Promise.resolve()

  const existing = document.getElementById(PHOTOBOOK_SCRIPT_ID)
  if (existing) {
    return new Promise((resolve, reject) => {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
    })
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = PHOTOBOOK_SCRIPT_ID
    script.src = '/photo-flipbook/vendor/page-flip.browser.js'
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })
}

function imageForPage(book, page, index) {
  if (page?.image) return page.image
  if (book?.image) return book.image

  const fallbacks = [
    '/orbit-legal-ai.png',
    '/orbit-fund-intelligence.png',
    '/orbit-legal-internship.png',
    '/orbit-social-impact.png',
    '/hero-bg.jpg',
  ]

  return fallbacks[index % fallbacks.length]
}

function buildPhotoPages(book) {
  const sourcePages = book.pages?.length ? book.pages : [
    {
      title: book.title,
      date: book.year,
      content: '这本项目相册等待补入更完整的图片与过程记录。',
      image: book.image,
    },
  ]

  const plates = sourcePages.flatMap((page, index) => ([
    {
      type: 'photo',
      title: page.title,
      caption: page.content,
      meta: page.date || book.year,
      image: imageForPage(book, page, index),
      size: index % 3 === 0 ? 'large' : index % 3 === 1 ? 'portrait high' : 'medium low',
    },
    {
      type: 'pause',
      title: page.note || page.title,
      caption: page.note ? page.content : '',
      meta: page.date || book.year,
    },
  ]))

  const pages = [
    { type: 'cover' },
    { type: 'endpaper' },
    { type: 'title' },
    { type: 'blank' },
    ...plates,
    { type: 'colophon' },
    { type: 'endpaper' },
    { type: 'back' },
  ]

  if (pages.length % 2 !== 0) pages.splice(pages.length - 2, 0, { type: 'blank' })
  return pages
}

function Folio({ number, side }) {
  if (number < 3) return null
  return <p className={`folio ${side}`}>{String(number - 2).padStart(2, '0')}</p>
}

function PhotoBookPage({ page, book, index, count }) {
  const side = index % 2 === 0 ? 'recto' : 'verso'
  const aria = index === 0 ? 'Front cover' : index === count - 1 ? 'Back cover' : `Page ${index}`

  if (page.type === 'cover') {
    return (
      <article className="book-page art-page cloth recto" data-density="hard" aria-label={aria}>
        <h2 className="cover-title">{book.title}</h2>
        <p className="cover-subtitle">PROJECT PHOTOBOOK</p>
        {book.image ? <figure className="cover-plate"><img src={book.image} alt="" /></figure> : null}
        <span className="cover-foot">{book.year} / {String(book.id).padStart(2, '0')}</span>
      </article>
    )
  }

  if (page.type === 'back') {
    return (
      <article className="book-page art-page cloth verso" data-density="hard" aria-label={aria}>
        <span className="back-mark">{book.title}</span>
      </article>
    )
  }

  if (page.type === 'endpaper') {
    return <article className={`book-page art-page endpaper ${side}`} aria-label={aria} />
  }

  if (page.type === 'title') {
    return (
      <article className={`book-page art-page paper ${side}`} aria-label={aria}>
        <div className="title-block">
          <h2>{book.title}</h2>
          <p>一本项目相册。把过程、材料和阶段性成果放进翻页节奏里。</p>
        </div>
        <Folio number={index} side={side} />
      </article>
    )
  }

  if (page.type === 'photo') {
    return (
      <article className={`book-page art-page paper ${side}`} aria-label={aria}>
        <figure className={`plate ${page.size || 'medium'}`}>
          <img src={page.image} alt={page.title} />
        </figure>
        <div className="plate-caption">
          <span>{page.meta}</span>
          <strong>{page.title}</strong>
          <p>{page.caption}</p>
        </div>
        <Folio number={index} side={side} />
      </article>
    )
  }

  if (page.type === 'pause') {
    return (
      <article className={`book-page art-page paper ${side}`} aria-label={aria}>
        <div className="quote-block">
          <span>{page.meta}</span>
          <h2>{page.title}</h2>
          {page.caption ? <p>{page.caption}</p> : null}
        </div>
        <Folio number={index} side={side} />
      </article>
    )
  }

  if (page.type === 'colophon') {
    return (
      <article className={`book-page art-page paper ${side}`} aria-label={aria}>
        <div className="colophon">
          <p>{book.title}</p>
          <p>Project materials, drafts and visual notes.</p>
          <p className="small-print">Built as a local photo flipbook from the create-photo-flipbook-ui runtime.</p>
        </div>
        <Folio number={index} side={side} />
      </article>
    )
  }

  return <article className={`book-page art-page paper ${side}`} aria-label={aria}><Folio number={index} side={side} /></article>
}

export default function Book3D({ book, phase = 'open', onClose }) {
  const bookRef = useRef(null)
  const flipRef = useRef(null)
  const pages = useMemo(() => book ? buildPhotoPages(book) : [], [book])
  const [status, setStatus] = useState('Cover')
  const [orientation, setOrientation] = useState('Open spread')
  const [turning, setTurning] = useState(false)
  const [runtimeReady, setRuntimeReady] = useState(false)

  useEffect(() => {
    if (!book) return undefined

    let disposed = false
    setRuntimeReady(false)

    loadPageFlipRuntime()
      .then(() => {
        if (disposed || !bookRef.current || !window.St?.PageFlip) return

        const pageFlip = new window.St.PageFlip(bookRef.current, {
          width: PAGE_WIDTH,
          height: PAGE_HEIGHT,
          size: 'stretch',
          minWidth: Math.round(PAGE_WIDTH * 0.56),
          maxWidth: Math.round(PAGE_WIDTH * 1.04),
          minHeight: Math.round(PAGE_HEIGHT * 0.56),
          maxHeight: Math.round(PAGE_HEIGHT * 1.04),
          drawShadow: true,
          flippingTime: 760,
          usePortrait: true,
          startZIndex: 10,
          autoSize: true,
          maxShadowOpacity: 0.42,
          showCover: true,
          mobileScrollSupport: false,
          clickEventForward: true,
          useMouseEvents: true,
          swipeDistance: 24,
          showPageCorners: true,
          disableFlipByClick: false,
        })

        function updateControls(page = pageFlip.getCurrentPageIndex()) {
          const pageCount = pageFlip.getPageCount()
          const lastPage = pageCount - 1
          bookRef.current.dataset.edge = page === 0 ? 'front' : page === lastPage ? 'back' : 'inside'

          if (page === 0) setStatus('Cover')
          else if (page === lastPage) setStatus('Back cover')
          else setStatus(`${String(page + 1).padStart(2, '0')} / ${String(pageCount).padStart(2, '0')}`)
        }

        pageFlip.on('flip', event => updateControls(Number(event.data)))
        pageFlip.on('changeState', event => setTurning(event.data !== 'read'))
        pageFlip.on('init', event => {
          bookRef.current.dataset.layout = event.data.mode
          setOrientation(event.data.mode === 'portrait' ? 'Single page' : 'Open spread')
        })
        pageFlip.on('changeOrientation', event => {
          bookRef.current.dataset.layout = event.data
          setOrientation(event.data === 'portrait' ? 'Single page' : 'Open spread')
        })

        pageFlip.loadFromHTML(bookRef.current.querySelectorAll('.book-page'))
        flipRef.current = pageFlip
        updateControls(0)
        setRuntimeReady(true)
      })
      .catch(() => setStatus('Flipbook runtime missing'))

    return () => {
      disposed = true
      flipRef.current?.destroy?.()
      flipRef.current = null
    }
  }, [book, pages])

  useEffect(() => {
    function handleKey(event) {
      if (event.altKey || event.ctrlKey || event.metaKey || turning || !flipRef.current) return
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        flipRef.current.flipPrev('bottom')
      }
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        flipRef.current.flipNext('bottom')
      }
      if (event.key === 'Home') flipRef.current.turnToPage(0)
      if (event.key === 'End') flipRef.current.turnToPage(flipRef.current.getPageCount() - 1)
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [turning])

  if (!book) return null

  const stage = (
    <div className={`book3d-stage photobook-stage is-${phase}`}>
      <button type="button" className="book3d-close" onClick={onClose}>CLOSE BOOK</button>

      <header className="photobook-header" aria-hidden="true">
        <span>PROJECT PHOTOBOOK</span>
        <h1>{book.title}</h1>
        <span>{orientation}</span>
      </header>

      <section className="photobook-reader" aria-label={`${book.title} 项目翻页相册`}>
        <div className="photobook-rig">
          <div
            ref={bookRef}
            id={`book-${book.slug}`}
            className="photobook book"
            data-page-width={PAGE_WIDTH}
            data-page-height={PAGE_HEIGHT}
          >
            {pages.map((page, index) => (
              <PhotoBookPage key={`${book.slug}-${index}-${page.type}`} page={page} book={book} index={index} count={pages.length} />
            ))}
          </div>
          {!runtimeReady ? <div className="photobook-loading">Loading book</div> : null}
        </div>
      </section>

      <footer className="photobook-controls" aria-label="Book controls">
        <button type="button" aria-label="Previous page" disabled={turning} onClick={() => flipRef.current?.flipPrev('bottom')}>←</button>
        <div className="status" aria-live="polite"><span>{status}</span><small>Drag or use arrow keys</small></div>
        <button type="button" aria-label="Next page" disabled={turning} onClick={() => flipRef.current?.flipNext('bottom')}>→</button>
      </footer>
    </div>
  )

  return createPortal(stage, document.body)
}
