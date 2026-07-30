import siteData from '../data/siteData'

const stats = [
  { value: '4+', label: '项目原型' },
  { value: '2', label: '个月 AI 工具实践' },
  { value: 'Top 6', label: '班级排名' },
  { value: '1', label: '段律所实习' },
]

export default function Experience() {
  return (
    <section className="section" style={{background:'var(--bg)'}}>
      <div className="container">
        <hr className="divider" style={{marginBottom:'var(--sp-4xl)'}} />

        <div className="about-split" data-animate style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'var(--sp-3xl)',alignItems:'center',marginBottom:'var(--sp-3xl)'}}>
          {/* Avatar placeholder — glass card */}
          <div className="glass" style={{aspectRatio:'4/5',maxWidth:360,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="80" height="100" viewBox="0 0 80 100" fill="none">
              <circle cx="40" cy="28" r="26" stroke="var(--border-hover)" strokeWidth="1" fill="none"/>
              <path d="M4 96 Q4 52 40 52 Q76 52 76 96" stroke="var(--border-hover)" strokeWidth="1" fill="none"/>
            </svg>
          </div>

          <div>
            <p className="tag" style={{marginBottom:'var(--sp-sm)'}}>01 · 关于</p>
            <h2 style={{fontWeight:590,fontSize:'var(--h2)',color:'var(--text-heading)',letterSpacing:'-0.03em',lineHeight:1.1,marginBottom:'var(--sp-lg)'}}>关于我</h2>
            <p style={{fontSize:'var(--body)',color:'var(--text-muted)',lineHeight:1.8,marginBottom:'var(--sp-md)'}}>东莞理工学院法学卓越班大三在读。我的主页不把简历平铺出来，而是把学习、实务、项目和能力拆成几个板块，让别人看见我正在形成的方向。</p>
            <p style={{fontSize:'var(--body)',color:'var(--text-muted)',lineHeight:1.8,marginBottom:'var(--sp-md)'}}>现在关注法律与工具的交叉：一边打法学基础，一边用 AI 辅助完成页面、材料整理和产品化表达。</p>
            <p style={{fontSize:'var(--body)',color:'var(--text-muted)',lineHeight:1.8,marginBottom:'var(--sp-lg)'}}>相信做成一件小事，比想了很多大事更重要。</p>
            <a href="mailto:206955934@qq.com" className="accent-link" style={{fontFamily:'var(--font-mono)',fontSize:'var(--caption)',letterSpacing:'0.06em',color:'var(--text-muted)',textTransform:'uppercase'}}>206955934@qq.com</a>
          </div>
        </div>

        {/* Stats grid */}
        <div className="stats-grid" data-animate style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'var(--sp-lg)',marginBottom:'var(--sp-3xl)'}}>
          {stats.map((s,i)=>(
            <div key={i} className="glass" style={{padding:'var(--sp-xl) var(--sp-lg)',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <span style={{fontWeight:590,fontSize:'var(--h2)',color:'var(--text-heading)',letterSpacing:'-0.03em',lineHeight:1,marginBottom:'var(--sp-xs)'}}>{s.value}</span>
              <span style={{fontFamily:'var(--font-mono)',fontSize:'var(--caption)',letterSpacing:'0.06em',textTransform:'uppercase',color:'var(--text-muted)'}}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="fact-grid" data-animate>
          {siteData.about.facts.map((fact, i) => (
            <div key={fact.title} className="glass fact-card">
              <span className="fact-index">{`0${i + 1}`}</span>
              <h3>{fact.title}</h3>
              <p>{fact.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
