# MCP 伺服器物件結構(MCP Servers Object Structure)

## `<serverName>`

**鍵:**

| 鍵 | 型別 | 說明 |
| --- | --- | --- |
| `<serverName>` | Object | `mcpServers` 底下的每個鍵代表一個獨立的 MCP 伺服器設定，以唯一的名稱識別。應用程式內用這個名稱來引用該伺服器設定。 |

> **警告:使用正規化後仍唯一的名稱**
>
> 給模型看的工具鍵會保留字母、數字、`_`、`.` 與 `-`;伺服器名稱中的其他字元會被換成 `_`。LibreChat 會把這些正規化後的鍵對應回設定的名稱，並修復舊的、已儲存的 Agent 工具引用。避免兩個名稱正規化後變成同一個值，例如 `Sales Force` 與 `Sales:Force`:它們的工具鍵會有歧義,LibreChat 會發出警告，並排除被遮蔽的伺服器的工具，而不冒著把呼叫送到錯誤伺服器的風險。

### 子鍵

#### `type`

- **型別:** String
- **說明:** 指定連到 MCP 伺服器的連線類型。有效選項為 `"stdio"`、`"websocket"`、`"streamable-http"` 或 `"sse"`。
- **預設值:** 依 `url` 或 `command` 是否存在及其格式決定。

#### `command`

- **型別:** String
- **說明:**(`stdio` 類型用)啟動 MCP 伺服器要執行的指令或可執行檔。

#### `args`

- **型別:** 字串陣列
- **說明:**(`stdio` 類型用)傳給 `command` 的命令列參數。

#### `env`

- **型別:** Object(選填，僅 `stdio` 類型)
- **說明:** 啟動程序時使用的環境變數。
- **支援的佔位符:**
  - `{{LIBRECHAT_USER_ID}}`:換成目前使用者的 ID。
  - `{{LIBRECHAT_USER_*}}`:動態的使用者欄位佔位符(例如 `{{LIBRECHAT_USER_EMAIL}}`)。
  - `{{CUSTOM_VARIABLE_NAME}}`:換成使用者為 `customUserVars` 中定義的變數所提供的值(例如 `{{MY_API_KEY}}`)。
  - `${ENV_VAR}`:換成伺服器端環境變數 `{{ENV_VAR}}` 的值。

#### `timeout`

- **型別:** Integer(選填)
- **說明:** MCP 伺服器請求的逾時時間，單位毫秒。必須是非負整數。
- **預設值:** `30000`(30 秒)

#### `initTimeout`

- **型別:** Integer(選填)
- **說明:** MCP 伺服器初始化的逾時時間，單位毫秒。必須是非負整數。
- **預設值:** `10000`(10 秒)

#### `stderr`

- **型別:** String 或 Integer(選填，僅 `stdio` 類型)
- **說明:** 如何處理子程序的 `stderr`。語意與 Node 的 [`child_process.spawn`](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options) 相同。有效的字串值:`"pipe"`、`"ignore"`、`"inherit"`。也可以用非負整數當作檔案描述符。
- **預設值:** `"inherit"`(輸出到 `stderr` 的訊息會印到父程序的 `stderr`)。

### 注意事項

- **類型推斷:**
  - 若省略 `type`:
    - 有指定 `url` 且以 `http://` 或 `https://` 開頭,`type` 預設為 `sse`。
    - 有指定 `url` 且以 `ws://` 或 `wss://` 開頭,`type` 預設為 `websocket`。
    - 有指定 `command`,`type` 預設為 `stdio`。
- **連線類型:**
  - **`stdio`**:把 MCP 伺服器當作子程序啟動，透過標準輸入／輸出溝通。
  - **`websocket`**:透過 WebSocket 連到外部的 MCP 伺服器。
  - **`sse`**:透過 Server-Sent Events(SSE)連到外部的 MCP 伺服器。
  - **`streamable-http`**:透過 HTTP 連到外部的 MCP 伺服器，支援串流回應。

## 範例

### `stdio` MCP 伺服器

```yaml
puppeteer:
  type: stdio
  command: npx
  args:
    - -y
    - '@modelcontextprotocol/server-puppeteer'
  timeout: 30000
  initTimeout: 10000
  env:
    NODE_ENV: 'production'
    USER_EMAIL: '{{LIBRECHAT_USER_EMAIL}}'
    USER_ROLE: '{{LIBRECHAT_USER_ROLE}}'
  stderr: inherit
```

## 補充資訊

- **預設行為:**
  - 初始化在啟動時進行，修改設定後必須重新啟動應用程式才會生效。
  - 若同時指定 `url` 與 `command`,必須明確定義 `type`,避免歧義。
- **錯誤處理(`stderr`):**
  - 設定 `stderr` 可以管理 MCP 伺服器程序的錯誤訊息如何處理。預設的 `"inherit"` 表示錯誤會印到父程序的 `stderr`。

## References

- [MCP Servers Object Structure(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_servers)
- [Model Context Protocol(MCP)文件](https://github.com/modelcontextprotocol)
- [Node.js child_process.spawn](https://nodejs.org/api/child_process.html#child_processspawncommand-args-options)
