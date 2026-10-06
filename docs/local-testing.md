# 本機驗證筆記

在本機驗證 LibreChat 時用到的 API 流程,以及踩到的坑。怎麼把專案跑起來,見[本機執行教學](local/npm.md)。

## 用 API 驗證

送訊息的流程是兩步:

1. `POST /api/agents/chat/ollama`,本文含 `text`、`endpoint`、`endpointType: "custom"`、`model`、`conversationId: "new"`、`parentMessageId`、`messageId`。回傳 `streamId`。
2. `GET /api/agents/chat/stream/<streamId>`,以 SSE 收串流。事件依序是:建立對話、`on_context_usage`、`on_run_step`、多個 `on_message_delta`(回覆片段)、`title`(自動標題)、`on_run_step_closed`、結束事件。

這個請求本文的格式,由 `packages/data-provider/src/createPayload.ts` 組裝,見 [data-provider](packages/data-provider.md)。

驗收一共 11 項:健康檢查 `/health`、前端首頁 `/`、`/api/config`、註冊、登入、`/api/endpoints` 含 `ollama`、`/api/models` 含 Ollama 的模型、送出訊息、串流回覆(有片段與結束事件)、`/api/convos` 對話有保存、`/api/messages` 訊息有保存。

## 踩到的坑

### 1. 用 curl 打 API 會被封鎖 2 小時

`agents` 路由有一個 `uaParser` 中介層:User-Agent 認不出是瀏覽器的請求,會記一次違規(`NON_BROWSER_VIOLATION_SCORE=20`,而 `BAN_INTERVAL=20`),**一次就封鎖該帳號與 IP 兩小時**(`BAN_DURATION`)。之後所有請求都回 403「Your account has been temporarily banned」。

- 預防:API 測試要帶瀏覽器的 User-Agent。
- 解除:封鎖紀錄存在 MongoDB 的 `logs` 集合,鍵是 `BANS:` 與 `ban:` 開頭。重啟後端不會清除,要刪掉這幾筆(僅限學習用的資料庫):

```
db.logs.deleteMany({ key: /^(BANS|ban):/ })
```

### 2. Git Bash 傳中文會變亂碼

在 Git Bash 用 curl 送中文,請求本文會被 Windows 的編碼轉壞,後端收到亂碼。測試請用 Node 或瀏覽器送。

## References

- [本機執行教學](local/npm.md)
- [npm 安裝(官方文件)](https://www.librechat.ai/docs/local/npm),翻譯見 [official/local/npm](official/local/npm.md)
- [Ollama 設定(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints/ollama)
