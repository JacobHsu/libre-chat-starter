# 提示詞(Prompts)

把常用的提示詞存起來,之後在對話裡一鍵取用。這份文件說明這個功能怎麼用、前後端怎麼接起來,以及階段 1 補回了哪些檔案。

## 這個功能做什麼

| 能做的事 | 說明 |
|---|---|
| 建立與管理 | 側邊欄的「提示詞」面板:建立、編輯、刪除、依名稱篩選;每則提示詞有名稱、類別、文字、描述與指令 |
| 變數 | 在文字裡寫 `{{topic}}`,系統會自動偵測並列在「變數」區;使用時跳出對話框,請你填入每個變數的值 |
| 特殊變數 | 不用你填、系統自動代入的變數:`{{current_date}}`(日期)、`{{current_datetime}}`(日期時間)、`{{iso_datetime}}`(ISO 格式時間)、`{{current_user}}`(目前使用者) |
| `/` 指令 | 在對話輸入框打 `/`,跳出可搜尋的提示詞清單(依指令或名稱),選一則就把文字帶入輸入框 |
| 自動傳送 | 面板上的「自動傳送提示」開啟時,選好提示詞並填完變數後直接送出 |
| 版本 | 每則提示詞可以有多個版本,有「最新版」與「正式版」兩種標記 |
| 分享 | 可以分享給特定使用者或群組,也可以公開;分享用的是系統共用的權限對話框 |
| 管理員設定 | 管理員可以調整各角色對提示詞的權限(使用、建立、分享、公開分享) |

## 使用步驟

1. 側邊欄點「提示詞」圖示,按 `+` 建立:填名稱與文字,例如 `請用一句繁體中文摘要:{{topic}}`,指令填 `sum`。
2. 回到新對話,輸入框打 `/`,**稍等清單載入**,選「摘要」。
3. 在跳出的對話框填 `topic`,按「送出」。文字帶入輸入框,「自動傳送提示」開啟時直接送出。

清單資料(`/api/prompts/all`)在第一次打 `/` 時才開始載入,連續快速輸入 `/su` 可能看不到清單;先打 `/`、停一下再繼續就會正常。

## 歷史

| 時間 | 事件 |
|---|---|
| 2023-03-06 | 後端的 `Prompt.js` 與 `routes/prompts.js` 出現在 `api/` |
| 2024-06-20 | `feat: Prompts`(#3131):前端的提示詞庫 `components/Prompts/` 與 `routes/categories.js` |
| 2024-06-27 | `feat: Prompt Slash Commands`(#3219):輸入框的 `/` 指令 |
| 2025-03-07 | 資料庫部分搬進 `@librechat/data-schemas`(#6210) |
| 2026-03-22 | `refactor: Prompts UI`(#11570):提示詞介面大改版,`PromptsAccordion` 等元件在這次出現 |

## 前後端怎麼接

```
側邊欄 PromptsAccordion / 輸入框 PromptsCommand
        │  (React Query hooks:client/src/data-provider/prompts.ts)
        ▼
GET  /api/prompts/groups           提示詞群組清單(側邊欄)
GET  /api/prompts/all              全部群組(`/` 指令用)
GET  /api/categories               類別清單
POST /api/prompts                  建立(同時建立群組與第一個版本)
POST /api/prompts/groups/:groupId/prompts   在群組裡新增版本
PATCH /api/prompts/groups/:groupId           更新群組(名稱、指令、描述…)
PATCH /api/prompts/:promptId/tags/production 把某個版本標為正式版
POST /api/prompts/groups/:groupId/use        記錄使用次數
DELETE /api/prompts/:promptId、/groups/:groupId 刪除版本與群組
        ▼
api/server/routes/prompts.js   路由與權限檢查
        ▼
@librechat/api 的 prompts(格式化、驗證、遷移)與 @librechat/data-schemas 的 prompt 方法
        ▼
MongoDB:Prompt、PromptGroup
```

一則提示詞由「**群組**」與「**版本**」組成:群組放名稱、類別、指令、描述;文字放在版本裡。編輯文字時,表單(`PromptForm`)呼叫 `useAddPromptToGroup` 在群組裡新增版本,`useMakePromptProduction` 把某個版本標為正式版。這就是為什麼路由有 `groups/:groupId/prompts`(新增版本)與 `:promptId/tags/production`(標記正式版)。

## 權限

| 層次 | 內容 |
|---|---|
| 功能權限(依角色) | `PROMPTS` 有四項:`USE`(使用)、`CREATE`(建立)、`SHARE`(分享給特定對象)、`SHARE_PUBLIC`(公開分享)。路由用 `checkPromptCreate`、`checkPromptAccess`、`checkGlobalPromptShare` 檢查 |
| 資源權限(依單一提示詞) | 誰能檢視、編輯、刪除某一則提示詞,路由用 `canAccessPromptGroupResource`、`canAccessPromptViaGroup` 檢查 |
| `librechat.yaml` 的 `interface.prompts` | 啟動時為內建的 `USER` 角色寫入 `PROMPTS` 權限。設成 `false` 就沒有人能使用;設成 `true` 只更新 `use`;設成物件可分別設 `use`、`create`、`share`、`public` |

## 這個階段補回的檔案

共 57 個:前端 55、後端 2。

### 前端

| 位置 | 檔案數 | 內容 |
|---|---|---|
| `components/Prompts/buttons/` | 5 | `AdminSettings`(角色權限)、`AlwaysMakeProd`(自動設為正式版)、`AutoSendPrompt`(自動傳送)、`CreatePromptButton`、`index.ts` |
| `components/Prompts/dialogs/` | 6 | `CreatePromptDialog`、`DeletePrompt`、`PreviewPrompt`、`SharePrompt`、`VariableDialog`(填變數)、`index.ts` |
| `components/Prompts/display/` | 7 | `PromptActions`、`PromptDetailHeader`、`PromptDetails`、`PromptTextCard`、`PromptVariables`、`PromptVersions`(版本)、`index.ts` |
| `components/Prompts/editor/` | 4 | `PromptEditor`、`Markdown`、`VariablesDropdown`(特殊變數選單)、`index.ts` |
| `components/Prompts/fields/` | 5 | `CategorySelector`、`Command`、`Description`、`PromptName`、`index.ts` |
| `components/Prompts/forms/` | 5 | `CreatePromptForm`、`PromptForm`、`PromptLabelsForm`、`VariableForm`、`index.ts` |
| `components/Prompts/layouts/` | 2 | `InlinePromptsView`(`/prompts/:promptId` 的頁面)、`index.ts` |
| `components/Prompts/lists/` | 6 | `ChatGroupItem`、`List`、`ListCard`、`NoPromptGroup`、`PromptGroupSkeleton`、`index.ts` |
| `components/Prompts/sidebar/` | 4 | `PromptsAccordion`(側邊欄面板)、`FilterPrompts`、`GroupSidePanel`、`index.ts` |
| `components/Prompts/utils/` | 4 | `CategoryIcon`、`SkeletonForm`、`specialVariables`(特殊變數圖示)、`index.ts` |
| `components/Prompts/index.ts` | 1 | 匯出 |
| `hooks/Prompts/` | 3 | `useCategories`、`usePromptGroupsNav`、`index.ts` |
| `Providers/PromptGroupsContext.tsx` | 1 | 把提示詞群組資料提供給整個應用 |
| `components/Chat/Input/PromptsCommand.tsx` | 1 | 輸入框的 `/` 指令 |
| `components/Sharing/index.ts` | 1 | 匯出分享用的對話框(提示詞的分享對話框 `SharePrompt` 用到 `GenericGrantAccessDialog`) |

### 後端

| 檔案 | 內容 |
|---|---|
| `api/server/routes/prompts.js` | 提示詞的所有路由(592 行) |
| `api/server/routes/categories.js` | 類別清單(15 行) |

資料庫模型、`@librechat/api` 的 `prompts/`、`data-provider` 的端點與 `data-provider/prompts.ts` 的 hooks 早就在專案內,所以這個階段的後端只補兩個路由檔。

## 要換回官方版的精簡內容

| 檔案 | 補回的部分 |
|---|---|
| 前端 `hooks/index.ts`、`Providers/index.ts`、`routes/Root.tsx`、`components/Chat/Input/ChatForm.tsx` | 整個檔案換回官方版(被刪的只有提示詞相關的幾行) |
| 前端 `hooks/Nav/useSideNavLinks.ts` | `PromptsAccordion` 的 `import` 與 `links.push` 區塊 |
| 前端 `routes/index.tsx` | `loadInlinePromptsView` 與 `prompts/:promptId` 路由項目 |
| 後端 `routes/index.js` | `categories`、`prompts` 的 `require` 與匯出(4 行) |
| 後端 `server/index.js` | `app.use('/api/prompts', routes.prompts)`、`app.use('/api/categories', routes.categories)` |
| `librechat.yaml` | 拿掉 `interface.prompts: false` |

這些檔案的其他功能(Skills、Agents、MCP…)仍然保持精簡,留給各自的階段。

## 驗證

在暫存區用獨立的埠與資料庫驗證:

| 項目 | 結果 |
|---|---|
| 原本的 API 驗收 11 項 | 全部通過 |
| 提示詞 API | 類別清單、群組清單、建立、再列出、刪除,5 項全過 |
| 側邊欄 | 多了「提示詞」圖示,面板有篩選、`+`、「自動傳送提示」、空狀態、管理員設定 |
| 建立提示詞 | 輸入 `{{topic}}` 自動偵測出變數 |
| 提示詞頁面 | 建立後跳到 `/prompts/<id>`,顯示內容、變數、指令、分享與刪除 |
| `/` 指令 | 清單出現、選取後跳出變數對話框、填值後文字正確帶入並送出 |

## References

- [composer(官方文件)](https://www.librechat.ai/docs/features/composer):輸入框快速鍵,`/` 插入已儲存的提示詞
- [interface 物件(官方文件)](https://www.librechat.ai/docs/configuration/librechat_yaml/object_structure/interface):`prompts` 一節
- [Access Control(官方文件)](https://www.librechat.ai/docs/features/access_control):`PROMPTS` 權限
- [前端精簡清單](../client/mvp-trim.md)、[後端精簡清單](../api/mvp-trim.md):提示詞相關的精簡內容
- [路線圖](../roadmap.md):階段 1
- [client/src/components/Prompts(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/client/src/components/Prompts)
- [api/server/routes/prompts.js(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/blob/v0.8.8-rc4/api/server/routes/prompts.js)
