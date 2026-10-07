# Meilisearch

設定 Meilisearch,讓 LibreChat 可以搜尋對話。

Meilisearch 是開源搜尋引擎,驅動 LibreChat 的對話搜尋,為過去的對話提供全文搜尋、錯字容忍與即時結果。功能概覽請見[訊息搜尋(Search in LibreChat)](https://www.librechat.ai/docs/features/search)。

> **連線方式**
>
> LibreChat 透過 HTTP 與 Meilisearch 溝通,用的是幾個環境變數。Docker 的安裝方式已經把 Meilisearch 當成一個服務附上。從原始碼安裝時,則是讓 LibreChat 連到你自己執行的 Meilisearch 程序。

## 設定 Meilisearch

### Docker

預設的 `docker-compose.yml` 已經包含 `meilisearch` 服務,所以你只需要在 `.env` 檔裡啟用搜尋並設定 master key。

1. **產生 master key。** 用任何夠長的隨機字串(16 位元組以上)。例如:

   ```bash
   openssl rand -base64 32
   ```

2. **把搜尋相關變數加進 `.env`。** Compose 檔會替 `api` 容器把 `MEILI_HOST` 設成內部服務位址,所以這裡不用設主機。master key 要和 `meilisearch` 服務使用的完全相同。

   ```bash
   SEARCH=true
   MEILI_NO_ANALYTICS=true
   MEILI_MASTER_KEY=<your_master_key>
   ```

3. **把 master key 傳給 Meilisearch 服務。** 內附的 `meilisearch` 服務不會讀 `.env`,所以要透過 `docker-compose.override.yml` 加進去。這樣 LibreChat 與 Meilisearch 才會使用同一把金鑰。

   ```yaml
   services:
     meilisearch:
       environment:
         - MEILI_MASTER_KEY=${MEILI_MASTER_KEY}
   ```

   override 檔如何合併,請見 [Docker Override](https://www.librechat.ai/docs/configuration/docker_override)。

4. **啟動整個堆疊。** Compose 會自動合併 override,並把 Meilisearch 與 LibreChat 一起啟動。

   ```bash
   docker compose up -d
   ```

> **連接埠保持在內部**
>
> 容器之間透過 Docker 內部網路連到 Meilisearch,所以不需要把 `7700` 連接埠發佈到主機。公開暴露它,可能讓你的搜尋資料暴露在風險中。

### npm

從原始碼執行 LibreChat 時,把 Meilisearch 執行檔當成獨立的程序執行,再讓 LibreChat 連到它。

1. **下載 Meilisearch。** 從 [Meilisearch 發行頁面](https://github.com/meilisearch/meilisearch/releases)取得適合你作業系統的最新版本,例如 `meilisearch-linux-amd64.tar.gz`(Linux)、`meilisearch-macos-amd64`(macOS)或 `meilisearch-windows-amd64.zip`(Windows)。解壓縮到你選的目錄。用套件管理員安裝的方式,請見 [Meilisearch 安裝指南](https://www.meilisearch.com/docs/learn/getting_started/installation)。

2. **讓執行檔可執行(Linux/macOS)。** 在解壓縮的目錄裡:

   ```bash
   chmod +x meilisearch
   ```

3. **產生 master key。** Meilisearch 可以替你產生一把:

   ```bash
   ./meilisearch --generate-master-key
   ```

   複製產生的金鑰;接下來的步驟會再用到。

4. **啟動 Meilisearch。** 帶著你的 master key 執行。它預設監聽 `7700` 連接埠。

   ```bash
   ./meilisearch --master-key=<your_master_key>
   ```

5. **把搜尋相關變數加進 `.env`。** 讓 `MEILI_HOST` 指向 Meilisearch 程序,並使用你上面設定的同一把 master key。

   ```bash
   SEARCH=true
   MEILI_NO_ANALYTICS=true
   MEILI_HOST=http://localhost:7700
   MEILI_MASTER_KEY=<your_master_key>
   ```

6. **啟動 LibreChat。** 啟動或重新啟動應用程式,讓它讀到新的設定。

   ```bash
   npm run backend
   ```

> **讓 Meilisearch 保持執行**
>
> 對話搜尋只有在 Meilisearch 執行時才能用。把它當成受管理的服務或容器來執行,重新啟動後才會繼續運作。

設定完成後,LibreChat 會把對話與訊息建立索引到 Meilisearch,搜尋列就會回傳全文搜尋結果,並具備錯字容忍。

### v0.8.8-rc2 之後的重新建立索引

LibreChat v0.8.8-rc2 為對話與訊息加入了內部的「索引投影版本」。升級後第一次同步時,沒有目前版本標記的既有文件會被視為過期,並自動重新建立索引,讓較新的可搜尋欄位(包括由訊息支援的側邊欄結果)出現在 Meilisearch 裡。

這次遷移不需要手動重設。大型安裝在處理過期文件時,MongoDB、Meilisearch 與索引工作程序的負載可能暫時升高。在多節點部署中,請依下面所述,只在一個 LibreChat 節點上保持同步啟用。

## 環境變數

| 變數 | 說明 |
| --- | --- |
| `SEARCH` | 啟用對話搜尋功能。設成 `true`。 |
| `MEILI_HOST` | LibreChat 連到 Meilisearch 的網址。在 Docker 裡是 `http://meilisearch:7700`(由 Compose 設定);從原始碼執行時通常是 `http://localhost:7700`。 |
| `MEILI_MASTER_KEY` | 與 Meilisearch 驗證用的共用密鑰。必須和 Meilisearch 啟動時使用的金鑰相符。 |
| `MEILI_NO_ANALYTICS` | 停用 Meilisearch 的匿名遙測。設成 `true`。 |
| `MEILI_NO_SYNC` | 見[多節點設定](#在多節點設定中停用同步)。 |

## 在多節點設定中停用同步

如果你把 LibreChat 當成節點叢集或多節點部署來執行,只在一個實例上保持同步啟用,並在其他每個實例上設定 `MEILI_NO_SYNC=true`。這樣可以避免各節點重複做索引工作。

```bash
MEILI_NO_SYNC=true
```

## 重設同步

如果 Meilisearch 的資料被刪除或損毀,或 LibreChat 把所有東西都當成已同步、實際上卻沒有(例如升級 Meilisearch 或刪除其資料檔之後),請用重設腳本強制完整重新同步。它會重設 MongoDB 裡的同步旗標,讓 LibreChat 在下次啟動或同步檢查時,把所有對話與訊息重新建立索引。

1. **執行重設腳本。** 依你的設定使用對應的指令。

   ```bash
   # 本機開發
   npm run reset-meili-sync

   # Docker(預設設定)
   docker compose exec api npm run reset-meili-sync

   # Docker(部署設定)
   docker exec -it LibreChat-API /bin/sh -c "cd .. && npm run reset-meili-sync"
   ```

2. **重新啟動 LibreChat。** 應用程式重新啟動後,就會開始重新同步。

腳本會把 MongoDB 裡所有訊息與對話的 `_meiliIndex` 旗標重設為 `false`,然後回報重設了多少份文件、還有多少份待同步。

**何時使用:**

- 刪除 Meilisearch 資料檔之後
- 把 Meilisearch 升級到需要重新建立索引的版本時
- LibreChat 顯示對話已完全同步,但 Meilisearch 缺資料時
- 還原 MongoDB 備份,但沒有對應的 Meilisearch 資料時

**進階同步選項。** 重設之後,可以用下列環境變數控制同步行為:

| 變數 | 預設值 | 說明 |
| --- | --- | --- |
| `MEILI_SYNC_BATCH_SIZE` | `100` | 每一批同步的文件數量。 |
| `MEILI_SYNC_DELAY_MS` | `100` | 批次之間的延遲,單位毫秒。 |
| `MEILI_SYNC_THRESHOLD` | `1000` | 觸發同步所需的最少未同步文件數。 |

## References

- [Meilisearch(官方文件)](https://www.librechat.ai/docs/configuration/meilisearch)
