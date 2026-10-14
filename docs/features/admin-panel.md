# 管理面板(Admin Panel)

用網頁介面管理 LibreChat 的使用者、群組、角色、設定覆寫與系統授權。功能本身的說明見官方頁面的翻譯[管理面板](../official/features/admin_panel.md);這份文件補充 LibreChat 這一端的程式碼、本機怎麼接上管理面板，以及階段 8 做了什麼。

## 兩個部分

| 部分 | 在哪裡 | 本專案 |
|---|---|---|
| 管理 API(`/api/admin/*`) | LibreChat 後端 `api/server/routes/admin/` | 階段 8 補回 |
| 管理面板(畫面) | 另一個程式 [ClickHouse/librechat-admin-panel](https://github.com/ClickHouse/librechat-admin-panel),以 Docker 映像檔發布 | 不屬於 LibreChat 原始碼。本專案預設不接(後端要對區網開放),接法見[本機接上管理面板](#本機接上管理面板) |

LibreChat 的 `client/` 裡沒有管理畫面。管理面板自己不存資料，所有操作都呼叫 LibreChat 的管理 API。

## 這個階段做了什麼

補回 `api/server/routes/admin/` 底下屬於管理面板本身的 7 個檔案:

| 檔案 | 掛載位置 | 做什麼 |
|---|---|---|
| `auth.js` | `/api/admin` | 管理員登入(本機帳號 `/login/local`、各家 SSO)、驗證 session(`/verify`) |
| `users.js` | `/api/admin/users` | 列出、搜尋使用者 |
| `groups.js` | `/api/admin/groups` | 群組的新增、讀取、修改、刪除與成員 |
| `roles.js` | `/api/admin/roles` | 自訂角色、權限矩陣、成員 |
| `grants.js` | `/api/admin/grants` | 系統能力授權(指派、撤銷、列出) |
| `config.js` | `/api/admin/config` | 基礎設定，以及依角色、群組、使用者的覆寫 |
| `audit.js` | `/api/admin/audit-log` | 稽核紀錄(列出、匯出 CSV、驗證) |

並在 `api/server/routes/index.js` 補回這 7 個的 `require` 與匯出、在 `api/server/index.js` 補回 7 行 `app.use('/api/admin…')`。

官方的 `routes/admin/` 還有另外 3 個檔案，屬於後面的功能，留到各自的階段和功能一起補回:

| 檔案 | 掛載位置 | 屬於 |
|---|---|---|
| `code.js` | `/api/admin/code-environments` | 程式碼環境 |
| `langfuse.js` | `/api/admin/langfuse` | Trace 與可觀測 |
| `skills.js` | `/api/admin/skills` | Skills |

### 稽核紀錄記什麼

稽核紀錄只記錄 `packages/data-schemas/src/types/admin.ts` 的 `AUDIT_ACTIONS` 列出的動作：系統授權的指派與移除(`grant.assigned`、`grant.removed`),以及 Insights 權限的指派與移除。建立或刪除群組、修改角色不會留下稽核紀錄。

## 歷史

| 時間 | 事件 |
|---|---|
| 2026-01 | 管理員登入路由(`admin/auth.js`),以跨來源的一次性交換碼把登入結果交給管理面板 |
| 2026-03 | 存在資料庫、依個別主體的設定覆寫(`admin/config.js`);群組、角色、授權、使用者 API |
| 2026-06 | 系統授權的稽核紀錄(`admin/audit.js`);Skills 管理 |
| 2026-07 | Langfuse 管理 |
| 2026-08 | 程式碼環境管理 |

官方文件標示管理面板為預覽版，管理 API 從 v0.8.5 開始提供。

## 誰是管理員

管理 API 每個請求都由 LibreChat 檢查 `access:admin` 能力(`requireCapability(SystemCapabilities.ACCESS_ADMIN)`)。內建的 `ADMIN` 角色預設就有這個授權。

在沒有分租戶的部署中，**第一個註冊的使用者自動成為 `ADMIN`**(`api/server/services/AuthService.js` 註冊時檢查使用者數是否為 0)。之後註冊的都是 `USER`。

## 本機接上管理面板

### 學習用的容器

你本機已有的 `admin-panel`(埠 3000)、`admin-panel-sep`(埠 3001)屬於另外兩套 LibreChat,不使用。另起一個學習專用的容器，用同一個官方映像檔:

```bash
docker run -d --name learn-admin-panel -p 3092:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e SESSION_SECRET=<至少 32 個字元的隨機字串> \
  -e API_SERVER_URL=http://host.docker.internal:<後端埠> \
  -e VITE_API_BASE_URL=http://localhost:<後端埠> \
  -e SESSION_COOKIE_SECURE=false \
  registry.librechat.ai/clickhouse/librechat-admin-panel:latest
```

| 變數 | 意思 |
|---|---|
| `API_SERVER_URL` | 管理面板的伺服器(在容器裡)呼叫 LibreChat 用的網址。容器裡的 `localhost` 是容器自己，所以用 `host.docker.internal` 連到主機 |
| `VITE_API_BASE_URL` | 瀏覽器端看到的 LibreChat 網址，給 SSO 轉址用 |
| `SESSION_COOKIE_SECURE=false` | 本機沒有 HTTPS |

管理面板的登入，是由它的伺服器端代為呼叫 LibreChat 的 `POST /api/admin/login/local`,所以容器一定要連得到 LibreChat 後端。

### 後端要監聽所有介面

LibreChat 後端預設只監聽 `localhost`(`api/server/index.js`:`HOST` 沒設時用 `localhost`)。從容器經 `host.docker.internal` 過來的連線不是 localhost,會被拒絕(`ConnectionRefused`)。要讓容器連得到，後端要設:

```bash
HOST=0.0.0.0
```

這會讓後端接受所有網路介面的連線，同一個區網的其他裝置也可能連得到。

## 驗證

在暫存區(全新資料庫)補回後:

| 項目 | 結果 |
|---|---|
| 第一個註冊的使用者 | 角色 `ADMIN`,`POST /api/admin/login/local` 200 |
| 第二個使用者 | 管理登入 403;用一般登入的 token 呼叫 `/api/admin/users` 也是 403 |
| 未登入呼叫 `/api/admin/users` | 401 |
| 管理員:`/verify`、`/users`、`/users/search`、`/roles`、`/grants`、`/config/base`、`/audit-log` | 都是 200;授權清單中 `ADMIN` 角色有 `access:admin` |
| 管理員：建立群組 → 列出 → 刪除 | 201 → 200 → 200 |
| `/api/admin/skills`(沒補回) | 404 |
| 管理面板容器 | `http://localhost:3092` 回 200;後端以 `HOST=0.0.0.0` 啟動後，從容器內以管理面板相同的寫法登入：管理員 200(`role=ADMIN`),一般使用者 403 |

## References

- [管理面板(官方文件翻譯)](../official/features/admin_panel.md)
- [存取控制(官方文件翻譯)](../official/features/access_control.md)
- [Admin Panel(官方文件)](https://www.librechat.ai/docs/features/admin_panel)
- [api/server/routes/admin/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/api/server/routes/admin)
- [packages/data-schemas/src/types/admin.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/data-schemas/src/types/admin.ts)
- [ClickHouse/librechat-admin-panel](https://github.com/ClickHouse/librechat-admin-panel)
- [分享](share.md):前一個階段
- [路線圖](../roadmap.md):階段 8
