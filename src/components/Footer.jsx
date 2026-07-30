export default function Footer() {
  return (
    <footer style={{
      background:'var(--bg)',
      display:'flex',flexDirection:'column',alignItems:'center',
      gap:52,paddingTop:120,paddingBottom:120,textAlign:'center',
    }}>
      <hr className="divider" />

      <div data-animate style={{maxWidth:520}}>
        <p className="tag" style={{marginBottom:'var(--sp-xl)'}}>04 · 联系</p>
        <h2 style={{fontWeight:590,fontSize:'var(--h2)',color:'var(--text-heading)',letterSpacing:'-0.03em',lineHeight:1.1,marginBottom:'var(--sp-md)'}}>保持联系</h2>
        <p style={{fontSize:'var(--body)',color:'var(--text-muted)',marginBottom:'var(--sp-2xl)'}}>正在探索法律与工具的交叉地带，欢迎交流</p>
        <a href="mailto:206955934@qq.com" className="accent-link" style={{fontWeight:590,fontSize:'var(--h3)',color:'var(--text-heading)',letterSpacing:'-0.02em'}}>206955934@qq.com</a>
      </div>

      {/* Footer links row — onlook.cam style */}
      <nav style={{display:'flex',alignItems:'center',gap:'var(--sp-sm)',fontSize:'var(--body-sm)',color:'var(--text-muted)'}}>
        <span>© 2026 林汇川</span>
      </nav>
    </footer>
  )
}
