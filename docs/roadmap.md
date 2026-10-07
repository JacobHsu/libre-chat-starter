# 路線圖

從最小可用版本(MVP-1,標籤 `stage-mvp`)到官方完整版(`v0.8.8-rc4`),還差什麼、依什麼順序補回、每個階段要動哪些檔案。

## 現況與最終版的差距

最終版就是官方 `v0.8.8-rc4`:所有檔案與官方完全相同,包含測試與根目錄的工具與部署檔。下表是階段 1(提示詞)完成後的狀態。

| 項目 | 官方 rc4 | 現在 | 差距 |
|---|---|---|---|
| 全部檔案 | 5492 | 2878 | 少 2614 個 |
| 程式碼檔(非測試) | 3039(後端 372、前端 1421、函式庫 1246) | 2642(87%) | 少 **397 個**(後端 63、前端 334) |
| 測試檔 | 1723 | 0 | 最終階段補回 |
| 精簡過的檔案 | | 11 個(後端 2、前端 9) | 各階段逐步換回官方版 |
| 根目錄 | `.github`(44)、`config`(52)、`e2e`(229)、`helm`(35)、`scripts`(16)、`redis-config`(12)、`otel`(9)、`Dockerfile`、`docker-compose.yml`、`eslint.config.mjs`、`LICENSE` 等 | 都還沒有 | 最終階段(或用到它的功能階段)帶入 |

少的 397 個程式碼檔,分成兩種:

| 種類 | 檔案數 | 意思 |
|---|---|---|
| 完整版會載入,屬於某個功能 | **294**(前端 248、後端 46) | 隨功能階段補回,下面的階段表就是它們的分配 |
| 完整版也不會載入 | **103**(前端 87、後端 16) | 官方 rc4 裡沒有任何入口引用它們(舊版元件、測試用的假資料、效能測試檔等)。放在最後的收尾階段 |

## 每個階段怎麼做

所有階段走同一個節奏:

1. **暫存區實作並驗證**:在官方完整版的副本裡,把這個功能的檔案補回,把對應的精簡檔案換回官方版,建置、啟動、操作確認。
2. **寫文件**:這個功能的說明、涉及的檔案、歷史故事。
3. **你讀完確認**。
4. **把檔案帶進專案**:新增的檔案,以及換回官方版的精簡檔案。
5. **專案內建置驗證**。
6. **你在瀏覽器操作確認**。
7. **打標籤**,例如 `stage-prompts`,進入下一階段。

每個階段開始前,會先逐一核對這個功能的檔案清單,再確認順序與範圍。

## 階段表

順序依各功能的檔案「最早誕生日」(官方加入的先後),見[MVP 設計](mvp-design.md)的功能表。

| 階段 | 功能 | 最早誕生 | 補回的檔案(前端 / 後端) | 要換回官方版的精簡檔案 | 設定 |
|---|---|---|---|---|---|
| 1(已完成,`stage-prompts`) | **提示詞** | 2023-02 | 55 / 2 | 前端:`useSideNavLinks.ts`、`routes/index.tsx`、`hooks/index.ts`、`Providers/index.ts`、`routes/Root.tsx`、`ChatForm.tsx`。後端:`routes/index.js`、`server/index.js` | `interface.prompts` 改成 `true`(只刪掉不會恢復,見[提示詞](features/prompts.md)) |
| 2 | 搜尋(Meilisearch) | 2023-03 | 0 / 0 | 無 | 路由與函式庫已在專案內,階段內容是啟動 Meilisearch,設定 `MEILI_HOST`、`MEILI_MASTER_KEY` 並驗證 |
| 3 | 外掛 | 2023-03 | 6 / 0 | 後端:`server/index.js`(部署外掛的初始化) | |
| 4 | 預設 | 2023-04 | 0 / 0 | 無 | 路由與函式庫已在專案內,階段內容是啟用並驗證 |
| 5 | 檔案與圖片 | 2023-04 | 4 / 0 | 前端:`useSideNavLinks.ts`。後端:`server/index.js`(過期檔案清理) | |
| 6 | OAuth 與 OpenID | 2023-05 | 0 / 2 | 後端:`routes/index.js`、`server/index.js`(`/oauth` 路由) | 設定社群登入或 OpenID 的環境變數 |
| 7 | Redis 與快取 | 2023-09 | 0 / 0 | 無 | 程式碼已在專案內,階段內容是啟動 Redis 並設定連線 |
| 8 | 分享 | 2024-05 | 0 / 3 | 後端:`routes/index.js`、`server/index.js`(`/api/share`) | |
| 9 | 管理面板 | 2024-06 | 0 / 10 | 後端:`routes/index.js`、`server/index.js`(`/api/admin/*`) | |
| 10 | Trace 與可觀測(含洞察) | 2024-06 | 21 / 3 | 前端:`ChatView.tsx`、`Header.tsx`、`HeaderMenu.tsx`、`routes/index.tsx`。後端:`routes/index.js`、`server/index.js` | `interface.traceViewer` |
| 11 | 書籤與標籤 | 2024-07 | 7 / 1 | 前端:`useSideNavLinks.ts`。後端:`routes/index.js`、`server/index.js` | `interface.bookmarks` 改回開啟 |
| 12 | Agents(建構器與市集) | 2024-08 | 96 / 3 | 前端:`useSideNavLinks.ts`、`routes/index.tsx`、`Landing.tsx`、`BadgeRow.tsx`、`hooks/MCP/index.ts`。後端:`routes/index.js`、`server/index.js`(工具核准 hooks) | `interface.marketplace` 改回開啟 |
| 13 | Assistants(OpenAI) | 功能表未列,階段開始前確認順序 | 23 / 15 | 前端:`useSideNavLinks.ts`。後端:`routes/index.js`、`server/index.js` | |
| 14 | 程式碼環境 | 2024-08 | 0 / 1 | 後端:`routes/index.js`、`server/index.js`(生命週期協調器) | |
| 15 | MCP | 2024-12 | 19 / 3 | 前端:`useSideNavLinks.ts`。後端:`routes/index.js`、`server/index.js`(OAuth 重新連線) | `interface.mcpServers` 改回開啟 |
| 16 | 記憶 | 2025-06 | 12 / 1 | 前端:`useSideNavLinks.ts`。後端:`routes/index.js`、`server/index.js` | `interface.memories` 改回開啟 |
| 17 | Skills | 2026-04 | 38 / 1 | 前端:`useSideNavLinks.ts`、`routes/index.tsx`。後端:`routes/index.js`、`server/index.js`(部署技能) | `interface.skills` 改回開啟 |
| 18 | 專案 | 2026-06 | 10 / 1 | 前端:`routes/index.tsx`、`ConversationsSection.tsx`。後端:`routes/index.js`、`server/index.js` | |
| 19 | 排程與觸發 | 2026-06 | 11 / 1 | 前端:`useSideNavLinks.ts`。後端:`routes/index.js`、`server/index.js`(排程引擎) | `interface.schedules` |

階段表合計:前端 302、後端 47(階段 1 已補回 55 與 2,剩前端 247、後端 45);另有 `hooks/useInfiniteScroll.ts` 與 `app/clients/index.js` 兩個沒有歸屬的檔案,放進收尾階段。

「精簡檔案」欄原本有 15 個檔案(階段 1 之後剩 11 個),有幾個被多個階段共用。例如前端的 `useSideNavLinks.ts` 在提示詞、檔案、書籤、Agents、Assistants、MCP、記憶、Skills、排程各階段都會再補回一段。做法是每個階段把**該功能那一段**從官方完整版補回,最後一個階段做完,整個檔案就與官方完全相同。後端的 `server/index.js` 與 `routes/index.js` 同理。精簡的細節見[後端精簡清單](api/mvp-trim.md)與[前端精簡清單](client/mvp-trim.md)。

## MVP-1 已經包含的功能

這些功能的程式碼與畫面已在專案內,不需要階段:

| 功能 | 狀態 |
|---|---|
| 對話與訊息 | 核心 |
| 登入與驗證 | 核心(註冊、登入、重設密碼等) |
| 自訂端點與設定檔 | 提前使用,用來接 Ollama |
| 語音 | 程式碼保留 |
| Artifacts 與 Mermaid | 程式碼保留 |
| Agents 的聊天管線 | 聊天本身就走這條管線,所以保留(建構器與市集才是階段 12) |

## 收尾階段

| 階段 | 內容 |
|---|---|
| 收尾 1:不屬於任何功能的檔案 | 103 個官方完整版也不會載入的檔案,加上 2 個沒有歸屬的檔案 |
| 收尾 2:測試檔 | 1723 個,補回後各層的 `jest` 設定才有對象 |
| 收尾 3:根目錄 | `.github`、`config`、`e2e`、`helm`、`scripts`、`redis-config`、`otel`、`Dockerfile`、`docker-compose.yml`、`eslint.config.mjs`、`LICENSE` 等 |
| 收尾 4:對照官方 | 自動比對專案與官方 rc4,差異必須為零,`package-lock.json` 與官方完全相同 |

## 之後:MVP-2 評估

目前的 MVP-1 是**功能與畫面上的最小**,不是檔案數上的最小(仍有 85% 的程式碼)。更小的版本需要切共用基礎的「中樞」,風險高,是否做、怎麼做,等所有階段完成後再評估。見[MVP 設計](mvp-design.md)。

## 注意事項

- **順序是計畫,不是承諾。** 各功能依檔案誕生日排序,每個階段開始前會核對實際的檔案清單與相依關係,順序可能調整。
- **誕生日有雜訊。** 提示詞、管理面板、Trace 的「最早誕生」比中位數早很多,多半是名稱剛好相符的零星檔案,不是功能主體的時間。
- 階段表的檔案數,是用「官方完整版從入口(前端 `main.jsx`、後端 `server/index.js`)追蹤引用得到、MVP-1 沒帶入」的檔案,依路徑歸到功能。實作該階段時會再逐一核對。

## References

- [MVP 設計](mvp-design.md):23 個功能表與 MVP-1 的處理
- [歷史分群](history-cohorts.md):檔案誕生日分群
- [專案建立順序](build-order.md):官方的歷史時間軸與 release 核對
- [MVP 實作計畫](mvp-implementation.md):階段節奏與已完成的進度
- [後端精簡清單](api/mvp-trim.md)、[前端精簡清單](client/mvp-trim.md):目前剩下的 11 個精簡檔案
- [提示詞](features/prompts.md):階段 1
- [Project Architecture(官方文件翻譯)](official/development/architecture.md)
