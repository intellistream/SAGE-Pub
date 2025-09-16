# 无界流处理 (Infinite Stream)

> 本例位于 SAGE Repo 下的 `examples/tutorials/core-api/hello_wordcount_source_example.py`

```mermaid
graph LR
    A[SentenceBatch] --> B[SplitWords]
    B --> C[WordToPair]
    C --> D[PrintResult]
```

## 实例解析

无界流处理模拟真实世界中的 **连续数据流**，如传感器数据、用户点击流、消息队列等。它强调实时性和响应性，是构建现代数据驱动应用的核心模式。

示例程序如下：

```Python linenums="1" title="Python"
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.sink_function import SinkFunction
from sage.core.api.function.source_function import SourceFunction
from sage.core.api.function.flatmap_function import FlatMapFunction
from sage.core.api.function.map_function import MapFunction
from sage.common.utils.logging.custom_logger import CustomLogger
import time

# 流数据源：每次输出一行句子
class SentenceSource(SourceFunction):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.sentences = [
            "hello world",
            "hello sage",
            "hello chatgpt",
            "world of ai",
            "sage world"
        ]
        self.index = 0

    def execute(self):
        # 无限流：每次输出一句话，模拟流数据源
        if self.index >= len(self.sentences):
            self.index = 0  # 重置索引，实现循环输出
        sentence = self.sentences[self.index]
        self.index += 1
        return sentence

# 拆分句子为单词
class SplitWords(FlatMapFunction):
    def execute(self, data):
        return data.split()

# 转换为 (word, 1)
class WordToPair(MapFunction):
    def execute(self, data):
        return (data, 1)

# SinkFunction 输出结果：每次输出单词计数
class PrintResult(SinkFunction):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.counts = {}

    def execute(self, data):
        word, cnt = data
        self.counts[word] = self.counts.get(word, 0) + cnt

        # 每次接收到新数据时，输出当前统计结果
        print("当前单词计数：")
        for word, count in self.counts.items():
            print(f"{word}: {count}")
        print("------")

def main():
    env = LocalEnvironment("WordCount")

    # 流式处理：句子 -> 拆分单词 -> 转换为(word,1) -> 输出每次的单词统计
    env.from_source(SentenceSource) \
        .flatmap(SplitWords) \
        .map(WordToPair) \
        .sink(PrintResult)

    env.submit() # 设置为 False 以保持流式执行

    # 模拟流式数据源持续运行一段时间（这里设定为 10 秒）
    time.sleep(10)
    print("WordCount 流式示例结束")

if __name__ == "__main__":
    CustomLogger.disable_global_console_debug()
    main()
```

本例由有界流改动而来，下面我们将对这些改动部分逐一进行概述，以便理解 SAGE 无界流：

---

### **A**. `SentenceSource`：无界数据源

```python
class SentenceSource(SourceFunction):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.sentences = [
            "hello world",
            "hello sage",
            "hello chatgpt",
            "world of ai",
            "sage world"
        ]
        self.index = 0

    def execute(self):
        # 无限流：每次输出一句话，模拟流数据源
        if self.index >= len(self.sentences):
            self.index = 0  # 重置索引，实现循环输出
        sentence = self.sentences[self.index]
        self.index += 1
        return sentence
```

 **说明：**

 * 继承自 `SourceFunction`，需要实例化抽象接口 `execute()`，用于生成数据，配合 `env.from_source` 实现无界数据输入。

---

### **B**. `sleep`：阻塞线程

```python
time.sleep(10)
```

 **说明：**

 * 在无界流中， `autostop=True` 无法暂停 Pipeline。
 * `submit` 提交的任务由后台线程执行，主线程不阻塞的话，会自动停止。

---

### **C**.运行效果

控制台输出效果（会有很多输出不断生成）：

```plaintext
JobManager logs: ***/.sage/logs/jobmanager/session_***
当前单词计数：
hello: 527
world: 526
sage: 350
chatgpt: 175
of: 175
ai: 175
------
当前单词计数：
hello: 527
world: 526
sage: 351
chatgpt: 175
of: 175
ai: 175
...
```

---

## 结语

`env.from_source()` 和 `SourceFunction` 共同组成了有界流处理的基础。SAGE的 `LocalEnvironment` 中，主线程会将提交的任务分配给 Python 从线程执行，需要用户继续显式的阻塞，否则会自动结束从而关闭从线程的 Pipeline。有界流处理的相关接口可以处理持续产生的数据流，适合实时数据分析、监控和交互式应用。