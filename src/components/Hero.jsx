import RingCarousel from './RingCarousel'

export default function Hero() {
  return (
    <section style={{
      position:'relative',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',
      padding:'calc(var(--nav-h) + var(--sp-xl)) 24px var(--sp-xl)',
      background:'var(--bg)',
      overflow:'hidden',
      isolation:'isolate',
    }}>
      <img src="/hero-bg.jpg" alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',zIndex:-2,opacity:0.32}} />
      <span style={{position:'absolute',inset:0,zIndex:-1,background:'radial-gradient(circle at 50% 42%, rgba(255,255,255,0.08), transparent 38%), rgba(16,17,18,0.72)'}} />
      <span className="ambient-line ambient-line-a" />
      <span className="ambient-line ambient-line-b" />

      <div style={{width:'min(1080px,100%)',position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'var(--sp-lg)'}}>
        <h1 className="fade-in text-gradient" style={{fontSize:'clamp(2.6rem,5.8vw,5.4rem)',fontWeight:590,lineHeight:1,letterSpacing:'0',animationDelay:'0.1s'}}>
          林汇川
        </h1>

        <div className="fade-in" style={{width:'100%',animationDelay:'0.25s'}}>
          <RingCarousel />
        </div>
      </div>
    </section>
  )
}
