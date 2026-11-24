# 記憶設定(Memory Configuration)

## 概觀(Overview)

`memory` 物件用來設定應用程式的對話記憶與個人化功能。這份設定控制系統如何記住對話並加以個人化，包括 token 上限、訊息上下文視窗，以及以 Agent 為基礎的記憶處理。

## 範例(Example)

```yaml
memory:
  disabled: false
  validKeys: ['user_preferences', 'conversation_context', 'personal_info']
  tokenLimit: 2000
  charLimit: 10000
  maxInputTokens: 12000
  personalize: true
  messageWindowSize: 5
  agent:
    enabled: true
    provider: 'openAI'
    model: 'gpt-4'
    instructions: 'You are a helpful assistant that remembers user preferences and context.'
    model_parameters:
      temperature: 0.7
      max_tokens: 1000
```

## disabled

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `disabled` | Boolean | 設為 true 時停用記憶功能。停用時，系統不會儲存或使用對話記憶。 | `disabled: false` |

**預設值:** `false`

```yaml
memory:
  disabled: true
```

## validKeys

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `validKeys` | 字串陣列 | 指定哪些鍵可以用於記憶儲存。這有助於控制哪些類型的資訊可以存進記憶。 | `validKeys: ["user_name", "preferences", "context"]` |

**預設值:** 不限制(所有鍵都有效)

```yaml
memory:
  validKeys:
    - 'user_preferences'
    - 'conversation_context'
    - 'personal_information'
    - 'learned_facts'
```

## tokenLimit

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `tokenLimit` | Number | 設定記憶儲存與處理可使用的最大 token 數。 | `tokenLimit: 2000` |

**預設值:** 不限制

```yaml
memory:
  tokenLimit: 2000
```

## charLimit

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `charLimit` | Number | 設定單一記憶項目允許的最大字元數。避免過大的記憶內容影響效能或超過 API 上限。 | `charLimit: 10000` |

**預設值:** `10000`

```yaml
memory:
  charLimit: 10000
```

## maxInputTokens

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `maxInputTokens` | Number | 設定在擷取記憶前，送給自動記憶 Agent 的近期聊天最大 token 數。過長的輸入會從開頭截斷，保留最新的上下文。 | `maxInputTokens: 12000` |

**預設值:** `12000`

```yaml
memory:
  maxInputTokens: 12000
```

## personalize

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `personalize` | Boolean | 設為 true 時，讓使用者可以選擇加入或退出記憶功能。使用者可以在聊天介面中開關記憶。設為 false 時，記憶功能完全停用。 | `personalize: true` |

**預設值:** `true`

```yaml
memory:
  personalize: false
```

## messageWindowSize

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `messageWindowSize` | Number | 指定要納入記憶上下文視窗的近期訊息數。 | `messageWindowSize: 5` |

**預設值:** `5`

```yaml
memory:
  messageWindowSize: 10
```

## agent

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `agent` | Object \| Union | 設定選用的自動記憶 Agent。可以是用 ID 引用既有的 Agent,也可以是完整的 Agent 設定。 | `agent: { enabled: true, provider: "openAI", model: "gpt-4" }` |

自動擷取需要明確開啟。在下面任一種設定格式中設定 `agent.enabled: true`。省略 `enabled` 或設為 `false` 時，手動記憶與 Agent 記憶工具仍可使用，只是不會在聊天請求時執行自動記憶 Agent。

### enabled

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `enabled` | Boolean | 用設定好的記憶 Agent 啟用自動記憶擷取。 | `enabled: true` |

**預設值:** `false`

`agent` 欄位支援兩種不同的設定格式:

### 用 ID 指定 Agent(Agent by ID)

已有預先設定好的 Agent 時，可以用它的 ID 引用:

```yaml
memory:
  agent:
    enabled: true
    id: 'memory-agent-001'
```

### 自訂 Agent 設定(Custom Agent Configuration)

需要更多控制時，可以定義完整的 Agent 設定:

```yaml
memory:
  agent:
    enabled: true
    provider: 'openAI'
    model: 'gpt-4'
    instructions: 'You are a memory assistant that helps maintain conversation context and user preferences.'
    model_parameters:
      temperature: 0.3
      max_tokens: 1500
      top_p: 0.9
```

#### Agent 設定欄位

使用自訂 Agent 設定時，可用的欄位如下:

**provider**(必填)

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `provider` | String | 指定記憶 Agent 的 AI 供應商。可以是內建供應商(例如 `"openAI"`、`"anthropic"`、`"google"`)或自訂端點的名稱。 | `provider: "openAI"` |

**model**(必填)

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `model` | String | 指定記憶處理使用的模型。 | `model: "gpt-4"` |

**instructions**(選填)

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `instructions` | String | 自訂指示，取代「何時設定或刪除記憶」的預設指示。主要在使用需要特定資訊處理方式的 `validKeys` 時使用。 | `instructions: "Only store user preferences and facts when explicitly mentioned."` |

**model_parameters**(選填)

| 鍵 | 型別 | 說明 | 範例 |
| --- | --- | --- | --- |
| `model_parameters` | Object | 傳給模型、用來微調行為的額外參數。值必須是字串、數字或布林值。 | `model_parameters: { temperature: 0.7 }` |

## 完整設定範例(Complete Configuration Example)

以下是展示所有記憶設定選項的完整範例:

```yaml
version: 1.3.17
cache: true

memory:
  disabled: false
  validKeys:
    - 'user_preferences'
    - 'conversation_context'
    - 'learned_facts'
    - 'personal_information'
  tokenLimit: 3000
  charLimit: 10000
  maxInputTokens: 12000
  personalize: true
  messageWindowSize: 8
  agent:
    enabled: true
    provider: 'openAI'
    model: 'gpt-4'
    instructions: |
      Store memory using only the specified validKeys. For user_preferences: save 
      explicitly stated preferences about communication style, topics of interest, 
      or workflow preferences. For conversation_context: save important facts or 
      ongoing projects mentioned. For learned_facts: save objective information 
      about the user. For personal_information: save only what the user explicitly 
      shares about themselves. Delete outdated or incorrect information promptly.
    model_parameters:
      temperature: 0.2
      max_tokens: 2000
      top_p: 0.8
      frequency_penalty: 0.1
```

## 使用自訂端點(Using Custom Endpoints)

記憶功能支援自訂端點。使用自訂端點時,`provider` 欄位應與自訂端點的 `name` 完全相同。帶有環境變數與使用者佔位符的自訂標頭會正確解析。

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

- 所有可用的佔位符，請見[自訂端點標頭](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/custom_endpoint#headers)

## 注意事項(Notes)

- 記憶功能提升對話的連續性與個人化
- `personalize` 為 true 時，使用者在聊天介面中會有一個開關，用來控制是否使用記憶
- Token 上限有助於控制記憶用量與處理成本
- `maxInputTokens` 限制送給自動記憶 Agent 的聊天上下文，而 `tokenLimit` 控制已儲存記憶的用量
- 有效的鍵可以細緻地控制哪些資訊可以儲存
- 自訂的 `instructions` 會取代預設的記憶處理指示，應搭配 `validKeys` 使用
- 自動記憶擷取需要 `agent.enabled: true`
- Agent 設定可以自訂自動記憶處理的行為
- 停用時，不論其他設定為何，所有記憶功能都會關閉
- 訊息視窗大小影響記憶更新時要考慮多少近期上下文

## References

- [Memory Configuration(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/memory)
