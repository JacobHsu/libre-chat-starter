# 程式碼環境(Code environments)

讓使用者把自己的 VM 配對成 Agent 的程式碼執行環境。功能說明見官方頁面的翻譯 [Code Interpreter API](../official/features/code_interpreter.md) 的「附加環境與配對」一節。

> 這是**高度實驗性**的功能，需要相符的實驗性 Code Interpreter 遠端橋接版本。

## 和 Code Interpreter 的關係

| | Code Interpreter(基本) | 程式碼環境(附加與個人) |
|---|---|---|
| 做什麼 | Agent 在服務端的沙箱執行程式碼、產生檔案 | Agent 在**使用者自己配對的 VM** 上讀寫檔案、執行 Bash 與程式碼 |
| 執行服務 | [ClickHouse/code-interpreter](https://github.com/ClickHouse/code-interpreter),由 `LIBRECHAT_CODE_BASEURL` 指向 | 相容的 Code API 遠端橋接，加上在 VM 上向外連線的 `@librechat/code` worker |
| 本專案 | 程式碼在 MVP-1 就在專案內(Agent 執行管線的一部分),沒有設定 `LIBRECHAT_CODE_BASEURL` | 階段 13 補回路由與協調器，維持關閉 |

程式碼環境是「有狀態的程式碼工作階段」(Stateful Code Sessions)的執行後端之一。要用它，先要啟用 `execute_code` 與 `stateful_code_sessions` 能力、設定具名的 `statefulCodeSessions.environments` 與配對用的控制平面，Code API 還要使用 JWT 驗證。

## 這個階段做了什麼

| 檔案 | 動作 |
|---|---|
| `api/server/routes/code-environments.js` | 新增:`/api/code-environments`,列出、建立、配對、設定、刪除使用者自己的環境 |
| `api/server/routes/admin/code.js` | 新增:`/api/admin/code-environments`,管理員發配對碼、撤銷(階段 8 留到這裡補) |
| `api/server/routes/index.js` | 補回這兩個的 `require` 與匯出 |
| `api/server/index.js` | 補回 `startCodeEnvironmentLifecycleReconciler` 的匯入與呼叫，以及 2 行 `app.use` |

前端不用補：設定裡的 **Code environments**(`components/Nav/Settings/CodeEnvironments.tsx`)、輸入框的工作區選單、程式碼核准模式等畫面，在 MVP-1 與階段 11a 就已經在專案內。**Code environments** 只在啟用有狀態程式碼工作階段時才顯示。

### 生命週期協調器

`startCodeEnvironmentLifecycleReconciler`(`packages/api/src/code/lifecycle.ts`)在連上 MongoDB 之後啟動：立即執行一次，之後每 60 秒執行一次。它只在領頭的後端執行(沒有 Redis 時每個後端都是領頭，見[Redis 與快取](redis.md)),負責把中斷的撤銷與刪除(例如移除環境、刪除使用者時)完成。只有出錯時才寫日誌:`[code-environments] lifecycle reconciliation failed`。

### API

| 方法與路徑 | 做什麼 |
|---|---|
| `GET /api/code-environments` | 列出自己的環境與可用的控制平面 |
| `POST /api/code-environments/pairings` | 建立一次性的配對指令 |
| `POST /api/code-environments` | 註冊環境(需要 `manage:code_environments`) |
| `GET /api/code-environments/:environmentId/status` | 環境的狀態 |
| `PATCH /api/code-environments/:environmentId/settings` | 修改環境設定(例如工具權限) |
| `DELETE /api/code-environments/:environmentId` | 移除環境(先撤銷 worker 憑證) |
| `PATCH /api/code-environments/conversations/:conversationId/decision` | 變更已存對話使用的工作區 |
| `POST /api/admin/code-environments/:environmentId/pairings` | 管理員為部署擁有的環境發配對碼 |
| `POST /api/admin/code-environments/:environmentId/revoke` | 管理員撤銷 worker |

管理 API 同時檢查系統能力 `access:admin` 與 `manage:code_environments`,`ADMIN` 角色預設兩者都有(見[管理面板](admin-panel.md))。

## 歷史

| 時間 | 事件 |
|---|---|
| 2023-08 | 第一個 Code Interpreter 外掛;同年 12 月移除第三方的 Code Interpreter |
| 2026-08 | 使用者自己擁有的程式碼環境(`routes/code-environments.js`);安全的附加環境配對(`routes/admin/code.js`) |

## 驗證

在暫存區(埠 3095、全新資料庫)補回後:

| 項目 | 結果 |
|---|---|
| 後端啟動 | 正常，協調器沒有錯誤日誌;資料庫出現 `codeenvironments`、`code_environment_reconciliation` 集合 |
| MVP 的 API 驗收 11 項 | 全部通過 |
| 管理員、一般使用者 `GET /api/code-environments` | 200,`{"environments":[],"controlPlanes":[]}` |
| `POST /api/code-environments/pairings` | 409:`Principal code workers require Code API JWT authentication` |
| 管理員對不存在的環境 `POST /api/admin/code-environments/x/pairings` | 404:`Code environment was not found` |
| 一般使用者呼叫管理 API | 403 |
| 未登入 | 401 |

## References

- [Code Interpreter API(官方文件翻譯)](../official/features/code_interpreter.md)
- [Code Interpreter API(官方文件)](https://www.librechat.ai/docs/features/code_interpreter)
- [ClickHouse/code-interpreter](https://github.com/ClickHouse/code-interpreter)
- [api/server/routes/code-environments.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/code-environments.js)
- [api/server/routes/admin/code.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/admin/code.js)
- [packages/api/src/code/lifecycle.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/code/lifecycle.ts)
- [Assistants](assistants.md):前一個階段
- [路線圖](../roadmap.md):階段 13
