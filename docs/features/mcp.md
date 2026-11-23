# MCP(Model Context Protocol)

讓 Agent 透過 MCP 伺服器使用外部工具(檔案系統、瀏覽器、各種 API)。功能說明見官方頁面的翻譯 [MCP](../official/features/mcp.md),`librechat.yaml` 的寫法見 [MCP 伺服器物件結構](../official/configuration/librechat_yaml/object_structure/mcp_servers.md)。

## MVP-1 已經有的部分

MCP 的核心在 MVP-1 就在專案內，因為它是 Agent 執行管線的一部分:

| 位置 | 內容 |
|---|---|
| `packages/api/src/mcp/` | `MCPManager`、連線、OAuth、工具轉換等核心 |
| `api/server/services/initializeMCPs.js` | 後端啟動時讀 `librechat.yaml` 的 `mcpServers`,連上每個伺服器並取得工具 |
| `client/src/components/Chat/Input/MCPSelect.tsx`、`components/MCP/` | 聊天輸入框的 MCP 伺服器選單 |
| `components/SidePanel/MCPBuilder/MCPServerDialog` | 新增與編輯伺服器的對話框(階段 11a 隨 Agent 建構器帶入) |

MVP-1 缺的是**管理用的 API** 與**側邊面板**:沒有 `/api/mcp`,前端查不到伺服器清單與連線狀態。另外 `interface.mcpServers.use` 設為 `false`,讓入口不顯示。

## 這個階段做了什麼

| 檔案 | 動作 |
|---|---|
| `client/src/components/SidePanel/MCPBuilder/` 的 7 個檔案 | 新增:MCP 伺服器面板(清單、卡片、狀態標籤、管理員權限設定) |
| `client/src/hooks/Nav/useSideNavLinks.ts` | 補回 `MCPBuilderPanel` 的 `import` 與 `links.push` 區塊 |
| `api/server/routes/mcp.js` | 新增:`/api/mcp` 路由 |
| `api/server/controllers/mcp.js` | 新增：伺服器清單與使用者自建伺服器的處理 |
| `api/server/services/initializeOAuthReconnectManager.js` | 新增:OAuth 重新連線管理器 |
| `api/server/routes/index.js` | 補回 `mcp` 的 `require` 與匯出 |
| `api/server/index.js` | 補回 `initializeOAuthReconnectManager` 的匯入與呼叫(緊接在 `initializeMCPs` 之後),以及 `app.use('/api/mcp', ...)` |
| `librechat.yaml` | `interface.mcpServers.use` 改回 `true` |

### 側邊面板何時顯示

`useSideNavLinks.ts` 的條件是：

- 角色有 MCP 的 **use** 權限，而且有可用的伺服器;或
- 角色有 MCP 的 **create** 權限。

官方預設 `ADMIN` 有 use 與 create,`USER` 只有 use。所以管理員一定看得到面板(可以自建伺服器),一般使用者要在有伺服器時才看得到。和其他 `interface` 開關一樣,`interface.mcpServers` 在每次啟動時寫入角色權限，拿掉設定不會還原，要寫 `false` 才會關。

### OAuth 重新連線管理器

需要 OAuth 的遠端 MCP 伺服器，使用者授權後會把權杖存進資料庫。管理器在後端啟動時建立(只建立一份),追蹤每位使用者的 OAuth 伺服器正在重新連線還是已經失敗。`/api/mcp` 的 OAuth 回呼與連線狀態查詢都會用到它，所以它和 `/api/mcp` 一起補回。本專案的伺服器是 `stdio`,不需要 OAuth,管理器只是建立、不會動作。

### API

| 方法與路徑 | 做什麼 |
|---|---|
| `GET /api/mcp/tools` | 列出所有伺服器的工具 |
| `GET /api/mcp/servers` | 列出伺服器(設定檔的加上使用者自建的) |
| `POST /api/mcp/servers` | 建立使用者自建的伺服器(需要 create 權限) |
| `GET`、`PATCH`、`DELETE /api/mcp/servers/:serverName` | 查看、修改、刪除自建伺服器 |
| `GET /api/mcp/connection/status` | 每個伺服器的連線狀態 |
| `GET /api/mcp/connection/status/:serverName` | 單一伺服器的連線狀態 |
| `POST /api/mcp/:serverName/reinitialize` | 重新連線 |
| `GET /api/mcp/:serverName/oauth/initiate`、`/oauth/callback` 等 | OAuth 授權流程 |
| `GET /api/mcp/:serverName/auth-values` | 使用者已填的 `customUserVars` 是否存在 |

### 工具名稱

MCP 工具在 Agent 裡的鍵是 `<工具名>_mcp_<伺服器名>`,例如 `filesystem` 伺服器的 `read_text_file` 是 `read_text_file_mcp_filesystem`。在 Agent 建構器加入 MCP 伺服器，就是把這些鍵存進 Agent 的 `tools`。

## 用法:filesystem 伺服器

官方的 [`@modelcontextprotocol/server-filesystem`](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem) 只允許存取參數列出的資料夾:

```yaml
interface:
  mcpServers:
    use: true

mcpServers:
  filesystem:
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-filesystem'
      - <允許存取的資料夾>
```

- 沒寫 `type`,有 `command`,所以是 `stdio`:後端把它當子程序啟動。第一次啟動時 `npx` 會先下載套件。
- 改了 `mcpServers` 要重新啟動後端。
- 啟動成功時日誌出現 `[MCP] Initialized with 1 configured server and 16 tools`。
- 在 Agent 建構器加入這個伺服器的工具，對話時 Agent 就能列出、讀取、寫入那個資料夾裡的檔案。小模型常先猜錯路徑而被拒絕(`Access denied`),在指示裡要求它先呼叫 `list_allowed_directories` 會穩定得多。

## 歷史

| 時間 | 事件 |
|---|---|
| 2024-12 | `v0.7.6`:MCP 支援(工具) |
| 之後 | 陸續加入 Streamable HTTP 傳輸、OAuth、使用者自建伺服器、MCP 伺服器面板 |

## 驗證

在暫存區(埠 3095、全新資料庫、上面的 filesystem 設定,`<允許存取的資料夾>` 是一個只放了 `readme.txt` 的沙盒資料夾)補回後:

| 項目 | 結果 |
|---|---|
| 後端啟動 | `[MCP] Initialized with 1 configured server and 16 tools` |
| `GET /api/mcp/servers`、`/tools`、`/connection/status` | 200,`filesystem` 的狀態為 `connected` |
| Agent「MCP Files」(Ollama `qwen2.5:7b-instruct`,4 個 filesystem 工具):列出並讀取 `readme.txt` | 呼叫 `list_allowed_directories`、`list_directory`、`read_text_file`,正確回答檔案內容 |
| 同一個 Agent:建立 `hello.txt` | 呼叫 `write_file`,沙盒資料夾出現該檔案，內容正確 |

## References

- [MCP(官方文件翻譯)](../official/features/mcp.md)
- [MCP 伺服器物件結構(官方文件翻譯)](../official/configuration/librechat_yaml/object_structure/mcp_servers.md)
- [MCP(官方文件)](https://www.librechat.ai/docs/features/mcp)
- [MCP Servers Object Structure(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_servers)
- [api/server/routes/mcp.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/mcp.js)
- [client/src/components/SidePanel/MCPBuilder(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/MCPBuilder)
- [modelcontextprotocol/servers:filesystem](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [程式碼環境](code-environments.md):前一個階段
- [路線圖](../roadmap.md):階段 14
