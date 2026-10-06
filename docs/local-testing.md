# 本機驗證筆記

在 Windows 主機上用 npm 跑 LibreChat,連本機的 MongoDB 與 Ollama,以及驗證時踩到的坑。官方的 npm 安裝流程見[官方文件翻譯](official/local/npm.md),這份筆記補充我們實作時的差異與紀錄。

## 與官方 npm 安裝流程的對照

| 步驟 | 官方 | 我們 |
|---|---|---|
| 取得原始碼 | 一次 `git clone` 整包 | 依功能一層一層帶入,固定在 `v0.8.8-rc4` |
| 建立 `.env` | 複製 `.env.example`,改 `MONGO_URI` | 相同,另外改 `PORT` 與 `DOMAIN_*`(本機 3080 已被佔用) |
| 安裝與建置 | `npm run reinstall` | 以官方 lockfile 為基礎執行 `npm install --ignore-scripts`,再逐層建置。`reinstall` 會執行 `git pull` 與 `npm cache clean`,不適合在這個專案使用 |
| 啟動 | `npm run backend` | 相同 |
| 位址 | `http://localhost:3080/` | `http://localhost:3090/` |
| 模型 | 登入後在介面輸入雲端模型的 API 金鑰 | 用 `librechat.yaml` 把本機 Ollama 加成自訂端點,不需要金鑰 |

## 環境

| 項目 | 設定 |
|---|---|
| 作業系統與工具 | Windows,Node 24.18、npm 11.16(官方文件要求 Node 24.16、npm 11.16) |
| 後端 port | `3090`(官方預設 3080,本機已有其他 LibreChat 佔用 3080 與 3081) |
| 資料庫 | 學習專用的 MongoDB 容器,主機 port `27018`,見 [mongodb](mongodb.md) |
| 模型 | 本機 Ollama,port `11434`,用 `librechat.yaml` 的自訂端點接上 |

## `.env` 要改的地方

從 `.env.example` 複製成 `.env`,改這幾項,其他維持預設:

| 設定 | 值 | 說明 |
|---|---|---|
| `PORT` | `3090` | 官方預設 3080 |
| `MONGO_URI` | `mongodb://127.0.0.1:27018/LibreChatStarter` | 官方預設 27017,資料庫名稱 `LibreChatStarter` 是我們自取的 |
| `DOMAIN_CLIENT`、`DOMAIN_SERVER` | `http://localhost:3090` | 官方預設 3080,要跟著 `PORT` 改 |

`CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET` 官方範本註明可留空,後端會自己產生暫時值。啟動日誌會出現警告,是正常的。`.env` 含設定,**不能進版控**,官方 `.gitignore` 的 `.env*` 規則會擋住它。

## `librechat.yaml`:接 Ollama

官方的 Ollama 設定頁有完整範例。我們用的最小設定:

```yaml
version: 1.3.17

cache: true

endpoints:
  custom:
    - name: "Ollama"
      apiKey: "ollama"
      baseURL: "http://localhost:11434/v1/"
      models:
        default: ["qwen2.5:7b-instruct"]
        fetch: true
      titleConvo: true
      titleModel: "current_model"
      modelDisplayLabel: "Ollama"

interface:
  marketplace:
    use: false
  bookmarks: false
  memories: false
  prompts: false
  skills: false
  mcpServers:
    use: false
```

`interface` 區段隱藏 MVP-1 還沒有的功能入口,原因見[前端精簡清單](client/mvp-trim.md)。

- `baseURL` 用 `localhost`,因為我們的後端跑在主機上。跑在 Docker 容器裡才要改成 `host.docker.internal`。
- `apiKey` 欄位必須存在,但 Ollama 不檢查,填任意字串。
- `fetch: true` 會即時從 Ollama 取得模型清單,端點名稱必須以 `ollama` 開頭(不分大小寫)。
- 後端會把端點名稱轉成小寫:`/api/endpoints` 與 `/api/models` 裡的鍵是 `ollama`,不是 `Ollama`。

## 啟動與驗證

1. 確認 MongoDB 容器在跑。它沒有設自動重啟,**Docker 重開後要手動** `docker start learn-mongodb`。
2. 啟動後端:`npm run backend`(等於 `cross-env NODE_ENV=production node api/server/index.js`)。看到 `Server listening at http://localhost:3090` 就是成功。後端啟動時會讀 `client/dist/index.html`,所以要先建置前端(`cd client && npm run build`)。
3. 瀏覽器開 `http://localhost:3090`,註冊並登入。**第一個註冊的使用者自動成為管理員**。註冊後會顯示「請檢查信箱驗證」,這是通用訊息,沒有開信箱驗證,可以直接登入。
4. 預設模型是 `gpt-6-astra`(OpenAI,需要金鑰),要在畫面上方的模型選擇器切到 Ollama 的模型。快捷鍵是 Ctrl+Shift+M。

驗收流程:註冊 → 登入 → 新對話 → 選 Ollama 模型送出訊息 → 回覆以串流顯示 → 重新整理後歷史仍在。

## 用 API 驗證

送訊息的流程是兩步:

1. `POST /api/agents/chat/ollama`,本文含 `text`、`endpoint`、`endpointType: "custom"`、`model`、`conversationId: "new"`、`parentMessageId`、`messageId`。回傳 `streamId`。
2. `GET /api/agents/chat/stream/<streamId>`,以 SSE 收串流。事件依序是:建立對話、`on_context_usage`、`on_run_step`、多個 `on_message_delta`(回覆片段)、`title`(自動標題)、`on_run_step_closed`、結束事件。

這個請求本文的格式,由 `packages/data-provider/src/createPayload.ts` 組裝,見 [data-provider](packages/data-provider.md)。

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

### 3. 背景程序的「完成」通知不一定是真的完成

啟動背景工作的外層指令結束,不等於裡面的工作結束。要看日誌結尾的標記。

## References

- [Ollama 設定(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints/ollama)
- [npm 安裝(官方文件)](https://www.librechat.ai/docs/local/npm),翻譯見 [official/local/npm](official/local/npm.md)
- [.env.example(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/.env.example)
- [librechat.example.yaml(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/librechat.example.yaml)
