# 根目錄 package.json

說明 LibreChat 根目錄 `package.json` 的各個欄位,以及 141 條 `scripts` 的分組。

## 這份檔案是什麼

根目錄的 `package.json` 定義整個 monorepo:有哪些工作區、有哪些指令、用什麼工具開發與測試。

- 根目錄本身**沒有執行期相依套件**(沒有 `dependencies`),只有開發工具(`devDependencies`)。
- 真正的執行期相依套件,寫在各工作區自己的 `package.json`(`api/`、`client/`、`packages/*`)。

## 欄位說明

| 欄位 | 內容 | 說明 |
|---|---|---|
| `name`、`version` | `LibreChat`、`v0.8.8-rc4` | 專案名稱與版本。`rc` 是 release candidate(候選版) |
| `packageManager` | `npm@11.13.0` | 宣告專案使用的套件管理器與版本。官方開發文件要求 npm `v11.16.0` |
| `workspaces` | `api`、`client`、`packages/*` | 三塊工作區,詳見[專案架構](architecture.md) |
| `scripts` | 141 條 | 見下方[scripts 分組](#scripts-分組) |
| `devDependencies` | 31 個 | 見下方[devDependencies 分類](#devdependencies-分類) |
| `overrides` | 38 條 | 見下方[overrides](#overrides) |
| `scarfSettings` | `{ "enabled": false }` | 關閉 Scarf 的相依套件安裝統計。Dockerfile 與 CI 也設了 `SCARF_ANALYTICS=false` |
| `nodemonConfig` | `ignore` 5 個資料夾 | `npm run backend:dev` 使用 nodemon 監看檔案時,忽略 `api/data/`、`data/`、`client/`、`admin/`、`packages/` |
| `repository`、`bugs`、`homepage` | GitHub 與官網連結 | 專案資訊 |
| `description`、`author`、`license` | 空字串、空字串、`ISC` | `npm init` 預設值,官方沒有修改 |

## scripts 分組

141 條指令依用途分組如下。「需要」欄是指要先有哪些資料夾或工具,該組指令才能執行。

| 分組 | 數量 | 需要 | 說明 |
|---|---|---|---|
| 建置(`build*`、`frontend*`) | 11 | `packages/*`、`client/`、`turbo.json` | 建置各工作區。`npm run build` 走 Turborepo,`npm run frontend` 是依序建置的舊做法 |
| 後端啟動(`backend*`) | 9 | `api/` | `backend` 執行 `api/server/index.js`;`backend:dev` 用 nodemon 監看;`redis:single`、`redis:cluster` 版本另需 Redis |
| Redis(`redis:*`) | 3 | `scripts/redis-mode.sh` | 啟動或停止本地 Redis |
| 更新與部署 | 13 | `config/`、`deploy-compose.yml` | `update*`、`reinstall*`、`smart-reinstall`、`upgrade`、`*:deployed` |
| 使用者與資料維運 | 17 | `config/`、MongoDB | 建立使用者、重設密碼、查餘額、清快取、橫幅管理等 |
| 資料遷移(`migrate:*`) | 18 | `config/`、MongoDB | 權限、索引等資料結構遷移,多數有 `:dry-run` 試跑版 |
| 單元測試(`test:*`) | 8 | 各工作區、`config/`、`e2e/` | 分別測試 `client`、`api`、各 `packages/*` |
| e2e 測試(`e2e*`) | 36 | `e2e/`、Playwright | 端對端測試。`e2e:prepare` 會先執行 `npm run frontend` |
| 效能測試(`lighthouse*`) | 3 | `e2e/`、Lighthouse | 前端效能檢查 |
| 程式碼品質 | 7 | ESLint、Prettier 設定、`scripts/` | `lint`、`format`、`sort-imports`、`static-checks` |
| bun 版本(`b:*`) | 15 | bun | 以 bun 取代 node 的對應版本。官方 npm 安裝流程不會用到 |
| 其他 | 1 | `.husky/` | `prepare`:安裝後自動啟用 husky(git 提交前檢查) |

> **注意**
> 根目錄的 `package.json` 內容是官方原檔。指令依賴的資料夾若還沒有,該指令就無法執行,這是正常的。

## devDependencies 分類

| 類別 | 套件 |
|---|---|
| 建置 | `turbo`、`cross-env` |
| 格式與檢查 | `eslint` 與其外掛(`import`、`react`、`react-hooks`、`jsx-a11y`、`i18next`、`jest`、`prettier`、`simple-import-sort` 等)、`@eslint/*`、`typescript-eslint`、`globals`、`prettier`、`prettier-plugin-tailwindcss` |
| 測試 | `jest`、`@playwright/test`、`@axe-core/playwright`、`@antithesishq/bombadil`、`lighthouse` |
| 提交前檢查 | `husky`、`lint-staged` |
| 其他 | `@types/react-virtualized`、`brace-expansion`、`caniuse-lite`、`elliptic`(官方沒有說明放在這裡的原因) |

## overrides

`overrides` 是 npm 的功能,用來強制指定間接相依套件(套件的套件)的版本。

LibreChat 的 `overrides` 共 38 條。從官方提交訊息看,主要用於修補相依套件的安全漏洞,例如:

- `Raise Vulnerable Dependency Floors`(提高有漏洞套件的最低版本)
- `Bump @xmldom/xmldom to 0.8.13 via Root Override`(用根目錄 override 升級 `@xmldom/xmldom`)
- `npm audit fix`、`Bump Packages from LibreChat SCA Audit`

有些條目寫成巢狀形式,例如 `"remark-gfm": { "mdast-util-gfm-autolink-literal": "2.0.0" }`,表示只在該套件底下強制指定版本。
