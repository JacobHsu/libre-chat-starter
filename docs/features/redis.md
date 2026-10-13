# Redis 與快取

Redis 不是使用者看得到的功能，而是讓**多個後端共用同一份暫存資料**的地方。這份文件說明 LibreChat 把哪些東西放在 Redis、沒有 Redis 時放在哪裡，以及階段 6 做了什麼。

## 這個功能做什麼

LibreChat 的後端在執行時，會記下很多暫時的資料，例如：某個 IP 這段時間送了幾次登入、哪則回覆正在串流、角色權限的快取。

只跑**一個**後端時，這些資料放在程式自己的記憶體就夠了。大型部署會同時跑好幾個後端，前面放一個負載平衡器，把每個請求分給其中一個。這時每個後端只看得到自己的記憶體，彼此的資料對不起來。Redis 就是讓它們共用一份。

官方的說法:Redis 能提升效能，而且在負載平衡器後面跑多個 LibreChat 時，**一定要有 Redis**。只有一台主機的話，官方也說多半不需要。

### 有沒有 Redis 的差別

| 資料 | 沒有 Redis | 開了 Redis | 多個後端時的影響 |
|---|---|---|---|
| 一般快取(角色、設定、模型清單、產生標題等) | 程式記憶體 | Redis | 各自快取，彼此不同步 |
| 限流計數(登入、註冊、送訊息、上傳等) | 程式記憶體 | Redis | 每個後端各算一份，實際能嘗試的次數變成好幾倍 |
| 回覆串流的進度 | 程式記憶體 | Redis(Streams 與 Pub/Sub) | 串流到一半重新整理，若請求分到另一個後端，就接不回來 |
| OpenID、SAML 登入的 session | 程式記憶體 | Redis | 從一個後端出發、回到另一個後端時，登入會斷 |
| 只該執行一次的背景工作(例如階段 4 的過期檔案清理) | 每個後端都當自己是「領頭」 | 用 Redis 選出一個領頭，只有它執行 | 每個後端都各執行一次 |
| 違規紀錄(限流被擋的次數) | 檔案 `data/violations.json` | Redis | 每台主機各寫自己的檔案 |
| 封鎖名單 | MongoDB | MongoDB(另在 Redis 放查詢用的快取) | 本來就共用 |

設定檔類的快取(`CONFIG_STORE`、`APP_CONFIG`)即使開了 Redis 也預設留在記憶體，讓每個後端依自己的 `librechat.yaml` 運作。這由 `FORCED_IN_MEMORY_CACHE_NAMESPACES` 控制。

### 對單一後端的我們

我們只跑一個後端，以上「多個後端時的影響」都不會發生。開了 Redis,畫面上不會有差別。比較明顯的不同在重新啟動後端時：放在程式記憶體的資料(一般快取、限流計數、session)會清空，放在 Redis 的則會保留。

## 這個階段做了什麼

**沒有補任何檔案，也沒有改任何設定。** Redis 的程式碼(快取工廠、限流、串流、領頭選舉)在 MVP-1 就已經在專案內，開關是 `.env` 的 `USE_REDIS`。官方範本預設不開，我們維持不開，也不啟動 Redis 容器。階段 6 做的是說明它的作用。

## 歷史

| 時間 | 事件 |
|---|---|
| 2023-09 | 限流、違規紀錄與封鎖系統加入(`getLogStores.js`、`checkBan.js`),違規紀錄存檔案 |
| 2023-10 | 第一次支援 Redis(`feat(api): initial Redis support`) |
| 2025-07 | 快取邏輯集中到 `cacheFactory`,加入 key 前綴 |
| 2025-10 | 快取搬到 TypeScript(`packages/api/src/cache/`);加入以 Redis 協調的領頭選舉 |
| 2025-12 | 可接續的串流(Resumable Streams),多個後端時以 Redis 共用串流進度 |

## 怎麼運作

### 開關

| 變數 | 作用 |
|---|---|
| `USE_REDIS=true` | 總開關。開了就必須設 `REDIS_URI`,否則啟動時報錯 |
| `REDIS_URI` | 連線位址，例如 `redis://127.0.0.1:6379`;叢集用逗號分隔多個位址 |
| `USE_REDIS_STREAMS` | 回覆串流要不要放 Redis。沒設時跟著 `USE_REDIS` |
| `FORCED_IN_MEMORY_CACHE_NAMESPACES` | 即使開了 Redis 也留在記憶體的快取，預設 `CONFIG_STORE,APP_CONFIG` |

其餘變數(叢集、TLS、帳號密碼、key 前綴、連線保活)用在正式部署，說明見官方範本 `.env.example` 的 `REDIS Options` 一節。

### 涉及的檔案

| 檔案 | 做什麼 |
|---|---|
| `packages/api/src/cache/cacheConfig.ts` | 讀取上面的環境變數 |
| `packages/api/src/cache/redisClients.ts` | 建立 Redis 連線 |
| `packages/api/src/cache/cacheFactory.ts` | 依開關決定每個快取用 Redis 還是記憶體:`standardCache`(一般快取)、`violationCache`(違規紀錄，沒有 Redis 時用檔案)、`sessionCache`(登入 session)、`limiterCache`(限流) |
| `api/cache/getLogStores.js` | 列出所有快取，每個快取用哪一種 |
| `api/server/middleware/limiters/` | 各種限流，透過 `limiterCache` 取得 Redis 儲存;沒有 Redis 時用記憶體 |
| `packages/api/src/stream/createStreamServices.ts` | 串流服務：有 Redis 用 `RedisJobStore`、`RedisEventTransport`,沒有則用 `InMemoryJobStore`、`InMemoryEventTransport` |
| `packages/api/src/cluster/LeaderElection.ts` | 領頭選舉。沒有 Redis 時 `isLeader()` 一律回 `true` |

## 要真的開啟時

1. 啟動一個 Redis,例如 Docker 的 `redis` 映像檔。
2. `.env` 設定 `USE_REDIS=true`、`REDIS_URI=redis://127.0.0.1:<埠>`。
3. 重新啟動後端。

## References

- [Redis(官方文件)](https://www.librechat.ai/docs/configuration/redis):開啟方式、連線類型、安全、進階選項、可留在記憶體的快取清單
- [Resumable Streams(官方文件)](https://www.librechat.ai/docs/features/resumable_streams):可接續的串流，單機與 Redis 兩種模式
- [packages/api/src/cache/cacheFactory.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/cache/cacheFactory.ts)
- [api/cache/getLogStores.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/cache/getLogStores.js)
- [packages/api/src/cluster/LeaderElection.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/cluster/LeaderElection.ts)
- [packages/api/src/stream/createStreamServices.ts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/packages/api/src/stream/createStreamServices.ts)
- [OAuth 與 OpenID](oauth.md):前一個階段
- [路線圖](../roadmap.md):階段 6
