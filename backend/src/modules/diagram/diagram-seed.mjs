// First-run catalog; the image ships in public/diagram/.
export const SEED_DIAGRAM_DRAFTS = [
  {
    title: 'MuHub 系统架构',
    imageUrl: '/diagram/muhub-architecture.svg',
    description: '浏览器加载 React 单页应用，通过 /api 访问 Node HTTP 服务；导航与架构图分别持久化为独立的 JSON 文件，写入串行化并以临时文件替换，保证数据完整。',
  },
];
