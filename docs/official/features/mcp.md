# Model Context Protocol(MCP)

了解 LibreChat 如何運用 Model Context Protocol(MCP),無縫整合外部工具、資料來源與專門服務。

Model Context Protocol(MCP)是一個開放協定，把應用程式提供上下文給大型語言模型(LLM)的方式標準化。可以把 MCP 想成**「AI 的 USB-C」**:就像 USB-C 為電子裝置提供通用的連接標準,MCP 提供一種標準化的方式，把 AI 模型連接到各式各樣的工具、資料來源與服務。

LibreChat 運用 MCP 大幅擴充 AI Agents 能做的事，讓你整合從檔案系統存取、網頁瀏覽器、專門的 API,到自訂的商業工具等各種東西。

## 為什麼 MCP 很重要(Why MCP Matters)

LLM 受限於它們內建的能力。透過 MCP,LibreChat 打破這些限制:

- **連接任何提供 MCP 伺服器的工具或服務**
- **把整合標準化**,不必為每個工具修改 LibreChat 的程式碼
- **支援多使用者環境**,具備適當的驗證與隔離
- **在執行期間新增與更新伺服器**,從 MCP Settings 面板操作，不必編輯設定檔或重新啟動

## MCP 在 LibreChat 中如何運作(How MCP Works in LibreChat)

LibreChat 提供兩種使用 MCP 伺服器的方式：在聊天區，或搭配 Agents。

你可以在 `librechat.yaml` 手動設定 MCP 伺服器，或使用 [smithery.ai](https://smithery.ai) 尋找 MCP 伺服器並安裝到 `librechat.yaml`([見下方範例](#基本設定basic-configuration))。每次在 `librechat.yaml` 新增或編輯伺服器，都需要重新啟動 LibreChat 來初始化連線。透過 [MCP Settings 面板](#在介面新增-mcp-伺服器adding-mcp-servers-in-the-ui)新增的伺服器，不必重新啟動就會生效。在面板建立、使用 OAuth 的伺服器，儲存時會註冊，但一開始是未連線的狀態：要[驗證](https://www.librechat.ai/docs/features/mcp#step-3-check-connection-status-and-authenticate)一次才會連線。

### 在聊天區(In Chat Area)

![從輸入框的面板打開的 MCP Servers 目錄，顯示每個伺服器的連線狀態](https://www.librechat.ai/images/mcp/mcp_servers_catalog.png)

使用傳統端點(OpenAI、Anthropic、Google、Bedrock 等)時,LibreChat 會直接在聊天區顯示已設定的 MCP 伺服器:

- 先選一個非 Agent 的端點，以及支援工具的模型
- MCP 伺服器出現在[輸入框 **+** 面板](composer.md)的 **MCP Servers** 區段，每個選取的伺服器會在輸入框上顯示成一個小標籤
- 選取後，那個伺服器的所有工具都能給目前的模型使用
- 不用建立 Agent 就能快速使用 MCP 工具，也可以同時使用多個伺服器

要讓某個 MCP 伺服器不出現在一般聊天的選項中，在設定裡加上 [`chatMenu: false`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_servers#chatmenu):

```yaml
mcpServers:
  internal-tools:
    command: npx
    args: ['-y', 'internal-mcp-server']
    chatMenu: false # 一般聊天中不能選取
```

這個設定在聊天請求和選擇器上都會強制執行，所以過時的已存選擇，不能繼續使用被隱藏的伺服器。它不會把伺服器從已存的 Agent,或明確指定它的 model spec 中移除。使用者只能透過有權限的 Agent 才能存取的伺服器,LibreChat 也會從一般聊天的選擇器與請求路徑中省略。

### 搭配 Agents(With Agents)

MCP 伺服器能無縫整合到 LibreChat 的 Agents:

1. 建立或編輯一個 Agent
2. 在 Agent Builder 打開 **Add tools**,選 **MCP**
3. 選一個 MCP 伺服器;每個伺服器在目錄中只顯示成一個項目
4. 展開選取的伺服器，啟用或停用個別的工具
5. 儲存你的 Agent

![Agent Builder 中的 MCP 工具](https://www.librechat.ai/images/mcp/mcp_ui_agent.png)

這種較高層次的組織方式讓介面保持好管理：即使是有 20 個以上工具的伺服器(例如 Spotify),也只顯示成一個項目，可以展開來細部控制。

### 基本設定(Basic Configuration)

在 `librechat.yaml` 手動加入 MCP 伺服器:

```yaml
mcpServers:
  # ClickHouse Cloud
  clickhouse-cloud:
    type: streamable-http
    url: https://mcp.clickhouse.cloud/mcp

  # 檔案系統存取
  filesystem:
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-filesystem'
      - /path/to/your/documents

  # 網頁瀏覽器自動化
  puppeteer:
    command: npx
    args:
      - -y
      - '@modelcontextprotocol/server-puppeteer'

  # 可用於正式環境的雲端服務
  business-api:
    type: streamable-http
    url: https://api.yourbusiness.com/mcp
    headers:
      X-User-ID: '{{LIBRECHAT_USER_ID}}'
      Authorization: 'Bearer ${API_TOKEN}'
    timeout: 30000
    serverInstructions: true
```

### 在介面新增 MCP 伺服器(Adding MCP Servers in the UI)

你也可以直接從 LibreChat 介面新增與設定 MCP 伺服器，不必編輯任何設定檔，也不必重新啟動伺服器。

#### 步驟 1:打開 MCP Settings 面板

從右側的側邊欄前往 **MCP Settings** 面板。這裡會列出既有的 MCP 伺服器，以及一個新增用的 **+** 按鈕。

![MCP Settings 面板](https://www.librechat.ai/images/mcp/mcp_ui_settings_panel.png)

#### 步驟 2:填寫伺服器資料

按 **+** 按鈕，填寫 MCP 伺服器的名稱、描述、網址、傳輸類型與驗證方式，然後點 **Create**。

![新增 MCP 伺服器的對話框](https://www.librechat.ai/images/mcp/mcp_ui_configure.png)

新的伺服器會出現在 MCP Settings 面板，並顯示一則確認訊息。

![MCP 伺服器建立成功](https://www.librechat.ai/images/mcp/mcp_ui_success_registered.png)

## MCP 伺服器管理(MCP Server Management)

LibreChat 提供完整的工具來管理 MCP 伺服器的連線，包括連線狀態追蹤，以及在介面中支援 OAuth 驗證與初始化。

### 連線狀態指示(Connection Status Indicators)

LibreChat 在輸入框的 **+** 面板與設定面板中，以動態的狀態圖示顯示每個 MCP 伺服器目前的狀態:

![MCP 伺服器狀態圖示](https://www.librechat.ai/images/mcp/mcp_server_status_icons.png)

**狀態類型:**

- **Connected(已連線，綠色齒輪)**:伺服器已連線，並有可設定的 customUserVars
- **OAuth Required(需要 OAuth,琥珀色鑰匙)**:伺服器需要 OAuth 驗證
- **Disconnected(已中斷，橘色插頭)**:伺服器連線失敗或中斷
- **Initializing(初始化中，藍色載入圖示)**:伺服器正在啟動或重新連線
- **Error(錯誤，紅色三角形)**:伺服器發生錯誤
- **Cancelling(取消中，紅色 x)**:OAuth 流程正在取消

### 伺服器初始化(Server Initialization)

你可以直接從介面初始化或重新初始化 MCP 伺服器:

**一鍵:**

- 在輸入框 **+** 面板的 **MCP Servers** 區段選取伺服器，就能一鍵初始化

  [影片:一鍵初始化 MCP](https://www.librechat.ai/videos/mcp_one_click_init.mp4)

**從 MCPConfigDialog:**

- 在輸入框 **+** 面板中，選 MCP 伺服器那一列的 **Configure**,打開 MCPConfigDialog
- 設定自訂的使用者變數，再依伺服器的驗證類型點 Authenticate 或 Initialize 按鈕

  [影片:MCP 設定對話框的驗證](https://www.librechat.ai/videos/mcp_config_dialog_auth.mp4)

**從 MCP Settings 面板:**

- 點 MCP Settings 面板伺服器清單中的任一伺服器，進入設定與初始化控制
- 設定自訂的使用者變數，再依伺服器的驗證類型點 Authenticate 或 Initialize 按鈕

  [影片:MCP 設定面板的初始化](https://www.librechat.ai/videos/mcp_settings_init.mp4)

初始化失敗時，現在會區分：伺服器無法連線、缺少 `customUserVars`、OAuth 連線必須重新驗證，以及一般的初始化失敗。重試前，依訊息中列出的缺少變數或重新驗證動作處理;這些情況不再需要移除伺服器再重新加入。

被動的目錄載入會合併 OAuth 探索的嘗試，並在失敗後逐步退避，所以中斷的整合不會每個請求都重試探索。憑證的變更會在副本之間依世代隔離，防止較舊的探索結果覆蓋較新的驗證。維運者可以在 [`mcpSettings.catalogRecovery`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/mcp_settings#catalogrecovery) 調整有界的復原政策;預設值適合大多數部署。

如果某個 Agent 明確預期要有 MCP 工具，但執行開始時一個都無法解析,LibreChat 會讓這次執行失敗，並提供連線與存取的指引，而不是默默地在沒有那些工具的情況下執行。

會送出 `notifications/tools/list_changed` 的 MCP 伺服器，不必重新啟動 LibreChat 就能更新它的工具目錄。LibreChat 從即時連線取得目前的清單，發布新增的工具，並停止宣告伺服器已移除的工具。重新連線也會在連線被視為就緒之前同步目錄。受管理的快照重新整理與冷伺服器的探索，共用一個整個程序的三個操作閘門。一旦被接受，每個操作仍受它的工具清單或每個伺服器的探索期限限制(包括任何較短的 `initTimeout`),所以緩慢的目錄工作無法無限期佔住一個名額。

對 Streamable HTTP 伺服器，當伺服器仍持有舊工作階段過時的獨立 SSE 串流時，重新連線可能短暫回傳 HTTP `409`。LibreChat 把這視為暫時的狀況，拆除過時的工作階段，並自動重建連線;復原成功時，維運者不需要做任何事。如果重建的連線也失敗,LibreChat 會繼續顯示底層的連線錯誤。

LibreChat 依解析後的 `Content-Type` 媒體類型，而不是子字串比對，來分類 Streamable HTTP 的回應。參數無法讓非 SSE 的回應看起來像 `text/event-stream`,所以回應大小的錯誤會繼續走正確的 SSE 或非 SSE 處理路徑。

### MCP Settings 面板的顯示條件(MCP Settings Panel Visibility)

當 LibreChat 偵測到 MCP 伺服器在初始化時可能需要使用者介入，MCP Settings 面板就會出現在右側的側邊欄。任何已設定的伺服器符合下列條件之一時，面板就會顯示:

- **自訂使用者變數**:伺服器定義了 `customUserVars`,其中可能包含使用者提供的憑證
- **OAuth 驗證**:伺服器在啟動時被偵測到需要 OAuth 驗證
- **手動初始化**:伺服器設定了 `startup: false`,需要手動初始化

## 伺服器傳輸方式(Server Transports)

MCP 伺服器可以設定使用不同的傳輸機制:

**STDIO 伺服器**

- 適合本機、單一使用者的環境
- 無法擴展到遠端或雲端部署
- 內附的 MCP SDK 限制每一則 STDIO 訊息最大 10 MB。單一結果更大時，傳輸會因錯誤而關閉;這個限制和工作階段或串流的總大小是兩回事。

**Server-Sent Events(SSE)伺服器**

- 遠端的傳輸機制，但不建議用於正式環境

**Streamable HTTP 伺服器**

- 用 HTTP POST 傳送訊息，並支援串流回應
- 作為獨立的程序運作，可以處理多個用戶端連線
- 同時支援基本請求與透過 Server-Sent Events(SSE)的串流
- 比舊的 HTTP+SSE 傳輸效能更好
- 支援適當的多使用者伺服器設定

**在正式環境中**,只建議使用[「Streamable HTTP」傳輸](https://modelcontextprotocol.io/specification/draft/basic/transports/streamable-http)的 MCP 伺服器。不同於維持長時間連線的 SSE,Streamable HTTP 提供無狀態的選項，更適合可擴展的多使用者部署。

LibreChat 走在實作彈性、可擴展的 MCP 伺服器整合的前端，支援多樣的使用情境，幫助你打造明日的 AI 工作流程。

---

**準備好擴充你的 AI 能力了嗎?** 從設定你的第一個 MCP 伺服器開始，發掘 LibreChat 如何連接你的組織需要的幾乎任何工具或服務。

## References

- [MCP(官方文件)](https://www.librechat.ai/docs/features/mcp)
