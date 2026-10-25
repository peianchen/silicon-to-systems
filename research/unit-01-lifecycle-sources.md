# 第一章產業主線補強：來源查讀紀錄

查讀日期：2026-10-25。對應 `content/01-engineering-map.md` 新增第3.4節、第4.1節設計放大檢視及矽後段落。使用大學公開教材與官方原始文件；未把索引、產品宣傳或未取得全文的課本當成所有技術結論的證據。以下範圍由本次編寫流程分工查讀與交叉核對，不代表外部專家審查。

## 需求、邊界與介面

1. [NASA Systems Engineering Handbook 附錄](https://www.nasa.gov/reference/system-engineering-handbook-appendix/)：本輪另讀 I 的3.1、7.1、7.2及 L 的3.1.2、3.1.4、3.2.4–3.2.6，支持需求分配、介面責任、訊號／資料、單位及容差的紀錄方法。原章附錄B–D引用保留，新範圍單列正文[19]。NASA並未提出本教材的記錄器架構或毫秒數值，也不是本產品合規判據。
2. [University of Bristol：Introduction to Design Verification](https://uobdv.github.io/Design-Verification/Lectures/Current/1_Introduction_to_DV_ALL-SLIDES_narrated_v7-plain.pdf)：PDF第3、5、7–8、30–35頁，需求、設計表示、平行驗證回饋與製造測試區別。此為數位驗證背景交叉檢查，未拿數位流程概括所有類比工作，也未引用歷史成本、工期或產業比例。

## 設計表示、製程資源與交付

3. [JKU：Design of Complex Integrated Circuits](https://iic-jku.github.io/design-complex-ic/dcic.html)：原[12]的4.1 Files and Tapeout、6.1 Post-Silicon Production Flow仍保留；本輪另查6.4、8.3.2、8.4.1–8.4.2、8.5、10.5、12.9。正文[21]對應數位／類比設計、首顆矽除錯及投片檢查。12.9支持最終資料庫、核准例外、封裝連接、版本標記及資料校驗的受控交付；課程清單不直接成為所有產品的通用簽核規範。
4. [SKY130 Libraries](https://skywater-pdk.readthedocs.io/en/main/contents/libraries.html)、[Device Details](https://skywater-pdk.readthedocs.io/en/main/rules/device-details.html)與[公開版本狀態](https://skywater-pdk.readthedocs.io/en/main/)：查庫分類、1.8 V NMOS模型條件及公開版狀態。用於正文[20]區分PDK、元件庫及模型的角色；模型有效範圍不是元件絕對額定值，公開預覽也不等於量產保證。未複製PDK內容、模型數據或版圖。
5. [Synopsys：Electronic Design Automation](https://www.synopsys.com/glossary/what-is-electronic-design-automation.html)：原[14]保留，補核對EDA與IP角色、架構探索及設計驗證。只採角色說明，不採可能被過度概括為「電路圖已不使用」的敘述；類比電路仍需正確區分表示法。
6. [OpenROAD Flow Scripts Tutorial](https://openroad-flow-scripts.readthedocs.io/en/latest/tutorials/FlowTutorial.html)：設計組態、約束、results／reports及Timing段落，支持RTL到GDS的數位實作與報告判讀。範例成功產生GDS仍可有負slack；「產生檔案」不等於簽核通過。它不涵蓋完整功能驗證、所有製程簽核或類比IC實作。對應正文[22]。

## 檢查、可測試性與封裝

7. [Virginia Tech：Layout Versus Schematic](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/lvs.html)與[Parasitic Extraction and Post-Layout Simulation](https://www.mics.ece.vt.edu/ICDesign/Tutorials/AnalogIC/pex.html)：查LVS定義、錯誤修正，以及PEX後步驟6–10的重模擬。支持「連接比對」與「寄生後性能」各有判據；不把通過LVS當成增益、雜訊或時序已達標。引用公開概念，不使用其保密PDK資源。對應正文[23]。
8. [Siemens Tessent RTL Pro](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/3rHm3xBoSaKSeJzgIedAte/en-US/Siemens-SW-Tessent-RTL-Pro-85605-FINAL.pdf)：PDF第1–3頁，DFT在設計前期考量、可觀測與可控制的需求。正文[24]只採前移原則，不暗示所有測試結構均在RTL插入、所有類比測試均可涵蓋，也不採宣傳的效率倍數。文件中的DFT規則檢查不可混同版圖幾何DRC。
9. [Siemens Next Generation IC Packaging, Part 1](https://static.sw.cdn.siemens.com/siemens-disw-assets/public/5s0l7Xkc2wqROYOYdxWyQ/en-US/82672_Siemens%20SW%20Next%20Generation%20IC%20Packaging%20Part%201%20WP%2082672%20C1.pdf)：PDF第3–6頁，特別是第6頁，支持I/O、bump／ball、供電、訊號、熱及測試的前期共同規劃。正文[25]不將先進封裝工具或3D整合視為所有產品必需。

## 自設教學資料，不冒充來源量測

- 候選IC整合AFE、ADC及數位控制／介面；感測器、MCU、儲存與選配RF在外。這是本教材為追溯交付所選的功能邊界，不是已設計完成的實體產品或唯一最佳架構。
- 同一配置、相容條件、依序活動的自設上限為0.8、0.5、0.2 ms，合計1.5 ms；2 ms候選工作預算餘0.5 ms未分配。上限尚待設計與量測證實；漏列活動須重新扣預算，重疊活動須重做相依分析。
- 控制器0.2 ms啟動ADC的錯誤情境，示範單元測試通過不能取代整合介面測試。不是主張每次0.2 ms必然失敗，而是最晚0.8 ms的承諾不能保證那時已就緒。
- 練習10的新上限1.0+0.6+0.3=1.9 ms；再加不重疊0.2 ms為2.1 ms，不能保證原2 ms預算，不表示每次實測都需2.1 ms，也不直接判定整機P01／S01失敗。
- 新資料不要求碼值每次不同。應以本次轉換完成、序號或可追溯事件確認，穩定輸入可以連續得到相同的新結果。
- 所有新SVG由本專案腳本重新設計幾何，未重用以上來源圖稿。來源提供概念依據，不代表背書、權利轉讓或本教材已完成量產／實驗驗證。

## 交叉校閱後的修正

簽核段原先僅在段末引用OpenROAD；複核後將版本、核准例外及封裝一致性的論點明確接到JKU [21]，OpenROAD [22]只支持GDS輸出與時序報告的區別。練習12及第3.4節補「碼值相同不代表舊資料」，避免將資料新鮮度錯當數值必須改變。
