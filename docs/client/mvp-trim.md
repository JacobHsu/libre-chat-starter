# 前端精簡清單(MVP-1)

MVP-1 的前端改 13 個檔案、**沒有新增任何自己寫的邏輯**。再加上不帶入只服務被延後功能的檔案,以及 `librechat.yaml` 的 `interface` 開關。最終階段這些檔案會換回官方完整版,其餘檔案補回。

各階段補回功能時,會從清單拿掉對應的項目。階段 1(提示詞)換回了 4 個檔案、補回 `useSideNavLinks.ts` 與 `routes/index.tsx` 的提示詞部分,目前的狀態是**改 9 個檔案、刪 220 行、改 1 行**(MVP-1 當時是 13 個檔案、247 行)。下面的數字都是目前的狀態。

## 規則

- 只刪不寫:刪掉對延後功能的 `import`,以及使用它的那一個區塊(陣列項目、JSX 元素、路由項目)。
- 唯一的修改(不是純刪除):`components/Chat/Header.tsx` 裡 `<HeaderMenu startupConfig={startupConfig} trace={trace} …/>` 刪掉 `trace={trace}` 屬性。
- 流程:先刪掉功能目錄,用 Vite 建置,依錯誤訊息找出還被引用的地方,逐一處理,直到建置成功。

## 還沒補回的 13 個功能目錄

| 目錄 | 功能 |
|---|---|
| `components/SidePanel/Agents`、`Builder` | Agent 建立與建構面板 |
| `components/SidePanel/MCPBuilder` | MCP 伺服器面板 |
| `components/SidePanel/Memories`、`Schedules`、`Bookmarks`、`Files` | 記憶、排程、書籤、檔案面板 |
| `components/Skills` | Skills |
| `components/Chat/Trace` | 對話步驟與成本檢視 |
| `components/Plugins` | 外掛 |
| `components/Agents` | Agent 市集 |
| `components/Projects` | 專案 |
| `components/Insights` | 洞察 |

`SidePanel/Parameters`、`Chat/Subagents`、`Share` 不能刪,聊天畫面直接用到。

## 9 個精簡檔案

### 接線型(把功能接進畫面)

| 檔案 | 刪除 |
|---|---|
| `hooks/Nav/useSideNavLinks.ts`(-113) | 8 條面板 `import`(MCPBuilder、Agents、Bookmarks、Builder、Schedules、Memories、Files、Skills)與對應的 8 個 `links.push` 區塊,只剩 `prompts`、`parameters` 與 `hide-panel` |
| `routes/index.tsx`(-66) | Agent 市集的 2 條 `import`、4 個動態載入函式(Skills、Insights、Projects 兩個),以及 9 個路由項目(`skills*` 4 個、`insights`、`projects*` 2 個、`agents*` 2 個) |
| `components/Chat/ChatView.tsx`(-3) | `TraceSurface` 的 `import` 與外層的開閉標籤(裡面的內容不動) |
| `components/Chat/Header.tsx`(-11,+1) | `Trace` 的 `import`、`useTraceControl` 區塊、`<TraceButton />`,以及 `trace={trace}` 屬性 |
| `components/Chat/Menus/HeaderMenu.tsx`(-13) | `TraceControl` 型別 `import`、`trace` 屬性與型別、「檢視 Trace」選單項目 |

### 牽連型(被延後的功能引用的小元件或函式)

| 檔案 | 刪除 | 原因 |
|---|---|---|
| `components/Chat/Landing.tsx`(-7) | `AgentContact` 的 `import` 與使用處 | Agent 的聯絡資訊,屬於 Agent 市集 |
| `components/UnifiedSidebar/ConversationsSection.tsx`(-4) | `ProjectsSection` 的 `import` 與使用處 | 側邊欄的專案區塊 |
| `components/Chat/Input/BadgeRow.tsx`(-2) | `ToolDialogs` 的 `import` 與使用處 | 網頁搜尋金鑰對話框,引用 `SidePanel/Agents` 的元件 |
| `hooks/MCP/index.ts`(-1) | `useRemoveMCPTool` 的匯出 | 只供 Agent 表單使用 |

## 為什麼不帶某些檔案

只被延後功能使用的檔案,刪掉引用處之後就沒有人用了,不帶入(MVP-1 當時共 392 個非測試檔,階段 1 補回 55 個,目前 337 個),例如:

- `components/Conversations/ProjectsSection.tsx`(只服務專案區塊)
- `ToolDialogs.tsx`、`hooks/MCP/useRemoveMCPTool.ts`
- 這些功能的其他元件,例如 `components/Files/`(24 個)、`components/Input/`(13 個)

**唯一一個從被刪目錄保留的檔案**:`components/SidePanel/Agents/config.ts`。`hooks/Files/useSharePointPicker.ts` 用 `import type` 引用它的型別 `SPPickerConfig`。型別在建置時會被抹掉,不保留也能建置,但保留才能通過 TypeScript 檢查,而且不必改動 `useSharePointPicker.ts`。

## 用 `librechat.yaml` 隱藏殘留的入口

有些功能的入口(按鈕、選單項目)寫在核心元件裡,不是 `import` 被刪目錄,所以刪不掉也不會建置失敗,只是點下去會到不存在的頁面。官方設定檔的 `interface` 區段就是給這種情況用的開關:

```yaml
interface:
  marketplace:
    use: false
  bookmarks: false
  memories: false
  skills: false
  mcpServers:
    use: false
```

| 開關 | 隱藏的入口 |
|---|---|
| `marketplace.use: false` | 側邊欄的「Agents 市場」連結(指向已不存在的 `/agents`),以及模型選擇器裡的市集項目 |
| `bookmarks`、`memories`、`skills: false` | 關閉對應功能的介面權限 |
| `mcpServers.use: false` | 前端不再請求 `/api/mcp/servers` |

MVP-1 當時還有一行 `prompts: false`。階段 1 補回提示詞後,這一行要改成 `prompts: true`,**不能只是刪掉**:`false` 在啟動時已經把 `USER` 角色的 `PROMPTS` 使用權限寫進資料庫,拿掉設定並不會改回來,必須明確寫 `true` 才會重新開啟。其餘的開關,等各自的階段補回功能時,同樣改成 `true`。

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
