# Hello SAGE

> 本例位于 SAGE Repo 下的 `examples/tutorials/hello_world.py`

```mermaid
graph LR
    A[HelloBatch] --> B[UpperCaseMap]
    B --> C[PrintSink]
```

## 示例解析 

作为 SAGE 的入门程序， `hello_world.py` 涵盖了 SAGE 编程所需的基本接口：

1. **配置运行环境**
2. **声明数据流入**
3. **定义数据处理逻辑**
4. **声明数据流出**
5. **提交任务**

其程序如下：

```Python linenums="1" title="Python"
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.map_function import MapFunction
from sage.core.api.function.sink_function import SinkFunction
from sage.core.api.function.batch_function import BatchFunction
from sage.common.utils.logging.custom_logger import CustomLogger

# 声明数据流入：生成10条"Hello, World!"字符串
class HelloBatch(BatchFunction):
    def __init__(self):
        super().__init__()
        self.counter = 0
        # 生成10个数据包
        self.max_count = 10     
    
    def execute(self):
        if self.counter >= self.max_count:
            # 返回 None 表示批处理完成
            return None         
        self.counter += 1
        return f"Hello, World! #{self.counter}"

# 定义数据处理逻辑，将字符串转大写
class UpperCaseMap(MapFunction):
    def execute(self, data):
        return data.upper()

# 声明数据流出，打印结果
class PrintSink(SinkFunction):
    def execute(self, data):
        print(data)

def main():
    env = LocalEnvironment("Hello_World")
    
    # 定义数据处理逻辑，连接算子组成 Pipeline
    env.from_batch(HelloBatch).map(UpperCaseMap).sink(PrintSink)

    # 提交 pipeline，并启动自动停止
    env.submit(autostop=True)

    print("Hello World 批处理示例结束")

if __name__ == "__main__":
    # 关闭日志输出
    CustomLogger.disable_global_console_debug()
    main()


```

下面我们将对这些部分逐一进行概述，以便理解 SAGE 编程的主要思想：

---

### **A**. `HelloBatch`：声明数据流入

```python
class HelloBatch(BatchFunction):
    def __init__(self):
        super().__init__()
        self.counter = 0
        self.max_count = 10 

    def execute(self):
        if self.counter >= self.max_count:
            return None 
        self.counter += 1
        return f"Hello, World! #{self.counter}"
```

 **说明：**

 * 继承自 `BatchFunction`，需要实例化抽象接口 `execute()`，用于批量生成数据，return返回的值即是传递给下游的数据。
 * 每调用一次 `execute()`，返回一个新的 `"Hello, World! #编号"` 字符串。
 * 当生成 10 条数据后，返回 `None`，**通知框架数据已经生成完毕**，数据源自动结束。

---

### **B**.`UpperCaseMap`：数据转换

```python
class UpperCaseMap(MapFunction):
    def execute(self, data):
        return data.upper()
```

 **说明：**

 * 继承自 `MapFunction`，这是 SAGE 中常见的数据转换节点（map）。
 * 对传入的每条数据执行 `.upper()`，**将字符串转为大写**。

---

### **C**.`PrintSink`：声明数据流出

```python
class PrintSink(SinkFunction):
    def execute(self, data):
        print(data)
        return data
```

 **说明：**

 * 继承自 `SinkFunction`，用作数据处理的“终点”。
 * 每收到一条数据，**直接打印输出**。

---

### **D**.`main`函数：Pipeline搭建

```python
def main():
    env = LocalEnvironment("Hello_World")
    
    # transformation：from_batch - map - sink
    env.from_batch(HelloBatch).map(UpperCaseMap).sink(PrintSink)

    # 提交 pipeline，并启动自动停止（仅from_batch模式有效）
    env.submit(autostop=True)

    print("Hello World 批处理示例结束")
```

 **说明：**

 * 创建本地执行环境 `LocalEnvironment`，方便本地开发与调试。
 * 用链式 API 定义数据流处理步骤：

   1. `from_batch()`：指定数据输入源
   2. `.map()`：最常用的数据连接，一对一向上下游传递数据
   3. `.sink()`：指定数据输出终点
 * `env.submit(autostop=True)`：**启动任务**。

---


### **E**.运行效果

控制台输出效果：

```plaintext
JobManager logs: ***/.sage/logs/jobmanager/session_***
HELLO, WORLD! #1
HELLO, WORLD! #2
HELLO, WORLD! #3
HELLO, WORLD! #4
HELLO, WORLD! #5
HELLO, WORLD! #6
HELLO, WORLD! #7
HELLO, WORLD! #8
HELLO, WORLD! #9
HELLO, WORLD! #10
Hello World 批处理示例结束
```

---

## 结语

Hello SAGE 程序展示了 SAGE 编程所需的基本接口：env、from_batch、map、sink、submit、几类function以及对应需要实现的execute函数，总的来说，编程人员需要定义好 **数据处理单元** （即实现抽象Function）以及 **Pipeline** （利用env、map、sink、env等接口），最终 **提交Pipeline** 以实现个性化的数据处理程序。