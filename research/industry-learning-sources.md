# 半導體產業學習主線：來源與編排依據

查讀日期：2026-10-25。用途：支援首頁與導覽的「設計 → 製造 → 系統」定位，不代表各章的設計流程內容已全部補齊。

六階段框架、統一交付欄位及章節映射為編者綜整，不是任何組織制定的唯一業界標準。流程會並行、迭代，因產品、製程與供應鏈而異。所有圖稿未取自以下來源。

## S1｜University of Bristol：需求、設計與驗證

[Kerstin Eder，Introduction to Design Verification，COMS30026](https://uobdv.github.io/Design-Verification/Lectures/Current/1_Introduction_to_DV_ALL-SLIDES_narrated_v7-plain.pdf)

已讀 PDF 第 3、5、7–8、30–35 頁，以 PDF 頁序而非印刷頁碼計：verification／validation、IC design process、tape-out、verification versus test、DFT 及等效性檢查。

支持需求與架構定義設計意圖、不同設計表示相互核對、驗證需貫穿並平行執行；製造測試和設計驗證回答不同問題。

限制：不把課堂流程圖套成所有類比、功率或多晶粒產品的標準，不採用歷史成本與工期數字；不能因製造前已有驗證，就省略矽後與系統確認。

## S2｜OpenROAD：數位實作及交付檢查

[OpenROAD Flow Scripts Tutorial](https://openroad-flow-scripts.readthedocs.io/en/latest/tutorials/FlowTutorial.html)

已讀 Configuring The Design、Timing Constraints、Running The Automated RTL-to-GDS Flow、結果／報告目錄、Timing，以及 synthesis、placement 與 timing repair 的說明。

支持數位流程輸入包含 RTL、製程平台與約束，經合成、平面規劃、擺置、時脈樹及繞線形成實體資料；網表、約束、時序、壅塞及規則報告需一起判讀。

限制：是特定數位實作流程，不是完整功能驗證或類比設計。範例結果仍有負 slack，因此產生 GDS 不等於 signoff 通過。指令與版本會變動，不作永久製程規範。

## S3｜Virginia Tech：類比設計與版圖回饋

- [Introduction to Cadence for Analog IC Design](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/0_index.html)
- [Layout Versus Schematic](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/lvs.html)
- [Parasitic Extraction and Post-Layout Simulation](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/pex.html)

已讀總覽 circuit-level simulation 與 layout 流程、LVS 開頭定義與除錯、PEX 及後模擬段落。

支持類比設計透過電路圖、模型與模擬建立性能；LVS 核對元件、參數及連接，萃取寄生後再模擬，性能不足則修改版圖並重跑。

限制：特定學校工具環境，不代表類比完全手工或數位不需寄生分析；DRC／LVS 通過不等於性能合格。只引用公開流程概念，不搬用保密 PDK 規則、模型或數值。

## S4｜STMicroelectronics：晶圓、封裝測試與系統支援

[The Semiconductor Value Chain](https://www.st.com/content/st_com/en/about/manufacturing-at-st/semiconductor-value-chain.html)

已讀 A sophisticated process、The IDM model、The fabrication of a semiconductor device、Front-end manufacturing、Back-end manufacturing、Solution creation。

支持晶圓形成元件與互連、加工後晶圓電性測試、封裝與成品測試，以及軟體及參考板支援產品開發。

限制：IDM 不是所有公司的組織模式；製造前／後段不與晶圓 FEOL／BEOL 混用。不採用固定產量、步數與工期作通則，也不推論全部封裝只有一顆 die 或最終測試能保證永不失效。

## S5｜Siemens：DFT 前移

[Tessent RTL Pro — RTL-based DFT Insertion](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/3rHm3xBoSaKSeJzgIedAte/en-US/Siemens-SW-Tessent-RTL-Pro-85605-FINAL.pdf)

已讀 PDF 第 1–3 頁，重點為 RTL analysis、DFT logic insertion 及插入流程。

支持可在 RTL 階段分析或插入測試點、wrapper 等結構，讓合成與驗證評估影響；DFT 需提早規劃，不能到晶圓製成才考慮。

限制：不是所有 DFT 必須在 RTL 插入，亦不代替類比測試。此資料的 pre-DFT DRC 是測試規則檢查，不是幾何 DRC；廠商宣傳倍數不作一般保證。

## S6｜Siemens：封裝及系統共同設計

[Keith Felton，Next Generation IC Packaging Requires Next Generation Design Solution — Part 1](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/5s0l7Xkc2wqROYOYdxWyQ/en-US/82672_Siemens%20SW%20Next%20Generation%20IC%20Packaging%20Part%201%20WP%2082672%20C1.pdf)

已讀 PDF 第 1、3–6、8 頁：digital prototyping、system netlist、package planning 及驗證範圍。

支持封裝規劃須共同考慮 die I/O、pad／bump／ball、互連、供電、熱、訊號完整性及可測試性；連接資料、實體驗證與電性分析支援交接。

限制：聚焦先進異質整合，不代表所有產品都需相同工具、3D 模型或驗證項目；特定交付格式不保證所有 foundry／OSAT 接受。

## 綜整結論與實作位置

需求與驗證關係以 S1 為主；數位／類比實作以 S2、S3 為主；實體產品交付以 S4 為主；DFT 與封裝前移以 S5、S6 為主。

教材以需求與架構、電路／邏輯設計、驗證與實體設計／投片、晶圓製造、封裝測試、系統整合六環節整理。這是編輯推論與教學設計，不是來源逐字轉寫。每個環節均標輸入、交付、判據、相關章節、先備與未涵蓋內容；DFT 規劃不與製成品測試混為一談，封裝也不是製造後才開始設計。

數位與類比共用規格、製程、介面、實體限制及版本交付，但主要設計表示與實作方法不同；混合訊號會結合兩路。路線資料在 `src/learning-paths.mjs`，產出的[章節保留與定位對照](../content/learning-paths.md)由同一份資料生成。

查讀為編寫流程內的一手資料研究，未執行上述 EDA 流程、未取得任何製程簽核，也不表示來源單位或外部專家背書。
