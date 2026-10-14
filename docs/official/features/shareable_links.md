# 分享連結(Shareable Links)

用 LibreChat 的分享連結功能和別人分享對話，支援 QR code、分支訊息與 Artifacts。

分享連結讓你把對話的某一條分支發布成唯讀版本，別人透過產生的網址或 QR code 就能打開。收到的人看得到發布的訊息、分支與 Artifacts,但不會改到原本的對話。已登入的收件人可以從看到的分支接著聊，成為自己的一份副本。

## 主要功能

- **分享簡單**:點兩下就能產生連結。
- **QR code**:用手機掃碼就能打開對話。
- **分支**:分享連結保留對話的每一條分支。
- **Artifacts**:React 元件、HTML 預覽和 Mermaid 圖表仍然可以互動。
- **檔案快照**:對話中引用的檔案，可以從分享連結預覽或下載，而不必讓收件人取得擁有者檔案的存取權限(ACL)。
- **以副本接續**:已登入的檢視者可以把看到的分支複製到自己的對話紀錄，繼續聊下去。
- **收件人偏好**:檢視者可以切換語言與主題。
- **穩定更新**:發布較新的對話輪次與目前的檔案選擇，網址不變。
- **分享標記**:有效的連結會在對話清單與聊天標題列上標示出來。
- **連結管理**:在一個管理畫面檢視或撤銷你建立的每個連結。

## 分享對話

可以從兩個地方開始分享。

1. **從對話選單。** 打開側邊欄某個對話旁邊的選單，選擇分享選項。

   ![對話選單中的分享選項](https://www.librechat.ai/images/shared-links/share-from-menu.png)

2. **從分享按鈕。** 在進行中的對話裡，使用標題列上專用的分享按鈕。

   ![進行中對話的分享按鈕](https://www.librechat.ai/images/shared-links/share-button.png)

## 分享連結的選項

建立連結時會打開一個對話框，讓你控制對話在收件人眼中的樣子。

![建立分享連結的對話框](https://www.librechat.ai/images/shared-links/share-modal-create.png)

![含管理選項的分享連結對話框](https://www.librechat.ai/images/shared-links/share-modal-options.png)

連結建立後，對話框提供以下動作:

- **Update link**(更新連結):依選定分支的最後一則訊息與目前的檔案分享選擇，重新發布最新的訊息，網址不變。
- **Generate QR code**(產生 QR code):建立 QR code,方便用手機開啟。
- **Copy link to clipboard**(複製連結):複製可分享的網址。
- **Delete link**(刪除連結):移除連結，撤銷所有持有連結的人的存取權。

啟用檔案快照時，使用者可以選擇連結要不要包含發布的訊息中引用的檔案。選定的檔案會固定在這一次的分享版本上，透過分享專用的路由提供，而不會讓收件人取得擁有者檔案的存取權限。更新連結時，會取代固定的檔案組與檔案分享選擇;穩定的檔案網址會重新驗證，所以已移除或被取代的快照，不會從瀏覽器較舊的快取中被提供。

發布時，會綁定到選定分支在資料庫中確切的最後一則訊息。如果最新的訊息還在儲存中,LibreChat 會重試一次，不會改用其他分支。若最後一則訊息仍然無法取得，或對話還沒有任何已儲存的訊息，對話框會顯示明確的錯誤，讓你等一下再試。無法顯示的分享連結頁面，也會提供 **Retry**(重試)，重新讀取同一個網址。

## QR code

可以為任何分享的對話產生 QR code,再用手機相機掃描來打開連結。這個 code 指向同一個分享網址。

![為分享連結產生的 QR code](https://www.librechat.ai/images/shared-links/qr-code.png)

![QR code 的下載選項](https://www.librechat.ai/images/shared-links/qr-code-download.png)

QR code 適合用在簡報、快速用手機開啟、印出的講義和研討會展示。

## 檢視分享的對話

別人打開你的連結時，會看到發布的分支的專注、唯讀檢視，包含日期、訊息與 Artifacts。

![收件人看到的分享對話](https://www.librechat.ai/images/shared-links/shared-view.png)

## 接續分享的對話

已登入的檢視者可以選 **Continue this chat**(接續這個對話)，從目前顯示的分支建立一份個人的對話。LibreChat 只會複製通往目前這則訊息的直接路徑(包含符合條件的檔案快照引用)，並在檢視者的帳號下打開新的對話。

接續不會改變分享的快照，也不會改變擁有者的對話。公開檢視者必須先登入,LibreChat 才能建立他們的副本。

複製的請求會綁定到檢視者載入的那個分享版本。如果擁有者在檢視者接續之前更新了同一個連結,LibreChat 會重新載入目前的版本，並請檢視者重試，而不是依過時的內容複製訊息位置。

## 分支

分享連結會保留對話的分支，讓收件人可以跟著討論走過的不同路徑。用分支導覽箭頭在分支之間切換。

![分享對話中的分支導覽選單](https://www.librechat.ai/images/shared-links/branching-menu.png)

![在分享對話中切換分支](https://www.librechat.ai/images/shared-links/branching-support.png)

這很適合用來展示不同的提示詞會帶出不同的 AI 回覆，或同一個問題可以用哪幾種方式處理。

## Artifacts

對話中產生的 Artifacts,在分享連結裡仍然完整可用。

![分享對話中可互動的 Artifacts](https://www.librechat.ai/images/shared-links/artifacts-support.png)

收件人可以:

- 檢視可互動的 React 元件。
- 看 HTML 預覽。
- 檢視 Mermaid 圖表。
- 閱讀背後的程式碼，以及它產生時的上下文。

## 收件人偏好

檢視者可以依自己的偏好調整介面，不會影響你的設定。

![分享連結上的語言與主題設定](https://www.librechat.ai/images/shared-links/recipient-settings.png)

- **主題**:淺色、深色或跟隨系統。
- **語言**:用自己偏好的語言檢視介面。

## 管理你的分享連結

在 **Settings → Data Controls**(設定 → 資料控制)打開 Shared Links(分享連結)管理畫面，檢視你分享過的每一段對話。

![分享連結管理畫面](https://www.librechat.ai/images/shared-links/management-modal.png)

![單一分享連結的詳細資料與選項](https://www.librechat.ai/images/shared-links/management-details.png)

在管理畫面你可以:

- **檢視所有連結**:看你分享過的每一段對話。
- **搜尋與篩選**:找到特定的分享連結，並預覽它的內容。
- **撤銷存取**:刪除連結，立即停止分享。

有有效分享連結的對話，也會在側邊欄顯示連結標記，聊天標題列上的分享控制項也會顯示同樣的啟用狀態。

## 設定

`.env` 檔裡有三個環境變數控制這個功能:

- **`ALLOW_SHARED_LINKS`**(預設 `true`):啟用分享連結功能。設為 `false` 時，使用者不能建立連結。
- **`ALLOW_SHARED_LINKS_PUBLIC`**(預設 `false`):控制連結是否不需驗證就能打開。預設收件人必須登入。設為 `true` 則允許公開、不需驗證的存取。
- **`SHARED_LINKS_SNAPSHOT_FILES`**(預設 `true`):控制分享連結能不能包含對話中引用的檔案。有設定時，這個環境變數會覆寫 [`interface.sharedLinks.snapshotFiles`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#sharedlinks)。

```bash
# .env
# 啟用分享連結(預設)
ALLOW_SHARED_LINKS=true

# 檢視分享連結需要驗證(預設)
ALLOW_SHARED_LINKS_PUBLIC=false

# 分享連結的快照包含引用的檔案(預設)
SHARED_LINKS_SNAPSHOT_FILES=true
```

角色權限決定哪些使用者可以建立連結、分享給已驗證的使用者，或讓連結對這個實例上的所有人可見:

```yaml
# librechat.yaml
interface:
  sharedLinks:
    create: true
    share: true
    public: false
    snapshotFiles: true
```

`sharedLinks.public` 控制使用者能不能切換「分享給所有人」。`ALLOW_SHARED_LINKS_PUBLIC` 仍然決定這些公開連結能不能不登入就檢視。`sharedLinks.snapshotFiles` 從 YAML 控制預設的檔案快照行為,`SHARED_LINKS_SNAPSHOT_FILES` 可以全域覆寫或停用它。

> 完整的環境變數參考，見 [.env Configuration](https://www.librechat.ai/docs/configuration/dotenv#shared-links) 頁面。

## 常見問題

**收件人可以回覆分享的對話嗎?**

分享的快照維持唯讀。已登入的收件人可以選 **Continue this chat**,建立個人副本，在那裡和 AI 互動。

**分享之後刪除對話，會怎樣?**

連結會失效。打開它的人會看到「Shared link not found」(找不到分享連結)頁面。

**分享之後可以編輯對話嗎?**

可以。對連結中已包含的訊息所做的編輯，會出現在分享檢視中。發布的分支最後一則訊息之後的新輪次，要選 **Update link** 之後才會出現;網址不變。

**分享連結可以離線使用嗎?**

不行。收件人需要網路連線才能檢視分享的對話。

## References

- [Shareable Links(官方文件)](https://www.librechat.ai/docs/features/shareable_links)
