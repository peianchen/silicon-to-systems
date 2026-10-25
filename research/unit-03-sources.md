# 第03章來源查證

查閱：2026-10-25。範圍：複數、相量、阻抗、功率、頻率響應與延遲。採一手教材／官方文件；八份具體來源與原有兩個課程索引皆保留。這是編寫過程的查證，不是外部專家認證。

## 核心結論與編寫慣例

全章使用 j、e^{jωt} 與有效值相量；時間波形須乘√2重建。來源若使用峰值相量，功率式中的1/2需轉換；不能一邊峰值一邊RMS。相位為輸出相對輸入，落後為負；單頻等效相位延遲為−arg(H)/ω，不等於任意寬頻波形的完整延遲。LTI多頻穩態需逐頻處理，且確認有界穩態存在。

## 逐筆資料與實際查讀範圍

| 編號 | 一手資料 | 查讀位置 | 支持內容與限制 |
|---|---|---|---|
| 1 | [MIT 18.03 Class 6: Complex Exponential](https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/863ef679a1924d20a267d6dec8251250_MIT18_03S10_c06.pdf)，2010-02-16 | PDF1–4，尤其2頁Euler、3頁共軛 | 複數運算、旋轉、指數；原文i改為j；相角模2π，零複數無唯一相角。不作功率來源。 |
| 2 | [MIT 18.03 Class 7: Exponential and Sinusoidal Input and Output](https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/79c78a34f2f1b8b0470b6426de9c34f0_MIT18_03S10_c07.pdf)，2010-02-17 | PDF1–4，1頁相位時間，2頁同頻合成，3–4頁特解與齊次解 | 複指數微分與正弦特解；原文正的落後角cos(ωt−φ)與本章負相角不同。特解不含全部初始條件。 |
| 3 | [Agarwal/Lang, MIT 6.002 Lecture 17: The Impedance Model](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/66adf4d4611a57b949efa1b00a842a46_6002_l17.pdf) | PDF2–9：2穩態，4–5 RC，6–7 RLC，8–9應用 | 支持RLC阻抗、KCL/KVL與分壓。Fall 2000講義收錄Spring 2007；原複振幅不能默認RMS。暫態須衰減或另處理，無損共振例外不能略去。 |
| 4 | [MIT 6.002 Lecture 18: Filters](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/d4e136975654a01f7fc2c9b49196d376_6002_l18.pdf) | PDF2–10及13：2–3 RC，8 RLC，13頻寬Q | 支持電容端RC低通H=1/(1+jωRC)及輸出位置；同為Fall 2000/Spring 2007。此式不含源與負載，不拿它證明dB功率定義。 |
| 5 | [J. L. Kirtley Jr., AC Power Flow in Linear Networks](https://ocw.mit.edu/courses/6-061-introduction-to-electric-power-systems-spring-2011/9cf8de165233601f547b284cee5c2131_MIT6_061S11_ch2.pdf)，2007著作、2011課程 | PDF2–7、10–15、17；重點14頁式61–63、15頁§7.1式66 | 平均／複／視在功率、RMS、功率因數。來源先用峰值S=VI*/2；本文RMS後S=ṼĨ*。PF=cosφ僅同頻正弦，S與|S|不能混稱。 |
| 6 | [Keysight, Useful Formulas, Conversions, and Reference Information](https://helpfiles.keysight.com/csg/89600B/Webhelp/Subsystems/gettingstarted/content/concepts_decibels.htm) | Concepts → Understanding Decibels完整公式正文 | 10log功率比；純電阻端點20log電壓RMS比+10log(Ri/Ro)。不移用快速換算表（其中−7 dBm電壓列疑似誤植）；教材數值獨立算。 |
| 7 | [Oppenheim, MIT RES.6-007 Lecture 7: Continuous-Time Fourier Series](https://ocw.mit.edu/courses/res-6-007-signals-and-systems-spring-2011/24eca8c9c36bf5931c022e17fd44dbfc_MITRES_6_007S11_lec07.pdf)，2011公開課程 | PDF1–4／講義7-1–7-4 | 複指數為LTI特徵函數與逐頻疊加。不同頻不能塞進單一相量；任意多音不一定有共同有限週期。本章RMS數值另依積分推導。 |
| 8 | [P. Bruschi, University of Pisa, Analog Filter Design: Introduction](https://docenti.ing.unipi.it/~a008309/mat_stud/AIF/2018/lecture_notes/Part_1.pdf)，2018目錄版 | PDF37–38：Phase, delay, group delay及Bessel延伸 | 保形需重要頻帶幅度近似固定、相位近似線性；群延遲−dφ/dω需展開相位。群延遲平坦不能補救幅度失真。 |

原有 [MIT 18.03課程索引](https://ocw.mit.edu/courses/18-03-differential-equations-spring-2010/pages/lecture-notes/) 與 [MIT 6.002課程索引](https://ocw.mit.edu/courses/6-002-circuits-and-electronics-spring-2007/pages/lecture-notes/) 保留作延伸入口；不以課程首頁冒充所有公式的直接證據。

## 來源與原創的界線

F01/F02需求、47/100/220 nF方案、容差界限、量測辨識點、所有算例／練習數值為自設或獨立推導，不宣稱來源給過相同產品規格。圖由本章公式與自設拓撲重新構圖，未移植外部課本圖表。引用支持定義與模型，不代表來源作者背書或原權利消失。

## 交叉查核

兩名代理分別完整順讀正文的技術／來源與教學連貫性，根代理整合校訂。確認RMS重建、KVL、複功率、三候選與容差角落、延遲符號正確。修正AC耦合讀值前提、輸出相對輸入的相位、不同電阻端點的有效值功率比；這是內部交叉檢查，不是期刊同儕審查。

關鍵獨立計算：100 nF候選τ∈[85.5,115.5] μs；可行τ∈[77.9697,119.3662] μs；1 kHz最小增益0.809338、10 kHz最大0.183003。模型辨識：0.81的理想相位−35.9041°，−10°的理想大小0.984808，單改τ無法同時符合。
