# MVP-1 實作計畫

怎麼把 [MVP 設計](mvp-design.md) 的 MVP-1 真的做出來,並一層一層帶進本專案。

## 做法:先在暫存區做出來並驗證,再逐層帶入專案

專案的 git 歷史是我們的學習軌跡,不放試錯的過程。所以:

1. **暫存區**(不在專案內、不進 git、用完丟棄)先做出一份可運作的 MVP-1,當作「已驗證的答案」。
2. 驗證通過後,**依層把檔案帶進專案**,每層先有說明文件、你讀懂、再帶入、建置檢查、提交。

這樣專案裡每一個提交都是已知可運作的狀態,暫存區可以放心反覆試錯。

## 階段 E1:在暫存區做出 MVP-1

| 步驟 | 內容 | 產出 |
|---|---|---|
| 1 | 複製固定版本 rc4 的官方快照成為工作樹 | 一份可隨意修改的副本 |
| 2 | 依 [MVP 設計](mvp-design.md) 套用精簡:函式庫入口與資料庫模型註冊、後端 `server/index.js` 與 `routes/index.js`、前端 13 個檔案 29 條 import | 精簡清單(與官方快照比對的差異檔案) |
| 3 | 設定:複製 `.env.example` 為 `.env`(`PORT=3090`、`MONGO_URI` 指向 27018、`DOMAIN_CLIENT` 與 `DOMAIN_SERVER` 指向 3090);`librechat.yaml` 用官方範本加上 Ollama 自訂端點 | 可啟動的設定 |
| 4 | 安裝相依套件:`npm install`,不使用 `npm run reinstall`。不使用官方 `package-lock.json`,會產生新的 lockfile | `node_modules`(對照專案的是約 1.9 GB) |
| 5 | 依序建置:`data-provider` → `data-schemas` → `packages/api` → `packages/client` → 前端(Vite) | 各層的建置產物 |
| 6 | 啟動後端(port 3090,連 MongoDB 27018) | 後端執行中 |
| 7 | 走一遍驗收流程(註冊 → 登入 → 對話 → 串流 → 重新整理後歷史還在) | 驗收結果 |
| 8 | 失敗就修正:缺少的檔案補回、被誤刪的段落保留,每一處都記錄原因 | 「待實測」項目的結論 |

這一階段可能要反覆好幾輪才會通過,尤其是 [MVP 設計](mvp-design.md) 列出的「待實測」項目。

## 階段 E2:逐層帶入專案

順序由底層往上,與官方建置順序一致:

| 層 | 內容 | 說明 | 驗證 |
|---|---|---|---|
| L0 | 根目錄的必要設定 | `.nvmrc`、`.npmrc`、`turbo.json`,以及 `.gitignore` 的處理(見下方「需要決定」) | 無 |
| L1 | `packages/data-provider` | 前後端共用的型別、端點、data-service | 建置成功 |
| L2 | `packages/data-schemas` | 資料庫模型與方法(精簡後的實體) | 建置成功 |
| L3 | `packages/api` | 後端函式庫(精簡後的功能目錄) | 建置成功 |
| L4 | `packages/client` | 共用前端元件 | 建置成功 |
| L5 | `api/` | 後端入口、路由、服務(精簡後) | 能啟動,連上 MongoDB |
| L6 | `client/` | 前端(砍 14 個功能目錄後) | 建置成功,能開啟登入頁 |
| L7 | 設定範本 | `.env.example`、`librechat.yaml` 範本 | 無 |

每一層的做法(文件的部分另見下方「文件隨階段一起成長」):

1. 先寫該層的說明文件(目錄與檔案的用途表、精簡了什麼)。
2. 你讀懂、確認。
3. 從已驗證的暫存區工作樹取檔案,放到專案的相同相對路徑。
4. 該層的建置檢查。
5. 提交(類型 `feat`),全部完成後打標籤 `stage-mvp`。

## 階段 E3:在專案根目錄做最終驗證

在專案根目錄,自己跑一遍安裝、建置、啟動,以及完整的驗收流程,並與官方快照比對差異清單,確認與暫存區一致。通過後打 `stage-mvp` 標籤。

## 文件隨階段一起成長

實作不只帶入程式碼,**每個階段也把對應的文件補進專案**,分三種:

| 種類 | 放哪裡 | 內容 |
|---|---|---|
| 官方文件的翻譯 | `docs/official/`,照官方目錄結構放(例如 `docs/official/features/agents.md`) | 該階段功能對應的官方頁面,以英文原文為準翻成繁體中文(官方 `.zh` 是簡體),`.mdx` 轉成 `.md`,結尾放 References 指向原頁 |
| 我們的階段說明 | `docs/`(沿用現有的位置) | 這個功能的歷史故事、涉及哪些檔案群(依誕生日)、要補回哪些檔案、設定、驗證、精簡清單 |
| 我們補充的教學 | `docs/` | 官方沒講到、但我們實作時需要的部分(例如 Windows 上跑 Ollama、本專案的 port 規劃),**有需要才寫** |

### 為什麼官方翻譯要照官方目錄放

官方文件共 192 頁(`configuration` 121、`features` 34、`remote` 9、`development` 7、`quick_start` 4、`local` 4、`user_guides` 4、`toolkit` 3、`mcp_servers` 3、根目錄 3)。頁面名稱會重複(`features/authentication` 與 `configuration/authentication`、多個 `index`),頁面之間也用相對路徑互相連結。照官方目錄放,連結才不會壞,也一眼看得出哪些是官方的、哪些是我們自己寫的。

官方 `development/architecture` 的翻譯已放在 `docs/official/development/architecture.md`,其他自己寫的文件不動。

### 官方頁面與階段的對應

不是 192 頁全部翻,而是**依階段需要的才翻**。已知的對應(階段開始前再逐頁確認):

| 階段 | 官方頁面 |
|---|---|
| MVP | `quick_start`(4 頁)、`local/index`、`local/npm`、`configuration/mongodb`、`configuration/librechat_yaml/ai_endpoints/ollama`、`configuration/librechat_yaml/object_structure/interface`、`development/index`、`development/get_started`、`development/architecture`(已翻)、`user_guides/mongodb`(已翻) |
| 搜尋 | `features/search` |
| 預設 | `user_guides/presets` |
| 檔案與圖片 | `features/upload_as_text`、`features/ocr`、`features/rag_api` |
| Redis 與快取 | `features/resumable_streams` |
| Agents | `features/agents`、`features/agents_api`、`features/subagents`、`features/agent_plugins` |
| MCP | `features/mcp`、`mcp_servers`(3 頁) |
| 程式碼環境 | `features/code_interpreter` |
| 其他功能 | 依功能名稱對應 `features/` 的頁面(例如 `shareable_links`、`memory`、`skills`、`projects`、`scheduled_chats`、`admin_panel`) |

`remote`(9 頁,雲端部署)與 `local/helm_chart` 是我們不使用的部署方式,略過。

### 文件與實作的順序

三種文件的先後不同,依據是「內容是否依賴實作結果」:

| 內容 | 順序 | 理由 |
|---|---|---|
| 官方文件翻譯 | **先行** | 官方原文不依賴我們的實作結果;先翻好,先讀懂這個功能是什麼 |
| 階段說明中的歷史故事、檔案群、誕生時期 | **先行** | 來自歷史資料與靜態分析,不依賴實作 |
| 階段說明中的精簡清單、待實測的結論、實際刪了哪裡 | **實作之後** | 必須是真的做過、跑得起來的結果,不能是推測 |
| 我們補充的教學 | **實作之後** | 只有真的做過,才知道踩了哪些坑、哪些步驟必要 |

之所以這樣分,是因為過程中發生過好幾次「文件先寫、數字後來發現不對」(前端的修剪點、不能砍的目錄、`data-schemas` 的估計、後端漏算啟動層),每次都要回頭改文件。把推測寫成事實,比晚一點寫更糟。

每個階段的流程:

1. 先寫官方翻譯與歷史故事(先行),使用者先讀。
2. **在暫存區實作並驗證**(尚未碰專案)。可以讓安裝與建置在背景跑,同時進行官方翻譯。
3. 依驗證過的結果,補寫精簡清單、待實測的結論、補充教學。
4. 使用者讀完全部。
5. 才把檔案帶進專案,建置檢查,提交。

這與「取得官方檔案放進專案之前,文件先行」的規則一致:暫存區的實驗不算帶入專案,而使用者讀到的文件,在帶入專案之前都已經是完整、已驗證的版本。

### 每個階段新增的文件

1. 該階段的說明文件(歷史故事、檔案群、精簡清單)。
2. 該階段對應的官方頁面翻譯。
3. 必要時的補充教學。
4. 更新 `docs/README.md` 目錄。

## 帶進專案的規模

| 項目 | 估計 |
|---|---|
| 程式碼檔(非測試) | 約 2400 個(後端 306、前端 1033、函式庫約 1065) |
| 非程式碼檔 | 翻譯 44 個(3.7 MB)、前端公開資源約 2 MB、各層的設定檔,數量不多 |
| 測試檔 | 不帶入,與官方的差異列入精簡清單,最終階段補回 |
| 整體 | 官方 `api/`、`client/`、`packages/` 含測試共約 70 MB;MVP-1 不含測試,預期明顯小於這個數字 |

## 已確認的決定

1. **暫存區先做**:同意在暫存區安裝與建置。預計用到約 2 到 3 GB(快照約 75 MB、`node_modules` 約 1.9 GB、建置產物),結束後刪除。
2. **根目錄 `.gitignore`**:換成官方完整版(會忽略建置產物 `dist/`、上傳與日誌資料夾、`.env` 等)。**帶入前要先讓使用者讀過內容**,尤其是 `.env.example` 的例外設定。
3. **測試檔**:MVP-1 不帶測試檔,最終階段補回。
4. **官方文件翻譯的位置**:放在 `docs/official/`,照官方目錄結構。現有的 `architecture.md` 已搬到 `docs/official/development/architecture.md`。

## 風險

- **第一次完整建置**:雖然你本機兩個對照專案證明 Windows 主機可以用 npm 建置,但精簡後的版本沒人跑過。
- **「待實測」項目**:刪除後可能讓聊天失敗,要逐項試。
- **精簡清單的數量**:函式庫、後端、前端合計約 100 到 150 處切斷,每處都要驗證。
- 靜態分析的檔案數是估計,最終以實際建置與執行為準。

## References

- [MVP 設計](mvp-design.md)
- [歷史分群](history-cohorts.md)
- [專案架構(官方翻譯)](official/development/architecture.md):建置順序
- [官方 npm 安裝文件](https://www.librechat.ai/docs/local/npm)
