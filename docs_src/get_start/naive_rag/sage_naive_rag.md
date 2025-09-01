# Naive RAG实现指南

> 本文档面向熟悉RAG基本流程的开发者。如果您对RAG概念不了解，请先阅读 [RAG - 检索增强生成技术介绍](you_know_rag.md)。

## 为什么选择SAGE构建RAG？

SAGE流处理框架为RAG系统提供了强大的技术基础：

- **统一的数据流处理**：支持批处理和流式处理两种模式
- **丰富的RAG组件库**：提供检索器、生成器、提示词等预制组件
- **灵活的服务集成**：支持内存服务、向量数据库等服务注册
- **模块化设计**：可灵活组合不同的处理算子

## Naive RAG Pipeline示例

我们将通过 SAGE 中预定义的算子向您展示一个完整的 Naive RAG 查询处理流水线的创建。以下代码来自 `examples/rag/qa_dense_retrieval_chroma.py`：

```python
import time
import os
from dotenv import load_dotenv
import yaml
from sage.core.api.local_environment import LocalEnvironment
from sage.libs.io_utils.sink import TerminalSink
from sage.libs.io_utils.batch import JSONLBatch
from sage.libs.rag.generator import OpenAIGenerator
from sage.libs.rag.promptor import QAPromptor
from sage.libs.rag.retriever import ChromaRetriever
from sage.common.utils.config.loader import load_config

def pipeline_run(config: dict) -> None:
    """
    创建并运行 ChromaDB 专用 RAG 数据处理管道

    Args:
        config (dict): 包含各模块配置的配置字典。
    """
    
    print("=== 启动基于 ChromaDB 的 RAG 问答系统 ===")
    print("配置信息:")
    print(f"  - 源文件: {config['source']['data_path']}")
    print(f"  - 向量维度: {config['retriever']['dimension']}")
    print(f"  - Top-K: {config['retriever']['top_k']}")
    print(f"  - 集合名称: {config['retriever']['chroma']['collection_name']}")
    print(f"  - 嵌入模型: {config['retriever']['embedding']['method']}")

    env = LocalEnvironment()
    
    (env
        .from_batch(JSONLBatch, config["source"])
        .map(ChromaRetriever, config["retriever"])
        .map(QAPromptor, config["promptor"])
        .map(OpenAIGenerator, config["generator"]["vllm"])
        .sink(TerminalSink, config["sink"])
    )

    print("正在提交并运行管道...")
    env.submit(autostop=True)
    env.close()
    print("=== RAG 问答系统运行完成 ===")

if __name__ == '__main__':
    config = load_config("../config/config_qa_chroma.yaml")
    pipeline_run(config)
```

在完成了基础的 Naive RAG Pipeline 构建后，接下来我们需要准备离线知识库，以便为查询提供可检索的信息支持。以下是知识库构建的关键步骤与示例代码：

## 基于Chroma的知识库构建

### 1. 构建向量索引

使用SAGE提供的Chroma索引构建工具，代码来自 `examples/rag/build_chroma_index.py`：

```python
#!/usr/bin/env python3
"""
知识库预加载脚本（SAGE版）
使用 TextLoader 加载文本，CharacterSplitter 分块，写入 ChromaDB。
"""
import os
import sys
import chromadb
from sentence_transformers import SentenceTransformer
from sage.libs.rag.document_loaders import TextLoader
from sage.libs.rag.chunk import CharacterSplitter

def load_knowledge_to_chromadb():
    # 配置参数
    knowledge_file = "../data/qa_knowledge_base.txt"
    persistence_path = "./chroma_qa_database"
    collection_name = "qa_knowledge_base"

    print(f"=== 预加载知识库到 ChromaDB ===")
    print(f"文件: {knowledge_file} | DB: {persistence_path} | 集合: {collection_name}")

    loader = TextLoader(knowledge_file)
    document = loader.load()
    print(f"已加载文本，长度: {len(document['content'])}")

    splitter = CharacterSplitter({"separator": "\n\n"})
    chunks = splitter.execute(document)
    print(f"分块数: {len(chunks)}")
    chunk_docs = [
        {"content": chunk, "metadata": {"chunk": idx+1, "source": knowledge_file}}
        for idx, chunk in enumerate(chunks)
    ]

    # 初始化嵌入模型
    print("\n加载嵌入模型...")
    model = SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')
    print("初始化ChromaDB...")
    client = chromadb.PersistentClient(path=persistence_path)
    try:
        client.delete_collection(name=collection_name)
    except:
        pass
    
    collection = client.create_collection(name=collection_name)
    print(f"集合已创建")
    
    texts = [c["content"] for c in chunk_docs]
    embeddings = model.encode(texts).tolist()
    ids = [f"chunk_{i}" for i in range(len(chunk_docs))]
    metadatas = [c["metadata"] for c in chunk_docs]
    
    collection.add(
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas,
        ids=ids
    )
    
    print(f"✓ 已添加 {len(chunk_docs)} 个文本块")
    print(f"✓ 数据库文档数: {collection.count()}")
    
    # 测试检索
    test_query = "什么是ChromaDB"
    query_embedding = model.encode([test_query]).tolist()
    results = collection.query(query_embeddings=query_embedding, n_results=3)
    print(f"检索测试: {test_query}")
    for i, doc in enumerate(results['documents'][0]):
        print(f"  {i+1}. {doc[:100]}...")
    
    print("=== 预加载完成 ===")
    return True

if __name__ == '__main__':
    if load_knowledge_to_chromadb():
        print("知识库已成功加载，可运行检索/问答脚本")
    else:
        print("知识库加载失败")
```
    
    print("✅ Chroma知识库构建完成")
    return retriever

if __name__ == "__main__":
    build_chroma_index()
```

### 2. RAG查询处理

基于构建的知识库进行查询：

```python
"""
使用Chroma进行RAG查询的完整示例
"""
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.batch_function import BatchFunction
from sage.libs.rag.retriever import ChromaRetriever
from sage.libs.rag.promptor import QAPromptor
from sage.libs.rag.generator import OpenAIGenerator
from sage.libs.io_utils.sink import TerminalSink

class QueryBatch(BatchFunction):
    """查询批处理数据源"""
    def __init__(self, config, **kwargs):
        super().__init__(**kwargs)
        self.queries = [
            "什么是机器学习？",
            "深度学习有什么特点？",
            "自然语言处理的应用有哪些？",
            "强化学习如何工作？"
        ]
        self.counter = 0

    def execute(self):
        if self.counter >= len(self.queries):
            return None
        
        query = self.queries[self.counter]
        self.counter += 1
        return query

def chroma_rag_pipeline():
    """使用Chroma的RAG管道"""
    env = LocalEnvironment("chroma_rag")
    
    # 配置
    config = {
        "source": {"data_path": "examples/data/sample/question.txt"},
        "retriever": {
            "platform": "local",
            "chroma": {
                "collection_name": "knowledge_base",
                "persist_directory": "./chroma_db",
                "top_k": 3
            }
        },
        "promptor": {"platform": "local"},
        "generator": {
            "vllm": {
                "api_key": "your-api-key",
                "method": "openai",
                "model_name": "gpt-3.5-turbo",
                "base_url": "https://api.openai.com/v1"
            }
        },
        "sink": {"platform": "local"}
    }
    
    (env
        .from_batch(QueryBatch, config["source"])
        .map(ChromaRetriever, config["retriever"])
        .map(QAPromptor, config["promptor"])
        .map(OpenAIGenerator, config["generator"]["vllm"])
        .sink(TerminalSink, config["sink"])
    )
    
    env.submit(autostop=True)

if __name__ == "__main__":
    chroma_rag_pipeline()
```

## 基于Milvus的分布式RAG

### 1. Milvus索引构建

```python
"""
使用Milvus构建分布式向量索引
"""
from sage.libs.rag.retriever import MilvusRetriever
from sage.middleware.utils.embedding.embedding_api import apply_embedding_model

def build_milvus_index():
    """构建Milvus向量索引"""
    
    config = {
        "retriever": {
            "platform": "local",
            "milvus": {
                "host": "localhost",
                "port": 19530,
                "collection_name": "knowledge_collection",
                "dimension": 384,
                "top_k": 5,
                "metric_type": "L2"
            }
        }
    }
    
    # 初始化Milvus检索器
    retriever = MilvusRetriever(config["retriever"])
    
    # 准备文档数据
    documents = [
        {"id": 1, "text": "Python是一种高级编程语言，语法简洁易学。", "metadata": {"category": "programming"}},
        {"id": 2, "text": "机器学习是AI的核心技术之一。", "metadata": {"category": "ai"}},
        {"id": 3, "text": "Docker容器化技术简化了应用部署。", "metadata": {"category": "devops"}},
    ]
    
    # 批量插入文档
    retriever.bulk_insert(documents)
    
    print("✅ Milvus知识库构建完成")

if __name__ == "__main__":
    build_milvus_index()
```

### 2. 分布式RAG管道

```python
"""
基于Milvus的分布式RAG管道
"""
from sage.core.api.remote_environment import RemoteEnvironment
from sage.libs.io_utils.source import FileSource
from sage.libs.rag.retriever import MilvusRetriever
from sage.libs.rag.promptor import QAPromptor
from sage.libs.rag.generator import OpenAIGenerator
from sage.libs.io_utils.sink import TerminalSink

def distributed_rag_pipeline():
    """分布式RAG管道"""
    # 连接到远程JobManager
    env = RemoteEnvironment(
        name="distributed_rag",
        host="127.0.0.1",
        port=19001
    )
    
    config = {
        "source": {"data_path": "examples/data/sample/question.txt"},
        "retriever": {
            "platform": "local",
            "milvus": {
                "host": "milvus-server",
                "port": 19530,
                "collection_name": "knowledge_collection",
                "top_k": 3
            }
        },
        "promptor": {"platform": "local"},
        "generator": {
            "vllm": {
                "api_key": "your-api-key",
                "method": "openai",
                "model_name": "gpt-3.5-turbo",
                "base_url": "http://llm-server:8000/v1"
            }
        },
        "sink": {"platform": "local"}
    }
    
    (env
        .from_source(FileSource, config["source"])
        .map(MilvusRetriever, config["retriever"])
        .map(QAPromptor, config["promptor"])
        .map(OpenAIGenerator, config["generator"]["vllm"])
        .sink(TerminalSink, config["sink"])
    )
    
    env.submit()

if __name__ == "__main__":
    distributed_rag_pipeline()
```

## 流式RAG查询处理

### 1. 实时查询处理流水线

SAGE支持构建流式RAG系统，可以实时处理用户查询：

```python
"""
流式RAG查询处理示例
"""
from sage.core.api.local_environment import LocalEnvironment
from sage.core.api.function.source_function import SourceFunction
from sage.core.api.function.map_function import MapFunction
from sage.core.api.function.sink_function import SinkFunction
import time

class StreamingQuerySource(SourceFunction):
    """模拟实时查询流"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.test_queries = [
            "什么是深度学习？",
            "Python有什么特点？", 
            "Docker如何使用？",
            "机器学习的应用场景？"
        ]
        self.counter = 0

    def execute(self):
        if self.counter >= len(self.test_queries):
            self.counter = 0  # 循环查询
        
        query_data = {
            "query": self.test_queries[self.counter],
            "query_id": self.counter + 1,
            "timestamp": time.time()
        }
        self.counter += 1
        return query_data

class KnowledgeRetriever(MapFunction):
    """知识检索算子"""
    def __init__(self, config, **kwargs):
        super().__init__(**kwargs)
        self.config = config
        self.topk = config.get("topk", 3)

    def execute(self, data):
        query = data.get("query", "")
        
        # 模拟检索过程
        retrieved_docs = [
            f"相关文档1：关于'{query}'的基础知识",
            f"相关文档2：'{query}'的实际应用",
            f"相关文档3：'{query}'的进阶内容"
        ]
        
        data["retrieved_knowledge"] = retrieved_docs
        return data

class StreamingRAGSink(SinkFunction):
    """流式RAG结果输出"""
    def execute(self, data):
        print(f"\n🔍 查询 {data.get('query_id', 'N/A')}: {data.get('query', 'N/A')}")
        
        if "answer" in data:
            print(f"🤖 回答: {data['answer']}")
        
        if "retrieved_knowledge" in data:
            print(f"📖 检索到 {len(data['retrieved_knowledge'])} 条相关知识")
        
        print("─" * 50)
        return data

def streaming_rag_pipeline():
    """创建流式RAG处理环境"""
    env = LocalEnvironment("streaming_rag")
    
    config = {
        "retriever": {"topk": 3},
        "promptor": {"platform": "local"},
        "generator": {
            "vllm": {
                "api_key": "your-api-key",
                "method": "openai", 
                "model_name": "gpt-3.5-turbo",
                "base_url": "https://api.openai.com/v1"
            }
        }
    }
    
    # 构建流水线
    (env
        .from_source(StreamingQuerySource)
        .map(KnowledgeRetriever, config["retriever"])
        .map(QAPromptor, config["promptor"])
        .map(OpenAIGenerator, config["generator"]["vllm"])
        .sink(StreamingRAGSink)
    )
    
    try:
        print("🚀 启动流式RAG系统...")
        env.submit()
        
        # 运行一段时间
        import time
        time.sleep(30)
        
    except KeyboardInterrupt:
        print("\n⏹️ 停止流式RAG系统")
    finally:
        env.close()

if __name__ == "__main__":
    streaming_rag_pipeline()
```

## 系统特性与优势

### 核心组件特性
- **灵活的检索器**：支持Chroma、Milvus等多种向量数据库
- **智能提示词生成**：自动组合查询和检索上下文
- **多模型生成器**：支持OpenAI、vLLM等多种生成模型
- **流式处理能力**：支持实时和批量两种处理模式

### 性能优势
- **高效检索**：毫秒级向量相似度搜索
- **弹性扩展**：支持分布式部署和负载均衡
- **容错处理**：完善的错误处理和重试机制
- **监控观测**：全链路处理状态可观测

## 配置示例

### 完整配置文件

```yaml
pipeline:
  name: "naive-rag-pipeline"
  description: "基础RAG问答管道"

source:
  data_path: "examples/data/sample/question.txt"
  platform: "local"

retriever:
  platform: "local"
  # Chroma配置
  chroma:
    collection_name: "knowledge_base"
    persist_directory: "./chroma_db"
    top_k: 3
    
  # 或者Milvus配置
  milvus:
    host: "localhost"
    port: 19530
    collection_name: "knowledge_collection"
    dimension: 384
    top_k: 5
    metric_type: "L2"

promptor:
  platform: "local"
  template_type: "qa"  # 或 "summarization"

generator:
  vllm:
    api_key: "your-api-key"
    method: "openai"
    model_name: "gpt-3.5-turbo"
    base_url: "https://api.openai.com/v1"
    temperature: 0.7
    max_tokens: 1000

sink:
  platform: "local"
```

## 扩展方向

1. **高级检索技术**：
   - 混合检索（密集+稀疏）
   - 重排序（Reranking）
   - 查询扩展和改写

2. **提示词工程**：
   - 动态提示词模板
   - 上下文长度优化
   - 多轮对话支持

3. **生成质量优化**：
   - 答案质量评估
   - 引用和溯源
   - 幻觉检测和缓解

4. **系统性能优化**：
   - 缓存机制
   - 批量处理
   - 异步并发

## 最佳实践

### 1. 知识库质量
- 确保文档内容的准确性和时效性
- 合理的文档分块策略
- 丰富的元数据标注

### 2. 检索优化
- 选择合适的embedding模型
- 调优检索参数（top_k、阈值等）
- 实施检索结果过滤和排序

### 3. 生成优化
- 设计有效的提示词模板
- 调节模型参数（temperature、top_p等）
- 实施输出格式控制

### 4. 系统监控
- 检索精度监控
- 生成质量评估
- 系统性能指标追踪

## 快速开始

1. **环境准备**：
   ```bash
   # 安装SAGE
   pip install sage-framework
   
   # 启动向量数据库（选择其一）
   docker run -p 19530:19530 milvusdb/milvus:latest  # Milvus
   # 或者直接使用Chroma（无需额外安装）
   ```

2. **构建知识库**：
   ```bash
   python examples/rag/build_chroma_index.py
   # 或
   python examples/rag/build_milvus_index.py
   ```

3. **运行RAG管道**：
   ```bash
   python examples/rag/qa_dense_retrieval_chroma.py
   # 或
   python examples/rag/qa_dense_retrieval_milvus.py
   ```

4. **自定义扩展**：
   - 根据需求修改配置文件
   - 自定义检索和生成组件
   - 集成业务特定的数据源

---

*通过SAGE构建的RAG系统具备生产级的稳定性和扩展性，是企业级智能问答应用的理想选择。*
