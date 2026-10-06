# client(前端)

`client/`:LibreChat 的前端應用,用 React、TypeScript 與 Vite 寫成。它負責畫面、路由、狀態,並用 `data-provider` 呼叫後端。建置後的 `client/dist` 由後端 `api/` 直接提供,所以**後端啟動時需要 `client/dist/index.html` 存在**。

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱 | `@librechat/frontend`,v0.8.8-rc4 |
| 相依套件 | 102 個 `dependencies`、38 個 `devDependencies`:React 18、`react-router-dom` 7、`recoil` 與 `jotai`(狀態)、`@tanstack/react-query` 4(資料請求)、`react-hook-form`、`i18next`、`framer-motion`、Tailwind CSS 3、Vite 8 |
| 進入點 | `index.html` → `src/main.jsx`(38 行)→ `src/App.jsx`(114 行)→ `src/routes/`(`RouterProvider`) |
| 建置 | `npm run build`(在 `client/` 內):`vite build`,輸出 `client/dist`。要先建好四個函式庫(根目錄 `npm run frontend` 的順序) |
| 路徑別名 | `~/` 指向 `src/` |
| 開發伺服器 | `npm run frontend:dev`,port 3090(我們的專案因後端佔用 3090,改用 4090,見 [CLAUDE.md](../../CLAUDE.md)) |

## MVP-1 帶入的範圍

官方 `client/` 有 2149 個檔案。MVP-1 帶入 **1145 個**:

| 類別 | 檔案數 |
|---|---|
| `src/` 的 TypeScript 與 JavaScript 程式碼 | 1032(官方完整版 1421 個,約 73%) |
| `src/` 的翻譯 JSON(29 種語言與其他) | 41 |
| `src/` 的 CSS | 2 |
| `public/`(圖示、字型、`robots.txt`) | 60 |
| `sw/heal.js`(service worker 的修復腳本) | 1 |
| 根目錄:`index.html`、`package.json`、`vite.config.ts`、`tsconfig.json`、`tailwind.config.cjs`、`postcss.config.cjs`、`babel.config.cjs`、`jest.*` | 9 |
| **合計** | **1145** |

其中 1132 個與官方 rc4 逐檔相同,**13 個是精簡版**(共刪 247 行、改 1 行),差異見[精簡清單](mvp-trim.md)。不帶的 1004 個:612 個測試檔,392 個只被已延後的功能使用的檔案。

## 目錄與檔案

`src/` 的程式碼檔(1032 個)依資料夾:

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `components/Chat/` | 261 | **聊天畫面**:`ChatView.tsx`、`Header.tsx`、`Landing.tsx`(新對話的歡迎畫面)、`Input/`(輸入框 `ChatForm.tsx`、檔案、工具列)、`Messages/`(訊息的顯示)、`Menus/`(模型選擇器等) |
| `hooks/` | 227 | 自訂 hooks:`SSE/`(接收串流)、`Chat/`(送出訊息)、`Conversations/`、`Input/`、`Files/`、`MCP/`、`Nav/`、`Auth/` 等 |
| `components/Nav/` | 93 | 側邊欄與設定:帳號選單、設定對話框(`SettingsTabs/`) |
| `utils/` | 79 | 工具函式 |
| `data-provider/` | 59 | React Query 的 hooks(`queries.ts`、`mutations.ts`),包裝 `librechat-data-provider` 的請求函式,依功能分資料夾(`Messages/`、`Files/`、`Endpoints/`…) |
| `components/Messages/` | 35 | 訊息元件 |
| `store/` | 30 | 全域狀態(Recoil 與 Jotai 的 atom):`submission.ts`(送出中的訊息)、`endpoints.ts`、`settings.ts`、`families.ts` 等 |
| `Providers/` | 29 | React Context:`ChatContext`、`MessageContext`、`FileMapContext` 等 |
| `components/Endpoints/`、`Conversations/`、`SidePanel/`、`Auth/`、`UnifiedSidebar/` | 25、23、17、15、12 | 端點設定畫面、對話列表、側邊面板(`Parameters/` 12 個檔案,加上 `Nav.tsx`、`SidePanelGroup.tsx`、`ArtifactsPanel.tsx`)、登入註冊畫面、新版側邊欄 |
| `routes/` | 11 | 路由表(`index.tsx`)、`Root.tsx`(登入後的外框)、`ChatRoute.tsx`、`Layouts/` |
| 其他 | | `common/`(型別)、`lib/`、`locales/`(`i18n.ts`)、`components/ui`、`components/Share` 等 |

## 畫面是怎麼長出來的

```
index.html
  └ src/main.jsx          載入 i18n、樣式,渲染 <App />
      └ src/App.jsx       QueryClientProvider、RecoilRoot、ThemeProvider、RouterProvider
          └ routes/index.tsx   路由表
              ├ /login、/register…        登入註冊(components/Auth)
              └ AuthLayout → Root.tsx     登入後的外框(側邊欄、橫幅)
                  └ /c/:conversationId?   ChatRoute → ChatView(聊天畫面)
```

## 聊天:送出訊息到顯示回覆

這是 MVP 驗收的主線,對應後端的[聊天請求路徑](../api/index.md):

```
components/Chat/Input/ChatForm.tsx    輸入框,送出時呼叫 useSubmitMessage
  → hooks/Chat/useChatFunctions.ts    ask():建好訊息,setSubmission(submission)(832 行,第 788 行)
  → components/Chat/ChatView.tsx      useAdaptiveSSE(rootSubmission, …)(第 100 行)
  → hooks/SSE/useAdaptiveSSE.ts       決定走 useSSE 或 useResumableSSE
  → hooks/SSE/useResumableSSE.ts      createPayload(currentSubmission) 組出請求(第 3929 行),
                                      POST /api/agents/chat/:endpoint,再以 SSE 收串流(4708 行)
  → hooks/SSE/useEventHandlers.ts     依事件(message delta、title…)更新畫面上的訊息
```

`createPayload` 來自 [data-provider](../packages/data-provider.md),組出的目標網址正是 `/api/agents/chat/<端點名稱>`。`useResumableSSE.ts` 很長(4708 行),**第一次讀不需要看完**,抓住上面這條路徑就夠了。

## 第一個要讀的檔案

1. `src/main.jsx` 與 `src/App.jsx`:共 152 行,看整個應用怎麼啟動。
2. `src/routes/index.tsx`:精簡後只剩 130 行,登入、註冊、聊天幾條路由一目了然。
3. `src/components/Chat/ChatView.tsx`:聊天畫面把哪些元件組在一起。
4. `src/components/Chat/Input/ChatForm.tsx`:輸入框。
5. `src/hooks/Chat/useChatFunctions.ts` 的 `ask`:送出訊息時建了什麼。
6. `src/store/submission.ts`:送出中的訊息放在哪個狀態。

## References

- [client(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client)
- [Project Architecture(官方文件翻譯)](../official/development/architecture.md):建置順序與相依方向
- [精簡清單](mvp-trim.md):13 個精簡檔案與驗證結果
- [後端說明](../api/index.md):聊天請求在後端的路徑
- [packages/client](../packages/client.md):前端共用的 UI 元件庫
- [data-provider](../packages/data-provider.md):前端呼叫後端的函式與型別
- [Vite](https://vite.dev/guide/):建置工具
