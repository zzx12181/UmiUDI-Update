# GS1 General Specifications (GS1 国际通用规范) 核心章节摘编
> ### 🔗 国际标准官方核验与在线验证链接 (Official Standards & Verification Links)
> - **GS1 官方应用标识符标准总览（AI 01, 10, 11, 17, 21）**：[GS1 Application Identifiers Standard Reference](https://ref.gs1.org/ai/)
> - **GS1 国际标准官网通用规范（General Specifications）**：[GS1 General Specifications Standard](https://www.gs1.org/standards/general-specifications)
> - **GS1 官方 Mod 10 校验码在线算法计算与验证工具**：[GS1 Check Digit Calculator](https://www.gs1.org/services/check-digit-calculator)


标准依据：GS1 General Specifications Standard (Release 24.0, 2024) / ISO/IEC 15459

---

### 1. Section 3.2.1: GS1 Application Identifiers (AI) in UDI
- **AI (01) - Global Trade Item Number (GTIN)**:
  - Format: Fixed 14 numeric digits (N14).
  - Purpose: Identifies the specific product variant, packaging level, and manufacturer prefix.
- **AI (10) - Batch or Lot Number**:
  - Format: Variable length, alphanumeric (X..20), max 20 characters.
  - Character Set: ISO 646 invariant characters (A-Z, 0-9, -, _, /).
- **AI (11) - Production Date**:
  - Format: Fixed 6 numeric digits (N6), pattern `YYMMDD`.
- **AI (17) - Expiration Date**:
  - Format: Fixed 6 numeric digits (N6), pattern `YYMMDD`.
  - Rule: Must be after production date.
- **AI (21) - Serial Number**:
  - Format: Variable length, alphanumeric (X..20), max 20 characters.

---

### 2. Section 7.9: Modulo 10 Check Digit Calculation
Used for GTIN-8, GTIN-12, GTIN-13, GTIN-14, SSCC.

- **Algorithm Steps**:
  1. Pad the code to 14 digits with leading zeroes.
  2. Starting from the rightmost digit before the check digit (index 12 down to 0), multiply digits in odd positions from right by 3, and even positions from right by 1.
  3. Sum all product values: S = sum(d_i * w_i).
  4. Check Digit = (10 - (S mod 10)) mod 10.
  5. The result must equal the 14th digit of the GTIN.