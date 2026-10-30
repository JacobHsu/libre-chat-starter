# Assistants(OpenAI)

接上 OpenAI 的 Assistants API,在 LibreChat 裡建立與使用 OpenAI 端的 assistant。功能說明見官方頁面的翻譯 [Assistants](../official/configuration/pre_configured_ai/assistants.md)。

> OpenAI 在 2025-08-26 淘汰 Assistants API,2026-08-26 移除。現在 `assistants` 端點送往 OpenAI 的請求都不會成功。官方建議改用 [Agents](agents.md),它能搭配 OpenAI 的模型，提供相同的能力。

## 這個階段做了什麼

官方 rc4 仍然保留 Assistants 的程式碼。為了和 rc4 一致，這個階段把它補回來，但功能無法實際使用。

| 位置 | 檔案 | 動作 |
|---|---|---|
| 前端 | `client/src/components/SidePanel/Builder/`(21 個) | 新增:Assistants 建構面板、Actions 表格等(其中 2 個 Actions 元件已隨階段 11a 帶入) |
| 前端 | `client/src/components/Plugins/Store/`(2 個)、`client/src/components/Tools/`(2 個) | 新增：建構面板用到的工具選擇元件 |
| 前端 | `client/src/hooks/Nav/useSideNavLinks.ts` | 補回 `PanelSwitch` 的 `import` 與 Assistants 建構器面板(`links.push`) |
| 後端 | `api/server/routes/assistants/`(4 個)、`api/server/controllers/assistants/`(3 個)、`api/server/middleware/assistants/validate.js` | 新增:`/api/assistants` 的 v1、v2 路由與聊天 |
| 後端 | `api/server/services/AssistantService.js`、`createRunBody.js`、`services/Runs/`(5 個) | 新增：呼叫 OpenAI Assistants API、管理 run 的串流 |
| 後端 | `api/app/clients/index.js` | 新增：匯出 `TextStream` 與工具的共用函式，只有 `AssistantService.js` 引用它 |
| 後端 | `api/server/routes/index.js`、`api/server/index.js` | 補回 `assistants` 的 `require`、匯出與掛載 |

前端 25 個、後端 16 個，都是從入口(`SidePanel/Builder/PanelSwitch.tsx`、`routes/assistants/index.js`)沿著 `import`、`require` 找出、專案裡還沒有的檔案。

### 側邊欄什麼時候出現 Assistants 建構器

`useSideNavLinks.ts` 只在目前選的端點是 `assistants` 或 `azureAssistants`、該端點沒有 `disableBuilder: true`,而且使用者已經提供金鑰(`keyProvided`)時，才顯示建構器。

## 端點選單

`.env` 沒有設定 `ENDPOINTS` 時，端點清單包含所有可用的端點。官方範本的 `ASSISTANTS_API_KEY=user_provided` 讓 `assistants` 端點以「使用者自行提供金鑰」的方式列出(`userProvide: true`)。這個清單由設定決定，和 `/api/assistants` 路由在不在無關：補回之前，端點選單就已經有 Assistants,只是送出的請求會得到 404。

要讓選單不出現 Assistants,可以在 `.env` 用 `ENDPOINTS` 明確列出要的端點，不列 `assistants`。本專案維持官方範本，不設定 `ENDPOINTS`。

## 歷史

| 時間 | 事件 |
|---|---|
| 2023-11 | 開始開發 Assistants(`WIP: ... Vision and Assistants`) |
| 2024-02 | Assistants API 正式加入，同時加入一般檔案支援、側邊面板與檔案總管 |
| 2024-05 | 支援 OpenAI Assistants v2 |
| 2024-08 | LibreChat 自己的 Agents 加入(見[Agents](agents.md)) |
| 2025-08 | OpenAI 淘汰 Assistants API |
| 2026-08 | OpenAI 移除 Assistants API |

## 測試時注意:非瀏覽器的請求會被封鎖

`/api/assistants`(以及其他許多路由)會經過 `api/server/middleware/uaParser.js`。請求的 `User-Agent` 看不出是瀏覽器時，它回 `Illegal request`,並記一筆 `NON_BROWSER` 違規(預設 20 分，`NON_BROWSER_VIOLATION_SCORE`)。違規分數累積到門檻，使用者與來源 IP 會被暫時封鎖(實測 120 分鐘)，之後的請求都回 403「Your account has been temporarily banned」。用 `curl` 或腳本測試時，要帶上瀏覽器的 `User-Agent`。

## 驗證

在暫存區(埠 3095、全新資料庫)補回並重新建置前端後:

| 項目 | 結果 |
|---|---|
| 前端建置 | 成功 |
| MVP 的 API 驗收 11 項 | 全部通過 |
| `/api/endpoints` | 有 `assistants`(`userProvide: true`) |
| `GET /api/assistants/v2`、`/v1`(列出 assistants) | 500 `Error listing assistants`;日誌 `no_user_key` |
| `GET /api/assistants/v2/tools` | 200,列出內建工具 |
| `GET /api/assistants/v2/documents` | 200,`[]` |
| 未登入 `GET /api/assistants/v2` | 401 |
| 補回前的程式碼:`/api/endpoints` / `GET /api/assistants/v2` | 也有 `assistants` / 404 |

## References

- [Assistants(官方文件翻譯)](../official/configuration/pre_configured_ai/assistants.md)
- [Assistants(官方文件)](https://www.librechat.ai/docs/configuration/pre_configured_ai/assistants)
- [Assistants Endpoint Object Structure(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint)
- [api/server/routes/assistants/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/api/server/routes/assistants)
- [client/src/components/SidePanel/Builder/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/Builder)
- [api/server/middleware/uaParser.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/middleware/uaParser.js)
- [Agents](agents.md):前一個階段
- [路線圖](../roadmap.md):階段 12
