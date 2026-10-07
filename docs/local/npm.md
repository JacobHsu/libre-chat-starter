# npm(本機執行)

在你的電腦上用 npm 執行本專案(LibreChat 最小可用版本),資料庫用 Docker 跑 MongoDB,模型用本機的 Ollama。整個流程是從 GitHub 全新 clone 下來照著做,實測可以跑通。

這份教學的結構比照官方的 [npm 安裝頁](../official/local/npm.md)。和官方不同的地方,都在最後的[與官方流程的對照](#與官方流程的對照)。

## 前置條件

- Node.js `v24.16.0`:[https://nodejs.org/en/download](https://nodejs.org/en/download)。我們實測使用 `v24.18.0`,可以正常運作。
- npm `v11.16.0`
- Git:https://git-scm.com/download/
- Docker:用來跑 MongoDB。
- Ollama:https://ollama.com/ ,並且至少下載過一個模型。確認方式:

```powershell
ollama list
```

如果你使用 `nvm`,可以先切到建議的版本:

```bash
nvm install 24.16.0
nvm use 24.16.0
npm install -g npm@11.16.0
node -v
npm -v
```

## 安裝步驟

### 取得專案

```bash
git clone https://github.com/JacobHsu/libre-chat-starter.git
cd libre-chat-starter
```

想要固定在「最小可用版本」這個階段(標籤 `stage-mvp`):

```bash
git checkout stage-mvp
```

### 啟動 MongoDB

LibreChat 把對話、訊息、使用者存在 MongoDB。我們用 Docker 起一個學習專用的容器,請在 **PowerShell** 執行:

```powershell
docker run -d --name learn-mongodb -p 127.0.0.1:27018:27017 -v learn-mongodb-data:/data/db mongo:8.0.20 mongod --noauth
```

確認容器在跑:

```powershell
docker ps --filter "name=learn-mongodb"
```

這個容器沒有設自動重啟,**Docker 重開後要手動啟動**:`docker start learn-mongodb`。每個參數的意思與管理指令見 [MongoDB](../mongodb.md)。

### 設定 `.env`

從 `.env.example` 建立 `.env`:

```bash
cp .env.example .env
```

> **注意:** 如果你使用 Windows 的命令提示字元,用 `copy .env.example .env`。

編輯 `.env`,改這幾項,其他維持預設:

| 設定 | 值 | 說明 |
|---|---|---|
| `PORT` | `3090` | 官方預設 3080。我們的環境 3080 已被其他 LibreChat 佔用 |
| `MONGO_URI` | `mongodb://127.0.0.1:27018/LibreChatStarter` | 官方預設 27017。資料庫名稱 `LibreChatStarter` 可以自取 |
| `DOMAIN_CLIENT`、`DOMAIN_SERVER` | `http://localhost:3090` | 要跟著 `PORT` 改 |

`CREDS_KEY`、`CREDS_IV`、`JWT_SECRET`、`JWT_REFRESH_SECRET` 在範本裡可以留空,後端第一次啟動會產生暫時值,存在專案根目錄的 `.env.temp`。啟動日誌會出現警告,是正常的。

`.env` 與 `.env.temp` 都被 `.gitignore` 擋住,不會進版控。

### 設定 `librechat.yaml`:接上 Ollama

在專案根目錄建立 `librechat.yaml`(同樣不進版控),內容如下:

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
  modelSelect: true
  parameters: true
  presets: true
  marketplace:
    use: false
  bookmarks: false
  memories: false
  prompts: true
  skills: false
  mcpServers:
    use: false

modelSpecs:
  list:
    - name: "ollama-qwen"
      label: "Ollama qwen2.5:7b"
      softDefault: true
      preset:
        endpoint: "Ollama"
        model: "qwen2.5:7b-instruct"
```

| 設定 | 意思 |
|---|---|
| `endpoints.custom` | 自訂端點。Ollama 提供和 OpenAI 相容的介面,所以用這個方式接上 |
| `baseURL` | 用 `localhost`,因為後端跑在你的主機上。如果後端放進 Docker 容器,才要改成 `host.docker.internal` |
| `apiKey` | 欄位必須存在,Ollama 不檢查,填任意字串 |
| `models.fetch: true` | 即時從 Ollama 取得你已下載的模型清單。端點名稱必須以 `ollama` 開頭(不分大小寫) |
| `titleConvo`、`titleModel` | 用目前選的模型替對話自動命名 |
| `interface` | 隱藏這個版本還沒有的功能入口,原因見[前端精簡清單](../client/mvp-trim.md)。之後補回功能時,對應的開關改回開啟 |
| `modelSpecs`、`softDefault: true` | 預設模型。沒有設定時,新的使用者預設是 OpenAI 的模型,需要金鑰;設了之後,**第一次使用**(這個瀏覽器還沒記住選過哪個模型)預設就是這個 Ollama 模型。使用者之後自己換模型,系統會記住新的選擇。`preset.model` 要填 `ollama list` 看得到的模型名稱 |
| `interface.modelSelect`、`parameters`、`presets` | 設了 `modelSpecs` 之後,官方預設會關掉模型選擇器、參數面板與預設,所以要明確設成 `true` 讓它們保持開啟 |

官方的 [Ollama 設定頁](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints/ollama)有完整範例與其他選項。

### 建置與啟動

安裝相依套件。專案已附官方的 `package-lock.json`,用 `npm ci` 安裝鎖定的版本(約 3 分鐘,2992 個套件):

```bash
npm ci --ignore-scripts
```

建置所有程式碼(四個函式庫,再加前端,約 45 秒):

```bash
npm run frontend
```

啟動 LibreChat:

```bash
npm run backend
```

看到這一行就是成功:

```
Server listening at http://localhost:3090
```

> **成功!開啟 LibreChat!**
> **前往 [http://localhost:3090/](http://localhost:3090/)**

後端啟動時會讀取 `client/dist/index.html`,所以一定要先執行 `npm run frontend`。

> **提示:**
> - 下次要啟動,先確認 MongoDB 與 Ollama 在跑,再執行 `npm run backend`;或直接用[一鍵啟動](#一鍵啟動)。
> - 停止 LibreChat:在執行它的終端機按 `Ctrl+C`。

## 驗收

1. 開啟 `http://localhost:3090/`,**註冊**一個帳號。第一個註冊的使用者會自動成為管理員。註冊後會顯示「請檢查信箱驗證」,這是通用訊息,沒有開信箱驗證,可以直接登入。
2. **登入**。
3. 第一次使用時,畫面上方的模型選擇器預設就是 **Ollama qwen2.5:7b**(`librechat.yaml` 的 `modelSpecs`)。如果這個瀏覽器以前選過別的模型,會記住上一次的選擇;想換模型,點上方的模型選擇器。OpenAI、Google、Anthropic 等端點仍然列在選單裡,但需要金鑰才能用。
4. 送出一則訊息,回覆會以**串流**逐字出現。
5. **重新整理**頁面,左側的對話列表與內容仍在。

這個版本的畫面很精簡,側邊欄只有:新對話、對話紀錄、參數、帳號設定。

## 一鍵啟動

第一次設定完成後,日常啟動不用再一步步打指令。在專案根目錄的 PowerShell 執行:

```powershell
powershell -ExecutionPolicy Bypass -File tools/start.ps1
```

[tools/start.ps1](../../tools/start.ps1) 會依序做四件事:

| 步驟 | 做什麼 |
|---|---|
| 1 | 啟動 MongoDB 容器 `learn-mongodb`(已在跑也沒關係) |
| 2 | 等 MongoDB 真的能回應(最多 30 秒)。這一步是必要的:MongoDB 還沒準備好就啟動 LibreChat,後端會卡在連線,瀏覽器連不上 |
| 3 | 檢查 Ollama(`http://localhost:11434`)有沒有回應,沒有就提醒,但不中斷 |
| 4 | 啟動 LibreChat(`npm run backend`),看到 `Server listening at http://localhost:3090` 就可以開瀏覽器 |

停止:在執行腳本的視窗按 `Ctrl+C`。MongoDB 容器會繼續跑,不用管它;要關閉時 `docker stop learn-mongodb`。

腳本啟動前會先檢查三件事,不符合就說明原因並結束:`client/dist/index.html` 不存在(要先 `npm run frontend`)、`.env` 不存在、3090 已被佔用(LibreChat 可能已經在跑)。

## 更新專案

之後專案補回新功能時,更新方式是:

```bash
git pull
npm ci --ignore-scripts
npm run frontend
npm run backend
```

更新前先停止 LibreChat。

## 與官方流程的對照

| 步驟 | 官方 | 這個專案 |
|---|---|---|
| 取得原始碼 | `git clone` 官方 repo | `git clone` 本專案,內容是官方 `v0.8.8-rc4` 依功能一層一層帶入的結果 |
| 建立 `.env` | 複製 `.env.example`,改 `MONGO_URI` | 相同,另外改 `PORT` 與 `DOMAIN_*` |
| 安裝與建置 | `npm run reinstall`(一次完成) | 分成 `npm ci --ignore-scripts` 與 `npm run frontend`。`reinstall` 會執行 `git pull` 與 `npm cache clean`,不適合在這個專案使用 |
| 啟動 | `npm run backend` | 相同 |
| 位址 | `http://localhost:3080/` | `http://localhost:3090/` |
| 模型 | 登入後在介面輸入雲端模型的 API 金鑰 | 用 `librechat.yaml` 把本機 Ollama 加成自訂端點,不需要金鑰 |
| 更新 | `git pull` 加 `npm run smart-reinstall` | `git pull` 加 `npm ci --ignore-scripts` 與 `npm run frontend` |

為什麼安裝要加 `--ignore-scripts`:根目錄的 `package.json` 有一個 `prepare` 腳本,安裝後會啟動 husky,把 git 的 hooks 目錄指向 `.husky/_`。這個專案沒有 `.husky/`,加上這個選項可以避免改動你的 git 設定。

## 常見問題

| 狀況 | 原因與處理 |
|---|---|
| 啟動後日誌停在 `Mongo Connection options`,瀏覽器連不上 | MongoDB 沒在跑(Docker 重開後容器不會自動啟動)。執行 `docker start learn-mongodb` 後重新啟動 |
| `listen EADDRINUSE ... 3090` | 3090 已被別的程序佔用(例如上一次沒關掉的 LibreChat)。PowerShell 執行 `Get-NetTCPConnection -LocalPort 3090` 找出程序,關掉後再啟動 |
| 日誌有 `RAG API is either not running...`、`METRICS_SECRET is not set`、`No configured value was found for CREDS_KEY...` | 都是正常的警告:沒有設定檔案問答服務、沒有設定指標金鑰、使用暫時憑證 |
| 模型清單沒有 Ollama | 確認 Ollama 在執行(`http://localhost:11434`)、`librechat.yaml` 的 `baseURL` 正確、端點名稱以 `ollama` 開頭。後端會把端點名稱轉成小寫,所以 API 裡看到的是 `ollama` |
| 用 curl 或腳本測試 API 後,所有請求回 403「account has been temporarily banned」 | 見[本機驗證筆記](../local-testing.md)的「用 curl 打 API 會被封鎖 2 小時」 |

更多驗證用的 API 流程與踩到的坑,見[本機驗證筆記](../local-testing.md)。

## References

- [npm(官方文件)](https://www.librechat.ai/docs/local/npm),翻譯見 [official/local/npm](../official/local/npm.md)
- [Ollama 設定(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints/ollama)
- [.env.example(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/.env.example)
- [librechat.example.yaml(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/librechat.example.yaml)
- [MongoDB](../mongodb.md):學習專用容器的啟動與管理
- [前端精簡清單](../client/mvp-trim.md):`interface` 開關的原因
