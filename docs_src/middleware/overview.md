# SAGE Middleware 概览

SAGE Middleware 是一个模块化、高性能的中间件层，为SAGE推理框架提供核心基础设施支持。它采用分层架构设计，提供向量增强、流数据处理、神经记忆管理与复杂数据处理能力，兼顾效果、效率和效能。

## 架构概述

```mermaid
flowchart TB
  App["应用层 (App)"]
  subgraph MW["SAGE Middleware"]
    direction TB
    subgraph API[API 层]
      SvcAPI[Service 调用接口]
      ComputeAPI[计算接口]
    end
    subgraph Services[服务层]
      Memory[Memory Service]
      SageDBSvc["SAGE-DB Service"]
      Other[其他服务]
    end
    subgraph Components[组件层]
      SageDB["SAGE-DB"]
      NeuroMem[NeuroMem]
      Vector["SAGE-Flow"]
    end
    subgraph HW[硬件层]
      GPU[GPU 加速]
      CXL[CXL 内存]
      Affinity[硬件亲和计算]
    end
  end
  Kernel["内核层 (Kernel)"]
  App --> MW --> Kernel
```

## 核心特性

### 🔌 模块化设计
- 服务解耦：每个服务都是独立的微服务，基于 BaseService 实现
- 灵活组合：服务可以独立部署、测试和扩展
- 统一接口：通过标准化 API 接口进行服务交互（call_service/call_service_async）

### ⚡ 高性能处理
- 异步通信：基于 SAGE 内核的高性能队列机制
- 并发处理：支持多线程和分布式处理
- 资源优化：智能资源分配和硬件加速

### 🧠 智能记忆
- 多模态存储：支持键值、向量、图等多种数据结构
- 记忆编排：高级记忆管理和智能检索
- 长期记忆：持久化神经记忆存储

### 🌐 分布式支持
- Ray 集成：原生支持 Ray 分布式计算
- 服务发现：自动服务注册和发现
- 负载均衡：智能负载分配和故障恢复

## 设计理念

1) 抽象与实现分离
- 抽象服务接口：通过 BaseFunction/BaseService 的 call_service 访问服务
- 计算接口：如 SAGE Flow 提供可编程接口

2) 服务编排模式
- 基础服务：KV、VDB、Graph 等提供底层存储能力
- 编排服务：Memory Service 等协调基础服务提供高级功能

3) 硬件亲和优化
- GPU 加速：向量相似度计算优化
- CXL 内存：大容量内存后端支持
- 专用后端：为不同硬件提供最优计算后端

## 核心组件

- API 层：Service 调用接口（BaseFunction/BaseService 的 call_service/call_service_async）
- 服务层：Memory Service、SAGE-DB Service 等
- 组件层：SAGE-DB、NeuroMem、SAGE Flow 等
- 硬件层：GPU 加速、CXL 内存

### 原生扩展组件

- **SAGE DB**：高性能向量数据库组件，提供多模态向量索引、元数据过滤与 Hybrid 查询。位于 `packages/sage-middleware/src/sage/middleware/components/sage_db`，通过 `sage extensions install sage_db` 构建后可供 Memory、RAG 等服务直接调用。
- **SAGE Flow**：向量流式处理引擎，为实时语境维护与窗口算子提供底层支持。源码位于 `packages/sage-middleware/src/sage/middleware/components/sage_flow`，可用 `sage extensions install sage_flow` 完成编译并在服务层注册为计算接口。

使用 `sage extensions status` 可以检查扩展可用性，`tools/tests/test_cpp_extensions.py` 提供了针对两大扩展的导入与功能自检。

## 使用场景

- 智能检索系统
- 大规模数据存储
- 长期记忆管理

## 开发指南（简要）

- 服务注册（示例，详见“服务快速入门”）
- 在 Function 中调用服务：self.call_service["service_name"].method(...)
