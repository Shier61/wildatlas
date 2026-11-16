# WildAtlas · 野生动植物科普图鉴 — 产品需求文档

## 产品概述

WildAtlas 是一个面向公众的野生动植物双语科普平台。用户可以浏览植物与动物图鉴，查看每个物种的保护状态（濒危等级）与生态属性（原生 / 入侵风险）、地理分布范围（地图可视化）、中英双语介绍与图片，并可通过上传照片使用 AI 识别物种。

- **目标用户**：自然爱好者、学生、教师、户外徒步者、科研入门者
- **核心价值**：权威状态标注（IUCN 红色名录 / 中国外来入侵物种名单）+ 双语科普 + 分布地图 + AI 识别

## 核心功能

### F1 物种索引（图鉴浏览）

- 侧边栏筛选：类群（植物 / 动物）、细分类群（乔木、草本、鸟类、兽类、爬行、两栖、鱼类、昆虫等）、濒危等级、生态属性（原生 / 入侵）
- 关键词搜索（中文名 / 英文名 / 学名）
- 卡片式网格布局，展示图片、名称（双语）、状态徽章
- 排序：名称 / 濒危等级 / 入侵风险

### F2 物种详情页

- **植物**：显示「入侵风险」等级（高 / 中 / 高关注）或「原生 + 濒危程度」
- **动物**：显示濒危程度（IUCN 等级：EXTINCT / CR / EN / VU / NT / LC 等 + 中国保护级别）
- 中英双语介绍，语言可一键切换
- **分布范围地图**：中国省级行政区高亮 + 全球分布文字说明
- 物种图片、分类学信息（界门纲目科属）、栖息地、威胁因素
- 相似 / 同类群物种推荐

### F3 AI 识别

- 上传或拖拽一张照片
- 后端调用视觉大模型（OpenAI 兼容接口，API Key 由用户在 `.env` 中配置）
- 返回候选物种（中文名 + 学名 + 置信度），点击跳转详情页
- 未配置 Key 时进入演示模式（返回示例结果并明确提示配置方法）

### F4 导航与信息架构

- 顶部导航栏：Logo、首页、植物图鉴、动物图鉴、AI 识别、关于；中/EN 语言切换
- 侧边栏（索引页与详情页）：筛选器 + 状态图例
- 面包屑导航

## 页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 自然背景 Hero、玻璃拟态数据面板、物种精选、功能入口 |
| `/species` | 物种索引 | 侧边栏筛选 + 卡片网格 + 分页 |
| `/species/:slug` | 物种详情 | 状态徽章、双语介绍、分布地图、相似物种 |
| `/identify` | AI 识别 | 上传照片、识别结果 |
| `/about` | 关于 | 数据来源说明、等级图例、技术栈 |

## 数据模型

### Species（物种表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int PK | 主键 |
| slug | String unique | URL 标识 |
| category | String | `plant` / `animal` |
| group | String | 类群（tree/herb/bird/mammal/…） |
| nameZh / nameEn / scientificName | String | 中文名 / 英文名 / 学名 |
| family | String | 科 |
| native | Boolean | 是否原生（植物用） |
| invasiveRisk | String? | 入侵风险：high/medium/watch（植物用） |
| iucnStatus | String | IUCN 等级：LC/NT/VU/EN/CR/EX/NA |
| chinaProtection | String? | 中国重点保护级别（一级/二级） |
| distribution | String (JSON) | 中国省份列表 |
| distributionEn | String | 全球分布说明 |
| habitatZh / habitatEn | String | 栖息地（双语） |
| descriptionZh / descriptionEn | Text | 介绍（双语） |
| threatZh / threatEn | Text? | 威胁因素（双语） |
| imageUrl | String | 物种图片 |
| featured | Boolean | 是否首页精选 |

### IdentifyRecord（识别记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Int PK | 主键 |
| imageName | String | 上传文件名 |
| resultJson | Text | 识别结果（候选列表） |
| createdAt | DateTime | 时间 |

## API 端点（JSON 协议，统一前缀 `/api`）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/species` | 分页列表，支持 category/group/status/invasive/keyword 筛选 |
| GET | `/api/species/:slug` | 详情 |
| GET | `/api/species/:slug/related` | 相似物种 |
| GET | `/api/stats` | 统计（物种数、濒危数、入侵数） |
| POST | `/api/identify` | AI 识别（multipart 或 base64 JSON） |
| GET | `/api/meta/groups` | 筛选项元数据 |

## 视觉设计

- **风格**：Liquid Glass 玻璃拟态 + 编辑部高级感（Playfair Display 衬线标题 + Inter 正文，中文 Noto Serif SC）
- **色彩**：深林绿主色、暖金强调色、米白背景；自然摄影背景图 + 半透明玻璃卡片（`backdrop-filter: blur` + 高不透明度底色保证文字清晰）
- **动效**：framer-motion 页面过渡（fade/slide-up）、卡片入场 Stagger、数字 CountUp

## 技术栈

- 前端：React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui + framer-motion + ECharts（分布地图）
- 后端：Express + TypeScript + Zod 校验 + Prisma ORM
- 数据库：SQLite（开发即开即用，可平移至 PostgreSQL/MySQL）
- AI：OpenAI 兼容视觉模型（Key 用户自配）

## 数据来源

- IUCN Red List 等级（物种存续状态）
- 《中国外来入侵物种名单》（植物入侵风险标注）
- 《国家重点保护野生动物名录》保护级别
- 物种图片：Wikimedia Commons（开放许可）
