# 第三章產業連結：來源查讀與自設案例

查讀日期：2026-10-26。研究協作者查讀下列原文，主編交叉讀TI、AMD及MT-101關鍵段並整合引用；非外部專家審稿。保留第三章原8筆書目，本輪加[9]–[14]。數值、要求、表格及兩張圖均由教材自行設計，不重製來源圖稿或將來源當產品背書。

## 一手資料與適用範圍

### [9] JKU：實作寄生與模型交接

[Harald Pretl：Design of Complex Integrated Circuits](https://iic-jku.github.io/design-complex-ic/dcic.html)。實讀§10.3 Include the Parasitics及§10.2末段條件相容性提醒。支持片上互連、封裝及PCB寄生，以及手算、PEX、EM／S參數模型的分層。用於前端寄生後分析及供電路徑界線；不提供本例20／5 pF、20 mΩ或1 nH，不允許把不同節點電容任意相加。

### [10] Tektronix：探棒載入

[ABCs of Probes Primer](https://www.tek.com/en/documents/whitepaper/abcs-probes-primer)。實讀§4 Signal Source Impedance、§5 Capacitive Loading、Effect on Rise Time及Effect on Amplitude and Phase，含圖5.3–5.6周邊正文。支持探棒和源阻抗共同改變幅相、不能只看直流輸入電阻。原文50 Ω及20＋11 pF例並非本例；本例10 pF不代表所有探棒，也不保證能接觸晶片內部節點。純電容近似未含探棒電阻、補償、接地電感及通道時延。原文約2.2RC指10–90%上升時間，不是1%建立時間。

### [11] ADI：頻寬、建立與切換負載

[Alan Walsh：Front-End Amplifier and RC Filter Design for a Precision SAR ADC](https://www.analog.com/en/resources/analog-dialogue/articles/front-end-amp-and-rc-filter-design.html)，Analog Dialogue 46-12，2012。實讀HTML開頭、Selecting a Suitable RC Filter、Table 1前後多工建立段及Selecting a Suitable Amplifier。本輪PDF開啟失敗，依可讀HTML查證，不記成重新讀完PDF。

支持外部RC限頻與建立取捨、SAR切換負載及驅動器動態的界線；作延伸閱讀，不能用該文的電荷分享與產品時序代替本章固定拓撲連續時間RC。Table 1採1 LSB，前文有半LSB推導；二者不能混用。產品頻寬倍數也不作普遍設計規則。

### [12] TI：PDN、迴路與目標阻抗

[Erwan Petillon：Power Delivery Network Analysis，SWPA222A](https://www.ti.com/lit/an/swpa222a/swpa222a.pdf)，2012年11月。協作者實讀PDF／印刷頁3（§1）、7–9（§3 Capacitor Loop Inductance）、10–11（§4 Target Impedance）；主編另讀頁12的共振／去耦討論。支持完整網路、電源／回流端口、迴路電感及頻帶一起檢查；單支路結果不等於全PDN達標。

來源是OMAP4430板級方法，頁10分母含0.5 × Imax transient，不照搬成通用規則。教材50 mΩ由自設5 mVrms／100 mArms推出；原文某例回流影響較小，不表示其他設計可忽略回流。沒有沿用其板圖、產品要求或模擬結果。

### [13] AMD：預算定義與有效頻帶

[Versal Adaptive SoC PCB Design User Guide，UG863：Target Impedance](https://docs.amd.com/r/en-US/ug863-versal-pcb-design/Target-Impedance)，v1.12，2026-06-16。實讀小節正文的負載變動、有效頻帶、DC／AC分配、固定毫伏門檻與完整板級模擬提醒；公式圖片未清晰抽取，不以它作獨立公式查證。

來源是指定產品的step-load設計條件；本文是單頻RMS要求，明確區分。已分給DC誤差的額度不能再完整分給AC。多頻總RMS及峰值的結論由本章原正交性與相量推導，不冒稱該文件保證逐頻通過就代表瞬態通過。

### [14] ADI：ESR／ESL與自諧振

[MT-101：Decoupling Techniques](https://www.analog.com/media/en/training-seminars/tutorials/MT-101.pdf)，Rev.0，2009年3月。實讀頁1–2供電干擾／連接電感、頁3–4 Real Capacitors and Their Parasitics及式1。支持真電容的ESR、ESL、自諧振與安裝電感。

正文使用限定串聯近似Z=RESR＋j(ωLESL−1/ωC)，忽略漏電及介電吸收，諧振時虛部為零且阻抗模為ESR。這不是完整去耦反共振分析；不能推出容量較小必有較小ESL，或任意並聯電容都改善全頻段。來源包含其他寄生，沒有把簡化圖冒充完整模型。

## 自設數值與檢核

| 案例 | 條件與獨立重算 |
|---|---|
| 固定前端節點 | Rs=2 kΩ；CΣ=20／25／35 pF均跨同對交流節點；τ=40／50／70 ns |
| 1 MHz幅相 | 0.9698388／−14.1078°；0.9540282／−17.4406°；0.9153748／−23.7410° |
| 反推總電容 | 幅度≥0.95給26.1558500 pF；落後≤18°給25.8562879 pF，後者較嚴 |
| 預算與建立 | 20 pF上新增額度5.8562879 pF；用了5 pF後剩0.8562879 pF；非零初始差的1%建立184.206807／230.258509／322.361913 ns |
| 供電模型 | R=20 mΩ，完整去回等效L=1／0.5 nH，單頻Iac,rms=0.1 A，擾動限制5 mVrms |
| 10 MHz比較 | 阻抗65.938166／37.241918 mΩ，擾動6.593817／3.724192 mVrms |
| 反推與損耗 | 單頻50 mΩ門檻給L≤0.7293396 nH；交流電阻損耗0.2 mW，不含DC熱損耗 |
| 練習16多音 | 0.5 nH時1及10 MHz各0.1 Arms，電壓2.024524／3.724192 mVrms；整數共同週期總RMS4.238903 mV，峰值上界8.129911 mV，非必然峰值 |

電流由源流向負載時，ZI是路徑壓降；理想源交流固定為零時負載端擾動為−ZI，兩者相位差180°。全部案例在指定模型內成立，未納入製程／溫度界限、實際PEX／EM、完整穩壓器及去耦網路。沒有執行SPICE、RTL／AMS、實體量測或產品簽核。
