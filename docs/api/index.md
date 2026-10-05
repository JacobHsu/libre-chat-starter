# api(後端)

`api/`:LibreChat 的 Express 後端,用 JavaScript(CommonJS)寫。它負責啟動伺服器、連接 MongoDB、掛載路由、處理登入驗證,並把聊天請求交給 `packages/api` 的 Agents 管線。**路由與控制器在這裡,越來越多的實際邏輯在 `packages/api`。**

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱 | `@librechat/backend`,v0.8.8-rc4,ISC 授權 |
| 誕生 | 以 `api/` 路徑出現是 2023-03-06,提交 `fca546a`「reorganize dirs for dockerize」(`convos`、`messages` 路由與 `models/index.js` 都在這次出現);登入與使用者系統 2023-05-07(`feat: Auth and User System`,#205);資料庫層 2025-05-30 抽出到 `data-schemas`(#7650) |
| 相依套件 | 103 個:`express`、`mongoose`、`passport` 與各種登入策略(`passport-local`、`passport-jwt`、`passport-google-oauth20`、`passport-ldapauth` 等)、`cors`、`module-alias`、`multer`、`sharp`,以及四個工作區套件(`librechat-data-provider`、`@librechat/data-schemas`、`@librechat/api`、`@librechat/agents`) |
| `scripts` | `start`、`server-dev` 只是提示「請從根目錄執行」。啟動走根目錄的 `npm run backend` |
| 路徑別名 | 原始碼裡的 `~/` 指向 `api/`,由 `module-alias` 套件在 `server/index.js` 開頭註冊(`require('module-alias')({ base: ... })`) |
| 進入點 | `server/index.js`(MVP-1 精簡版 542 行,官方完整版 634 行) |

## MVP-1 帶入的範圍

官方 `api/` 底下有 653 個檔案。MVP-1 帶入 **315 個**:

| 類別 | 檔案數 |
|---|---|
| 要帶入的程式碼(從 `server/index.js` 追蹤 `require` 得到的閉包,含 `manifest.json`) | 308 |
| 啟動時用 `fs` 讀取的信件範本(`server/utils/emails/*.handlebars`) | 4 |
| 設定檔:`package.json`、`jsconfig.json`、`jest.config.js` | 3 |
| **帶入合計** | **315** |
| 不帶:測試檔與測試資料 | 274 |
| 不帶:只被已刪除路由使用的程式碼 | 64 |

其中 313 個與官方 rc4 逐檔相同,**2 個是精簡版**:`server/index.js` 與 `server/routes/index.js`,差異見[精簡清單](mvp-trim.md)。

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `server/services/` | 101 | 業務服務:`AuthService.js`(註冊、登入、密碼重設)、`Config/`(讀取並合併設定,含 `librechat.yaml`)、`Endpoints/`(各端點的初始化,聊天走 `Endpoints/agents/`)、`Files/`(36 個,檔案處理)、`MCP.js`、`initializeMCPs.js`、`PermissionService.js`、`ToolService.js`、`Agents/`、`Schedules/`、`start/`(啟動檢查與遷移) 等 |
| `server/middleware/` | 65 | Express 中介層:`requireJwtAuth`、`checkBan`、`uaParser`、`moderateText`、`buildEndpointOption`、`validateModel`、`abortMiddleware`、`limiters/`(17 個,各路由的流量限制)、`accessResources/`(資源存取檢查)等 |
| `server/routes/` | 40 | 路由:`auth`、`user`、`convos`、`messages`、`endpoints`、`models`、`config`、`presets`、`search`、`keys`、`balance`、`banner`、`roles`、`accessPermissions`、`static`、`agents/`(10)、`files/`(9)等 |
| `server/controllers/` | 28 | 控制器:`AuthController`、`UserController`、`EndpointController`、`ModelController`、`agents/`(10 個,聊天的請求、串流、續跑都在這裡)等 |
| `app/clients/` | 28 | 較舊的 AI 客戶端程式碼:`BaseClient.js`、工具(`tools/`)、提示詞(`prompts/`) |
| `server/utils/` | 18 | 工具:`staticCache`(靜態檔案快取)、`sendEmail`、`fallback`(單頁應用的後備路由)、`import/`(對話匯入)、`emails/`(信件範本) |
| `strategies/` | 15 | passport 登入策略:`localStrategy`、`jwtStrategy`、`openidStrategy`、`googleStrategy`、`ldapStrategy`、`samlStrategy` 等 |
| `cache/` | 5 | `getLogStores`(以 Keyv 管理的各種快取)、`banViolation`、`logViolation` |
| `db/` | 4 | `connect.js`(連 MongoDB)、`index.js`(註冊模型並啟動 Meilisearch 同步)、`indexSync.js`、`utils.js` |
| `config/` | 3 | `credentials.js`(啟動時處理 `CREDS_KEY` 等憑證)、`index.js`、`paths.js`(前端 `dist/` 與圖示的路徑) |
| `models/` | 1 | `index.js`:呼叫 `createMethods` 組出所有資料庫方法(見 [data-schemas](../packages/data-schemas.md)) |
| `server/` 根 | 4 | `index.js`、`cleanup.js`、`socialLogins.js`、`telemetry.js` |

## 啟動流程

`server/index.js` 的 `startServer()` 依序做:

| 順序 | 做什麼 |
|---|---|
| 0 | 載入時先執行 `config/credentials`(處理 `CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET`,留空時產生暫時值),再註冊 `module-alias` |
| 1 | `connectDb()` 連 MongoDB;`indexSync()` 在背景同步 Meilisearch(沒設定就略過) |
| 2 | 設定 `trust proxy`、安全標頭;`seedDatabase` 建立預設角色、分類與系統授權 |
| 3 | `getAppConfig` 讀取並合併設定(包含 `librechat.yaml`),`performStartupChecks` 做啟動檢查,`updateInterfacePermissions` 更新介面權限 |
| 4 | 建立健康檢查 `/health`、`/livez`、`/readyz` |
| 5 | 中介層鏈:`requestContext`、`express.json`(上限 3 MB)、`mongoSanitize`、`cors`、`cookieParser`、`compression` |
| 6 | 提供前端:`/index.html` 與 `client/dist` 的靜態檔案(**後端啟動時需要 `client/dist/index.html`,所以要先建置前端**) |
| 7 | 初始化 passport,註冊 `jwtLogin`、`passportLogin`(有設定才加 LDAP 與社群登入) |
| 8 | 掛載路由(見下表),接著 `/api` 的 404 處理、單頁應用的後備路由、錯誤處理 |
| 9 | `configureGenerationStreams()` 設定生成串流,然後 `app.listen` |
| 10 | 開始監聽後:`initializeMCPs()`、`checkMigrations()`、`initializeAgentTriggerService()`,完成後才把 `serverReady` 設為 `true`。這之前送來的聊天請求會得到 503 `SERVER_NOT_READY` |

### 路由

| 路徑 | 路由檔 | 用途 |
|---|---|---|
| `/api/auth` | `auth.js` | 註冊、登入、登出、重新整理 token |
| `/api/user`、`/api/keys`、`/api/balance` | `user.js`、`keys.js`、`balance.js` | 使用者資料、使用者自備金鑰、餘額 |
| `/api/convos`、`/api/messages`、`/api/search`、`/api/presets` | 同名 | 對話、訊息、搜尋、預設 |
| `/api/endpoints`、`/api/models`、`/api/config` | 同名 | 端點清單、模型清單、前端啟動設定 |
| `/api/files`、`/images/` | `files/`、`static.js` | 檔案上傳與圖片 |
| `/api/roles`、`/api/permissions`、`/api/banner` | `roles.js`、`accessPermissions.js`、`banner.js` | 角色、存取權限、橫幅 |
| `/api/agents` | `agents/` | **聊天**:`/api/agents/chat/:endpoint` 與串流 `/api/agents/chat/stream/:streamId` |

## 聊天請求怎麼走

驗收用的「送出訊息」,在後端是這條路:

```
POST /api/agents/chat/ollama
  → routes/agents/index.js        requireJwtAuth → checkBan → uaParser(認不出是瀏覽器會封鎖,見本機驗證筆記)
  → routes/agents/chat.js         一串檢查中介層(內容審核、存取權限…),最後 buildEndpointOption
  → controllers/agents/request.js ResumableAgentController(3545 行),呼叫 initializeClient 與 addTitle
  → services/Endpoints/agents/initialize.js   建立 Agent;custom 端點(我們的 Ollama)由 packages/api 的 initializeCustom 處理(endpoints/custom/initialize.ts)
  → 回傳 { streamId },生成在背景進行

GET /api/agents/chat/stream/:streamId
  → routes/agents/index.js        以 SSE 送出事件,背後是 packages/api 的 GenerationJobManager
```

`controllers/agents/request.js` 與 `services/Endpoints/agents/initialize.js` 都是很長的檔案(3545 行與 1896 行),**第一次讀不需要全看**,抓住上面這條路就夠了。

## 第一個要讀的檔案

1. `server/index.js`:先只讀 `startServer()`(第 150 行起),對照上面的啟動流程。
2. `server/routes/index.js`:37 行,17 個路由的清單。
3. `server/routes/agents/chat.js`:聊天路由,最後 40 行就是上面的 `controller`。
4. `db/index.js`:9 行,啟動時註冊所有資料模型。
5. `server/routes/endpoints.js`(12 行)與 `server/routes/models.js`(8 行):最短的路由範例,一行 `router.get` 加上驗證中介層與控制器,對應模型選擇器看到的端點與模型清單。
6. `server/routes/convos.js`(864 行)與 `server/routes/messages.js`(767 行):取得對話與訊息的路由,對應驗收的「重新整理後歷史仍在」。

## References

- [api(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/api)
- [Project Architecture(官方文件翻譯)](../official/development/architecture.md):建置順序與相依方向
- [精簡清單](mvp-trim.md):`server/index.js` 與 `server/routes/index.js` 的差異
- [api(packages/api)](../packages/api.md):聊天邏輯所在的函式庫
- [data-schemas](../packages/data-schemas.md):資料庫層
- [本機驗證筆記](../local-testing.md):`uaParser` 封鎖、`.env`、啟動與驗收
