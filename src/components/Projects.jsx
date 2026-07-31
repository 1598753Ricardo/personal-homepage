import { useMemo, useState } from 'react'
import Book3D from './Book3D'

const books = [
  {
    id: 1,
    slug: 'legal-ai',
    title: 'LEGAL AI',
    year: '2026',
    color: '#463321',
    accent: '#d8be8c',
    image: '/orbit-legal-ai.png',
    pages: [
      { title: '法律文书辅助工作流', date: '2026 / 07', content: '围绕民事起诉状、案件材料、事实梳理与法律依据，整理一套可复盘的法律文书辅助流程。', image: '/orbit-legal-ai.png', note: '材料先归类，再写判断。' },
      { title: '工作路径', date: '2026 / 07', content: '案件材料进入后，依次完成事实提取、证据归类、诉讼请求、法律依据与文书生成。', note: 'AI 负责秩序，人负责判断。' },
      { title: '记录意义', date: '2026 / 07', content: '这个项目记录我把法律训练和智能工具结合起来的一次具体尝试，不替代法律判断，只提高整理和表达效率。', note: '效率服务于准确。' },
      { title: '下一章', date: 'NEXT', content: '后续会继续加入真实样例、文书结构、材料模板和工作截图。', note: '保留扩展入口。' },
    ],
  },
  {
    id: 2,
    slug: 'fund-intelligence',
    title: 'FUND INTELLIGENCE',
    year: '2026',
    color: '#30281d',
    accent: '#c8a866',
    image: '/orbit-fund-intelligence.png',
    pages: [
      { title: '基金研究智能系统', date: '2026 / 07', content: '面向基金与市场信息的研究流程，强调信息获取、事件提取、行业映射和日报生成。', image: '/orbit-fund-intelligence.png', note: '从噪声里提取结构。' },
      { title: '每日情报', date: '2026 / 07', content: '把分散的财经信息整理成可读简报，训练自己判断材料价值、变量变化与表达重点。', note: '每天只留重要事实。' },
      { title: '研究习惯', date: '2026 / 07', content: '它更像一个长期研究习惯系统：持续观察市场，持续整理信息，持续校正判断。', note: '研究是慢变量。' },
      { title: '下一章', date: 'NEXT', content: '之后可以补充数据源、自动化流程、日报样张和分析框架。', note: '让流程变成资产。' },
    ],
  },
  {
    id: 3,
    slug: 'legal-internship',
    title: 'LEGAL INTERNSHIP',
    year: '2026',
    color: '#51483b',
    accent: '#e4d3b7',
    image: '/orbit-legal-internship.png',
    pages: [
      { title: '律所实习记录', date: '2026 / 06', content: '记录律所与法律实务场景中的案件归档、法律检索、文书起草和学习成长。', image: '/orbit-legal-internship.png', note: '细节决定秩序。' },
      { title: '案件归档', date: '2026 / 06', content: '从材料命名、证据顺序、当事人信息核对到基础文书准备，理解法律工作对细节的要求。', note: '纸面工作也是判断。' },
      { title: '学习成长', date: '2026 / 06', content: '真正的成长来自反复处理具体材料：看见规则如何落到纸面，也看见表达如何影响事实呈现。', note: '先做扎实，再谈漂亮。' },
      { title: '下一章', date: 'NEXT', content: '后续补充实习任务分解、流程清单和个人复盘。', note: '把经验留下。' },
    ],
  },
  {
    id: 4,
    slug: 'social-impact',
    title: 'SOCIAL IMPACT',
    year: '2025',
    color: '#5a5a42',
    accent: '#d7d1a3',
    image: '/orbit-social-impact.png',
    pages: [
      { title: '志愿服务与社会实践', date: '2025 / 10', content: '沉淀志愿服务、社区普法、社会实践和公共议题参与中的组织与表达经验。', image: '/orbit-social-impact.png', note: '法律要回到人群中。' },
      { title: '社区工作', date: '2025 / 10', content: '把法律知识带到社区和真实人群中，理解法律不只是文本，也是一种公共沟通能力。', note: '解释比展示更重要。' },
      { title: '社会连接', date: '2025 / 10', content: '每一次参与都在训练我如何倾听需求、组织行动，并把抽象知识转化为可感知的帮助。', note: '行动会留下证据。' },
      { title: '下一章', date: 'NEXT', content: '后续加入活动记录、组织复盘和社会实践成果。', note: '继续补档。' },
    ],
  },
  {
    id: 5,
    slug: 'low-altitude-economy',
    title: 'LOW ALTITUDE ECONOMY RESEARCH',
    year: '2026',
    color: '#26302c',
    accent: '#b9c8b7',
    pages: [
      { title: '低空经济研究', date: '2026 / 05', content: '关注低空经济、产业政策、监管结构与地方发展路径，形成研究资料夹。', note: '新产业也是治理问题。' },
      { title: '研究框架', date: '2026 / 05', content: '从政策文本、产业链、地方试点、风险监管和法律责任几个角度搭建观察框架。', note: '先搭框架，再填材料。' },
      { title: '为什么重要', date: '2026 / 05', content: '低空经济让我练习把法律视角放进更大的产业、政策和公共治理结构中。', note: '法律不是孤立文本。' },
      { title: '下一章', date: 'NEXT', content: '后续补充政策摘录、产业结构图和法律风险清单。', note: '等待真实材料。' },
    ],
  },
  {
    id: 6,
    slug: 'moot-court',
    title: 'MOOT COURT',
    year: '2025',
    color: '#3a2a29',
    accent: '#d0a79b',
    pages: [
      { title: '模拟法庭训练', date: '2025 / 12', content: '记录模拟法庭训练中的争点整理、证据表达、庭审协作与临场表达。', note: '表达背后是结构。' },
      { title: '庭审思维', date: '2025 / 12', content: '训练的不只是口头表达，更是如何判断争点、排列事实和回应对方逻辑。', note: '先听懂，再反驳。' },
      { title: '团队协作', date: '2025 / 12', content: '在团队协作中学习分工、稿件打磨和现场节奏控制，把法律分析转化成有力量的表达。', note: '好的庭审是合奏。' },
      { title: '下一章', date: 'NEXT', content: '后续补充庭审稿、争点图和团队协作记录。', note: '留出证据位。' },
    ],
  },
  {
    id: 7,
    slug: 'knowledge-system',
    title: 'KNOWLEDGE SYSTEM',
    year: '2026',
    color: '#24272b',
    accent: '#bfc5ca',
    pages: [
      { title: '个人知识系统', date: '2026 / 07', content: '搭建法学阅读、案例笔记、概念卡片和个人知识库的长期整理系统。', note: '知识要能被再次调用。' },
      { title: '结构化阅读', date: '2026 / 07', content: '把阅读内容拆成概念、规则、案例、问题和个人判断，让知识从“看过”变成“能调用”。', note: '读书也是归档。' },
      { title: '长期工作', date: '2026 / 07', content: '这是一个长期书架：持续积累、持续修订，也持续记录我如何理解法律和世界。', note: '慢慢写厚。' },
      { title: '下一章', date: 'NEXT', content: '后续加入读书笔记、案例卡片和法考知识索引。', note: '下一页继续。' },
    ],
  },
]

export default function Projects() {
  const [hoveredId, setHoveredId] = useState(null)
  const [activeId, setActiveId] = useState(null)
  const [phase, setPhase] = useState('shelf')
  const [light, setLight] = useState({ x: 0, y: 0 })

  const activeBook = useMemo(() => books.find(book => book.id === activeId), [activeId])
  const reading = activeBook && phase !== 'shelf'

  function moveLight(event) {
    const rect = event.currentTarget.getBoundingClientRect()
    setLight({
      x: ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3),
      y: ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3),
    })
  }

  function openBook(book) {
    setActiveId(book.id)
    setPhase('opening')
    window.setTimeout(() => setPhase('open'), 980)
  }

  function closeBook() {
    setPhase('closing')
    window.setTimeout(() => {
      setPhase('shelf')
      setActiveId(null)
    }, 900)
  }

  return (
    <section
      className={`project-library${reading ? ' is-reading' : ''}`}
      onPointerMove={moveLight}
      onPointerLeave={() => {
        setHoveredId(null)
        setLight({ x: 0, y: 0 })
      }}
      style={{ '--light-x': light.x, '--light-y': light.y }}
    >
      <div className="library-title" aria-hidden={reading}>
        <span>PROJECT BOOKSHELF</span>
        <p>每一本书都是一段法律学习、实践与工具探索。</p>
      </div>

      <div className="shelf-room" aria-hidden={reading}>
        <div className="shelf-wall">
          <div className="shelf-plank plank-top" />
          <div className="shelf-plank plank-mid" />
          <div className="shelf-plank plank-bottom" />
          <div className="book-line" aria-label="个人作品集书架">
            {books.map((book, index) => (
              <button
                type="button"
                key={book.slug}
                className={`shelf-book${hoveredId === book.id ? ' is-hovered' : ''}`}
                style={{
                  '--book-color': book.color,
                  '--book-accent': book.accent,
                  '--book-height': `${315 + (index % 4) * 26}px`,
                  '--book-width': `${72 + (index % 2) * 10}px`,
                  '--book-lean': `${(index - 3) * 0.7}deg`,
                }}
                onPointerEnter={() => setHoveredId(book.id)}
                onPointerLeave={() => setHoveredId(null)}
                onFocus={() => setHoveredId(book.id)}
                onBlur={() => setHoveredId(null)}
                onClick={() => openBook(book)}
              >
                <span className="book-spine-face">
                  <span className="book-year">{book.year}</span>
                  <span className="book-name">{book.title}</span>
                  <span className="book-index">{String(book.id).padStart(2, '0')}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {reading ? (
        <Book3D
          book={activeBook}
          phase={phase}
          onClose={closeBook}
        />
      ) : null}

      <style>{`
        .project-library {
          min-height: 100vh;
          height: 100vh;
          position: relative;
          overflow: hidden;
          color: #f3ead8;
          background:
            radial-gradient(circle at calc(50% + var(--light-x) * 18%) calc(22% + var(--light-y) * 12%), rgba(224,192,128,0.18), transparent 28%),
            radial-gradient(circle at 50% 105%, rgba(0,0,0,0.9), transparent 54%),
            linear-gradient(180deg, #090807 0%, #15100b 54%, #060504 100%);
        }

        .project-library::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.04), transparent 18%, transparent 82%, rgba(255,255,255,0.025)),
            repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 118px);
        }

        .library-title {
          position: absolute;
          left: clamp(24px, 5vw, 72px);
          top: calc(var(--nav-h) + clamp(26px, 5vw, 64px));
          z-index: 5;
          transition: opacity 520ms ease, transform 520ms var(--ease-out);
        }

        .project-library.is-reading .library-title {
          opacity: 0;
          transform: translateY(-20px);
          pointer-events: none;
        }

        .library-title span {
          display: block;
          margin-bottom: 12px;
          color: rgba(226,204,162,0.62);
          font-family: var(--font-mono);
          font-size: var(--caption);
          letter-spacing: 0.14em;
        }

        .library-title p {
          color: rgba(243,234,216,0.62);
          font-size: clamp(1rem, 1.35vw, 1.16rem);
          line-height: 1.8;
        }

        .shelf-room {
          position: relative;
          z-index: 2;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1400px;
          transition: opacity 620ms ease, filter 620ms ease, transform 720ms var(--ease-out);
        }

        .project-library.is-reading .shelf-room {
          opacity: 0;
          filter: blur(16px);
          transform: scale(0.985);
          pointer-events: none;
        }

        .shelf-wall {
          position: relative;
          width: min(1360px, 96vw);
          height: min(760px, 82vh);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0 clamp(28px, 6vw, 96px) 118px;
          transform: rotateY(-6deg);
          transform-style: preserve-3d;
          background:
            linear-gradient(90deg, transparent, rgba(124,82,43,0.14) 12%, rgba(22,16,10,0.76) 50%, rgba(124,82,43,0.12) 88%, transparent),
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.1));
          box-shadow: inset 0 -90px 120px rgba(0,0,0,0.42), 0 70px 140px rgba(0,0,0,0.52);
        }

        .shelf-plank {
          position: absolute;
          left: 5%;
          right: 5%;
          height: 32px;
          border-radius: 4px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.08), transparent 40%),
            linear-gradient(90deg, #2b1d12, #51351f 18%, #1b120c 50%, #5a3c22 82%, #25170e);
          box-shadow: 0 22px 42px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08);
        }

        .plank-top { top: 20%; }
        .plank-mid { bottom: 108px; }
        .plank-bottom { bottom: 48px; height: 44px; }

        .book-line {
          position: relative;
          z-index: 3;
          height: min(430px, 54vh);
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: clamp(8px, 1vw, 16px);
        }

        .shelf-book {
          appearance: none;
          position: relative;
          width: var(--book-width);
          height: var(--book-height);
          border: 0;
          padding: 0;
          cursor: pointer;
          background: transparent;
          transform: rotateZ(var(--book-lean)) translateZ(0);
          transform-style: preserve-3d;
          transition: transform 520ms cubic-bezier(.16,1,.3,1), filter 520ms ease;
        }

        .shelf-book::before {
          content: '';
          position: absolute;
          inset: 8px -14px -12px;
          background: rgba(0,0,0,0.42);
          filter: blur(16px);
          transform: translateZ(-22px);
          opacity: 0.55;
          transition: opacity 420ms ease;
        }

        .shelf-book.is-hovered {
          transform: rotateZ(var(--book-lean)) translateY(-18px) translateZ(58px) rotateY(-9deg) scale(1.07);
          filter: brightness(1.12);
          z-index: 8;
        }

        .book-spine-face {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 18px 8px;
          color: #f6ead1;
          background:
            linear-gradient(90deg, rgba(255,255,255,0.14), transparent 20%, rgba(0,0,0,0.38) 86%),
            linear-gradient(180deg, var(--book-color), #15100b);
          border-left: 1px solid rgba(255,255,255,0.14);
          border-right: 1px solid rgba(0,0,0,0.42);
          border-radius: 5px 5px 2px 2px;
          box-shadow: inset 8px 0 16px rgba(255,255,255,0.05), inset -12px 0 18px rgba(0,0,0,0.28);
        }

        .book-name {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: var(--book-accent);
          font-size: clamp(0.72rem, 1vw, 0.92rem);
          font-weight: 650;
          letter-spacing: 0.08em;
          line-height: 1;
        }

        .book-year,
        .book-index {
          color: rgba(244,232,204,0.62);
          font-family: var(--font-mono);
          font-size: 0.72rem;
        }

        @media (max-width: 640px) {
          .project-library {
            min-height: 100svh;
            height: 100svh;
          }

          .library-title {
            left: 18px;
            right: 18px;
          }

          .shelf-wall {
            width: 100vw;
            height: 72vh;
            padding: 0 18px 78px;
            transform: rotateY(-4deg);
          }

          .book-line {
            height: 355px;
            gap: 5px;
          }

          .shelf-book {
            width: 11vw;
            height: min(var(--book-height), 300px);
          }

          .book-name {
            font-size: 0.58rem;
          }
        }
      `}</style>
    </section>
  )
}
