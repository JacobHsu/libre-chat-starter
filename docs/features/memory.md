# 記憶(Memories)

讓 LibreChat 跨對話記住使用者的資訊。記憶是一份鍵值筆記本，每次回覆前注入給模型。功能說明見官方頁面的翻譯 [使用者記憶](../official/features/memory.md),`librechat.yaml` 的寫法見 [記憶設定](../official/configuration/librechat_yaml/object_structure/memory.md)。

## MVP-1 已經有的部分

記憶的核心在 MVP-1 就在專案內，因為 Agent 執行管線每次送訊息都會呼叫它:

| 位置 | 內容 |
|---|---|
| `packages/data-schemas` 的 `memory` 結構、模型與方法 | 記憶存在 MongoDB 的 `memoryentries` 集合 |
| `packages/api/src/memory/`、`packages/api/src/agents/memory.ts` | 記憶 Agent、`set_memory` 與 `delete_memory` 工具、權限與保護 |
| `api/server/controllers/agents/client.js` 的 `useMemory` | 每次聊天時讀出記憶注入上下文;有設定記憶 Agent 時，同時啟動它 |
| `client/src/components/Chat/Input/Memory.tsx`、`Nav/Settings/MemoryToggle.tsx` | 輸入框的記憶開關、設定裡的個人化開關 |
| `client/src/components/Chat/Messages/Content/` 的 `MemoryArtifacts.tsx`、`MemoryInfo.tsx`、`Parts/MemoryCall.tsx` | 在訊息中顯示記憶的更新 |
| `client/src/data-provider/Memories/` | 前端呼叫記憶 API 的查詢與變更 |

MVP-1 缺的是**管理用的 API** 與**側邊面板**:沒有 `/api/memories`,使用者看不到也改不了自己的記憶。另外 `interface.memories` 設為 `false`。

## 這個階段做了什麼

| 檔案 | 動作 |
|---|---|
| `client/src/components/SidePanel/Memories/` 的 12 個檔案 | 新增：記憶面板(清單、卡片、新增與編輯對話框、用量標籤、依 Agent 分區篩選、管理員權限設定) |
| `client/src/hooks/Nav/useSideNavLinks.ts` | 補回 `MemoryPanel` 的 `import` 與 `links.push` 區塊(接在提示詞面板之後) |
| `api/server/routes/memories.js` | 新增:`/api/memories` 路由 |
| `api/server/routes/index.js` | 補回 `memories` 的 `require` 與匯出 |
| `api/server/index.js` | 補回 `app.use('/api/memories', routes.memories)` |
| `librechat.yaml` | `interface.memories` 改回 `true`,新增 `memory` 區段 |

### 側邊面板何時顯示

角色同時有記憶的 **use** 與 **read** 權限時，側邊欄出現「記憶」。`ADMIN` 角色預設全部都有。

### 我們的設定

```yaml
interface:
  memories: true

memory:
  agent:
    enabled: true
    provider: "Ollama"
    model: "qwen2.5:7b-instruct"
```

- `provider` 填自訂端點的 `name`(`Ollama`),大小寫要完全相同。
- 只寫了 `agent`,其他欄位都用預設值:`tokenLimit` 不限制、`charLimit` 10000、`messageWindowSize` 5、`personalize` true。
- 沒有 `agent.enabled: true` 時，不會自動擷取，但面板上手動管理與 Agent 的記憶工具照樣能用。
- 開啟自動擷取後，每則訊息都會讓記憶 Agent 跑一次，和主要回覆同時進行。用本機 Ollama 時，代表每則訊息會多一次模型呼叫。

### API

| 方法與路徑 | 做什麼 |
|---|---|
| `GET /api/memories` | 列出自己的記憶，以及 `totalTokens`、`tokenLimit`、`charLimit`、`usagePercentage` |
| `POST /api/memories` | 新增記憶:`{ key, value }` |
| `PATCH /api/memories/:key` | 用鍵修改記憶 |
| `DELETE /api/memories/:key` | 用鍵刪除記憶 |
| `PATCH /api/memories/id/:id`、`DELETE /api/memories/id/:id` | 用 ID 修改、刪除記憶 |
| `PATCH /api/memories/preferences` | 開關自己的記憶:`{ memories: true/false }` |

`/preferences` 這條路由排在 `/:key` 前面，所以鍵剛好叫 `preferences` 的記憶，不能用 `PATCH /api/memories/preferences` 修改(會被當成開關記憶，回 400 `memories must be a boolean value.`),要改用 `/id/:id`。前端面板的編輯對話框有 ID 時會走 `/id/:id`,不受影響。

## 歷史

| 時間 | 事件 |
|---|---|
| 2025-06 | User Memories(`29ef91b`):`packages/api` 第一次出現，就是隨這個功能提交的 |

## 驗證

在暫存區(埠 3095、全新資料庫、上面的設定)補回後:

| 項目 | 結果 |
|---|---|
| MVP 的 API 驗收 11 項 | 全部通過 |
| `GET /api/memories` | 200,`{"memories":[],"totalTokens":0,"tokenLimit":null,"charLimit":10000,...}`;未登入 401 |
| `POST /api/memories`(`preferences` = `Favorite color is teal.`) | 201 |
| `PATCH /api/memories/id/:id`、`PATCH /api/memories/occupation`、`DELETE /api/memories/occupation` | 都是 200 |
| `PATCH /api/memories/preferences`(用鍵修改) | 400,`memories must be a boolean value.`(見上方 API 一節) |
| 新對話問「What is my favorite color?」 | 回答「Your favorite color is teal.」:記憶有注入上下文 |
| 新對話說「Please remember this about me: I work as a primary school teacher in Taipei.」 | 記憶 Agent 自動新增 `occupation` = `I work as a primary school teacher in Taipei.`,日誌沒有錯誤 |

## References

- [使用者記憶(官方文件翻譯)](../official/features/memory.md)
- [記憶設定(官方文件翻譯)](../official/configuration/librechat_yaml/object_structure/memory.md)
- [User Memory(官方文件)](https://www.librechat.ai/docs/features/memory)
- [Memory Configuration(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/memory)
- [api/server/routes/memories.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/memories.js)
- [client/src/components/SidePanel/Memories(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/SidePanel/Memories)
- [MCP](mcp.md):前一個階段
- [路線圖](../roadmap.md):階段 15
