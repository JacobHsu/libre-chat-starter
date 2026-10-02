# 專案建立順序

LibreChat 從空白專案長成現在結構的過程,以及我們據此規劃的學習順序。

## 時間軸

依官方 repo 的提交紀錄整理。「最早提交」是指第一個動到該路徑的提交。

| 日期 | 提交 | 事件 |
|---|---|---|
| 2022-10-20 | `466dd01` | 第一個提交 `(init)`,只有 3 個範本檔:`.gitignore`、`.vscode/settings.json`、`_PRESS-RELEASE.md` |
| 2023-02-04 | `74232d7` | 第一份 `package.json`(`npm init -y` 產生),只有 React 與 webpack,**純前端** |
| 2023-02-05 | `92860a1` | `adds express server`:加入 Express 伺服器 |
| 2023-02-05 | `27f7276` | `working SSE stream`:對話回應以 SSE(伺服器推送事件)串流 |
| 2023-02-06 | `254f9d7`、`232a823` | 連接 MongoDB,儲存所有訊息與對話;新增取得對話列表的端點 |
| 2023-02-07 | `36ac055` | 前端狀態管理改用 Redux |
| 2023-02-12 | `ed44daf` | Express 重構成路由 |
| 2023-03-06 | `fca546a`、`f5e0797` | 為了 Docker,把後端與前端整理進 `api/` 與 `client/` |
| 2023-07-04 | `04e4259` | `Move data provider to shared package`:前後端共用的程式碼抽出成 `packages/data-provider` |
| 2025-03-07 | `b51cd21` | `Move DB Models to @librechat/data-schemas`:資料庫模型抽出成 `packages/data-schemas` |
| 2025-06-07 | `29ef91b` | `packages/api` 第一次出現(隨 User Memories 功能提交) |
| 2025-07-27 | `7919745` | `Move Shared Components to @librechat/client`:共用元件抽出成 `packages/client` |

## 建立的邏輯

### 1. 從空白專案開始:先做出能用的最小產品

- **第 1 天(2023-02-04)**:前端先行。React + webpack,先做出聊天輸入框與畫面。
- **第 2 天(2023-02-05)**:同一天加入 Express 伺服器,並做出 SSE 串流回應,讓 AI 的回答能一個字一個字顯示。
- **第 3 天(2023-02-06)**:加入 MongoDB,把訊息與對話存起來,對話能重新載入。
- 接著一週內:Redux 管理狀態、清除與重新命名對話、錯誤處理、深色模式。

所以「從前端還是後端開始」的答案是:**前端先,後端緊接在一天之後,資料庫再隔一天。** 三者合起來,才是一個能對話並保存紀錄的最小產品。

### 2. 專案長大後,才「拆分」與「抽出」

- 2023-03:前後端原本在同一層,為了 Docker 拆成 `api/` 與 `client/`。
- 之後前後端共用的部分,陸續從 `api/` 與 `client/` 抽出成 `packages/`,提交訊息都是「Move ... to ...」:
  - 2023-07 `data-provider`(共用的 API 型別、端點、data-service)
  - 2025-03 `data-schemas`(資料庫模型)
  - 2025-06 `packages/api`(新的後端 TypeScript 程式碼)
  - 2025-07 `packages/client`(共用的前端元件)

### 3. 結論

- `packages/` **不是一開始設計的**,是專案成長後重構抽出來的。
- 現在的相依關係(`data-provider` 在最底層,其他工作區依賴它)是**演進的結果**,不是建立的先後。
- 現在的建置順序(`data-provider` → `data-schemas` → `packages/api` → `packages/client` → `client`)是**依賴順序**,不是歷史順序。

## 我們的做法:現行架構 × 開發史 × 先有最小可用

### 原則

- **以現行架構為準**,固定使用官方 `v0.8.8-rc4`(與本機對照實例相同版本)。不回到早期歷史版本的程式碼,歷史用來說明「為什麼加、何時加」。
- **官方程式碼能不改就不改**。唯一的例外是檔案暫時是精簡版,之後換回完整的官方版,最終必須與官方完全一致。
- **精簡只刪不寫**:只能刪除程式碼(例如某個 `require` 與對應的 `app.use`),不得新增自己寫的邏輯。
- 精簡的差異以「與官方快照自動比對」列出,每階段結束檢查一次,最終階段差異必須為零。

### 最小可用(MVP):功能上的最小

畫面上只有登入、對話、對話歷史;其他功能用精簡接線與 `librechat.yaml` 的 `interface` 開關隱藏。模型使用本機 Ollama,透過 `librechat.yaml` 的自訂端點。

驗收標準:**註冊 → 登入 → 新對話 → 送出訊息 → 回覆串流顯示 → 重新整理後歷史仍在。**

### MVP 的規模

以下為靜態分析的估計(追蹤 `require`、`import` 關係,不執行程式),非測試的程式碼檔:

| 層 | 完整 | MVP | 精簡方式 |
|---|---|---|---|
| 後端 `api/` | 356 | 約 266 | 刪除 `server/index.js` 與 `routes/index.js` 的路由註冊;聊天走 `/api/agents/chat`,所以 agents 路由必須保留 |
| 前端 `client/` | 1329 | 約 1001 | 在 29 個檔案刪除 57 條 import 與使用處,砍掉 17 個功能目錄 |
| 函式庫 `packages/*` | 1245 | 約 810 | 刪除各函式庫入口 `index.ts` 的 `export` 行 |
| **合計** | **約 2930** | **約 2077(71%)** | |

各函式庫 MVP 需要的比例:`data-provider` 約 95%、`data-schemas` 約 50%、`packages/api` 約 76%、`packages/client` 至少 35%(低估)。

LibreChat 的結構高度整合:核心很大,功能只是疊在核心上的小接線。所以 MVP 仍有約七成的檔案,而後續每個功能階段多半只增加 1 到 4 個檔案(例外是檔案上傳約 +27、Agents 約 +30)。**階段的學習價值在於功能是什麼、當年為什麼加、如何開啟與運作,而不是檔案數量的增加。**

### 功能階段(順序依官方開發史)

下表日期以官方 release 說明核對。「核對方式」欄標示依據是 release 說明,還是只有提交紀錄(日期為近似值)。

| 階段 | 功能 | 日期 | 核對方式 |
|---|---|---|---|
| MVP | 註冊、登入、對話、保存、一個模型端點 | 2023-03 起 | 提交紀錄:`api/` 拆出(2023-03-06)、多使用者登入(2023-03-13) |
| 2 | 對話搜尋(Meilisearch) | 2023-03-16 | release `v0.0.4` 說明「Message search」 |
| 3 | 預設(presets) | 2023-04-05 | release `v0.3.0` 說明「Introducing Presets」 |
| 4 | Redis(擴展用,初期支援) | 2023-10-22 | release `v0.6.0` 說明「Initial Redis Support for Scalability」 |
| 5 | 圖片與檔案上傳(Vision) | 2023-11-16 | release `v0.6.1` 說明「GPT-4-Vision support」 |
| 6 | 自訂端點與 `librechat.yaml` | 2024-01-19 | release `v0.6.6` 說明「Config File & Custom Endpoints」(MVP 為了接 Ollama 會提前使用) |
| 7 | RAG(跟檔案對話) | 約 2024-03 | 提交紀錄:`rag.yml` 出現(2024-03-20);release 說明未直接核對 |
| 8 | Agents | 約 2024-08 至 10 | 提交紀錄:agents 路由出現(2024-08-31);release `v0.7.5` 說明提到 agents 修正,首次發布版本未核對(MVP 因聊天走 agents 路由,會提前使用) |
| 9 | MCP | 2024-12-20 | release `v0.7.6` 說明「MCP Support (Tools)」 |

Helm 是 Kubernetes 部署,本機不使用,略過。

### 每個階段的做法

文件先行(功能的歷史故事、涉及檔案以表格列出檔名與用途、設定、驗證、精簡清單)→ 讀懂 → 取得檔案(新增的,以及把精簡版換回完整版)→ 驗證 → 確認 → 打 git 標籤(如 `stage-mvp`)→ 下一階段。

### 分析的限制

- 靜態分析是用文字比對 `require` 與 `import`,動態載入與改名匯出(例如 `export { default as X }`)會漏,規模數字僅供規劃,最終以實際建置與執行為準。
- 提交紀錄與 release 說明都可能晚於功能真正誕生的時間;標示「提交紀錄」的日期是近似值。
- 階段表中標示「未核對」的項目,到該階段開始前再逐一確認。

## References

- [官方 repo 提交歷史](https://github.com/LibreChat-AI/LibreChat/commits/main)
- [官方 releases](https://github.com/LibreChat-AI/LibreChat/releases)
- [官網更新日誌](https://www.librechat.ai/changelog)
- 引用的 release:[v0.0.4](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.0.4)、[v0.3.0](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.3.0)、[v0.6.0](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.0)、[v0.6.1](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.1)、[v0.6.6](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.6)、[v0.7.5](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.7.5)、[v0.7.6](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.7.6)
- 本文引用的提交可用網址 `https://github.com/LibreChat-AI/LibreChat/commit/<提交編號>` 查看,例如 [`92860a1`](https://github.com/LibreChat-AI/LibreChat/commit/92860a1)(adds express server)、[`04e4259`](https://github.com/LibreChat-AI/LibreChat/commit/04e4259)(Move data provider to shared package)
