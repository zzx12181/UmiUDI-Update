# GS1 国际与中国医疗器械 UDI 编码标准指南 (包含 ISO/IEC & GS1 通用规范章节引证)

## 一、 UDI 基础构成结构 (依据 ISO/IEC 15459 & GS1 General Specifications Section 3.2.1)

唯一器械标识（UDI）由两部分构成：`UDI = DI + PI`。

1. **DI（产品标识 / Device Identifier）—— 静态主数据**
   - 采用 GS1 GTIN 编码（GTIN-13 或补零后的 GTIN-14）；
   - **应用标识符 (AI)**：为 **`(01)`**（GS1 General Specifications Section 3.2.1）；
   - 作用：全局唯一标识医疗器械的注册人/备案人、商品规格型号及包装层级；
   - 属于静态数据，产品生产前必须在国家药监局 CUDID 完成申报。

2. **PI（生产标识 / Production Identifier）—— 动态批次数据**
   - 包含生产过程中的动态关键控制要素，常用 GS1 AI 应用标识符如下（依据 GS1 General Specifications Section 3.2）：
     - **`(10)` 生产批号 (Batch/Lot Number)**：可变长度，上限 **20 位字符**（ISO/IEC 646 字符集）；
     - **`(11)` 生产日期 (Production Date)**：固定 6 位数字，格式为 `YYMMDD`；
     - **`(17)` 失效日期/有效期 (Expiration Date)**：固定 6 位数字，格式为 `YYMMDD`；
     - **`(21)` 序列号 (Serial Number)**：单件产品唯一流水号，可变长度，上限 **20 位字符**；
     - **`(240)` 附加产品型号 (Additional Product Identification)**。

---

## 二、 GS1 Mod 10 校验位算法计算标准 (依据 GS1 General Specifications Section 7.9)

GTIN-13 与 GTIN-14 的最后一位为 Mod 10 校验码，数学计算标准如下：
1. **位置与权重分布**：从代码位置从右向左（不含校验位），奇数位数字乘以 3，偶数位数字乘以 1；
2. **求和与取余**：将所有乘积求和得到总和 $S$；
3. **计算公式**：$CheckDigit = (10 - (S \bmod 10)) \bmod 10$，得到的值即为末位校验码。
- **技术规范**：若校验位计算错误，条码扫描设备（如仓储PDA、医院扫描枪）将直接拒读或报错“GTIN Check Digit Mismatch”。

---

## 三、 条码载体与数据质量要求 (依据 ISO/IEC 15415 & ISO/IEC 15417)

1. **GS1 DataMatrix (DM) 二维码 (依据 ISO/IEC 16022 & GS1 Section 5.5)**
   - 推荐用于医疗器械最小使用单元、单件器械本体及内包装；
   - 具备高密度、容错强（纠错等级 ECC 200）特点；
   - 要求数据串前缀必须包含 **FNC1 (ASCII 232)** 字符；
   - 印刷质量检测标准依据 **ISO/IEC 15415**，建议等级达到 **Grade B (2.0/05/660)** 以上。

2. **GS1-128 一维条形码 (依据 ISO/IEC 15417 & GS1 Section 5.4)**
   - 推荐用于外箱、中包装箱或托盘物流单元；
   - 必须符合 ISO/IEC 15417 标准，条空清晰，两侧必须保留标准空白区（Quiet Zone $\ge 10\times$ 模块宽度）。
