# MVP 設計

功能上的最小可用版本:要留哪些、刪哪些、為什麼,以及如何驗收。

範圍與原則見[專案建立順序](build-order.md):固定使用官方 `v0.8.8-rc4`,精簡只刪不寫,最終換回完整官方版。本文行號皆指 rc4 版本。

## 後端:`api/server/index.js`

### 這個檔案做什麼

642 行,是後端的入口(`npm run backend` 執行的就是它)。依序做這些事:

1. 載入相依套件與設定(第 1–90 行)
2. 連接 MongoDB、初始化各種服務(第 171–270 行)
3. 讀取前端建置後的 `index.html`(第 272–319 行)
4. 註冊中介層與路由(第 330–451 行)
5. 開始監聽 port(第 468 行)
6. 監聽之後再初始化 MCP、排程等(第 490–523 行)
7. 處理未捕捉的錯誤(第 550–631 行)

### 重要發現:啟動時一定要有前端的建置結果

第 272–273 行:

```js
const indexPath = path.join(appConfig.paths.dist, 'index.html');
let indexHTML = fs.readFileSync(indexPath, 'utf8');
```

後端啟動時會讀取 `client/dist/index.html`。這個檔案不存在,`readFileSync` 會丟出錯誤,後端就起不來。所以**後端與前端的建置無法分開驗證**,MVP 必須同時具備前端建置結果。

### 啟動流程的取捨

「待實測」表示靜態閱讀無法確定是否可以刪,要在實作時以啟動與聊天驗證。

| 區塊 | 行號 | 內容 | MVP 決定 | 理由 |
|---|---|---|---|---|
| 載入 | 1–90 | credentials、telemetry、express、passport,以及從 `@librechat/api` 匯入的 47 個名稱 | 保留;匯入清單中與被刪功能對應的名稱一併刪除 | 基礎設施 |
| 檔案設定與訊息過濾引擎 | 92–96 | 設定 regex 引擎 | 保留 | 啟動檢查,沒有獨立功能 |
| 串流服務 | 131–166、466 | `GenerationJobManager`:管理對話串流 | **保留** | 對話回應的串流需要 |
| Redis 等待與子 Agent 路由 | 172–173 | `waitForKeyvRedisClient`、`configureSubagentTaskRouting` | 保留 | 未啟用 Redis 時應直接略過(待實測) |
| 指標 | 174–191 | metrics | 保留 | 未設 `METRICS_SECRET` 只會警告 |
| 資料庫 | 196–202 | `connectDb`、`indexSync` | 保留 | `indexSync` 是搜尋索引同步,搜尋未啟用時應略過(待實測) |
| 程式碼環境協調器 | 199 | `startCodeEnvironmentLifecycleReconciler` | **刪除** | Code Interpreter 與附加工作區相關,不屬於 MVP |
| 安全標頭、租戶警告 | 204–223 | | 保留 | |
| 資料庫初始資料 | 225–232 | `seedDatabase`、`sweepOrphanedPreviews` | `seedDatabase` 保留(建立預設角色);`sweepOrphanedPreviews` 待實測 | 後者與檔案預覽有關 |
| 應用程式設定 | 233–236 | `getAppConfig`、Agent 事件執行環境、檔案儲存 | `getAppConfig` 保留;其餘待實測 | Agents 聊天可能需要 Agent 事件執行環境 |
| 部署外掛與技能 | 237–266 | `initializeDeploymentPlugins`、`initializeDeploymentSkills`、`initializeGitHubSkillSync`、`loadToolApprovalHooks` | **刪除** | Plugins 與 Skills 是後來才有的功能(待實測 `setPluginHookSource` 是否必須) |
| 過期檔案清理 | 256 | `startExpiredFileSweep` | **刪除** | 檔案階段再補回 |
| 啟動檢查與權限 | 267–270 | `performStartupChecks`、`updateInterfacePermissions` | 保留 | |
| 前端 `index.html` | 272–319 | 讀取並處理 | **保留** | MVP 需要前端 |
| 健康檢查 | 321–328 | `/health`、`/livez`、`/readyz` | 保留 | |
| 中介層 | 330–370 | JSON 解析、清理、CORS、cookie、壓縮、靜態檔 | 保留 | |
| 認證 | 376–388 | `jwtLogin`、`passportLogin` | 保留 | 註冊與登入的核心。LDAP 與社群登入是條件式,未設定環境變數就不會啟用,不動 |
| 路由註冊 | 395–451 | 40 多行 `app.use(...)` | 見下表 | |
| 404、SPA 後備、錯誤處理 | 453–464 | | 保留 | |
| 監聽之後的初始化 | 490–523 | `initializeMCPs`、`initializeOAuthReconnectManager`、`checkMigrations`、`initializeAgentTriggerService`、`initializeScheduleEngine` | `checkMigrations` 保留;MCP、OAuth 重新連線、排程**刪除**;Agent 觸發服務待實測 | MCP 是第 9 階段;排程是後期功能 |
| 錯誤處理 | 550–631 | | 保留 | |

排程相關的 `rejectScheduleWritesUntilReady`、`scheduleEngineState` 一併刪除,但 `serverReady = true` 的流程要保留。

### 路由註冊

`routes/index.js` 匯出 45 個路由。MVP 的決定:

**保留(17 個)**

| 路由 | 用途 | 備註 |
|---|---|---|
| `auth` | 註冊、登入、重新整理 token | 核心 |
| `user` | 使用者資料 | 核心 |
| `convos` | 對話 | 核心 |
| `messages` | 訊息 | 核心 |
| `agents` | 對話送出(`/api/agents/chat`) | 聊天走這條路由,不能刪 |
| `endpoints`、`models` | 可用的模型端點與模型清單 | 核心 |
| `config` | 啟動設定 | 核心 |
| `roles` | 角色與權限 | |
| `balance` | 餘額 | 前端會呼叫 |
| `banner` | 公告 | 前端 `banner` 端點,只多 2 個檔案 |
| `accessPermissions` | 存取權限 | 待實測 |
| `search`、`presets` | 搜尋是否啟用、預設清單 | 前端啟動時會呼叫(`/api/search/enable`、`/api/presets`),各只多 1 個檔案;功能本身分別在階段 2、3 才正式啟用 |
| `keys` | 使用者自備金鑰 | 只多 1 個檔案 |
| `staticRoute` | 圖片 | |
| `files` | 檔案 | 前端的 `fileConfig` 會呼叫 `/api/files/config`;這條路由約多 27 個檔案,是否可刪待實測 |

**刪除(28 個)**

| 類別 | 路由 |
|---|---|
| 管理面板(10) | `adminAuth`、`adminConfig`、`adminCodeEnvironments`、`adminLangfuse`、`adminGrants`、`adminGroups`、`adminRoles`、`adminSkills`、`adminUsers`、`adminAuditLog` |
| 後期功能(14) | `oauth`、`insights`、`codeEnvironments`、`actions`、`apiKeys`、`traces`、`projects`、`prompts`、`skills`、`categories`、`assistants`、`share`、`memories`、`schedules` |
| 其他(4) | `tags`(書籤)、`mcp`、`rum`、`openapi` |

`routes/index.js` 本身要同步刪除這些路由的 `require` 與匯出。

### 取捨的依據與風險

- **多數路由只多 1 到 4 個檔案**(見[專案建立順序](build-order.md)的規模分析),因為它們的服務程式碼已經在共用核心裡。所以刪除路由註冊,省下的檔案不多,主要是讓這些功能在 MVP 不可用,各階段再補回。
- **風險 1**:Agents 聊天與啟動流程牽連很深(串流管理、事件執行環境、子 Agent 路由)。標「待實測」的項目,刪了可能讓聊天失敗,要逐項試。
- **風險 2**:靜態分析抓不到動態載入。實際以「啟動、註冊、登入、送出訊息」驗證。
- **風險 3**:前端啟動時會呼叫一些端點。刪除路由後這些請求會得到 404,前端如何處理要實測。

## References

- [api/server/index.js(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/index.js)
- [api/server/routes/index.js(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/index.js)
- [packages/data-provider/src/api-endpoints.ts(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/data-provider/src/api-endpoints.ts)
