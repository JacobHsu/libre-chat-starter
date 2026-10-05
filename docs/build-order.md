# 專案建立順序

LibreChat 從空白專案長成現在結構的過程,以及我們據此規劃的學習方式。

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

## 我們的做法

以上是歷史上專案怎麼長出來的。我們的學習則是反過來:**從現行架構出發,用歷史決定順序,逐段補回功能。** 詳細做法分在兩份文件:

- [歷史分群](history-cohorts.md):rc4 每個檔案的誕生日,以及為什麼不能直接拿早期誕生的檔案當 MVP。
- [MVP 設計](mvp-design.md):MVP 的定義與驗收、23 個功能與它們的誕生時期、後端與前端與函式庫各自要刪什麼、驗證方式。

幾條原則,供對照:

- 固定使用官方 `v0.8.8-rc4`,不回到早期版本的程式碼。
- 官方程式碼能不改就不改;精簡只刪不寫,精簡過的檔案之後換回完整的官方版,最終與官方一致。
- 階段順序依誕生日;MVP 切多深依功能。

## 功能首次出現在哪個 release

下表是用官方 release 說明核對的日期,補充 [MVP 設計](mvp-design.md) 裡用檔案誕生日排的順序。

| 功能 | 日期 | 核對方式 |
|---|---|---|
| 對話搜尋(Meilisearch) | 2023-03-16 | release `v0.0.4` 說明「Message search」 |
| 預設(presets) | 2023-04-05 | release `v0.3.0` 說明「Introducing Presets」 |
| Redis(擴展用,初期支援) | 2023-10-22 | release `v0.6.0` 說明「Initial Redis Support for Scalability」 |
| 圖片與檔案上傳(Vision) | 2023-11-16 | release `v0.6.1` 說明「GPT-4-Vision support」 |
| 自訂端點與 `librechat.yaml` | 2024-01-19 | release `v0.6.6` 說明「Config File & Custom Endpoints」 |
| MCP | 2024-12-20 | release `v0.7.6` 說明「MCP Support (Tools)」 |
| RAG(跟檔案對話) | 約 2024-03 | 只有提交紀錄:`rag.yml` 出現(2024-03-20),release 說明未直接核對 |
| Agents | 約 2024-08 至 10 | 只有提交紀錄:agents 路由出現(2024-08-31);release `v0.7.5` 說明提到 agents 修正,首次發布版本未核對 |

Helm 是 Kubernetes 部署,本機不使用,略過。

### 限制

- 提交紀錄與 release 說明都可能晚於功能真正誕生的時間;標示「只有提交紀錄」的日期是近似值,到該階段開始前再逐一確認。
- 其他功能(例如 Skills、排程、專案)沒有逐一用 release 核對,日期以[歷史分群](history-cohorts.md)的檔案誕生日為準。

## References

- [官方 repo 提交歷史](https://github.com/LibreChat-AI/LibreChat/commits/main)
- [官方 releases](https://github.com/LibreChat-AI/LibreChat/releases)
- [官網更新日誌](https://www.librechat.ai/changelog)
- 引用的 release:[v0.0.4](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.0.4)、[v0.3.0](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.3.0)、[v0.6.0](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.0)、[v0.6.1](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.1)、[v0.6.6](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.6.6)、[v0.7.5](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.7.5)、[v0.7.6](https://github.com/LibreChat-AI/LibreChat/releases/tag/v0.7.6)
- 本文引用的提交可用網址 `https://github.com/LibreChat-AI/LibreChat/commit/<提交編號>` 查看,例如 [`92860a1`](https://github.com/LibreChat-AI/LibreChat/commit/92860a1)(adds express server)、[`04e4259`](https://github.com/LibreChat-AI/LibreChat/commit/04e4259)(Move data provider to shared package)
