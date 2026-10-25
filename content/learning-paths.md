# 產業學習路線：從晶片設計到製造與系統

<!-- 由 src/learning-paths.mjs 產生；請修改來源後執行 npm run build。 -->

本頁是現有內容定位與擴編藍圖，不宣稱完整流片課程已補齊。所有原章號、正文及圖片保留。[原章序目錄](README.md)・[專案首頁](../README.md)

新讀者先讀第 01 章，再依問題補齊先備。六個環節是教學整理，不是單向流程或唯一業界標準；驗證、DFT、封裝與製造限制需提早介入，數位與類比設計分支不能混為一談。

## 1. 需求與晶片架構

- 收到什麼：產品使用情境、工作負載、介面、功耗、成本與可靠度目標。
- 交付什麼：可驗證的需求、功能分割與性能預算；先決定哪些功能由晶片、封裝、板級電路及韌體承擔。
- 怎麼判斷：每項需求都能對應條件、量測方法及判定門檻，而不是只有功能名稱。

第 01 章提供需求與產業物件的入口；第 40 章是學過相關模型後再回訪的取捨審查，不是入門第二課。

現有相關章節：[第 01 章　從需求到晶片：建立工程學科地圖](01-engineering-map.md)、[第 40 章　整合設計審查：效能、能耗、良率與成本](40-design-tradeoffs.md)。

第 01 章作入口；第 40 章留待相關模型學完再回訪。

**內容邊界：** 待補：IC 架構規格實例、功能與介面分割、時鐘／重置／電源規劃，以及製程、PDK 與 IP 選擇。

**如何接下去：** 將可量化的需求交給設計；製程、封裝與測試的可行性也要在此時回饋。

## 2. 電路與邏輯設計

- 收到什麼：架構規格、製程模型、元件／IP 資料及電源與介面限制。
- 交付什麼：類比／混合訊號電路設計或數位 RTL，以及對應的模擬模型與約束。兩種設計分支不共用一套完整流程。
- 怎麼判斷：設計在指定工作條件下符合功能與性能預算；可測試性、可觀測性及封裝限制需提早規劃。

類比入口為 26 → 27，數位入口為 28 → 29；第 21 章作記憶體產品橋接，第 33 章按可測試性需求回查。第 27 章偏運放應用，並非運放內部 IC 設計。

現有相關章節：[第 26 章　類比電路、工作點與小訊號](26-analog-small-signal.md)、[第 27 章　運算放大器、回授與穩定度](27-opamps-feedback.md)、[第 28 章　CMOS 邏輯、延遲與功耗](28-digital-cmos.md)、[第 29 章　HDL、同步時序與跨時脈](29-hdl-timing-cdc.md)、[第 21 章　SRAM、DRAM、NAND 與新型記憶體](21-memory-technologies.md)、[第 33 章　測試、DFT 與可觀測性](33-test-dft.md)。

先備回查（依分支選用，仍須閱讀各章先備）：[第 02 章　工程數學與量綱](02-engineering-mathematics.md)、[第 03 章　複數、相量與頻域](03-complex-phasors.md)、[第 04 章　電路分析與網路定理](04-circuit-analysis.md)、[第 05 章　暫態與濾波器](05-transients-filters.md)、[第 06 章　訊號、系統與取樣](06-signals-sampling.md)、[第 12 章　MOS 電容與 MOSFET](12-mos-capacitor-mosfet.md)。

**內容邊界：** 待補：完整 RTL 模組與測試平台、標準元件庫、類比偏壓／差動級與尺寸設計、PVT 角落及失配分析。

**如何接下去：** 設計描述必須同時交付驗證意圖與約束，才能進入可追溯的實作與檢查。

## 3. 驗證、實體設計與投片

- 收到什麼：RTL 或電路圖、驗證計畫、PDK、元件庫與設計約束。
- 交付什麼：數位綜合與佈局繞線結果，或類比版圖；連同必要的驗證、簽核報告及受版本管理的投片資料。
- 怎麼判斷：依產品及製程要求完成相應的功能、時序、DRC／LVS、寄生及電源完整性檢查。產生 GDS 檔不等於簽核通過。

目前只有第 29 章時序／CDC、第 33 章驗證與測試區別，以及第 07、20、34 章的互連與封裝背景；這些是相關基礎，尚非完整 RTL-to-GDS 或類比投片課程。

現有相關章節：[第 29 章　HDL、同步時序與跨時脈](29-hdl-timing-cdc.md)、[第 33 章　測試、DFT 與可觀測性](33-test-dft.md)、[第 07 章　電磁場、互連與傳輸線](07-fields-transmission-lines.md)、[第 20 章　CMOS 整合、接觸與多層互連](20-interconnect-cmos.md)、[第 34 章　封裝、Chiplet、散熱與訊號完整性](34-packaging-chiplets.md)。

先備回查（依分支選用，仍須閱讀各章先備）：[第 04 章　電路分析與網路定理](04-circuit-analysis.md)、[第 12 章　MOS 電容與 MOSFET](12-mos-capacitor-mosfet.md)、[第 26 章　類比電路、工作點與小訊號](26-analog-small-signal.md)、[第 28 章　CMOS 邏輯、延遲與功耗](28-digital-cmos.md)。

**內容邊界：** 目前主要缺口：綜合、floorplan、placement、CTS、routing、類比匹配版圖、DRC／LVS／PEX、後模擬、簽核收斂與投片版本交付。這一段尚需系統性補寫。

**如何接下去：** 通過約定檢查的版圖與資料才交給製造；實作發現的時序、寄生或可製造性問題會回到設計修正。

## 4. 晶圓製造與品質

- 收到什麼：受控的製造資料、基板、製程整合方案與各站規格。
- 交付什麼：完成加工的晶圓，以及製程、量測、缺陷、追溯與良率資料。
- 怎麼判斷：材料、幾何與電性均須對應規格；量測、統計、可靠度與變更管理貫穿各階段，不是製造完才補做。

第 14–20 章涵蓋基板與主要製程模組，第 22–25 章建立證據與控制，第 38 章練習良率異常診斷。章號不是晶圓的固定加工順序；清洗、微影與薄膜等會多次重複。

現有相關章節：[第 14 章　晶體成長與基板工程](14-crystal-substrates.md)、[第 15 章　微影與圖形轉移](15-lithography-patterning.md)、[第 16 章　薄膜、氧化與表面反應](16-films-surfaces.md)、[第 17 章　蝕刻、電漿與選擇比](17-etch-plasma.md)、[第 18 章　摻雜、離子佈植與熱預算](18-doping-thermal-budget.md)、[第 19 章　清洗、表面與化學機械平坦化](19-cleaning-cmp.md)、[第 20 章　CMOS 整合、接觸與多層互連](20-interconnect-cmos.md)、[第 22 章　量測、檢測與實驗設計](22-metrology-doe.md)、[第 23 章　機率統計、良率與資料判讀](23-statistics-yield.md)、[第 24 章　製程控制、MES 與智慧製造](24-control-mes.md)、[第 25 章　可靠度、失效物理與工程變更](25-reliability-change.md)、[第 38 章　專題二：良率異常診斷](38-project-yield-diagnosis.md)。

先備回查（依分支選用，仍須閱讀各章先備）：[第 02 章　工程數學與量綱](02-engineering-mathematics.md)、[第 08 章　晶體、能帶與載子統計](08-solid-state-bands.md)、[第 09 章　摻雜、漂移、擴散與復合](09-carriers-transport.md)、[第 10 章　PN 接面與二極體](10-pn-junctions.md)、[第 12 章　MOS 電容與 MOSFET](12-mos-capacitor-mosfet.md)。

**內容邊界：** 待補：以同一產品串接模組的完整製程整合案例、設計規則回饋、實體失效分析與確認修正閉環。現有內容不是設備操作或製程配方。

**如何接下去：** 晶圓電測與缺陷資料支援晶粒選別、後續封裝與測試；異常也可能回饋製程或設計。

## 5. 封裝與測試

- 收到什麼：晶圓／晶粒、測試需求、封裝介面與熱／電性預算；相關規劃在設計前期就開始。
- 交付什麼：封裝元件、測試結果、分級與可靠度證據；晶圓電測和封裝後測試是不同的檢查位置。
- 怎麼判斷：分清設計驗證、製造缺陷測試、性能量測與可靠度試驗；某一種覆蓋率不能取代其餘證據。

第 34 章介紹封裝、Chiplet、熱與寄生，第 33 章連接 DFT 與實物篩檢，第 25、36 章支援可靠度及量測。

現有相關章節：[第 34 章　封裝、Chiplet、散熱與訊號完整性](34-packaging-chiplets.md)、[第 33 章　測試、DFT 與可觀測性](33-test-dft.md)、[第 25 章　可靠度、失效物理與工程變更](25-reliability-change.md)、[第 36 章　工程實驗與量測方法](36-measurement-lab.md)。

先備回查（依分支選用，仍須閱讀各章先備）：[第 07 章　電磁場、互連與傳輸線](07-fields-transmission-lines.md)、[第 22 章　量測、檢測與實驗設計](22-metrology-doe.md)、[第 23 章　機率統計、良率與資料判讀](23-statistics-yield.md)、[第 28 章　CMOS 邏輯、延遲與功耗](28-digital-cmos.md)。

**內容邊界：** 待補：晶圓探測／ATE 測試計畫、封裝共同設計、測試程式與矽上除錯案例，以及良率、成本和測試時間的共同取捨。

**如何接下去：** 元件的介面、性能、熱與使用限制交給系統整合；測試與封裝觀察亦需回饋設計和製造。

## 6. 系統整合與驗證

- 收到什麼：晶片及封裝規格、板級電路、韌體、校正資料與原始產品需求。
- 交付什麼：可重現的系統行為、量測紀錄與需求符合性證據，以及下一版的問題清單。
- 怎麼判斷：在相同工作負載與測試條件下檢驗精度、效能、能耗、資料完整性及可靠度；模型預測與實測分開。

第 30–32、35 章連接轉換器、電源、韌體與前端；第 36–37 章以量測和感測資料專題整合，第 40 章回到方案審查。第 30 章偏轉換器規格與介面，31 偏電源級與熱，32 偏 MCU 周邊與韌體；不是 ADC/DAC、PMIC 或處理器內部的完整 IC 設計教材，也不代表已自行完成晶片製造。

現有相關章節：[第 30 章　ADC、DAC、取樣與雜訊預算](30-data-converters.md)、[第 31 章　電源、功率轉換與熱設計](31-power-electronics.md)、[第 32 章　微控制器、韌體與資料完整性](32-microcontrollers-firmware.md)、[第 35 章　射頻、光電與感測器概論](35-rf-opto-sensors.md)、[第 36 章　工程實驗與量測方法](36-measurement-lab.md)、[第 37 章　專題一：從感測器到可追溯數位資料](37-project-sensor-data.md)、[第 40 章　整合設計審查：效能、能耗、良率與成本](40-design-tradeoffs.md)。

先備回查（依分支選用，仍須閱讀各章先備）：[第 02 章　工程數學與量綱](02-engineering-mathematics.md)、[第 03 章　複數、相量與頻域](03-complex-phasors.md)、[第 04 章　電路分析與網路定理](04-circuit-analysis.md)、[第 05 章　暫態與濾波器](05-transients-filters.md)、[第 06 章　訊號、系統與取樣](06-signals-sampling.md)、[第 26 章　類比電路、工作點與小訊號](26-analog-small-signal.md)、[第 27 章　運算放大器、回授與穩定度](27-opamps-feedback.md)、[第 28 章　CMOS 邏輯、延遲與功耗](28-digital-cmos.md)。

**內容邊界：** 待補：首次矽片 bring-up、板級 SI／PI 與熱的共同驗證、硬韌體問題定位，以及系統失效回溯至 IC／封裝／製程的案例。

**如何接下去：** 把可定位的系統問題與量測證據回送需求、架構、設計、製造及封裝；不是以「能開機」作為唯一終點。

## 基礎、工具與延伸

### 數理、電路與訊號工具

02 的量綱與建模支援後續推導；03、04、05 分別處理頻域、網路與暫態，再接 06 取樣與 07 互連。依任務補齊，不能把「可回查」當成不需要先備。

[第 02 章　工程數學與量綱](02-engineering-mathematics.md)、[第 03 章　複數、相量與頻域](03-complex-phasors.md)、[第 04 章　電路分析與網路定理](04-circuit-analysis.md)、[第 05 章　暫態與濾波器](05-transients-filters.md)、[第 06 章　訊號、系統與取樣](06-signals-sampling.md)、[第 07 章　電磁場、互連與傳輸線](07-fields-transmission-lines.md)。

### 材料與元件基礎

CMOS 主線先理解 08–10，再讀 12；11 是 BJT／類比支線，13 分開看先進邏輯與功率元件，不把兩者當成同一條微縮路線。

[第 08 章　晶體、能帶與載子統計](08-solid-state-bands.md)、[第 09 章　摻雜、漂移、擴散與復合](09-carriers-transport.md)、[第 10 章　PN 接面與二極體](10-pn-junctions.md)、[第 11 章　雙極性接面電晶體](11-bipolar-transistors.md)、[第 12 章　MOS 電容與 MOSFET](12-mos-capacitor-mosfet.md)、[第 13 章　短通道、FinFET／GAA 與功率元件](13-advanced-power-devices.md)。

### 量測、統計與可靠度工具

22 → 23 提供資料層級與統計判讀；24、25 延伸到控制和可靠度，36 支援實驗紀錄。這些能力跨越設計、製造、測試及系統。

[第 22 章　量測、檢測與實驗設計](22-metrology-doe.md)、[第 23 章　機率統計、良率與資料判讀](23-statistics-yield.md)、[第 24 章　製程控制、MES 與智慧製造](24-control-mes.md)、[第 25 章　可靠度、失效物理與工程變更](25-reliability-change.md)、[第 36 章　工程實驗與量測方法](36-measurement-lab.md)。

### 學習計畫與查詢工具

39 保留原科系與兩學期路徑供選讀；附錄查單位、術語及來源。本頁產業導覽與原學科路徑並存，沒有重新編號。

[第 39 章　科系課程地圖與兩學期學習計畫](39-curriculum-study-plan.md)、[附錄A　符號、單位與量級檢查](90-symbols.md)、[附錄B　跨學科術語速查](91-glossary.md)、[附錄C　學術資料、延伸閱讀與編寫說明](92-bibliography.md)。

### 延伸應用：MEMS 與生醫感測

結構、流體、表面、BioFET、讀出與感測驗證是專題支線，不是每位讀者都要先修的 IC 主流程，也不等同臨床驗證。

[第41章 微機電：從結構力學到可讀出的訊號](41-mems-mechanics.md)、[第42章 微流體與傳輸：流得過去，不代表混得均勻](42-microfluidics.md)、[第43章 表面辨識與反應動力學：有結合，不等於量得到](43-surface-recognition.md)、[第44章 BioFET 與電解液界面：從表面電位到汲極電流](44-biofet-interfaces.md)、[第45章 電化學、光學與奈米孔：不同讀出量，如何公平比較？](45-sensing-modalities.md)、[第46章 感測器驗證：從漂亮曲線走向可信的量測](46-sensor-validation.md)。

## 原章節保留與新定位對照

這是閱讀定位，不是章節完成度認證；同一章可以服務多個環節。

| 原章節（編號與網址不變） | 產業環節／支援定位 | 本階段正文與圖稿 |
|---|---|---|
| [第 01 章　從需求到晶片：建立工程學科地圖](01-engineering-map.md) | 需求與晶片架構 | 原樣保留 |
| [第 02 章　工程數學與量綱](02-engineering-mathematics.md) | 數理、電路與訊號工具 | 原樣保留 |
| [第 03 章　複數、相量與頻域](03-complex-phasors.md) | 數理、電路與訊號工具 | 原樣保留 |
| [第 04 章　電路分析與網路定理](04-circuit-analysis.md) | 數理、電路與訊號工具 | 原樣保留 |
| [第 05 章　暫態與濾波器](05-transients-filters.md) | 數理、電路與訊號工具 | 原樣保留 |
| [第 06 章　訊號、系統與取樣](06-signals-sampling.md) | 數理、電路與訊號工具 | 原樣保留 |
| [第 07 章　電磁場、互連與傳輸線](07-fields-transmission-lines.md) | 驗證、實體設計與投片／數理、電路與訊號工具 | 原樣保留 |
| [第 08 章　晶體、能帶與載子統計](08-solid-state-bands.md) | 材料與元件基礎 | 原樣保留 |
| [第 09 章　摻雜、漂移、擴散與復合](09-carriers-transport.md) | 材料與元件基礎 | 原樣保留 |
| [第 10 章　PN 接面與二極體](10-pn-junctions.md) | 材料與元件基礎 | 原樣保留 |
| [第 11 章　雙極性接面電晶體](11-bipolar-transistors.md) | 材料與元件基礎 | 原樣保留 |
| [第 12 章　MOS 電容與 MOSFET](12-mos-capacitor-mosfet.md) | 材料與元件基礎 | 原樣保留 |
| [第 13 章　短通道、FinFET／GAA 與功率元件](13-advanced-power-devices.md) | 材料與元件基礎 | 原樣保留 |
| [第 14 章　晶體成長與基板工程](14-crystal-substrates.md) | 晶圓製造與品質 | 原樣保留 |
| [第 15 章　微影與圖形轉移](15-lithography-patterning.md) | 晶圓製造與品質 | 原樣保留 |
| [第 16 章　薄膜、氧化與表面反應](16-films-surfaces.md) | 晶圓製造與品質 | 原樣保留 |
| [第 17 章　蝕刻、電漿與選擇比](17-etch-plasma.md) | 晶圓製造與品質 | 原樣保留 |
| [第 18 章　摻雜、離子佈植與熱預算](18-doping-thermal-budget.md) | 晶圓製造與品質 | 原樣保留 |
| [第 19 章　清洗、表面與化學機械平坦化](19-cleaning-cmp.md) | 晶圓製造與品質 | 原樣保留 |
| [第 20 章　CMOS 整合、接觸與多層互連](20-interconnect-cmos.md) | 驗證、實體設計與投片／晶圓製造與品質 | 原樣保留 |
| [第 21 章　SRAM、DRAM、NAND 與新型記憶體](21-memory-technologies.md) | 電路與邏輯設計 | 原樣保留 |
| [第 22 章　量測、檢測與實驗設計](22-metrology-doe.md) | 晶圓製造與品質／量測、統計與可靠度工具 | 原樣保留 |
| [第 23 章　機率統計、良率與資料判讀](23-statistics-yield.md) | 晶圓製造與品質／量測、統計與可靠度工具 | 原樣保留 |
| [第 24 章　製程控制、MES 與智慧製造](24-control-mes.md) | 晶圓製造與品質／量測、統計與可靠度工具 | 原樣保留 |
| [第 25 章　可靠度、失效物理與工程變更](25-reliability-change.md) | 晶圓製造與品質／封裝與測試／量測、統計與可靠度工具 | 原樣保留 |
| [第 26 章　類比電路、工作點與小訊號](26-analog-small-signal.md) | 電路與邏輯設計 | 原樣保留 |
| [第 27 章　運算放大器、回授與穩定度](27-opamps-feedback.md) | 電路與邏輯設計 | 原樣保留 |
| [第 28 章　CMOS 邏輯、延遲與功耗](28-digital-cmos.md) | 電路與邏輯設計 | 原樣保留 |
| [第 29 章　HDL、同步時序與跨時脈](29-hdl-timing-cdc.md) | 電路與邏輯設計／驗證、實體設計與投片 | 原樣保留 |
| [第 30 章　ADC、DAC、取樣與雜訊預算](30-data-converters.md) | 系統整合與驗證 | 原樣保留 |
| [第 31 章　電源、功率轉換與熱設計](31-power-electronics.md) | 系統整合與驗證 | 原樣保留 |
| [第 32 章　微控制器、韌體與資料完整性](32-microcontrollers-firmware.md) | 系統整合與驗證 | 原樣保留 |
| [第 33 章　測試、DFT 與可觀測性](33-test-dft.md) | 電路與邏輯設計／驗證、實體設計與投片／封裝與測試 | 原樣保留 |
| [第 34 章　封裝、Chiplet、散熱與訊號完整性](34-packaging-chiplets.md) | 驗證、實體設計與投片／封裝與測試 | 原樣保留 |
| [第 35 章　射頻、光電與感測器概論](35-rf-opto-sensors.md) | 系統整合與驗證 | 原樣保留 |
| [第 36 章　工程實驗與量測方法](36-measurement-lab.md) | 封裝與測試／系統整合與驗證／量測、統計與可靠度工具 | 原樣保留 |
| [第 37 章　專題一：從感測器到可追溯數位資料](37-project-sensor-data.md) | 系統整合與驗證 | 原樣保留 |
| [第 38 章　專題二：良率異常診斷](38-project-yield-diagnosis.md) | 晶圓製造與品質 | 原樣保留 |
| [第 39 章　科系課程地圖與兩學期學習計畫](39-curriculum-study-plan.md) | 學習計畫與查詢工具 | 原樣保留 |
| [第 40 章　整合設計審查：效能、能耗、良率與成本](40-design-tradeoffs.md) | 需求與晶片架構／系統整合與驗證 | 原樣保留 |
| [第41章 微機電：從結構力學到可讀出的訊號](41-mems-mechanics.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [第42章 微流體與傳輸：流得過去，不代表混得均勻](42-microfluidics.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [第43章 表面辨識與反應動力學：有結合，不等於量得到](43-surface-recognition.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [第44章 BioFET 與電解液界面：從表面電位到汲極電流](44-biofet-interfaces.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [第45章 電化學、光學與奈米孔：不同讀出量，如何公平比較？](45-sensing-modalities.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [第46章 感測器驗證：從漂亮曲線走向可信的量測](46-sensor-validation.md) | 延伸應用：MEMS 與生醫感測 | 原樣保留 |
| [附錄A　符號、單位與量級檢查](90-symbols.md) | 學習計畫與查詢工具 | 原樣保留 |
| [附錄B　跨學科術語速查](91-glossary.md) | 學習計畫與查詢工具 | 原樣保留 |
| [附錄C　學術資料、延伸閱讀與編寫說明](92-bibliography.md) | 學習計畫與查詢工具 | 原樣保留 |

## 流程參考與查閱範圍

- [University of Bristol · Introduction to Design Verification](https://uobdv.github.io/Design-Verification/Lectures/Current/1_Introduction_to_DV_ALL-SLIDES_narrated_v7-plain.pdf)：查閱 PDF 第 3、5、7–8、30–35 頁：需求、設計表示、驗證與製造測試的區別，以及平行回饋；不採用歷史成本或工期作通則。
- [OpenROAD · Flow Scripts Tutorial](https://openroad-flow-scripts.readthedocs.io/en/latest/tutorials/FlowTutorial.html)：查閱設計輸入、時序約束、RTL-to-GDS、輸出與 Timing 章節：數位實作及報告判讀。範例產生 GDS 仍有負 slack，不能視為簽核完成；此流程不涵蓋全部產品驗證或類比設計。
- [Virginia Tech · Parasitic Extraction and Post-Layout Simulation](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/pex.html)：查閱寄生萃取與後模擬段落，並核對同校類比設計總覽及 LVS：性能不足時回修版圖再模擬。只引用公開流程概念，不移植 PDK 規則或專用模型。
- [STMicroelectronics · The Semiconductor Value Chain](https://www.st.com/content/st_com/en/about/manufacturing-at-st/semiconductor-value-chain.html)：查閱製造與 Solution creation 段落：晶圓電測、封裝後測試，以及軟體／參考板的系統支援。ST 的 IDM 分工不代表所有公司；製造前後段也不等於晶圓內的 FEOL／BEOL。
- [Siemens · Tessent RTL Pro](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/3rHm3xBoSaKSeJzgIedAte/en-US/Siemens-SW-Tessent-RTL-Pro-85605-FINAL.pdf)：查閱 PDF 第 1–3 頁：DFT 可在 RTL 階段分析及插入，需提早評估面積與時序影響。這是數位工具資料，不表示所有 DFT 都要在 RTL 插入，也不代替類比測試。
- [Siemens · Next Generation IC Packaging, Part 1](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/5s0l7Xkc2wqROYOYdxWyQ/en-US/82672_Siemens%20SW%20Next%20Generation%20IC%20Packaging%20Part%201%20WP%2082672%20C1.pdf)：查閱 PDF 第 1、3–6、8 頁：封裝前期共同規劃 I/O、互連、供電、熱與可測試性。來源聚焦先進整合，其工具與交付格式不是所有產品的唯一標準。

詳細查閱範圍及限制見[來源研究紀錄](../research/industry-learning-sources.md)。來源不代表對教材背書；未重用其圖稿。
