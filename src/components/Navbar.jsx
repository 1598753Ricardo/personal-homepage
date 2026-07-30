import { Link, useLocation } from 'react-router-dom'

const links = [
  { label: '关于', path: '/about' },
  { label: '项目', path: '/projects' },
  { label: '优势', path: '/strengths' },
  { label: '经历', path: '/resume' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <header style={{
      position:'fixed',top:0,left:0,right:0,zIndex:'var(--z-nav)',
      height:'var(--nav-h)',
      display:'flex',alignItems:'center',justifyContent:'space-between',
      paddingLeft:'max(24px,calc((100vw - var(--max-w))/2))',
      paddingRight:'max(24px,calc((100vw - var(--max-w))/2))',
      background:'rgba(16,17,18,0.65)',
      backdropFilter:'blur(12px)',
      WebkitBackdropFilter:'blur(12px)',
      borderBottom:'1px solid var(--border)',
    }}>
      <Link to="/" style={{fontSize:'var(--body-sm)',fontWeight:590,color:'var(--text-heading)',letterSpacing:'-0.01em'}}>林汇川</Link>
      <nav style={{display:'flex',alignItems:'center',gap:28}}>
        {links.map(l=>(
          <Link key={l.path} to={l.path} className={pathname===l.path?'':'accent-link'} style={{fontSize:'var(--body-sm)',fontWeight:pathname===l.path?500:400,color:pathname===l.path?'var(--text-heading)':'var(--text)',letterSpacing:'-0.01em'}}>{l.label}</Link>
        ))}
        <Link to="/contact" style={{fontSize:'var(--body-sm)',fontWeight:500,color:'#1D2629',background:'var(--text)',borderRadius:'var(--r-sm)',padding:'6px 20px',letterSpacing:'-0.01em',transition:'opacity var(--dur-fast) ease'}} onMouseEnter={e=>e.currentTarget.style.opacity='0.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>联系</Link>
      </nav>
    </header>
  )
}
