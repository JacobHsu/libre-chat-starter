# 送出問題後的等待畫面與串流渲染

送出訊息之後、第一個字出現之前,畫面上有一個呼吸跳動的小圓點;回覆開始後,文字逐段淡入。這份文件說明前端怎麼做到這件事:先放一則空的回覆(樂觀更新)、用純 CSS 畫出等待的圓點、用 SSE 接收串流,並限制每個畫面影格最多更新一次。

## 時間軸

```
按 Enter
 ① useChatFunctions.ask()          建立「空的回覆」並立刻放進畫面,標記「送出中」
 ② ChatView 的 useAdaptiveSSE      看到新的 submission,送出請求並連上串流
 ③ 畫面:空回覆 → 呼吸的小圓點        還沒收到任何內容的這段時間
 ④ 串流事件陸續到達                  每個 token 先合併,再每個影格最多寫入一次
 ⑤ 圓點消失,文字開始淡入
```

## ① 樂觀更新:先放一則空回覆

送出時,`ask()` 不等伺服器回應,就在前端建立一則沒有內容的回覆 `initialResponse`:`text` 是空字串、`content` 是空陣列、`isCreatedByUser` 是 `false`。接著依序做三件事:

| 做什麼 | 位置 |
|---|---|
| 標記送出中:`setIsSubmitting(true)`、`setShowStopButton(true)` | [useChatFunctions.ts:727](../../client/src/hooks/Chat/useChatFunctions.ts#L727) |
| 把你的訊息與空回覆一起放進畫面:`setMessages([...訊息, 你的訊息, initialResponse])` | [useChatFunctions.ts:784](../../client/src/hooks/Chat/useChatFunctions.ts#L784) |
| 通知串流層開始工作:`setSubmission(submission)` | [useChatFunctions.ts:788](../../client/src/hooks/Chat/useChatFunctions.ts#L788) |

所以畫面在伺服器還沒回應時,就已經有一則回覆的位置。「送出中」的旗標存在 Recoil(`store.isSubmittingFamily`),訊息元件透過 `useMessageContext` 讀到它。

## ③ 等待的小圓點

小圓點分三層:

| 層 | 做的事 | 位置 |
|---|---|---|
| React 判斷 | 回覆內容是空的(`content` 長度為 0,或只有一個空的文字片段),而且「送出中」,就渲染空的佔位 `<p className="submitting"><span className="result-thinking" /></p>` | [EmptyText.tsx](../../client/src/components/Chat/Messages/Content/Parts/EmptyText.tsx)、判斷在 [ContentParts.tsx:1082](../../client/src/components/Chat/Messages/Content/ContentParts.tsx#L1082) |
| CSS 畫圓 | `.submitting .result-thinking:empty:last-child::after`:12px 的圓,先用 250ms 淡入,再用 `lc-dot-breathe` 動畫讓透明度在 1 與 0.3 之間呼吸,一輪 1.5 秒,顏色取自 `--text-primary`,深色與淺色主題都適用 | [style.css:1902](../../client/src/style.css#L1902) |
| 無障礙 | 使用者設定「減少動態效果」(`prefers-reduced-motion: reduce`)時關閉動畫 | [style.css:1917](../../client/src/style.css#L1917) |

圓點是 `::after` 偽元素,只在「祖先帶有 `.submitting`、自己沒有子元素(`:empty`)」時顯示。文字一到,這個 `span` 就不再是空的,圓點自動消失。這是官方刻意的做法:CSS 註解寫明沒有任何元件庫的元件能表達「祖先處於某個狀態、自己沒有子元素時才顯示」,若用元件就得自己持有狀態,而串流中的 Markdown 路徑刻意讓圓點留在 DOM 裡,**每個 token 都不用為了圓點重新渲染**。

`Markdown.tsx` 也有同樣的邏輯:`content === ''` 時回傳 `result-thinking` 佔位,有內容才交給 `MarkdownBlocks`([Markdown.tsx](../../client/src/components/Chat/Messages/Content/Markdown.tsx))。

## ④ 串流怎麼進來,又怎麼不卡

| 環節 | 技術 |
|---|---|
| 傳輸 | `sse.js` 套件的 `SSE`,以 `GET /api/agents/chat/stream/<streamId>` 連線,標頭帶 `Authorization: Bearer <token>`([useResumableSSE.ts:1886](../../client/src/hooks/SSE/useResumableSSE.ts#L1886))。瀏覽器原生的 `EventSource` 不能帶自訂標頭,所以用這個套件 |
| 事件分派 | `useStepHandler` 依事件類型處理:`on_run_step`、`on_message_delta`(回覆片段)、`on_reasoning_delta`(推理片段)、`on_run_step_delta` 等([useStepHandler.ts:1053](../../client/src/hooks/SSE/useStepHandler.ts#L1053)) |
| 狀態存放 | 訊息存在 React Query 的快取:`queryClient.setQueryData([QueryKeys.messages, …])`([useChatHelpers.ts:117](../../client/src/hooks/Chat/useChatHelpers.ts#L117)),畫面訂閱它 |
| 影格合併 | 每個 token 先**立即**合併進記憶體的 `messageMap`(這是權威資料),但寫進快取與重建訊息樹**最多每個影格一次**,用 `requestAnimationFrame` 排程([useStepHandler.ts:814](../../client/src/hooks/SSE/useStepHandler.ts#L814)) |
| 事件順序錯亂時 | 如果 `on_message_delta` 比它所屬的 `on_run_step` 先到,先放進 `pendingDeltaBuffer`,等對應的步驟到了再套用 |

## ⑤ 文字出現時的效果

| 技術 | 說明 |
|---|---|
| Markdown 逐區塊渲染 | 內容不是空的就交給 `MarkdownBlocks`,搭配 remark 與 rehype 外掛處理 LaTeX、程式碼區塊等 |
| 平滑淡入 | `useSmoothStreaming` 開啟(使用者設定開啟,且沒有「減少動態效果」)時,最新那則訊息的新區塊用淡入動畫;尾端的方塊游標在這個模式下隱藏,因為淡入本身就表示正在串流([useSmoothStreaming.ts](../../client/src/hooks/Messages/useSmoothStreaming.ts)) |
| 淡入基準 | 恢復串流或切換到進行中的對話時,已經存在的大量文字不會重新播放淡入,只有之後新出現的區塊才淡入([Markdown.tsx](../../client/src/components/Chat/Messages/Content/Markdown.tsx) 的 `hydratedRef`) |

## 推理模型的「思考」區塊

如果使用會輸出推理內容的模型,後端會送出 `on_reasoning_delta` 事件,前端把它存成類型為 `THINK` 的內容片段,由 `Part.tsx` 交給 `Reasoning` 渲染:

| 狀態 | 畫面 |
|---|---|
| 推理進行中 | 標題顯示「Thinking...」(`com_ui_thinking`),收合時下方是即時預覽 |
| 推理結束 | 標題變成「Thoughts」(`com_ui_thoughts`),可以展開收合 |
| 狀態管理 | 展開狀態、字級、設定裡「是否預設展開」(`showThinkingAtom`)都是 Jotai 的 atom |

我們目前接的 `qwen2.5` 不是推理模型,不會送出推理內容,所以只會看到等待的小圓點。

程式在 [Reasoning.tsx](../../client/src/components/Chat/Messages/Content/Parts/Reasoning.tsx) 與 [Thinking.tsx](../../client/src/components/Chat/Messages/Content/Parts/Thinking.tsx)。

## 技術一覽

| 面向 | 用了什麼 |
|---|---|
| UI 框架 | React 18 |
| 狀態 | React Query(訊息快取)、Recoil(`isSubmitting` 等)、Jotai(設定類的小型狀態) |
| 串流 | `sse.js` |
| 等待動畫 | 純 CSS:`::after` 偽元素加 `@keyframes` |
| 文字渲染 | Markdown 逐區塊渲染加淡入動畫 |
| 效能 | 每個影格最多寫入一次快取(`requestAnimationFrame`) |

## 第一個要讀的檔案

1. `src/hooks/Chat/useChatFunctions.ts` 的 `ask`(第 284 行起,建立回覆與送出在第 634 到 790 行):送出時建立空回覆與 `submission`。
2. `src/components/Chat/Messages/Content/Parts/EmptyText.tsx`:最短的等待佔位,只有 31 行。
3. `src/style.css` 的 `.result-thinking`(第 1880 到 1920 行):圓點的 CSS 與官方註解。
4. `src/hooks/SSE/useStepHandler.ts` 的 `ON_MESSAGE_DELTA` 分支與 `scheduleCoalescedMessagesFlush`(第 814 到 840 行、第 1053 行起)。
5. `src/hooks/SSE/useAdaptiveSSE.ts`:決定走哪一種串流連線(41 行)。

## References

- [前端說明](index.md):聊天從輸入框到串流的整條路徑
- [後端說明](../api/index.md):串流事件在後端怎麼送出
- [data-provider](../packages/data-provider.md):`createPayload` 組出請求
- [sse.js](https://github.com/mpetazzoni/sse.js):可帶自訂標頭的 SSE 客戶端
- [client/src(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src)
