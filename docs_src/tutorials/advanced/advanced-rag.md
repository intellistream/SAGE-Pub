# 高级 RAG 技术

> **目标**：学习如何构建企业级的检索增强生成系统

## 概述

企业级 RAG（Retrieval-Augmented Generation）系统需要考虑检索质量、性能、可扩展性等多方面因素。SAGE 提供了 `UnifiedInferenceClient` 统一接口，可以无缝集成 LLM 和 Embedding 服务，简化 RAG 系统的开发。

## UnifiedInferenceClient 快速入门

### 基本用法

`UnifiedInferenceClient` 是 SAGE 推荐的统一推理客户端，支持 LLM Chat/Generate 和 Embedding 两种能力：

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# 方式 1: 自动检测本地服务（推荐）
client = UnifiedInferenceClient.create_auto()

# 方式 2: 显式配置端点
client = UnifiedInferenceClient(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)

# Chat 对话
response = client.chat([
    {"role": "user", "content": "什么是 RAG?"}
])
print(response)

# Generate 文本生成
text = client.generate("RAG 的核心思想是")
print(text)

# Embed 向量嵌入
vectors = client.embed(["检索增强生成", "向量数据库"])
print(f"嵌入维度: {len(vectors[0])}")
```

### 启动后端服务

```bash
# 启动 LLM 服务 (vLLM)
sage stack start --llm-model Qwen/Qwen2.5-7B-Instruct --llm-port 8901

# 启动 Embedding 服务
python -m sage.common.components.sage_embedding.embedding_server \
    --model BAAI/bge-m3 --port 8090

# 或使用一键命令
sage stack start  # 默认同时启动 LLM 和 Embedding
```

## 构建 RAG Pipeline

### 基础 RAG 流程

```python
from sage.kernel.api.local_environment import LocalEnvironment
from sage.common.core.functions.batch_function import BatchFunction
from sage.common.core.functions.map_function import MapFunction
from sage.common.core.functions.sink_function import SinkFunction
from sage.common.components.sage_llm import UnifiedInferenceClient

# 初始化统一客户端
client = UnifiedInferenceClient.create_auto()


class QuerySource(BatchFunction):
    """查询数据源"""
    def __init__(self, queries, **kwargs):
        super().__init__(**kwargs)
        self.queries = queries
        self.index = 0
    
    def execute(self):
        if self.index >= len(self.queries):
            return None
        query = self.queries[self.index]
        self.index += 1
        return {"query": query}


class EmbeddingOperator(MapFunction):
    """向量嵌入算子"""
    def execute(self, data):
        query = data["query"]
        # 使用 UnifiedInferenceClient 生成向量
        vectors = client.embed([query])
        return {
            "query": query,
            "embedding": vectors[0]
        }


class RetrievalOperator(MapFunction):
    """检索算子（示例：模拟检索）"""
    def __init__(self, knowledge_base, **kwargs):
        super().__init__(**kwargs)
        self.knowledge_base = knowledge_base
    
    def execute(self, data):
        # 实际应用中，这里会查询向量数据库
        # 例如 ChromaDB, Milvus, Qdrant 等
        query = data["query"]
        relevant_docs = self.knowledge_base[:3]  # 简化示例
        return {
            "query": query,
            "context": "\n".join(relevant_docs)
        }


class GenerationOperator(MapFunction):
    """生成算子"""
    def execute(self, data):
        query = data["query"]
        context = data["context"]
        
        prompt = f"""基于以下上下文回答问题：

上下文：
{context}

问题：{query}

回答："""
        
        # 使用 UnifiedInferenceClient 生成回答
        response = client.chat([
            {"role": "user", "content": prompt}
        ])
        
        return {
            "query": query,
            "answer": response
        }


class ResultSink(SinkFunction):
    """结果输出"""
    def execute(self, data):
        print(f"问题: {data['query']}")
        print(f"回答: {data['answer']}")
        print("-" * 50)


def main():
    env = LocalEnvironment("RAG_Pipeline")
    
    queries = [
        "SAGE 支持哪些 LLM?",
        "如何部署分布式 Pipeline?"
    ]
    
    knowledge_base = [
        "SAGE 支持 vLLM、OpenAI API 等多种 LLM 后端。",
        "SAGE 基于 Ray 构建分布式执行能力。",
        "使用 RemoteEnvironment 可以在集群上运行 Pipeline。"
    ]
    
    (
        env.from_batch(QuerySource, queries=queries)
        .map(EmbeddingOperator)
        .map(RetrievalOperator, knowledge_base=knowledge_base)
        .map(GenerationOperator)
        .sink(ResultSink)
    )
    
    env.submit(autostop=True)


if __name__ == "__main__":
    main()
```

## 多源检索

### 并行检索多个知识库

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

client = UnifiedInferenceClient.create_auto()


class MultiSourceRetriever(MapFunction):
    """多源检索算子"""
    def __init__(self, sources, **kwargs):
        super().__init__(**kwargs)
        self.sources = sources  # 多个知识库配置
    
    def execute(self, data):
        query = data["query"]
        query_embedding = client.embed([query])[0]
        
        all_results = []
        for source_name, source_config in self.sources.items():
            # 从每个源检索
            results = self._retrieve_from_source(
                query_embedding, 
                source_config,
                top_k=3
            )
            for r in results:
                r["source"] = source_name
            all_results.extend(results)
        
        # 结果融合：按相关性得分排序
        all_results.sort(key=lambda x: x["score"], reverse=True)
        
        return {
            "query": query,
            "results": all_results[:5]  # 取 Top-5
        }
    
    def _retrieve_from_source(self, embedding, config, top_k):
        # 实际实现中查询对应的向量数据库
        # 这里返回模拟结果
        return [{"text": "示例文档", "score": 0.9}]
```

## 分层检索

### 两阶段检索策略

```python
class HierarchicalRetriever(MapFunction):
    """分层检索：粗检索 -> 细检索"""
    
    def execute(self, data):
        query = data["query"]
        
        # 阶段 1: 粗粒度检索（文档级）
        coarse_results = self._coarse_retrieve(query, top_k=10)
        
        # 阶段 2: 细粒度检索（段落级）
        fine_results = self._fine_retrieve(query, coarse_results, top_k=3)
        
        return {
            "query": query,
            "context": "\n".join([r["text"] for r in fine_results])
        }
    
    def _coarse_retrieve(self, query, top_k):
        """粗粒度检索：基于文档摘要或标题"""
        query_embedding = client.embed([query])[0]
        # 使用文档级索引检索
        return []  # 返回候选文档
    
    def _fine_retrieve(self, query, candidates, top_k):
        """细粒度检索：在候选文档内检索段落"""
        query_embedding = client.embed([query])[0]
        # 在候选文档的段落中检索
        return []  # 返回最相关段落
```

## 重排序（Re-ranking）

### Cross-Encoder 重排序

```python
class RerankOperator(MapFunction):
    """使用 Cross-Encoder 重排序检索结果"""
    
    def execute(self, data):
        query = data["query"]
        candidates = data["candidates"]
        
        # 构建 query-document 对
        pairs = [(query, doc["text"]) for doc in candidates]
        
        # 使用 LLM 进行相关性评分
        scored_results = []
        for doc, (q, d) in zip(candidates, pairs):
            score = self._compute_relevance(q, d)
            scored_results.append({**doc, "rerank_score": score})
        
        # 按重排序得分排序
        scored_results.sort(key=lambda x: x["rerank_score"], reverse=True)
        
        return {
            "query": query,
            "results": scored_results[:3]
        }
    
    def _compute_relevance(self, query, document):
        """使用 LLM 评估相关性"""
        prompt = f"""评估以下文档与查询的相关性（0-10分）：

查询: {query}
文档: {document[:500]}

只返回数字分数："""
        
        response = client.chat([
            {"role": "user", "content": prompt}
        ])
        try:
            return float(response.strip())
        except ValueError:
            return 0.0
```

## 混合检索

### 向量检索 + BM25 关键词检索

```python
class HybridRetriever(MapFunction):
    """混合检索：结合向量相似度和关键词匹配"""
    
    def __init__(self, alpha=0.7, **kwargs):
        """
        Args:
            alpha: 向量检索权重 (1-alpha 为 BM25 权重)
        """
        super().__init__(**kwargs)
        self.alpha = alpha
    
    def execute(self, data):
        query = data["query"]
        
        # 向量检索
        vector_results = self._vector_search(query, top_k=10)
        
        # BM25 关键词检索
        bm25_results = self._bm25_search(query, top_k=10)
        
        # 融合结果 (Reciprocal Rank Fusion)
        fused_results = self._rrf_fusion(vector_results, bm25_results)
        
        return {
            "query": query,
            "results": fused_results[:5]
        }
    
    def _vector_search(self, query, top_k):
        """向量相似度检索"""
        embedding = client.embed([query])[0]
        # 查询向量数据库
        return []
    
    def _bm25_search(self, query, top_k):
        """BM25 关键词检索"""
        # 使用 BM25 算法检索
        return []
    
    def _rrf_fusion(self, results1, results2, k=60):
        """Reciprocal Rank Fusion 结果融合"""
        scores = {}
        
        for rank, doc in enumerate(results1):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        
        for rank, doc in enumerate(results2):
            doc_id = doc["id"]
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank + 1)
        
        # 按融合得分排序
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        return [{"id": doc_id, "score": scores[doc_id]} for doc_id in sorted_ids]
```

## Control Plane 模式（高级）

对于高并发场景，推荐使用 Control Plane 模式：

```python
from sage.common.components.sage_llm import UnifiedInferenceClient

# 使用 Control Plane 模式获得智能调度
client = UnifiedInferenceClient.create_with_control_plane(
    llm_base_url="http://localhost:8901/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
    embedding_base_url="http://localhost:8090/v1",
    embedding_model="BAAI/bge-m3",
)

# 查看客户端状态
status = client.get_status()
print(f"模式: {status['mode']}")
print(f"LLM 可用: {status['llm_available']}")
print(f"Embedding 可用: {status['embedding_available']}")
```

## 最佳实践

### ✅ 推荐做法

1. **使用 UnifiedInferenceClient** - 统一管理 LLM 和 Embedding 调用
2. **分批嵌入** - 大量文本使用批量 embed 提高效率
3. **缓存策略** - 对重复查询缓存 embedding 结果
4. **重排序** - 使用 Cross-Encoder 提升检索质量
5. **混合检索** - 结合向量和关键词检索

### ❌ 避免的问题

- 单次嵌入大量文本导致超时
- 忽略检索结果的去重和过滤
- 直接使用原始检索结果而不重排序
- 上下文过长超过 LLM 上下文窗口

## 相关阅读

- [Middleware RAG 组件](../../guides/packages/sage-middleware/components/sage_db.md)
- [Libs RAG 工具](../../guides/packages/sage-libs/rag.md)
- [性能调优](performance-tuning.md) - 优化 RAG 系统性能
- [sage-common 概览](../../guides/packages/sage-common/overview.md) - 包含 UnifiedInferenceClient 说明

---

**下一步**：学习 [性能调优](performance-tuning.md) 优化 RAG 系统性能
