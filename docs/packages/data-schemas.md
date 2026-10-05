# data-schemas

`packages/data-schemas`:LibreChat 的**資料庫層**。用 Mongoose 定義 MongoDB 的資料結構(schema)、建立資料模型(model)、並提供所有讀寫資料庫的方法(methods)。後端 `api/` 與 `packages/api` 要存取資料,都經過它。

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱與版本 | `@librechat/data-schemas`,0.0.71,MIT 授權 |
| 誕生 | 2025-03-07,提交 `b51cd21`「Move DB Models to `@librechat/data-schemas`」(#6210)。資料模型原本以 JavaScript 寫在 `api/models/schema/`(2023 年起),這次搬進獨立套件並改寫成 TypeScript |
| 入口 | 兩個:`.`(`src/index.ts`)與 `./capabilities`(`src/admin/capabilities.ts`,管理權限清單,單獨匯出) |
| 相依套件 | 8 個 Markdown 解析套件(`mdast-util-*`、`micromark-*`),打包進輸出 |
| peer 相依 | `mongoose`、`librechat-data-provider`、`jsonwebtoken`、`klona`、`lodash`、`meilisearch`、`nanoid`、`winston`、`winston-daily-rotate-file`,由使用它的專案提供 |
| 建置 | `npm run build`,用 `tsdown` 輸出 CJS 與 ESM 到 `dist/`。依 `turbo.json`,要先建好 `data-provider` |
| 路徑別名 | 原始碼裡的 `~/` 指向 `src/`,例如 `import logger from '~/config/winston'` |
| `dotenv` | `crypto/index.ts` 第一行是 `import 'dotenv/config'`(載入 `.env`),`tsdown.config.mjs` 也設定把 `dotenv` 打包進輸出。但這個套件的 `package.json` 沒有宣告它,宣告在 `api/package.json`。所以建置時 `dotenv` 要靠工作區安裝後根目錄的 `node_modules/` 提供:沒有任何套件帶進 `dotenv` 時(例如只有 `data-provider` 與 `data-schemas`),`tsdown` 會警告 `UNRESOLVED_IMPORT`,輸出裡留下一行 `require("dotenv/config")`(`dist/index.cjs` 比有 `dotenv` 時小約 34 KB)。`packages/api` 的相依 `@librechat/agents` 帶有 `dotenv`,有它之後重新建置就會打包進去 |

## 為什麼 MVP-1 整層保留

- `createModels` 一次建立 **47 個**資料模型,`createMethods` 一次組出所有方法。這兩個函式是整層的出口。
- 想延後的功能(排程、記憶、提示詞、API 金鑰、標籤等),它們的資料庫方法都被核心檔案使用。例如刪除使用者的流程(`UserController.js`)會連帶清除排程、提示詞、API 金鑰、Assistants、標籤;Agent 請求(`agents/request.js`、`resume.js`)用到排程與觸發相關的方法。要延後就得在這些核心檔案裡刪大量程式碼,卻只省每個資料模型約 4 個檔案。
- 逐項核對結果見 [MVP 設計](../mvp-design.md)的「函式庫」一節。

所以整層帶進專案:243 個程式碼檔,加上 11 個設定與說明檔。測試檔(`*.spec.ts`、`__tests__/`、`test-helpers.ts`、`misc/`)共 118 個不帶,最終階段補回。

## 三層結構:schema → models → methods

```
schema/   定義「一筆資料長什麼樣」(欄位、型別、索引)
   ↓
models/   把 schema 變成可用的資料模型(掛上外掛),給 mongoose 註冊
   ↓
methods/  用資料模型寫成「存對話、查訊息、刪使用者…」的函式
```

以「對話」為例,三個檔案正好對應:

| 層 | 檔案 | 內容 |
|---|---|---|
| schema | `schema/convo.ts`(434 行) | 欄位:`conversationId`、`title`(預設 `New Chat`)、`user`、`messages`(指向 `Message` 的參照)等 |
| model | `models/convo.ts`(25 行) | 套用多租戶隔離外掛;有設定 Meilisearch 時再套用搜尋外掛;註冊成 `Conversation` |
| methods | `methods/conversation.ts`(3532 行) | `saveConvo`、`getConvo`、`getConvosByCursor`、`searchConversation`、`setConvoPinned` 等 |

## 目錄與檔案

共 243 個程式碼檔,依資料夾:

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `schema/` | 52 | 各集合的 Mongoose schema:`user`、`convo`、`message`、`session`、`token`、`file`、`preset`、`agent`、`role`、`balance`…,加上共用片段 `defaults.ts`、`fading.ts` |
| `models/` | 48 | 各集合的模型工廠(`createXxxModel`)與 `index.ts` 的 `createModels`;`plugins/` 內有 `tenantIsolation.ts`(多租戶隔離,227 行)與 `mongoMeili.ts`(同步到 Meilisearch 搜尋,1308 行) |
| `methods/` | 47 | 資料庫方法,每個檔案一組,由 `index.ts` 的 `createMethods` 組合(594 行) |
| `types/` | 45 | TypeScript 型別:各集合的文件型別(`IConversation`、`IUser`…)與參數型別 |
| `app/` | 14 | 把設定檔(`librechat.yaml`)轉成應用程式設定:`service.ts` 的 `AppService` 組合 `agents`、`endpoints`、`interface`、`memory`、`web`、`turnstile`、`ocr` 等各區塊 |
| `utils/` | 14 | 工具函式:`objectId`、`string`、`yaml`、`retry`(建索引重試)、`tenantBulkWrite`、`principal` 等 |
| `config/` | 6 | `winston.ts`(日誌)、`meiliLogger.ts`、`parsers.ts`(日誌格式與遮蔽)、`tenantContext.ts`(用 `AsyncLocalStorage` 在一次請求中帶著租戶與使用者資訊) |
| `common/` | 5 | 共用的列舉與常數:`enum`、`pagination`、`permissions`、`search` |
| `migrations/` | 5 | 啟動時的資料遷移:租戶索引、提示詞群組索引、MCP 相關索引與名稱補填 |
| `tenant/` | 3 | 多租戶隔離的規則(`policy.ts`)、一致性檢查(`conformance.ts`)、探測(`probe.ts`) |
| `admin/` | 2 | `capabilities.ts`:管理介面的系統權限清單 |
| `crypto/` | 1 | `index.ts`:JWT 簽章(`signPayload`)、雜湊(`hashToken`)與金鑰加解密(用 `CREDS_KEY`、`CREDS_IV`) |
| `index.ts` | 1 | 套件匯出,共 110 行 |

### `methods/` 依用途

| 用途 | 檔案 |
|---|---|
| 使用者與登入 | `user`、`session`、`token`、`key`、`pluginAuth`、`refreshTokenBridge`、`openidRefreshFlight` |
| 對話與訊息 | `conversation`、`message`、`conversationTag`、`preset`、`toolCall`、`share`、`import`、`favorite` |
| 權限與角色 | `role`、`accessRole`、`aclEntry`、`userGroup`、`systemGrant`、`auditLog` |
| 用量與費用 | `transaction`、`tx`(各模型的代幣單價)、`spendTokens` |
| 檔案 | `file` |
| Agents 與工具 | `agent`、`agentApiKey`、`agentCategory`、`assistant`、`action`、`mcpServer`、`mcpAuthority`、`mcpAuthorizationFenceRetry`、`skill`、`skillSync`、`codeEnvironment`、`memory` |
| 排程與佇列 | `schedule`、`triggerDelivery`、`queuedTurn` |
| 其他 | `prompt`、`chatProject`、`banner`、`categories`、`config`、`insights` |

## 後端怎麼用它

後端只有兩個很小的檔案接上這一層:

- `api/db/models.js`(4 行):`const { createModels } = require('@librechat/data-schemas'); module.exports = { ...createModels(mongoose) };`,取得所有資料模型。
- `api/models/index.js`:呼叫 `createMethods(mongoose, 相依函式)` 取得所有資料庫方法。`createMethods` 接收的相依函式(`matchModelName`、`findMatchingPattern`、`getCache` 等)由 `packages/api` 與 `api/` 提供,所以這一層不直接依賴它們。

之後所有路由與控制器,都是 `require('~/models')` 然後呼叫 `saveConvo(...)`、`getMessages(...)` 這類方法。

## 對話與訊息怎麼存

MVP 驗收的「重新整理後歷史仍在」,資料就在這兩個集合:

| 集合 | 重要欄位 |
|---|---|
| `Conversation`(`schema/convo.ts`) | `conversationId`、`title`、`user`、`messages`(`Message` 的 `ObjectId` 陣列)、`endpoint`、`model`、`isTemporary` |
| `Message`(`schema/message.ts`) | `messageId`、`conversationId`、`parentMessageId`(用它串成訊息樹)、`sender`、`text`、`content`、`isCreatedByUser`、`model`、`endpoint`、`tokenCount`、`error` |
| `User`(`schema/user.ts`) | `name`、`username`、`email`、`password`(雜湊後)、`role`、`provider`(登入來源)、各社群登入 ID 欄位(`googleId`、`openidId`、`githubId`…)、`twoFactorEnabled` |

`parentMessageId` 讓一個對話可以長出分支(重新生成、編輯後重送),所以訊息是一棵樹,不是一條直線。前端用 `data-provider` 的 `buildTree`(見 [data-provider](data-provider.md))把它組回來。

## 第一個要讀的檔案

想理解「資料是怎麼存的」,從這幾個開始:

1. `src/models/convo.ts`:25 行,最短的完整例子:schema → 外掛 → 註冊模型。
2. `src/schema/convo.ts`:對話有哪些欄位。
3. `src/schema/message.ts`:訊息有哪些欄位。
4. `src/models/index.ts`:`createModels` 一次建立 47 個模型的清單,等於整個資料庫的目錄。
5. `src/methods/conversation.ts` 裡的 `saveConvo`:一次聊天結束後,對話怎麼被寫進資料庫。

## References

- [packages/data-schemas(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/packages/data-schemas)
- [packages/data-schemas/README.md(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/data-schemas/README.md)
- [Project Architecture(官方文件翻譯)](../official/development/architecture.md):建置順序與相依方向
- [MVP 設計](../mvp-design.md):這一層為什麼整層保留
- [歷史分群](../history-cohorts.md):這個套件的檔案誕生日
- [Mongoose 文件](https://mongoosejs.com/docs/guide.html):schema 與 model 的概念
