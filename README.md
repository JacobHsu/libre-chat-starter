<p align="center">
  <a href="https://librechat.ai">
    <img src="client/public/assets/logo.svg" height="256">
  </a>
  <h1 align="center">
    <a href="https://librechat.ai">LibreChat</a>
  </h1>
</p>

<p align="center">
  <strong>繁體中文</strong>
</p>

<p align="center">
  <a href="https://docs.librechat.ai">
    <img
      src="https://img.shields.io/badge/DOCS-blue.svg?style=for-the-badge&logo=read-the-docs&logoColor=white&labelColor=000000&logoWidth=20">
  </a>
</p>

<p align="center">
  <a href="https://www.librechat.ai/docs/translation">
    <img
      src="https://img.shields.io/badge/dynamic/json.svg?style=for-the-badge&color=2096F3&label=locize&query=%24.translatedPercentage&url=https://api.locize.app/badgedata/4cb2598b-ed4d-469c-9b04-2ed531a8cb45&suffix=%+translated"
      alt="Translation Progress">
  </a>
</p>

## 🚀 v0.8.8-rc4 最新消息

- **公開的 Agents API 文件:** 提供 OpenAPI 規格與互動式 Swagger UI,涵蓋推論、事件、Agent 管理與 Skill 管理。
- **附加工作區(高度實驗性):** 依對話隔離工作區、載入儲存庫指示,並提供有上限的佇列等待與指令逾時。
- **Trace Viewer:** 以有序步驟檢視模型對話,包含角色、Agent 身分、工具輪次、預覽與成本。
- **Skills:** 可撰寫或匯入 Skill,並在同一次 Agent 執行中呼叫,匯入失敗時可更安全地回復。
- **Agent 活動:** 將系統事件呈現為獨立的回合,並讓即時活動固定在單一穩定的列中。
- **MCP 穩定性:** 每次請求可傳送標頭而不隱藏工具、跨副本協調 OAuth 更新,並在供應商中斷時保留憑證。
- **效能:** 增量串流 Markdown、模型搜尋虛擬化,並減少已完成 Agent 訊息的渲染工作。

閱讀[完整的 v0.8.8-rc4 更新日誌](https://www.librechat.ai/changelog/v0.8.8-rc4)。

# ✨ 功能特色

- 🖥️ **使用者介面與體驗**:靈感來自 ChatGPT,並加強設計與功能

- 🤖 **AI 模型選擇**:
  - Anthropic (Claude)、AWS Bedrock、OpenAI、Azure OpenAI、Google、Vertex AI、OpenAI Responses API(含 Azure)
  - [自訂端點](https://www.librechat.ai/docs/quick_start/custom_endpoints):可將任何相容 OpenAI 的 API 用於 LibreChat,不需代理
  - 相容[本地與遠端 AI 供應商](https://www.librechat.ai/docs/configuration/librechat_yaml/ai_endpoints):
    - Ollama、[AMD Lemonade](https://lemonade-server.ai/)、groq、Cohere、Mistral AI、Apple MLX、koboldcpp、together.ai,
    - OpenRouter、Helicone、Perplexity、ShuttleAI、Deepseek、Qwen 等

- 🔧 **[Code Interpreter API](https://www.librechat.ai/docs/features/code_interpreter)**:
  - 安全的沙盒執行,支援 Python、Node.js (JS/TS)、Go、C/C++、Java、PHP、Rust 與 Fortran
  - 無縫的檔案處理:可直接上傳、處理與下載檔案
  - 無隱私疑慮:完全隔離且安全的執行
  - 開源且可自架:由 [ClickHouse/code-interpreter](https://github.com/ClickHouse/code-interpreter) 驅動

- 🔦 **Agents 與工具整合**:
  - **[LibreChat Agents](https://www.librechat.ai/docs/features/agents)**:
    - 免寫程式的自訂助理:建立專門的 AI 驅動助手
    - Agent 市集:探索並部署社群建立的 Agents
    - 協作分享:與特定使用者和群組分享 Agents
    - 靈活且可擴充:可使用 MCP 伺服器、工具、檔案搜尋、程式碼執行等
    - [Skills](https://www.librechat.ai/docs/features/skills):建立可重複使用的 `SKILL.md` 指令包,用於手動、自動或常駐的 Agent 工作流程
    - [Agent Plugins](https://www.librechat.ai/docs/features/agent_plugins):實驗性地將部署用的 Skills 與 MCP 伺服器打包成啟動時載入的套件
    - [Subagents](https://www.librechat.ai/docs/features/subagents):把聚焦的工作委派給隔離的子 Agent 執行,各自擁有獨立的上下文視窗
    - Agent Management API:透過綁定部署的 OIDC 用戶端,自動化管理 Agent、檔案與 Skill
    - 附加程式碼工作區:讓 Agents 在受管理或個人工作區中檢視、搜尋、編輯並執行指令(高度實驗性)
    - 相容自訂端點、OpenAI、Azure、Anthropic、AWS Bedrock、Google、Vertex AI、Responses API 等
    - 工具支援 [Model Context Protocol (MCP)](https://modelcontextprotocol.io/clients#librechat)

- 🔍 **網頁搜尋**:
  - 搜尋網際網路並擷取相關資訊,強化你的 AI 上下文
  - 結合搜尋供應商、內容擷取器與結果重新排序器,以取得最佳結果
  - **可自訂的 Jina 重新排序**:可為重新排序服務設定自訂 Jina API URL
  - **[了解更多 →](https://www.librechat.ai/docs/features/web_search)**

- 🪄 **以 Code Artifacts 實現生成式介面**:
  - [Code Artifacts](https://youtu.be/GfTj7O4gmd0?si=WJbdnemZpJzBrJo3) 直接在對話中建立 React、HTML 與 Mermaid 內容
  - 可全螢幕開啟預覽,並將 Mermaid 圖表匯出為 SVG 或 PNG

- 🎨 **圖片生成與編輯**
  - 使用 [GPT-Image-1](https://www.librechat.ai/docs/features/image_gen#1--openai-image-tools-recommended) 進行文字生圖與圖生圖
  - 使用 [DALL-E (3/2)](https://www.librechat.ai/docs/features/image_gen#2--dalle-legacy)、[Stable Diffusion](https://www.librechat.ai/docs/features/image_gen#3--stable-diffusion-local)、[Flux](https://www.librechat.ai/docs/features/image_gen#4--flux) 或任何 [MCP 伺服器](https://www.librechat.ai/docs/features/image_gen#5--model-context-protocol-mcp) 進行文字生圖
  - 透過提示詞產生精美視覺,或用一句指令修改既有圖片

- 💾 **預設與上下文管理**:
  - 建立、儲存與分享自訂預設
  - 對話中途可切換 AI 端點與預設
  - 編輯、重新送出與繼續訊息,並支援對話分支
  - 建立提示詞並與特定使用者和群組分享
  - [分岔訊息與對話](https://www.librechat.ai/docs/features/fork),進行進階的上下文控制
  - 可隨時壓縮長對話,同時保留最近的上下文

- 💬 **多模態與檔案互動**:
  - 使用 Claude 3、GPT-4.5、GPT-4o、o1、Llama-Vision 與 Gemini 上傳並分析圖片 📸
  - 使用自訂端點、OpenAI、Azure、Anthropic、AWS Bedrock 與 Google 與檔案對話 🗃️
  - 將訊息複製為格式化的富文字,可貼到文件、電子郵件與協作應用程式

- 🌎 **多語言介面**:
  - English、中文 (简体)、中文 (繁體)、العربية、Deutsch、Español、Français、Italiano
  - Polski、Português (PT)、Português (BR)、Русский、日本語、Svenska、한국어、Tiếng Việt
  - Türkçe、Nederlands、עברית、Català、Čeština、Dansk、Eesti、فارسی
  - Suomi、Magyar、Հայերեն、Bahasa Indonesia、ქართული、Latviešu、ไทย、ئۇيغۇرچە

- 🧠 **推理介面**:
  - 為 DeepSeek-R1 等思維鏈/推理型 AI 模型提供動態推理介面

- 🎨 **可自訂介面**:
  - 可自訂的下拉選單與介面,兼顧進階使用者與新手
  - 淺色、深色、跟隨系統與高對比外觀模式

- 📈 **可觀測性**:
  - 以 OpenTelemetry 匯出追蹤與日誌,並連接 Langfuse 取得 Agent 與模型的洞察

- 🌊 **[可續傳串流](https://www.librechat.ai/docs/features/resumable_streams)**:
  - 不遺失任何回應:連線中斷時,AI 回應會自動重新連線並繼續
  - 多分頁與多裝置同步:在多個分頁開啟同一場對話,或在另一台裝置接續
  - 可用於正式環境:從單一伺服器到搭配 Redis 的水平擴展部署皆可運作

- 🗣️ **語音與音訊**:
  - 以語音轉文字與文字轉語音,免手操作對話
  - 自動傳送並播放音訊
  - 支援 OpenAI、Azure OpenAI 與 Elevenlabs

- 📥 **匯入與匯出對話**:
  - 可匯入來自 LibreChat、ChatGPT、Chatbot UI 的對話
  - 可將對話匯出為截圖、markdown、文字、json

- 🔍 **搜尋與探索**:
  - 搜尋所有訊息與對話

- 👥 **多使用者與安全存取**:
  - 多使用者、安全驗證,支援 OAuth2、LDAP 與電子郵件登入
  - 內建審核與 Token 用量管理工具

- 🎛️ **[管理面板](https://www.librechat.ai/docs/features/admin_panel)**:
  - 以瀏覽器介面管理使用者、群組、角色與設定覆寫
  - 即時編輯設定與各角色/群組權限,不需重新部署
  - 隨 Docker Compose 堆疊一併提供,一個指令即可設定完成

- ⚙️ **設定與部署**:
  - 可設定 Proxy、Reverse Proxy、Docker 等多種部署選項
  - 使用 [S3 搭配 CloudFront](https://www.librechat.ai/docs/configuration/cdn/cloudfront),取得穩定的媒體連結、邊緣派送、簽章 Cookie 與受保護的下載
  - 可完全在本地使用,或部署到雲端

- 📖 **開源與社群**:
  - 完全開源,公開開發
  - 由社群驅動的開發、支援與回饋

[完整功能介紹請見我們的文件](https://docs.librechat.ai/) 📚

## 🪶 與 LibreChat 進行一站式 AI 對話

LibreChat 是一個自架的 AI 聊天平台,將所有主要的 AI 供應商整合在單一、注重隱私的介面中。

除了聊天,LibreChat 還提供 AI Agents、Model Context Protocol (MCP) 支援、Artifacts、Code Interpreter、自訂 actions、對話搜尋,以及可用於企業的多使用者驗證。

開源、持續開發,為重視 AI 基礎設施掌控權的所有人而打造。

## 🌐 資源

**GitHub 儲存庫:**
  - **RAG API:** [github.com/LibreChat-AI/rag-api](https://github.com/LibreChat-AI/rag-api)
  - **網站:** [github.com/LibreChat-AI/librechat.ai](https://github.com/LibreChat-AI/librechat.ai)

**其他:**
  - **網站:** [librechat.ai](https://librechat.ai)
  - **文件:** [librechat.ai/docs](https://librechat.ai/docs)
  - **部落格:** [librechat.ai/blog](https://librechat.ai/blog)

## 📝 更新日誌

造訪 releases 頁面與更新說明,掌握最新更新:
- [Releases](https://github.com/LibreChat-AI/LibreChat/releases)
- [更新日誌](https://www.librechat.ai/changelog)

**⚠️ 更新前請先查閱[更新日誌](https://www.librechat.ai/changelog),了解是否有破壞性變更。**
