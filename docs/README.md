# 學習文件

依建議的閱讀順序列出。

| 順序 | 文件 | 說明 |
|---|---|---|
| 1 | [repository-structure](repository-structure.md) | 官方 repo 根目錄的 19 個資料夾與 30 個檔案,依用途分組 |
| 2 | [package-json](package-json.md) | 根目錄 package.json 的欄位與 141 條 scripts 分組 |
| 3 | [architecture](official/development/architecture.md) | Monorepo 工作區結構、關鍵原則、建置與安裝指令 |
| 4 | [mongodb](mongodb.md) | 為什麼使用 MongoDB,以及用 Docker 啟動學習專用的 MongoDB |
| 5 | [build-order](build-order.md) | 專案從空白長成現在結構的時間軸與建立邏輯,以及功能首次出現的 release 核對 |
| 6 | [history-cohorts](history-cohorts.md) | 依 git 歷史算出 rc4 每個檔案的誕生日,把現在的程式碼分成 9 個時期,以及為什麼不能直接拿早期檔案當 MVP |
| 7 | [mvp-design](mvp-design.md) | 最小可用版本的設計:MVP 定義與驗收、23 個功能與誕生時期、後端與前端與函式庫的取捨、驗證方式 |
| 8 | [mvp-implementation](mvp-implementation.md) | MVP-1 的實作計畫:先在暫存區做出並驗證,再逐層帶入專案 |
| 9 | [data-provider](packages/data-provider.md) | `packages/data-provider`:最底層的函式庫,前後端共用的型別、端點與請求,以及該讀哪些檔案 |
| 10 | [local-testing](local-testing.md) | 本機驗證筆記:`.env`、Ollama 設定、驗收流程,以及 curl 被封鎖等踩到的坑 |
| 11 | [data-schemas](packages/data-schemas.md) | `packages/data-schemas`:資料庫層,Mongoose 的 schema、model 與所有讀寫方法,以及對話與訊息怎麼存 |
| 12 | [api](packages/api.md) | `packages/api`:後端的新版業務邏輯,Agents、串流、MCP、檔案、驗證等 48 個資料夾的分工,以及訊息送出後該讀哪些檔案 |
| 13 | [client](packages/client.md) | `packages/client`:前端共用的 React UI 元件庫(按鈕、對話框、圖示、主題),與應用 `client/` 的分工 |
