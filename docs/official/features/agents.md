# Agents:打造自訂的 AI 助理

了解如何建立、自訂與運用 LibreChat 的 AI Agents:一個可搭配任何模型供應商、打造自訂 AI 助理的強大框架。

LibreChat 的 AI Agents 功能提供彈性的框架，用各種模型供應商驅動，建立自訂的 AI 助理。

這個功能類似 OpenAI 的 Assistants API 和 ChatGPT 的 GPTs,但支援更多模型，而且不需要寫程式，就能打造具備專門能力的進階助理。

## 開始使用

要建立新的 Agent,在端點選單選擇「Agents」,然後打開側邊面板中的 Agent Builder(Agent 建構器)。

![Agents - 端點選單](https://www.librechat.ai/images/agents/endpoints_menu.png)

建立表單包含:

- **Avatar(頭像)**:上傳自訂頭像，讓 Agent 更有個人特色
- **Name(名稱)**:替 Agent 取一個好辨認的名字
- **Description(描述)**:選填，說明 Agent 的用途
- **Instructions(指示)**:定義 Agent 行為的系統指示
- **Model(模型)**:從可用的供應商與模型中選擇
- **Conversation Starters(開場提示)**:最多四個建議提示，使用者和這個 Agent 開始新對話時會顯示

**Tools** 與 **Skills** 控制項會打開可搜尋的資料庫，裡面有內建能力、工具、MCP 伺服器、Actions 與 Skills。選取一個項目進行設定，然後儲存 Agent。

**既有的 Agent 可以從側邊面板上方的下拉選單選取。**

- **也可以在聊天輸入框用「@」提及。**

![Agents - 提及](https://www.librechat.ai/images/agents/mention.png)

### 工具庫(Tool Library)

Agent Builder 把啟用的項目分成 **Tools** 與 **Skills** 兩個區段。打開 **Add tools** 可以搜尋完整的目錄，或依 **Official**、**Tools**、**MCP**、**Actions** 篩選。**Made by you** 收集你建立的 MCP 伺服器與 Actions;**Favorites** 讓加了星號的項目在所有 Agent 之間都能取用。每位使用者最多可以存 100 個工具庫最愛。

選取一個項目就能在建構器內設定，不必離開。只有當使用者有權限建立 MCP 伺服器或 Actions 時，才會出現 **Create new** 選單。移除 File Search、File Context 或 Code Interpreter 這類以檔案為基礎的能力時，如果附加的檔案還需要檢視，會打開它的檔案管理器。以檔案為基礎的能力只要還擁有檔案，就會保持選取，並在儲存時保留;要先移除或重新分配這些檔案，才能移除能力本身。

Skills 使用自己的選擇器，可以個別選取，也可以啟用整個可存取的目錄。見 [Skills](https://www.librechat.ai/docs/features/skills#agent-scope)。

維運者也可以使用實驗性的 [Agent Plugins](https://www.librechat.ai/docs/features/agent_plugins),把部署用的 Skills 與 MCP 伺服器打包成啟動時載入的套件。

### 模型設定(Model Configuration)

模型參數介面讓你微調 Agent 的回應:

- Temperature(0 到 1,回應的創意程度)
- 最大上下文 token 數
- 最大輸出 token 數
- 圖片細節(`low`、`auto` 或 `high`),用於原生視覺的圖片輸入
- 其他供應商專屬的設定

Agent 的指示可以使用 `{{current_date}}`、`{{current_datetime}}` 與 `{{iso_datetime}}`。LibreChat 依伺服器記錄的「這一輪邏輯對話開始的時間」解析它們，並在供應商的迴圈、Subagent 初始化與人機互動後的續跑之間保持這個時間戳不變。前兩個使用請求的時區;`{{iso_datetime}}` 維持 UTC。

可辨識的「找不到模型」與「供應商速率限制」錯誤，會顯示在地化的指引。其他供應商錯誤會保留有用的供應商訊息，但在訊息儲存前移除 LangChain 的疑難排解網址。啟用[與模型綁定的內容保護](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/message_filter#source-aware-filters)時，它的通用保護錯誤仍然優先。

### 版本歷史(Version History)

有編輯權限的使用者，可以從 Agent Builder 打開 **Version History**,在時間軸上檢視儲存過的設定。每一筆都顯示儲存時間，並摘要它的工具與能力。還原較早的紀錄需要確認，會用那次儲存的狀態取代 Agent 目前的設定。儲存時一定會套用 Agent 目前的變更，即使結果和最新的歷史紀錄相同、LibreChat 不會新增重複的紀錄。

### 開場提示(Conversation Starters)

開場提示讓使用者能快速開始和 Agent 對話。每個 Agent 最多可以存四個。

1. 在 Agent Builder 找到 **Conversation Starters** 欄位。
2. 輸入提示後按 **Enter**,或選 **+** 按鈕。加滿四個後，輸入框會停用。
3. 直接在原處編輯已存的提示，或選它的 **X** 按鈕移除。
4. 儲存 Agent。

使用者和這個 Agent 開新對話時，開場提示會以按鈕顯示在空白的聊天畫面上。選一個就會立即當作第一則訊息送出。如果 Agent 有開場提示，它們會優先於使用中的 model spec 所定義的 [`conversation_starters`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/model_specs#conversation_starters)。開場提示也會出現在 Agent 的 [Marketplace](https://www.librechat.ai/docs/features/agents#agent-marketplace) 詳細資料對話框中。

## Agent 的能力(Agent Capabilities)

> **注意:** 所有能力都可以透過 `librechat.yaml` 設定檔開關。詳見 [agents 物件的 capabilities](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#capabilities)。

### Ask User 與工具核准(Ask User and Tool Approval)

**Ask User** 工具讓 Agent 可以暫停執行，向使用者要求缺少的資訊、提供選項，或確認接下來怎麼做。一次呼叫最多可以把四個相關的問題放在一起。LibreChat 一次呈現一個問題，有 Back、Next 和可以點選的進度步驟;在步驟之間切換時，已填的答案都會保留，單選題選了就自動前進，不會送出。所有問題都有答案後，最後一步會出現 Submit;Skip 則可以在任何一步拒答整批問題。每個問題都接受自由填答，或 Agent 提供的單選、多選選項。模型準備這次呼叫時,LibreChat 會把問題串流到一張進度卡片;準備好之後，互動表單會取代它。送出一次之後，同一次執行會帶著完整的答案對照表繼續。從 Tools 市集加入 **Ask User**;管理員可以移除預設的 `ask_user_question` 能力來隱藏它。

把多題的卡片收合後，輸入框會回到一般的「引導或排隊」模式，暫停的卡片仍留在對話中。卡片仍然可以展開、作答、略過或停止。單題的暫停，則繼續使用聚焦的輸入框作答模式。

送出的答案會和續跑動作一起儲存，所以在續跑初始化期間按停止，已接受的答案也不會被丟掉。

問題紀錄定案之後，預設會收合成一行工具項目，讓很長的答案不會佔滿對話。打開它可以檢視問題，以及答案中保留的換行。既有的 **Auto-expand tool details** 偏好設定也控制這個定案後的檢視;還需要輸入時，即時表單會維持展開。

每個問題可以有選填的標題(最多 80 個字元)、問題文字(最多 2,000 個字元)、選填的補充說明(最多 4,000 個字元)，以及最多 12 個選項。選項標籤限 280 個字元，選項值限 500 個字元，每個送出的答案限 16,000 個字元。

管理員也可以要求符合條件的工具呼叫在執行前先經過審查。依工具的不同，使用者可以核准、拒絕、編輯參數，或直接回覆。暫停的執行會建立檢查點，做出決定後就能繼續，使用預設的 MongoDB 檢查點時，甚至可以在另一個副本上繼續。部署層級的工具核准預設是關閉的;但附加了程式碼環境的 Agent,會套用[預設詢問的安全政策](https://www.librechat.ai/docs/features/code_interpreter#attached-environment-tool-permissions),除非管理員明確停用。見 [`toolApproval` 與 `checkpointer`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#toolapproval)。

待核准的項目在輸入框的審查面板中打開時，對應的對話卡片會把請求顯示為紀錄，不會重複出現決定按鈕。在訊息框上方的面板中審查這些呼叫，然後選 **Continue**。從輸入框的小標籤收合面板，會把控制項還給對話卡片，你的決定也會保留;再打開時，審查又交回面板。其他動作的卡片保有自己的控制項。

### 工具(Tools)

Agent 也可以用各種內建工具強化:

- **[OpenAI Image Tools](https://www.librechat.ai/docs/features/image_gen#openai-image-tools)**:使用 **[GPT-Image-1](https://platform.openai.com/docs/models/gpt-image-1)** 產生與編輯圖片
- **[Gemini Image Tools](https://www.librechat.ai/docs/configuration/tools/gemini_image_gen)**:使用 Gemini 圖片模型產生圖片，以及依圖片上下文編輯
- **[DALL-E-3](https://www.librechat.ai/docs/features/image_gen#dalle-legacy)**:依文字描述產生圖片
- **[Stable Diffusion](https://www.librechat.ai/docs/features/image_gen#stable-diffusion-local)** / **[Flux](https://www.librechat.ai/docs/features/image_gen#flux)**:文字生成圖片
- **[Wolfram](https://www.librechat.ai/docs/configuration/tools/wolfram)**:計算與數學能力
- **[OpenWeather](https://www.librechat.ai/docs/configuration/tools/openweather)**:取得天氣資料
- **[Google Search](https://www.librechat.ai/docs/configuration/tools/google_search)**:網頁搜尋
- **[Calculator](https://www.librechat.ai/docs/configuration/tools/calculator)**:數學計算
- **[Tavily Search](https://www.librechat.ai/docs/configuration/tools/tavily)**:整合多種資料來源的進階搜尋 API
- **[Azure AI Search](https://www.librechat.ai/docs/configuration/tools/azure_ai_search)**:從 Azure AI Search 索引取得資訊
- **[Traversaal](https://www.librechat.ai/docs/configuration/tools/traversaal)**:為 LLM Agent 打造的強大搜尋 API

#### 建立有圖片工具的 Agent

1. 把圖片工具的憑證加到 `.env`,例如 OpenAI Image Tools 的 `IMAGE_GEN_OAI_API_KEY`。
2. 重新啟動 LibreChat,讓新的環境變數生效。
3. 從端點選單選 **Agents**。
4. 從側邊面板打開 Agent Builder,建立或編輯 Agent。
5. 打開 Agent 的 **Tools** 清單，選 **OpenAI Image Tools**、**Gemini Image Tools**、**DALL-E-3**、**Stable Diffusion** 或 **Flux**,然後儲存 Agent。
6. 和這個 Agent 開始對話，請它產生或編輯圖片。

完整的圖片設定指南(包括 `IMAGE_GEN_OAI_MODEL` 這類模型變數)，見 [Image Generation & Editing](https://www.librechat.ai/docs/features/image_gen)。

- 工具可以用 [`librechat.yaml`](https://www.librechat.ai/docs/configuration/librechat_yaml) 設定檔停用:
  - [更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#capabilities)

### Actions

有了 Actions 能力，你可以從 [OpenAPI 規格](https://swagger.io/specification/)動態建立工具，加到你的 Agent。

![Agents - Actions 按鈕](https://www.librechat.ai/images/agents/actions.png)

**點上面的按鈕會打開一個表單，可以輸入 OpenAPI 規格的網址並建立 action:**

![Agents - Actions 面板](https://www.librechat.ai/images/agents/actions_panel.png)

- Actions 可以用 [`librechat.yaml`](https://www.librechat.ai/docs/configuration/librechat_yaml) 設定檔停用:
  - [更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#capabilities)
- 可以把個別網域加入 Agent actions 的允許清單:
  - [更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/actions#alloweddomains)
- 注意，你可以在 OpenAPI 規格的 operation 層級加上 `'x-strict': true` 旗標。
  使用支援它的 OpenAI 模型時，會自動以 strict 模式產生函式呼叫。
  - Strict 模式只支援 JSON 的一部分子集。詳見 https://platform.openai.com/docs/guides/structured-outputs 。

### 進階設定(Advanced Settings)

Agent 在「能力」之外的進階設定(在 Agent 表單的 Advanced 檢視中)。

#### 最大 Agent 步驟數(Max Agent Steps)

這個設定讓你限制 Agent 在一次「執行」中可以走幾步。「執行」指的是給出最終回應之前的 Agent 迴圈。

沒有設定時預設是 25 步，你可以依需要調整。管理員也可以在 [`librechat.yaml`](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#recursionlimit) 設定全域的預設值與全域的最大值。

一輪對話用完全部的步驟預算時,LibreChat 會保留已產生的部分回應與工具呼叫，而不是用錯誤取代。訊息會提供 **Keep going**(開始新的一輪，工具預算重新計算)與 **Answer now**(請 Agent 用已完成的工作直接回答，不再使用工具)。關閉這個提示只影響目前的瀏覽器畫面。

管理員也可以用 [Agent 串流斷路器](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents#stream-circuit-breakers),限制串流中的工具呼叫參數與模型差量事件。

「一步」指的是一次 AI API 請求，或一輪工具使用(一個或多個工具，取決於 LLM 在單一請求中提供了多少個工具呼叫)。

單一、不使用工具的回應是 1 步。一輪工具使用通常是 3 步:

1. API 請求 → 2. 使用工具(一個或多個)→ 3. 後續的 API 請求

## 檔案管理(File Management)

### 在 Agent Builder 中

設定 Agent 時，可以附加不同類別的檔案:

1. **Image Upload(圖片上傳)**:讓 Agent 參考的視覺內容
2. **File Search Upload(檔案搜尋上傳)**:用於 RAG 能力的文件
3. **Code Interpreter Upload(程式碼直譯器上傳)**:給程式碼處理的檔案
4. **File Context(檔案上下文)**:擷取出文字、用來補充 Agent 指示的文件

**File Context** 使用 `context` 能力，運作方式和[「以文字上傳」](upload_as_text.md)完全相同：預設使用文字解析，設定 OCR 後會更強。文字在上傳時擷取，存在 Agent 的指示中。很適合讓 Agent 從文件、PDF、程式碼檔或含文字的圖片取得持久的知識。

**處理優先順序:** OCR > STT > 文字解析(和「以文字上傳」相同)

**注意:** 擷取出的文字會成為 Agent 系統指示的一部分。

## 選用設定(Optional Configuration)

LibreChat 讓管理員透過 [`librechat.yaml`](https://www.librechat.ai/docs/configuration/librechat_yaml) 設定 Agent 的使用:

- 對所有使用者(包括管理員)停用 Agents:[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface)
- 自訂 Agent 的能力:[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents)

## 最佳做法(Best Practices)

- 為 Agent 提供清楚、具體的指示
- 仔細考慮你的用途需要哪些工具
- 把檔案適當地分配到四種上傳類別
- 分享 Agent 之前先檢查權限設定
- 部署給其他使用者之前，徹底測試你的 Agent

## 重點回顧(Recap)

1. 從端點下拉選單選「Agents」
2. 打開 Agent Builder 面板
3. 填寫必要的 Agent 資料
4. 設定需要的能力(Code Interpreter、File Search、File Context 等)
5. 加入需要的工具與檔案
6. 視需要設定分享權限
7. 建立並開始使用你的 Agent

和 Agent 聊天時，你可以:

- 用「Upload as Text」把整份文件內容加進對話(預設使用文字解析，設定 OCR 後更強)
- 用「Upload for File Search」對文件做語意搜尋(需要 RAG API)
- 把檔案加到 Agent 的「File Context」,把檔案的完整內容納入 Agent 的系統指示

## References

- [Agents(官方文件)](https://www.librechat.ai/docs/features/agents)
