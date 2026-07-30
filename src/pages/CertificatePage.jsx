import { Link, useParams } from 'react-router-dom'
import siteData from '../data/siteData'

export default function CertificatePage() {
  const { slug } = useParams()
  const certificate = siteData.strengths.credentials.find(item => item.slug === slug)

  return (
    <section className="section certificate-page" style={{paddingTop:'calc(var(--nav-h) + var(--sp-4xl))'}}>
      <div className="container">
        <hr className="divider" style={{marginBottom:'var(--sp-4xl)'}} />
        <Link to="/strengths" className="accent-link certificate-back">返回优势</Link>
        <div className="certificate-layout" data-animate>
          <div>
            <p className="tag" style={{marginBottom:'var(--sp-sm)'}}>证书</p>
            <h1 className="text-gradient">{certificate?.title || '证书'}</h1>
          </div>
          <div className="glass certificate-frame">
            <p>证书本体待放入</p>
          </div>
        </div>
      </div>
    </section>
  )
}
