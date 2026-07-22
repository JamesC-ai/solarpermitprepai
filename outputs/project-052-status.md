# Project 052: SolarPermitPrepAI

状态：MVP 已实现，待部署、自定义域名和 PayPal 接入

建议正式站点：

- https://solar.pagecheckai.com

代码仓库：

- https://github.com/JamesC-ai/solarpermitprepai

## 产品

SolarPermitPrepAI 是住宅光伏 permit packet 资料预审和报价线索工具。

第一版能力：

- 浏览器本地 intake，不上传地址、屋顶照片、设备资料或 permit 信息
- 收集州、AHJ、系统容量、组件、逆变器、电池、主配电盘、屋顶类型
- 检查 site plan、roof layout、SLD inputs、cut sheets、racking、utility/meter 信息是否齐
- 自动生成 readiness summary
- 自动生成 missing item list
- 自动生成 CAD / reviewer handoff brief
- 自动生成 quote request email
- Privacy、Terms、Support 页面
- 5 个英文长尾 SEO 页面

## 仍需要用户提供

- PayPal no-code payment link，建议产品名：`SolarPermitPrepAI Permit Packet Review`，价格：`$49 USD`。

## 安全边界

- 不承诺 PE stamp。
- 不承诺 permit approval。
- 不承诺 utility interconnection approval。
- 不替代 AHJ、licensed contractor、licensed engineer 或 local-code review。
