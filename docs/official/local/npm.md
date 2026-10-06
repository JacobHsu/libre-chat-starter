# npm

如何使用 npm 在本機安裝 LibreChat。

在大多數情況下,Docker Compose 是建議的安裝方式,因為它簡單、易用又可靠。如果你偏好 npm,可以照以下說明進行。

## 前置條件

- Node.js `v24.16.0`:[https://nodejs.org/en/download](https://nodejs.org/en/download)
- npm `v11.16.0`
  - LibreChat 使用 CommonJS(CJS)與 openid-client v6;Node 24 滿足所需的 CJS/ESM 互通、WebCrypto 與 Fetch API 執行環境支援。
- Git:https://git-scm.com/download/
- MongoDB(Atlas 或 Community Server)
  - [MongoDB Atlas](https://www.librechat.ai/docs/configuration/mongodb/mongodb_atlas)
  - [MongoDB Community Server](https://www.librechat.ai/docs/configuration/mongodb/mongodb_community)

如果你使用 `nvm`,請安裝並選用建議的 Node.js 版本,再更新 npm:

```bash
nvm install 24.16.0
nvm use 24.16.0
npm install -g npm@11.16.0
node -v
npm -v
```

安裝 LibreChat 相依套件之前,Node.js 應顯示 `v24.16.0`,npm 應顯示 `11.16.0`。

## 安裝步驟

### 準備

在終端機執行以下指令:

複製(clone)原始碼:

```bash
git clone https://github.com/LibreChat-AI/LibreChat.git
```

進入 LibreChat 資料夾:

```bash
cd LibreChat
```

從 `.env.example` 建立 `.env` 檔:

```bash
cp .env.example .env
```

> **注意:** **如果你使用 Windows 10,可能要用 `copy` 取代 `cp`。**

更新 `MONGO_URI`:

> **重要:** 編輯剛建立的 `.env` 檔,把 `MONGO_URI` 改成你自己的 MongoDB 實例的網址。

### 建置與啟動

完成準備步驟後,執行以下指令:

安裝相依套件:

```bash
npm run reinstall
```

`npm run reinstall` 會做一次乾淨的相依套件安裝並建置 LibreChat。更換 Node.js 或 npm 版本後請使用它,讓原生套件針對目前的執行環境重新編譯。

啟動 LibreChat:

```bash
npm run backend
```

> **成功!開啟 LibreChat!**
> **前往 [http://localhost:3080/](http://localhost:3080/)**

註冊一個帳號,然後依照[你的第一次對話](https://www.librechat.ai/docs/quick_start/first_chat)加入模型的 API 金鑰,並送出你的第一則訊息。

> **提示:**
> - 下次要啟動 LibreChat,只需要執行 `npm run backend`

## 更新 LibreChat

要把 LibreChat 更新到最新版,執行以下指令:

> **警告:** 請先停止 LibreChat(如果還沒停止的話)。

取得專案最新的變更:

```bash
git pull
```

更新相依套件:

```bash
npm run smart-reinstall
```

如果更新過程中你更換了 Node.js 或 npm 版本,請改用 `npm run reinstall`。

啟動 LibreChat:

```bash
npm run backend
```

## 其他設定

探索我們的設定指南,解鎖更多功能,學習如何設定:

- Meilisearch 整合
- RAG API 連線
- 自訂端點
- 其他進階設定選項
- 以及更多

這些可以讓你用選用功能客製化你的 LibreChat 體驗。

**另見:**
- [使用者驗證系統設定](https://www.librechat.ai/docs/configuration/authentication)
- [AI 設定](https://www.librechat.ai/docs/configuration/pre_configured_ai)
- [自訂端點與設定](https://www.librechat.ai/docs/configuration/librechat_yaml)

## References

- [npm(官方文件)](https://www.librechat.ai/docs/local/npm)
