# 使用者記憶(User Memory)

結構化的使用者記憶，提供手動控制、選用的自動擷取，以及由 Agent 管理的分區。

## 概觀(Overview)

LibreChat 的使用者記憶是一個**鍵值儲存**,跨對話保存使用者特定的資訊。使用者可以直接管理項目，選用的記憶 Agent 可以從聊天中擷取更新，而 Agents 在被明確要求記住或忘記某件事時，可以使用記憶工具。

> **說明:是鍵值儲存，不是對話記憶**
>
> 這**不是**涵蓋你整個對話歷史的語意記憶。它不會索引、嵌入或搜尋過去的對話。它維護的是一組結構化的鍵值對(例如 `user_preferences`、`learned_facts`),在每次請求時當作上下文注入。可以把它想成 AI 在每次回覆前都會先讀的一本常駐筆記本。
>
> 單一對話內先前訊息的上下文,LibreChat 已經使用標準的訊息歷史視窗，那和這個功能是分開的。

> **重要:⚠️ 需要設定**
>
> 記憶功能必須在 `librechat.yaml` 中明確設定才會運作。預設不啟用。

## 主要功能(Key Features)

- **選用的自動擷取**:設定 `memory.agent.enabled: true`,讓設定好的記憶 Agent 隨聊天請求執行
- **鍵值儲存**:資訊以結構化的鍵值對儲存，而不是原始的對話紀錄
- **手動項目**:使用者可以直接手動新增、編輯或移除記憶項目，完全掌控 AI 記得什麼
- **使用者控制**:啟用時，使用者可以為自己的聊天開關記憶
- **可自訂的鍵**:用 `validKeys` 限制可以儲存哪些類別的資訊
- **Token 管理**:設定記憶用量的上限以控制成本
- **Agent 工具**:使用者明確要求時,Agents 可以儲存或刪除記憶
- **Agent 分區**:把某個 Agent 的記憶與使用者共用的個人記憶池分開

## 設定(Configuration)

要啟用記憶功能，需要在 `librechat.yaml` 檔案中加入 `memory` 設定:

```yaml
version: 1.3.17
cache: true

memory:
  disabled: false # 設為 true 會完全停用記憶
  personalize: true # 讓使用者能開關記憶，預設為 true
  tokenLimit: 2000 # 記憶儲存的最大 token 數
  maxInputTokens: 12000 # 送給記憶 Agent 的近期聊天最大 token 數
  messageWindowSize: 5 # 要考慮的近期訊息數
  agent:
    enabled: true # 自動擷取需要明確開啟
    provider: 'openAI'
    model: 'gpt-4'
```

`provider` 欄位應符合 [Model Spec 指南](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/model_specs#endpoint)中定義的可接受值。

**注意:** 如果使用自訂端點,endpoint 的值必須與定義的自訂端點名稱完全相同。

詳細的設定選項請見[記憶設定指南](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/memory)。

## 運作方式(How It Works)

> **記憶 Agent 的執行**
>
> 當 `memory.agent.enabled: true` 時，設定好的記憶 Agent 會隨聊天請求執行。它與主要的聊天回覆並行執行:在主要回覆開始之前就啟動，執行時間限制為主要請求的時間，加上請求結束後最多 3 秒。
>
> 也就是說，你送出的每則訊息都會觸發記憶 Agent:
>
> 1. **讀取**目前的鍵值儲存，把相關項目當作上下文注入
> 2. **分析**近期的訊息視窗，找出值得儲存或更新的資訊
> 3. **寫入**任何新增或修改過的項目，存回儲存區

## Agent 記憶(Agent Memory)

Agents 端點包含一個 `memory` 能力。當記憶已設定、使用者有記憶的寫入權限、而且個人化已啟用時，把 **Memory** 加到 Agent 上，會讓它得到 `set_memory` 與 `delete_memory` 工具。Agent 會被指示：只有在使用者明確要求記住、更新或忘記某件事時，才使用這些工具。

Agents 預設使用使用者共用的個人記憶池。在 Agent 建構器的 Memory 設定中，啟用 **Keep memories separate for this agent**,就會依使用者與 Agent 隔離儲存。被隔離的 Agent 看不到既有的個人記憶，也看不到其他被隔離 Agent 的記憶。Agent 範圍的項目會在記憶面板中顯示 Agent 的名稱，並可依分區篩選。

Agent 分區以 Agent 的存取權為依據。讀取、建立或更新一個分區，需要使用者有 Agents 的存取權，且目前對所引用的 Agent 有檢視權限;Agent 管理者保有他們一般較廣的存取權。LibreChat 會拒絕不存在或無法存取的 Agent ID,而不是把它們當成任意的記憶命名空間。刪除仍可以指向 Agent 已被移除的分區，以便清理孤立的記憶。

自動記憶 Agent 與 Agent 內建的記憶工具是彼此獨立的。`memory.agent.enabled: true` 控制自動擷取，而 Agents 端點的 `memory` 能力控制已儲存的 Agents 能否在對話中管理記憶。

### 1. 鍵值儲存

記憶項目以鍵值對儲存。啟用記憶時，系統可以儲存的項目例如:

- 使用者偏好(溝通風格、感興趣的主題)
- 使用者明確分享的重要事實
- 提到的進行中專案或任務
- 你透過 `validKeys` 定義的任何類別

使用者也可以透過介面**手動建立、編輯與刪除**記憶項目，直接掌控 AI 知道哪些關於他們的事。

### 2. 上下文視窗

`messageWindowSize` 參數決定要分析多少則近期訊息來更新記憶。這幫助記憶 Agent 判斷哪些資訊值得在鍵值儲存中儲存或更新。

`maxInputTokens` 參數限制在擷取前送給自動記憶 Agent 的近期聊天文字量。如果選取的訊息視窗仍然太大,LibreChat 會保留最新的上下文，省略較早的聊天內容，再呼叫記憶 Agent。

### 3. 使用者控制

當 `personalize` 設為 `true` 時:

- 使用者會在[輸入框 **+** 選單](https://www.librechat.ai/docs/features/composer#turn-on-tools-skills-and-mcp-servers)的 **Tools** 區段看到 **Memory** 開關
- 可以為個別對話啟用或停用記憶
- 記憶設定會跨工作階段保存

### 4. 有效的鍵

你可以指定 `validKeys` 來限制要儲存哪些類別的資訊:

```yaml
memory:
  validKeys:
    - 'user_preferences'
    - 'conversation_context'
    - 'learned_facts'
    - 'personal_information'
```

## 最佳做法(Best Practices)

### 1. Token 上限

設定適當的 token 上限，在功能與成本之間取得平衡:

- 上限較高，記憶可以更完整
- 上限較低，處理成本較低
- 考量你的使用模式與預算

### 2. 自訂指示

使用 `validKeys` 時，為記憶 Agent 提供自訂指示:

```yaml
memory:
  agent:
    enabled: true
    provider: 'openAI'
    model: 'gpt-4'
    instructions: |
      Store information only in the specified validKeys categories.
      Focus on explicitly stated preferences and important facts.
      Delete outdated or corrected information promptly.
```

### 3. 隱私考量

- 記憶會跨對話儲存使用者資訊
- 確保使用者了解哪些資訊被儲存
- 考慮實施資料保留政策
- 提供清楚的記憶使用說明

## 範例(Examples)

### 基本設定

以預設值啟用記憶:

```yaml
memory:
  tokenLimit: 2000
  maxInputTokens: 12000
  agent:
    enabled: true
    provider: 'openAI'
    model: 'gpt-4.1-mini'
```

### 進階設定

包含所有選項的完整設定:

```yaml
memory:
  disabled: false
  validKeys: ['preferences', 'context', 'facts']
  tokenLimit: 3000
  maxInputTokens: 12000
  personalize: true
  messageWindowSize: 10
  agent:
    enabled: true
    provider: 'anthropic'
    model: 'claude-3-opus-20240229'
    instructions: 'Remember only explicitly stated preferences and key facts.'
    model_parameters:
      temperature: 0.3
```

各供應商有效的模型參數，請見 [Model Spec 預設欄位](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/model_specs#preset-fields)。

### 使用預先定義的 Agent

用 ID 引用既有的 Agent:

```yaml
memory:
  agent:
    enabled: true
    id: 'memory-specialist-001'
```

### 搭配自訂端點的記憶

記憶完整支援自訂端點，包括帶有自訂標頭與環境變數的端點。使用自訂端點時，標頭的佔位符與環境變數會在記憶處理過程中正確解析。

```yaml
endpoints:
    custom:
        - name: 'Custom Memory Endpoint'
           apiKey: 'dummy'
           baseURL: 'https://api.gateway.ai/v1'
           headers:
             x-gateway-api-key: '${GATEWAY_API_KEY}'
             x-gateway-virtual-key: '${GATEWAY_OPENAI_VIRTUAL_KEY}'
             X-User-Identifier: '{{LIBRECHAT_USER_EMAIL}}'
             X-Application-Identifier: 'LibreChat - Test'
             api-key: '${TEST_CUSTOM_API_KEY}'
           models:
             default:
               - 'gpt-4o-mini'
               - 'gpt-4o'
             fetch: false

memory:
  disabled: false
  tokenLimit: 3000
  maxInputTokens: 12000
  personalize: true
  messageWindowSize: 10
  agent:
    enabled: true
    provider: 'Custom Memory Endpoint'
    model: 'gpt-4o-mini'
```

- 支援所有[自訂端點標頭](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/custom_endpoint#headers)

## 疑難排解(Troubleshooting)

### 記憶沒有作用

1. 確認 `librechat.yaml` 中已設定記憶
2. 檢查 `disabled` 設為 `false`
3. 確保設定的 Agent 或模型可用
4. 確認使用者已在聊天介面中啟用記憶
5. 自訂端點：確保 `provider` 名稱與自訂端點的 `name` 完全相同

### Token 用量過高

1. 降低 `tokenLimit` 以控制成本
2. 降低 `maxInputTokens`,限制送給記憶 Agent 的近期聊天量
3. 減少 `messageWindowSize`,分析較少的訊息
4. 用 `validKeys` 限制儲存的內容
5. 檢視並最佳化 Agent 指示

### 記憶不一致

1. 檢查使用者是否在開關記憶
2. 確認沒有超過 token 上限
3. 確保 Agent 設定一致
4. 檢視已儲存的記憶是否有衝突

### 自訂端點的驗證問題

1. 確認 `.env` 檔案中的環境變數設定正確
2. 確保自訂標頭使用正確的語法(環境變數用 `${ENV_VAR}`,使用者佔位符用 `{{LIBRECHAT_USER_*}}`)
3. 先確認自訂端點在一般聊天補全中能正常運作，再用記憶測試
4. 檢查伺服器日誌中來自自訂端點 API 的驗證錯誤

## 未來改進(Future Improvements)

目前的實作會在每次聊天請求時無條件執行記憶 Agent。計畫中的改進包括:

- **寫入的語意觸發**:偵測使用者何時明確要求模型記住某件事(例如「記住我偏好 Python」),只在這些情況下執行記憶寫入 Agent,減少一般訊息上不必要的處理。
- **向量相似度召回**:不再把所有已儲存的記憶項目注入每個請求，而是用向量嵌入只取出與目前對話上下文最相關的項目，同時提升效率與相關性。

## 相關功能(Related Features)

- [Agents](https://www.librechat.ai/docs/features/agents):打造自訂的 AI 助理
- [Presets](https://www.librechat.ai/docs/user_guides/presets):儲存對話設定
- [Fork Messages](https://www.librechat.ai/docs/features/fork):分支對話並保留上下文

## References

- [User Memory(官方文件)](https://www.librechat.ai/docs/features/memory)
