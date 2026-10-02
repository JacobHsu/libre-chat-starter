# 專案建立順序

LibreChat 從空白專案長成現在結構的過程,以及這對學習順序的意義。

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

## 學習順序的兩種切法

| | 演進順序 | 依賴順序(由底層往上) |
|---|---|---|
| 依據 | 上方時間軸 | [專案架構](architecture.md)的相依表 |
| 起點 | 早期的小型版本:前端 + Express + MongoDB | `packages/data-provider` |
| 優點 | 符合「從空白專案逐步長出來」;早期版本小,能實際跑起來 | 對應現在的程式碼,學到的就是現在的結構 |
| 限制 | 早期程式碼已被改寫,現在的 `main` 看不到,要取得歷史提交的檔案 | 看不出為什麼會有這些拆分 |

## References

- [提交歷史(官方 repo)](https://github.com/LibreChat-AI/LibreChat/commits/main)
- 本文引用的提交可用網址 `https://github.com/LibreChat-AI/LibreChat/commit/<提交編號>` 查看,例如 [`92860a1`](https://github.com/LibreChat-AI/LibreChat/commit/92860a1)(adds express server)、[`04e4259`](https://github.com/LibreChat-AI/LibreChat/commit/04e4259)(Move data provider to shared package)
