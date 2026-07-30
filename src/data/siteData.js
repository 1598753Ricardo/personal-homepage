const siteData = {
  nav: {
    name: '林汇川',
  },
  hero: {
    name: '林汇川',
    tagline: '法学背景 · 正在用工具做产品',
    cta: '了解更多',
  },
  about: {
    intro: [
      '东莞理工学院法学专业大三在读。不满足于只走法学正统路线，目前在探索法律与工具的交叉方向——用AI辅助搭建产品、关注法律科技行业动态。',
      '相信做成一件小事，比想了很多大事更重要。',
    ],
    email: '206955934@qq.com',
    stats: [
      { value: '4+', label: '项目原型' },
      { value: '2', label: '个月 AI 工具实践' },
      { value: 'Top 6', label: '班级排名' },
      { value: '1', label: '段律所实习' },
    ],
    facts: [
      {
        title: '学习背景',
        text: '东莞理工学院法学卓越班本科在读，绩点排名专业前5%，辅修涉外投资与法律风控微专业。',
      },
      {
        title: '实务接触',
        text: '参与保险纠纷立案材料整理、案件信息核对、证据归类和起诉状初稿撰写。',
      },
      {
        title: '当前方向',
        text: '把法律训练、结构化表达和 AI 工具结合起来，做可展示、可复盘的小项目。',
      },
    ],
  },
  projects: {
    title: '精选项目',
    subtitle: '从零开始，用工具把想法变成产品和信息流程',
    items: [
      {
        title: '个人主页',
        description: '用 AI 协助完成需求拆解、视觉参考、前端搭建和动效调整，把个人背景整理成一个可访问的线上入口。',
        tags: ['React', 'Vite', 'AI 协作'],
        type: 'done',
      },
      {
        title: '基金/财经日报自动化原型',
        description: '围绕基金、股票、宏观事件和国际环境等公开信息，尝试搭建“自动化采集、AI 分析、日报生成”的信息整理流程。',
        tags: ['财经信息', '自动化日报', 'AI 分析'],
        type: 'wip',
      },
      {
        title: '法律科技探索',
        description: '持续观察法律 AI 产品、案例检索、合同审查和实务自动化工具，寻找法学生可切入的具体问题。',
        tags: ['法律科技', '行业观察'],
        type: 'wip',
      },
      {
        title: '法律实务材料整理流程',
        description: '基于保险纠纷材料整理经历，梳理事实、证据、请求和文书之间的对应关系，形成可复用的工作流程。',
        tags: ['证据归类', '文书结构'],
        type: 'soon',
      },
      {
        title: '公共议题与实践记录',
        description: '沉淀模拟政协、社会实践和公益夏令营中的调研、组织、外联、文本写作经验。',
        tags: ['公共议题', '项目统筹'],
        type: 'soon',
      },
    ],
  },
  experience: {
    title: '经历轨迹',
    items: [
      {
        time: '2024.09 - 至今',
        title: '东莞理工学院 · 法学卓越班',
        points: ['绩点排名专业前5%，班级排名5/30', '辅修涉外投资与法律风控微专业', '关注民商事争议解决、保险纠纷和企业合规'],
      },
      {
        time: '2024.10 - 至今',
        title: '法律系助理 · 校园组织',
        points: ['协助法学讲座、竞赛筹备与现场协调', '参与组织2届市级“莞律杯”模拟法庭比赛', '积累专业场景下的沟通和流程管理经验'],
      },
      {
        time: '2026.04 - 至今',
        title: '太平洋保险 · 法律实务协助',
        points: ['整理保险纠纷立案材料', '核对案件信息、归类证据材料', '参与基础文书准备和起诉状初稿撰写'],
      },
      {
        time: '持续参与',
        title: '竞赛与社会实践',
        points: ['2届模拟政协大赛团队队长', '大学生新文科创新实践大赛团队负责人', '对接团委、镇政府等单位开展社会实践'],
      },
    ],
  },
  strengths: {
    title: '核心优势',
    items: [
      {
        icon: 'scale',
        title: '法律专业基础',
        description: '法学专业班级前6，系统掌握法律分析框架，具备扎实的逻辑思辨训练。',
      },
      {
        icon: 'cpu',
        title: 'AI工具运用',
        description: '熟练使用AI辅助工具完成实际任务。从0代码基础到独立搭建本网站。',
      },
      {
        icon: 'grid',
        title: '结构化思维',
        description: '习惯将复杂问题拆解为可执行的步骤，长线规划、分阶段推进。',
      },
      {
        icon: 'trending',
        title: '持续执行力',
        description: '每日法考刷题、每周健身、每日自省记录。用行动而非空想对抗不确定性。',
      },
    ],
    credentials: [
      { title: '大学英语四级证书', slug: 'cet4', image: '/certificates/sample-certificate.png' },
      { title: '助理会计师资格证', slug: 'accounting', image: '/certificates/sample-certificate.png' },
      { title: '涉外投资与法律风控微专业证书', slug: 'foreign-investment-law', image: '/certificates/sample-certificate.png' },
      { title: '红十字救护员证', slug: 'red-cross-first-aid', image: '/certificates/sample-certificate.png' },
    ],
  },
  footer: {
    heading: '保持联系',
    text: '正在探索法律与工具的交叉地带，欢迎交流',
    email: '206955934@qq.com',
    copyright: '林汇川 © 2026',
  },
}

export default siteData
