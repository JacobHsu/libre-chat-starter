# LibreChat 逐段學習專案

目標:理解 LibreChat 是怎麼依序建立出來的。使用 npm(原始碼)版,MongoDB 用 Docker 跑,只當依賴。

## 學習主線
- 方向:**現行架構 × 官方開發史**。以現在的結構為準,功能依官方加入的先後順序,一段一段引入。
- **中間要有最小可用版本(MVP)**,不是全部完成才能用。
- 不回到早期歷史版本的程式碼(已被使用者否決);歷史用來講「為什麼加、何時加」。
- 大原則:**官方程式碼能不改就不改**。唯一允許的例外:檔案暫時是精簡版,之後換回完整官方版,最終必須和官方完全一致。

## 本機環境(與使用者既有服務並存)
- 使用者本機已有其他 LibreChat 與相關服務在 Docker 執行(含 `chat-mongodb` 佔 27017、後端佔 3080/3081)。**不可碰這些容器與資料,也不可直接執行官方整份 compose**(容器名稱與 port 會衝突)。
- 學習專案專用 port:後端 `3090`、前端開發伺服器 `4090`、MongoDB `27018`。
- MongoDB 另起學習專用容器(獨立名稱、獨立資料卷)。
- 這些 port 偏離官方預設(後端 3080、前端 3090、MongoDB 27017),設定時要確認前後端的轉發設定一致。

## 來源
- 官方文件:https://www.librechat.ai/zh
- 原始碼:https://github.com/LibreChat-AI/LibreChat
- 以這兩處為準。講解時對照原始碼與文件,不憑記憶猜測。

## 工作規則
- 使用者只觀看與使用,搭建與寫文件由 Claude 代勞。
- 每次只做一小步,講解後停下,等使用者確認讀懂、在本地看過,才進下一步。
- 取得官方檔案前先寫好說明文件(文件先行),使用者讀懂後才取得。不要自行往前衝。
- 每一個動作都要很小:一次只做一件事(一個檔案、一個指令),做完停下、講解,再等使用者指示。
- 每一步結尾固定寫「下一步」:內容、Claude 的建議、預設動作。使用者回「好」即執行,不必重新描述。
- 只在規則沒涵蓋的決策點才列選項;規則已涵蓋的,直接照規則做,不重複詢問。
- 學習步驟與每個功能階段,一定等使用者確認讀懂才繼續,不可自行跳過。
- **先查本機環境,再問或做實驗**:使用者本機有完整運行的服務(Docker 容器 `LibreChat-sep`、`LibreChat`,對照專案資料夾 `libre-chat-sep`、`libre-chat`,Ollama 等)。凡是能從它們查到答案的事(版本、設定、日誌、檔案、相依套件是否裝過、環境變數名稱),一律先唯讀查,不要問使用者、不要重做實驗。查不到才問。
- 遇到沒有明文規定的慣例(提交訊息、命名、檔案結構等):預設先看**官方 LibreChat** 怎麼做並對齊;官方查不到,再看使用者其他專案;兩者都沒有才問使用者。
- 有疑問或需要選擇時,先問使用者。
- 使用者可隨時更新這些規則。
- 使用者已授權 Claude 執行 commit 與 push(遠端為使用者自己的 repo)。
- 提交訊息與官方 LibreChat 對齊(依官方最近 300 筆提交統計,295 筆符合):`<表情> <type>: <首字大寫的英文標題>`,例如 `📦 chore: Bump Packages`。表情官方沒有固定對應(144 種表情用在 176 筆 `fix`),依內容挑一個貼切的即可。類型:`docs`(`docs/`、README、CLAUDE.md 等文件)、`feat`(帶入官方檔案或新增功能)、`fix`、`chore`(設定、整理)、`refactor`、`ci`、`test`、`style`、`perf`。官方結尾的 `(#PR編號)` 來自 PR 合併,我們沒有 PR,省略。結尾照常附上 Co-Authored-By。使用者 `libre-chat-sep` 的無表情寫法不採用,以官方為準。
- 提交時逐檔指定要加入的檔案,不用 `git add -A`。
- **需要使用者閱讀的文件,先寫好、請使用者讀,使用者確認沒問題後才 commit 與 push**,不可先提交再請他讀。commit 與 push 的授權是針對「已確認的內容」,不是事先的一般授權。純規則或設定的小修正(使用者剛下達的指示)可以直接提交。

## 內容來源規則
- 根目錄的檔案(README.md、LICENSE 等)內容要來自原始來源,可取部分或翻成繁體中文,但不可自己發揮。
- 只有 `docs/` 底下的學習紀錄與教學文件,才是我們自己寫的內容。
- `docs/` 檔案不編號,沿用官方檔名(如 `architecture`);閱讀順序由 `docs/README.md` 的目錄維護。
- 核心原則:先慢慢帶入官方原檔(翻成繁中),使用者讀完後,再針對官方不足的地方補充。有需要才自己加入或自訂,不預先寫。
- 寫教學文件前,先找官方文件:官方 repo 的 `docs/`,以及官網文件原始檔(librechat.ai repo 的 `content/docs/*.mdx`)。有官方的就優先採用(照原文翻成繁中),我們自己的說明只補官方沒講的部分。官方 `.zh.mdx` 若是簡中,以英文原文為準翻成繁中。查官方文件時英文與 `.zh.mdx` 都要看,並比對導覽(`meta.zh.json`)。
- 每份 `docs/` 文件結尾放 `## References`,列出引用的官方檔案與網址。
- 官方檔案依功能一段一段帶入我們根目錄的相同相對路徑,不整包 clone,也不用 `LibreChat/` 子資料夾。使用者不要求逐檔細看,有說明文件能理解即可。
- 內容引用的檔案(如 logo)下載到和官方相同的相對路徑,讓連結原樣可用。
- 官方連結若指向我們沒有的檔案,列出選項讓使用者決定,不自行處理。
- 取捨標準(依使用者至今的選擇):保留連到官方文件的內容(如 DOCS、翻譯進度徽章);捨棄社群與宣傳類(Discord、YouTube、贊助)、雲端部署按鈕(我們只在本地跑)、貢獻者與星星歷史。拿不準時先問,不要用「跟學習無關」自行判斷。
- README 內容全留全翻成繁體中文;產品名稱與專有名詞(Agent、MCP、Skills 等)保留英文;網址照原文。
- 大段內容(如 Features)分批寫入,每批完成後回報。
- commit 以完整單位為主(如 README 整份完成),不是每小步都 commit。
- README.md 按官方順序分小段加入:先讀原文並講解,使用者確認後才寫入。
- 修改或覆蓋既有檔案前,一定先讀過它的內容。
- 累積數個未 commit 的變更時,主動提醒使用者要不要 commit。

## 文件規則
- 學習筆記放 `docs/`,使用繁體中文。
- 只用相對路徑或簡短別名,不寫本機絕對路徑。

## 進度清單(使用者確認一步,才打勾一步)
- [x] 0. 唯讀查看官方第一層結構(目錄與檔案),逐一講解,不下載;說明文件見 `docs/repository-structure.md`
- [x] 1. 查官方最早提交與第一個 package.json:第一個提交只有 .gitignore 等 3 檔(來自範本);第一份 package.json 在 2023-02-04,是 `npm init -y` 產生的 React + webpack 小專案。結論:以現在的結構為主線,歷史只當背景
- [x] 2. 讀現在的根 package.json(workspaces、scripts);說明文件見 `docs/package-json.md`、`docs/architecture.md`
- [x] 3. Docker 啟動 MongoDB(學習專用容器 `learn-mongodb`,port 27018);說明文件見 `docs/mongodb.md`

### 第 4 步起:現行架構 × 開發史,先有最小可用

#### 固定版本
- 唯一來源:官方 release `v0.8.8-rc4`(提交 `361553f`,2026-09-23)。所有階段都從這個版本取檔案,不從會移動的 `main` 取。
- 選 rc4 的理由:使用者本機的對照實例 `LibreChat-sep` 就是 rc4(官方 rc4 加上使用者自己的 19 個提交),版本一致才能放心比對。官方最新的 `v0.8.8`(2026-10-01)與 rc4 相差 117 個提交,暫不使用。
- 已對照 rc4 標籤驗證:logo 一致;根 package.json 原取自較晚的 `main`,已換成 rc4 版(含 `danny-avila` 組織網址,官方 2026-09-24 才改為 `LibreChat-AI`);README 內容來源只有組織網址不同。
- README 的連結(資源、更新日誌)保留 `LibreChat-AI` 新網址,因為它是目前的正確位置,也是使用者指定的來源;不屬版本相關內容。

#### 帶入規則
- 所有層(`packages/*`、`api/`、`client/`)都**依需求帶入**,不整個工作區照單全收。
- 精簡規則:**只刪不寫**。精簡只能刪除程式碼(例如某個 `require` 與對應的 `app.use`),不得新增自己寫的邏輯。
- 精簡帳本改為**自動比對**:暫存區放固定版本的官方快照,用比對指令列出我們與官方的差異檔案。每階段結束跑一次,最終階段差異必須為零。
- 精簡階段不使用官方 `package-lock.json`,最終階段才換回(待實驗確認 npm 遇到缺少的工作區資料夾會怎樣)。
- 前端 `client/` 能否精簡,待實驗後再決定。後備方案是前端完整帶入、由後端關閉功能,這個例外需使用者同意。
- **不使用 `npm run reinstall` 與 `config/update.js`**:它會執行 `git fetch`、`git checkout main`、`git pull origin main`、`npm cache clean --force`、`npm ci`,依參數還會執行 `docker rmi`,在本專案可能破壞我們的 git 與環境。改為手動執行安裝與建置步驟,每步先講解。

#### 暫存區
- 暫存資料夾放固定版本的官方快照,只供分析、實驗與比對。不放在專案內、不進 git、用完丟棄。

#### `.env` 注意事項
- 設定 `PORT=3090`、`MONGO_URI` 指向 27018、`DOMAIN_CLIENT` 與 `DOMAIN_SERVER` 指向 3090(官方預設是 3080)。
- `CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET` 官方範本註明可留空,後端會產生暫時值存在 `.env.temp`(對照實例的日誌與設定證實;正式環境才需設定固定值)。
- `OPENAI_API_KEY=user_provided` 表示金鑰在登入後於介面輸入,不寫在 `.env`。
- `.env` 含金鑰,不得進 git。

#### MVP 驗收標準
註冊 → 登入 → 新對話 → 送出訊息 → 回覆串流顯示 → 重新整理後歷史仍在。

#### 功能階段(順序依官方開發史)
完整表格與核對方式見 `docs/build-order.md`。日期以官方 release 說明核對;標示近似者只有提交紀錄,階段開始前需再確認。
1. MVP:註冊、登入、對話、保存、一個模型端點(2023-03 起:`api/` 拆出、多使用者登入)
2. Meilisearch 搜尋(2023-03-16,release v0.0.4)
3. 預設 presets(2023-04-05,release v0.3.0)
4. Redis(2023-10-22,release v0.6.0)
5. 圖片與檔案上傳 Vision(2023-11-16,release v0.6.1)
6. 自訂端點與 `librechat.yaml`(2024-01-19,release v0.6.6;MVP 為接 Ollama 會提前使用)
7. RAG 跟檔案對話(約 2024-03,提交紀錄,未核對 release)
8. Agents(約 2024-08 至 10,提交紀錄;MVP 因聊天走 agents 路由會提前使用)
9. MCP(2024-12-20,release v0.7.6)
Helm 為 Kubernetes,本機不用,略過。

#### 每個階段的固定節奏
文件先行(該功能的歷史故事、為什麼加、涉及檔案以表格列出檔名與用途、設定、驗證、精簡清單)→ 使用者讀懂 → 取得檔案(新增的,以及把精簡版換回完整版)→ 驗證 → 使用者確認 → 打 git 標籤(如 `stage-mvp`)→ 下一階段。

#### 進度清單
- [x] A. 固定 `v0.8.8-rc4`,並已重新對齊已帶入的檔案
- [x] B. 暫存區實驗(已大幅縮減:對照專案已證實 Windows 主機上 npm 安裝與建置可行,不再做基線實驗)。(a) 【已完成:缺少工作區資料夾時 `npm install` 不報錯、結束代碼 0;lockfile 只含根的 700 個套件,不含工作區;因此可逐階段增加工作區並重新安裝】;(b) 後端靜態分析【已完成:api/ 排除測試共 393 檔,從 server/index.js 可達 356 檔;所有路由共用約 184 檔的核心;MVP 候選路由(config、endpoints、models、auth、user、convos、messages、balance、roles)約 236 檔,加 agents 路由(聊天走 /api/agents/chat)約 266 檔;其餘功能路由多半只多 1–4 檔,assistants +23、files +27;為靜態估計,動態 require 會漏】;(c) 前端靜態分析【已完成:client/src 排除測試共 1421 個程式碼檔,從 main.jsx 可達約 94%(1329);單獨對話頁 ChatRoute 就可達 928 檔;對話頁加外層版面聯集 1254 檔(88%);無法只刪路由,但可在元件內刪除對功能目錄的 import 與其使用處(只刪不寫,符合規則)。砍掉功能目錄(SidePanel 各面板、Prompts、Skills、Agents、Trace 等)後剩 (經逐項檢查引用,Chat/Subagents、Share、SidePanel/Parameters 是聊天核心,不能砍,最終砍 14 個功能目錄)後剩 1033 檔(78%),需在 13 個檔案刪 29 條 import,集中在 useSideNavLinks.ts(9)與 routes/index.tsx(7)。結論:前端同樣依階段精簡,不整包帶入;精簡後以 vite build、啟動與 MVP 驗收確認;功能隱藏另可搭配官方 librechat.yaml 的 interface 開關】 (d) 函式庫靜態分析【已完成:非測試 TS 檔 data-provider 65、data-schemas 243、packages/api 732、packages/client 205;MVP 約需 data-provider 95%、data-schemas 50%、packages/api 76%、client 至少 35%(低估,改名匯出未處理);前端有 16 個檔案整包匯入 data-provider。MVP 合計約 2109 / 2930 個程式碼檔(約 72%),結構高度整合,精簡幅度有限;階段的學習價值在功能說明而非檔案增量】
- [x] C. 修正 `docs/build-order.md`:已加入功能時間軸(以 release 為骨幹)與做法說明,取代過時的「兩種切法」
- [ ] D. MVP 設計文件:要留哪些檔案、刪哪些接線、為什麼、驗收標準;使用者讀懂
- [ ] E. MVP 實作與驗證
- [ ] F. 階段 2–9 依序進行

#### 模型端點(MVP 用本機 Ollama,不需要雲端金鑰)
- 使用者本機 Ollama 在主機 port 11434 執行,有多個模型(含 `qwen2.5:7b-instruct`、`gemma4`、`qwen3:14b` 等)。
- MVP 用 `librechat.yaml` 的自訂端點接 Ollama(官方文件:`configuration/librechat_yaml/ai_endpoints/ollama`)。`librechat.yaml` 屬設定檔,按需要可提前到 MVP,不受功能階段的歷史順序限制。
- 我們的後端跑在主機上,`baseURL` 用 `http://localhost:11434/v1/`(跑在 Docker 內才用 `host.docker.internal`)。金鑰欄位填佔位字串。
- 使用者本機的 `LibreChat-sep` 已用同樣方式接 Ollama,可作為「官方包可運作」的對照。要確認事實時先查它(`docker logs`、`docker exec`),不要猜。
- 該實例的設定檔含金鑰與其他私人設定,只讀、不抄進本專案;我們的 `librechat.yaml` 以官方範本為基礎。
- 在 Git Bash 對容器指令傳路徑參數要設 `MSYS_NO_PATHCONV=1`,否則 `/app/...` 會被轉成 Windows 路徑。
