# MVP 設計

功能上的最小可用版本:要留哪些、刪哪些、為什麼,以及如何驗收。

## 設計原則

- **固定版本**:官方 `v0.8.8-rc4`,與本機對照實例相同。行號與數字皆指這個版本。
- **階段順序依歷史**:每個檔案都有誕生日,功能依誕生日排先後,見[歷史分群](history-cohorts.md)。
- **MVP 切多深依功能**:哪些功能放進 MVP、哪些延後到後面的階段,以功能為單位決定;程式碼的引用關係只用來估算「延後一個功能要切斷幾處引用」。
- **官方程式碼能不改就不改**:只能刪除程式碼,不得新增自己寫的邏輯。精簡過的檔案,之後換回完整的官方版,最終必須與官方完全一致。
- **模型**:本機 Ollama,透過 `librechat.yaml` 的自訂端點接上,不需要雲端金鑰。

## MVP 的定義與驗收

MVP 是**功能上的最小**:畫面上只有登入、對話、對話歷史。驗收標準:

1. 註冊新帳號
2. 登入
3. 開新對話
4. 選擇本機 Ollama 的模型,送出訊息
5. 回覆以串流顯示
6. 重新整理頁面後,對話歷史仍在

## 功能與誕生時期

下表把 rc4 的非測試程式碼檔,依路徑名稱歸到功能,再看各功能檔案的誕生日。每個功能是「階段」的單位,**順序依最早誕生日**,「MVP-1 處理」欄說明這個功能在第一版 MVP 怎麼處理。

| 功能 | 檔案數 | 最早誕生 | 中位數誕生 | MVP-1 處理 |
|---|---|---|---|---|
| 對話與訊息 | 319 | 2023-02-06 | 2025-12-11 | **保留**(核心) |
| 提示詞 | 92 | 2023-02-12 | 2025-08-11 | 延後 |
| 登入與驗證 | 104 | 2023-03-14 | 2025-05-30 | **保留**(核心) |
| 搜尋(Meilisearch) | 38 | 2023-03-16 | 2025-05-23 | 路由保留,功能延後 |
| 外掛 | 34 | 2023-03-22 | 2025-06-19 | 延後 |
| 預設 | 14 | 2023-04-02 | 2023-11-16 | 路由保留,功能延後 |
| 檔案與圖片 | 237 | 2023-04-04 | 2025-03-19 | 路由與函式庫保留,側邊檔案面板延後 |
| OAuth 與 OpenID | 56 | 2023-05-07 | 2026-06-02 | 程式碼保留,OAuth 路由刪除 |
| 自訂端點與設定檔 | 103 | 2023-08-04 | 2025-03-25 | **提前使用**(接 Ollama) |
| Redis 與快取 | 32 | 2023-09-13 | 2025-10-31 | 快取保留,Redis 不啟用 |
| 分享 | 59 | 2024-05-17 | 2025-07-25 | 後端延後,前端保留(含訊息頭像 `MessageIcon`) |
| 語音 | 57 | 2024-05-22 | 2024-05-22 | 保留(未切) |
| 管理面板 | 40 | 2024-06-20 | 2026-03-30 | 延後 |
| Trace 與可觀測 | 79 | 2024-06-20 | 2026-08-18 | 前端 Trace 延後,Langfuse 程式碼保留 |
| 書籤與標籤 | 24 | 2024-07-29 | 2024-07-29 | 延後 |
| Artifacts 與 Mermaid | 50 | 2024-08-27 | 2025-12-03 | 程式碼保留 |
| Agents | 381 | 2024-08-31 | 2026-07-05 | **保留**(聊天走 agents 管線) |
| 程式碼環境 | 49 | 2024-08-31 | 2026-09-01 | 程式碼保留,啟動項目刪除 |
| MCP | 143 | 2024-12-04 | 2025-12-28 | 程式碼保留,介面與初始化延後 |
| 記憶 | 38 | 2025-06-07 | 2025-12-19 | 延後 |
| Skills | 105 | 2026-04-11 | 2026-04-13 | 後端程式碼保留,前端與啟動同步延後 |
| 專案 | 24 | 2026-06-03 | 2026-06-03 | 延後 |
| 排程與觸發 | 80 | 2026-06-10 | 2026-08-20 | 延後 |

### 怎麼讀這張表

- **「最早誕生」可能受雜訊影響**:歸類是依路徑名稱比對,同一個檔案可能符合多個功能。例如提示詞(2023-02-12)、管理面板與 Trace(2024-06-20)的最早日期,明顯比它們的中位數早很多,多半是名稱剛好相符的零星檔案。**中位數與分布較能反映功能主體的誕生時期。**
- **功能的誕生時期不等於檔案的誕生時期**:例如 Agents 功能約 2024-08 出現,但 381 個檔案的中位數是 2026-07,因為管線被大幅重寫。
- 與[專案建立順序](build-order.md)用 release 核對的日期大致吻合:搜尋 2023-03-16、預設 2023-04、Redis 2023-09 到 10、MCP 2024-12。自訂端點的檔案最早日期(2023-08)比 release(2024-01-19)早,因為路徑名稱比對把早期的端點目錄也算進來。
- 各功能的歸屬在**該階段開始前,會逐一核對檔案清單**,這張表只用來排順序與估規模。

## 兩輪切法:MVP-1 與 MVP-2

**MVP-1(已量測,是第一個要做的目標)**:依功能延後零成本與低成本的功能,糾纏在聊天核心的功能(MCP、Skills、程式碼環境、OAuth、Langfuse)保留程式碼但不開啟。規模約 2585 / 2930 個程式碼檔(約 88%):後端 307(實測)、前端 1033(預估)、函式庫 1245(整個保留)。細節見下面三節。

**MVP-2(待定,尚未納入做法)**:若要更小,必須切共用基礎的「中樞」(許多檔案只透過它才被引用的檔案)。用貪心演算法試算:前端約 40 處移除可從 1329 降到約 700,後端約 30 處移除可從 274 降到約 94。但**演算法不懂什麼是核心**,它會把對話列表、模型選擇器、資料庫連線、認證策略這類核心也砍掉,所以這些數字不可信,只能說方向可行。要走這條路,必須先有人工確認過的核心清單。推估整體約可降到 60% 到 70%,屬於推估,不是量測。

## MVP-1 的細節

### 後端:`api/server/index.js`

#### 這個檔案做什麼

642 行,是後端的入口(`npm run backend` 執行的就是它)。依序做這些事:

1. 載入相依套件與設定(第 1–90 行)
2. 連接 MongoDB、初始化各種服務(第 171–270 行)
3. 讀取前端建置後的 `index.html`(第 272–319 行)
4. 註冊中介層與路由(第 330–451 行)
5. 開始監聽 port(第 468 行)
6. 監聽之後再初始化 MCP、排程等(第 490–523 行)
7. 處理未捕捉的錯誤(第 550–631 行)

#### 重要發現:啟動時一定要有前端的建置結果

第 272–273 行:

```js
const indexPath = path.join(appConfig.paths.dist, 'index.html');
let indexHTML = fs.readFileSync(indexPath, 'utf8');
```

後端啟動時會讀取 `client/dist/index.html`。這個檔案不存在,`readFileSync` 會丟出錯誤,後端就起不來。所以**後端與前端的建置無法分開驗證**,MVP 必須同時具備前端建置結果。

#### 啟動流程的取捨

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
| 部署外掛與技能 | 237–266 | `initializeDeploymentPlugins`、`initializeDeploymentSkills`、`initializeGitHubSkillSync`、`loadToolApprovalHooks` | **刪除** | Plugins 與 Skills 是後來才有的功能(實測:`setPluginHookSource` 也可以刪,聊天正常) |
| 過期檔案清理 | 256 | `startExpiredFileSweep` | **刪除** | 檔案階段再補回 |
| 啟動檢查與權限 | 267–270 | `performStartupChecks`、`updateInterfacePermissions` | 保留 | |
| 前端 `index.html` | 272–319 | 讀取並處理 | **保留** | MVP 需要前端 |
| 健康檢查 | 321–328 | `/health`、`/livez`、`/readyz` | 保留 | |
| 中介層 | 330–370 | JSON 解析、清理、CORS、cookie、壓縮、靜態檔 | 保留 | |
| 認證 | 376–388 | `jwtLogin`、`passportLogin` | 保留 | 註冊與登入的核心。LDAP 與社群登入是條件式,未設定環境變數就不會啟用,不動 |
| 路由註冊 | 395–451 | 40 多行 `app.use(...)` | 見下表 | |
| 404、SPA 後備、錯誤處理 | 453–464 | | 保留 | |
| 監聽之後的初始化 | 490–523 | `initializeMCPs`、`initializeOAuthReconnectManager`、`checkMigrations`、`initializeAgentTriggerService`、`initializeScheduleEngine` | `checkMigrations` 保留;**`initializeMCPs` 不能刪**(實測:沒有它 Agent 一執行就報 `MCPManager has not been initialized`);OAuth 重新連線、排程已刪除,實測通過;Agent 觸發服務保留 | MCP 是第 9 階段;排程是後期功能 |
| 錯誤處理 | 550–631 | | 保留 | |

排程相關的 `rejectScheduleWritesUntilReady`、`scheduleEngineState` 一併刪除,但 `serverReady = true` 的流程要保留。

#### 路由註冊

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

#### 取捨的依據與風險

- **多數路由只多 1 到 4 個檔案**(見[專案建立順序](build-order.md)的規模分析),因為它們的服務程式碼已經在共用核心裡。所以刪除路由註冊,省下的檔案不多,主要是讓這些功能在 MVP 不可用,各階段再補回。
- **風險 1**:Agents 聊天與啟動流程牽連很深(串流管理、事件執行環境、子 Agent 路由)。標「待實測」的項目,刪了可能讓聊天失敗,要逐項試。
- **風險 2**:靜態分析抓不到動態載入。實際以「啟動、註冊、登入、送出訊息」驗證。
- **風險 3**:前端啟動時會呼叫一些端點。刪除路由後這些請求會得到 404,前端如何處理要實測。

### 前端:`client/`

#### 入口與建置

- 入口是 `client/index.html` 載入的 `src/main.jsx`。別名 `~` 指向 `src/`。
- 用 Vite 建置,產出 `client/dist`,也就是後端啟動時要讀取的那份 `index.html`。
- 建置前,`packages/data-provider`、`data-schemas`、`api`、`client` 這幾個函式庫要先建好(官方 `npm run frontend` 的順序)。

#### 前端高度耦合,不能只刪路由

靜態分析(程式碼檔,排除測試):

| 項目 | 檔案數 |
|---|---|
| `client/src` 程式碼檔 | 1421 |
| 從 `main.jsx` 可達 | 1329(94%) |
| 單獨「對話頁」`ChatRoute` 就可達 | 928 |

對話頁本身就把側邊欄、提示詞、技能、檔案、導覽列等元件全部 import 進來,所以不能像後端那樣只刪路由註冊,要在元件裡刪除對功能目錄的 import 與使用處。

#### 不能砍的三個目錄

最初的估算把下面三個目錄也列入砍除,逐項檢查引用後發現它們是聊天核心用到的,必須保留:

| 目錄 | 被誰引用 | 為什麼不能砍 |
|---|---|---|
| `components/Chat/Subagents` | `Presentation`、`Surface`、`MessagesView`、`MultiMessage`、`Row`、`useStepHandler` 等 9 處 | 內含 `ChatSurfaceProvider`、`useChatSurface`,是聊天畫面的共用基礎 |
| `components/Share` | 4 個訊息元件 | 內含 `MessageIcon`(訊息頭像圖示) |
| `components/SidePanel/Parameters` | `Endpoints/Settings` 的 4 個端點設定元件 | 提供 `componentMapping` |

#### 砍除範圍:14 個功能目錄

| 目錄 | 程式碼檔 | 功能 | 補回時機 |
|---|---|---|---|
| `SidePanel/Agents` | 82 | Agent 建立面板 | 階段 8 Agents |
| `SidePanel/Builder` | 23 | Agent 建構面板 | 階段 8 Agents |
| `SidePanel/MCPBuilder` | 18 | MCP 伺服器面板 | 階段 9 MCP |
| `SidePanel/Memories` | 12 | 記憶 | 不在目前階段表 |
| `SidePanel/Schedules` | 11 | 排程 | 不在目前階段表 |
| `SidePanel/Bookmarks` | 7 | 書籤 | 不在目前階段表 |
| `SidePanel/Files` | 4 | 檔案面板 | 階段 5 圖片與檔案上傳 |
| `Prompts` | 49 | 提示詞庫 | 不在目前階段表 |
| `Skills` | 38 | Skills | 不在目前階段表 |
| `Chat/Trace` | 17 | Trace Viewer(檢視對話步驟與成本) | 不在目前階段表 |
| `Plugins` | 4 | 外掛 | 不在目前階段表 |
| `Agents` | 11 | Agent 市集 | 階段 8 Agents |
| `Projects` | 9 | 專案 | 不在目前階段表 |
| `Insights` | 4 | 洞察 | 不在目前階段表 |

砍除後,程式碼檔從 1329 降到約 **1033**(約 78%)。「不在目前階段表」的功能,最終換回完整官方版時會一併回來,階段順序另議。

#### 要動手的檔案:13 個、29 條 import

**接線型(5 個檔案、19 條):** 只是把功能接進畫面,刪除 import 與對應的使用區塊即可。

| 檔案 | 刪除的 import | 做什麼的 |
|---|---|---|
| `hooks/Nav/useSideNavLinks.ts` | 9 條:MCPBuilder、Agents、Bookmarks、Builder、Schedules、Memories、Files 面板,以及 PromptsAccordion、SkillsAccordion | 組出側邊欄的面板清單 |
| `routes/index.tsx` | 7 條:Agents 市集(2)、Prompts、Skills、Insights、Projects(2)的動態載入 | 前端路由表 |
| `components/Chat/ChatView.tsx` | 1 條:`TraceSurface` | 對話頁 |
| `components/Chat/Header.tsx` | 1 條:`TraceButton`、`useTraceControl` | 對話頁標題列 |
| `components/Chat/Menus/HeaderMenu.tsx` | 1 條:型別 `TraceControl` | 標題列選單 |

**牽連型(8 個檔案、10 條):** 被引用的是目錄裡的個別小元件或函式,不一定能整個目錄砍。實作時逐項決定:保留那一個檔案,或刪除使用處。

| 檔案 | 引用 | 來自 |
|---|---|---|
| `Providers/PromptGroupsContext.tsx`、`hooks/Prompts/useCategories.tsx` | `CategoryIcon` | `Prompts` |
| `components/Chat/Input/PromptsCommand.tsx` | `VariableDialog` | `Prompts` |
| `components/Chat/Input/ToolDialogs.tsx` | `SearchApiKeyDialog` | `SidePanel/Agents` |
| `hooks/Files/useSharePointPicker.ts` | 型別 `SPPickerConfig` | `SidePanel/Agents` |
| `hooks/MCP/useRemoveMCPTool.ts` | `matchesMcpServer` | `SidePanel/Agents` |
| `components/Chat/Landing.tsx` | `AgentContact` | `Agents` |
| `components/Conversations/ProjectsSection.tsx` | 3 個專案對話框 | `Projects` |

#### 隱藏功能的另一個辦法:`librechat.yaml` 的 `interface`

官方設定檔提供 `interface` 開關,可以在不改程式碼的情況下隱藏畫面功能,例如 `presets`、`prompts`、`bookmarks`、`memories`、`agents`、`skills`、`schedules`、`marketplace`、`mcpServers`、`parameters`。

MVP 兩者並用:元件裡的接線刪掉,是為了讓這些功能的程式碼檔案不必一開始就存在;`interface` 開關則是補回功能之後,控制畫面是否顯示。

#### 風險

- 刪除後 JSX 與陣列的語法要保持正確,每個檔案修改後用 Vite 建置檢查。
- 靜態分析抓不到動態依賴,最終以建置、啟動與 MVP 驗收為準。
- 牽連型的 8 個檔案可能需要保留部分目錄內的個別檔案,實際保留的檔案數會比上表的砍除量略少。
- 對應被刪除功能的 hooks 會跟著變成不可達,不用逐一處理。

### 函式庫:`packages/*`

四個函式庫,先編譯成 `dist/`,再被 `api/` 與 `client/` 使用:

| 函式庫 | 套件名稱 | 用途 | 非測試 TS 檔 |
|---|---|---|---|
| `packages/data-provider` | `librechat-data-provider` | 前後端共用的 API 型別、端點、data-service | 65 |
| `packages/data-schemas` | `@librechat/data-schemas` | 資料庫模型與方法 | 243 |
| `packages/api` | `@librechat/api` | 新的後端程式碼(TypeScript) | 732 |
| `packages/client` | `@librechat/client` | 共用的前端元件 | 205 |

相依方向與建置順序見[專案架構](official/development/architecture.md)。

**結論:MVP-1 整個保留四個函式庫。** 逐項核對之後,可以乾淨延後的只有約 22 個檔案(占 1%),決定不刪。

#### 先前的估計為什麼作廢

最初的靜態分析是用名稱比對,估計函式庫可以延後約 180 個檔案(`packages/api` 117 個、`data-schemas` 63 個)。實作時改用更嚴格的「方法名稱與匯出名稱雙重核對」,結果是:

- 靠名稱比對會**低估核心用到多少**。`createPayload`(`data-provider`)就是誤判:分析說可刪,實際前端的 `useSSE.ts` 與 `useResumableSSE.ts` 在用,因為它是 `export { default as createPayload } from` 這種改名匯出。
- 每次改用更嚴格的檢查,可刪的數量就更少。

#### `data-schemas`:資料表實體的方法,都有核心檔案在用

核對的是每個延後候選實體的**方法**,被哪些其他檔案使用(排除它自己的檔案與註冊檔)。

| 實體 | 方法數 | 被使用的方法數 | 使用它們的檔案數 | 核心使用者的例子 |
|---|---|---|---|---|
| `schedule` | 50 | 48 | 11 | `UserController.js`、`routes/agents/index.js` |
| `triggerDelivery` | 47 | 47 | 18 | `controllers/agents/request.js`、`resume.js`、`UserController.js` |
| `queuedTurn` | 26 | 21 | 5 | `controllers/agents/queuedTurns.js`、`packages/api` 的 `queuedTurnHttp.ts` |
| `systemGrant` | 11 | 11 | 19 | `middleware/roles/capabilities.js`、`validateImageRequest.js` |
| `assistant` | 6 | 5 | 13 | `controllers/assistants/`、`UserController.js` |
| `memory` | 9 | 9 | 10 | `controllers/agents/client.js`、`openai.js` |
| `auditLog` | 6 | 5 | 10 | `PermissionsController.js`、`routes/admin/` |
| `prompt` | 20 | 14 | 9 | `UserController.js`、`middleware/accessResources/` |
| `agentApiKey` | 6 | 6 | 6 | `UserController.js`、`routes/agents/middleware.js` |
| `chatProject` | 7 | 6 | 5 | `routes/projects.js`、`services/Schedules/` |
| `conversationTag` | 7 | 7 | 3 | `UserController.js`、`utils/import/importBatchBuilder.js` |
| `share`、`favorite`、`agentCategory`、`categories`、`insights` | | | 1 到 2 | 各自的路由 |

`UserController.js`(刪除使用者時連帶清除排程、提示詞、API 金鑰、Assistants、標籤)、`agents/request.js` 與 `resume.js`(Agent 請求路徑)、`capabilities.js`(角色權限)都是核心檔案。要延後這些實體,得在核心檔案裡刪掉大量程式碼,卻只省每個實體約 4 個檔案。**`data-schemas` 整個保留。**

#### `packages/api`:功能目錄

核對每個候選目錄匯出的名稱,有沒有被目錄之外的檔案使用。扣掉 MVP-1 本來就要刪的路由檔(它們的使用不算阻礙)之後:

| 目錄 | 檔案 | 核對結果 |
|---|---|---|
| `memory` | 5 | 只有 `routes/memories.js` 在用,可刪 |
| `insights` | 3 | 只有 `routes/insights.js` 在用,可刪 |
| `projects` | 2 | 只有 `routes/projects.js` 在用,可刪 |
| `plugins` | 12 | 被 `server/index.js` 與 `initializeMCPs.js` 使用,前者的使用處已刪,另 5 個檔案未核對 |
| `security`、`html`、`telemetry` | 17 | `server/index.js` 用它們處理安全標頭與前端首頁,核心 |
| `schedules` | 14 | `agents/request.js`、`resume.js` 使用,核心 |
| `shared-links`、`apiKeys`、`actions`、`web`、`admin`、`prompts` | | 都有核心檔案在用 |

可能可刪的合計約 22 個檔案,占整體約 1%。省 1% 卻要多一處風險,**決定先不刪**。

### MVP-1 的整體規模

非測試的程式碼檔。後端是實測值,前端是預估(尚未精簡),函式庫整個保留:

| 層 | 完整 | MVP-1 | 備註 |
|---|---|---|---|
| 後端 `api/` | 356 | **307**(實測) | 只改 2 個檔案:`server/index.js`、`server/routes/index.js` |
| 前端 `client/` | 1329 | 1033(預估) | 砍 14 個功能目錄,尚未精簡 |
| 函式庫 `packages/*` | 1245 | 1245 | 整個保留 |
| **合計** | **約 2930** | **約 2585(88%)** | |

**以檔案數而言,MVP-1 只比完整版小約一成。** 它是功能與畫面上的最小,不是檔案數上的最小。LibreChat 的核心很大,功能疊在核心上,而且核心檔案大量使用各功能的程式碼,延後的成本高於收益。更小的做法是 MVP-2(切共用基礎的中樞),風險高,等 MVP-1 做完、跑得起來之後,再以實測評估值不值得。

## 驗證

### 每個階段都要做的檢查

1. **與官方快照比對**:列出我們與固定版本官方快照的差異檔案。精簡階段的差異就是這一階段的精簡清單;**最終階段差異必須為零**。
2. **建置**:依序建置函式庫(`data-provider` → `data-schemas` → `packages/api` → `packages/client`),再建置前端(Vite),確認成功。
3. **啟動**:後端使用 port 3090,連上學習專用的 MongoDB(port 27018)。不使用官方的 `npm run reinstall`,改為手動執行安裝與建置步驟。
4. **走一遍驗收流程**(見上方「MVP 的定義與驗收」)。
5. **對照本機的 `LibreChat-sep`**:行為與畫面是否一致。它是官方 rc4 加上使用者自己的客製,可當對照,但不是完全相同。
6. **打 git 標籤**(例如 `stage-mvp`),方便回頭看與退回。

### 實測結果

靜態分析無法確定能不能刪的項目,已在暫存區逐項實測(完整記錄見[本機驗證筆記](local-testing.md)):

| 項目 | 結果 |
|---|---|
| 刪除 28 個路由與 6 個啟動項目 | 後端 API 驗收 11/11 通過,真實瀏覽器六項驗收通過 |
| `initializeMCPs` | **不能刪**。沒有它,Agent 一執行就失敗,日誌是 `MCPManager has not been initialized` |
| `setPluginHookSource` | 可以刪 |
| 前端對被刪路由的 404 | 前端啟動的 32 個請求中有 6 個 404(`projects`、`skills`、`admin/roles`、`tags`、`prompts/groups`、`mcp/servers`),**沒有任何 JS 錯誤**。前端精簡後這 6 個請求應該消失 |
| 函式庫入口的 `createPayload` | 靜態分析判定可刪,**實際是誤判**,前端在用 |

仍待實測的項目:

- 前端:牽連型 8 個檔案是否要保留目錄內的個別檔案。
- 後端啟動時一定要讀取前端的 `client/dist/index.html`,所以後端與前端必須一起建置才能驗證。

### 失敗時

先看錯誤訊息,找出缺少的檔案或被刪掉的引用,補回該檔案或保留該段程式碼,再重新驗證。補回的原因與位置要記進該階段的說明。

## References

- [api/server/index.js(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/index.js)
- [api/server/routes/index.js(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/index.js)
- [packages/data-provider/src/api-endpoints.ts(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/data-provider/src/api-endpoints.ts)
- [client/src/main.jsx(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/client/src/main.jsx)
- [packages/api/package.json(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/package.json)
- [packages/api/src/index.ts(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/index.ts)
- [packages/api/package.json(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/package.json)
- [packages/api/src/index.ts(rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/index.ts)
- [歷史分群](history-cohorts.md):各檔案的誕生日
- [librechat.yaml 的 interface 物件(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface)
