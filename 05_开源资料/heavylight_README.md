# heavylight

> 开源仓库：https://github.com/lewisfogden/heavylight （MIT License）
> 说明：本文件为该仓库 README 的离线快照。完整框架代码请在可访问 GitHub 的网络下 `git clone`。

A lightweight actuarial modelling framework for Python（轻量 Python 精算建模框架）

- single script（单脚本）
- installation optional: package with your models（安装可选：与你的模型一起打包）。
- only depends on `pandas` and `numpy`（仅依赖 pandas 和 numpy）

## Components

**Model（模型）：**

- projection controller（投影控制器）
- class to subclass with your proprietary models（用你的专有模型做子类的类）
- `BeforeRun` and `AfterRun` methods
- get all values as a list with `values` attribute
- get the sum of all values with `sum()` method

**Table（表）：**

- simple long format table object（简单的长格式表对象）
- type information encoded via `|int`, `|int_bound`, `|band`, `|str` header suffixes

## Usage

### Model Class

Create your model as a subclass of `heavylight.Model`. Each model variable is defined as a method（将你的模型创建为 `heavylight.Model` 的子类，每个模型变量定义为一个方法）:

```python
import heavylight

class Annuity(heavylight.Model):
    def t(self, t):
        return t

    def expected_claim(self, t):
        return self.number_alive(t) * self.data["annuity_per_period"]

    def number_alive(self, t):
        if t == 0:
            return self.data["initial_policies"]
        else:
            return self.number_alive(t - 1) - self.deaths(t - 1)

    def deaths(self, t):
        return self.number_alive(t) * self.mortality_rate(t)

    def mortality_rate(self, t):
        return 0.02

    def v(self, t):
        """discount factor from time t to time 0"""
        if t == 0:
            return 1
        else:
            return self.v(t - 1) / (1 + self.forward_rate(t))

    def forward_rate(self, t):
        return 0.04

    def pv_expected_claim(self, t):
        return self.expected_claim(t) * self.v(t)
```

Define input data as a dictionary（将输入数据定义为字典）:

```python
policy_data = {
    "initial_policies": 10,
    "annuity_per_period": 55,
}
```

Call the model, passing in the data dictionary, with a projection length of 20（调用模型，传入数据字典，投影长度 20）:

```python
model = Annuity(data = policy_data,
                do_run = True,
                proj_len = 20,
                )
```

Get the sum of `pv_expected_claim`（获取 `pv_expected_claim` 之和）:

```python
print(model.pv_expected_claim.sum())
```

Display result as a pandas table（将结果显示为 pandas 表）:

```python
model_cashflows = model.ToDataFrame()
```

## Notes

- This package is designed for projecting actuarial variables, and calculates t=0, 1... in order.
- Actuarial models are generally highly recursive.
- If you create a method which refers to future t value (such as an NPV function) you may hit the python stack limit.
- The recommended solution is to project forward first, and then calculate T0 metrics based on the result, for example using an `npv()` function
