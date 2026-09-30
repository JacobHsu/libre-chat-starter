# 專案架構

LibreChat monorepo 工作區結構與套件邊界概覽。

## Monorepo 結構

LibreChat 以 monorepo 方式組織,工作區之間有明確的邊界:

| 工作區 | 語言 | 端 | 相依 | 用途 |
|---|---|---|---|---|
| `/api` | JS(舊有) | 後端 | `packages/api`、`packages/data-schemas`、`packages/data-provider`、`@librechat/agents` | Express 伺服器,盡量少改動 |
| `/packages/api` | **TypeScript** | 後端 | `packages/data-schemas`、`packages/data-provider` | 新的後端程式碼放這裡(僅限 TS,由 `/api` 使用) |
| `/packages/data-schemas` | TypeScript | 後端 | `packages/data-provider` | 資料庫模型/結構,可在多個後端專案間共用 |
| `/packages/data-provider` | TypeScript | 共用 | — | 共用的 API 型別、端點、data-service,前後端都會用到 |
| `/client` | TypeScript/React | 前端 | `packages/data-provider`、`packages/client` | 前端 SPA |
| `/packages/client` | TypeScript | 前端 | `packages/data-provider` | 前端共用工具 |

### 關鍵原則

- **所有新的後端程式碼都必須是 TypeScript**,放在 `/packages/api`。
- `/api` 的改動要降到最少,只做薄薄的 JS 包裝,呼叫 `/packages/api`。
- 與資料庫相關的共用邏輯放在 `/packages/data-schemas`。
- 前後端共用的 API 邏輯(端點、型別、data-service)放在 `/packages/data-provider`。

### 建置與安裝

| 指令 | 用途 |
|---|---|
| `npm run smart-reinstall` | 安裝相依套件(若 lockfile 有變動)並透過 Turborepo 建置 |
| `npm run reinstall` | 更換 Node/npm 版本後,或相依狀態有疑慮時,進行乾淨安裝 |
| `npm run build` | 透過 Turborepo 建置所有需編譯的程式碼(平行、有快取) |
| `npm run frontend` | 依序建置所有需編譯的程式碼(舊有的備用做法) |
| `npm run build:data-provider` | 修改後重新建置 `packages/data-provider` |
| `npm run backend` | 啟動後端伺服器 |
| `npm run backend:dev` | 啟動後端並監看檔案變動(開發用) |
| `npm run frontend:dev` | 啟動支援 HMR 的前端開發伺服器(port 3090,需先啟動後端) |

- Node.js:`v24.16.0`
- npm:`v11.16.0`
- 資料庫:MongoDB
- 後端執行於 `http://localhost:3080/`;前端開發伺服器執行於 `http://localhost:3090/`

> **注意**
> 完整的程式碼規範與慣例,請見[程式碼規範與慣例](https://www.librechat.ai/docs/development/conventions)。

---

來源:官方文件 `content/docs/development/architecture.mdx`(https://www.librechat.ai/docs/development/architecture),由英文原文翻譯為繁體中文。
