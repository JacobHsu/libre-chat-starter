# 管理員洞察(Admin Insights)

檢視 LibreChat 在 MongoDB 中的使用量與活動，範圍限定在所屬租戶。

Admin Insights 是需要選擇開啟的儀表板，用來檢視存在部署的主要 MongoDB 中的 LibreChat 活動。它依時間報告對話數、不重複使用者數、已儲存的訊息數與記錄的 token 數，並提供使用者排行、流失使用者與最近對話的檢視。

## 啟用 Insights

在 `.env` 設定 `ENABLE_INSIGHTS=true`,然後重新啟動 LibreChat:

```sh
# .env
ENABLE_INSIGHTS=true
```

對有權限的帳號啟用後,**Insights** 會出現在桌面版的側邊欄與行動版的面板切換器。停用時，存取與資料的路由回傳 `404`,導覽項目保持隱藏。

## 存取需求

登入的帳號必須同時通過三項檢查:

- 具有 `ADMIN` 角色
- 擁有 `access:admin` 系統能力
- 擁有 `read:insights` 系統能力

用[管理面板](admin_panel.md)指派系統能力。每一次 Insights 查詢，都依登入的管理員決定租戶範圍。租戶管理員只看得到自己租戶的紀錄;沒有租戶的管理員，只看得到沒有租戶範圍的紀錄。

> **敏感的營運資料**
>
> Insights 可能顯示使用者名稱與 email、對話 ID,以及最近對話的第一則訊息。只把 `read:insights` 授予應該檢視這些資料的管理員。

## 儀表板指標

四個摘要指標及其每日走勢小圖，依選定的日期範圍計算:

- **Conversations(對話)**:範圍內建立的對話
- **Unique users(不重複使用者)**:有相符的已儲存訊息活動的使用者
- **Messages(訊息)**:歸屬於這些使用者、已儲存的使用者與助理訊息
- **Tokens**:訊息記錄的 `tokenCount` 值的總和

儀表板還包含:

- **Top users(使用者排行)**:依訊息數排序，最多 8 位使用者，附上他們的對話與訊息總數
- **Churned users(流失使用者)**:最多 8 位使用者，他們最後一次傳給助理的訊息，在選定範圍內滿 28 天
- **Latest conversations(最新對話)**:分頁的對話列表，有日期、擁有者、第一則訊息、已儲存的訊息數與記錄的 token 數

這些是資料庫的活動指標，不是計費或 Langfuse 的分析。Token 總數取決於訊息儲存時的值，不會計算金額成本。

## 日期範圍與搜尋

預設範圍是 7 天。預設選項有最近 24 小時、7 天或 30 天。自訂範圍最多 30 個日曆天，並依瀏覽器目前的時區分組。

Agent 篩選器使用明確的核取方塊，並有固定的 **All agents**(所有 Agent)控制項，可以一次選取或清除所有可存取的 Agent。可用的 Agent 超過 10 個時，可以用不分大小寫的方式搜尋名稱，而且不會丟掉目前結果之外已選取的項目。

最近對話的搜尋，比對對話 ID 或使用者身分。搜尋從 3 個字元開始，最多接受 200 個字元，最新對話表格維持每頁 10 列的分頁。摘要卡片、使用者排行與流失指標，仍然代表選定的日期範圍，而不是搜尋結果的子集。

## 資料與部署說明

Insights 直接查詢現有的 Conversation、Message 與 User 集合，不需要另外的分析資料庫。結果只反映已儲存的紀錄：暫時的或已刪除、不在 MongoDB 中的資料不會出現。API 在執行彙總之前，會限制自訂範圍、結果列表、頁面大小、搜尋輸入與租戶範圍。

部署開關見 [`ENABLE_INSIGHTS`](https://www.librechat.ai/docs/configuration/dotenv#admin-insights)。

## References

- [Admin Insights(官方文件)](https://www.librechat.ai/docs/features/insights)
