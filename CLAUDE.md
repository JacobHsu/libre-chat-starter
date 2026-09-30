# LibreChat 逐段學習專案

目標:理解 LibreChat 是怎麼依序建立出來的。使用 npm(原始碼)版,MongoDB 用 Docker 跑,只當依賴。

## 來源
- 官方文件:https://www.librechat.ai/zh
- 原始碼:https://github.com/LibreChat-AI/LibreChat
- 以這兩處為準。講解時對照原始碼與文件,不憑記憶猜測。

## 工作規則
- 使用者只觀看與使用,搭建與寫文件由 Claude 代勞。
- 每次只做一小步,講解後停下,等使用者確認讀懂、在本地看過,才進下一步。
- clone 檔案也要先講解、理解後才繼續。不要自行往前衝。
- 有疑問或需要選擇時,先問使用者。

## 文件規則
- 學習筆記放 `docs/`,使用繁體中文。
- 只用相對路徑或簡短別名,不寫本機絕對路徑。

## 進度清單(使用者確認一步,才打勾一步)
- [ ] 0. clone 原始碼(保留 git 歷史),只看資料夾,不執行
- [ ] 1. `git log --reverse` 找最早提交,看第一個 package.json(對照 `npm init -y` 的產物)
- [ ] 2. 讀現在的根 package.json(workspaces、scripts)
- [ ] 3. Docker 啟動 MongoDB
- [ ] 4. 設定 `.env`,`npm ci`
- [ ] 5. 啟動後端
- [ ] 6. 啟動前端,註冊、登入
- [ ] 7. 送出訊息,追蹤請求流程
- [ ] 8. 依序讀 `packages/*`、`api/`、`client/` 的建立順序
