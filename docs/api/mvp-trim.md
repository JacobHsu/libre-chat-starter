# 後端精簡清單(MVP-1)

MVP-1 的後端只改 2 個檔案、**沒有新增任何自己寫的邏輯**。這份清單列出每一處,最終階段這 2 個檔案會換回官方完整版。

各階段補回功能時,會從清單拿掉對應的項目。階段 1(提示詞)補回了 `prompts`、`categories` 兩條路由,目前的狀態是**刪 143 行、改 1 行**(MVP-1 當時是刪 149 行)。下面的數字都是目前的狀態。

## 規則

- 只刪不寫:每處精簡都是刪掉一個 `require` 與對應的呼叫,或一整段只服務被刪功能的程式碼。
- 唯一的修改(不是純刪除):`server/index.js` 裡 `const { initializeScheduleEngine, recordExpiredScheduleApproval } = require('./services/Schedules')` 改成只匯入 `recordExpiredScheduleApproval`,因為 `initializeScheduleEngine` 的呼叫整段刪了。

## `server/routes/index.js`(官方 93 行 → 41 行)

路由聚合檔。刪掉 26 條路由的 `require` 與匯出,保留 19 條:

| 保留(19) | `auth`、`user`、`keys`、`roles`、`files`、`banner`、`agents`、`convos`、`search`、`config`、`models`、`presets`、`balance`、`messages`、`endpoints`、`staticRoute`、`accessPermissions`、`prompts`(階段 1)、`categories`(階段 1) |
|---|---|
| 刪除(26) | `oauth`、`insights`、`adminAuth`、`adminConfig`、`adminCodeEnvironments`、`adminLangfuse`、`adminGrants`、`adminGroups`、`adminRoles`、`adminSkills`、`adminUsers`、`adminAuditLog`、`codeEnvironments`、`actions`、`apiKeys`、`traces`、`projects`、`skills`、`assistants`、`share`、`memories`、`schedules`、`tags`、`mcp`、`rum`、`openapi` |

## `server/index.js`(官方 634 行 → 544 行)

### 路由掛載:刪 26 行 `app.use`

與上面 26 條路由一一對應,例如 `app.use('/api/mcp', routes.mcp)`、`app.use('/oauth', preAuthTenantMiddleware, routes.oauth)`。其中排程路由多了一個寫入閘門:`app.use('/api/schedules', rejectScheduleWritesUntilReady, routes.schedules)`。

### 啟動項目:刪 6 項

| 刪除的項目 | 它做什麼 |
|---|---|
| `startCodeEnvironmentLifecycleReconciler({ mongoose })` | 啟動時協調程式碼環境的生命週期 |
| 部署外掛與技能區塊:`initializeDeploymentPlugins`、`setPluginHookSource`、`initializeDeploymentSkills`、`initializeGitHubSkillSync` | 載入部署時宣告的外掛、技能與 GitHub 技能同步 |
| `startExpiredFileSweep` | 定期清理過期檔案 |
| `loadToolApprovalHooks` | 載入工具核准的政策 hooks |
| `initializeOAuthReconnectManager`(監聽之後) | 重新連線 MCP 的 OAuth |
| 排程引擎(監聽之後):`initializeScheduleEngine`、`scheduleEngineState`、`createScheduleWriteGate`、`rejectScheduleWritesUntilReady` | 排程聊天的引擎與狀態 |

同時刪掉 11 個對應的匯入名稱。

## 不能刪的一項:`initializeMCPs()`

先前的設計寫「MCP 初始化延後」,實測是錯的。刪掉 `initializeMCPs()` 之後,伺服器啟動正常,但**送訊息時 Agent 執行失敗**,日誌是 `MCPManager has not been initialized`,串流沒有任何片段。原因:`initializeMCPs()` 即使沒有設定任何 MCP 伺服器,也負責建立 `MCPManager` 這個全域物件,而 Agent 一開始執行就需要它。所以它保留在 `server/index.js`。

另一項實測:`setPluginHookSource` 可以刪,不影響聊天。

## 沒帶入的 62 個檔案

只被已刪除路由使用的程式碼,不帶:

| 位置 | 檔案 |
|---|---|
| `server/routes/`(30) | `actions.js`、`apiKeys.js`、`code-environments.js`、`insights.js`、`mcp.js`、`memories.js`、`oauth.js`、`openapi.js`、`projects.js`、`rum.js`、`schedules.js`、`share.js`、`skills.js`、`tags.js`、`traces.js`;`admin/` 10 個;`assistants/` 4 個;`types/assistants.js` |
| `server/services/`(10) | `AssistantService.js`、`Runs/`(5)、`cleanup.js`、`createRunBody.js`、`Files/index.js`、`initializeOAuthReconnectManager.js` |
| `server/controllers/`(6) | `mcp.js`、`auth/oauth.js`、`agents/errors.js`、`assistants/` 3 個 |
| `app/`(7) | `app/index.js`、`clients/OllamaClient.js`、`clients/index.js`、`clients/prompts/formatGoogleInputs.js`、`clients/specs/FakeClient.js`、`clients/tools/structured/TavilySearch.js`、`credentials.js` |
| 其他(9) | `server/middleware/`(3)、`server/experimental.js`、`config/meiliLogger.js`、`db/models.js`、`utils/logger.js`、`utils/LoggingSystem.js`、`typedefs.js` |

## 驗證結果(MVP-1 當時)

在暫存區把後端裁成當時的 315 個檔案之後啟動(階段 1 之後後端是 317 個檔案,驗證結果見[提示詞](../features/prompts.md)):

| 項目 | 結果 |
|---|---|
| 啟動 | 日誌 `Server listening at http://localhost:3090`,`/health` 200,沒有 `Cannot find module` |
| API 驗收 11 項 | 全部通過:首頁、設定、註冊、登入、端點含 `ollama`、模型清單 8 個、送訊息、串流回覆(9 個片段)、對話與訊息有保存 |
| 真實瀏覽器驗收 | 315 個檔案的後端搭配完整前端:登入狀態自動恢復、模型選擇器顯示 Ollama 的 `qwen2.5:1.5b-instruct`、中文提問、串流回覆、重新整理後對話與回覆仍在 |
| 前端啟動請求 | 共 32 個,26 個 200,6 個 404(`projects`、`skills`、`admin/roles`、`tags`、`prompts/groups`、`mcp/servers`,都是已刪除的後端路由),前端對 404 寬容,畫面正常 |

## References

- [server/index.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/index.js)
- [server/routes/index.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/index.js)
- [後端說明](index.md)
- [MVP 設計](../mvp-design.md):各功能在 MVP-1 的處理
- [本機執行教學](../local/npm.md):驗收流程
- [本機驗證筆記](../local-testing.md):API 驗證與踩到的坑
