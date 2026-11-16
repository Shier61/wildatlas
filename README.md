# WildAtlas · 野境图鉴

一座面向公众的野生动植物双语科普平台。植物标注入侵风险或原生属性，动物标注 IUCN 濒危等级与国家保护级别，每个物种均配有中国分布地图、双语介绍与开放许可图片，并支持上传照片进行 AI 物种识别。

**技术栈**：React 19 + Vite + TypeScript + Tailwind CSS + framer-motion + ECharts · Express + TypeScript + Zod · SQLite + Prisma ORM · OpenAI 兼容视觉模型（Key 自配）

## 功能一览

| 模块 | 说明 |
|------|------|
| 物种索引 | 侧边栏多维筛选（类群 / 细分类群 / 濒危等级 / 生态属性 / 入侵风险）+ 关键词搜索 + 排序分页，共收录 85 个物种 |
| 物种详情 | 大图 Banner、双语介绍（中/EN 一键切换）、IUCN 与入侵风险徽章、保护级别、ECharts 中国分布地图、主要威胁、同类群物种推荐 |
| AI 识别 | 上传或拖拽照片 → 调用视觉大模型返回候选物种与置信度 → 一键跳转详情页；未配置 Key 时为演示模式 |
| 首页 | 自然摄影背景 + 玻璃拟态数据面板 + 精选物种 |

## 数据库设计

- `Species`：slug、类群、中/英文名、学名、科属、是否原生、入侵风险（high/medium/watch）、IUCN 等级、国家保护级别、分布省份（JSON）、双语分布/栖息地/介绍/威胁、图片、精选标记
- `IdentifyRecord`：识别请求记录（图片名、模式、结果 JSON、时间）

数据库为 SQLite（`backend/dev.db`），通过 Prisma ORM 访问，切换 PostgreSQL 只需改 `prisma/schema.prisma` 的 `provider` 并重跑迁移。

## 本地运行

### Windows（推荐，一键启动）

1. 安装 [Node.js LTS](https://nodejs.org)（唯一前置要求，一路下一步即可）
2. 双击项目根目录的 **`start.bat`**

首次运行会自动安装依赖（约 2-3 分钟），之后浏览器会自动打开 **http://localhost:3000**，单进程运行整站（后端 API + 已构建的前端页面），关闭窗口即停止。

> zip 包内已含构建好的 `frontend/dist` 与灌好 85 个物种的 `backend/dev.db`，无需额外构建或灌数据。

### 开发模式（前后端分离，任意平台）

前置要求：Node.js 20+，pnpm（或 npm）

```bash
# 1. 后端
cd backend
npm install            # postinstall 会自动执行 prisma generate
cp .env.example .env   # 按需填写 AI_API_KEY（可选）
npx prisma migrate dev # 创建数据库与表结构
npm run db:seed        # 灌入 85 个物种数据
npm run dev            # http://localhost:3000

# 2. 前端（新开终端）
cd frontend
pnpm install
pnpm dev               # http://localhost:5173
```

> 后端检测到 `frontend/dist` 存在时会自动托管整站（单进程模式）；开发时访问 Vite 的 5173 端口即可，两者互不影响。

## 配置 AI 识别（可选）

编辑 `backend/.env`，填入任意 OpenAI 兼容视觉模型的凭据即可启用真实识别：

```env
AI_API_KEY=sk-xxxxxxxx
AI_BASE_URL=https://api.openai.com/v1   # 或其他服务商
AI_MODEL=gpt-4o-mini                    # 如 qwen-vl-max / glm-4v-flash
```

留空则运行在演示模式，识别页会明确提示。

## 数据来源

- IUCN 红色名录（濒危等级）
- 《中国外来入侵物种名单》（植物入侵风险）
- 《国家重点保护野生动物名录》（保护级别）
- 物种图片来自 iNaturalist 开放许可照片（CC 授权）

> 所有内容仅作科普参考，保护级别以官方最新名录为准。

## 目录结构

```
├── backend/               # Express + Prisma API
│   ├── prisma/
│   │   ├── schema.prisma  # 数据模型
│   │   ├── seed.ts        # 种子数据脚本
│   │   └── data/          # 85 个物种的中文整理数据 + 图片抓取脚本
│   └── src/
│       ├── modules/       # species / identify 路由模块
│       ├── lib/prisma.ts  # Prisma 客户端（libsql 适配器）
│       └── types/         # Zod 校验
└── frontend/              # React SPA
    ├── public/species/    # 物种图片（本地化，共 85 张）
    └── src/
        ├── pages/         # Index / SpeciesIndex / SpeciesDetail / Identify / About
        ├── components/    # Navbar / 玻璃拟态组件 / SpeciesCard / DistributionMap
        └── lib/i18n.tsx   # 中英双语字典与语言上下文
```

## API 概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/species` | 分页列表，支持 category/group/iucnStatus/invasiveRisk/origin/keyword/featured/sort |
| GET | `/api/species/:slug` | 物种详情 |
| GET | `/api/species/:slug/related` | 同类群物种 |
| GET | `/api/species/meta/stats` | 首页统计与精选 |
| GET | `/api/species/meta/groups` | 筛选元数据 |
| POST | `/api/identify` | AI 识别（JSON：imageBase64 + filename） |
| GET | `/api/identify/status` | 是否已配置真实识别 |
