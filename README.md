# Silicon to Systems

### 從晶片設計、製造到系統的半導體工程教材

**Semiconductor engineering, from chip design to manufacturing and systems — a Traditional Chinese study guide**

46 chapters and 3 appendices, now navigated around the semiconductor lifecycle. Engineering fundamentals support chip design, fabrication, packaging, test, and system integration. The roadmap distinguishes existing material from gaps still to be developed; this is not yet a complete RTL-to-GDS or analog tape-out course. Includes worked examples, solutions, primary references, and an offline HTML edition.

繁體中文教材，面向理工相關科系。主線是半導體產業的「需求／架構 → 晶片設計與驗證 → 製造 → 封裝測試 → 系統」，數理、電路與元件物理作支援。46 章與 3 個附錄保留；導覽完成後，正逐章補強產業交付主線，第一章先補需求分配、設計與驗證，不宣稱完整投片課程已補齊。每章仍包含先備、模型與假設、例題、練習解答及參考資料。

## 開始閱讀

- **公開網站：**[Silicon to Systems](https://semiconductor-manufacturing-guide.fond-creek-8076.chatgpt.site)，先看產業路線，再依問題回查先備。
- **產業學習路線：**[六個環節、現有內容與缺口](content/learning-paths.md)，附所有原章節的保留與新定位對照。
- **依原章號查閱：**[46 章正文與 3 個附錄](content/README.md)，保留原分組與全部連結。
- **直接在 GitHub 閱讀：**[從工程學習地圖開始](content/01-engineering-map.md)，或查看[完整教材文字版](dist/book.md)。
- **下載離線 HTML：**[下載 ZIP](dist/engineering-textbook-html.zip?raw=true)，解壓縮後開啟 `index.html`，不需安裝開發工具；包含搜尋、深淺色與分章閱讀。
- **先了解品質與限制：**[檢查紀錄](research/quality-report.md)與[機器驗證結果](research/verification.json)。程式檢查不代表外部專家審查或實體實驗驗證。

## 逐單元圖解擴編

目前完成前三個單元的深入圖解擴編，HTML圖片可開啟原尺寸，亦包含在離線包中。

- [第01單元：從需求到晶片](content/01-engineering-map.md)：10張原創SVG、原3組完整算例加介面時間案例、12題附解答練習，另有需求—方案—證據整合任務。補足架構分割、類比／數位設計、簽核投片與矽後驗證；原8圖、8題和有效內容保留。見[產業主線編修](research/unit-01-lifecycle-editorial.md)、[來源範圍](research/unit-01-lifecycle-sources.md)與[保留稽核](research/unit-01-lifecycle-audit.json)。
- [第02單元：工程數學與量綱](content/02-engineering-mathematics.md)：7張原創SVG、A–F六組具名算例、12題附解答練習，另有5/6 ms等待策略決策。從感測器讀值串起單位、微積分、RC、矩陣、取樣與不確定度；原例題、練習及知識點保留，見[擴編紀錄](research/unit-02-editorial.md)與[保留稽核](research/unit-02-expansion-audit.json)。

- [第03單元：複數、相量與頻域](content/03-complex-phasors.md)：7張原創SVG、12題附完整解答練習。從RC訊號保留需求，串起相量、阻抗、功率、頻率響應、三方案容差與量測判讀；原算例及兩題完整保留，見[編修紀錄](research/unit-03-editorial.md)、[來源查證](research/unit-03-sources.md)與[保留／圖形座標稽核](research/unit-03-expansion-audit.json)。

第四章以後尚未完成同等擴編，會逐單元校訂，不把全書現況誤稱為每章皆已圖解完成。

第一、二章另完成[逐節銜接補強](research/chapter-transitions.md)：補上小節之間的問題承接與回顧，保留原有知識、例題、練習和圖表。

先前[工程實務與教學編修](research/unit-01-02-professional-review.md)加入理工讀者的能力檢核、建模推導、規格與量測表、判讀活動及2張同風格新圖。當時的[保留稽核](research/unit-01-02-professional-audit.json)確認前一版338個區塊、20題正式練習和13張原圖保留；後續各章修訂另立固定基線，不覆寫歷史結果。

圖像採統一的扁平工程示意風格：藍色結構、橘色重點、簡潔編號與標註。後續單元沿用[圖像設計規範](research/figure-style-guide.md)，構圖與細節依內容重新設計，不複製既有圖稿。

## 建置與檢查

```sh
npm ci
npm run build
npm run check
npm run check:unit01-lifecycle
npm run check:navigation
```

新正文為 `content/01-*.md` 至 `content/46-*.md`；附錄為90–92。`scripts/build-book.mjs` 只選取這些平面檔案，使用本機 KaTeX 將公式預先排版，沒有外部CDN或分析追蹤。`scripts/check-book.mjs` 驗證章節結構、內部檔案與錨點、公式錯誤、JavaScript語法及教學模型數值，結果寫入 `research/verification.json`。這些檢查不等於同儕審查或真實瀏覽器視覺驗收。

路線單一資料來源是 `src/learning-paths.mjs`，建置同時產生網頁導覽及 `content/learning-paths.md`，避免 GitHub 與網頁的定位清單不一致。`npm run check:unit01-lifecycle` 以209baae為固定基線，核對第一章原文、原題、原圖、來源、錨點、其他48篇正文與時間圖幾何。歷史 `npm run check:roadmap` 僅適用導覽階段209baae；第一章已正式擴編，不能在新版執行它並期待「全部正文不變」。舊腳本、固定基線與結果原樣保留。

## 產出

- `dist/index.html`：產業主線與原章序入口。
- `dist/roadmap.html`：六環節、先備、交付／驗證與內容邊界。
- `dist/all.html`：完整閱讀與列印版。
- `dist/book.md`：合併後的文字與公式原始檔。
- `dist/engineering-textbook-html.zip`：可解壓後直接開啟的離線包。
- `dist/book-manifest.json`：實際章數、字數及公式數。

離線閱讀時請保留 `assets/` 與 `chapters/` 的相對位置，不要只移動一個HTML檔。引用的外部資料仍需連線開啟。瀏覽器列印可另存PDF；本次沒有預先產生或檢查PDF分頁。

## 一起改善教材

歡迎透過 Issues 回報錯誤，附上章節、原文位置、問題說明與可核實的參考資料；也歡迎提交修正的 Pull Request。請勿提交未經授權的課本掃描或付費全文。如果這份教材對你有幫助，歡迎給一顆 Star，讓更多自學者找到它。
