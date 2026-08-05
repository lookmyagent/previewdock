import { defineConfig } from 'vitepress'

const github = 'https://github.com/lookmyagent/previewdock'

const docsSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '产品与接入概览', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: 'Vue / React / Web 接入', link: '/frameworks' },
      { text: 'All 模式与分类模式', link: '/modular-integration' },
    ],
  },
  {
    text: '产品能力',
    items: [
      { text: '七大格式分类', link: '/categories' },
      { text: '格式支持与兼容性', link: '/format-support' },
      { text: '产品特点与边界', link: '/architecture' },
    ],
  },
  {
    text: '使用与上线',
    items: [
      { text: '组件使用', link: '/api-reference' },
      { text: '运行环境与部署', link: '/deployment' },
      { text: '旧版 Office 使用说明', link: '/legacy-office' },
    ],
  },
]

const enDocsSidebar = [
  {
    text: 'Getting started',
    items: [
      { text: 'Product and integration overview', link: '/en/' },
      { text: 'Getting started', link: '/en/getting-started' },
      { text: 'Vue / React / Web', link: '/en/frameworks' },
      { text: 'All mode and category mode', link: '/en/modular-integration' },
    ],
  },
  {
    text: 'Product capabilities',
    items: [
      { text: 'Seven format categories', link: '/en/categories' },
      { text: 'Format support and compatibility', link: '/en/format-support' },
      { text: 'Product principles and boundaries', link: '/en/architecture' },
    ],
  },
  {
    text: 'Usage and production',
    items: [
      { text: 'Component usage', link: '/en/api-reference' },
      { text: 'Runtime and deployment', link: '/en/deployment' },
      { text: 'Legacy Office usage', link: '/en/legacy-office' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'PreviewDock',
  description: '本地优先、按需加载的浏览器文件预览运行时',
  base: '/docs/',
  appearance: false,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['meta', { name: 'theme-color', content: '#315ee7' }],
  ],
  themeConfig: {
    logo: undefined,
    siteTitle: 'PreviewDock Docs',
    outline: { label: '本页内容', level: [2, 3] },
    lastUpdated: { text: '最后更新' },
    docFooter: { prev: '上一页', next: '下一页' },
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    search: { provider: 'local', options: { translations: { button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' }, modal: { noResultsText: '没有找到结果', resetButtonTitle: '清除查询', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } } } } },
    sidebar: {
      '/en/': enDocsSidebar,
      '/': docsSidebar,
    },
    socialLinks: [{ icon: 'github', link: github }],
    editLink: { pattern: `${github}/edit/main/docs/:path`, text: '在 GitHub 上编辑此页' },
    footer: { message: 'Released under the Apache-2.0 License.', copyright: 'PreviewDock contributors' },
  },
})
