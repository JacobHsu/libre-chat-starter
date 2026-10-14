# Trace 與可觀測(Trace Viewer、Insights、RUM)

階段 9 包含三個功能，都是「看系統怎麼運作」，但資料來源不同。Insights 的功能說明見官方頁面的翻譯[管理員洞察](../official/features/insights.md);這份文件補充三者的差別、程式碼的對應、rc4 實測的存取規則，以及階段 9 做了什麼。

## 三個功能

| 功能 | 誰看 | 看什麼 | 資料從哪來 | 開關(官方預設) |
|---|---|---|---|---|
| **Trace Viewer** | 使用者看自己的對話 | 一次回覆中模型和工具呼叫的瀑布圖 | **Langfuse**(外部的 LLM 追蹤服務) | `interface.traceViewer.enabled`(關) |
| **Insights** | 管理員 | 對話數、使用者數、訊息數、token 數、使用者排行、流失使用者、最新對話 | **本機 MongoDB** 的對話、訊息、使用者集合 | `ENABLE_INSIGHTS`(`false`) |
| **RUM**(Real User Monitoring) | 維運人員 | 瀏覽器端的頁面載入與錯誤 | 前端送出，經後端轉送到 OpenTelemetry 收集器 | `RUM_ENABLED` 等(未設定) |

## 這個階段做了什麼

**補回程式碼，開關維持官方預設(全關)。**

| 位置 | 檔案 | 動作 |
|---|---|---|
| 前端 | `client/src/components/Chat/Trace/`(17 個) | 新增:Trace Viewer 的按鈕、瀑布圖、檢視器 |
| 前端 | `client/src/components/Insights/`(4 個) | 新增:Insights 儀表板 |
| 前端 | `components/Chat/ChatView.tsx`、`Header.tsx`、`Menus/HeaderMenu.tsx` | 換回官方完整版(補回 Trace 的外層、按鈕與選單項目) |
| 前端 | `client/src/routes/index.tsx` | 補回 Insights 的載入函式與 `/insights` 路由 |
| 後端 | `api/server/routes/traces.js` | 新增:`/api/traces` |
| 後端 | `api/server/routes/insights.js` | 新增:`/api/insights` |
| 後端 | `api/server/routes/rum.js` | 新增:`/api/rum` |
| 後端 | `api/server/routes/admin/langfuse.js` | 新增:`/api/admin/langfuse`(管理 Langfuse 連線) |
| 後端 | `api/server/routes/index.js`、`api/server/index.js` | 補回這 4 條路由的 `require`、匯出與掛載 |

側邊欄的 Insights 入口在 `hooks/Nav/useUnifiedSidebarLinks.ts`,MVP-1 就是完整版;RUM 的前端 `client/src/lib/rum/` 也已經在專案內。前端改了，所以要重新建置。

## 歷史

| 時間 | 事件 |
|---|---|
| 2025-10 | Langfuse 追蹤支援(把每次回覆送到 Langfuse) |
| 2026-06 | 瀏覽器 RUM 遙測的代理模式(`routes/rum.js`) |
| 2026-07 | Langfuse 連線管理(`admin/langfuse.js`);RUM 頁面載入診斷 |
| 2026-08 | 存在資料庫的管理員洞察(`routes/insights.js`、`InsightsView.tsx`) |
| 2026-09 | 對話 Trace Viewer(`routes/traces.js`、`Chat/Trace/`、`langfuse/reader.ts`) |

## Trace Viewer

LibreChat 設定 Langfuse 之後，每次回覆都會送一筆追蹤(trace)到 Langfuse。Trace Viewer 再透過 `packages/api/src/langfuse/reader.ts` 從 Langfuse 讀回來，畫成瀑布圖。所以沒有 Langfuse,就沒有東西可看。

開啟條件(官方 [Langfuse 設定頁](https://www.librechat.ai/docs/configuration/langfuse)的 Conversation Trace Viewer 一節):

- 設定好 Langfuse 連線，且 Langfuse 版本支援 v2 Observations API
- `librechat.yaml` 設 `interface.traceViewer.enabled: true`
- 只看得到自己對話中被取樣的追蹤
- 預設隱藏紀錄的輸入、輸出、metadata 與工具名稱;`showInputOutput`、`showToolNames` 可以打開

| API | 做什麼 |
|---|---|
| `GET /api/traces/:conversationId/availability` | 這段對話有沒有可看的追蹤 |
| `GET /api/traces/:conversationId/records` | 追蹤紀錄列表 |
| `GET /api/traces/:conversationId/records/:recordId` | 單筆紀錄 |

前端 `Header.tsx` 用 `useTraceControl` 決定要不要顯示 Trace 按鈕;`ChatView.tsx` 用 `TraceSurface` 包住對話區。

## Insights

### 存取規則(rc4 實測)

`/api/insights` 的權限判斷在 `packages/api/src/insights/access.ts`(`createInsightsAgentAccessResolver`),**以 Agent 為單位**:

| 情況 | 結果 |
|---|---|
| `ENABLE_INSIGHTS` 不是 `true` | 404,側邊欄不顯示 |
| 資料庫裡沒有任何 Agent | 所有人都 403 |
| `ADMIN` 角色 | 看得到所有 Agent |
| 其他角色，該角色有 `read:insights` 授權 | 看得到所有 Agent |
| 其他角色，沒有授權 | 只看得到自己對該 Agent 有「檢視」與「檢視洞察」權限的 Agent;一個都沒有就 403 |

`ADMIN` 角色在伺服器啟動時，就被預設授予 `access:admin`、`read:insights` 等系統能力，所以管理員不必另外授權。系統能力只能授予角色(`principalType: 'role'`),不能授予個別使用者。

統計的範圍也是 Agent:儀表板上方有 Agent 篩選器，數字只計算和選定 Agent 有關的對話。只用一般端點(例如我們的 Ollama 自訂端點)、沒有經過 Agent 的對話，不在統計裡。

### API

| API | 做什麼 |
|---|---|
| `GET /api/insights/access` | 目前的帳號能不能看 Insights |
| `GET /api/insights` | 統計資料。參數有 `range`(`24h`、`7d`、`30d`、`custom`)、`agentIds`、`page`、`pageSize`、`search` 等 |

## RUM

前端 `client/src/lib/rum/` 收集瀏覽器的效能與錯誤資料，送到後端 `/api/rum/v1/traces`、`/api/rum/v1/logs`,後端再轉送到設定的 OpenTelemetry 收集器。沒有設定時，這兩條路由回 404 `RUM proxy is not configured`。

## 驗證

在暫存區(埠 3095、全新資料庫、`ENABLE_INSIGHTS=true`)補回並重新建置前端後:

| 項目 | 結果 |
|---|---|
| 前端建置 | 成功，產出包含 Insights 的程式碼區塊 |
| MVP 的 API 驗收 11 項 | 全部通過 |
| 管理員看 Insights(資料庫還沒有 Agent) | 403 |
| 建立一個 Ollama 的 Agent 並和它聊一次之後，管理員看 Insights | 200,`access: true`;統計:1 個 Agent、1 位使用者、1 段對話、2 則訊息、39 個 token |
| 一般使用者看 Insights | 403 |
| 把 `read:insights` 授予 `USER` 角色 | 201;一般使用者變成 200,看得到同樣的統計;稽核紀錄出現 `grant.assigned` |
| 撤銷這個授權 | 200;一般使用者回到 403;稽核紀錄出現 `grant.removed` |
| 未登入看 Insights | 401 |
| `GET /api/traces/:id/availability`(沒有 Langfuse) | 200,`{"available": false}`;設定中沒有 `traceViewer`,畫面不顯示 Trace 按鈕 |
| `POST /api/rum/v1/traces`(沒有設定 RUM) | 404 `RUM proxy is not configured` |

## References

- [管理員洞察(官方文件翻譯)](../official/features/insights.md)
- [Admin Insights(官方文件)](https://www.librechat.ai/docs/features/insights)
- [Langfuse(官方文件)](https://www.librechat.ai/docs/configuration/langfuse):Conversation Trace Viewer 一節
- [api/server/routes/traces.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/traces.js)
- [api/server/routes/insights.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/insights.js)
- [api/server/routes/rum.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/rum.js)
- [packages/api/src/insights/access.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/insights/access.ts)
- [client/src/components/Chat/Trace/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/Chat/Trace)
- [管理面板](admin-panel.md):前一個階段，授予系統能力的 API
- [路線圖](../roadmap.md):階段 9
