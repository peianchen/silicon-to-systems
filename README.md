# Silicon to Systems

### 半導體、電子與電機工程教材

**Semiconductor, Electronics & Electrical Engineering — a Traditional Chinese study guide**

46 chapters and 3 appendices connecting engineering fundamentals, semiconductor devices and fabrication, circuits, systems, MEMS, and biosensing. Includes worked examples, practice solutions, academic references, and an offline HTML edition. The textbook is written in Traditional Chinese.

繁體中文跨學科教材：46章正文與3個附錄。每章包含先備知識、模型與假設、自設例題、練習及解答，參考資料列在相應位置。面向理工相關科系的大學基礎課程銜接與自學，不宣稱取代完整系所課程。

## 開始閱讀

- **瀏覽完整目錄：**[46 章正文與 3 個附錄](content/README.md)，按數理、元件、製程、品質、電路、專題與感測分組。
- **直接在 GitHub 閱讀：**[從工程學習地圖開始](content/01-engineering-map.md)，或查看[完整教材文字版](dist/book.md)。
- **下載離線 HTML：**[下載 ZIP](dist/engineering-textbook-html.zip?raw=true)，解壓縮後開啟 `index.html`，不需安裝開發工具；包含搜尋、深淺色與分章閱讀。
- **先了解品質與限制：**[檢查紀錄](research/quality-report.md)與[機器驗證結果](research/verification.json)。程式檢查不代表外部專家審查或實體實驗驗證。

## 逐單元圖解擴編

目前完成前兩個單元的深入圖解擴編，HTML圖片可開啟原尺寸，亦包含在離線包中。

- [第01單元：從需求到晶片](content/01-engineering-map.md)：8張原創SVG、3組完整算例、8題附解答練習，另有需求—方案—證據整合任務。依「需求→物件與訊號→製造→算例→學科」保留式重編，見[重編紀錄](research/unit-01-restructure-map.md)。
- [第02單元：工程數學與量綱](content/02-engineering-mathematics.md)：7張原創SVG、A–F六組具名算例、12題附解答練習，另有5/6 ms等待策略決策。從感測器讀值串起單位、微積分、RC、矩陣、取樣與不確定度；原例題、練習及知識點保留，見[擴編紀錄](research/unit-02-editorial.md)與[保留稽核](research/unit-02-expansion-audit.json)。

第三章以後尚未完成同等擴編，會逐單元校訂，不把全書現況誤稱為每章皆已圖解完成。

第一、二章另完成[逐節銜接補強](research/chapter-transitions.md)：補上小節之間的問題承接與回顧，保留原有知識、例題、練習和圖表。

最新[工程實務與教學編修](research/unit-01-02-professional-review.md)加入理工讀者的能力檢核、建模推導、規格與量測表、判讀活動及2張同風格新圖。[保留稽核](research/unit-01-02-professional-audit.json)確認前一版338個區塊、20題正式練習和13張原圖保留。

圖像採統一的扁平工程示意風格：藍色結構、橘色重點、簡潔編號與標註。後續單元沿用[圖像設計規範](research/figure-style-guide.md)，構圖與細節依內容重新設計，不複製既有圖稿。

## 建置與檢查

```sh
npm ci
npm run build
npm run check
```

新正文為 `content/01-*.md` 至 `content/46-*.md`；附錄為90–92。`scripts/build-book.mjs` 只選取這些平面檔案，使用本機 KaTeX 將公式預先排版，沒有外部CDN或分析追蹤。`scripts/check-book.mjs` 驗證章節結構、內部檔案與錨點、公式錯誤、JavaScript語法及教學模型數值，結果寫入 `research/verification.json`。這些檢查不等於同儕審查或真實瀏覽器視覺驗收。

## 產出

- `dist/index.html`：學習地圖與分章入口。
- `dist/all.html`：完整閱讀與列印版。
- `dist/book.md`：合併後的文字與公式原始檔。
- `dist/engineering-textbook-html.zip`：可解壓後直接開啟的離線包。
- `dist/book-manifest.json`：實際章數、字數及公式數。

離線閱讀時請保留 `assets/` 與 `chapters/` 的相對位置，不要只移動一個HTML檔。引用的外部資料仍需連線開啟。瀏覽器列印可另存PDF；本次沒有預先產生或檢查PDF分頁。

## 一起改善教材

歡迎透過 Issues 回報錯誤，附上章節、原文位置、問題說明與可核實的參考資料；也歡迎提交修正的 Pull Request。請勿提交未經授權的課本掃描或付費全文。如果這份教材對你有幫助，歡迎給一顆 Star，讓更多自學者找到它。
