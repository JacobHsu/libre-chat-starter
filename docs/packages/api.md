# api

`packages/api`:LibreChat 後端的**新版業務邏輯**,用 TypeScript 寫。Express 的路由與控制器留在 `api/`(JavaScript),但越來越多實際的邏輯(Agents 執行、MCP、檔案處理、串流、驗證、快取…)已經搬到這個套件。它是四個函式庫中最大的一個。

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱與版本 | `@librechat/api`,1.7.49,ISC 授權 |
| 誕生 | 2025-06-07,提交 `29ef91b`「User Memories for Conversational Context」(#7760)起以 `packages/api` 出現;同一個提交也是原本 `packages/mcp`(2024-12-17「Initial MCP Support」)的最後一次變動。`package.json` 的描述至今仍寫著「MCP services for LibreChat」 |
| 規模 | 752 個檔案:734 個 TypeScript 檔、5 個原始碼內的說明檔(`README.md` 等)、13 個設定與資料檔 |
| 入口 | 三個:`.`(`src/index.ts`)、`./telemetry`(`src/telemetry.ts`)、`./credentials`(`src/credentials.ts`),都只輸出 CommonJS |
| 相依套件 | 8 個:`@langchain/langgraph-checkpoint`、`@langchain/langgraph-checkpoint-mongodb`、`cluster-key-slot`、`croner`、`express-rate-limit`、`helmet`、`proxy-from-env`、`re2js` |
| peer 相依 | 67 個(`express`、`mongoose`、`@librechat/agents`、`@librechat/data-schemas`、`@modelcontextprotocol/sdk`、各雲端 SDK 等),由使用它的專案(`api/`)提供 |
| 建置 | `npm run build`,用 `tsdown` 輸出到 `dist/`,再把 `openapi/agents.openapi.json` 複製進去。依 `turbo.json`,要先建好 `data-provider` 與 `data-schemas` |
| 打包方式 | 只打包自己的程式碼(相對路徑與 `~/` 別名);所有第三方套件都不打包,由使用者提供 |
| 路徑別名 | `~/` 指向 `src/` |

## 為什麼 MVP-1 整層保留

- 後端入口 `api/server/index.js` 與各路由大量從 `@librechat/api` 取用函式,聊天本身走 Agents 管線(`agents/`、`endpoints/`、`stream/`),不能拆。
- 可以乾淨延後的只有約 22 個檔案(`memory`、`insights`、`projects` 等目錄,只被已刪除的路由使用),約占 3%。省的比例太小,卻要多一處風險,**決定不刪**。逐項核對見 [MVP 設計](../mvp-design.md)的「函式庫」一節。
- 帶進專案的是 752 個檔案;測試檔(`*.spec.ts`、`__tests__/`、整合測試、範例文件檔、`openapi/router.smoke.cjs`)共 663 個不帶,最終階段補回。

## 它和 `data-schemas`、`api/` 的分工

| 位置 | 負責 |
|---|---|
| `packages/data-schemas` | 資料庫:schema、模型、讀寫方法 |
| `packages/api`(這一層) | 業務邏輯:Agents、MCP、檔案、串流、驗證、快取、中介層 |
| `api/` | 薄薄的一層 Express:路由與控制器,呼叫上面兩層 |

依賴方向:`api/` → `packages/api` → `data-schemas` → `data-provider`。

## 目錄與檔案

`src/` 底下 48 個資料夾,依用途分組(檔案數為非測試的 TypeScript 檔):

### 核心:聊天與 Agents

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `agents/` | 174 | 最大的資料夾,占整層四分之一。`run.ts`(3022 行)建立並執行 Agent;子資料夾有 `checkpoints`、`hitl`(人工核准)、`hooks`、`openai`、`responses`(Responses API)、`remote`、`steering`、`triggers` 等 |
| `stream/` | 23 | 串流與生成任務:`GenerationJobManager.ts`(9524 行)管理一次生成的生命週期,`implementations/` 有記憶體與 Redis 兩種實作,聊天的 SSE 串流就從這裡出去 |
| `endpoints/` | 32 | 各模型供應商的初始化與設定:`anthropic`、`bedrock`、`google`、`openai`、`custom`(自訂端點,我們接 Ollama 走這裡:`custom/initialize.ts` 的 `initializeCustom`)、`models.ts`、`pricing.ts`、`tokenConfig.ts` |
| `tools/` | 16 | 工具的定義、探索、分類與註冊 |
| `plugins/` | 12 | Agent 外掛:載入、manifest、hooks、runtime、MCP 與 skills 的整合 |

### 驗證、權限與安全

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `auth/` | 26 | 驗證:`oidc`、`openid`、`invite`、`domain`、`ip`、`googleRefresh`、`exchange` 等 |
| `middleware/` | 25 | Express 中介層:`auth`、`balance`、`checkBalance`、`concurrency`、`contentFilter`、`email`、`error`、`feedback` 等 |
| `acl/` | 5 | 存取控制:`accessControlService`、`principals`、`middleware` |
| `admin/` | 13 | 管理面板用的處理器:稽核紀錄、群組、角色、設定、授權 |
| `protection/` | 15 | 內容保護:偵測器、稽核、訊息變更、來源證明 |
| `security/` | 5 | `headers`、`csp`、`env`、`html`:安全標頭與內容安全政策 |
| `oauth/` | 8 | OAuth 流程:`callback`、`csrf`、`state`、`tokens`、`validation` |
| `crypto/` | 2 | `jwt.ts` 等加解密 |
| `apiKeys/` | 5 | API 金鑰的服務與處理器 |

### 檔案、儲存與資源

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `files/` | 55 | 檔案處理:上傳、`documents`(文件解析)、`encode`、`citations`、`audio`、`code`、`agents`、`mime`、`deletion` |
| `storage/` | 14 | 儲存後端:`s3`、`cloudfront`、`avatar`、`images`、`metadata`、`url` |
| `cdn/` | 6 | CDN:`azure`、`firebase`、`s3`、`cloudfront` |
| `images/` | 3 | 圖片授權與 session |
| `artifacts/`、`prompts/`、`assistants/`、`actions/` | 2、8、2、6 | 各功能的處理與保護邏輯 |

### MCP 與擴充功能

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `mcp/` | 61 | Model Context Protocol:`MCPManager.ts`、`MCPConnectionFactory.ts`、`ConnectionsRepository.ts`、`registry`、`oauth`、`authority`、`catalog`、`tools` |
| `skills/` | 20 | Skills:解析、匯入、管理、狀態、限制、清理 |
| `schedules/` | 14 | 排程聊天:`engine`、`cadence`、`capacity`、`fire`、`erasure`,以及 `README.md`、`FOLLOWUPS.md` |
| `code/` | 14 | 程式碼環境:`bridge`、`capabilities`、`command`、`enrollment`、`environments` |
| `memory/`、`projects/`、`insights/`、`traces/` | 5、2、3、4 | 記憶、專案、洞察、追蹤 |
| `langfuse/` | 14 | Langfuse 可觀測性整合 |
| `web/` | 3 | 網頁搜尋 |

### 共用基礎

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `utils/` | 41 | 工具函式:`axios`、`azure`、`content`、`env`、`errors`、`events`、`files`、`graph`、`tokenizer` 等 |
| `types/` | 21 | 共用型別 |
| `app/` | 14 | 應用程式設定的建置與檢查:`config`、`build`、`checks`、`limits`、`permissions`、`resolve` |
| `cache/` | 12 | 快取:`cacheFactory`、`redisClients`、`keyvFiles`、`keyvMongo` 等 |
| `telemetry/` | 8 | OpenTelemetry:`sdk`、`middleware`、`logs`、`stream` |
| `openapi/` | 8 | OpenAPI 文件產生與路由 |
| `html/` | 4 | 前端首頁相關:`bootstrap`、`devtools`、`footer` |
| `shared-links/` | 6 | 分享連結的服務、存取與保護 |
| `conversations/` | 6 | 對話的匯入、封存、儲存、譜系 |
| `favorites/` | 3 | 常用項目 |
| `cluster/` | 3 | 多節點叢集:`LeaderElection` |
| `flow/` | 2 | 流程管理器(`manager.ts`):用 Keyv 儲存多步驟流程的狀態,含租約(lease) |
| `db/`、`user/`、`modelSpecs/`、`rum/` | 1、2、1、1 | 小型工具 |

另有 4 個直接放在 `src/` 底下的檔案:`index.ts`(整層的匯出,131 行)、`credentials.ts`(`CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET` 四個憑證的處理,暫時值存在 `.env.temp`,對應我們 `.env` 這四個欄位可以留空)、`telemetry.ts`、`imports.ts`。

## 後端怎麼用它

`api/` 裡的檔案用 `require('@librechat/api')` 取得函式,例如 `api/server/index.js` 啟動時取用 `setupGracefulShutdown`、`configureServerTimeouts`、`updateInterfacePermissions`,`api/server/services/initializeMCPs.js` 取用 `registerShutdownTask`、`setMCPToolsChangedHandler`。**這是一條單向的依賴:** `packages/api` 不依賴 `api/`,所以邏輯可以被獨立測試與重用,需要的外部能力(如快取、取得設定)由 `api/` 以參數傳進來。

## 第一個要讀的檔案

想理解「一則訊息送出之後,後端怎麼處理」,從這幾個開始:

1. `src/endpoints/custom/initialize.ts`:自訂端點(我們的 Ollama)怎麼被初始化,拿到 `baseURL` 與模型。
2. `src/agents/run.ts`:Agent 怎麼被建立並執行。
3. `src/stream/GenerationJobManager.ts`:生成任務怎麼管理,串流怎麼送出。
4. `src/index.ts`:整層的匯出清單,等於這個套件的目錄。

## References

- [packages/api(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/packages/api)
- [Project Architecture(官方文件翻譯)](../official/development/architecture.md):建置順序與相依方向
- [MVP 設計](../mvp-design.md):這一層為什麼整層保留
- [歷史分群](../history-cohorts.md):這個套件的檔案誕生日
- [data-schemas](data-schemas.md):下層的資料庫層
- [Ollama 設定(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints/ollama):自訂端點的設定方式
