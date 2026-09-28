# Actuarial Python Lab: Bridging the Gap Between Risk Theory and Software Engineering

> 开源仓库：https://github.com/kongkip/actuarial-python-lab （MIT License）
> 说明：本文件为该仓库 README 的离线快照。完整 Jupyter Notebook 代码请在可访问 GitHub 的网络下 `git clone`。

## Overview

**Actuarial Python Lab** 是一个致力于传统精算科学数字化转型的综合仓库。精算教育提供了数学与统计的严谨基础，但现代行业要求在可扩展、自动化、可复现的软件环境中实现这些模型。本仓库作为桥梁，将复杂的精算定理翻译成可用于生产的 Python 代码。每个模块遵循严格的 **理论 → 应用 → 实现** 框架。

---

## Repository Structure

项目按 10 个核心精算领域组织，覆盖传统保险及银行、健康科技、数据科学等更广泛领域：

- **01 Life Contingencies（寿险精算）**：死亡率建模、保费定价、生存分析。
- **02 General Insurance（非寿险）**：损失准备金（IBNR）、三角法、频率-严重度建模。
- **03 Finance Mathematics（金融数学）**：债券定价、收益率曲线构建、衍生品 Greeks。
- **04 Pensions（养老金/年金）**：待遇确定/缴费确定型计划的估值与资金预测。
- **05 Health Insurance（健康险）**：医疗燃烧成本分析、风险共担保费capitation模型。
- **06 Banking & Credit（银行与信用）**：信用评分、违约概率（PD）、马尔可夫迁移。
- **07 Investment & ALM（投资与资产负债管理）**：组合优化（Markowitz）、资产负债匹配。
- **08 Risk Theory（风险理论）**：蒙特卡洛破产模拟、风险价值（VaR）。
- **09 Reinsurance（再保险）**：超赔（XoL）与比例分保条约优化。
- **10 Actuarial Data Science（精算数据科学）**：GLM、机器学习可解释性（SHAP）、IFRS 17 逻辑。

---

## Module Format

每个子领域通过 **Jupyter Notebook** 文档化，结构如下：

1. **Actuarial Theory（精算理论）**：用 LaTeX 深入讲解底层数学证明与公式（如 $A_x = \sum_{k=0}^{\infty} v^{k+1} {}_k p_x q_{x+k}$）。
2. **Real-World Application（实际应用）**：业务案例分析，解释理论如何解决肯尼亚及全球金融市场的问题。
3. **Python Implementation（Python 实现）**：使用科学 Python 栈（NumPy、Pandas、SciPy）与可视化库（Matplotlib、Seaborn）的优化代码。
4. **Verification & Testing（验证与测试）**：单元测试，确保程序输出与公认的精算表与基准一致。

---

## Tech Stack

- **Language:** Python 3.x
- **Data Analysis:** Pandas, NumPy
- **Mathematical Modeling:** SciPy, Statsmodels
- **Visualization:** Matplotlib, Plotly（交互式风险仪表盘）
- **App Framework:** Streamlit（构建交互式精算计算器）

---

## Purpose of this Project

本 Lab 旨在展示独特的"混合"技能组合：

- **Precision（精确性）**：保持精算学学位的数学严谨性。
- **Automation（自动化）**：超越 Excel 的局限，进入 Python 的灵活性。
- **Insight（洞察）**：将原始数据转化为对利益相关者可操作的风险管理策略。
