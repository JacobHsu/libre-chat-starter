# 訊息搜尋(Message Search)

用 LibreChat 整合的 Meilisearch,快速搜尋過去的對話。

LibreChat 整合了 **Meilisearch**,提供一種快速又有效率的方式來搜尋過去的對話,提升使用體驗。Meilisearch 是強大的開源搜尋引擎,以速度快、容易使用著稱,很適合像 LibreChat 這種需要快速存取大量資料的應用。

![搜尋對話中的 banana](https://github.com/danny-avila/LibreChat/assets/32828263/60ad41b0-1869-4ee9-848b-502b3a5557b5)

這個整合讓使用者可以:

- 從側邊欄搜尋對話標題、標籤與已建立索引的訊息內容
- 當對話的中繼資料(metadata)或其中某一則訊息符合時,開啟該對話
- 在整段對話歷史中使用錯字容忍(typo tolerance)與邊輸入邊顯示的即時結果
- 搜尋訊息與分享連結的候選項目時,每頁筆數可超過 Meilisearch 舊版請求預設的 20 筆

如果想依日期、端點、附件、分享或書籤來縮小對話清單,而不用輸入查詢字串,請用[對話清單選單](https://www.librechat.ai/docs/features/navigation#filter-and-sort-the-chat-list)。

LibreChat 會先合併對話索引與訊息索引的符合結果,再載入畫面上看得到的那一頁對話。搜尋受 Meilisearch 設定的 `pagination.maxTotalHits` 限制;LibreChat 查詢使用的預設上限是 1,000 筆。設定、同步與重新建立索引的行為,請見 [Meilisearch 設定指南](https://www.librechat.ai/docs/configuration/meilisearch)。

> **是關鍵字搜尋,不是語意搜尋**
>
> 對話搜尋是**以關鍵字為基礎**的。它比對你輸入的字詞,所以搜尋「banana」會找到含有「banana」的訊息;如果一則訊息講的是「水果」但從沒用到這個字,就找不到。
>
> 對話歷史沒有向量搜尋或語意搜尋。LibreChat 裡的語意檢索是用在**上傳的檔案**,不是聊天紀錄:[RAG API](https://www.librechat.ai/docs/features/rag_api) 會把你附加的文件做嵌入(embedding),再用 PostgreSQL + pgvector 依語意檢索。這是兩套獨立的系統,啟用其中一套不影響另一套。

## References

- [Message Search(官方文件)](https://www.librechat.ai/docs/features/search)
