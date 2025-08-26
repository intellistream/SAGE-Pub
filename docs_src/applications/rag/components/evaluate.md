# RAG评估模块使用说明

本文档介绍了`evaluate`模块中各种评估函数的使用方法。该模块提供了多种用于评估RAG（检索增强生成）系统性能的评估指标。

## 概述

所有评估类都继承自`MapFunction`基类，可以在数据处理管道中使用。每个评估函数都会：
1. 接收包含预测结果和参考答案的数据字典
2. 计算相应的评估指标
3. 打印彩色格式的结果
4. 返回原始数据字典以便链式调用

## 评估指标类别

### 1. 文本匹配评估

#### F1Evaluate - F1分数评估
计算预测文本与参考答案之间的F1分数。

**使用方法：**
```python
from sage.libs.rag.evaluate import F1Evaluate

# 初始化评估器
f1_evaluator = F1Evaluate()

# 准备数据
data = {
    "references": ["这是正确的答案", "这也是正确答案"],
    "generated": "这是预测的答案"
}

# 执行评估
result = f1_evaluator.execute(data)
```

**输出示例：** `[F1] : 0.7500`

#### RecallEvaluate - 召回率评估
计算预测文本相对于参考答案的召回率。

**使用方法：**
```python
from sage.libs.rag.evaluate import RecallEvaluate

recall_evaluator = RecallEvaluate()
result = recall_evaluator.execute(data)
```

**输出示例：** `[Recall] : 0.8000`

#### AccuracyEvaluate - 准确率评估
检查预测文本是否与任一参考答案完全匹配。

**使用方法：**
```python
from sage.libs.rag.evaluate import AccuracyEvaluate

accuracy_evaluator = AccuracyEvaluate()
result = accuracy_evaluator.execute(data)
```

**输出示例：** `[Acc] : 1.0000`

### 2. 语义相似度评估

#### BertRecallEvaluate - BERT语义召回率
使用BERT模型计算预测文本与参考答案之间的语义相似度。

**依赖：** 需要安装`transformers`库

**使用方法：**
```python
from sage.libs.rag.evaluate import BertRecallEvaluate

# 注意：首次使用会下载BERT模型
bert_evaluator = BertRecallEvaluate()
result = bert_evaluator.execute(data)
```

**输出示例：** `[BertRecall] : 0.8534`

### 3. ROUGE评估

#### RougeLEvaluate - ROUGE-L评估
计算ROUGE-L分数，衡量最长公共子序列的质量。

**依赖：** 需要安装`rouge`库

**使用方法：**
```python
from sage.libs.rag.evaluate import RougeLEvaluate

rouge_evaluator = RougeLEvaluate()
result = rouge_evaluator.execute(data)
```

**输出示例：** `[ROUGE-L] : 0.6667`

### 4. 字符级评估

#### BRSEvaluate - 字符集召回率
计算预测文本与参考答案字符集的重叠比例。

**使用方法：**
```python
from sage.libs.rag.evaluate import BRSEvaluate

brs_evaluator = BRSEvaluate()
result = brs_evaluator.execute(data)
```

**输出示例：** `[BRS] : 0.7500`

### 5. 性能指标

#### TokenCountEvaluate - 令牌计数
统计预测文本中的令牌数量。

**使用方法：**
```python
from sage.libs.rag.evaluate import TokenCountEvaluate

token_evaluator = TokenCountEvaluate()
data_with_pred = {"pred": "这是一个测试句子"}
result = token_evaluator.execute(data_with_pred)
```

**输出示例：** `[Token Count] : 5`

#### LatencyEvaluate - 延迟评估
计算系统总延迟时间。

**使用方法：**
```python
from sage.libs.rag.evaluate import LatencyEvaluate

latency_evaluator = LatencyEvaluate()
data_with_time = {
    "refine_time": 0.5,
    "generate_time": 1.2
}
result = latency_evaluator.execute(data_with_time)
```

**输出示例：** `[Latency] : 1.70s`

### 6. 检索评估

#### ContextRecallEvaluate - 上下文召回率
评估检索到的文档是否包含支持事实。

**使用方法：**
```python
from sage.libs.rag.evaluate import ContextRecallEvaluate

context_evaluator = ContextRecallEvaluate()
data_with_context = {
    "metadata": {
        "supporting_facts": {
            "sent_id": ["doc1_sent1", "doc2_sent3"]
        }
    },
    "retrieved_sent_ids": ["doc1_sent1", "doc3_sent2"]
}
result = context_evaluator.execute(data_with_context)
```

**输出示例：** `[Context Recall] : 0.5000`

#### CompressionRateEvaluate - 压缩率评估
计算文档压缩比率。

**使用方法：**
```python
from sage.libs.rag.evaluate import CompressionRateEvaluate

compression_evaluator = CompressionRateEvaluate()
data_with_docs = {
    "retrieved_docs": ["很长的原始文档内容", "另一个很长的文档"],
    "refined_docs": ["精炼后的内容"]
}
result = compression_evaluator.execute(data_with_docs)
```

**输出示例：** `[Compression Rate] : 3.50×`

## 数据格式要求

### 基本数据结构
```python
{
    "references": ["参考答案1", "参考答案2"],  # 必需：参考答案列表
    "generated": "生成的预测答案",            # 必需：模型生成的答案
    "pred": "预测文本",                     # 可选：用于令牌计数
    "refine_time": 0.5,                    # 可选：精炼时间
    "generate_time": 1.2,                  # 可选：生成时间
    "retrieved_docs": ["文档1", "文档2"],    # 可选：检索到的文档
    "refined_docs": ["精炼文档"],           # 可选：精炼后的文档
    "retrieved_sent_ids": ["id1", "id2"],  # 可选：检索到的句子ID
    "metadata": {                          # 可选：元数据
        "supporting_facts": {
            "sent_id": ["支持事实ID"]
        }
    }
}
```

## 完整使用示例

```python
from sage.libs.rag.evaluate import (
    F1Evaluate, RecallEvaluate, AccuracyEvaluate,
    BertRecallEvaluate, RougeLEvaluate, BRSEvaluate,
    TokenCountEvaluate, LatencyEvaluate,
    ContextRecallEvaluate, CompressionRateEvaluate
)

# 准备测试数据
test_data = {
    "references": ["北京是中国的首都", "中国的首都是北京"],
    "generated": "北京是中华人民共和国的首都",
    "pred": "北京是中华人民共和国的首都",
    "refine_time": 0.3,
    "generate_time": 0.8,
    "retrieved_docs": ["北京，中华人民共和国首都，位于华北平原北部", "北京是政治文化中心"],
    "refined_docs": ["北京是中国首都"],
    "retrieved_sent_ids": ["doc1_sent1", "doc2_sent1"],
    "metadata": {
        "supporting_facts": {
            "sent_id": ["doc1_sent1", "doc2_sent2"]
        }
    }
}

# 创建评估器列表
evaluators = [
    F1Evaluate(),
    RecallEvaluate(),
    AccuracyEvaluate(),
    BertRecallEvaluate(),
    RougeLEvaluate(),
    BRSEvaluate(),
    TokenCountEvaluate(),
    LatencyEvaluate(),
    ContextRecallEvaluate(),
    CompressionRateEvaluate()
]

# 执行所有评估
print("开始RAG系统评估：")
result = test_data
for evaluator in evaluators:
    result = evaluator.execute(result)
    
print("评估完成！")
```



## 扩展开发

如果需要添加新的评估指标，可以继承`MapFunction`基类：

```python
from sage.core.api.function.map_function import MapFunction

class CustomEvaluate(MapFunction):
    def execute(self, data: dict):
        # 实现自定义评估逻辑
        score = self.calculate_custom_score(data)
        print(f"\033[93m[Custom] : {score:.4f}\033[0m")
        return data
    
    def calculate_custom_score(self, data):
        # 自定义评估算法
        return 0.0
```
