# UmiUDI 更新日志

所有重要版本的变更都将记录在此文档中，分为 **生产环境（业务与功能摘要）** 与 **开发环境（技术与变更详情）**。

---

## [1.0.0.17] - 2026-08-31

### 生产环境（业务与功能）
1. 【关联查询】修复关联查询中无父级节点时的加载异常，提升树形层级加载稳定性。
2. 【包装拆解】PDA 端包装解绑拆分为“移出包装”与“整包拆解”，避免误操作，业务流转更清晰。
3. 【包装装入】优化包装装入业务流程，支持扫码快速添加子包装与单品。
4. 【首页看板】首页注意事项右侧新增版本更新记录看板，自适应满屏展示。

### 开发环境（技术与构建）
- fix(glcx): 修复关联查询中无父级节点时 ToDictionary 抛出 ArgumentNullException 问题 (`UDI_GLCX2.cs`, `DTC_GLCX2.cs`)
- feat(pda): 后端 API 新增 `POST /package/removeFromParent` 和 `POST /package/unpackContents` 接口 (`IPackageService.cs`, `PackageService.cs`, `PackageController.cs`)
- feat(ui): PDA 前端拆分包装解除操作按钮，更新为“移出包装”与“整包拆解”独立确认模态框 (`searchpackage/index.vue`)
- feat(home): 首页 Notes 区域分栏重构，新增 `panel_changelog` 异步更新日志解析器 (`HomePage.cs`, `HomePage.Designer.cs`)

---

## [1.0.0.16] - 2026-08-29

### 生产环境（业务与功能）
1. 【系统性能】优化客户端本地组件加载机制，提升页面响应与启动速度。

### 开发环境（技术与构建）
- fix(ci): pull --rebase before changelog push to avoid rejected push in CI
- fix(ci): replace DevExpress NuGet refs with local libs/ DLL refs to avoid version mismatch in CI

---

## [1.0.0.15] - 2026-08-28

### 生产环境（业务与功能）
1. 【包装管理】包装关联关系支持散件独立登记至入库单明细。
2. 【数据同步】增强多级包装与出入库记录的自动关联与动态汇总机制。

### 开发环境（技术与构建）
- feat(glcx): 增加 `EnsureChildInInboundRecord` 与 `RemoveFromInboundRecordWhenPacked` 机制
- refactor(inout): 优化 `ck_inout_record` 中 `udi_parent` 同步逻辑

---

## [1.0.0.14] - 2026-05-21

### 生产环境（业务与功能）
1. 【智能质检】新增条码防伪与防重码自动校验，合规检测更智能。
2. 【质量报告】PDF 物理质量报告深度升级，支持打印 ISO 15415 规范评级指标与三级审核签字。
3. 【设备授权】支持管理员一键清空和重置授权设备，更换终端更便捷。
4. 【质检历史】统一质检历史列表的分页规格，页面响应速度全面提升。
5. 【版本提示】升级成功后首次启动弹出更新亮点说明，直观了解最新功能。

### 开发环境（技术与构建）
- fix: trim ~314MB unused Halcon runtime DLLs and include CameraWorkerApp in publish output
  - Remove Halcon XL variants (~154MB), HDevelop engine (~55MB), Qt WebEngine (~94MB), AI/visualization components (~11MB)
  - Keep only core Halcon runtime: halcon.dll, halcondl.dll, halconcpp.dll, halconc.dll + MindVision camera driver + essential Qt5
  - Add CameraWorker build step in release.yml to deploy CameraWorkerApp/ into bin/publish/ for installer and incremental updates
- fix(installer): add UninstallDelete section to cleanly delete all runtime residual files during uninstallation
- fix(update): increase HttpClient timeout to 30 minutes to support downloading large DLLs
- fix(changelog): prevent git workflow encoding corruption by using UTF-8 explicitly in PowerShell Get-Content
- **质检列表分页规格一致性**：修正了质检历史列表页（UDI_ZJ_List）的分页规格，将其 PageSize 统一设置为 50 条，并配置 PageSizeOptions 支持 50、100、200、500、1000、2000 条的分页规格，并增加 `filterManager` 初始化判空保护，完美根治值改变事件提前触发引发的 `NullReferenceException` 闪退异常，确保与系统中其他所有列表页的分页体验完全一致。
- **Gitee 增量更新超大文件下载限制绕过**：针对国内大厂部署环境中，由于 Gitee 限制匿名用户下载 > 1MB 的超大原始文件（报错 403 Forbidden，导致 `DevExpress.Spreadsheet.v24.1.Core.dll` 等核心动态库增量更新中断）的底层问题，对 `update.json` 内的超大文件下载 URL 规则进行了全面重构，转换为通过国内高速 GitHub Proxy CDN 代理拉取，并在 C# 客户端增量更新引擎（`Mian.cs`）中注入自动容灾备用下载降级逻辑，实现 100% 自动绕过网络壁垒，彻底打通国内用户的在线安全更新通道。
- **Gitee 同步稳定性与流水线增强**：重写 GitHub Actions 发布流水线逻辑，解耦 GitHub 和 Gitee 同步步骤，为克隆和推送环节注入双重 5次重试与退避休眠机制，并彻底移除在长传输大文件时会导致 Connection Reset 阻断的 `postBuffer` 限制，保障国内发布通道的极端稳定性。

#### 新增
- **资源限额管理**：在公司模型中引入 `max_accounts` 和 `max_devices` 字段，支持动态配置每个公司的账号和设备上限。
- **全自动激活逻辑**：登录时自动根据公司授权日期通过注册表激活软件，实现无感授权。
- **多维度限额追踪**：在管理弹窗中实时显示 `已用账号数` 和 `已用设备数`，并支持超额颜色预警（变红）。
- **一键清空设备**：在公司管理弹窗中增加“一键清空已授权设备”功能，解决用户更换设备后的授权重置问题。
- **自定义更新引擎**：重构更新逻辑，全面转向“公司配置驱动”。支持为不同公司配置私有更新源，且仅在配置了地址时开启更新检查，增强了私有化部署的灵活性与安全性。
- **UDI质检 - 码制与编码体系自动校验**：新增对识别码制（如 GS1-128、DataMatrix、EAN-13）及编码体系（如 GS1）的自动分析与合规性检验业务逻辑，补全了质检校验底层的核心板块。
- **UDI质检 - 双击穿透跳转**：支持双击质检历史记录列表行，无缝打开并穿透跳转至对应的“UDI质检- 详情”选项卡页面，显著提升操作连贯性。
- **DevExpress 中文汉化包自动部署**：在 `UmiUDI.csproj` 中内置了 `libs\zh-Hans\` 附属程序集的编译链接与自动部署规则。解决在没有系统安装 DevExpress 时，**报表设计 (UDI_BBSJ)** 与 **标签设计 (UDI_BQSJ)** 依然退回英文界面的问题，确保客户部署环境完美汉化。
- **ISO 15415 印刷质量 PDF 报告深度升级**：
  - **8大指标完美对应**：将此前遗漏的 **反射率容限 (Reflectance Margin - RM)** 接入 PDF 导出，实现与软件前端质检页完全一致的 8 项物理评级展示。
  - **诊断参数科学呈现**：新增“二、 诊断数据与测试参数”核心光学网格，完美体现测试波长（660nm）、测量孔径（08 mil）、单元尺寸（X-Dimension）、全局二值化阈值（Global Threshold）、最值反射率等底层光学测试指标，满足大厂供应链及进货查验记录追溯标准。
  - **三级审核签字网格**：预留“检测人 (Tested by)”、“审核人 (Reviewed by)”、“批准人 (Approved by)”签字横线栏，完美对接药监局 GMP 规范及第三方检测机构（中国物品编码中心、SGS、TÜV）的审计追溯流程。
- **质量管理与合规培训文档编写**：
  - 新增《[质量管理（QCQA）培训材料 - 内部.md](file:///e:/backup/UmiUDI&Drug/UmiUDI&Drug_1.0.0.0/docs/质量管理（QCQA）培训材料 - 内部.md)》，为现场技术人员提供 ISO/IEC 15415 物理含义、木桶最低分定律、三级签字机制及设备现场调校实操排查要领。

#### 优化与抛光
- **公司管理交互重构**：将“公司管理”页面由表格内编辑升级为 **Modal (弹窗)** 驱动模式，支持双击行编辑。
- **界面布局优化**：弹窗表单采用 5x2 矩阵布局，并针对长连接字符串优化了列宽显示。
- **增量更新机制优化**：扫描清单时排除了 `.config` 文件，防止版本升级覆盖用户的本地个性化配置。
- **质检详情选项卡更名**：将质检详情页 Tab 名称优化并确立为更明确的 `UDI质检- 详情`。
- **表格列宽及结构重构**：
  - 移除了冗余的“序号列”，为表格内容释放更多空间。
  - 精确限制了首列多选框 (Checkbox) 的列宽，防止分配过宽。
  - 调换了“状态”列与“检测结果”列的位置，更贴合国内业务阅读和审计直觉。
  - 将表格表头高度调整为与质量评级表头完全等高，实现视觉结构统一。
- **异常警示与视觉回馈**：
  - 将所有“不合规”异常质检记录行的背景色高亮标红，突出显示待整改数据。
  - 优化综合等级判定图标，在综合评级不合格时正确呈现 Error 红色错误状态，而非先前的 Success 成功状态。
  - 修复进度条警告色逻辑，当有部分指标触发降级警告（如 A/C 警告评级）时正确呈现黄色/警告色，严重不合格时显示失败红色。
  - 修复了可能出现的 `-100%` 进度溢出 Bug，并为法规检索结果为空时补全了合理的缺省提示说明。
- **PDF 报告版面与高度重排**：精细控制 Y 轴高度占比，将所有新增图表、签字区和页脚高度精简限制在 A4 打印尺寸内，完美实现一页无溢出高保真打印，杜绝了生成空白尾页的排版缺陷。

#### 修复
- **更新提醒逻辑漏洞**：彻底修复了在未配置公司更新地址的情况下，主界面右上角仍会错误亮起更新按钮的问题（优化了 Login 状态同步与 Mian 界面显示校验）。
- **自动更新逻辑清理**：移除了登录界面中冗余的自动更新弹窗，并清理/优化了软件启动逻辑，提供更流畅的启动体验。
- **表格全选删除逻辑漏洞**：彻底修复了在勾选表格头部“全选” Checkbox 后点击删除，依然错误弹出“请至少选择一条记录”警告的问题，实现了顺畅的批量删除。
- **打印设置持久化**：解决打印机名称保存后重启软件变回默认值的问题（移除了主程序中的强制重置逻辑）。
- **自动加载补全**：补全了喷码IP (JetIP) 和扫码波特率在软件启动时的自动加载逻辑。
- **模型主键支持**：为 `cer_company` 补全了 SqlSugar 主键特性，解决了无法保存更新的问题。
- **UI 库兼容性**：修正了 AntdUI 部分控件属性名错误导致的编译失败问题。

---

## [1.0.0.12] - 2026-04-30

### 生产环境（业务与功能）
1. 【打印单据】修复 UDI 与 DTC 打印页面下推生产单时的单号自动递增逻辑。
2. 【审计追溯】修正审计日志动作标签（由“下推”改为“首检”/“抽检”），提升审计追溯记录的准确性。
3. 【界面优化】将打印页面保质期输入框的后缀单位统一修正为“月”。

### 开发环境（技术与构建）
#### 修复
- 修复了 UDI 打印页面下推生产单时由于序列号计数器未递增导致的打印单号重复问题。
- 修复了 DTC 打印页面下推逻辑中的相同单号重复漏洞。
- 修正了 UDI 首检 and 抽检审计日志中的动作标签（由“下推”改为“首检”/“抽检”）。

#### 优化
- 完善了审计日志的元数据映射，增加了 `udi_dy_ditype` 字段。
- UI 优化：将打印页面保质期输入框的后缀单位由“年”修正为“月”。
- 部署优化：汉化了发布流程，建立了 Git Tag 规范。
- 部署优化：移除增量更新时的调试信息弹窗，实现无感更新。

---

## [1.0.0.10] - 2026-04-30

### 生产环境（业务与功能）
1. 【系统发布】UmiUDI 医疗器械唯一标识追溯与质检管理系统正式发布。

### 开发环境（技术与构建）
- 部署: v1.0.0.10 - 重新发布以建立增量更新的基线版本。

---

## 运维与发布流程

为了确保版本一致性与更新引擎的稳定性，发布新版本时请遵循以下流程：

### 1. 版本号同步 (Mandatory)
每次发布前，必须在以下文件中同步更新版本号：
- **程序集版本**: `Properties/AssemblyInfo.cs` 中的 `AssemblyVersion` 和 `AssemblyFileVersion`。
- **安装脚本**: `UmiUDI.iss` 中的 `#define MyAppVersion` 及 `VersionInfoVersion`。
- **更新日志**: `docs/CHANGELOG.md` 中新增对应的版本条目。

### 2. 自动化发布 (CI/CD)
- **同步分支**: `git push origin master --force` (确保远程代码与本地一致)。
- **触发方式**: `git tag -d v1.0.0.14 ; git push origin :refs/tags/v1.0.0.14 ; git tag v1.0.0.14 ; git push origin v1.0.0.14 --force` (推送符合 `v*` 格式的 Tag 触发自动化构建)。
- **流程说明**: GitHub Actions 会自动执行构建、打包，并生成发布产物。

### 3. 更新引擎配置流程 (Multi-tenant Update)
本系统采用**公司配置驱动**的增量更新机制，运维步骤如下：
1. **部署产物**: 将构建生成的 `bin/publish` 目录下的文件及 `update.json` 部署至远程服务器（如 Gitee Raw 或 私有 CDN）。
2. **地址分配**: 
   - 登录系统进入“公司管理”页面。
   - 双击目标公司，在“更新地址”字段中填入远程 `update.json` 的原始 URL。
3. **生效验证**: 客户端重启后将自动检测该地址。若地址为空，则该公司的客户端不会触发任何更新检查。
