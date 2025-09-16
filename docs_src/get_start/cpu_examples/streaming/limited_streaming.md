# 有界流处理 (Finite Stream)

> 本例位于 SAGE Repo 下的 `examples/tutorials/core-api/hello_wordcount_batch_example.py`

```mermaid
graph LR
    A[SentenceBatch] --> B[SplitWords]
    B --> C[WordToPair]
    C --> D[PrintResult]
```

## 示例解析

有界流处理模拟真实世界中的 **批量数据分析** 场景，如日志分析、报表生成、数据迁移等。它强调完整性和确定性，是构建可靠数据处理系统的基础模式。

示例程序如下：

```Python linenums="1" title="Python"
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.sink_function import SinkFunction
from sage.core.api.function.batch_function import BatchFunction
from sage.core.api.function.flatmap_function import FlatMapFunction
from sage.core.api.function.map_function import MapFunction
from sage.common.utils.logging.custom_logger import CustomLogger

# 批处理数据源：生成几行句子
class SentenceBatch(BatchFunction):
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
        if self.index >= len(self.sentences):
            return None
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


class PrintResult(SinkFunction):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.counts = {}

    def execute(self, data):
        word, cnt = data
        self.counts[word] = self.counts.get(word, 0) + cnt
    
    def close(self):
        print("WordCount 结果：")
        for word, count in self.counts.items():
            print(f"{word}: {count}")

def main():
    env = LocalEnvironment("WordCount")

    # 批处理：句子 -> 拆分单词 -> 转换为(word,1) -> 聚合 -> 输出
    env.from_batch(SentenceBatch) \
        .flatmap(SplitWords) \
        .map(WordToPair) \
        .sink(PrintResult)

    env.submit(autostop=True)
    print("WordCount 批处理示例结束")


if __name__ == "__main__":
    CustomLogger.disable_global_console_debug()
    main()
```

本例由 `Hello SAGE` 改动而来，下面我们将对这些改动部分逐一进行概述，以便理解 SAGE 有界流：

---

### **A**. `SentenceBatch`：批量数据源

```python
class SentenceBatch(BatchFunction):
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
        if self.index >= len(self.sentences):
            return None
        sentence = self.sentences[self.index]
        self.index += 1
        return sentence
```

 **说明：**

 * 继承自 `BatchFunction`，需要实例化抽象接口 `execute()`，用于批量生成数据，配合 `env.from_batch` 实现数据输入。

---

### **B**.`SplitWords`：flatmap拆分

```python
class SplitWords(FlatMapFunction):
    def execute(self, data):
        return data.split()
```

 **说明：**

 * 继承自 `FlatMapFunction`配合 `.flatmap`，实现单条数据输入，多条数据输出。
 * 拆分语句，拆成一个一个单词发送给下游。

---

### **C**.`PrintResult`：汇总流出

```python
class PrintResult(SinkFunction):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.counts = {}

    def execute(self, data):
        word, cnt = data
        self.counts[word] = self.counts.get(word, 0) + cnt
    
    def close(self):
        print("WordCount 结果：")
        for word, count in self.counts.items():
            print(f"{word}: {count}")
```

 **说明：**

 * 与 `Hello SAGE` 不同，这里通过 `close()` 函数进行汇总输出。
 * 在任务结束之后，会把任务情况给输出出来。

---

### **D**.运行效果

控制台输出效果：

```plaintext
JobManager logs: ***/.sage/logs/jobmanager/session_***
WordCount 结果：
hello: 3
world: 3
sage: 2
chatgpt: 1
of: 1
ai: 1
WordCount 批处理示例结束
```

---

## 结语

`env.from_batch()` 和 `BatchFunction` 共同组成了有界流处理的基础。SAGE 中，会通过 `autostop=True` 这一参数，检查数据源是否为空，如果为空，则会自动关闭Pipeline。有界流处理的相关接口可以处理固定大小的数据集，适合离线批量分析和一次性计算任务。