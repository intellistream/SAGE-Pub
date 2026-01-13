# Tutorials - Migrated to sage-benchmark

**⚠️ These tutorials have been migrated to the sage-benchmark repository.**

Please visit: **[intellistream/sage-benchmark/docs/tutorials](https://github.com/intellistream/sage-benchmark/tree/main-dev/docs/tutorials)**

## Why the Migration?

Tutorials are more closely related to benchmarking and evaluation workflows, which are the primary focus of the sage-benchmark repository. This separation provides:

- **Better Organization**: Tutorials stay with the tools they demonstrate
- **Independent Versioning**: sage-benchmark can evolve its tutorials independently
- **Clearer Scope**: SAGE main repo focuses on core framework documentation

## What Was Moved?

- ✅ Basic tutorials (`hello_batch.md`, `streaming-101.md`, operators)
- ✅ Advanced tutorials (RAG, workflows, custom operators, distributed pipelines, fault tolerance, performance tuning)
- ✅ Tutorial-example mappings

## Finding the Tutorials

```bash
# Clone sage-benchmark
git clone https://github.com/intellistream/sage-benchmark.git
cd sage-benchmark

# Tutorials are in docs/tutorials/
ls docs/tutorials/
# basic/  advanced/  tutorial-example-map.md
```

## Related Documentation

- **SAGE Core Guides**: [`docs-public/docs_src/guides/`](../guides/)
- **SAGE Concepts**: [`docs-public/docs_src/concepts/`](../concepts/)
- **sage-benchmark README**: [sage-benchmark/README.md](https://github.com/intellistream/sage-benchmark/blob/main-dev/README.md)
