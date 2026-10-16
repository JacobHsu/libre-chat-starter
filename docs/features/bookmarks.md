# 書籤(Bookmarks)

替對話加上自訂的書籤(例如「工作」「研究」),之後在對話清單依書籤篩選。這份文件說明書籤怎麼用、前後端怎麼接，以及階段 10 做了什麼。

> 程式碼和 API 裡叫 **tag**(`/api/tags`、`conversationTag`),介面上叫書籤(Bookmarks)。兩者指的是同一個東西。

## 這個功能做什麼

| 能做的事 | 在哪裡 |
|---|---|
| 建立、改名、刪除書籤 | 側邊欄的書籤面板(`SidePanel/Bookmarks`) |
| 替對話加上或拿掉書籤 | 對話標題列的書籤選單(`Chat/Menus/BookmarkMenu.tsx`) |
| 依書籤篩選對話 | 對話清單的 **Filter and sort chats** → **Bookmarks**([Navigation](https://www.librechat.ai/docs/features/navigation):只對能使用書籤的角色顯示) |

書籤是個人的：每個使用者有自己的書籤清單，別人看不到。每個書籤記錄它被用在幾段對話上(`count`)。

## 這個階段做了什麼

| 位置 | 檔案 | 動作 |
|---|---|---|
| 前端 | `client/src/components/SidePanel/Bookmarks/`(8 個) | 新增：書籤面板(卡片、清單、表格、空狀態等) |
| 前端 | `client/src/hooks/Nav/useSideNavLinks.ts` | 補回書籤面板的 `import` 與 `links.push` 區塊 |
| 後端 | `api/server/routes/tags.js` | 新增:`/api/tags` |
| 後端 | `api/server/routes/index.js`、`api/server/index.js` | 補回 `tags` 的 `require`、匯出與掛載 |
| 設定 | `librechat.yaml` | `interface.bookmarks` 從 `false` 改成 `true` |

書籤的其他部分在 MVP-1 就已經在專案內：書籤表單與對話框(`components/Bookmarks/`)、標題列的 `BookmarkMenu.tsx`、`BookmarkContext`、`useBookmarkItems` 等 hooks,以及資料層 `data-provider/tags.ts`。

官方 rc4 的 `components/Chat/Menus/Bookmarks/BookmarkMenuItems.tsx` 沒有任何地方引用，不在這個階段補回，放在收尾階段。

## 歷史

| 時間 | 事件 |
|---|---|
| 2024-07 | 對話書籤加入(`feat: Conversation Bookmarks`),同時有 `routes/tags.js`、書籤面板與書籤表單 |
| 2024-08 | 修正書籤的狀態問題 |
| 2025-03 | 資料模型搬到 `@librechat/data-schemas`(`schema/conversationTag.ts`) |

## 怎麼運作

### 權限開關

`tags.js` 的每一條路由都先經過 `checkBookmarkAccess`,檢查角色的 `BOOKMARKS` 權限中的 `USE`。這個權限由 `librechat.yaml` 的 `interface.bookmarks` 在**每次啟動時**寫入角色(官方說明見 [interface 物件的 `bookmarks`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#bookmarks),正式的權限管理建議改用[管理面板](admin-panel.md))。

rc4 實測:

| `interface.bookmarks` | `USER` 的 `BOOKMARKS.USE` | `ADMIN` 的 `BOOKMARKS.USE` | `/api/tags` |
|---|---|---|---|
| `false` | `false` | `false` | 兩種角色都 403 `Forbidden: Insufficient permissions` |
| `true`(重新啟動後) | `true` | `true` | 兩種角色都 200 |

前端用同一個權限(`useHasAccess`)決定要不要顯示書籤面板。

### API

| 方法與路徑 | 做什麼 |
|---|---|
| `GET /api/tags` | 列出自己的書籤 |
| `POST /api/tags` | 建立書籤。欄位:`tag`、`description`(選用);`addToConversation: true` 加上 `conversationId` 可以建立的同時加到對話上 |
| `PUT /api/tags/:tag` | 修改書籤(例如改名:`{ "tag": "新名稱" }`) |
| `DELETE /api/tags/:tag` | 刪除書籤，同時從對話上拿掉 |
| `PUT /api/tags/convo/:conversationId` | 設定某段對話的書籤:`{ "tags": ["Work", "Study"] }` |

依書籤篩選對話用的是對話清單的 API:`GET /api/convos?tags=Work`。

## 驗證

在暫存區(埠 3095、全新資料庫)補回並重新建置前端後:

| 項目 | 結果 |
|---|---|
| MVP 的 API 驗收 11 項 | 全部通過 |
| `bookmarks: false` | `USER`、`ADMIN` 的 `BOOKMARKS.USE` 都是 `false`;`/api/tags` 都是 403 |
| 改成 `true` 並重新啟動(同一個資料庫) | 兩個角色都變成 `true`;`/api/tags` 都是 200 |
| 建立「Work」並加到對話上 | 200,`count: 1` |
| 建立「Research」 | 200,`count: 0` |
| `GET /api/convos?tags=Work` / `?tags=Research` | 找到那段對話 / 0 筆 |
| 「Research」改名為「Study」 | 200 |
| 改名成已經存在的書籤名稱 | 500 `Internal server error`;原因只記在後端日誌:`Tag already exists` |
| 把對話的書籤設成 `["Work", "Study"]` | 200;`?tags=Study` 找得到 |
| 一般使用者的書籤清單 | 空的(書籤是個人的) |
| 刪除「Work」 | 200;`?tags=Work` 變 0 筆,清單只剩「Study」 |

## References

- [Navigation(官方文件)](https://www.librechat.ai/docs/features/navigation):對話清單的 Bookmarks 篩選
- [interface 物件:bookmarks(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#bookmarks)
- [api/server/routes/tags.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/tags.js)
- [client/src/components/SidePanel/Bookmarks/(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/Bookmarks)
- [packages/data-schemas/src/schema/conversationTag.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/data-schemas/src/schema/conversationTag.ts)
- [Trace 與可觀測](observability.md):前一個階段
- [路線圖](../roadmap.md):階段 10
