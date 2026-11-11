# Code Interpreter API

用 LibreChat 的 Code Interpreter API 安全地執行程式碼，並輕鬆管理檔案。

## 簡介(Introduction)

LibreChat 的 Code Interpreter API,透過簡單的 API 介面，提供安全又省事的方式來執行程式碼與管理檔案。不論你是透過 LibreChat 的 Agents 使用，還是直接整合進自己的應用程式，這個 API 都提供強大的沙箱環境，可以執行多種程式語言的程式碼。

[Code Interpreter 示範影片](https://firebasestorage.googleapis.com/v0/b/superb-reporter-407417.appspot.com/o/Sequence%2001.mp4?alt=media&token=595b0716-12f1-4516-be93-c7004a85b540)

> **開源**
>
> LibreChat 的 Code Interpreter 由 [**ClickHouse/code-interpreter**](https://github.com/ClickHouse/code-interpreter) 驅動，這是一個開源(Apache 2.0)的沙箱程式碼執行服務。自架它，再把 LibreChat 指向你自己的實例。

## 開始使用(Getting Started)

1. 部署 [code-interpreter](https://github.com/ClickHouse/code-interpreter) 服務(Docker Compose 或 Helm,見該 repository 的 README)
2. 用 `LIBRECHAT_CODE_BASEURL` 把 LibreChat 指向它
3. 為目前的開源服務設定 [LibreChat JWT 驗證](#自架的-jwt-驗證self-hosted-jwt-authentication),或為相容 API 金鑰的部署設定 `LIBRECHAT_CODE_API_KEY`
4. 想試用有狀態的 Agent 工作階段，另外部署一條 `stateful` 設定檔的 Code Interpreter 路由，並設定 `LIBRECHAT_CODE_BASEURL_STATEFUL` 或具名的 [`statefulCodeSessions.environments`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions)
5. 透過 LibreChat 的 Agents 或「Run Code」按鈕，開始安全地執行程式碼、產生檔案

## 主要功能(Key Features)

### 有狀態的程式碼工作階段(Stateful Code Sessions)

有狀態的程式碼工作階段，讓 LibreChat 的 Agent 在多次執行之間重複使用同一個 Code Interpreter 沙箱工作區。檔案、已安裝的套件與工作狀態通常會延續下來，讓反覆的分析與多步驟的檔案產生更有效率。每個 Agent 選擇一種工作區範圍:

- **User workspace(使用者工作區，建議)**:登入的使用者在所有啟用有狀態功能的 Agent 之間共用一個工作區
- **Agent + user workspace(Agent + 使用者工作區)**:每個使用者與 Agent 的組合各一個工作區
- **Conversation workspace(對話工作區)**:每個使用者與對話各一個工作區

新建立的 Agent,初始範圍來自 **Settings > Data Controls > Code execution > Default stateful workspace**。這個個人設定預設是 **User workspace**;修改它不會改變既有的 Agent,也不會啟用有狀態工作階段。部署管理員可以用 [`statefulCodeSessions.allowedEnvironments`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 限制可選的範圍。如果已存的個人預設變得不可用，新的 Agent 會使用第一個允許的範圍;已啟用、但範圍已不被允許的既有 Agent,必須重新設定才能執行。

工作區範圍和它的執行後端是兩回事。管理員設定具名的 [`statefulCodeSessions.environments`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 時,Agent Builder 會多出 **Execution environment**(執行環境)選擇器:

- **Managed(託管)**:由部署方營運的有狀態 Code API
- **Attached(附加)**:相容的 Code API 遠端橋接，把工作租給一個向外連線的 `@librechat/code` worker,例如維運者管理的 VM
- **Personal(個人)**:由有權限的使用者透過 LibreChat 設定配對、綁定擁有者的 `@librechat/code` worker
- **Deployment default(部署預設)**:被標記為預設的那一個已設定環境

> **高度實驗性**
>
> 有狀態的程式碼工作階段仍在早期實驗階段。它的行為、設定、持久性特性與底層整合都可能大幅改變。不要把目前的實作當成穩定的正式環境約定。

這個功能需要選擇開啟。在 [Agents 端點的 capabilities](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#capabilities) 啟用 `execute_code` 與 `stateful_code_sessions`,用 [`LIBRECHAT_CODE_BASEURL_STATEFUL`](https://www.librechat.ai/docs/configuration/dotenv#stateful-code-interpreter-endpoint) 或具名環境設定專用的有狀態路由，在 Agent 上啟用 Code Interpreter,再到 Advanced settings 打開 **Stateful code sessions**,選擇它的執行後端與工作區範圍。

選定的環境不存在、無法存取或不相容時，有狀態的請求會以關閉的方式失敗(fail closed);LibreChat 不會把它們送到 `LIBRECHAT_CODE_BASEURL`,也不會默默改選另一個具名後端。沒有設定具名環境時,`LIBRECHAT_CODE_BASEURL_STATEFUL` 仍然是有狀態的路由。無狀態的 Agent 繼續使用一般端點。LibreChat 也會送出 `X-CodeAPI-Expected-Profile: stateful`,所以專用服務必須宣告 `stateful` 設定檔。

有狀態與無狀態的工作階段不共用即時的工作區。有狀態的工作區隨時可能重置，不論它選的範圍是什麼。在託管的 Code Interpreter 環境中，把重要的輸出存在 `/mnt/data` 底下，除此之外不要把工作階段狀態當成持久的儲存。附加工作區是另一個由 worker 擁有的目錄;上傳的檔案預設不會放在那裡。

有狀態的 `create_file` 與 `edit_file` 呼叫寫出的檔案，會出現在助理訊息底下可展開的 **Workspace changes**(工作區變更)列。它列出這次回應中每一個變更過的路徑，並提供經過驗證的下載動作。下載時，可以的話使用 LibreChat 的持久化檔案流程，否則使用安全的 Code Interpreter 備援。這一列是寫出的輸出紀錄，不是持久的工作區快照;無狀態的輸出仍然以一般的內嵌附件顯示。

#### 附加環境與配對(Attached environments and pairing)

附加環境需要相符的實驗性 Code Interpreter 遠端橋接版本。橋接仍然是 LibreChat 經過驗證的政策、佇列與結果邊界，而 `@librechat/code` worker 從附加的機器向外連線;那台機器不需要對外開放的 worker 連入埠。LibreChat 不會預熱附加環境。

維運者可以用 `workerId` 把部署擁有的附加環境固定到一個 worker,並在 LibreChat 應該為同一條路由發出管理員配對碼時，加上 `pairing.workerId`。`pairing.tokenEnv` 指定存放橋接管理員 token 的環境變數名稱;密鑰本身絕不放在 YAML 裡。在本機回送(loopback)開發之外，配對的控制平面需要 HTTPS。

要提供自助的 worker,設定一個部署擁有的附加控制平面，加上 `pairing.allowPrincipalWorkers: true` 與 `pairing.tokenEnv`。它可以省略兩個 worker ID,只作為註冊用的控制平面存在;這樣的項目不能被選來執行，也不能成為部署預設。

有 Code Environment 管理權限的使用者，接著就可以打開 **Settings > Code environments**,替環境命名、選擇一個核准的控制平面，然後選 **Connect VM**。LibreChat 會顯示一個短期有效、只能用一次的 `librechat-code pair ...` 指令。在使用者的 VM 上執行它，再啟動 `@librechat/code`,並把 `LIBRECHAT_CODE_SANDBOX_ENDPOINT` 指向那台機器的沙箱服務。介面會列出使用者的環境，之後也可以撤銷和移除;沙箱檔案留在 VM 上。

管理員可以用 [`statefulCodeSessions.principalWorkers`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 限制註冊。省略這個區塊時，註冊預設啟用，每位使用者最多註冊五個環境。這個數量包含所有控制平面上離線的 worker。部署設定是上限：個別主體的設定可以降低或停用它，但不能提高。收緊政策不會撤銷已經註冊的機器。

個人環境綁定到經過驗證的使用者與租戶，受 Code Environment ACL 保護，只會被指派伺服器驗證過的 ID 與核准的基礎網址。LibreChat 不會把橋接管理員 token 或任意的維運者網址暴露給用戶端。移除環境時，會先撤銷它的 worker 憑證，再刪除登錄項目;刪除使用者時，也會排定同樣的撤銷與清理，並以背景協調(reconciliation)處理中斷的嘗試。選定的 worker 路由，會一致地套用到 Code Interpreter、shell、產生的檔案存取與 Programmatic Tool Calling。

使用附加工作區的 Agent,可以在選定的 worker 上列出目錄樹、讀取檔案、搜尋檔案內容、建立或編輯檔案，以及執行 Bash。檔案引用使用相對於工作區的路徑，寫出的檔案出現在回應的 **Workspace changes** 列，工具失敗時會保留 worker 有限長度的 HTTP 診斷資訊。Agent 也可以為在這個工作區建立的 commit,儲存每個 Agent 自己的 Git 名稱與 email;這些值只設定作者資訊，不提供 repository 的憑證。

在聊天中，附加工作區裡失敗的 Bash 指令會顯示結束碼、終止訊號或逾時，stderr 的樣式也和 stdout 分開。Bash 輸出怎麼顯示，見 [Activity Groups](https://www.librechat.ai/docs/features/agents#activity-groups)。

附加的 worker 會宣告它提供的工作區根目錄。輸入框讓使用者為 Agent 或其 Subagents 能到達的每個附加環境選一個工作區;新對話若只有一個明確的工作區，會自動選取。LibreChat 把這些選擇存在對話上，執行前對照即時的 worker 重新驗證，並在核准暫停與續跑之間保持不變。必要的選擇缺少或不可用時，會擋下送出,LibreChat 絕不會默默換成另一個工作區。執行開始時,LibreChat 可以從選定的工作區載入 repository 的指示，讓 Agent 遵循那個 repository 的規範;管理員可以用 [`repositoryInstructions.timeoutMs`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#repositoryinstructions) 限制搜尋時間。即使 worker 不支援可重複使用的執行環境工作階段，原生的檔案與 Bash 工作區工具仍然可以使用宣告的根目錄。在相容的 Code API 與 worker 版本上，當 Agent 的程式化工具設定允許、有權限的附加 worker 已就緒並宣告 `programmaticLanguages: ['bash']`,而且選定的工作區與 worker 都允許 `execute_command` 時，可以使用能感知工作區的 Programmatic Bash。LibreChat 會把伺服器驗證過的工作區 ID 與對話工作區實例 ID(有的話)傳給程式化工具;模型的參數無法取代這個選擇。沒有這些能力時,Programmatic Bash 會停用;能感知工作區的指令請用直接的 Bash。worker 支援檔案轉送時，聊天上傳的檔案會為程式化執行另外暫存在 `$LIBRECHAT_CODE_DATA_DIR` 底下，不會複製到選定的工作區。**Stop** 會取消能處理訊號、正在執行的 BYOM 指令，而不會讓工作區在之後的指令中失效;分離的工作保有它自己的取消生命週期。

對附加的執行環境,Agent Builder 可以把 **Workspace default**(工作區預設)設成一個目前宣告的根目錄。它會對照那個附加環境驗證，並用來初始化這個 Agent 的新對話。選 **Last used**,會使用登入使用者對這個 Agent 與環境、存在瀏覽器本機的偏好;它只是方便用的提示，絕不是授權，也不會綁定對話。變更執行環境會清除明確設定的預設;已存的根目錄若不再被宣告，仍然看得到，但要重新設定後才能選取。

#### 已存對話的工作區變更(Saved-chat workspace changes)

預設情況下，已存對話的附加工作區決定是封存的。啟用 [`statefulCodeSessions.conversationMoves.enabled`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 後，擁有者可以明確地移到另一個有權限的工作區，或復原遺失的工作區。復原會保留聊天紀錄，**不會**保留遺失工作區的檔案。再設定 `allowAttachDetach: true`,擁有者還能把工作區附加到一個已存、不寫程式的對話，或離開附加工作區繼續一般聊天;只啟用移動並不會啟用附加與分離。這些轉換不能在產生回應時進行，並且會在伺服器上重新驗證。選擇開啟之前，先升級所有 API 副本，並啟用 `CODE_ENVIRONMENT_DECISION_VERSION=1`。沒有這些開關時，既有的「只能移動」與封存對話的行為不變。

附加的 Bash 預設逾時 30 秒。環境可以用 [`configSchema.limits.maxCommandTimeoutMs`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 提供較大、可由模型請求的預算，最多到協定上限的五分鐘。請求的逾時絕不會超過部署的限制。管理員可以用 [`configSchema.limits.maxQueueWaitMs`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 另外限制容量重試;這個佇列等待不會取消已經接受或正在執行的指令。要允許較長的**單次**接受嘗試，只有在 Code API 遵守每個請求的佇列額度、而且已經確認即時路由上最短的代理逾時之後，才使用 `configSchema.limits.maxRequestTimeoutMs`。選用的 `configSchema.limits.minCommandAdmissionMs` 預設在指令前保留 10 秒給接受程序(有效值 1 到 300 秒)。宣告的 Bash 逾時，會在扣掉這段保留、以及另外 10 秒的結算與傳送之後，配合請求預算調整。這個預算不取代 `maxQueueWaitMs`。

#### 連結工作樹通道(Linked-worktree lanes)

附加環境可以用 `configSchema.workspaces.linkedWorktrees: true`,選擇開啟[依工作樹排程請求](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions)。先升級 LibreChat,再部署相容的 Code API 橋接，並以 `--linked-worktree-lanes` 啟動 worker;只有在那個 worker 宣告 `git_linked_worktree` 之後，才啟用這個 YAML 設定。結構上指向 `.worktrees/<name>/` 的請求，會使用那個工作樹的通道，而不改變顯示給 Agent、相對於 checkout 的路徑。對 Bash,要把工作樹目錄放在工具的 `cwd` 參數;在指令裡執行 `cd .worktrees/<name>` 仍然留在根目錄的通道。checkout 根目錄的操作、環境動作與對話工作區實例，也都留在根目錄範圍。沒有選擇開啟時，所有請求維持既有的整個 checkout 排程。

#### 工作區編輯的比對與衝突(Workspace edit matching and conflicts)

`edit_file` 接受最上層的 `replace_all`,用於單一的 `old_text`/`new_text` 取代;提供 `edits` 批次時，則是每個項目各自的旗標。沒有它時，每個 `old_text` 都必須對應到唯一的位置。提供的批次必須非空且有效;LibreChat 會拒絕空的或格式錯誤的 `edits`,而不是退回使用最上層的取代欄位。有效的 JSON 字串化批次與布林取代旗標，會在原生工具核准之前正規化，所以預覽和執行使用同一份正規化的編輯，包括經過審查的 hook 改寫。Skill 檔案與託管沙箱的編輯，支援在 LibreChat 的大小與比對數量限制內取代所有相符處;附加工作區需要宣告 `replace_all` 的 worker,不支援的請求會在送出前被拒絕。

在宣告 `tolerant_match` 的附加 worker 上，編輯與受保護的預覽會先嘗試精確比對，再嘗試容忍空白的策略，處理行尾空白、CRLF、縮排位移或正規化的空白。管理員可以用 [`configSchema.edits.tolerantMatching: false`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 要求精確比對。成功訊息會標出非精確比對或多處取代。失敗的批次是原子性的：什麼都不寫入,LibreChat 會回報有限的逐項原因、數量、候選行號或檔案已變更的警告，而不轉送任意的 worker 文字或檔案片段。

這些附加 worker 功能，需要實作了 [Code Interpreter #271](https://github.com/LibreChat-AI/code-interpreter/pull/271) 的相容 Code API 與 worker 版本。LibreChat 只在能力協商之後才送出新欄位。使用較舊的版本時，請求格式與比對行為不變;只升級 LibreChat 不會啟用容忍空白的附加編輯或 `replace_all`。

#### 附加環境的工具權限(Attached-environment tool permissions)

附加與個人環境，對檔案寫入與指令或程式碼執行，採用「預設詢問」的核准政策。唯讀與搜尋操作，繼續依照部署的一般工具政策。如果管理員透過 [`configSchema.permissions`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 開放其中一類，有 Code Environment 管理權限的使用者，可以在 **Settings > Code environments** 從允許的 **Allow**、**Ask** 或 **Deny** 中選擇。缺少、過時或不被允許的設定，會安全地退回 **Ask**。

只要選定的附加環境支援，輸入框就會顯示對話層級的 **Code approval mode**(程式碼核准模式):

- **Ask before changes**(變更前詢問):檔案編輯或執行指令前都會詢問。
- **Accept edits**(接受編輯):允許檔案編輯，但執行指令前仍會詢問。
- **Full access**(完全存取):兩類都允許，不再例行詢問。

選定的模式跟著那個對話，並和部署允許的值以及環境政策取交集。只有 `fileWrite` 與 `commandExecution` 都允許 `allow` 時，才會出現 **Full access**;它不會繞過沙箱隔離、角色授權、端點明確的 `ask` 或 `deny` 規則、Skill 檔案確認或核准 hooks。

匯入對話時，不能替接收者選擇程式碼核准模式。新匯入或大量複製的對話，依目前的政策使用接收者的偏好或預設;大量更新會保留本機已存的選擇。既有的對話不會被追溯重設，在 LibreChat 中明確選擇的模式仍然會保存下來。

這些控制涵蓋寫檔工具、shell 與程式碼執行、編譯檢查與 Programmatic Tool Calling。在可以撰寫 Skill 時，寫入持久的 Skill 檔案仍然需要確認，即使一般的檔案寫入是允許的。這些設定不會改變 VM 的隔離、網路、掛載、特權執行、連入、連出或密鑰存取。

部署明確的 [`toolApproval.enabled: false`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#toolapproval) 設定是緊急覆寫，會停用這個基準。沒有這個覆寫時，無法呈現與續跑核准請求的呼叫端，會以關閉的方式失敗，而不是默默執行附加環境的工具。

配對驗證的是遠端 worker 的傳輸，它不是沙箱邊界。把 worker 的本機執行端點留在回送介面或私有網路上，並為不受信任的程式碼使用適當的隔離模式。

執行進行中時，展開的程式碼與 shell 詳細窗格會跟著串流的參數捲到底部。往上捲動會暫停跟隨，讓你檢視較早的輸出，窗格不會把畫面拉走。

## 使用 API(Using the API)

### 自架的 JWT 驗證(Self-hosted JWT authentication)

使用 JWT 驗證時,LibreChat 會在每次 Code Interpreter 請求時，替經過驗證的使用者簽發一個短期的 bearer token。Code Interpreter 服務用相符的公鑰驗證它，並使用簽署的使用者與租戶上下文來隔離檔案與工作階段。私密的簽署金鑰留在 LibreChat;Code Interpreter 只收到它的公開驗證器。

LibreChat 這邊的設定:

```env
CODEAPI_AUTH_PROVIDER=librechat-jwt
CODEAPI_JWT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
CODEAPI_JWT_ALGORITHM=EdDSA
CODEAPI_JWT_KID=lc-codeapi-2026-05
CODEAPI_JWT_ISSUER=librechat
CODEAPI_JWT_AUDIENCE=codeapi
CODEAPI_JWT_TTL_SECONDS=300
CODEAPI_JWT_MINT_CACHE_SECONDS=30
CODEAPI_JWT_SINGLE_TENANT_ID=legacy
```

`CODEAPI_JWT_PRIVATE_KEY_BASE64` 可以改放 base64 編碼的 PEM,`CODEAPI_JWT_PRIVATE_JWK_JSON` 則接受私密的 JWK。LibreChat 支援 Ed25519(`EdDSA`,預設)與 RSA(`RS256`)簽署。LibreChat 端的每一個設定，見[環境變數參考](https://www.librechat.ai/docs/configuration/dotenv#code-interpreter-jwt-authentication)。

Code Interpreter 這邊設定對應的驗證器:

```env
LOCAL_MODE=false
CODEAPI_AUTH_PROVIDER=librechat-jwt
CODEAPI_JWT_ISSUER=librechat
CODEAPI_JWT_AUDIENCE=codeapi
CODEAPI_JWT_ALLOWED_ALGS=EdDSA
CODEAPI_JWT_JWKS_JSON={"keys":[{"kty":"OKP","crv":"Ed25519","x":"...","kid":"lc-codeapi-2026-05","alg":"EdDSA"}]}
CODEAPI_JWT_SINGLE_TENANT_ID=legacy
```

issuer、audience、金鑰 ID、演算法與公鑰，都必須和 LibreChat 的簽署者相符。Code Interpreter 也可以從 `CODEAPI_JWT_PUBLIC_KEY` 加上 `CODEAPI_JWT_KID`,或從 `CODEAPI_JWT_PUBLIC_KEYS_DIR` 載入驗證金鑰;內嵌的 JWKS 方便輪替。token 的 TTL 要維持在 Code Interpreter 服務的 `CODEAPI_JWT_MAX_TTL_SECONDS` 以下，它的預設值與上限都是 300 秒。

本機的 checkout,Code Interpreter repository 內附一個輔助腳本，會產生相符的 Ed25519 簽署金鑰與執行清單金鑰，並更新兩邊的 `.env` 檔:

```bash
node scripts/setup-local-auth-env.js --librechat /path/to/LibreChat
```

單一租戶的部署可以維持 `CODEAPI_JWT_SINGLE_TENANT_ID=legacy`,但兩個服務的值必須相同。多租戶的部署應該提供經過驗證的租戶上下文，並在 LibreChat 啟用 `TENANT_ISOLATION_STRICT=true`、在 Code Interpreter 啟用 `CODEAPI_TENANT_ISOLATION_STRICT=true`。嚴格模式會拒絕沒有租戶上下文的請求，而不是使用單一租戶的退路。

### 自架的基礎網址(Self-hosted base URL)

設定 `LIBRECHAT_CODE_BASEURL`,把 LibreChat 指向你自架的 [code-interpreter](https://github.com/ClickHouse/code-interpreter) 實例，再設定 [JWT 驗證](#自架的-jwt-驗證self-hosted-jwt-authentication)。相容 API 金鑰的服務，改設定 `LIBRECHAT_CODE_API_KEY`。高度實驗性的有狀態 Agent 工作階段，需要另一條 `stateful` 設定檔的路由，透過 [`LIBRECHAT_CODE_BASEURL_STATEFUL`](https://www.librechat.ai/docs/configuration/dotenv#stateful-code-interpreter-endpoint) 或具名的 [`statefulCodeSessions.environments`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#statefulcodesessions) 設定。

## References

- [Code Interpreter API(官方文件)](https://www.librechat.ai/docs/features/code_interpreter)
