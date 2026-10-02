# MongoDB

LibreChat 使用的資料庫,以及我們如何用 Docker 啟動學習專用的 MongoDB。

## 為什麼使用 MongoDB

*(官方文件翻譯)*

MongoDB 是一個熱門的 NoSQL 資料庫。LibreChat 選它作為核心資料庫,是因為它的彈性、可擴展性,以及能有效處理多樣的資料結構。以下是 MongoDB 非常適合 LibreChat 的幾個主要原因:

### 1. 彈性的資料模型

MongoDB 以文件為基礎的資料模型,讓資料能以彈性且動態的方式儲存與讀取。和傳統關聯式資料庫不同,MongoDB 不需要固定的結構(schema),更容易適應不斷變動的資料需求。這種彈性對 LibreChat 很重要,因為它要儲存各式各樣的資料,例如對話歷史、使用者檔案、預設、API 金鑰等,不能被僵硬的資料表結構限制。

### 2. 有效率地儲存對話歷史

LibreChat 的主要用途之一,是儲存與讀取對話歷史。MongoDB 能以類似 JSON 的文件儲存巢狀資料結構,非常適合儲存對話歷史,因為對話歷史可能包含訊息、時間戳記與中繼資料等複雜結構。

### 3. 安全地儲存敏感資料

LibreChat 會處理 API 金鑰、加密的使用者密碼等敏感資料。MongoDB 內建對靜態資料與傳輸中資料的加密支援,確保這些敏感資訊受到保護,不被未經授權的存取。

### 4. 水平擴展

隨著 LibreChat 成長並吸引更多使用者,資料儲存需求也會增加。MongoDB 的水平擴展能力,讓你可以在叢集中加入更多伺服器來擴充,在不影響效能的情況下處理更大的資料量與更高的流量。

### 5. 跨裝置存取

LibreChat 希望提供跨多個裝置的順暢體驗,讓使用者能從不同裝置存取自己的資料與對話歷史。MongoDB 的複寫(replication)與分片(sharding)能力,確保資料能持續可用且可存取,讓使用者不論使用哪個裝置,都能從上次中斷的地方繼續對話。

### 6. 開發效率

MongoDB 直覺的查詢語言,以及豐富的工具與函式庫生態系,有助於縮短開發週期、提升開發效率。這與 LibreChat 作為開源專案的目標相符,能促進開發者社群的協作與貢獻。

善用 MongoDB 的優勢,LibreChat 得以有效管理與儲存多樣的資料結構、確保資料的安全與可用性,並為使用者提供順暢的跨裝置體驗。MongoDB 的彈性、可擴展性與對開發者友善的特性,使它成為驅動 LibreChat 核心功能的理想選擇。

## 我們的環境

這台機器上已經有其他 LibreChat 與相關服務在 Docker 執行,其中 `chat-mongodb` 佔用 `27017`,後端佔用 `3080` 與 `3081`。為了不影響它們,學習專案使用獨立的 port 與容器:

| 服務 | 學習專案 | 官方預設 |
|---|---|---|
| 後端 | 3090 | 3080 |
| 前端開發伺服器 | 4090 | 3090 |
| MongoDB | 27018 | 27017 |

原則:**不碰現有容器與資料,也不直接執行官方整份 `docker-compose.yml`**(容器名稱與 port 會衝突)。

## 官方 compose 的 mongodb 設定

*(官方 `docker-compose.yml` 原文與說明)*

```yaml
  mongodb:
    container_name: chat-mongodb
    image: mongo:8.0.20
    restart: always
    user: "${UID}:${GID}"
    volumes:
      - ./data-node:/data/db
    command: mongod --noauth
```

| 設定 | 意思 |
|---|---|
| `container_name: chat-mongodb` | 容器固定使用這個名稱 |
| `image: mongo:8.0.20` | 官方 MongoDB 映像,版本固定 |
| `restart: always` | Docker 重啟或容器停止時自動重新啟動 |
| `user: "${UID}:${GID}"` | 以主機使用者的身分執行,避免檔案權限問題。Windows 沒有 UID/GID,`.env.example` 裡也是註解掉的 |
| `volumes: ./data-node:/data/db` | 資料存在目前資料夾的 `data-node/` |
| `command: mongod --noauth` | 啟動時不要求帳號密碼 |

官方 compose 的 mongodb 沒有 `ports`:資料庫不對外開放,只有同一個 compose 內的容器能用服務名稱連線,例如 `api` 的 `MONGO_URI=mongodb://mongodb:27017/LibreChat`。

我們用 npm 版,後端跑在主機上,必須從主機連到容器,所以要自己開 port。

## 啟動學習專用的 MongoDB

請在 **PowerShell** 執行:

```powershell
docker run -d --name learn-mongodb -p 127.0.0.1:27018:27017 -v learn-mongodb-data:/data/db mongo:8.0.20 mongod --noauth
```

| 部分 | 意思 | 對應官方 |
|---|---|---|
| `docker run -d` | 建立並在背景啟動容器 | compose 的 `up -d` |
| `--name learn-mongodb` | 容器名稱,和現有的 `chat-mongodb` 區分 | `container_name`(改名) |
| `-p 127.0.0.1:27018:27017` | 主機 27018 對應容器內 27017,只綁本機 | 官方沒有(要從主機連線才需要) |
| `-v learn-mongodb-data:/data/db` | 資料存在 Docker 管理的具名資料卷,不寫進專案資料夾 | `./data-node:/data/db`(改為具名資料卷) |
| `mongo:8.0.20` | 映像與版本 | 與官方相同 |
| `mongod --noauth` | 啟動 MongoDB,不要求帳號密碼 | 與官方相同 |

與官方的差異:

| 項目 | 官方 | 我們 |
|---|---|---|
| 容器名稱 | `chat-mongodb` | `learn-mongodb` |
| 對外 port | 無 | `127.0.0.1:27018` |
| 資料位置 | `./data-node` | 具名資料卷 `learn-mongodb-data` |
| `user` | `${UID}:${GID}` | 不設定 |
| `restart` | `always` | 不設定,重開 Docker 後需手動啟動 |

## 驗證

```powershell
# 容器是否在執行,port 對應是否正確
docker ps --filter "name=learn-mongodb"

# 容器內的 MongoDB 是否回應(回傳 1 代表正常)
docker exec learn-mongodb mongosh --quiet --eval "db.runCommand({ping:1}).ok"
```

## 管理指令

| 用途 | 指令 |
|---|---|
| 停止 | `docker stop learn-mongodb` |
| 再啟動 | `docker start learn-mongodb` |
| 刪除容器 | `docker rm -f learn-mongodb` |
| 刪除資料(不可復原) | `docker volume rm learn-mongodb-data` |

## 注意事項

- **在 PowerShell 執行**:Git Bash 可能把 `:/data/db` 這類字串當成 Windows 路徑轉換,造成資料卷設定錯誤。
- **不要把 MongoDB 的 port 公開到外部**:官方警告,將 MongoDB 或 Meilisearch 的 port 暴露給外部,可能讓資料暴露在風險中,正式或敏感環境要避免使用預設 port。我們只綁 `127.0.0.1`,並使用 27018。
- **不要求帳號密碼**:`--noauth` 搭配只綁 `127.0.0.1` 才安全。若日後要啟用驗證,請參考官方 MongoDB Authentication 文件。
- **連線字串**:`mongodb://127.0.0.1:27018/LibreChat`。官方 `.env.example` 的預設是 `mongodb://127.0.0.1:27017/LibreChat`,我們只改 port。這個值會在設定 `.env` 時寫入 `MONGO_URI`。

## References

- [docker-compose.yml(官方 repo)](https://github.com/LibreChat-AI/LibreChat/blob/main/docker-compose.yml)
- [.env.example(官方 repo)](https://github.com/LibreChat-AI/LibreChat/blob/main/.env.example)
- [MongoDB:為什麼 LibreChat 使用 MongoDB(官方文件)](https://www.librechat.ai/docs/user_guides/mongodb)
- [MongoDB Community Server(官方文件)](https://www.librechat.ai/docs/configuration/mongodb/mongodb_community)
- [MongoDB Authentication(官方文件)](https://www.librechat.ai/docs/configuration/mongodb/mongodb_auth)
- [Docker Override Guide(官方文件)](https://www.librechat.ai/docs/configuration/docker_override)
