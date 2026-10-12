# 以文字上傳檔案(Upload Files as Text)

附加支援的檔案,讓 LibreChat 自動依檔案內容決定如何傳送或擷取。

想過把 PDF、程式碼檔或試算表交給 AI,然後說一句「幫我讀這個」嗎?LibreChat 的統一上傳器,會依檔案類型與所選端點,自動把檔案交給供應商,或擷取它的文字。

你附加檔案,LibreChat 從中擷取文字,再把完整內容直接貼進你的對話。AI 就能讀到每一個字:不需要外掛、不需要向量資料庫、不需要額外的服務。開箱即用。

> **不需任何設定**
>
> 「以文字上傳」在任何 LibreChat 實例上都能立刻使用。它用的是內建的文字解析,你不需要 OCR、RAG 管線或任何外部服務就能開始。

---

## 如何使用

1. **開啟面板**

   在[訊息輸入框](https://www.librechat.ai/docs/features/composer#add-files)點 **+**。你也可以把檔案拖到輸入框上。

2. **選擇來源**

   在 **Attach** 區段選 **From Local Computer**,若已設定,也可以選 **From SharePoint**。預設的上傳器不會要你選擇模型或工具的目的地。

   如果管理員啟用了 [`legacyFileUploadUX`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#legacyfileuploadux),就要自己選目的地:選 **More upload options**,再選 **Upload as Text**。

3. **選擇你的檔案**

   選取檔案。LibreChat 會依檔案類型與端點的能力,選擇供應商原生傳送、文字擷取,或只存給工具使用。

4. **提出你的問題**

   照平常輸入提示。被選取的 File Search 與 Code 工具,只有在需要時才會收到檔案。

一次選取多個檔案時,LibreChat 會略過重複的檔案與超過單檔大小限制的檔案,在通知中列出被略過的檔案名稱,並繼續上傳有效的檔案。檔案數量與整批總大小的限制,仍然適用於剩下的檔案;如果剩下的這一批超過其中任一項限制,整批會一起被拒絕。單一檔案的行為不變。

> **沒看到這個選項?**
>
> 啟用 `legacyFileUploadUX` 時,如果 **More upload options** 底下沒有出現 **Upload as Text**,可能是管理員停用了 `context` 能力。它預設是開的,但如果能力清單被自訂過,就必須明確包含 `context`。請見下面的 [`context` 能力](#context-能力)。

---

## 把長文字貼成檔案

在一般的訊息輸入框,LibreChat 可以把超過 2,500 個字元的貼上內容,轉成「以文字上傳」的附件。這樣大段貼上的內容不會留在輸入框裡,模型仍然能透過對話上下文取得內容。第一個附件命名為 `pasted-text.txt`;之後貼上的附件會帶編號。

瀏覽器本機的 **Paste long text as a file** 設定,預設是啟用的,位置在 **Settings > Chat > Sending**。較短的貼上,以及回答 Agent 的 **Ask User** 表單時貼上的文字,仍然留在輸入框裡。如果無法上傳上下文,文字也會留在輸入框。如果附件上傳失敗,LibreChat 會在不覆蓋較新草稿的前提下,把文字還原到輸入框。

貼上文字的附件,與其他「以文字上傳」的檔案一樣,遵循相同的檔案大小、token 與 [`fileTokenLimit`](#token-限制與截斷) 規則。

---

## 背後發生了什麼事

當上傳被導向文字時,LibreChat 不會把原始位元組倒進提示。它會經過一條處理管線,擷取乾淨、可讀的文字:

1. **MIME 類型偵測**:LibreChat 檢查 MIME 類型,判斷你上傳的是什麼檔案(PDF、圖片、音訊、原始碼等)。
2. **選擇方法**:依檔案類型與可用的服務,依下列優先順序選出最適合的擷取方法:

   | 優先順序 | 方法 | 何時使用 |
   |----------|------|----------|
   | 第 1 | **OCR** | 檔案是圖片或掃描文件,_而且_已設定 OCR |
   | 第 2 | **STT**(語音轉文字) | 檔案是音訊,_而且_已設定 STT |
   | 第 3 | **文字解析** | 檔案符合已知的文字 MIME 類型 |
   | 第 4 | **後備方案** | 上面都不符合:仍然嘗試文字解析 |

   決策範例:

   - **在已設定 OCR 的實例上的 `.pdf`:** → 由 OCR 處理。適合掃描文件與複雜版面。
   - **在預設實例(沒有 OCR)上的 `.pdf`:** → 由文字解析處理。對以數位方式建立的 PDF 效果很好。
   - **`.py` Python 檔案:** → 直接文字解析。原始碼本來就是文字,不需要轉換。
   - **在已設定 STT 的實例上的 `.mp3`:** → 語音轉文字把它轉錄成對話用的文字。
   - **沒有設定 OCR 時的 `.png` 螢幕截圖:** → 退回文字解析(結果有限,建議設定 OCR 處理圖片)。

3. **截斷 token**:擷取出的文字會被裁到 `fileTokenLimit`(預設:100,000 tokens),避免超過模型的上下文視窗。
4. **插入提示**:文字會被放進對話上下文,就在你的訊息旁邊。

預覽或下載「以文字上傳」的附件時,LibreChat 提供的是和檔案紀錄一起存放的擷取文字。即使文字是由 OCR 或其他解析器產生、沒有可串流的原始檔案,下載時也會使用 `.txt` 檔名。

---

## 支援哪些檔案

### 文字與程式碼

這些直接解析:它們本來就是文字,不需要轉換。

- 純文字(`.txt`)、Markdown(`.md`)、CSV、JSON、XML、HTML、CSS
- 程式語言:Python、JavaScript、TypeScript、Java、C#、PHP、Ruby、Go、Rust、Kotlin、Swift、Scala、Perl、Lua
- 設定檔:YAML、TOML、INI
- Shell 腳本、SQL 檔案

### 文件

文字解析可以直接處理這些。如果已設定 OCR,OCR 會接手,對複雜版面更準確。

- **PDF**:數位與掃描(掃描的 PDF 用 OCR 更好)
- **Word**:`.docx`、`.doc`
- **PowerPoint**:`.pptx`、`.potx`、`.ppt`
- **Excel**:`.xlsx`、`.xls`
- **EPUB** 電子書

### 圖片

圖片**需要 OCR** 才能得到有用的文字。沒有 OCR,結果會很差。

- JPEG、PNG、GIF、WebP
- HEIC、HEIF(Apple 格式)
- 螢幕截圖、文件照片、掃描頁面

### 音訊

音訊檔案**需要設定 STT**。沒有後備方案:音訊無法被「文字解析」。

- MP3、WAV、OGG、FLAC
- M4A、WebM
- 語音錄音、Podcast 片段

LibreChat 會先把 Linux 上的 Chrome 回報的 shell 腳本 MIME 變體(`application/x-shellscript`),以及 libmagic 回報的(`text/x-shellscript`),正規化成標準的 `application/x-sh`,再比對端點的允許清單。自訂的 [`supportedMimeTypes`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#supportedmimetypes-3) 規則仍然必須允許 `application/x-sh`。

---

## 統一上傳與工具的提供

預設情況下,一個附加動作取代了舊的目的地選擇器。LibreChat 決定檔案如何送到模型,工具則是延遲提供(lazy provisioning):

- **模型上下文**([背後發生了什麼事](#背後發生了什麼事)):支援的檔案,依 MIME 類型、端點能力與部署設定,透過供應商原生傳送或擷取出的文字,到達模型。
- **上傳做 File Search(RAG)**([RAG API](https://www.librechat.ai/docs/features/rag_api)):選了 File Search 時,LibreChat 只在這次執行需要該工具時,才替符合資格的附件建立索引。
- **標準上傳**([Agents](https://www.librechat.ai/docs/features/agents)):選了 Code 時,LibreChat 只在這次執行需要時,才讓符合資格的附件可供 Code 環境使用。

營運者可以用 [`fileConfig.legacyFileUploadUX`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#legacyfileuploadux) 恢復先前的目的地選擇器,或用 [`defaultLLMDeliveryPath`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#defaultllmdeliverypath) 控制自動導向。

**典型的導向:**

| 情境 | 最佳選項 |
|------|----------|
| _「讀這份 5 頁的合約並摘要」_ | 原生 PDF 傳送或擷取文字 |
| _「我有 50 份 PDF,找出提到價格的」_ | 延遲提供 File Search |
| _「這張螢幕截圖裡有什麼?」_ | 原生圖片傳送 |
| _「執行這個 Python 腳本」_ | 延遲提供 Code |
| _「檢查這個程式碼檔有沒有 bug」_ | 擷取文字 |

---

## `context` 能力

「以文字上傳」在底層是由 **`context` 能力**驅動。它控制這個功能會不會出現在你的聊天介面。

> `context` 能力**預設是啟用的**。只有在管理員自訂過能力清單、不小心漏掉它時,你才需要動它。

```yaml
endpoints:
  agents:
    capabilities:
      - "context"  # 這就是啟用「Upload as Text」的設定
```

同一個 `context` 能力,也驅動 **Agent File Context**(透過 Agent 建構器上傳檔案,把文字嵌進 Agent 的系統指示)。差別在於文字最後放在_哪裡_:

| | 以文字上傳 | Agent File Context |
|---|---|---|
| **位置** | 聊天輸入(任何對話) | Agent 建構器面板 |
| **範圍** | 只限目前的對話 | 持續存在 Agent 的指示裡 |
| **用途** | 一次性的文件提問 | 建立內建知識的專門 Agent |

---

## Token 限制與截斷

檔案太長、塞不進模型的上下文視窗時,LibreChat 會把擷取的文字截斷在範圍內。這是自動發生的,你不必擔心,但了解它如何運作會有幫助。

```yaml
fileConfig:
  fileTokenLimit: 100000  # 預設:100,000 tokens
```

> **截斷代表內容遺失**
>
> 如果檔案超過限制,文字會從結尾被截掉。如果你得到的答案不完整,可能就是這個原因。你可以提高 `fileTokenLimit`,但要記得較大的值,每則訊息會用掉更多 token,這會增加成本,也可能撞到模型自己的上下文限制。

**經驗法則:**

- 100k tokens 大約等於一本 300 頁的書(對大多數情況綽綽有餘)
- 如果你處理的是很大的檔案,考慮改用 [File Search(RAG)](https://www.librechat.ai/docs/features/rag_api):它只擷取相關的段落,而不是把所有內容塞進上下文

---

## 選用:用 OCR 提升擷取品質

文字解析對以數位方式建立的文件(從 Word 存出的 PDF、程式碼檔、純文字)效果很好。但如果你上傳的是**掃描文件、頁面照片,或含有文字的圖片**,內建的解析器效果不會太好。

這時就需要 OCR。設定之後,LibreChat 會自動對適合的檔案類型使用 OCR;身為使用者,你不需要做任何不同的事。

### 如何請管理員設定 OCR

請他們參考 [OCR 設定文件](https://www.librechat.ai/docs/features/ocr)。簡短版:

```yaml
ocr:
  strategy: "mistral_ocr"
  apiKey: "${OCR_API_KEY}"
  baseURL: "https://api.mistral.ai/v1"
  mistralModel: "mistral-ocr-latest"
```

設定完成後,OCR 會自動處理圖片與掃描的 PDF,使用者端不需要任何改變。

### 如何請管理員設定 STT(用於音訊檔案)

要轉錄音訊上傳,管理員需要設定語音轉文字服務。請見 [STT 設定參考](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#stt)。

---

## 檔案處理設定參考

這一節是給想控制「哪些檔案類型用哪種方法處理」的管理員。預設值就很好用,只有想微調行為時才需要動它。

### 完整的 `fileConfig` 範例

```yaml
fileConfig:
  # 單一檔案在截斷之前,最多擷取的 token 數
  fileTokenLimit: 100000

  # 符合這些 MIME 樣式的檔案使用 OCR(若已設定)
  ocr:
    supportedMimeTypes:
      - "^image/(jpeg|gif|png|webp|heic|heif)$"
      - "^application/pdf$"
      - "^application/vnd\\.openxmlformats-officedocument\\.(wordprocessingml\\.document|presentationml\\.presentation|spreadsheetml\\.sheet)$"
      - "^application/vnd\\.ms-(word|powerpoint|excel)$"
      - "^application/epub\\+zip$"

  # 符合這些 MIME 樣式的檔案使用文字解析
  text:
    supportedMimeTypes:
      - "^text/(plain|markdown|csv|json|xml|html|css|javascript|typescript|x-python|x-java|x-csharp|x-php|x-ruby|x-go|x-rust|x-kotlin|x-swift|x-scala|x-perl|x-lua|x-shell|x-sql|x-yaml|x-toml)$"

  # 符合這些 MIME 樣式的檔案使用 STT(若已設定)
  stt:
    supportedMimeTypes:
      - "^audio/(mp3|mpeg|mpeg3|wav|wave|x-wav|ogg|vorbis|mp4|x-m4a|flac|x-flac|webm)$"
```

**優先順序提醒:** OCR > STT > 文字解析 > 後備方案。

完整的參考請見[檔案設定物件結構(File Config Object Structure)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config)。

---

## 疑難排解

### 沒有出現「Upload as Text」選項

你的設定裡很可能拿掉了 `context` 能力。請管理員把它加回來:

```yaml
endpoints:
  agents:
    capabilities:
      - "context"
```

### 檔案內容看起來不對,或幾乎是空的

幾件事可以檢查:

- **掃描的 PDF / 圖片**:這些需要 OCR 才能正確擷取文字。沒有 OCR,解析器可能回傳亂碼或什麼都沒有。請管理員[設定 OCR](https://www.librechat.ai/docs/features/ocr)。
- **音訊檔案**:這些需要 STT。音訊沒有文字後備方案。
- **損壞的檔案**:試著在本機打開檔案,確認它沒有損壞。
- **不支援的格式**:如果 MIME 類型不符合任何已設定的樣式,LibreChat 會嘗試文字解析後備方案,對二進位格式可能行不通。

### 上傳被拒絕,說是不支援的檔案類型

LibreChat 會在上傳錯誤裡回傳被拒絕的 MIME 類型。檢查目前端點的 [`fileConfig.endpoints.<endpoint>.supportedMimeTypes`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#supportedmimetypes-3) 樣式,並允許你想接受的標準類型。對 shell 腳本,請用 `application/x-sh`;LibreChat 會在比對前,把常見的 `application/x-shellscript` 與 `text/x-shellscript` 變體正規化。

### AI 好像漏掉了我檔案的一部分

你的檔案很可能超過了 `fileTokenLimit`,文字被截斷了。

**選項:**

- 請管理員在 `librechat.yaml` 提高 `fileTokenLimit`
- 改用 [File Search(RAG)](https://www.librechat.ai/docs/features/rag_api),它擷取相關的片段,而不是載入整個檔案
- 把檔案分成較小的部分,分別上傳

### 圖片上傳了,但 AI 讀不到裡面的文字

沒有 OCR 時,圖片是用文字解析處理,而文字解析無法真的「看見」圖片裡的文字。你需要設定 OCR 才行。請見 [OCR for Documents](https://www.librechat.ai/docs/features/ocr)。

另一個做法是搭配**視覺模型**使用標準檔案上傳:模型本身就能讀圖片裡的文字。

---

## 相關頁面

- [OCR for Documents](https://www.librechat.ai/docs/features/ocr):為圖片與掃描檔設定光學字元辨識
- [RAG API(Chat with Files)](https://www.librechat.ai/docs/features/rag_api):對大型文件集合做語意搜尋
- [Agents — File Context](https://www.librechat.ai/docs/features/agents#file-context):把檔案內容嵌進 Agent 的系統指示
- [File Config 參考](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config):檔案處理的完整 YAML 結構

## References

- [Upload Files as Text(官方文件)](https://www.librechat.ai/docs/features/upload_as_text)
