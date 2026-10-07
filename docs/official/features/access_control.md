# 存取控制(Access Control)

LibreChat 的細緻授權系統:在使用者、群組、角色與整個實例四個層級,控制誰能使用、分享、編輯與管理 Agent、提示詞、MCP 伺服器與其他資源。

## 細緻的存取控制

LibreChat 在驗證(authentication)之上,內建一套完整的授權系統。存取不是「全有或全無」:應用裡每個可分享的實體(Agent、提示詞、MCP 伺服器、遠端 Agent、檔案、對話)都有各自的存取控制清單(ACL),每個功能也能針對**使用者**、**群組**、**角色**或**公開**,獨立地啟用或限制。

這一頁說明各部分如何組合在一起,讓你可以依組織的需求建立權限模型:從大家自由分享的小團隊,到有同步 Entra ID 群組、自訂角色與委派管理員的企業部署。

> **管理面板(Admin Panel)**
> 專用的 [**LibreChat Admin Panel**](https://www.librechat.ai/docs/features/admin_panel) 是即將推出的介面,用來管理 [v0.8.5](https://www.librechat.ai/changelog/v0.8.5) 引入的使用者、群組、角色、自訂權限設定檔與全系統授權(system-wide grants)。這一頁記載的是底層模型,目前在 LibreChat 本身就可以使用。

## 存取模型總覽

LibreChat 的授權有三個彼此獨立、再組合起來的層次:

| 層次 | 範圍 | 控制什麼 |
|---|---|---|
| **功能權限(Feature Permissions)** | 依角色(USER、ADMIN、自訂) | 主體(principal)能不能對某一類功能(Agent、提示詞、MCP 伺服器、記憶、網頁搜尋等)_使用_、_建立_、_分享_或_公開分享_。在 `librechat.yaml` 或管理面板設定。 |
| **資源 ACL(Resource ACLs)** | 依單一資源 | 誰能檢視、編輯、刪除或再分享某一個特定的 Agent、提示詞、MCP 伺服器等。由資源擁有者透過應用內的分享對話框管理。 |
| **系統授權(System Grants)** | 整個平台 | 管理能力(例如 `manage:users`、`manage:roles`、`read:usage`)。管理面板使用。 |

三者都針對同樣四種主體類型來評估:

- **User(使用者)**:一個個別的 LibreChat 帳號
- **Group(群組)**:一組使用者(本機建立,或從 Entra ID 同步)
- **Role(角色)**:一個有名稱的權限設定檔(例如 `USER`、`ADMIN`,或任何自訂角色)
- **Public(公開)**:實例上每一位已驗證的使用者

## 第 1 層:功能權限(依角色)

功能層級的權限,是替某個角色把應用的整個能力關起來或打開。它們回答的是這類問題:_「這個角色的使用者到底能不能建立 Agent?」_、_「他們可以公開分享提示詞嗎?」_、_「他們能呼叫程式碼直譯器嗎?」_。

### 內建的系統角色

LibreChat 內建兩個一直存在、不能刪除的系統角色:

- **`ADMIN`**:指派給無租戶範圍(unscoped)的單一租戶部署中第一個註冊的帳號。有租戶範圍的部署必須透過可信任的管理流程來建立管理員。管理員可以看到每一個資源、修改任何設定、進入管理面板,並設定平台層級的行為。
- **`USER`**:指派給每個新帳號的預設角色。

管理員可以手動提升,方法是更新 MongoDB 裡的使用者文件,見[管理員控制(Administrator Controls)](https://www.librechat.ai/docs/features/agents#administrator-controls)。

### 權限類型

每個角色持有一張「**權限類型 × 動作**」的矩陣:

| 權限類型 | 可用的動作 |
|---|---|
| `AGENTS` | `USE`、`CREATE`、`SHARE`、`SHARE_PUBLIC` |
| `PROMPTS` | `USE`、`CREATE`、`SHARE`、`SHARE_PUBLIC` |
| `MCP_SERVERS` | `USE`、`CREATE`、`SHARE`、`SHARE_PUBLIC`、`CONFIGURE_OBO` |
| `REMOTE_AGENTS` | `USE`、`CREATE`、`SHARE`、`SHARE_PUBLIC` |
| `SKILLS` | `USE`、`CREATE`、`SHARE`、`SHARE_PUBLIC` |
| `SHARED_LINKS` | `CREATE`、`SHARE`、`SHARE_PUBLIC` |
| `SCHEDULES` | `USE`、`CREATE` |
| `MEMORIES` | `USE`、`CREATE`、`UPDATE`、`READ`、`OPT_OUT` |
| `BOOKMARKS` | `USE` |
| `MULTI_CONVO` | `USE` |
| `TEMPORARY_CHAT` | `USE` |
| `RUN_CODE` | `USE` |
| `WEB_SEARCH` | `USE` |
| `FILE_SEARCH` | `USE` |
| `FILE_CITATIONS` | `USE` |
| `MARKETPLACE` | `USE` |
| `PEOPLE_PICKER` | `VIEW_USERS`、`VIEW_GROUPS`、`VIEW_ROLES` |

`SHARE` 與 `SHARE_PUBLIC` 的差別很重要:你可以允許某個角色把 Agent 分享給_特定_使用者或群組(`SHARE`),卻不讓他們把 Agent 開放給實例上的_所有人_(`SHARE_PUBLIC`)。

### 設定功能權限

建議管理功能權限的方式是 [**LibreChat Admin Panel**](https://www.librechat.ai/docs/features/admin_panel),它直接編輯每個角色(包含你建立的自訂角色)上的權限矩陣。變更不需要重新部署 LibreChat 就會生效,並且只套用在你想修改的那個角色,而不是全域的 `USER` 預設值。

> **舊方式:`librechat.yaml` 的 `interface` 區塊**
> `librechat.yaml` 的 [`interface` 區塊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface)仍然可以在啟動時為預設的 `USER` 角色寫入權限,對於初始化一個全新的實例、或完全以檔案驅動的部署仍然有用。不過它只針對 `USER` 角色,無法表達自訂角色之間的差異。長期的權限管理,建議使用管理面板。

### 自訂角色

除了 `USER` 與 `ADMIN`,管理員可以建立**自訂角色**,各自擁有自己的功能權限矩陣(v0.8.5 引入,見 [#12528](https://github.com/LibreChat-AI/LibreChat/pull/12528))。一位使用者可以同時持有多個角色,他的有效權限是所持有所有角色的聯集。自訂角色在管理面板管理。

### 依角色與群組的設定覆寫

除了功能開關,v0.8.5 還引入了**以資料庫為基礎的設定覆寫(configuration override)**系統([#12354](https://github.com/LibreChat-AI/LibreChat/pull/12354))。你可以替特定的群組或角色指定一份_不同的 `librechat.yaml` 風格設定_。例如,「Research」群組可以比預設多出額外的端點、更高的遞迴上限,以及不同的 Agent 功能。覆寫在登入時解析,疊加在基礎設定之上。

## 第 2 層:資源 ACL(依實體分享)

LibreChat 裡每個可分享的資源都有自己的存取控制清單,獨立於依角色的權限。擁有 `SHARE` 權限的個別使用者,就是靠它選擇_誰_可以存取_他的_ Agent、提示詞或 MCP 伺服器。

### 資源類型

資源 ACL 目前適用於:

- **Agent**(`agent`)
- **提示詞 / 提示詞群組(Prompt Groups)**(`promptGroup`)
- **MCP 伺服器**(`mcpServer`)
- **技能(Skills)**(`skill`),見[技能](https://www.librechat.ai/docs/features/skills)
- **遠端 Agent**(`remoteAgent`),給 [Agents API](https://www.librechat.ai/docs/features/agents_api) 使用
- **檔案**(`file`),通常繼承自使用它們的資源
- **專案(Projects)**(`project`),支援繼承,所以分享給專案的資源會自動繼承 ACL

### 存取角色(權限預設組)

分享時不會把原始的權限位元暴露給終端使用者,而是每種資源類型提供三個有名稱的角色:

| 角色 | 權限位元 | 被授權者能做什麼 |
|---|---|---|
| **Viewer(檢視者)** | `VIEW`(`0b0001`) | 使用 / 與資源互動 |
| **Editor(編輯者)** | `VIEW` + `EDIT`(`0b0011`) | 檢視並修改資源的設定、指示、工具、檔案 |
| **Owner(擁有者)** | `VIEW` + `EDIT` + `DELETE` + `SHARE`(`0b1111`) | 完全控制:編輯、刪除,並再分享給其他人 |

在底層,權限以位元遮罩(`permBits`)存在每一組(資源、主體)上;超集會自動處理,所以授予 Editor 就隱含了 Viewer。

### 從介面授予存取

1. 開啟資源(Agent 建構器、提示詞表單、MCP 伺服器設定等)
2. 點 **Share** 按鈕(當你是擁有者、管理員,或被授予 `SHARE` 時才看得到)
3. 在分享對話框中:
   - 用人員選擇器搜尋要加入的**使用者**、**群組**或**角色**
   - 為每個主體選一個存取角色(Viewer / Editor / Owner)
   - 可以選擇性地切換 **Public access**,讓資源對實例上的所有人可見(需要 `SHARE_PUBLIC` 功能權限)
4. 儲存。被授權者在下次重新整理後就會看到這個資源。

> **防止資料外洩**
> Editor 與 Owner 的被授權者,能看到資源上設定的所有東西,包括系統指示、附加的檔案與工具。任何 Agent 也可能透過對話輸出洩漏附加的資料,所以在授予編輯權限或公開 Agent 之前,請確認你的指示足以抵禦提示詞注入(prompt injection)。

### 被授權者看到什麼

- **Viewer** 會在相關的選擇器(例如 Agent 下拉選單)中,看到一個可直接使用的項目。他們不能開啟建構器、看原始指示或修改設定。
- **Editor** 可以開啟資源的設定並修改,但不能刪除或再分享。
- **Owner** 的介面和原作者相同,可以自由刪除與再分享。
- **原作者**不論 ACL 狀態如何,永遠保有完全控制;管理員可以管理實例上的任何資源。

### 專案繼承

權限可以繼承自上層的**專案(project)**。當一筆 ACL 是繼承來的,`inheritedFrom` 連結會指回來源。LibreChat 的「Global」專案就是靠這個運作:加進全域專案的資源,會對所有使用者可用,不需要為每個主體各建一筆項目。

## 第 3 層:系統授權(管理能力)

系統授權是另一張獨立的授權表,用於**管理員層級的能力**,回答像「_這位使用者能進管理面板嗎?_」或「_這個群組能全域管理 MCP 伺服器嗎?_」這樣的問題。它們一定限定在一個主體(使用者、群組或角色)與一個能力字串之上。

標準的能力包括:

| 能力 | 用途 |
|---|---|
| `access:admin` | 能進入管理面板 |
| `read:users` / `manage:users` | 檢視 / 修改使用者帳號 |
| `read:groups` / `manage:groups` | 檢視 / 修改群組 |
| `read:roles` / `manage:roles` | 檢視 / 修改自訂角色 |
| `read:configs` / `manage:configs` | 檢視 / 修改所有系統設定 |
| `read:configs:<section>` / `manage:configs:<section>` | 檢視 / 修改單一個頂層設定區段 |
| `assign:configs:{user\|group\|role}` | 把設定覆寫設定檔指派給主體 |
| `read:usage` | 檢視平台用量與遙測 |
| `read:agents` / `manage:agents` | 檢視 / 審核實例上的每一個 Agent |
| `read:prompts` / `manage:prompts` | 檢視 / 審核每一則提示詞 |
| `manage:mcpservers` | 全域管理 MCP 伺服器 |

管理(manage)能力隱含對應的讀取(read)能力(例如持有 `manage:users` 會自動取得 `read:users`)。這也適用於設定區段:`manage:configs:endpoints` 滿足 `read:configs:endpoints`。只有區段範圍設定權限的使用者,收到的管理設定回應會被過濾成他能讀取的區段;沒有任何設定讀取授權的使用者會收到 `403`。

`SystemRoles.ADMIN` 的使用者隱含持有所有能力;授權讓你可以把一部分管理權力**委派**給非管理員的主體,而不必讓他們成為完整的管理員。進入管理介面本身仍然需要 `access:admin`。

系統授權透過管理面板發放與撤銷。

## 深入主體(Principals)

### 使用者

標準的 LibreChat 帳號。使用者可以是**本機**的(電子郵件與密碼),或**聯合**的(OAuth2、OIDC、SAML、LDAP)。聯合的使用者可以比對到外部身分(`idOnTheSource`);對 Entra ID 而言這是 OID,也是啟用群組同步的關鍵。

### 群組

群組是一組有名稱的使用者。LibreChat 支援兩種來源:

- **本機群組**:從管理面板建立與管理,或直接在資料庫中建立。成員是 LibreChat 的使用者 ID。
- **Entra ID(Azure AD)群組**:使用者透過 Azure OIDC 登入、且啟用 [token 重用](https://www.librechat.ai/docs/configuration/authentication/OAuth2-OIDC/token-reuse)時,從 Microsoft Graph 同步。每個同步的群組把它的 Entra Object ID 存成 `idOnTheSource`,讓 LibreChat 與租戶的成員關係保持同步。

群組可以出現在任何 ACL、`peoplePicker` 搜尋,以及設定覆寫或系統授權的主體目標中。一個資源分享給 500 人的群組,只是一筆 ACL 項目(不是 500 筆),Entra 裡的成員變動會在下次登入時自動傳遞。

### ACL 主體快取調校

LibreChat 預設會把用來解析使用者 ACL 主體的群組 ID 快取五分鐘。快取依租戶與成員身分分區,群組成員變動會讓受影響的項目失效。它不會快取使用者的角色,也不快取 `idOnTheSource` 的查詢,所以這些值仍然從目前請求的使用者或資料庫解析。

```bash
# 群組成員快取的存活時間;0 代表停用快取
USER_PRINCIPALS_CACHE_TTL_MS=300000

# 僅限使用 Redis 的部署:讓多個副本之間不重複建立冷快取
USER_PRINCIPALS_LOCK_TTL_MS=5000
USER_PRINCIPALS_LOCK_WAIT_MS=5000
```

當主體快取以 Redis 為後端時,鎖的設定可以避免多個副本同時重建同一筆冷項目。把 `USER_PRINCIPALS_LOCK_TTL_MS=0` 只會停用建立時的鎖;共用的快取儲存與跨程序的失效機制仍然有效。快取與鎖的失敗會退回資料庫,而不會阻擋權限檢查。

### 角色

任何系統角色或自訂角色都可以當主體。把 Agent 分享給一個角色(例如 `SupportEngineers`),目前持有該角色的每位使用者都能存取,不需要逐一列出個人。對於角色式分享只屬於管理員事務的環境,可以用 [`interface.peoplePicker.roles`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#peoplepicker) 把角色從人員選擇器中隱藏。

### 公開(Public)

一個特殊的主體,符合每一位已驗證的使用者。公開授權只有在授權的使用者持有該資源類型的 `SHARE_PUBLIC` 功能權限時才允許。

## 人員選擇器的可見性

人員選擇器(分享對話框裡的搜尋框)可以在實例層級設限,隱藏和你的部署無關的主體類型:

```yaml
interface:
  peoplePicker:
    users: true
    groups: true
    roles: false
```

這只影響_搜尋介面_;被隱藏的主體類型的既有 ACL 項目仍然有效,並照常執行。

## 從 ACL 之前的版本遷移

v0.8.0-rc3 之前的版本使用較簡單的擁有權模型。升級時需要執行 ACL 遷移,讓既有的 Agent 與提示詞仍然可存取:

**試跑(預覽變更):**

```bash
npm run migrate:agent-permissions:dry-run
npm run migrate:prompt-permissions:dry-run
```

**執行:**

```bash
npm run migrate:agent-permissions
npm run migrate:prompt-permissions
```

Docker 的做法與批次大小選項,見 [Agents 遷移指南](https://www.librechat.ai/docs/features/agents#migration-required-v080-rc3)。

## 相關文件

- [Agents:分享與權限](https://www.librechat.ai/docs/features/agents#sharing-and-permissions)
- [介面設定(功能權限)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface)
- [驗證(Authentication)](https://www.librechat.ai/docs/features/authentication)
- [OpenID Connect token 重用(Entra ID 群組同步需要)](https://www.librechat.ai/docs/configuration/authentication/OAuth2-OIDC/token-reuse)
- [Azure / Entra ID OAuth2](https://www.librechat.ai/docs/configuration/authentication/OAuth2-OIDC/azure)
- [SharePoint 整合](https://www.librechat.ai/docs/configuration/sharepoint)
- [Agents API(遠端 Agent)](https://www.librechat.ai/docs/features/agents_api)
- [LibreChat 管理面板](https://www.librechat.ai/docs/features/admin_panel)

## References

- [Access Control(官方文件)](https://www.librechat.ai/docs/features/access_control)
