import siteData from '../data/siteData'
import { useEffect, useRef, useState } from 'react'

export default function Strengths() {
  const [activeCertificate, setActiveCertificate] = useState(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const stageRef = useRef(null)
  const hideTimerRef = useRef(null)

  useEffect(() => {
    return () => clearTimeout(hideTimerRef.current)
  }, [])

  const showCertificate = (item, event) => {
    clearTimeout(hideTimerRef.current)
    const stage = stageRef.current
    if (!stage) return

    const stageRect = stage.getBoundingClientRect()
    const itemRect = event.currentTarget.getBoundingClientRect()
    const originX = itemRect.left + itemRect.width / 2 - (stageRect.left + stageRect.width / 2)
    const originY = itemRect.top + itemRect.height / 2 - (stageRect.top + stageRect.height / 2)

    stage.style.setProperty('--certificate-origin-x', `${originX}px`)
    stage.style.setProperty('--certificate-origin-y', `${originY}px`)
    setActiveCertificate(item)
    setIsPreviewing(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setIsPreviewing(true))
    })
  }

  const hideCertificate = () => {
    setIsPreviewing(false)
    clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => {
      setActiveCertificate(null)
    }, 360)
  }

  return (
    <section className="section certificate-section" style={{background:'var(--bg)'}}>
      <div className="container">
        <div
          ref={stageRef}
          className={`certificate-stage ${isPreviewing ? 'is-previewing' : ''}`}
        >
          <h1 className="text-gradient certificate-title">证书</h1>
          <div className="certificate-name-list">
            {siteData.strengths.credentials.map(item => (
              <button
                key={item.slug}
                className="certificate-name"
                type="button"
                onMouseEnter={event => showCertificate(item, event)}
                onMouseLeave={hideCertificate}
                onFocus={event => showCertificate(item, event)}
                onBlur={hideCertificate}
              >
                {item.title}
              </button>
            ))}
          </div>
          {activeCertificate && (
            <div className="glass certificate-preview" aria-live="polite">
              {activeCertificate.image ? (
                <img src={activeCertificate.image} alt={activeCertificate.title} />
              ) : (
                <div className="certificate-placeholder">
                  <span>{activeCertificate.title}</span>
                  <small>把证书图片路径填到 siteData.js 的 image 字段</small>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
