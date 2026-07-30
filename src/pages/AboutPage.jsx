const currentInterests = [
  {
    title: 'Legal Analysis',
    text: '关注事实问题拆解与法律推理。',
  },
  {
    title: 'Legal Practice',
    text: '关注法律如何进入真实场景。',
  },
  {
    title: 'Technology',
    text: '关注工具如何辅助法律学习和研究。',
  },
]

const profileRows = [
  {
    label: 'BACKGROUND',
    value: 'Law Undergraduate',
  },
  {
    label: 'INTERESTS',
    value: ['Legal Analysis', 'Legal Practice', 'AI Application'],
  },
  {
    label: 'DIRECTION',
    value: 'Interdisciplinary Development',
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
              ABOUT
            </aside>

            <article className="about-main">
              <header className="about-hero about-reveal" data-animate>
                <h1>林汇川</h1>
                <p>
                  法学本科生，喜欢从事实问题出发分析法律问题，关注规则、人的行为以及现实场景之间的关系。
                  也尝试探索技术工具如何改变学习与实践方式。
                </p>
              </header>

              <section className="about-introduction" aria-label="Personal Introduction">
                <p className="about-reveal" data-animate>
                  我对法律的兴趣，很多时候来自对事实问题的分析。一个争议为什么会发生，当事人为什么作出某种选择，规则又如何介入这些具体处境，这些问题比单纯背诵结论更吸引我。
                </p>
                <p className="about-reveal" data-animate>
                  在我的理解里，法律不仅是规则本身，也包含人的选择、利益关系和制度逻辑。学习法律的过程，是不断把抽象规则放回现实场景中，看它如何解释事实、约束行为，也如何留下需要判断的空间。
                </p>
                <p className="about-reveal" data-animate>
                  所以我不希望法律学习只停留在书本。通过案例分析、律所实习、模拟法庭、模拟仲裁和文书训练，我慢慢理解法律如何进入真实工作：从事实整理、证据判断，到表达请求和回应争议。
                </p>
                <p className="about-reveal" data-animate>
                  在法律学习之外，我也会尝试使用智能工具辅助资料整理、法律文书写作、研究分析以及个人项目开发。AI 对我来说不是替代法律判断的答案机器，而是帮助我更快整理信息、校对思路、提高效率的工具。
                </p>
              </section>

              <section className="about-interests about-reveal" aria-labelledby="about-interests-title" data-animate>
                <h2 id="about-interests-title">CURRENT INTERESTS</h2>
                <div>
                  {currentInterests.map((item) => (
                    <div className="about-interest-row" key={item.title}>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="about-profile about-reveal" aria-label="Profile" data-animate>
                {profileRows.map((item) => (
                  <div className="about-profile-row" key={item.label}>
                    <span>{item.label}</span>
                    {Array.isArray(item.value) ? (
                      <p>
                        {item.value.map((line) => (
                          <span key={line}>{line}</span>
                        ))}
                      </p>
                    ) : (
                      <p>{item.value}</p>
                    )}
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
