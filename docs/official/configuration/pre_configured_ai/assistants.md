# Assistants

> **OpenAI 已關閉 Assistants API**
>
> OpenAI 在 2025 年 8 月 26 日淘汰 Assistants API,並在 2026 年 8 月 26 日移除(見 [OpenAI 的淘汰頁面](https://developers.openai.com/api/docs/deprecations))。`assistants` 端點送往 OpenAI 的請求已經無法成功。請改用 [Agents](../../features/agents.md):它們能搭配 OpenAI 的模型，提供相同的能力(程式碼執行、檔案搜尋、actions 與工具),而且不依賴 Assistants API。
>
> 本頁其餘內容保留作為參考。

- [OpenAI 的 Assistants API](https://platform.openai.com/docs/assistants/overview) 有專用的端點。
- Assistants API 讓你建立 AI 助理，提供程式碼直譯器、檔案知識檢索與函式執行等功能。
    - [閱讀這份深入的文件](https://platform.openai.com/docs/assistants/overview),了解這個功能是什麼、怎麼運作、能做什麼。
- 和一般的 [OpenAI API](https://www.librechat.ai/docs/configuration/pre_configured_ai/openai) 一樣，到 **[https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)** 取得金鑰。
- 你需要把下面的環境變數設為你的金鑰，或設為 `user_provided`,讓使用者提供自己的金鑰。

```bash
# .env
ASSISTANTS_API_KEY=your-key
```

- 可以用 `ASSISTANTS_MODELS` 決定要提供哪些模型;沒有設定時，會使用從 OpenAI 取得的模型清單(只顯示與 Assistants API 相容的模型)。

```bash
# .env
ASSISTANTS_MODELS=gpt-3.5-turbo-0125,gpt-3.5-turbo-16k-0613,gpt-3.5-turbo-16k,gpt-3.5-turbo,gpt-4,gpt-4-0314,gpt-4-32k-0314,gpt-4-0613,gpt-3.5-turbo-0613,gpt-3.5-turbo-1106,gpt-4-0125-preview,gpt-4-turbo-preview,gpt-4-1106-preview
```

- 必要時，也可以用 `ASSISTANTS_BASE_URL` 設定另一個基礎網址取代官方的，類似 OpenAI 對應的 `OPENAI_REVERSE_PROXY`

```bash
# .env
ASSISTANTS_BASE_URL=http://your-alt-baseURL:3080/
```

- 依你的需要，還有其他選用的設定(例如停用 assistant 建構器介面),可以透過 `librechat.yaml` [自訂設定檔](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint)設定:
    - 控制 assistants 建構器介面的顯示與使用。[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint#disablebuilder)
    - 指定輪詢間隔(毫秒)，用來檢查執行的更新或 assistant 執行狀態的變化。[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint#pollintervalms)
    - 設定 assistant 執行的逾時時間(毫秒)。限制執行的總時間，有助於管理系統負載。[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint#timeoutms)
    - 指定支援或排除哪些 assistant ID。[更多資訊](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/assistants_endpoint#supportedids)

## Strict 函式呼叫(Strict function calling)

在 LibreChat 中，你可以在 actions 的 OpenAPI 規格的 operation 層級加上 `'x-strict': true` 旗標。
這會自動以 strict 模式產生函式呼叫。
注意 strict 模式只支援 JSON 的一部分子集。詳見 https://platform.openai.com/docs/guides/structured-outputs 。

例如:

```json
{
  "openapi": "3.1.0",
  "info": {
    "title": "Math.js API",
    "description": "API for performing mathematical operations, such as addition, subtraction, etc.",
    "version": "1.0.0"
  },
  "servers": [
    {
      "url": "https://api.mathjs.org/v4"
    }
  ],
  "paths": {
    "/": {
      "post": {
        "summary": "Evaluate a mathematical expression",
        "description": "Sends a mathematical expression in the request body to evaluate.",
"operationId": "math",
"x-strict": true,
"parameters": [
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "expr": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate (e.g., `2+3`)."
                  }
                },
                "required": ["expr"]
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "The result of the evaluated expression.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "result": {
                      "type": "number",
                      "description": "The evaluated result of the expression."
                    }
                  }
                }
              }
            }
          },
          "400": {
            "description": "Invalid expression provided.",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "error": {
                      "type": "string",
                      "description": "Error message describing the invalid expression."
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

> **注意:**
>
> - 撰寫本文時，只有下列模型支援 [Retrieval](https://platform.openai.com/docs/assistants/tools/knowledge-retrieval) 能力:
>     - gpt-3.5-turbo-0125
>     - gpt-4-0125-preview
>     - gpt-4-turbo-preview
>     - gpt-4-1106-preview
>     - gpt-3.5-turbo-1106
> - 尚不支援視覺能力。
> - 如果你先前在 .env 檔設定過 [`ENDPOINTS` 的值](https://www.librechat.ai/docs/configuration/dotenv#endpoints),需要加上 `assistants` 這個值

## References

- [Assistants(官方文件)](https://www.librechat.ai/docs/configuration/pre_configured_ai/assistants)
