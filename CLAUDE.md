# LibreChat 逐段學習專案

目標:理解 LibreChat 是怎麼依序建立出來的。使用 npm(原始碼)版,MongoDB 用 Docker 跑,只當依賴。

## 學習主線
- 方向:**現行架構 × 官方開發史**。以現在的結構為準,功能依檔案誕生日(官方加入的先後)排順序,一段一段引入。
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
- 對應原始碼目錄的說明,依原始碼位置放子資料夾:`packages/*` 的說明放 `docs/packages/`(如 `docs/packages/data-provider.md`),之後 `api/`、`client/` 同理放 `docs/api/`、`docs/client/`。不對應單一目錄的專案層級文件(`package-json`、`mvp-design`、`local-testing` 等)平放在 `docs/`。
- 文件只寫學習內容,不寫「作者的查證過程」:例如「官方文件沒有說明這個」「這是我的推論」「沒有驗證」「依檔名判斷」這類備註不放進文件。官方有沒有講,Claude 自己知道就好;說明內容本身要寫對,拿不準的主張就不寫,不要寫了再加免責聲明。查證結果與不確定處,在對話中告訴使用者。

## 進度清單(使用者確認一步,才打勾一步)
- [x] 0. 唯讀查看官方第一層結構(目錄與檔案),逐一講解,不下載;說明文件見 `docs/repository-structure.md`
- [x] 1. 查官方最早提交與第一個 package.json:第一個提交只有 .gitignore 等 3 檔(來自範本);第一份 package.json 在 2023-02-04,是 `npm init -y` 產生的 React + webpack 小專案。結論:以現在的結構為主線,歷史只當背景
- [x] 2. 讀現在的根 package.json(workspaces、scripts);說明文件見 `docs/package-json.md`、`docs/official/development/architecture.md`
- [x] 3. Docker 啟動 MongoDB(學習專用容器 `learn-mongodb`,port 27018);說明文件見 `docs/mongodb.md`

### 第 4 步起:現行架構 × 開發史,先有最小可用

詳細設計見 `docs/mvp-design.md`(MVP 與驗證)、`docs/history-cohorts.md`(檔案誕生日分群)、`docs/build-order.md`(歷史時間軸與 release 核對)。

#### 固定版本
- 唯一來源:官方 release `v0.8.8-rc4`(提交 `361553f`,2026-09-23)。所有階段都從這個版本取檔案,不從會移動的 `main` 取。
- 選 rc4 的理由:使用者本機的對照實例 `LibreChat-sep` 就是 rc4(官方 rc4 加上使用者自己的 19 個提交),版本一致才能放心比對。官方最新的 `v0.8.8`(2026-10-01)與 rc4 相差 117 個提交,暫不使用。
- 已對照 rc4 標籤驗證:logo 一致;根 package.json 已換成 rc4 版(含 `danny-avila` 組織網址,官方 2026-09-24 才改為 `LibreChat-AI`);README 內容來源只有組織網址不同。
- README 的連結(資源、更新日誌)保留 `LibreChat-AI` 新網址,因為它是目前的正確位置,也是使用者指定的來源;不屬版本相關內容。

#### 帶入規則
- 所有層(`packages/*`、`api/`、`client/`)都**依功能帶入**,不整個工作區照單全收。
- 精簡規則:**只刪不寫**。精簡只能刪除程式碼(例如某個 `require` 與對應的 `app.use`),不得新增自己寫的邏輯。精簡過的檔案之後換回完整官方版。
- 精簡的差異以「與官方快照自動比對」列出:暫存區放固定版本的官方快照,每階段結束比對一次,最終階段差異必須為零。
- **每層帶入時以官方 `package-lock.json` 為基礎安裝**:先把官方 rc4 的 lockfile 複製到專案根目錄,再執行 `npm install --ignore-scripts`,npm 會自動**刪除**尚未帶入的工作區條目(不新增條目,版本、`resolved`、`integrity` 不變;只重算衍生標記 `dev`、`peer`、`optional`),提交這份刪減後的 lockfile。每帶入一層重做一次(從官方完整版開始刪,不在上一次刪減後的版本上累加),所有工作區到齊時與官方完全相同。
  - 原因:沒有 lockfile 時 npm 會把 `^0.22.2` 解析成最新版,`tsdown` 0.22.14 搭配 `rolldown-plugin-dts` 0.27.14 對官方原始碼報 `TS9010`(`packages/api` 建置失敗);官方 lockfile 鎖定 `tsdown` 0.22.2 與 `rolldown-plugin-dts` 0.25.2,建置成功。官方程式碼不能改,所以只能鎖版本。
  - 已實驗確認:`workspaces` 列出的資料夾不存在時,`npm install` 不報錯;用官方 lockfile 安裝時,npm 3172 條 → 1984 條,新增 0 條、版本變動 0 條(另有 756 條的 `dev`/`peer`/`optional` 標記被重算)。四層(`data-provider`、`data-schemas`、`api`、`client-package`)建置成功,`dist/` 與暫存區位元組大小完全一致(四層時 lockfile 為 2324 條)。
  - 安裝一律加 `--ignore-scripts`,避免 `prepare` 的 husky 修改 git 的 `core.hooksPath`。
- 前端依階段精簡,不整包帶入:砍 14 個功能目錄,改 13 個檔案(刪 247 行、改 1 行),另用 `librechat.yaml` 的 `interface` 開關隱藏刪不掉的入口。`Chat/Subagents`、`Share`、`SidePanel/Parameters` 是聊天核心,不能砍。清單見 `docs/client/mvp-trim.md`。
- **不使用 `npm run reinstall` 與 `config/update.js`**:它會執行 `git fetch`、`git checkout main`、`git pull origin main`、`npm cache clean --force`、`npm ci`,依參數還會執行 `docker rmi`,在本專案可能破壞我們的 git 與環境。改為手動執行安裝與建置步驟,每步先講解。
- 後端啟動時會讀取 `client/dist/index.html`,所以後端與前端必須一起建置才能驗證。
- MVP-1 不帶測試檔(最終階段補回,差異列入精簡清單)。
- 根目錄 `.gitignore` 要換成官方完整版,**帶入前先讓使用者讀過內容**(尤其 `.env.example` 的例外設定)。

#### 文件與實作的順序
- **文件追隨實作**:先在暫存區實作並驗證,再寫文件,使用者讀完,才把檔案帶進專案。不先翻一批官方文件、也不憑推測先寫精簡清單。
- 官方文件翻譯放 `docs/official/`,**照官方目錄結構**(例如 `docs/official/features/agents.md`),`.mdx` 轉 `.md`,結尾放 References。我們自己寫的說明與教學放 `docs/`。
- 只翻「該階段實作時實際用到、碰到」的官方頁面,範圍由實作決定(對應表見 `docs/mvp-implementation.md`,是預估,實作後再確認)。
- **翻譯以英文版為準**。官方中文版是簡體,且與英文不同步(Ollama 設定頁、`interface` 物件頁、`features/agents`、`local/index` 都落後,`quick_start/first_chat` 沒有中文版)。中文版只當官方用語的參考,而且只限與英文同步的頁面。
- 精簡清單、待實測的結論、補充教學:必須是在暫存區真的做過並驗證的結果,不可把推測寫成事實。
- 流程:暫存區實作並驗證(安裝與建置可在背景跑)→ 依結果寫文件 → 使用者讀完 → 才把檔案帶進專案、建置檢查、提交。
- **已驗證的層不等前端做完,每層驗證完就帶入專案**,讓使用者能在專案裡讀原始碼,git 歷史也一層一層長出來。帶入的檔案放進專案但先不提交,使用者讀過說明文件與檔案後才提交。

#### 暫存區
- 暫存資料夾放固定版本的官方快照,只供分析、實驗與比對。不放在專案內、不進 git、用完丟棄。
- 含反引號或反斜線的內容,用寫檔工具寫成檔案,不要經過 Shell 字串(heredoc 會吃掉反斜線,雙引號內的反引號會被當成指令執行)。

#### `.env` 注意事項
- 設定 `PORT=3090`、`MONGO_URI` 指向 27018、`DOMAIN_CLIENT` 與 `DOMAIN_SERVER` 指向 3090(官方預設是 3080)。
- `CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET` 官方範本註明可留空,後端會產生暫時值存在 `.env.temp`(對照實例的日誌與設定證實;正式環境才需設定固定值)。
- `OPENAI_API_KEY=user_provided` 表示金鑰在登入後於介面輸入,不寫在 `.env`。
- `.env` 含金鑰,不得進 git。

#### MVP 驗收標準
註冊 → 登入 → 新對話 → 送出訊息 → 回覆串流顯示 → 重新整理後歷史仍在。

#### 功能階段(順序依檔案誕生日)
23 個功能,依最早誕生日排序,表格與每個功能在 MVP-1 的處理見 `docs/mvp-design.md`;release 核對見 `docs/build-order.md`。順序:對話與訊息、提示詞、登入與驗證、搜尋、外掛、預設、檔案與圖片、OAuth 與 OpenID、自訂端點與設定檔(MVP 為接 Ollama 會提前使用)、Redis 與快取、分享、語音、管理面板、Trace 與可觀測、書籤與標籤、Artifacts 與 Mermaid、Agents(MVP 因聊天走 agents 管線會保留)、程式碼環境、MCP、記憶、Skills、專案、排程與觸發。
- 「最早誕生」依路徑名稱比對,有雜訊(提示詞、管理面板、Trace 尤其明顯),以中位數與分布為準。
- 階段開始前逐一核對該功能的檔案清單,再確認順序。
- Helm 為 Kubernetes,本機不用,略過。

#### 每個階段的固定節奏
暫存區實作並驗證 → 依結果寫文件(官方頁面翻譯、歷史故事、涉及檔案表、精簡清單、補充教學)→ 使用者讀懂 → 取得檔案放進專案(新增的,以及把精簡版換回完整版)→ 專案內建置驗證 → 使用者確認 → 打 git 標籤(如 `stage-mvp`)→ 下一階段。

#### MVP 的兩輪
- MVP-1(第一個目標):後端 307、前端 1032、函式庫 1246(整個保留),合計 2585 / 3039 個程式碼檔(約 85%)。帶入專案的檔案:後端 315、前端 1145(含設定、翻譯、圖示等非程式碼檔)。
- MVP-2(待定,尚未納入做法):深切共用基礎的中樞,推估約 60% 到 70%,需先有人工確認的核心清單。

#### 進度清單
- [x] A. 固定 `v0.8.8-rc4`,並已重新對齊已帶入的檔案
- [x] B. 暫存區分析(後端、前端、函式庫的靜態分析;結論見 `docs/mvp-design.md`)
- [x] C. 改寫 `docs/build-order.md`(歷史時間軸與 release 核對)
- [x] D. MVP 設計文件 `docs/mvp-design.md` 與 `docs/history-cohorts.md`
- [x] E. MVP-1 實作與驗證:暫存區的完整版基準、後端精簡、前端精簡都已完成並通過驗收(暫存區的 MVP-1:後端 315 檔 + 前端 1145 檔);已驗證的層每層帶入專案(L0 根設定、L1 `data-provider`、L2 `data-schemas`、L3 `packages/api`、L4 `packages/client`、L5 後端 `api/`、L6 前端 `client/` 都已提交);專案內以 `.env` 與 `librechat.yaml` 啟動,使用者在瀏覽器完成驗收(2026-10-06 通過),標籤 `stage-mvp`
- [ ] F. 其餘功能依誕生日逐階段補回
- [ ] G. MVP-2(深切中樞)評估

#### 模型端點(MVP 用本機 Ollama,不需要雲端金鑰)
- 使用者本機 Ollama 在主機 port 11434 執行,有多個模型(含 `qwen2.5:7b-instruct`、`gemma4`、`qwen3:14b` 等)。
- MVP 用 `librechat.yaml` 的自訂端點接 Ollama(官方文件:`configuration/librechat_yaml/ai_endpoints/ollama`)。`librechat.yaml` 屬設定檔,按需要可提前到 MVP,不受功能階段的歷史順序限制。
- 我們的後端跑在主機上,`baseURL` 用 `http://localhost:11434/v1/`(跑在 Docker 內才用 `host.docker.internal`)。金鑰欄位填佔位字串。
- 使用者本機的 `LibreChat-sep` 已用同樣方式接 Ollama,可作為「官方包可運作」的對照。要確認事實時先查它(`docker logs`、`docker exec`),不要猜。
- 該實例的設定檔含金鑰與其他私人設定,只讀、不抄進本專案;我們的 `librechat.yaml` 以官方範本為基礎。
- 在 Git Bash 對容器指令傳路徑參數要設 `MSYS_NO_PATHCONV=1`,否則 `/app/...` 會被轉成 Windows 路徑。
