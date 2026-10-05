# client

`packages/client`:LibreChat 前端共用的 **React UI 元件庫**。按鈕、對話框、下拉選單、表格、提示訊息、圖示、主題系統等通用元件放在這裡,前端應用 `client/` 引用它們來組畫面。

## 它是什麼

| 項目 | 內容 |
|---|---|
| 套件名稱與版本 | `@librechat/client`,0.4.79,描述 "React components for LibreChat" |
| 誕生 | 2025-07-27,提交 `79197454`「Move Shared Components to `@librechat/client`」(#8685)。元件原本分散在 `client/src/components/ui/`(57 個)、`client/src/components/svg/`(圖示,82 個)、`client/src/hooks/` 等位置,這次一次搬出成獨立套件(例如 `ui/Button.tsx` → `packages/client/src/components/Button.tsx`) |
| 入口 | 四個:`.`(`src/index.ts`,輸出 ESM 與 CJS)、`./style.css`(所有元件的 CSS 合併成一個檔案)、`./tailwind-preset`(`tailwind.preset.cjs`,主題用的 Tailwind 設定)、`./package.json` |
| 相依套件 | **沒有** `dependencies`,全部是 peer 相依(約 50 個):React、Radix UI(各種無樣式的對話框、下拉選單等基礎元件)、`@ariakit/react`、`framer-motion`、`jotai`、`i18next`、`lucide-react`、`tailwind-merge` 等,由使用它的 `client/` 提供 |
| 建置 | `npm run build`,用 `tsdown` 輸出 `dist/`:ESM(`.mjs`)與 CJS(`.cjs`)、型別宣告、`style.css`,並把供應商圖示素材複製進 `dist/`。依 `turbo.json`,只需先建好 `data-provider`,**不依賴 `packages/api`** |
| 打包方式 | 只打包自己的程式碼;所有第三方套件都不打包。`process.env.NODE_ENV` 等三個變數在元件庫建置時寫死,其餘留給使用它的 Vite 應用在建置時處理 |
| 路徑別名 | `~/` 指向 `src/` |

## 為什麼 MVP-1 整層保留

- 前端 `client/` 有 655 個檔案從 `@librechat/client` 取用元件,按鈕、對話框、輸入框、提示訊息、圖示這些介面基礎元件都來自這裡,拆不得。
- 全層只有 204 個程式碼檔,規模不大,切割的收益很小。
- 帶進專案的是 270 個檔案(204 個 `src/` 的 TypeScript 檔、29 個語系 JSON、18 個供應商圖示素材、7 個 CSS、2 個主題相關檔案、10 個設定檔)。測試檔(`*.spec.tsx`、`__tests__/`)與測試輔助檔 `src/test/mockMorphIcon.tsx` 共 49 個不帶,最終階段補回。

## 它和 `client/` 的分工

| 位置 | 負責 |
|---|---|
| `packages/client`(這一層) | 通用 UI 元件、圖示、主題、元件庫自己用的少量文字 |
| `client/` | 應用本身:路由、聊天畫面、資料請求(React Query)、狀態管理、完整的多語言文字 |

語系也是同樣的分工:這層的 `translation.json`,英文版只有 34 行(元件庫自己用的字串,例如 `com_ui_cancel`、`com_ui_select_all`),應用完整的翻譯在 `client/src/locales/`,英文版有 2967 行。

## 目錄與檔案

| 資料夾 | 檔案數 | 內容 |
|---|---|---|
| `components/` | 77 | UI 元件:`Button`、`Dialog`、`AlertDialog`、`Dropdown`、`DropdownMenu`、`Select`、`Combobox`、`Tabs`、`Table`、`DataTable`、`Toast`、`Tooltip`、`Input`、`Textarea`、`Checkbox`、`Switch`、`Slider`、`Tag`、`Skeleton`、`Pagination`、`ThemeSelector` 等;`Composer` 與 `SendActions` 是聊天輸入框用的元件;5 個 `.css` 檔隨元件放在一起 |
| `svgs/` | 88 | SVG 圖示元件:各家模型供應商(`AnthropicIcon`、`BedrockIcon`、`AzureMinimalIcon`…)與介面圖示(`ChatIcon`、`CheckMark`、`Clipboard`…) |
| `theme/` | 10 | 動態主題系統:`ThemeProvider.tsx`(727 行)、主題定義(`themes/default.ts`、`dark.ts`、`highContrast.ts`)、`applyTheme` 把主題轉成 CSS 變數;`README.md` 說明如何新增主題 |
| `hooks/` | 10 | 通用 hooks:`useToast`、`useLocalize`(多語言)、`useMediaQuery`、`useOnClickOutside`、`useCombobox`、`useAvatar`、`useDelayedRender`、`useInputModality`;`ThemeContext.old.tsx` 是舊版的主題 context,`hooks/index.ts` 註明現在由 `theme/` 取代 |
| `icons/provider/` | 4 | 供應商圖示登記表:`registry.ts` 把供應商 ID 對應到圖示(SVG 元件或圖片素材),`Icon.tsx`、`Avatar.tsx` 負責顯示。`assets/` 內有 18 個素材,例如 `ollama.png` |
| `utils/` | 6 | `cn`(合併 CSS class)、`theme`、`composer`、`logger`、`cloudfront` |
| `common/` | 4 | 共用的列舉與型別:`enum.ts`、`menus.ts`、`types.ts` |
| `Providers/` | 2 | `ToastContext.tsx`:提示訊息的 context |
| `locales/` | 1 | `i18n.ts`:初始化 `i18next`,載入 29 種語言的 `translation.json`(`ar`、`en`、`zh-Hans`、`zh-Hant`…) |
| `store.ts` | 1 | 用 `jotai` 定義的全域狀態:`chatDirectionAtom`(文字方向)、`fontSizeAtom`(字級)、提示訊息的狀態等 |
| 根目錄 | | `tailwind.preset.cjs`(88 行,把 `--theme-*` CSS 變數接成 Tailwind 的 class,如 `h-theme-control`)、`tailwind.config.js`、`tsdown.config.mjs`,與測試用的 `jest.*`、`babel.config.js` |

## 後端呼叫與前端畫面的關係

這一層**不呼叫後端**,只負責畫面。聊天流程是:

```
packages/client 的元件(輸入框、按鈕、對話框)
        ↑ 被引用
client/ 的聊天畫面 → 用 data-provider 送請求 → api/ 後端
```

選擇 Ollama 模型時看到的 Ollama 圖示(`icons/provider/assets/ollama.png`),就是由這一層的 `registry.ts` 對應出來的(`[ProviderId.ollama]: { art: asset('assets/ollama.png'), label: 'Ollama' }`)。

## 第一個要讀的檔案

想理解「畫面上的元件怎麼組出來」,從這幾個開始:

1. `src/index.ts`:匯出清單,等於元件庫的目錄(元件、hooks、狀態、圖示、主題)。
2. `src/components/Button.tsx`:195 行,用 `class-variance-authority` 定義各種外觀(`variant`、`size`),是最好的元件範例。
3. `src/components/Toast.tsx` 與 `src/Providers/ToastContext.tsx`:提示訊息從元件、context 到 `useToast` 的完整流程。
4. `src/theme/themes/default.ts` 與 `tailwind.preset.cjs`:主題怎麼變成 CSS 變數,再被 Tailwind 使用。
5. `src/icons/provider/registry.ts`:供應商圖示怎麼登記。

## References

- [packages/client(官方 repo,rc4)](https://github.com/LibreChat-AI/LibreChat/tree/v0.8.8-rc4/packages/client)
- [Project Architecture(官方文件翻譯)](../official/development/architecture.md):建置順序與相依方向
- [MVP 設計](../mvp-design.md):這一層為什麼整層保留
- [歷史分群](../history-cohorts.md):這個套件的檔案誕生日
- [data-provider](data-provider.md):這一層唯一依賴的套件
- [Radix UI](https://www.radix-ui.com/primitives):無樣式基礎元件
- [class-variance-authority](https://cva.style/docs):元件外觀變體的寫法
