# Agents

在介面上建立自訂的 AI 助理：選模型、寫指示、加工具，存成一個 Agent,之後直接和它聊天。功能本身的說明見官方頁面的翻譯 [Agents](../official/features/agents.md);這份文件補充程式碼的對應，以及階段 11 做了什麼。

階段 11 分三步:**11a 建構器**、11b 市集、11c Agents API。目前完成 11a。

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

## 歷史

| 時間 | 事件 |
|---|---|
| 2024-08 | Agents 加入(`AgentPanelSwitch.tsx`、`AgentConfig.tsx`、`routes/agents/v1.js`) |
| 2025-02 | Actions 的 OAuth(`routes/actions.js`) |
| 2025-05 | Agent 版本歷史 |
| 2025-06 | 各端點統一走 Agent 框架(`ToolDialogs.tsx`) |
| 2026-07 | 可程式化的工具核准政策(`loadToolApprovalHooks`);建構器改版為統一的工具市集 |

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

## References

- [Agents(官方文件翻譯)](../official/features/agents.md)
- [Agents(官方文件)](https://www.librechat.ai/docs/features/agents)
- [agents 物件(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents):`capabilities`、`toolApproval`、`recursionLimit`
- [client/src/components/SidePanel/Agents/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/Agents)
- [client/src/hooks/Nav/useSideNavLinks.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/client/src/hooks/Nav/useSideNavLinks.ts)
- [api/server/routes/actions.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/actions.js)
- [api/server/routes/agents/v1.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/agents/v1.js)
- [書籤](bookmarks.md):前一個階段
- [路線圖](../roadmap.md):階段 11
