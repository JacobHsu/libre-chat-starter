# 管理面板(Admin Panel)

獨立的網頁介面，用來管理 LibreChat 的使用者、群組、角色、設定覆寫與系統授權，不必手動編輯 `librechat.yaml`。

**LibreChat Admin Panel** 是 LibreChat 獨立的瀏覽器管理介面。它連到和 LibreChat 相同的資料庫，為[細緻存取控制](access_control.md)背後的管理工作提供圖形介面：使用者與群組管理、角色管理、依角色或群組範圍的設定覆寫，以及系統層級的能力授權。

> **狀態：預覽版**
>
> 管理面板現在可以試用，它是即將推出的管理介面，建立在 [LibreChat v0.8.5](https://www.librechat.ai/changelog/v0.8.5) 引入的管理 API 之上。原始碼、問題回報與發行版本在 [github.com/ClickHouse/librechat-admin-panel](https://github.com/ClickHouse/librechat-admin-panel)。

## 它做什麼

管理面板是一個薄用戶端：所有資料都在 LibreChat 的資料庫裡，每個動作都透過 LibreChat API 伺服器上有版本的 `/api/admin/*` 端點。它讓管理員在同一個地方:

- **管理設定**:透過依結構定義(schema)動態產生的表單，檢視和編輯 LibreChat 的每一項設定。設定結構新增的欄位會自動出現，不需要發行新版管理面板。
- **套用個別主體的覆寫**:把設定覆寫限定在特定角色或群組，以優先順序決定每個使用者登入時看到的最終值。
- **管理使用者**:列出、搜尋與檢視實例上的每個帳號。
- **管理群組**:建立和刪除群組、新增或移除成員，並把群組當成 ACL 與覆寫中的一級主體(principal)使用。
- **管理角色**:在內建的 `USER` / `ADMIN` 之外建立自訂角色，編輯它們的功能權限矩陣，並把使用者指派到角色。
- **發出系統授權**:把管理能力(例如 `manage:users`、`read:usage`、`manage:mcpservers`)委派給特定的使用者、群組或角色，而不必讓他們成為完整的管理員。
- **驗證身分**:用 LibreChat 的本機管理員帳號登入，或在 LibreChat 實例啟用時，透過 OpenID SSO / SAML / 支援的 OAuth 提供者登入。

背後的權限模型(主體、資源 ACL、能力，以及各層怎麼組合)，見[存取控制](access_control.md)頁面。

## 架構

```
┌──────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Admin Panel     │ ───────▶│  LibreChat API   │ ───────▶│   MongoDB    │
│  (Bun + Vite)    │  HTTPS  │  /api/admin/*    │         │  (shared DB) │
└──────────────────┘         └──────────────────┘         └──────────────┘
       │                             │
       │ OAuth/OIDC/SAML redirect    │ Verifies admin access
       └─────────────────────────────┘
```

管理面板以獨立的服務執行，不和 LibreChat 共用程序。管理能力在 LibreChat 這一端驗證，依據是 `access:admin` 系統授權或 `SystemRoles.ADMIN` 角色，所以管理面板無法自行取得不該有的權限。

LibreChat 提供的管理 API 如下:

| 掛載位置 | 用途 |
| --- | --- |
| `POST /api/admin/login`、`/oauth/*` | 管理員專用的驗證端點(本機與 SSO) |
| `GET /api/admin/verify` | 驗證管理員 session |
| `/api/admin/users` | 使用者列表與搜尋 |
| `/api/admin/groups` | 群組的新增、讀取、修改、刪除與成員管理 |
| `/api/admin/roles` | 自訂角色的新增、讀取、修改、刪除、權限編輯與成員管理 |
| `/api/admin/grants` | 系統能力授權(指派、撤銷、列出) |
| `/api/admin/config` | 基礎設定與個別主體的設定覆寫 |

## 開始使用

### 前置需求

- 執行中的 LibreChat 實例，版本 **v0.8.5 以上**(更早的版本沒有管理 API)
- 管理面板的容器或主機能連到 LibreChat API
- LibreChat 上的管理員帳號：在未分租戶的單一租戶部署中第一個註冊的使用者(自動成為管理員)、在 Mongo 中設定了 `role: 'ADMIN'` 的使用者，或被授予 `access:admin` 能力的主體。分租戶的部署必須透過受信任的管理流程佈建管理員。

### 與 LibreChat 一起部署(建議)

如果你用官方的 [`docker-compose.yml`](https://github.com/LibreChat-AI/LibreChat/blob/main/docker-compose.yml) 或 [`deploy-compose.yml`](https://github.com/LibreChat-AI/LibreChat/blob/main/deploy-compose.yml) 執行 LibreChat,管理面板就是其中一個服務，會和 LibreChat 一起自動啟動，不需要另外部署。

| Compose 檔 | 管理面板網址 | 提供方式 |
| --- | --- | --- |
| `docker-compose.yml`(預設) | `http://localhost:3000` | 發布在主機埠上(`ADMIN_PANEL_PORT`,預設 `3000`) |
| `deploy-compose.yml` | `http://admin.localhost` | 透過內附的 nginx 反向代理，以子網域提供 |

啟動前，先在 LibreChat 的 `.env` 設定管理面板的 session 密鑰;compose 檔會把它傳給管理面板，作為它的 `SESSION_SECRET`:

```bash
# .env
# 至少 32 個字元。產生方式:openssl rand -hex 32
ADMIN_PANEL_SESSION_SECRET=replace-with-a-32-char-random-string

# 選用:預設 docker-compose 的主機埠
# ADMIN_PANEL_PORT=3000

# 選用:管理面板以 HTTPS 提供時設為 true
# ADMIN_PANEL_SESSION_COOKIE_SECURE=false
```

其餘的連接由 compose 檔自動完成:`API_SERVER_URL` 指向 `api` 服務,`VITE_API_BASE_URL` 跟著 `DOMAIN_CLIENT`(給瀏覽器端的 OAuth 轉址用),並設定 `ADMIN_PANEL_URL`,讓 LibreChat 在 SSO 之後把管理員導回管理面板。不想要它的話，移除 `admin-panel` 服務，或用 Compose 的 [`profiles`](https://docs.docker.com/compose/how-tos/profiles/) 把它隔開。

> **在真實網域使用 admin.localhost**
>
> 現代瀏覽器會把 `*.localhost`(包括 `admin.localhost`)解析到 `127.0.0.1`,所以 deploy-compose 的網址不用改 hosts 檔就能用。若使用真實網域，把 DNS 紀錄指向主機，更新 `client/nginx.conf` 中 `admin.localhost` 的 `server_name`,並把 `ADMIN_PANEL_URL` 設成相符的值。

### 獨立部署(分開部署)

要讓管理面板獨立運作，指向在別處執行的 LibreChat 實例，使用 GHCR 上發布的映像檔:

```bash
# 1. 建立 env 檔
cp .env.example .env

# 2. 編輯 .env,至少設定:
#    SESSION_SECRET=<隨機字串，至少 32 個字元>
#    VITE_API_BASE_URL=http://host.docker.internal:3080

# 3. 啟動
docker compose up -d   # http://localhost:3000
docker compose down    # 停止
```

用 `docker run` 獨立執行:

```bash
docker run -p 3000:3000 \
  --add-host=host.docker.internal:host-gateway \
  -e SESSION_SECRET=replace-with-32-char-random-string \
  -e VITE_API_BASE_URL=http://host.docker.internal:3080 \
  ghcr.io/clickhouse/librechat-admin-panel:latest
```

> **Docker 網路**
>
> 在容器裡,`localhost` 指的是容器本身，不是你的主機。LibreChat 跑在同一台主機上時，把 `VITE_API_BASE_URL` 指向 `http://host.docker.internal:3080`(Linux 要加 `--add-host=host.docker.internal:host-gateway`)。正式環境請使用 LibreChat API 的公開或內部 DNS 名稱。

### 在本機以開發模式執行

```bash
git clone https://github.com/ClickHouse/librechat-admin-panel.git
cd librechat-admin-panel
cp .env.example .env    # 然後編輯
bun install
bun dev                 # http://localhost:3000
```

## 環境變數

| 變數 | 必填 | 預設 | 說明 |
| --- | --- | --- | --- |
| `SESSION_SECRET` | 正式環境**必填** | 執行 `bun dev` 時有寫死的開發用預設值;Docker 映像檔**沒有預設值** | Session 加密金鑰。至少 32 個字元。 |
| `VITE_API_BASE_URL` | Docker 中**必填** | `http://localhost:3080`(只限本機開發) | 瀏覽器端看到的 LibreChat API 伺服器網址，用於 OAuth 轉址。 |
| `API_SERVER_URL` | 否 | 退回使用 `VITE_API_BASE_URL` | 伺服器端呼叫 LibreChat API 用的網址。管理面板伺服器連到 LibreChat 的網址和瀏覽器不同時很有用(例如 Kubernetes 內部服務 vs. 公開主機名稱)。 |
| `PORT` | 否 | `3000` | 管理面板監聽的埠。 |
| `ADMIN_PANEL_SESSION_SECRET` | **必填** | 未設定 | LibreChat 端的變數，對應到內附 admin-panel 服務的 `SESSION_SECRET`。啟動管理面板前，產生一個至少 32 個字元的唯一值。 |
| `ADMIN_PANEL_PORT` | 否 | `3000` | 預設 `docker-compose.yml` 中，內附 admin-panel 服務對外的主機埠。 |
| `ADMIN_SSO_ONLY` | 否 | `false` | 隱藏 email / 密碼表單，強制只能用 SSO 登入。 |
| `ADMIN_SESSION_IDLE_TIMEOUT_MS` | 否 | `1800000`(30 分鐘) | Session 閒置逾時，單位毫秒。 |
| `SESSION_COOKIE_SECURE` | 否 | 正式環境為 `true` | Session cookie 是否要求 HTTPS。 |
| `ADMIN_PANEL_METRICS_SECRET` | 否 | 未設定 | 抓取 `/metrics` Prometheus 端點需要的 Bearer token。未設定或不相符時，端點回 `401`。 |

在 LibreChat 內附的 Docker 組合中，管理面板以 `admin-panel` 服務執行。預設的 `docker-compose.yml` 在 `ADMIN_PANEL_PORT` 對外提供它;`deploy-compose.yml` 透過 nginx 在 `http://admin.localhost` 提供，並為 API 服務設定 `ADMIN_PANEL_URL`。沒有設定 `ADMIN_PANEL_SESSION_SECRET` 時，管理面板拒絕啟動。

### LibreChat 的轉址網址

管理面板和 LibreChat 放在不同網址時，在 LibreChat API 的環境設定 `ADMIN_PANEL_URL`。使用管理面板對外的基礎網址(包含路徑前綴)，結尾不要加斜線:

```bash
# .env
ADMIN_PANEL_URL=https://admin.example.com/admin
```

設定後,LibreChat 也會在 **Settings -> General** 對管理員顯示 **Admin Panel** 連結。非管理員看不到這個連結。

Helm 部署時，在 values 檔設定 `librechat.adminPanelUrl`。chart 會把它轉成 `ADMIN_PANEL_URL`,供 LibreChat 的管理員 OAuth 流程使用:

```yaml
# values.yaml
librechat:
  adminPanelUrl: https://admin.example.com/admin
```

使用 OpenID SSO 時，在你的身分提供者註冊 `${DOMAIN_SERVER}/api/admin/oauth/openid/callback`。

### 快取控制

這些和 LibreChat 的快取環境變數相對應。`ADMIN_PANEL_*` 的版本優先，未設定時退回使用 LibreChat 共用的同名變數。

| 變數 | 用途 |
| --- | --- |
| `STATIC_CACHE_MAX_AGE` / `ADMIN_PANEL_STATIC_CACHE_MAX_AGE` | `/assets/` 中帶雜湊檔名資源的瀏覽器 `max-age`,單位秒(預設 172800 = 2 天)。 |
| `STATIC_CACHE_S_MAX_AGE` / `ADMIN_PANEL_STATIC_CACHE_S_MAX_AGE` | CDN 的 `s-maxage`,單位秒(預設 86400 = 1 天)。 |
| `INDEX_CACHE_CONTROL` / `ADMIN_PANEL_INDEX_CACHE_CONTROL` | HTML 首頁回應的 `Cache-Control` 標頭。 |
| `INDEX_PRAGMA` / `ADMIN_PANEL_INDEX_PRAGMA` | HTML 首頁回應的 `Pragma` 標頭。 |
| `INDEX_EXPIRES` / `ADMIN_PANEL_INDEX_EXPIRES` | HTML 首頁回應的 `Expires` 標頭。 |

## 驗證身分

管理面板沿用 LibreChat 的驗證機制，自己沒有使用者資料庫。支援兩種登入方式:

- **本機帳號**:任何通過管理存取檢查的 LibreChat 使用者，用帳號密碼登入。
- **單一登入(SSO)**:LibreChat 實例上已設定的 OpenID Connect、SAML 與社群 OAuth 提供者。設定 `ADMIN_SSO_ONLY=true` 可以完全隱藏密碼表單。

管理存取權限由 LibreChat 在伺服器端對每個請求驗證。帳號必須符合以下其一:

1. 在 MongoDB 中有 `role: 'ADMIN'`,**或**
2. 擁有 `access:admin` 系統授權(由管理面板本身指派給其他主體;見[系統授權](access_control.md#第-3-層系統授權管理能力))。

Session 以 cookie 保存，用 `SESSION_SECRET` 加密，依 `ADMIN_SESSION_IDLE_TIMEOUT_MS` 閒置逾時。

Google 管理員 SSO 會要求離線存取與同意，讓管理面板能更新過期的 LibreChat 管理員 token,而不必立刻重新登入。要同時設定 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`,並向 Google 註冊 `${DOMAIN_SERVER}/api/admin/oauth/google/callback`。每次更新都會重新檢查帳號的提供者身分、封鎖狀態、允許的 email 網域、租戶，以及目前的管理存取權限;失去權限時，管理 session 就會結束。

## 設定管理

管理面板依設定結構，把 LibreChat 的設定呈現成動態表單。這有兩個好處:

- **向前相容**:LibreChat 推出新的設定欄位時，管理面板會從結構定義自動取得，不需要升級或重新部署管理面板。
- **分層覆寫**:基礎設定(來自 `librechat.yaml`)可以被限定在角色或群組的個別主體覆寫蓋過。使用者登入時，覆寫會依優先順序解析，再合併到基礎設定上，產生這個使用者看到的有效設定。

> **以程序執行的 MCP 伺服器留在 YAML**
>
> 使用 `type: stdio` 或程序相關欄位(例如 `command`、`args`、`env`、`cwd`、`stderr`)的 MCP 伺服器，由維運者負責。只能在 `librechat.yaml` 設定;管理 API 會拒絕建立或修改它們，覆寫也無法取代或移除它們。遠端 MCP 伺服器的設定，仍然可以透過一般的覆寫系統調整。

> **Langfuse 閘道標頭留在 YAML**
>
> 部署層級的 `langfuse.headers` 可能包含代理伺服器的憑證，不屬於存在 Mongo 的設定。請在 `librechat.yaml` 設定;管理 API 會拒絕整個 map 以及個別的標頭路徑。見 [Authenticated Proxies and Gateways](https://www.librechat.ai/docs/configuration/langfuse#authenticated-proxies-and-gateways)。

這就是 LibreChat [存在資料庫、依個別主體的設定覆寫系統](https://github.com/LibreChat-AI/LibreChat/pull/12354)背後的介面。典型的用法:

- 讓「Research」群組有較高的 `recursionLimit` 和額外的端點
- 讓「FinanceAdmins」角色管理遠端 MCP 伺服器，一般使用者只能使用
- 對外部承包商的群組，套用較嚴格的 `interface` 權限

管理員也可以使用選擇性開啟的 [Admin Insights](https://www.librechat.ai/docs/features/insights) 儀表板，檢視限定租戶範圍的 MongoDB 活動。設定 `ENABLE_INSIGHTS=true`,再把 `access:admin` 和 `read:insights` 都授予一個具有 `ADMIN` 角色的帳號。

### 覆寫的驗證

覆寫的寫入(`PUT /api/admin/config/:principalType/:principalId` 與 `PATCH .../fields`)會用和 `librechat.yaml` 相同的結構驗證，並套用在部署的基礎設定之上。會產生無效設定的寫入，以 HTTP 400 拒絕，什麼都不儲存:

```json
{
  "error": "Invalid config override",
  "code": "CONFIG_OVERRIDE_INVALID",
  "issues": [{ "path": "interface.fileSearch", "code": "invalid_type" }]
}
```

每個問題只帶點號路徑和固定的代碼(結構驗證的代碼，例如 `invalid_type`,或 `missing_merge_key`、`duplicate_merge_key`、`indexed_merge_key_write`、`union_dropped_key`、`invalid_document`),絕不帶送出的值。欄位修補只有在它碰到或造成問題時才會被拒絕，所以同一個覆寫中其他地方較舊的無效值，不會擋住它。

已儲存但變成無效的覆寫(例如升級後結構變得更嚴格)，不會造成致命錯誤。解析設定時，無效的欄位會被丟掉，改用它底下的值(通常是 `librechat.yaml` 的基礎值)，伺服器會為每個欄位記錄一筆警告:

```text
[mergeConfigOverrides] Ignoring invalid override "<path>" for <principalType>/<principalId> (<code>)
```

升級後檢查日誌中的這些紀錄，再到管理面板修正或移除列出的欄位。不符合[主題規則](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/theme#validation)的覆寫主題，也會同樣退回使用基礎主題。

### 依區段委派

設定的授權可以是全面的(`read:configs`、`manage:configs`),也可以只限一個最上層的區段(`read:configs:<section>`、`manage:configs:<section>`)。只能讀取某區段的人，會收到只含已授權區段的篩選後設定回應，而不是整個請求被拒絕。區段層級的管理授權，隱含同一區段的讀取權限;全面的管理權限，隱含全面的讀取權限。

例如 `read:configs:interface`、`manage:configs:endpoints`、`manage:configs:langfuse`。被委派的使用者仍然需要 `access:admin` 才能進入管理介面。對基礎設定 `__base__` 的每次建立、修補、標記刪除或刪除，都需要全面的 `manage:configs`;區段層級的管理，適用於角色、群組與使用者的覆寫。

### 儲存的機密

透過管理設定 API 寫入已登記的機密欄位時,LibreChat 會把字面值加密後儲存，只回傳伺服器產生的遮蔽預覽。目前涵蓋 Langfuse、OCR、語音、網頁搜尋、Assistants、Azure Assistants,以及每一個 `endpoints.custom[].apiKey`。之後編輯時省略機密欄位，會保留已儲存的值。

允許環境變數參照的欄位，參照會維持可讀。自訂端點的 API 金鑰也會保留 `${ENV_VAR}` 和 `user_provided` 這類值，不加密。機密處理以登記清單為準：自訂標頭或 MCP 設定這類一般 map 中的任意值，不會自動加密，所以那些地方請繼續使用環境變數參照，或該功能專用的憑證機制。

## 相關文件

- [存取控制](access_control.md):管理面板背後的權限模型
- [Interface Configuration](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface):管理面板編輯的功能開關
- [Authentication](https://www.librechat.ai/docs/features/authentication):LibreChat 的使用者驗證
- [v0.8.5 更新日誌](https://www.librechat.ai/changelog/v0.8.5):管理 API 的基礎
- [GitHub: ClickHouse/librechat-admin-panel](https://github.com/ClickHouse/librechat-admin-panel):原始碼、問題回報、發行版本

## References

- [Admin Panel(官方文件)](https://www.librechat.ai/docs/features/admin_panel)
