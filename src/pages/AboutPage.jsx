const focusItems = [
  {
    title: '事实拆解',
    text: '从材料、行为和时间线里找到问题真正发生的位置。',
  },
  {
    title: '法律实务',
    text: '把规则放回案件、证据、文书和沟通场景中理解。',
  },
  {
    title: 'AI 工具',
    text: '用工具辅助整理信息、校对思路和推进个人项目。',
  },
]

const introPoints = [
  {
    title: '我怎么看法律',
    text: '我对法律的兴趣，首先来自事实本身。一个争议为什么发生，当事人为什么作出某种选择，规则又如何介入这些具体处境，这些问题比单纯背诵结论更吸引我。',
  },
  {
    title: '我怎么训练自己',
    text: '我更愿意把法律放回真实场景里理解：从案例分析、文书训练、律所实习到模拟法庭，慢慢建立事实、证据、请求和表达之间的连接。',
  },
  {
    title: '我怎么使用工具',
    text: '在法律学习之外，我也尝试用 AI 辅助资料整理、研究分析和个人项目开发。它不是替代判断的答案机器，而是帮助我更快梳理信息、校对思路、推进执行的工具。',
  },
]

const profileItems = [
  {
    label: '当前身份',
    value: '东莞理工学院法学本科在读',
  },
  {
    label: '关注方向',
    value: '民商事争议解决、保险纠纷、法律科技',
  },
  {
    label: '正在积累',
    value: '案例分析、文书训练、实务材料整理与 AI 协作开发',
  },
]

export default function AboutPage() {
  return (
    <main className="about-page" style={{paddingTop:'var(--nav-h)'}}>
      <section className="section about-section">
        <div className="container about-container">
          <hr className="divider about-divider" />

          <div className="about-layout">
            <aside className="about-label about-reveal" data-animate>
              关于
            </aside>

            <article className="about-main">
              <header className="about-hero about-reveal" data-animate>
                <h1>林汇川</h1>
                <p>
                  法学本科生，正在探索法律实务、结构化表达与 AI 工具的交叉方向。
                </p>
              </header>

              <section className="about-introduction" aria-label="Personal Introduction">
                {introPoints.map((item, index) => (
                  <div className="about-intro-point about-reveal" data-animate key={item.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <h2>{item.title}</h2>
                    <p>{item.text}</p>
                  </div>
                ))}
              </section>

              <section className="about-focus about-reveal" aria-labelledby="about-focus-title" data-animate>
                <h2 id="about-focus-title">我现在更关心</h2>
                <div>
                  {focusItems.map((item) => (
                    <div className="about-focus-row" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="about-profile about-reveal" aria-label="Profile" data-animate>
                {profileItems.map((item) => (
                  <div className="about-profile-row" key={item.label}>
                    <span>{item.label}</span>
                    <p>{item.value}</p>
                  </div>
                ))}
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  )
}
