# Deployment Guide

Deploy SAGE applications and the sageLLM服务栈 (LLM / Embedding / Gateway) in a variety of environments.

---

## Quick Start: sage stack

`sage` CLI 内置了一键启动/停止 LLM、Embedding、Gateway 的服务栈命令，适合开发和小规模部署：

```bash
# 启动默认模型（LLM + Embedding + Gateway）
sage stack start

# 显式指定模型与端口
sage stack start \
  --llm-model Qwen/Qwen2.5-7B-Instruct \
  --llm-port 8901 \
  --embedding-model BAAI/bge-m3 \
  --embedding-port 8090 \
  --gateway-port 8000

# 仅启动某些组件
sage stack start --skip-llm --embedding-model BAAI/bge-m3

# 查看状态 / 日志 / 停止
sage stack status
sage stack logs --follow
sage stack stop
```

`sage stack` 内部会统一使用 `SagePorts`，因此**严禁**在代码中硬编码端口号。相关端口如下：

| 常量 | 端口 | 用途 |
|------|------|------|
| `SagePorts.GATEWAY_DEFAULT` | 8000 | OpenAI 兼容 Gateway |
| `SagePorts.LLM_DEFAULT` | 8001 | vLLM 推理服务 |
| `SagePorts.BENCHMARK_LLM` | 8901 | WSL2 / Benchmark 备用 |
| `SagePorts.EMBEDDING_DEFAULT` | 8090 | Embedding 服务 |
| `SagePorts.STUDIO_BACKEND` | 8080 | Studio 后端 |
| `SagePorts.STUDIO_FRONTEND` | 5173 | Studio 前端 |

---

## Deploy Individual Services

### 1. LLM 服务（vLLM）

```bash
SAGE_MODEL="Qwen/Qwen2.5-7B-Instruct"
sage stack start --only llm --llm-model "$SAGE_MODEL" --llm-port 8901

# 或者直接使用 vllm 命令（自定义部署）
python -m vllm.entrypoints.openai.api_server \
  --model "$SAGE_MODEL" \
  --port 8901 \
  --trust-remote-code

# 健康检查
curl http://localhost:8901/v1/models
```

### 2. Embedding 服务

```bash
sage stack start --skip-llm --embedding-model BAAI/bge-m3 --embedding-port 8090

# 或使用内置脚本
python -m sage.common.components.sage_embedding.embedding_server \
  --model BAAI/bge-m3 \
  --port 8090

# 健康检查
curl http://localhost:8090/v1/models
```

### 3. Gateway（OpenAI 兼容 API）

```bash
sage stack start --only gateway --gateway-port 8000 --llm-port 8901

# 测试
curl http://localhost:8000/v1/models

# 客户端（UnifiedInferenceClient）
from sage.common.components.sage_llm import UnifiedInferenceClient
client = UnifiedInferenceClient(
    llm_base_url="http://localhost:8000/v1",
    llm_model="Qwen/Qwen2.5-7B-Instruct",
)
```

---

## Deployment Options

### 1. Local Development

For development and testing:

```bash
# Install SAGE
./quickstart.sh

# Run your application
python my_app.py
```

**Best for**: Development, testing, small-scale experiments

### 2. Single Server Deployment

Deploy on a single machine with multiple workers:

```bash
# Use Ray for distributed execution on single machine
export SAGE_EXECUTION_MODE=ray
export RAY_NUM_CPUS=8

python my_app.py
```

**Best for**: Medium-scale workloads, production with limited resources

### 3. Distributed Cluster

Deploy across multiple machines:

```bash
# On head node
ray start --head --port=6379

# On worker nodes
ray start --address='head_node_ip:6379'

# Run application
export SAGE_EXECUTION_MODE=distributed
python my_app.py
```

**Best for**: Large-scale production workloads

### 4. Kubernetes Deployment

Deploy SAGE on Kubernetes:

```yaml
# sage-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sage-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sage
  template:
    metadata:
      labels:
        app: sage
    spec:
      containers:
      - name: sage
        image: sage:latest
        env:
        - name: SAGE_EXECUTION_MODE
          value: "distributed"
        - name: RAY_ADDRESS
          value: "ray-head:6379"
```

**Best for**: Cloud-native deployments, auto-scaling

### 5. Docker Container

Containerize your SAGE application:

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install SAGE
COPY . /app
RUN pip install -e .

# Run application
CMD ["python", "my_app.py"]
```

Build and run:

```bash
docker build -t my-sage-app .
docker run -p 8000:8000 my-sage-app
```

**Best for**: Reproducible deployments, CI/CD

## Configuration

### Environment Variables

```bash
# Execution mode
export SAGE_EXECUTION_MODE=local|ray|distributed

# API Keys
export OPENAI_API_KEY=sk-...
export JINA_API_KEY=jina_...

# Ray configuration
export RAY_ADDRESS=localhost:6379
export RAY_NUM_CPUS=8
export RAY_NUM_GPUS=1

# sageLLM stack
export SAGE_CHAT_BASE_URL=http://localhost:8901/v1
export SAGE_EMBEDDING_BASE_URL=http://localhost:8090/v1
export SAGE_UNIFIED_BASE_URL=http://localhost:8000/v1  # Gateway
export SAGE_CHAT_MODEL=Qwen/Qwen2.5-7B-Instruct
export SAGE_EMBEDDING_MODEL=BAAI/bge-m3

# Logging
export SAGE_LOG_LEVEL=INFO
export SAGE_LOG_DIR=./logs

# Performance
export SAGE_MAX_WORKERS=16
export SAGE_BATCH_SIZE=32
```

### Configuration Files

Create a `.env` file:

```ini
# .env
SAGE_EXECUTION_MODE=distributed
OPENAI_API_KEY=sk-...
RAY_ADDRESS=ray-cluster:6379
SAGE_LOG_LEVEL=INFO
```

Load in your application:

```python
from sage.common.config import load_env

load_env(".env")
```

## Production Considerations

### 1. Monitoring

Monitor SAGE applications:

```python
from sage.kernel.api.local_environment import LocalStreamEnvironment

env = LocalStreamEnvironment(
    "production_app",
    config={"monitoring": {"enabled": True, "metrics_port": 9090, "log_level": "INFO"}},
)
```

### 2. Fault Tolerance

Enable checkpointing:

```python
env = LocalStreamEnvironment(
    "fault_tolerant_app",
    config={
        "fault_tolerance": {
            "strategy": "checkpoint",
            "checkpoint_interval": 60.0,
            "checkpoint_dir": "/data/checkpoints",
        }
    },
)
```

### 3. Resource Management

Configure resources:

```python
env = LocalStreamEnvironment(
    "resource_managed_app",
    config={
        "resources": {"max_workers": 16, "memory_limit": "32GB", "gpu_enabled": True}
    },
)
```

### 4. Security

Secure API keys and credentials:

```python
# Use environment variables
import os

api_key = os.getenv("OPENAI_API_KEY")

# Or use secret management
from sage.common.config import SecretManager

secrets = SecretManager()
api_key = secrets.get("openai_api_key")
```

## Scaling

### Horizontal Scaling

Add more worker nodes:

```bash
# Add Ray workers
for i in {1..5}; do
  ray start --address='head:6379' &
done
```

### Vertical Scaling

Increase resources per worker:

```python
config = {"resources": {"cpus_per_worker": 4, "memory_per_worker": "8GB"}}
```

## Cloud Platforms

### AWS

Deploy on AWS using ECS or EKS:

```yaml
# AWS ECS task definition
{
  "family": "sage-app",
  "containerDefinitions": [{
    "name": "sage",
    "image": "sage:latest",
    "memory": 8192,
    "cpu": 4096,
    "environment": [
      {"name": "SAGE_EXECUTION_MODE", "value": "distributed"}
    ]
  }]
}
```

### Google Cloud Platform

Deploy on GKE:

```bash
gcloud container clusters create sage-cluster \
  --num-nodes=3 \
  --machine-type=n1-standard-4

kubectl apply -f sage-deployment.yaml
```

### Azure

Deploy on AKS:

```bash
az aks create \
  --resource-group sage-rg \
  --name sage-cluster \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3

kubectl apply -f sage-deployment.yaml
```

## Performance Optimization

### 1. Batch Processing

```python
config = {"batch_size": 64, "prefetch_size": 128}
```

### 2. Parallel Execution

```python
stream = env.from_source(source).map(operator, parallelism=8)  # Parallel instances
```

### 3. GPU Acceleration

```python
config = {"gpu_enabled": True, "gpu_memory_fraction": 0.8}
```

## Troubleshooting

### 服务栈常见问题

- **LLM 端口启动但无法连接（特别是 WSL2）**：使用 `SagePorts.get_recommended_llm_port()` 或 `sage stack start --llm-port 8901`。
- **Embedding 生成 404**：确认 `sage stack status` 中 Embedding 组件为 `RUNNING`，并使用 `/v1/embeddings` 端点。
- **Gateway 返回 502**：Gateway 无法连接下游 LLM，检查 `--llm-port` 参数是否正确。
- **模型下载缓慢**：设置 `HF_ENDPOINT=https://hf-mirror.com` 以使用国内镜像。

### Common Issues

**Ray cluster not connecting**:

```bash
# Check Ray status
ray status

# Check network connectivity
telnet head_node 6379
```

**Out of memory**:

```python
# Reduce batch size
config = {"batch_size": 16}

# Limit workers
config = {"max_workers": 4}
```

**Slow performance**:

```python
# Enable profiling
config = {"profiling": {"enabled": True}}

# Check bottlenecks
env.get_profiler().print_report()
```

## See Also

- [Getting Started](../../getting-started/quickstart.md)
- [Best Practices](../best-practices/index.md)
- [Architecture](../../concepts/architecture/overview.md)
