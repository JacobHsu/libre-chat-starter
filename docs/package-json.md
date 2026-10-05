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
| `workspaces` | `api`、`client`、`packages/*` | 三塊工作區,詳見[專案架構](official/development/architecture.md) |
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
| 其他 | `@types/react-virtualized`、`brace-expansion`、`caniuse-lite`、`elliptic` |

## overrides

`overrides` 是 npm 的功能,用來強制指定間接相依套件(套件的套件)的版本。

LibreChat 的 `overrides` 共 38 條。從官方提交訊息看,主要用於修補相依套件的安全漏洞,例如:

- `Raise Vulnerable Dependency Floors`(提高有漏洞套件的最低版本)
- `Bump @xmldom/xmldom to 0.8.13 via Root Override`(用根目錄 override 升級 `@xmldom/xmldom`)
- `npm audit fix`、`Bump Packages from LibreChat SCA Audit`

有些條目寫成巢狀形式,例如 `"remark-gfm": { "mdast-util-gfm-autolink-literal": "2.0.0" }`,表示只在該套件底下強制指定版本。

## 根目錄的版本與安裝設定:`.nvmrc`、`.npmrc`

兩個都是只有一行的小檔案,和 `package.json` 一起決定「用什麼環境安裝」。

| 檔案 | 內容 | 誕生 |
|---|---|---|
| `.nvmrc` | `24.16.0` | 2026-06-01,提交 `fb282a2`「Upgrade Docker Builds To Node 24」(#13448) |
| `.npmrc` | `allow-remote=root` | 2026-09-08,提交 `ba12eaa`「Bind Tool Approvals to Generation Scope」(#15724) |

### `.nvmrc`:指定 Node 版本

`nvm`(Node 版本管理工具)讀這個檔案,決定該切到哪個 Node 版本。LibreChat 要求 Node `24.16.0`,和官方 Docker 映像用的版本一致。我們本機是 Node 24.18.0、npm 11.16.0,版本比它新,實測可以安裝、建置與執行(見[本機驗證筆記](local-testing.md))。Windows 沒有 `nvm`,這個檔案在本機不會被用到,但它是官方根目錄的一部分,所以照原樣帶入。

### `.npmrc`:限制網址型相依套件

`.npmrc` 是 npm 的設定檔(rc 是 run commands,Unix 慣例,表示「啟動時讀取的設定」)。每次執行 `npm install`、`npm ci`、`npm run` 時,npm 會先讀它,依裡面的設定調整行為。格式是每行一個 `名稱=值`。常見用途:改套件庫網址(`registry`)、放登入金鑰、鎖定安裝版本(`save-exact`)。

npm 依序讀四個位置,後面的蓋掉前面的:

1. 專案根目錄的 `.npmrc`:只影響這個專案,可進 git。
2. 使用者資料夾的 `~/.npmrc`:只影響這個使用者,常放登入金鑰,**不該進 git**。
3. 全域設定。
4. npm 內建預設。

官方把 `.npmrc` 放在專案根目錄,是要讓所有人在這個專案裡執行 npm 都套用同一個規則,不受各自電腦設定影響。

這個專案的 `.npmrc` 只有一行,設定的是 `allow-remote`。它是 npm 的設定,限制 npm 是否可以安裝「用網址指向壓縮檔」的相依套件,而不是從 npm registry 用版本號安裝。可選值:

| 值 | 意義 |
|---|---|
| `all`(預設) | 任何網址都可以 |
| `none` | 一律禁止 |
| `root` | 只允許寫在**專案自己的 `package.json`** 裡的網址;別的套件間接帶進來的網址相依不會被安裝 |

LibreChat 設成 `root`。`api/package.json` 與 `packages/api/package.json` 都有一個網址型相依:`xlsx`(`https://cdn.sheetjs.com/...tgz`),它是專案自己宣告的,所以可以裝;第三方套件若偷偷帶入別的網址相依,就會被擋下。

## 建置排程:`turbo.json`

Turborepo 是 monorepo 的建置排程工具:知道哪個套件要先建、輸入沒變就直接用快取。根 `package.json` 只有兩個指令用到它:`build` 與 `build:safe`(`npx turbo run build`)。誕生於 2026-02-13,提交 `e50f590`「Smart Reinstall with Turborepo Caching」(#11785)。

| 設定 | 內容 | 意思 |
|---|---|---|
| `globalDependencies` | `package-lock.json` | 這個檔案變了,所有任務的快取都失效。**我們精簡階段沒有 `package-lock.json`**,這條目前沒有作用 |
| `tasks.build.dependsOn` | `["^build"]` | 先建「它所依賴的套件」,再建自己。`^` 表示依賴的套件 |
| `tasks.build.inputs` | `src/**`、設定檔(`tsdown.config.mjs`、`tsconfig*.json`、`vite.config.ts`、`package.json` 等),排除 `__tests__`、`__mocks__`、`*.test.*`、`*.spec.*` | 決定「有沒有變」的檔案。輸入沒變,就取回快取的輸出而不重新建置;改測試檔不會讓建置失效 |
| `tasks.build.outputs` | `["dist/**"]` | 建置完要快取的輸出 |
| `@librechat/data-schemas#build` | 依賴 `^build`、`librechat-data-provider#build` | `套件#任務` 的寫法,指定某個套件的任務要等哪些任務 |
| `@librechat/api#build` | 依賴 `^build`、`data-provider`、`data-schemas` | 同上 |
| `@librechat/client#build` | 依賴 `^build`、`data-provider` | 同上,**不依賴 `api`** |

這三條 `套件#build` 就是[建置順序](build-order.md)文件講的「data-provider → data-schemas → api → client」的機器可讀版本。`data-provider` 沒有自己的條目,因為它不依賴任何工作區。

目前專案只有 `data-provider` 一層,現在執行 `npx turbo run build` 只會建它;其他層帶入後才會依順序建置。

## References

- [turbo.json(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/turbo.json)
- [Turborepo 設定參考:turbo.json](https://turborepo.dev/docs/reference/configuration)
- [package.json(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/package.json)
- [.nvmrc(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/.nvmrc)
- [.npmrc(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/.npmrc)
- [npm config:allow-remote](https://docs.npmjs.com/cli/using-npm/config#allow-remote)
- [Project Architecture(官方文件翻譯)](official/development/architecture.md)
