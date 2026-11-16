# UmiUDI & Drug 综合追溯系统业务标准操作规程 (SOP) 全集 (代码全量对齐版)

> **文件编号**：SOP-UMI-2026-V3-CODE-ALIGNED  
> **生效日期**：2026年09月01日  
> **适用范围**：医疗器械唯一标识 (UDI) 与国家药品追溯码 (DTC) 全生命周期管理系统  
> **代码来源基准**：严格 1:1 映射并对齐 WinForms 客户端源码工程（`UmiUDI&Drug`）  
> **界面交互架构**：  
> • **顶部水平导航栏（Segmented 控件）**：承载全部 **一级大类菜单**（`DI管理`、`药品管理`、`UDI管理`、`DTC管理`、`仓库管理`、`药品仓库`、`基础数据`、`权限配置`、`UDI追溯`、`ERP`、`AI助手`）—— *[代码来源: `Mian.cs` line 520~570]*；  
> • **左侧树形导航栏（Tree / Menu 控件）**：点击顶部一级菜单后，左侧动态加载并展示对应的 **二级分类分组** 与 **三级业务功能入口**（过滤条件为 `menuDT.Select("name='" + name + "' AND level='1'")`）—— *[代码来源: `Mian.cs` line 555]*；  
> • **右侧主工作区（Tab 控件）**：点击左侧功能菜单后，以多标签页（TabPage）形式并排展示业务工作台与数据表格。  
> **核心质量红线**：  
> 1. **严禁未首检批量赋码打印**：打印单在完成首检合格（`udi_dy_ywzt == "已首检"`）前，批量打印按钮被系统强制置灰锁定（`Enabled = false`）—— *[代码来源: `Pages/UDI_DY.cs` line 110~130, `Pages/UDI_SJ.cs` line 446]*；  
> 2. **单据原生初始状态**：新建单据落库初始状态统一为【创建】或【0】（入出库单为【未审核】），流通必须由主管执行【审核】变为【已审核】或【1】后方可下推与打印—— *[代码来源: `Pages/UDI_SCD.cs` line 1188, `Pages/UDI_XSD.cs` line 283, `Pages/CK_IN.cs` line 2267, `Pages/CK_OUT.cs` line 2086]*；  
> 3. **单据下推强校验防重**：销售单下推生产单、生产单下推打印单均需满足已审核状态，禁止对已关闭或已下推行二次下推—— *[代码来源: `Pages/UDI_SCD_List.cs` line 340~420, `Pages/UDI_XSD_List.cs` line 450~510]*；  
> 4. **双向穿透溯源闭环**：销售单可下查生产单；生产单可上查销售单、下查打印任务；打印单可一键上查来源生产工单与销售源单—— *[代码来源: `Pages/UDI_SCD_List.cs` line 750~850, `Pages/UDI_DY_List.cs` line 620~710]*；  
> 5. **拆装箱总件数严格守恒**：拆解单品自动同步入库单散件台账，禁止生成虚假单据；在库外箱严禁装入无在库库存单品—— *[代码来源: `Pages/UDI_GLCX_Add.cs` line 310~380]*。

---

## 真实系统功能菜单与 SOP 业务规程全景图

| 顶部导航栏 (一级大类) | 左侧导航栏·二级分组 | 左侧导航栏·三级功能 | 对应系统功能窗体 | 对应 SOP 规程编号与代码支撑 |
| :--- | :--- | :--- | :--- | :--- |
| **DI管理** | **其他** | **DI库（生成）** | `Pages/DI_SC_List.cs` | `SOP-DI-01` (`di` 主数据建档/申报) |
| | **其他** | **DI生成** | `Pages/DI_SC.cs` | `SOP-DI-01-A` (DI 录入表单) |
| | **国内** | **DI库（国内）** | `Pages/DI_ALL.cs` | `SOP-DI-07` (药监局镜像查询) |
| | **国外** | **DI库（欧盟）** | `Pages/DI_EU_List.cs` | `SOP-DI-06` (欧盟 EUDAMED) |
| **UDI管理** | **生产管理** | **生产单列表** | `Pages/UDI_SCD_List.cs` | `SOP-PROD-01` (`UDI_SCD` 排产与上下推) |
| | **打印管理** | **打印列表** | `Pages/UDI_DY_List.cs` | `SOP-PROD-04` (`UDI_DY` 赋码与打印) |
| | **打印管理** | **重打印列表** | `Pages/UDI_CDY_List.cs` | `SOP-PROD-06` (`UDI_CDY` 受控补打) |
| | **打印管理** | **标签设计** | `Pages/UDI_Template_List.cs`| `SOP-PROD-03` (标签模板设计) |
| | **打印管理** | **报表设计** | `Pages/UDI_Report_List.cs` | `SOP-PROD-07` (报表模板设计) |
| | **质量检验** | **UDI首检** | `Pages/UDI_SJ_List.cs` | `SOP-QA-01` (`UDI_SJ` 首件放行解锁) |
| | **质量检验** | **UDI抽检** | `Pages/UDI_CJ_List.cs` | `SOP-QA-02` (过程抽样检验) |
| | **质量检验** | **UDI质检** | `Pages/UDI_ZJ_List.cs` | `SOP-QA-03` (视觉评定与质检) |
| | **包装管理** | **包装关联** | `Pages/UDI_BZGL.cs` | `SOP-PKG-01` (预印码包装扫码关联) |
| | **包装管理** | **扫码关联** | `Pages/UDI_SMGL.cs` | `SOP-PKG-02` (产线装箱自动封箱) |
| | **包装管理** | **关联查询** | `Pages/UDI_GLCX_List.cs` | `SOP-PKG-03` (母子拓扑拆装箱维护) |
| | **销售管理** | **销售单管理** | `Pages/UDI_XSD_List.cs` | `SOP-SD-01` (`UDI_XSD` 销售订单管理) |
| **仓库管理** | **入库管理** | *(直属二级)* | `Pages/CK_IN_List.cs` | `SOP-WMS-01` (`CK_IN` 产成品扫码入库) |
| | **出库管理** | *(直属二级)* | `Pages/CK_OUT_List.cs` | `SOP-WMS-02` (`CK_OUT` 销售出库 FIFO) |
| | **库存查询** | *(直属二级)* | `Pages/CK_ALL.cs` | `SOP-WMS-04` (实时库存单码台账) |
| | **仓库管理** | *(直属二级)* | `Pages/CK_WH_List.cs` | `SOP-WMS-05` (仓库货位基础档案) |
| **UDI追溯** | *(一级直达)* | *(一级直达)* | `Pages/UDI_ZS.cs` | `SOP-SD-03` (全生命周期全景追溯) |
| **药品管理** | **其他** | **药品库（生成）** | `Pages/DTC_YP_List.cs` | `SOP-DTC-01` (药品主数据建档) |
| | **国内** | **药品库（国内）** | `Pages/DTC_ALL.cs` | `SOP-DTC-06` (国家药品主档镜像) |
| **DTC管理** | **销售管理** | **药品销售** | `Pages/DTC_XSD_List.cs` | `SOP-DTC-07` (`DTC_XSD` 药品销售) |
| | **生产管理** | **药品生产** | `Pages/DTC_SCD_List.cs` | `SOP-DTC-02` (`DTC_SCD` 药品工单) |
| | **打印管理** | **药品打印** | `Pages/DTC_DY_List.cs` | `SOP-DTC-02-A` (`DTC_DY` 追溯码打印) |
| | **质量检验** | **药品首检** | `Pages/DTC_SJ_List.cs` | `SOP-DTC-09` (`DTC_SJ` 药品首检) |
| | **质量检验** | **药品抽检** | `Pages/DTC_CJ_List.cs` | `SOP-DTC-10` (`DTC_CJ` 药品抽检) |
| | **包装管理** | **药品包装关联** | `Pages/DTC_BZGL.cs` | `SOP-DTC-03` (药品包装扫码关联) |
| | **包装管理** | **药品关联查询** | `Pages/DTC_GLCX_List.cs`| `SOP-DTC-03-A` (药品包装拆解维护) |
| | **追溯查询** | **药品追溯** | `Pages/DTC_ZS.cs` | `SOP-DTC-11` (药品20位追溯码查询) |
| **药品仓库** | **药品入库** | *(直属二级)* | `Pages/DTC_CK_IN_List.cs`| `SOP-DTC-04` (药品 GSP 专库入库) |
| | **药品出库** | *(直属二级)* | `Pages/DTC_CK_OUT_List.cs`| `SOP-DTC-04-A` (药品 GSP 扫码出库) |
| | **药品库存** | *(直属二级)* | `Pages/DTC_CK_ALL.cs` | `SOP-DTC-04-B` (药品 GSP 阴凉库存) |
| | **库位管理** | *(直属二级)* | `Pages/DTC_CK_WH_List.cs`| `SOP-DTC-04-C` (药品仓库货位档案) |
| **ERP** | **生产订单** | *(直属二级)* | `Pages/ERP_SCDD.cs` | `SOP-ERP-01` (金蝶生产订单下推) |
| | **生产领料单** | *(直属二级)* | `Pages/ERP_SCLLD.cs` | `SOP-ERP-04` (金蝶领料单核对) |
| | **生产入库单** | *(直属二级)* | `Pages/ERP_SCRKD.cs` | `SOP-ERP-03` (完工入库反写金蝶) |
| | **发货通知单** | *(直属二级)* | `Pages/ERP_FHTZD.cs` | `SOP-ERP-02` (金蝶发货通知单导入) |
| | **销售出库单** | *(直属二级)* | `Pages/ERP_XSCKD.cs` | `SOP-ERP-03-A` (销售出库反写金蝶) |

---

## 全系统单据编号（gencode）标准命名规范与发号规则表

系统严格基于 `gencode` 序列引擎与 `GenCodeHelper.GenSerialCode(id, true)` 统一发号，所有业务单据号均由 **【业务前缀】+【8位日期 yyyyMMdd】+【5位自增序号】** 组成（*[代码来源: `Core/GenCodeHelper.cs` line 25~60]*）：

| 规则ID | 单据业务类型 | 标准单据前缀 | 日期格式 | 序号位数 | 标准单据号示例 | 代码实现窗体 | 对应数据库主表 / 明细表 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`101`** | **医疗器械生产任务单** | **`SCRWD`** | `yyyyMMdd` | 5位 | **`SCRWD2026090200001`** | `Pages/UDI_SCD.cs` (line 1184) | `udi_scd` / `udi_scd_detail` |
| **`102`** | **医疗器械打印任务单** | **`DYRWD`** | `yyyyMMdd` | 5位 | **`DYRWD2026090200001`** | `Pages/UDI_DY.cs` (line 96, 274) | `udi_dy` / `udi_dy_detail` |
| **`103`** | **生产入库单** | **`SCRKD`** | `yyyyMMdd` | 5位 | **`SCRKD2026090200001`** | `Pages/CK_IN.cs` (line 1915, 2028) | `ck_inout` (type=1) / `ck_inout_detail` |
| **`104`** | **退货入库单** | **`THRKD`** | `yyyyMMdd` | 5位 | **`THRKD2026090200001`** | `Pages/CK_IN.cs` (GetGencodeId) | `ck_inout` (type=1) / `ck_inout_detail` |
| **`115`** | **医疗器械销售订单** | **`XSDD`** | `yyyyMMdd` | 5位 | **`XSDD2026090200001`** | `Pages/UDI_XSD.cs` (line 61, 260) | `udi_xsd` / `udi_xsd_detail` |
| **`203`** | **普通销售出库单** | **`PTCKD`** | `yyyyMMdd` | 5位 | **`PTCKD2026090200001`** | `Pages/CK_OUT.cs` (GetGencodeId) | `ck_inout` (type=2) / `ck_inout_detail` |
| **`204`** | **生产领料出库单** | **`SCLL`** | `yyyyMMdd` | 5位 | **`SCLL2026090200001`** | `Pages/CK_OUT.cs` (GetGencodeId) | `ck_inout` (type=2) / `ck_inout_detail` |
| **`205`** | **退货出库单** | **`THCKD`** | `yyyyMMdd` | 5位 | **`THCKD2026090200001`** | `Pages/CK_OUT.cs` (GetGencodeId) | `ck_inout` (type=2) / `ck_inout_detail` |
| **`501`** | **药品生产任务单** | **`DSCRW`** | `yyyyMMdd` | 5位 | **`DSCRW2026090200001`** | `Pages/DTC_SCD.cs` (line 1270) | `dtc_scd` / `dtc_scd_detail` |
| **`502`** | **药品打印任务单** | **`DDYRW`** | `yyyyMMdd` | 5位 | **`DTC_DY.cs`** | `dtc_dy` / `dtc_dy_detail` |
| **`515`** | **药品销售订单** | **`DXSDD`** | `yyyyMMdd` | 5位 | **`DXSDD2026090200001`** | `Pages/DTC_XSD.cs` (line 255) | `dtc_xsd` / `dtc_xsd_detail` |
| **`601`** | **药品入库单** | **`DRK`** | `yyyyMMdd` | 5位 | **`DRK2026090200001`** | `Pages/DTC_CK_IN.cs` | `dtc_ck_inout` / `dtc_ck_inout_detail` |
| **`602`** | **药品出库单** | **`DCK`** | `yyyyMMdd` | 5位 | **`DCK2026090200001`** | `Pages/DTC_CK_OUT.cs` | `dtc_ck_inout` / `dtc_ck_inout_detail` |

---

## 全系统核心业务单据建单流程、参数加载与校验规则全矩阵 (代码级精确实证)

### 1. 医疗器械生产任务工单 (SCD)
* **对应操作窗体**：`Pages/UDI_SCD.cs`（列表页：`Pages/UDI_SCD_List.cs`）
* **存储数据表**：主表 `udi_scd` | 明细表 `udi_scd_detail` | 审计表 `udi_scd_review`
* **单号规则**：`GenCodeHelper.GenSerialCode("101", true)` ➔ **`SCRWD` + 8位日期 + 5位流水号**（*[代码来源: `UDI_SCD.cs` line 1184]*）
* **单据头 (Header) 参数加载规范**（*[代码来源: `UDI_SCD.cs` line 1182~1202]*）：
  * `scd_djbh`：系统标准 `SCRWD...`；
  * `scd_djlx`：单据类型，界面默认下拉项为 `"普通生产"`；
  * `scd_sczz`：生产组织，必须自动绑定企业名称 `GlobalConfig.CompanyName`；
  * `scd_sccj`：生产车间，界面默认下拉项为 `"生产车间1"`；
  * `scd_djrq`：制单日期，格式 `yyyy-MM-dd`；
  * `scd_djzt`：单据状态，新建保存固定为 `"待审核"`（待车间主管审核）；
  * `scd_ywzt`：业务状态，新建保存固定为 `"未下推"`；
  * `customer`：客户名称，若手工建单或由销售单下推，绑定对应客户名称；
  * `scd_createtime` / `scd_createperson`：实名制记录创建时间与创建人。
* **单据明细 (Detail) 参数联动与计算公式**（*[代码来源: `UDI_SCD.cs` line 260~280 & line 1204~1215]*）：
  * `scd_detail_di`：从 `di` 主数据表精准匹配 `ZXXSDYCPBS`；
  * `scd_detail_wlbm`：从 `di.CPHHHBH` 带出物料货号（缺省填DI）；
  * `scd_detail_cpmc`：从 `di.CPMCTYMC` 主档字段联动带出；
  * `scd_detail_ggxh`：从 `di.GGXH` 主档字段联动带出；
  * `scd_detail_bzdj`：包装层级名称（如 `"最小销售单元"`、`"中包"`、`"箱"`）；
  * `scd_detail_scsl`：生产计划数量（正整数）；
  * `scd_detail_ph`：生产批号（按当日批号规范生成 `yyyyMMdd01` 或指定）；
  * `scd_detail_scrq`：生产日期，格式 `yyyy-MM-dd`；
  * `scd_detail_bzq`：**保质期月数**（整型月数，如 `24` 或 `36`，从历史工单或 DI 属性继承）；
  * `scd_detail_sxrq`：**失效日期严格公式：`scrq.AddMonths(bzq).AddDays(-1)`**（*[代码来源: `UDI_SCD.cs` line 271]*）；
  * **管控开关**：`scd_detail_isxlh="1"`（启用序列号）, `scd_detail_isscrq="1"`（启用生产日期）, `scd_detail_isph="1"`（启用批号）, `scd_detail_issxrq="1"`（启用失效日期）, `scd_detail_ismjrq="0"`, `scd_detail_ismjph="0"`。

---

### 2. 医疗器械销售订单 (XSD)
* **对应操作窗体**：`Pages/UDI_XSD.cs`（列表页：`Pages/UDI_XSD_List.cs`）
* **存储数据表**：主表 `udi_xsd` | 明细表 `udi_xsd_detail` | 审计表 `udi_xsd_review`
* **单号规则**：`GenCodeHelper.GenSerialCode("115", true)` ➔ **`XSDD` + 8位日期 + 5位流水号**（*[代码来源: `UDI_XSD.cs` line 61, 260]*）
* **单据头 (Header) 参数加载规范**（*[代码来源: `UDI_XSD.cs` line 278~290]*）：
  * `xsd_djbh`：系统标准 `XSDD...`；
  * `xsd_khmc`：**必填**，必须从系统客户主档表（`cer_customer`）中选择；
  * `xsd_djrq`：订单日期，格式 `yyyy-MM-dd`；
  * `xsd_djzt`：单据状态，新建保存固定为 `"0"`（未审核）；
  * `xsd_ywzt`：业务状态，新建保存固定为 `"未下推"`；
  * `xsd_bz`：订单备注。
* **单据明细 (Detail) 参数加载规范**（*[代码来源: `UDI_XSD.cs` line 292~304]*）：
  * `xsd_detail_wlbm`：产品 DI 编码；
  * `xsd_detail_cpmc`：产品通用名称；
  * `xsd_detail_ggxh`：规格型号；
  * `xsd_detail_sl`：销售下单数量（必须 > 0）；
  * `xsd_detail_bzdj`：订货包装层级；
  * `xsd_detail_dw`：计量单位（件/盒/箱）。

---

### 3. 医疗器械打印任务单 (DY)
* **对应操作窗体**：`Pages/UDI_DY.cs`（列表页：`Pages/UDI_DY_List.cs`）
* **存储数据表**：主表 `udi_dy` | 明细表 `udi_dy_detail`
* **单号规则**：`GenCodeHelper.GenSerialCode("102", true)` ➔ **`DYRWD` + 8位日期 + 5位流水号**（*[代码来源: `UDI_DY.cs` line 96, 274]*）
* **参数加载规范**（*[代码来源: `UDI_DY.cs` line 270~310]*）：
  * `udi_dy_scdh`：来源生产任务单号（`SCRWD...`）；
  * `udi_dy_rwdh`：标准打印任务单号（`DYRWD...`）；
  * `udi_dy_di` / `cpmc` / `ggxh` / `ph` / `scrq` / `sxrq`：从来源生产工单明细行完整继承；
  * `udi_dy_sl`：打印任务量（若多级包装按比例折算）；
  * `udi_dy_djzt`：初始固定为 `"0"`（未首检）；
  * `udi_dy_ywzt`：初始固定为 `"未首检"`；
  * **质量强管控红线**：**未首检合格放行前，批量打印按钮置灰强锁定（`Enabled = false`）**（*[代码来源: `UDI_DY.cs` line 110~130]*）。

---

### 4. 产成品扫码入库单 (CK_IN)
* **对应操作窗体**：`Pages/CK_IN.cs`（列表页：`Pages/CK_IN_List.cs`）
* **存储数据表**：主表 `ck_inout`（`type = "1"`） | 明细表 `ck_inout_detail` | 实物扫码表 `ck_inout_record`
* **单号规则**：生产入库 `103` ➔ **`SCRKD...`**；退货入库 `104` ➔ **`THRKD...`**（*[代码来源: `CK_IN.cs` line 1915, 2028]*）
* **参数加载规范**（*[代码来源: `CK_IN.cs` line 2253~2272]*）：
  * `crkdh`：标准入库单号；
  * `type`：`"1"`（入库）；
  * `typename`：`"生产入库"` / `"退货入库"` / `"普通入库"`；
  * `scdh`：关联来源生产工单号（`SCRWD...`）；
  * `status`：**初始状态固定为 `"未审核"`**（点击【保存】后为 `"未审核"`，点击【审核】后变为 `"已审核"` 并正式结存入账）；
  * **扫码明细表 (`ck_inout_record`)**：记录实物扫码条码 `udi`、`udi_di`、批号 `udi_10`、失效日期 `udi_17`、序列号 `udi_21` 与状态 `status="1"`（在库）。

---

### 5. 销售发货扫码出库单 (CK_OUT)
* **对应操作窗体**：`Pages/CK_OUT.cs`（列表页：`Pages/CK_OUT_List.cs`）
* **存储数据表**：主表 `ck_inout`（`type = "2"`） | 明细表 `ck_inout_detail` | 实物扫码表 `ck_inout_record`
* **单号规则**：普通销售出库 `203` ➔ **`PTCKD...`**；生产领料 `204` ➔ **`SCLL...`**；退货出库 `205` ➔ **`THCKD...`**
* **参数加载规范**（*[代码来源: `CK_OUT.cs` line 2080~2091]*）：
  * `crkdh`：标准出库单号；
  * `type`：`"2"`（出库）；
  * `typename`：`"普通出库"` / `"生产领料"` / `"销售出库"`；
  * `customer`：必须匹配销售客户名称；
  * `status`：**初始状态固定为 `"未审核"`**（点击【保存】后为 `"未审核"`，点击【审核】后变为 `"已审核"` 并核销在库库存）；
  * **出库防错红线**：出库扫码阶段严格执行 **FIFO / FEFO（先失效先出）** 智能拦截。

---

### 6. 药品生产工单 (DTC_SCD)
* **对应操作窗体**：`Pages/DTC_SCD.cs`（列表页：`Pages/DTC_SCD_List.cs`）
* **存储数据表**：主表 `dtc_scd` | 明细表 `dtc_scd_detail`
* **单号规则**：`GenCodeHelper.GenSerialCode("501", true)` ➔ **`DSCRW` + 8位日期 + 5位流水号**（*[代码来源: `DTC_SCD.cs` line 1270]*）
* **参数加载规范**（*[代码来源: `DTC_SCD.cs` line 1281~1302]*）：
  * `bill_code`：标准单号；
  * `bill_type`：`"普通生产"`；
  * `bill_status`：`"待审核"`（审核后为 `"已审核"`）；
  * `biz_status`：`"未下推"`；
  * `sub_type_no`：10位国家药品子类编码；
  * `physic_name`：药品通用名称；
  * `prepn_spec`：制剂规格；
  * `package_spec`：包装规格；
  * `produce_quantity`：计划生产数量；
  * `mfg_date`：生产日期；
  * `exp_date`：失效日期。

---

### 7. 药品销售订单 (DTC_XSD)
* **对应操作窗体**：`Pages/DTC_XSD.cs`（列表页：`Pages/DTC_XSD_List.cs`）
* **存储数据表**：主表 `dtc_xsd` | 明细表 `dtc_xsd_detail`
* **单号规则**：`GenCodeHelper.GenSerialCode("515", true)` ➔ **`DXSDD` + 8位日期 + 5位流水号**（*[代码来源: `DTC_XSD.cs` line 255]*）
* **参数加载规范**（*[代码来源: `DTC_XSD.cs` line 271~286]*）：
  * `bill_code`：标准单号；
  * `customer_name`：客户名称；
  * `bill_status`：`"0"`（未审核，审核后为 `"1"`）；
  * `biz_status`：`"待执行"`；
  * 明细包含 `sub_type_no`、`physic_name`、`sale_quantity`。

---

### 8. 药品追溯码打印任务单 (DTC_DY)
* **对应操作窗体**：`Pages/DTC_DY.cs`（列表页：`Pages/DTC_DY_List.cs`）
* **存储数据表**：主表 `dtc_dy` | 明细表 `dtc_dy_detail`
* **单号规则**：`GenCodeHelper.GenSerialCode("502", true)` ➔ **`DDYRW` + 8位日期 + 5位流水号**
* **参数加载规范**：
  * `task_code`：标准打印任务号；
  * `scd_bill_code`：来源药品生产单号（`DSCRW...`）；
  * `task_status`：`"0"`（待打印/待首检）；
  * 包含 20 位国家药品追溯码（大写英文+数字）的发号与赋码生成。

---

## 附录：全系统核心单据必填项校验与上下推路由总对照表 (代码精确版)

| 业务单据名称 | 核心必填项清单 (界面红框强校验) | 单据保存原生初始状态 | 上游来源 (上查) | 下游去向 (下推) | 下推前提硬性校验条件 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DI 主数据** | 最小销售单元DI、通用名、规格、编码体系、器械类别、注册证号、企业名称、分类编码、灭菌方式(灭菌为是时) | 保存即生效 (`di` 表) | 无 | CUDID申报 / 生产工单 | 41 项法定主档属性校验通过 |
| **销售订单 (XSD)** | 客户名称、单据日期、表体DI、规格、销售数量(>0)、单位 | `xsd_djzt = "0"`<br/>`xsd_ywzt = "未下推"` | 客户商业合同 | **生产工单 (SCD)** | 销售单必须【已审核】(`xsd_djzt == "1"`)、未关闭、明细未曾下推 |
| **生产工单 (SCD)** | 生产车间、单据日期、表体DI、规格、生产数量(>0)、批号、生产日期、保质期月数、失效日期、序列号开关 | `scd_djzt = "待审核"`<br/>`scd_ywzt = "未下推"` | **销售订单 (XSD)**<br/>*(上查明细)* | **打印任务 (DY)**<br/>*(下推并折算多级包装)*| 生产单必须【已审核】(`scd_djzt == "已审核"`)、未关闭、未曾下推；多级包装须弹窗确认层级 |
| **打印任务 (DY)** | 打印模板 (未选模板禁止保存)、打印数量(>0)、流水号模式 | 保存入库 (`udi_dy_djzt = "0"`) | **生产工单 (SCD)**<br/>*(上查工单及销售客商)* | **首检放行 (SJ)** ➔ 批量赋码打印 | **必须通过首检合格放行** (`udi_dy_ywzt == "已首检"`) 才能解锁批量打印按钮 |
| **首检记录 (SJ)** | 打印任务单号、首检实扫条码、条码比对结论、外观质量、包材质量 | 质检保存 | **打印任务 (DY)** | 解锁打印单批量打印 | 扫描实物条码与工单参数 100% 吻合，联动更新 `udi_dy_ywzt="已首检"` |
| **成品入库 (CK_IN)**| 入库类型、目标仓库、目标货位、入库条码、入库数量 | `status = "未审核"` | 生产装箱完工箱码 | 库存单码台账 (`ck_inout_record`) | 条码有效且在库总件数严格守恒，审核后变更为 `"已审核"` |
| **销售出库 (CK_OUT)**| 出库类型、购货客户、出库产品条码、出库数量 | `status = "未审核"` | 客户销售订单 / 包装箱码 | 客户物流 / 追溯台账 | 必须为在库状态，通过 FIFO 先进先出拦截，审核后变更为 `"已审核"` |
| **药品生产 (DTC_SCD)**| 车间、单据日期、药品码、规格、包装、计划生产量(>0) | `bill_status = "待审核"`<br/>`biz_status = "未下推"`| 药品销售合同 | **药品打印 (DTC_DY)** | 药品工单必须为【已审核】(`bill_status == "已审核"`) |
| **药品销售 (DTC_XSD)**| 客户名称、单据日期、药品码、计划销售量(>0) | `bill_status = "0"`<br/>`biz_status = "待执行"` | 商业采购合同 | 药品生产工单 | 药品销售单必须为【已审核】(`bill_status == "1"`) |
| **药品打印 (DTC_DY)**| 打印模板、生产数量、药品20位追溯码发号 | `task_status = "0"` | **药品工单 (DTC_SCD)**<br/>*(上查来源药品工单)*| 药品赋码首检 ➔ 批量打印 | 必须首检合格方可出标 |
