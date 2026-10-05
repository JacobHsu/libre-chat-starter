# 官方 repo 根目錄結構

LibreChat 官方 repo 第一層的 19 個資料夾與 30 個檔案,依用途分組。標示「未查看內容」或「官方未說明」的項目,是我們還沒讀過或查不到說明的部分。

## 核心程式碼

| 項目 | 說明 |
|---|---|
| `api/` | 後端,舊有的 Express 包裝層(詳見[專案架構](official/development/architecture.md)) |
| `client/` | 前端,React 單頁應用程式 |
| `packages/` | 共用套件,共 4 個:`api`、`client`、`data-provider`、`data-schemas` |
| `package.json` | 根專案設定(詳見[根目錄 package.json](package-json.md)) |
| `package-lock.json`、`bun.lock` | 鎖定相依套件版本,npm 與 bun 各一份 |
| `turbo.json` | Turborepo 設定,負責平行建置與快取 |

## 設定範本

| 項目 | 說明 |
|---|---|
| `.env.example` | 環境變數範本,複製成 `.env` 後使用 |
| `librechat.example.yaml` | LibreChat 設定檔範本,複製成 `librechat.yaml` 後使用 |

## Docker 與部署

| 項目 | 說明 |
|---|---|
| `docker-compose.yml` | 以 Docker 啟動整套服務 |
| `docker-compose.override.yml.example` | `docker-compose.yml` 的覆寫範本 |
| `deploy-compose.yml` | 部署用的 compose,對應 `npm run start:deployed` |
| `docker-compose.langfuse-fanout.yml`、`deploy-compose.langfuse-fanout.yml` | Langfuse 可觀測性的 compose 變體(未查看內容) |
| `Dockerfile`、`Dockerfile.multi` | 建置映像檔(未查看內容) |
| `.dockerignore` | 建置映像檔時要忽略的檔案 |
| `rag.yml` | RAG 服務的 compose,使用 pgvector(PostgreSQL 向量資料庫) |
| `helm/` | Kubernetes 的 Helm chart,內有 `librechat` 與 `librechat-rag-api` |
| `search/` | Meilisearch 搜尋服務的 compose 與初始化檔 |
| `redis-config/` | Redis 單機、叢集、TLS 的設定與啟動腳本 |
| `otel/` | `langfuse-fanout/`,可觀測性設定 |
| `utils/` | `docker/`(建置、推送映像與測試用 compose 的腳本)與 `update_env.py` |

## 開發工具

| 項目 | 說明 |
|---|---|
| `config/` | 37 項維運腳本,由 `npm run` 指令呼叫,例如 `create-user.js`、`add-balance.js`、`flush-cache.js` |
| `scripts/` | 6 項:`redis-mode.sh`、`sort-imports.mts`、`static-checks.mts`、翻譯(locize)檔案處理腳本、`activity-labels/` |
| `e2e/` | 37 項,Playwright 端對端測試與效能基準測試 |
| `src/` | 只有 `tests/` 一個資料夾(官方未說明為何放在根目錄) |
| `.husky/` | git 提交前檢查:`pre-commit` 與 `lint-staged.config.js` |
| `.github/` | GitHub 自動化流程(例如 `workflows/backend-review.yml`) |
| `.vscode/`、`.devcontainer/` | 編輯器與開發容器設定(未查看內容) |
| `eslint.config.mjs`、`.prettierrc`、`.prettierignore` | 程式碼檢查與格式設定 |
| `.nvmrc` | 指定 Node 版本:`24.16.0` |
| `.npmrc` | npm 設定,內容為 `allow-remote=root`(官方未說明用途) |
| `.gitignore`、`.gitattributes` | git 設定(`.gitattributes` 未查看內容) |

## 文件與 AI 助理用檔案

| 項目 | 說明 |
|---|---|
| `README.md`、`README.zh.md` | 專案說明,英文與簡體中文 |
| `LICENSE` | 授權條款 |
| `UPGRADING.md` | 升級說明,例如 Redis 串流預設行為的變更 |
| `docs/` | 官方 repo 內的專題文件(`permissions/`、`run_files.md`、`skills-management-api.md`),不是官網文件 |
| `AGENTS.md` | 貢獻者與 AI 助理的指引:分支、PR 規則,以及後端程式碼放在 `packages/api` |
| `CONTEXT.md` | 專案內部名詞詞彙表(Domain language) |
| `tool-intent-spec.md` | 功能規格提案(狀態為 proposal),不是使用者文件 |
| `skill/` | 放共用的部署用 Skills,每個 skill 一個資料夾加 `SKILL.md` |
| `.claude/` | 內有 `skills/` |
| `.codex` | 符號連結(symlink),連結目標未確認 |

## References

- [LibreChat 官方 repo](https://github.com/LibreChat-AI/LibreChat)
- [AGENTS.md](https://github.com/LibreChat-AI/LibreChat/blob/main/AGENTS.md)
- [UPGRADING.md](https://github.com/LibreChat-AI/LibreChat/blob/main/UPGRADING.md)
- [Project Architecture(官方文件)](https://www.librechat.ai/docs/development/architecture)
