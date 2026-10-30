# 前端精簡清單(MVP-1)

MVP-1 的前端改 13 個檔案、**沒有新增任何自己寫的邏輯**。再加上不帶入只服務被延後功能的檔案,以及 `librechat.yaml` 的 `interface` 開關。最終階段這些檔案會換回官方完整版,其餘檔案補回。

各階段補回功能時,會從清單拿掉對應的項目。階段 1(提示詞)換回了 4 個檔案、補回 `useSideNavLinks.ts` 與 `routes/index.tsx` 的提示詞部分,階段 4(檔案與圖片)又補回 `useSideNavLinks.ts` 的檔案面板與 `SidePanel/Files` 目錄,階段 9(Trace 與可觀測)換回了 `ChatView.tsx`、`Header.tsx`、`HeaderMenu.tsx`,並補回 `routes/index.tsx` 的 Insights 部分與 `Chat/Trace`、`Insights` 兩個目錄,階段 10(書籤)補回 `useSideNavLinks.ts` 的書籤面板與 `SidePanel/Bookmarks` 目錄,階段 11a(Agent 建構器)補回 `useSideNavLinks.ts` 的建構器面板、換回 `BadgeRow.tsx` 與 `hooks/MCP/index.ts`,並補回 `SidePanel/Agents` 目錄,階段 11b(Agent 市集)補回 `routes/index.tsx` 的市集路由、換回 `Landing.tsx`,並補回 `components/Agents` 目錄,階段 12(Assistants)補回 `useSideNavLinks.ts` 的 Assistants 建構器面板與 `SidePanel/Builder` 目錄,目前的狀態是**改 3 個檔案、刪 100 行**(MVP-1 當時是 13 個檔案、刪 247 行、改 1 行)。下面的數字都是目前的狀態。

## 規則

- 只刪不寫:刪掉對延後功能的 `import`,以及使用它的那一個區塊(陣列項目、JSX 元素、路由項目)。
- MVP-1 唯一的修改(不是純刪除)是 `components/Chat/Header.tsx` 刪掉 `trace={trace}` 屬性,階段 9 已換回官方版。現在全部是純刪除。
- 流程:先刪掉功能目錄,用 Vite 建置,依錯誤訊息找出還被引用的地方,逐一處理,直到建置成功。

## 還沒補回的 6 個功能目錄

| 目錄 | 功能 |
|---|---|
| `components/SidePanel/MCPBuilder` | MCP 伺服器面板(其中 `MCPServerDialog` 已隨階段 11a 帶入) |
| `components/SidePanel/Memories`、`Schedules` | 記憶、排程面板 |
| `components/Skills` | Skills(其中 `dialogs` 已隨階段 11a 帶入) |
| `components/Plugins` | 外掛(其中 `Store` 已隨階段 11a、12 帶入) |
| `components/Projects` | 專案 |

`SidePanel/Parameters`、`Chat/Subagents`、`Share` 不能刪,聊天畫面直接用到。

## 3 個精簡檔案

### 接線型(把功能接進畫面)

| 檔案 | 刪除 |
|---|---|
| `hooks/Nav/useSideNavLinks.ts`(-57) | 4 條面板 `import`(MCPBuilder、Schedules、Memories、Skills)與對應的 4 個 `links.push` 區塊,只剩 `agents`、`assistants`、`prompts`、`bookmarks`、`files`、`parameters` 與 `hide-panel` |
| `routes/index.tsx`(-39) | 3 個動態載入函式(Skills、Projects 兩個),以及 6 個路由項目(`skills*` 4 個、`projects*` 2 個) |

### 牽連型(被延後的功能引用的小元件或函式)

| 檔案 | 刪除 | 原因 |
|---|---|---|
| `components/UnifiedSidebar/ConversationsSection.tsx`(-4) | `ProjectsSection` 的 `import` 與使用處 | 側邊欄的專案區塊 |

## 為什麼不帶某些檔案

只被延後功能使用的檔案,刪掉引用處之後就沒有人用了,不帶入(MVP-1 當時共 392 個非測試檔;階段 12 之後與官方 rc4 實際比對,還有 160 個),例如:

- `components/Conversations/ProjectsSection.tsx`(只服務專案區塊)
- 這些功能的其他元件,例如 `components/Files/`(24 個)、`components/Input/`(13 個)

**唯一一個從被刪目錄保留的檔案**:`components/SidePanel/Agents/config.ts`。`hooks/Files/useSharePointPicker.ts` 用 `import type` 引用它的型別 `SPPickerConfig`。型別在建置時會被抹掉,不保留也能建置,但保留才能通過 TypeScript 檢查,而且不必改動 `useSharePointPicker.ts`。

## 用 `librechat.yaml` 隱藏殘留的入口

有些功能的入口(按鈕、選單項目)寫在核心元件裡,不是 `import` 被刪目錄,所以刪不掉也不會建置失敗,只是點下去會到不存在的頁面。官方設定檔的 `interface` 區段就是給這種情況用的開關:

```yaml
interface:
  memories: false
  skills: false
  mcpServers:
    use: false
```

| 開關 | 隱藏的入口 |
|---|---|
| `memories`、`skills: false` | 關閉對應功能的介面權限 |
| `mcpServers.use: false` | 前端不再請求 `/api/mcp/servers` |

MVP-1 當時還有 `prompts: false`、`bookmarks: false` 與 `marketplace.use: false`(隱藏側邊欄指向 `/agents` 的市集連結)。階段 1 補回提示詞、階段 10 補回書籤、階段 11b 補回市集後,分別改成 `prompts: true`、`bookmarks: true`、`marketplace.use: true`,**不能只是刪掉**:`false` 在啟動時已經把 `USER` 角色的 `PROMPTS` 使用權限寫進資料庫,拿掉設定並不會改回來,必須明確寫 `true` 才會重新開啟。其餘的開關,等各自的階段補回功能時,同樣改成 `true`。

## 驗證結果(MVP-1 當時)

在暫存區:後端 315 個檔案、前端 1145 個檔案、四個函式庫,加上上面的 `interface` 設定(階段 1 之後的驗證結果見[提示詞](../features/prompts.md))。

| 項目 | 結果 |
|---|---|
| Vite 建置 | 成功,13 秒,輸出 `client/dist` |
| API 驗收 11 項 | 全部通過 |
| 真實瀏覽器 | 登入狀態自動恢復、模型選擇器顯示 Ollama 的 `qwen2.5:1.5b-instruct`、中文提問與串流回覆、新對話出現在對話列表並自動命名 |
| 側邊欄 | 只剩:新對話、對話紀錄、參數、帳號設定。Agents、提示詞、Skills、書籤、記憶等圖示都不見了 |
| 啟動時的 API 請求 | 26 個,25 個 200,1 個 404(`/api/tags`,對話標籤,呼叫它的是保留的核心元件)。完整前端時是 32 個、6 個 404,`projects`、`skills`、`admin/roles`、`prompts/groups`、`mcp/servers` 的請求都消失了 |
| 主控台 | 沒有 JavaScript 錯誤 |

## References

- [client/src(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src)
- [前端說明](index.md)
- [後端精簡清單](../api/mvp-trim.md)
- [MVP 設計](../mvp-design.md):各功能在 MVP-1 的處理
- [interface 物件設定(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface)
