import { defineConfig } from 'vitepress'

const github = 'https://github.com/lookmyagent/previewdock'

const docsSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '接入文档', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '模块化接入与体积', link: '/modular-integration' },
    ],
  },
  {
    text: '核心概念',
    items: [
      { text: '架构设计', link: '/architecture' },
      { text: 'API 参考', link: '/api-reference' },
      { text: '部署 Worker / WASM', link: '/deployment' },
    ],
  },
  {
    text: '格式与适配器',
    items: [
      { text: '格式支持矩阵', link: '/format-support' },
      { text: 'Legacy Office', link: '/legacy-office' },
      { text: 'KKFileView 样例审计', link: '/kkfileview-sample-audit' },
    ],
  },
]

const enDocsSidebar = [
  {
    text: 'Getting started',
    items: [
      { text: 'Integration guide', link: '/en/' },
      { text: 'Getting started', link: '/en/getting-started' },
      { text: 'Modular integration and size', link: '/en/modular-integration' },
    ],
  },
  {
    text: 'Core concepts',
    items: [
      { text: 'Architecture', link: '/en/architecture' },
      { text: 'API reference', link: '/en/api-reference' },
      { text: 'Worker / WASM deployment', link: '/en/deployment' },
    ],
  },
  {
    text: 'Formats and adapters',
    items: [
      { text: 'Format support matrix', link: '/en/format-support' },
      { text: 'Legacy Office', link: '/en/legacy-office' },
      { text: 'KKFileView sample audit', link: '/en/kkfileview-sample-audit' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: 'PreviewDock',
  description: '本地优先、按需加载的浏览器文件预览运行时',
  base: '/docs/',
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
