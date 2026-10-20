# Agents API(測試版)

透過程式化的 API 執行 LibreChat 的 Agents,並傳遞經過驗證的事件。

> **測試版功能**
>
> Agents API 目前是測試版。在邁向穩定版的過程中，端點、請求與回應的格式，以及行為都可能改變。

LibreChat 透過推論與事件傳遞 API,把 Agents 提供給外部的應用程式、腳本與服務使用。

## 概觀(Overview)

Agents API 提供兩種推論介面、經過驗證的事件傳遞，以及測試版的管理路由:

- **與 OpenAI 相容的 Chat Completions**:`POST /api/agents/v1/chat/completions`
- **Open Responses API**:`POST /api/agents/v1/responses`
- **Agent 事件**:`POST /api/agents/v1/events`
- **Agent 管理**:`/api/agents/v1/agents`
- **Skill 管理**:`/api/agents/v1/skills`

推論介面支援 API 金鑰驗證、選用的 OIDC 驗證，以及串流回應。Agent 事件使用 Remote Agents 的 API 金鑰驗證，讓 LibreChat 能把每次傳遞綁定到一個穩定的來源身分。管理路由則改用部署層級的允許清單，把一個 OIDC 機器用戶端綁定到一個既有的 LibreChat 使用者與租戶。

LibreChat 正在採用 [Open Responses](https://www.openresponses.org/) 作為提供 Agents 服務的主要 API 框架。Chat Completions 端點提供與既有 OpenAI 相容工具的向後相容，而 Open Responses 端點代表未來的方向。

## 啟用 Agents API

Agents API 由 `remoteAgents` 介面設定控制。所有權限預設都是 `false`。

```yaml
# librechat.yaml
interface:
  remoteAgents:
    use: true
    create: true
```

所有可用的選項，見 [Interface Configuration — remoteAgents](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#remoteagents)。

**注意:** 管理員使用者預設啟用所有遠端 Agent 權限。

### OpenAPI 規格與互動式文件

LibreChat 可以在 `/api/openapi.json` 提供公開的 Agents API 規格，並在 `/api/docs` 提供互動式的 Swagger UI 文件。這兩條路由預設都是停用的。用最上層的 `openapi` 設定啟用它們:

```yaml
# librechat.yaml
openapi:
  enabled: true
```

規格涵蓋本頁說明的公開推論、事件、Agent 管理與 Skill 管理路由。除非你的部署打算公開 API 文件，否則請保持這些路由停用。

## API 金鑰管理(API Key Management)

啟用 `remoteAgents.use` 與 `remoteAgents.create` 後，使用者可以在 LibreChat 介面產生 API 金鑰。這些金鑰用來驗證對 Agents API 的請求。

## 驗證(Authentication)

Agents API 支援兩種驗證方式，可以分開使用，也可以一起使用。

### API 金鑰

API 金鑰驗證預設啟用。啟用 `remoteAgents.use` 與 `remoteAgents.create` 後，從 LibreChat 介面產生 API 金鑰。

```bash
Authorization: Bearer <YOUR_API_KEY>
```

## 端點(Endpoints)

### Chat Completions(與 OpenAI 相容)

```
POST /api/agents/v1/chat/completions
```

把任何與 OpenAI 相容的 SDK 指向你的 LibreChat 實例即可使用。`model` 參數對應的是 Agent 的 ID。

**curl 範例:**

```bash
curl -X POST https://your-librechat-instance/api/agents/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agent_abc123",
    "messages": [
      {"role": "user", "content": "Hello, what can you help me with?"}
    ],
    "stream": true
  }'
```

**OpenAI SDK(Python)範例:**

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://your-librechat-instance/api/agents/v1",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="agent_abc123",
    messages=[{"role": "user", "content": "Hello!"}],
    stream=True
)

for chunk in response:
    print(chunk.choices[0].delta.content, end="")
```

### 列出模型(List Models)

```
GET /api/agents/v1/models
```

把可用的 Agents 當成模型回傳。適合用來找出你的 API 金鑰可以存取哪些 Agents。

## 相關文件

- [Agents](agents.md):建立與設定 Agents
- [Subagents](https://www.librechat.ai/docs/features/subagents):設定直接的子 Agent
- [Agents Endpoint Configuration](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/agents):事件執行環境與驗證設定
- [Interface Configuration — remoteAgents](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface#remoteagents):存取控制設定
- [Token Usage](https://www.librechat.ai/docs/configuration/token_usage):設定 token 花費與餘額
- [Open Responses Specification](https://www.openresponses.org/):開放的推論標準

## References

- [Agents API(官方文件)](https://www.librechat.ai/docs/features/agents_api)
