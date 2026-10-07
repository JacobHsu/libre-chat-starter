# 訊息輸入框(Message Composer)

在輸入框撰寫訊息、附加檔案,並從輸入框的 **+** 面板開啟工具、技能與 MCP 伺服器;回覆串流時,可以把後續訊息排進佇列,或引導(steer)目前的回覆。

訊息輸入框是每個對話下方的那個框。除了文字欄位,它還有一個 **+** 按鈕,可以開啟你能加到訊息的所有東西(檔案、工具、技能、MCP 伺服器,以及你先前上傳過的檔案);還有目前已開啟工具的標籤(chip),以及推理、語音輸入與送出的控制項。

## 輸入框上有什麼

| 元素 | 功能 |
|---|---|
| **+**(**Attach and tools**) | 開啟面板:上傳選項、工具、技能、MCP 伺服器與你最近使用的檔案,全部可以用同一個欄位搜尋。 |
| 工具標籤 | 每個已開啟的工具或 MCP 伺服器一個標籤,放在 **+** 按鈕旁邊。移除標籤就會關閉該工具。 |
| 暫存的上下文 | 附加在你下一則訊息的檔案、引用與技能,顯示在文字欄位上方。 |
| **Thinking** | 支援推理的模型可以調整推理強度。 |
| 上下文用量 | 對話用掉模型上下文視窗的多少,在能取得 token 用量時顯示。 |
| **Use microphone** | 啟用語音轉文字時,用語音輸入你的訊息。 |
| 送出 / 停止 | 送出訊息,或停止正在串流的回覆。 |

要看目前適用哪些按鍵,例如 `/ for prompts`、`@ for models` 或 `Enter to send`,請在 **Settings > General** 開啟 **Show composer tips**。文字欄位下方會出現一行提示。預設是關閉的。

![輸入框開啟 + 面板,顯示 Attach 與 Tools 區段](https://www.librechat.ai/images/composer/composer-palette.png)

## 加入檔案

點 **+**,在 **Attach** 區段選一個選項。你也可以把檔案拖到輸入框,或直接貼上。

預設情況下,LibreChat 使用統一上傳器:你只需要選來源,它會依檔案類型與端點,決定每個檔案怎麼送到模型(供應商原生上傳、文字擷取,或像 File Search 這樣的工具)。

| 選項 | 何時出現 |
|---|---|
| **From Local Computer** | 使用預設上傳器時一律出現。 |
| **From SharePoint** | 啟用 [SharePoint 檔案選擇器](https://www.librechat.ai/docs/configuration/sharepoint)時。 |

如果管理員設定 [`fileConfig.legacyFileUploadUX: true`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/file_config#legacyfileuploadux),就改成由你自己選目的地。**Attach** 區段會先顯示主要選項,其餘收在 **More upload options** 之下:

| 選項 | 何時出現 |
|---|---|
| **Upload to Provider** | 供應商可以直接接受文件時(例如 OpenAI、Anthropic、Google、Bedrock、OpenRouter 與自訂端點,或開啟 Responses API 的 Azure OpenAI)。 |
| **Upload Image** | 供應商只接受圖片時,取代 **Upload to Provider** 顯示。 |
| **Upload as Text** | 啟用[上下文功能(context capability)](https://www.librechat.ai/docs/features/upload_as_text)時。 |
| **Upload for File Search** | 目前的 Agent 啟用並允許 File Search 時。選它也會順便開啟 File Search。 |
| **Upload to Code Environment** | 目前的 Agent 啟用並允許程式碼執行時。選它也會順便開啟 **Run Code**。 |
| **Attach Files** | Assistants 端點,由 Assistant 自己的設定處理檔案。 |

在這個模式下啟用 SharePoint 時,每個選項也會有 SharePoint 版本,標示成例如 **Upload to Provider (From SharePoint)**。

### 重複使用先前上傳的檔案

面板的 **Your files** 區段列出你最近使用過的檔案。選一個就能再次附加,不用重新上傳。在搜尋欄輸入文字,會依檔名搜尋你所有的檔案。

在該區段選 **Show all**,可以在對話框中瀏覽每個檔案,有 **All**、**Images**、**Documents** 三種檢視、搜尋欄,以及圖片與 PDF 的預覽。

面板最多顯示五個最近的檔案。管理員可以用 [`interface.composerRecentFiles`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#composerrecentfiles) 調低這個數字,設成 `0` 就隱藏這個清單。

## 開啟工具、技能與 MCP 伺服器

面板列出你能為目前對話開啟的所有東西,分成幾個區段:

- **Tools**:內建工具,例如 **Web Search**、**Run Code**、**File Search**、**Skills**、**Memory** 與 **Artifacts**,每一項只在已啟用且你有權限時才顯示。
- **Skills**:你可以附加到下一則訊息的個別[技能(skills)](https://www.librechat.ai/docs/features/skills)。
- **MCP Servers**:對話中可用的 [MCP 伺服器](https://www.librechat.ai/docs/features/mcp)。

選一個工具或 MCP 伺服器就能開啟或關閉。面板會保持開啟,所以一次可以切換好幾個。每個已開啟的工具會在輸入框上顯示成一個標籤;移除標籤就關閉它。有些標籤附有模式選單,例如 **Artifacts** 的產生模式。

選技能則是把它暫存到你的下一則訊息:它會出現在[暫存的上下文](#暫存的上下文),而不是標籤。

MCP 伺服器那一列會顯示每個伺服器的連線狀態。選一個尚未連線的伺服器,會開始連線(伺服器需要時包含 OAuth 登入),或在需要你的憑證時先開啟它的設定。連線後,需要使用者憑證的伺服器那一列也會有 **Configure** 控制項,**Web Search** 也有一個設定它的 API 金鑰的控制項。

> **Agent 自帶工具**
> 選了 Agent 時,**Tools** 與 **MCP Servers** 區段會隱藏,因為由 Agent 自己的設定決定它使用哪些工具。在其他端點上,設了 `hideBadgeRow: true` 的[模型規格(model spec)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/model_specs#hidebadgerow)會隱藏 **Tools**、**Skills** 與 **MCP Servers** 區段。不論哪種情況,**Attach** 與 **Your files** 都還在。

### Show all

面板每個區段只顯示少數幾列。在 **Skills**、**MCP Servers** 或 **Your files** 的標題上選 **Show all**,會開啟一個對話框,有完整清單、搜尋欄與篩選。技能與 MCP 伺服器有三種檢視:**All**、**Made by you** 與 **Favorites**。

### 我的最愛與釘選的工具

幫某一列加星號,就會加進 **Favorites**,放在面板最上面。在某一列被標示(highlight)時,按 <kbd>Ctrl</kbd>+<kbd>D</kbd>(macOS 是 <kbd>Cmd</kbd>+<kbd>D</kbd>)可以加星號或取消。我的最愛會存在你的帳號。

管理員可以用 [`interface.defaultPinnedTools`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#defaultpinnedtools) 釘選內建工具。被釘選的工具即使是關閉的,標籤也會留在輸入框,所以你一鍵就能開啟。移除一個關閉中、被釘選的工具的標籤,就會取消釘選。

## 暫存的上下文

附加到你下一則訊息的所有東西,會在送出前顯示在文字欄位上方:

- **檔案**,有上傳進度,圖片有預覽。貼上的長文字也可能以檔案形式出現在這裡,你可以編輯,或把它移回訊息裡。
- **引用(Quotes)**:你從先前訊息選取的內容。
- **技能(Skills)**:你從面板或用 `$` 指令選的技能。

用每一項的移除按鈕可以移除它。暫存的所有東西都會跟著你的下一則訊息一起送出。

## 思考與強度

對有推理設定的模型,**Thinking** 控制項會開啟一個滑桿,從 **Faster** 到 **Smarter**,另外還有供應商各自的模式,例如 **Auto** 或關閉。它修改的是和參數面板(Parameters panel)相同的參數,所以當模型沒有推理設定,或部署用 `interface.parameters` 關掉參數時,它是隱藏的。

## 回覆串流時排隊與引導

回覆在串流時,你可以繼續打字。依端點與你的設定,按 <kbd>Enter</kbd> 會把訊息排進佇列,等回覆結束後送出,或是引導(steer)Agent 目前的回覆。輸入框的提示會指出 <kbd>Enter</kbd> 當下執行的是哪個動作。

排隊的訊息會出現在輸入框上方的 **Queued messages** 欄,你可以:

- **Edit message**:把它移回文字欄位。
- **Remove message**:把它從佇列移除。
- **Send now**:立刻送出,不用等。
- 拖曳訊息重新排序,或聚焦在某一則後用上、下方向鍵。

引導如何運作、何時可用,請見[引導與排隊的訊息(Steering and Queued Messages)](https://www.librechat.ai/docs/features/agents#steering-and-queued-messages)。

## 鍵盤快速鍵

### 在文字欄位

| 按鍵 | 動作 |
|---|---|
| <kbd>Enter</kbd> | 送出訊息(回覆串流時是排隊或引導)。 |
| <kbd>Shift</kbd>+<kbd>Enter</kbd> | 換行。 |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd>(<kbd>Cmd</kbd>+<kbd>Enter</kbd>) | 回覆串流時的另一種動作:<kbd>Enter</kbd> 是排隊時,它是 **send now**(立刻送出);<kbd>Enter</kbd> 是引導時,它是 **queue**(排隊)。 |
| <kbd>Alt</kbd>+<kbd>Enter</kbd>(<kbd>Option</kbd>+<kbd>Enter</kbd>) | Agent 回覆時:可用的話,中斷並送出。 |
| <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>(<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd>) | 停止回覆。 |
| `/` | 插入已儲存的提示詞。 |
| `@` | 切換到另一個模型、預設(preset)或 Agent。 |
| `+` | 加入另一個模型或預設,以取得額外的回覆。 |
| `$` | 為下一則訊息選一個技能。 |

如果你關掉了 **Press Enter to send messages**,則 <kbd>Ctrl</kbd>+<kbd>Enter</kbd>(<kbd>Cmd</kbd>+<kbd>Enter</kbd>)是送出,<kbd>Enter</kbd> 是換行。

### 在面板

| 按鍵 | 動作 |
|---|---|
| 輸入文字 | 搜尋工具、技能、伺服器、上傳選項與檔案。 |
| <kbd>↑</kbd> / <kbd>↓</kbd> | 在各列之間移動。 |
| <kbd>Enter</kbd> | 選擇被標示的那一列。 |
| <kbd>Ctrl</kbd>+<kbd>D</kbd>(<kbd>Cmd</kbd>+<kbd>D</kbd>) | 把被標示的那一列加進我的最愛,或移除。 |
| 搜尋欄為空時按 <kbd>Backspace</kbd> | 關閉面板。 |
| <kbd>Escape</kbd> | 關閉面板。 |

## References

- [Message Composer(官方文件)](https://www.librechat.ai/docs/features/composer)
