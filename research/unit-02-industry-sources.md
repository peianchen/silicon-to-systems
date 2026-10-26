# 第二章產業連結：來源查讀與自設案例

查讀日期：2026-10-26。保留原單位、微積分、RC、矩陣、取樣與不確定度內容；新增內容只示範數學如何成為IC設計限制、參數判定與驗證證據，不取代完整ADC或製程課程。公開資料由內部研究協作者與主編分工查讀，非外部專家審稿。

## 一手資料與使用範圍

### 1. Microchip：取樣窗的物理位置

[ADC Acquisition Time](https://developerhelp.microchip.com/xwiki/bin/view/products/data-converters/adc-specs/acquisition-time/)。實讀SAR Acquisition Time及Conversion Time兩段；正文[11]支持保持電容、源／開關阻抗，以及取樣建立與轉換時間的區別。只採SAR相關範圍，不引用其他架構的簡化敘述，也不採頁面的一般化最大源阻抗作所有ADC的規則。實際元件時序仍須查資料表；低更新率不表示取樣開關一直導通。

### 2. ADI：步階、半LSB與單極點建立

[Alan Walsh：Front-End Amplifier and RC Filter Design for a Precision SAR ADC](https://www.analog.com/en/resources/analog-dialogue/articles/front-end-amp-and-rc-filter-design.html)；[原文PDF，Analog Dialogue 46-12，2012年12月](https://www.analog.com/media/en/analog-dialogue/volume-46/number-4/articles/front-end-amp-and-rc-filter-design.pdf)。實讀PDF第1–3頁、網頁Selecting a Suitable RC Filter與多工步階段落，正文[12]採用步階／允許差比值決定時間常數數目的方法，並保留驅動器動態與切換電容負載的界線。

第1頁推導採半LSB，但第3頁Table 1明列1-LSB Error。10bit的6.93τ不是半LSB要求；滿跨度到半LSB應為ln2048τ≈7.62462τ。教材自行推導數字，不照搬該表，也不把外部濾波電容與內部保持電容任意合併。新圖不是來源圖稿的重製。

### 3. JKU：材料、幾何、角落與寄生

[Harald Pretl：Design of Complex Integrated Circuits](https://iic-jku.github.io/design-complex-ic/dcic.html)。實讀§4.3.2、§10.1–10.3；正文[13]支持均勻電阻與幾何的關係、匹配、PVT角落及寄生模型。TT／SS／FF不是通用機率或R、C百分比；最不利條件依性能指標而異，不一定永遠是最高溫。用來交代模型範圍，非特定PDK操作指令。

### 4. Cadence：process／mismatch的工具意義

[Monte Carlo: Global+Local vs Local and Process vs Mismatch](https://community.cadence.com/cadence_technology_forums/f/custom-ic-design/20466/monte-carlo-simulation-global-local-vs-local-and-process-vs-mismatch/1365107)。實讀Andrew Beckett對Process、Mismatch、All及foundry-model／systematic-layout限制的回覆，不採發問者的猜測分類。正文[14]提醒全域製程變動與局部實例失配需按模型定義處理，避免漏算或重複計入；隨機模型不自動涵蓋版圖梯度與所有系統性效應。官方工具專家回覆不取代晶圓廠模型文件。

### 5. NIST：界限、RSS與協方差

[TN1297 §4](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-4-type-b-evaluation-standard-uncertainty)、[§5](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-5-combined-standard-uncertainty)及[Appendix A](https://www.nist.gov/pml/nist-technical-note-1297/nist-tn-1297-appendix-law-propagation-uncertainty)。實讀§4.1–4.7、§5.1–5.2、A.1–A.5，重點式A-3、A-7。原[10]保留，新[15]支持界限轉成標準不確定度需分布假設；對稱半寬a的矩形分布給a/√3，不是一律除以3。RSS不代表最大界限；一階傳播須保留靈敏度和協方差。標準差推涵蓋機率還需要分布等條件，不由一個百分比直接得出。

### 6. Tektronix：觀測會改變被測系統

[ABCs of Probes Primer](https://www.tek.com/en/documents/whitepaper/abcs-probes-primer)。實讀§4 Signal Source Impedance及§5 The Effect of Source Impedance、Capacitive Loading／Effect on Rise Time，含圖5.3–5.4附近說明。正文[16]支持探棒負載對幅度及響應的影響，量測配置需入模型。來源2.2RC指特定一階模型的10–90%上升時間，不是半LSB建立。未使用來源圖稿，也未暗示可直接探測IC內部保持節點。

## 自設案例與計算

所有以下數值為本教材自行指定，不是任何來源、產品、晶圓廠或PDK的實測資料。

| 項目 | 條件與結果 |
|---|---|
| 量化與建立分配 | N=10、跨度2.048V，q=2mV；僅建立項分配q/2=1mV |
| 初始差與激勵 | 有效追蹤開始時差2.048V，之後常值；單極點固定正R、C |
| 名目模型 | Req=2.5kΩ、CH=20pF，τ=50ns；tmin=50ln2048=381.230949ns |
| 相容上界 | Req=3kΩ、CH=22pF可同時發生，τmax=66ns；tmin=503.224853ns |
| 400ns | 名目0.687027mV通過；最慢4.777956mV不通過 |
| 550ns | 最慢0.492277mV，給定模型與範圍內通過 |
| 500ns | 最慢1.0500748mV，不可把503.225ns向下取整後宣告通過 |
| 反推 | 400ns給τmax≤52.461638ns；22pF給Req,max≤2.3846199kΩ |
| 11bit練習 | 新半LSB門檻0.5mV；50ln4096=415.888308ns，比10bit多34.657359ns |
| 幾何示範 | ρ=3×10⁻⁸Ωm、L=100µm、w=2µm、h=0.2µm，R=7.5Ω；w−5%、h−10%時比值1/(.95×.9)=1.1695906 |

取樣示範、幾何示範與原10kΩ／100nF的5／6ms教具是獨立案例，不把參數拼成第一章的記錄器實作。半LSB只是一項建立誤差分配，不保證整ADC準確度或每次輸出碼都和理想碼相同。

## 模型與驗證界線

- Req包含所選等效充電路徑，不只是外接電阻；理想開關只標示通斷，導通阻抗不重複加入。不同節點的電容不可直接相加。
- 忽略非線性、開關電荷注入／回擾、驅動器壓擺、多極點，以及偏移、增益、雜訊、參考、非線性轉換和保持期間誤差；它們重要時須換模型。
- 上界同時可發生是題目明示條件，且RC對正R、C單調，所以可以取乘積上界；不把此法推廣為所有IC角落都能直接乘百分比。
- 最短實際有效窗才用於保證判斷；軟體設定、觸發時間戳、轉換時間與完整週期不是同一個量。
- 內部節點可能不可接觸；外部波形和有限位元碼各有觀測限制。需記錄儀器負載、頻寬、時基與不確定度，不假造內部量測證據。
- 本輪完成來源對照與算術重算，不代表SPICE、RTL／AMS模擬、量測、投片或量產驗證。保留原10條參考資料與其查閱範圍；新增6條，不移除必要來源或權利資訊。
