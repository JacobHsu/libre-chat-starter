# Agents

在介面上建立自訂的 AI 助理：選模型、寫指示、加工具，存成一個 Agent,之後直接和它聊天。功能本身的說明見官方頁面的翻譯 [Agents](../official/features/agents.md);這份文件補充程式碼的對應，以及階段 11 做了什麼。

階段 11 分三步:**11a 建構器**、**11b 市集**、**11c Agents API**。

## Agent 和 MVP 的關係

MVP-1 的聊天本來就走 Agent 的管線：送訊息的 API 是 `/api/agents/chat`,後端的 Agent 路由(`api/server/routes/agents/`)、執行引擎與資料模型都保留在專案內。所以 MVP-1 已經能用 API 建立 Agent、和它聊天(階段 9 驗證 Insights 時就這樣做過)。缺的是**在介面上建立與編輯 Agent 的建構器**,以及市集與 Agents API。

## 11a:建構器

### 補回的檔案

建構器的入口有三個，從它們沿著 `import` 往下找，專案裡還沒有的檔案共 105 個:

| 位置 | 檔案數 | 是什麼 |
|---|---|---|
| `components/SidePanel/Agents/` | 81 | 建構器本體：表單、模型設定、進階設定、版本歷史、工具庫(Tools)、Actions、程式碼與搜尋設定等 |
| `components/SidePanel/MCPBuilder/MCPServerDialog/` | 11 | 「新增 MCP 伺服器」對話框。建構器的工具庫可以直接新增 MCP 伺服器,`Tools/ItemDialog/AddMcpServerDialog.tsx` 引用它 |
| `components/Skills/dialogs/` | 4 | Skills 選擇對話框,`Tools/SkillsDialog.tsx` 引用它 |
| `components/SidePanel/Builder/` | 2 | Actions 的驗證與回呼元件(與 Assistants 共用),`ActionsInput.tsx`、`Tools/ActionEditor.tsx` 引用它 |
| `components/Plugins/Store/` | 2 | 工具驗證表單與提示,`Tools/ItemDialog/sections/ToolSection.tsx` 引用它 |
| `components/Variables/` | 2 | 指示欄位的變數編輯器,`Instructions.tsx` 引用它 |
| `components/MCP/McpOAuthDialog.tsx` | 1 | MCP 的 OAuth 對話框,`Tools/ItemDialog/sections/McpSection.tsx` 引用它 |
| `components/Chat/Input/ToolDialogs.tsx` | 1 | 輸入框的工具設定對話框(例如網頁搜尋的金鑰) |
| `hooks/MCP/useRemoveMCPTool.ts` | 1 | 從 Agent 移除 MCP 工具 |

MCP、Skills 的這些檔案只是建構器引用的元件，對應的功能開關(`librechat.yaml` 的 `mcpServers.use`、`skills`)仍然關閉，所以那些功能不會因此出現。

另外換回 3 個精簡檔案的段落，以及後端 2 處:

| 檔案 | 補回 |
|---|---|
| `client/src/hooks/Nav/useSideNavLinks.ts` | `AgentPanelSwitch` 的 `import`,以及側邊欄的 Agent 建構器面板(`links.push`) |
| `client/src/components/Chat/Input/BadgeRow.tsx` | `ToolDialogs` 的 `import` 與使用處(換回後與官方相同) |
| `client/src/hooks/MCP/index.ts` | `useRemoveMCPTool` 的匯出(換回後與官方相同) |
| `api/server/routes/actions.js` | 新增:`/api/actions`,Actions 接外部 API 時的 OAuth 綁定與回呼 |
| `api/server/routes/index.js`、`api/server/index.js` | 補回 `actions` 的 `require`、匯出與掛載;以及啟動時載入工具核准 hooks 的區塊(`loadToolApprovalHooks`) |

### 側邊欄什麼時候出現建構器

`useSideNavLinks.ts` 同時檢查四個條件:

- 端點設定中有 `agents` 端點
- 角色有 Agent 的使用權限(`hasAccessToAgents`)
- 角色有建立 Agent 的權限(`hasAccessToCreateAgents`)
- `agents` 端點沒有設定 `disableBuilder: true`

### 建構器呼叫的 API

| 方法與路徑 | 做什麼 |
|---|---|
| `POST /api/agents` | 建立 Agent |
| `GET /api/agents` | 列出可用的 Agent |
| `GET /api/agents/:id` | 讀取一個 Agent |
| `PATCH /api/agents/:id` | 修改 Agent |
| `GET /api/agents/:id/versions` | 版本歷史 |
| `POST /api/agents/:id/revert` | 還原到某個版本 |
| `POST /api/agents/:id/duplicate` | 複製 Agent |
| `DELETE /api/agents/:id` | 刪除 Agent |
| `GET /api/agents/tools` | 內建工具清單 |
| `GET /api/mcp/tools` | MCP 工具清單(MCP 階段才補回，目前 404) |
| `/api/actions/:action_id/oauth/*` | Actions 的 OAuth 綁定與回呼 |

和 Agent 聊天走 `POST /api/agents/chat/agents`(帶 `agent_id`),再從 `/api/agents/chat/stream/:streamId` 讀串流。

### 工具核准 hooks

`librechat.yaml` 的 `endpoints.agents.toolApproval` 可以要求某些工具呼叫先經過使用者核准(見翻譯中的「Ask User 與工具核准」)。`toolApproval.hooks` 則是用程式寫的核准政策，後端啟動時由 `loadToolApprovalHooks` 載入。`toolApproval.enabled` 沒有開啟時不載入任何 hooks。

## 11b:市集

### 補回的檔案

| 位置 | 檔案 | 動作 |
|---|---|---|
| 前端 | `client/src/components/Agents/`(11 個) | 新增：市集頁面(`Marketplace.tsx`)、Agent 卡片與格狀清單、詳細資料、分類標籤、搜尋列、管理員設定、`AgentContact`(Agent 的聯絡方式) |
| 前端 | `client/src/hooks/useInfiniteScroll.ts` | 新增：市集清單的無限捲動 |
| 前端 | `client/src/routes/index.tsx` | 補回市集的 2 條 `import`,以及 `/agents`、`/agents/:category` 兩條路由 |
| 前端 | `client/src/components/Chat/Landing.tsx` | 補回 `AgentContact`:選了 Agent 時，新對話的首頁顯示它的聯絡方式(換回後與官方相同) |
| 設定 | `librechat.yaml` | `interface.marketplace.use` 從 `false` 改成 `true` |

後端不用補：市集用的都是 MVP-1 就有的 Agent 路由(`/api/agents`)與權限路由(`/api/permissions`)。

### 市集顯示哪些 Agent

市集呼叫 `GET /api/agents`,列出**目前使用者有檢視權限的 Agent**:自己建立的，加上別人分享給自己或公開的。可以加上這些參數:

| 參數 | 作用 |
|---|---|
| `category` | 依分類篩選(分類清單來自 `GET /api/agents/categories`) |
| `search` | 依名稱或描述搜尋,不分大小寫 |
| `promoted` | `1` 只列推薦的 Agent,`0` 只列不推薦的 |

分享走權限路由 `PUT /api/permissions/agent/:id`(`:id` 是 Agent 在資料庫的 `_id`)。公開分享的內容是 `{ "public": true, "publicAccessRoleId": "agent_viewer" }`,取消公開是 `{ "public": false }`。

### 開關

`interface.marketplace.use` 和書籤一樣，在每次啟動時寫入角色的 `MARKETPLACE.USE` 權限。前端的 `hooks/Nav/useShowMarketplace.ts`(側邊欄的市集入口，MVP-1 就有)與 `Marketplace.tsx` 都檢查這個權限。

## 11c:Agents API

讓外部程式用 API 金鑰呼叫 Agent。官方說明見[Agents API(官方文件翻譯)](../official/features/agents_api.md)。

### 補回的檔案

| 檔案 | 動作 |
|---|---|
| `api/server/routes/apiKeys.js` | 新增:`/api/api-keys`,建立、列出、讀取、刪除 API 金鑰;每條路由都檢查角色的 `REMOTE_AGENTS.USE` |
| `api/server/routes/openapi.js` | 新增:`/api/openapi.json`(OpenAPI 規格)與 `/api/docs`(Swagger UI),由最上層的 `openapi.enabled` 控制 |
| `api/server/routes/index.js`、`api/server/index.js` | 補回這兩個的 `require`、匯出與掛載 |

Agents API 本身的路由(`/api/agents/v1/chat/completions`、`/v1/responses`、`/v1/models` 等)在 `api/server/routes/agents/` 裡，MVP-1 就已經在專案內;前端管理金鑰的畫面(**Settings → Data** 的 **Agent API keys**,繁中介面為「Agent API 金鑰」;`components/Nav/SettingsTabs/ApiKeys/`)也是，只對有 `REMOTE_AGENTS` 權限的角色顯示。缺的是發金鑰的路由，沒有它就沒有金鑰能呼叫 Agents API。

### 開關

| 設定 | 預設 | 作用 |
|---|---|---|
| `interface.remoteAgents.use`、`create` | `USER` 角色 `false`;`ADMIN` 角色 `true` | 能不能使用、建立 API 金鑰。寫進角色的 `REMOTE_AGENTS` 權限 |
| `openapi.enabled`(最上層) | 停用 | 是否提供 `/api/openapi.json` 與 `/api/docs` |

本專案維持官方預設:管理員可以使用 Agents API,一般使用者不行;API 文件不提供。

`remoteAgents` 寫進的是資料庫裡的角色權限：設成 `true` 啟動過一次之後，再把設定拿掉，`USER` 的 `REMOTE_AGENTS` 仍然是 `true`,要關閉必須明確寫 `use: false`、`create: false`。`openapi.enabled` 不是角色權限，拿掉就回到停用。

### 用法

1. 在 **Settings → Data** 的 **Agent API keys** 建立金鑰(`POST /api/api-keys`,欄位 `name`)。回應中的 `key`(`sk-` 開頭)只出現這一次，之後清單只顯示前綴。
2. 用金鑰呼叫 Agents API,`model` 填 Agent 的 ID(`agent_` 開頭):

```bash
curl -X POST http://localhost:3090/api/agents/v1/chat/completions \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"model":"<AGENT_ID>","messages":[{"role":"user","content":"Hello"}],"stream":false}'
```

`GET /api/agents/v1/models` 列出這把金鑰能用的 Agent。

## 歷史

| 時間 | 事件 |
|---|---|
| 2024-08 | Agents 加入(`AgentPanelSwitch.tsx`、`AgentConfig.tsx`、`routes/agents/v1.js`) |
| 2025-02 | Actions 的 OAuth(`routes/actions.js`) |
| 2025-05 | Agent 版本歷史 |
| 2025-06 | 各端點統一走 Agent 框架(`ToolDialogs.tsx`);Agent 市集(`feat: Agent Marketplace`);以角色為基礎的細緻權限 |
| 2026-01 | 遠端存取 Agent 的外部 API(`routes/apiKeys.js`、`routes/agents/openai.js`、`routes/agents/responses.js`) |
| 2026-06 | Agent 的聯絡方式，沒設定時改顯示擁有者名稱(`AgentContact.tsx`) |
| 2026-07 | 可程式化的工具核准政策(`loadToolApprovalHooks`);建構器改版為統一的工具市集 |
| 2026-09 | 公開 Agents API 的 OpenAPI 規格與文件(`routes/openapi.js`) |

## 驗證(11a)

在暫存區(埠 3095、全新資料庫)補回並重新建置前端後:

| 項目 | 結果 |
|---|---|
| 前端建置 | 成功，沒有錯誤 |
| MVP 的 API 驗收 11 項 | 全部通過 |
| 端點設定 | `agents` 端點存在,`disableBuilder: false` |
| 建立 Ollama 的 Agent | 201 |
| 列出 / 讀取 | 200 / 200 |
| 修改名稱與指示 | 200;版本歷史保留修改前的版本 |
| 複製 / 刪除複本 | 201 / 200 |
| `GET /api/agents/tools` | 200,列出內建工具(例如 Traversaal) |
| 和 Agent 聊天 | 串流完成，收到回覆 |
| `GET /api/mcp/tools` | 404(MCP 階段才補回) |
| `GET /api/actions/x/oauth/callback`(不帶 state) | 錯誤頁 `invalid_state`;日誌 `Error verifying state parameter` |

## 驗證(11b)

在暫存區(埠 3095、全新資料庫)補回、把 `marketplace.use` 改成 `true` 並重新建置前端後，用一個測試管理員與一個一般使用者驗證:

| 項目 | 結果 |
|---|---|
| 前端建置 | 成功 |
| MVP 的 API 驗收 11 項 | 全部通過 |
| 市集權限 | `USER`、`ADMIN` 的 `MARKETPLACE.USE` 都是 `true` |
| `GET /api/agents/categories` | 200,有 `general` 等分類 |
| 管理員建立一個分類為 `general` 的測試 Agent | 201;管理員的清單看得到 |
| 分享前，一般使用者 | 清單看不到;讀取這個 Agent 回 403 |
| 管理員公開分享(`agent_viewer`) | 200 |
| 分享後，一般使用者 | 清單看得到;`category=general`、`search=market` 都找得到,`search=zzz` 找不到;讀取回 200 |
| 一般使用者修改這個 Agent | 403(檢視者不能編輯) |
| 取消公開 | 200;一般使用者的清單又看不到 |

## 驗證(11c)

在暫存區(埠 3095、全新資料庫)補回後，先用官方預設，再打開 `remoteAgents`(`use`、`create`)與 `openapi.enabled` 並重新啟動(同一個資料庫):

| 項目 | 官方預設 | 打開之後 |
|---|---|---|
| `USER` 的 `REMOTE_AGENTS` | 全部 `false` | `USE`、`CREATE` 為 `true` |
| `ADMIN` 的 `REMOTE_AGENTS` | 全部 `true` | 全部 `true` |
| 一般使用者 `GET` / `POST /api/api-keys` | 403 | 200 / 201 |
| 管理員建立金鑰 | 201,回傳 `sk-` 開頭的金鑰;清單只顯示前綴 | 同左 |
| 用金鑰 `GET /api/agents/v1/models` | 200,列出測試 Agent | 同左 |
| 用金鑰 `POST /api/agents/v1/chat/completions` | 200,收到回覆;`stream: true` 時收到 `chat.completion.chunk` 串流 | 同左 |
| 錯誤的金鑰 | 401 `invalid_api_key` | 同左 |
| 刪除金鑰(204)後再用 | 401 | 同左 |
| `/api/openapi.json`、`/api/docs` | 404 | 200(OpenAPI 3.1 規格、Swagger UI) |

MVP 的 API 驗收 11 項全部通過。

專案內(`librechat.yaml` 沒有 `remoteAgents` 與 `openapi`)連到同一個測試資料庫再驗證一次：金鑰與 Agents API 的結果相同;`/api/openapi.json`、`/api/docs` 回 404;`USER` 的 `REMOTE_AGENTS.USE` 仍然是先前寫入的 `true`。

## References

- [Agents(官方文件翻譯)](../official/features/agents.md)
- [Agents(官方文件)](https://www.librechat.ai/docs/features/agents)
- [Agents API(官方文件翻譯)](../official/features/agents_api.md)
- [Agents API(官方文件)](https://www.librechat.ai/docs/features/agents_api)
- [api/server/routes/apiKeys.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/apiKeys.js)
- [api/server/routes/openapi.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/openapi.js)
- [agents 物件(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents):`capabilities`、`toolApproval`、`recursionLimit`
- [client/src/components/SidePanel/Agents/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/Agents)
- [client/src/hooks/Nav/useSideNavLinks.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/client/src/hooks/Nav/useSideNavLinks.ts)
- [api/server/routes/actions.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/actions.js)
- [api/server/routes/agents/v1.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/agents/v1.js)
- [書籤](bookmarks.md):前一個階段
- [路線圖](../roadmap.md):階段 11
