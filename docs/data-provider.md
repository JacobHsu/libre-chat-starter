# data-provider

`packages/data-provider`:前後端共用的 API 型別、端點、請求函式與資料驗證。它是 monorepo 最底層的函式庫,不依賴其他工作區,後端 `api/`、前端 `client/` 以及其他函式庫都依賴它。

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱與版本 | `librechat-data-provider`,0.8.524 |
| 誕生 | 2023-07-04,提交 `04e4259`「Move data provider to shared package」,從 `client/` 抽出來([專案建立順序](build-order.md)) |
| 入口 | 兩個:`.`(主入口 `src/index.ts`)與 `./react-query`(React Query 的 hooks,`src/react-query/`) |
| 相依套件 | `axios`、`croner`、`dayjs`、`js-yaml`、`re2js`、`zod`;peer 相依 `@tanstack/react-query` |
| 建置 | `npm run build:data-provider`,先用 `tsdown` 打包 JS(CJS 與 ESM 兩種格式),再用 `tsc` 單獨產生型別宣告。依 `tsdown.config.mjs` 的註解,這個套件的 zod schema 不適合讓 `tsdown` 直接產生型別,所以型別用 `tsc` |
| 輸出 | `dist/index.js`(CJS)、`dist/index.mjs`(ESM)、`dist/react-query/`、`dist/types/`。第三方套件不打包進去,只打包自己的模組 |

## 為什麼 MVP-1 整層保留

- 這個套件定義**所有功能**的 API 型別與端點,不只是 MVP 用到的。例如 `data-service.ts` 開頭匯出的函式是洞察、追蹤、Langfuse、程式碼環境的呼叫。
- 前端有 16 個檔案用整包匯入(`import * as`),無法依名稱切割。
- 入口 `index.ts` 有 57 行 `export * from`。靜態分析曾判定 `./createPayload` 可刪,**核對後是誤判**:前端的 `useSSE.ts` 與 `useResumableSSE.ts` 用它來組裝聊天請求。分析是靠名稱比對,對 `export { default as createPayload } from` 這種改名匯出會漏。實際可刪的入口行是 0 行。

所以這一層整個帶進專案,內容與官方 rc4 逐檔相同,只少了測試檔(`specs/` 與 `*.spec.ts`,共 50 個,最終階段補回)。

## 目錄與檔案

共 77 個檔案(不含測試)。分類依 `src/index.ts` 的區段註解。行數供參考。

### 設定

| 檔案 | 行數 | 內容 |
|---|---|---|
| `config.ts` | 4526 | 設定與設定檔 schema 的集中處:社群登入預設、檔案儲存、CloudFront、預設檢索模型等。最大的檔案 |
| `azure.ts`、`bedrock.ts` | 328、951 | Azure OpenAI 與 AWS Bedrock 的設定處理 |
| `balance.ts`、`footer.ts`、`langchain.ts` | 51、31、132 | 餘額保留、頁尾、LangChain 相關設定 |
| `file-config.ts` | 1381 | 檔案上傳設定 |
| `filters.ts` | 376 | PII(個資)過濾的內建樣式與上限 |
| `resolve-llm-delivery-path.ts` | 577 | 自訂端點如何傳送媒體內容 |

### 訊息、錯誤與執行步驟

| 檔案 | 行數 | 內容 |
|---|---|---|
| `messages.ts` | 242 | 訊息樹:`buildTree`、`findMessageById`、對話壓縮判斷 |
| `errors.ts`、`runSteps.ts` | 9、74 | 錯誤定義、執行步驟的計時 |

### 結構與解析

| 檔案 | 行數 | 內容 |
|---|---|---|
| `schemas.ts` | 1745 | `EModelEndpoint`(端點列舉)、`Providers`、`AuthType`,以及對話等資料的 zod schema |
| `parsers.ts` | 700 | `getEnabledEndpoints`、`orderEndpointsConfig`、`parseConvo` |
| `providers.ts` | 115 | 供應商身分:`ProviderId`、`endpointToProvider` |
| `models.ts`、`generate.ts`、`parameterSettings.ts` | 217、711、1404 | 模型規格、各端點的可調參數與設定元件的定義 |
| `artifacts.ts` | 3104 | `ArtifactModes` 與內建的 UI 元件原始碼文字(accordion、alert-dialog、avatar 等,依匯出名稱判斷) |

### 權限

| 檔案 | 行數 | 內容 |
|---|---|---|
| `permissions.ts` | 294 | `PermissionTypes` 與各介面功能的權限欄位 |
| `roles.ts` | 286 | `SystemRoles`、`roleSchema`、`roleDefaults` |
| `accessPermissions.ts` | 370 | `PrincipalType`、`ResourceType`、`PermissionBits`、`AccessRoleIds` |

### 型別

| 檔案 | 內容 |
|---|---|
| `types.ts`(1095 行) | 核心型別:`TMessages`、`TEndpointOption`、`TPayload`、`TSubmission` |
| `types/` 底下 18 個檔案 | 依功能分檔:`agents`、`assistants`、`content`、`files`、`graph`、`insights`、`mcpServers`、`mutations`、`queries`、`queuedTurns`、`runs`、`schedules`、`skills`、`subagents`、`tools`、`traces`、`web`,加一個 `index.ts` |

### 呼叫後端

| 檔案 | 行數 | 內容 |
|---|---|---|
| `api-endpoints.ts` | 612 | 各端點的網址組裝(`health`、`user`、`balance`、`messages` 等) |
| `data-service.ts` | 1660 | 呼叫後端的函式,涵蓋所有功能,以 `dataService` 命名空間匯出 |
| `request.ts` | 435 | 底層請求(以 axios 為基礎) |
| `createPayload.ts` | 76 | **前端送訊息時組裝請求本文**:目標網址是 `/api/agents/chat/<端點名稱>` |
| `upload.ts`、`headers-helpers.ts` | 212、18 | 上傳事件串流、token 與語言標頭 |
| `keys.ts` | 170 | React Query 的 `QueryKeys`、`MutationKeys` |
| `react-query/react-query-service.ts` | 567 | 子路徑 `librechat-data-provider/react-query` 的 hooks,例如 `useGetConversationByIdQuery` |

### 其他

| 檔案 | 行數 | 內容 |
|---|---|---|
| `actions.ts` | 869 | OpenAPI actions 的 schema 與認證 |
| `mcp.ts` | 584 | MCP 伺服器設定欄位的限制與判斷 |
| `svg.ts` | 101 | SVG 淨化政策 |
| `utils.ts` | 85 | 環境變數處理:`isSensitiveEnvVar`、`extractEnvVariable`、`normalizeEndpointName` |
| `feedback.ts`、`cadence.ts`、`limits.ts` | 152、351、40 | 回饋評分與標籤、排程週期轉 cron、數量上限 |
| `code/`、`codeEnvRef.ts` | 277、134 | 程式碼執行沙盒的核准、worker、工作區與環境參照 |
| `backgroundResults.ts`、`agentToolOptions.ts`、`stateful-code.ts` | 15、58、24 | 小型的輔助定義 |
| 設定檔 | | `package.json`、`tsconfig*.json`、`tsdown.config.mjs`、`babel.config.js`、`jest.config.js` 等建置與測試設定 |

## 第一個要讀的檔案

想理解「聊天請求是怎麼送出去的」,從這幾個開始:

1. `src/createPayload.ts`:組裝請求本文,決定打哪個網址。
2. `src/api-endpoints.ts`:端點網址的完整清單。
3. `src/request.ts`:底層請求怎麼發出、怎麼帶 token。
4. `src/schemas.ts`:`EModelEndpoint` 列出所有端點類型。

後端對應的接收端是 `api/server/routes/agents/` 底下的路由。

## References

- [packages/data-provider(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/packages/data-provider)
- [Project Architecture(官方文件翻譯)](official/development/architecture.md):建置順序與相依方向
- [歷史分群](history-cohorts.md):這個套件的檔案誕生日
