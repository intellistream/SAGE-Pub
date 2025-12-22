# Legacy algorithm gap analysis

**Date**: 2024-11-07  
**Author**: SAGE Development Team  
**Summary**: Analysis of ANN algorithms from legacy sage-db_outdated codebase and their migration status to current SAGE repository

This note captures the ANN algorithm implementations that only exist in the legacy `sage-db_outdated` codebase and summarizes their status inside the current `SAGE` repository. The goal is to make it easy to raise follow-up issues for anything that still needs to be ported.

## Snapshot overview

| Algorithm | Legacy entry points | What it does | Key configs & dependencies | Presence in `SAGE` (main-dev) | Migration notes |
| --- | --- | --- | --- | --- | --- |
| **SONG** | `include/Algorithms/SONG/*.hpp`<br>`src/Algorithms/SONG/SONG.cu` | CUDA-accelerated sparse graph ANN index with warp-level A* search, mutable insert/delete/revise APIs and GPU perf stats. | `metricType` (`L2`/`IP`/`cos`), `vecDim`, `vecVolume`; custom CUDA kernels in `SONG_KERNEL::*`; relies on LibTorch/Tensor ops. | **Missing** – no SONG code paths or config knobs found in `packages/` or middleware. | Requires C++/CUDA extension build tooling, graph kernels, and tensor-to-graph adapters. Likely port target for GPU ANN story. |
| **Vamana** | `include/Algorithms/Vamana/vamana.hpp`<br>`src/Algorithms/Vamana/*.cpp` | Hierarchical graph ANN (similar to DiskANN) with greedy search, robust pruning, incremental insert/delete and lazy compaction. | Config keys: `M`, `Mmax`, `efConstruction`, `efSearch`, `initialVolume`, `vecDim`; uses custom `vertex` graph + Torch tensors. | **Missing** – no Vamana symbol or config in current tree. | Migration needs graph + storage abstractions; could integrate with existing `sage_db` storage managers. |
| **FlatGPUIndex** | `include/Algorithms/FlatGPUIndex/FlatGPUIndex.hpp`<br>`src/Algorithms/FlatGPUIndex/*.cpp` | GPU-enabled flat index with batched DCO (distance comparison operations), pluggable AMD/CRS sketches, GPU stats, and buffer-backed insert/delete/revise. | Config keys: `metricType`, `memBufferSize`, `sketchSize`, `DCOBatchSize`, `cudaDevice`; uses `PlainMemBufferTU`, LibTorch CUDA, optional sketch backends. | **Missing** – no equivalent GPU flat index in `SAGE`; current stack delegates to FAISS/CPU indices. | Needs torch CUDA runtime, buffer abstraction, and careful batching to align with middleware APIs. |
| **KDTree** | `include/Algorithms/KDTree/*` | Classic KD-tree ANN/point lookup utilities. | CPU-only; Torch tensors + STL. | **Missing** – no KDTree wrapper in main repo. | Decide if FAISS already covers needed KD-tree functionality; otherwise port or drop. |
| **KNN / LSH wrappers** | `include/Algorithms/KNN/*`, `include/Algorithms/LSH/*` | Basic brute-force KNN and locality-sensitive hashing indices. | CPU, Torch tensors, optional AMM sketches. | **Superseded via FAISS** – current `sage_db` FAISS plugin exposes `IndexFlat*`, `IndexLSH`, etc. | Likely no action unless custom behavior from legacy version is required. |
| **HNSW** | `include/Algorithms/HNSW/*` | Hierarchical NSW implementation. | CPU, Torch tensors. | **Covered** – new middleware ships FAISS HNSW (`faiss_plugin.cpp`, `sage_flow/index/hnsw.*`). | Only needed as reference; modern stack already wraps FAISS HNSW. |

## Additional observations

* The legacy algorithms assume a Torch C++ (LibTorch) runtime and, for SONG/FlatGPUIndex, a CUDA toolchain. Porting them will require extending the current build system (CMake + Python wheels in `packages/sage-middleware`) to compile extra CUDA sources and surface new bindings.
* Legacy `AlgorithmTable` in `sage-db_outdated/src/Algorithms/AlgorithmTable.cpp` registers SONG, Vamana, FlatGPUIndex, and other indices into a runtime factory. The modern `sage_db` middleware currently exposes only FAISS-backed indices; adding these algorithms will likely require a new plugin or a mixed backend registry.
* Deletion and revision flows in SONG/Vamana rely on custom graph maintenance that has no equivalent in the FAISS pipeline today. We will need storage primitives that can surface mutable graph state (possibly via the existing `StorageManager` abstraction in `sage_flow`).
* The CUDA kernels under `include/Algorithms/SONG/*.cuh` and `src/Algorithms/SONG` have hard-coded metric switches (`L2`, `IP`, `cos`). Any port should ensure metrics align with the enums already defined in `sage_db/common.h`.
* FlatGPUIndex tracks GPU compute/communication timings via `gpuComputingUs`/`gpuCommunicationUs`. If ported, these stats could feed into the observability hooks that the new repository provides for pipeline tracing.

## SONG torch-free integration feasibility

### Key findings

* The heavy SONG logic (graph storage, CUDA kernels in `kernelgraph.cuh` / `warp_astar_accelerator.cuh`, and memory buffers in `data.hpp`) only depends on STL, CUDA runtime, and cuBLAS headers. Torch usage is confined to the `SONG` wrapper (`SONG.hpp`/`SONG.cu`) for tensor ingestion and result emission.
* Replacing the tensor adapters with standard containers is straightforward: `convertTensorToVectorPair{Batch}` simply loops over tensor rows/columns to build `std::vector<std::pair<int,float>>`. The same loops can operate on `sage_db::Vector` (dense `std::vector<float>`) or sparse views without LibTorch.
* The CUDA kernel already operates on raw device buffers; no ATen/Torch kernels are invoked. We only need host-side glue to stage data into contiguous buffers before launches.

### How it would plug into `sage_db`

* Implement a new `SongANNS` plugin deriving from `anns::ANNSAlgorithm`. During `fit` it would:
	* Cache the external `VectorId` values in an `id_map` so the GPU index can continue using dense `idx_t` identifiers internally.
	* Allocate `SONG_KERNEL::Data` with `vecVolume = dataset.size()` (or rounded upward) and sequentially call `add_vertex` as the legacy build path does.
	* Translate `AlgorithmParams` (`metric`, `vecDim`, optional `vecVolume`, search degrees) into the legacy configuration knobs.
* Queries are converted to the legacy sparse vector representation, dispatched through `WarpAStarAccelerator::astar_multi_start_search_batch`, and rewrapped as `ANNSResult`. The plugin can reuse the existing batching API by splitting the query list into `vector<Vector>` chunks.
* Incremental inserts map directly to `graph->add_vertex` and `data->add`, so `supports_updates()` can remain `true`. Deletes/revisions stay unsupported, matching the legacy behavior.

### Build and runtime considerations

* `sage_db` currently builds only C++ sources. We will need an optional CUDA build path (e.g., `ENABLE_SONG`) that:
	* Adds the legacy headers and the `SONG.cu` translation unit.
	* Enables the CUDA language in CMake, links against `cuda_runtime`/`cublas`, and adjusts install rules for the shared library.
	* Exposes a Python wheel extra so downstream users opt in to the additional dependency footprint.
* The kernel allocates device memory with `new`/`delete`; production builds should call `cudaDeviceSetLimit(cudaLimitMallocHeapSize, …)` once during initialization to avoid heap overflow. Logging statements (`printf` inside kernels) ought to be gated behind a debug macro before shipping.
* `WarpAStarAccelerator` currently copies the full graph to GPU memory for every batch query. For parity we can keep the behavior, but medium-term we should cache device buffers across queries or add an explicit `prepare_gpu_buffers()` step to avoid redundant copies.

### Suggested next steps

1. **Spike the build system**: prototype `ENABLE_SONG` in `sageDB/CMakeLists.txt`, verify we can compile the legacy CUDA code without LibTorch, and document required CUDA versions.
2. **Draft `SongANNS`**: scaffold the plugin, implement dense-to-sparse conversion helpers, and route search/add flows to the legacy kernels.
3. **System tests**: port a small dataset fixture from `sage-db_outdated` to validate recall vs. FAISS and ensure CUDA heap sizing/logging is sane.
4. **Performance follow-ups** (optional): investigate caching GPU buffers and reducing kernel-side `new` usage once the basic integration is functional.

## Other legacy components status

The remaining directories under `sage-db_outdated` were scanned to determine whether anything besides the ANN backends is worth migrating before we delete the repository. Highlights:

| Area | Legacy scope | Current `SAGE` status | Migration call |
| --- | --- | --- | --- |
| **VectorDB & StreamAPI** (`include/Core/vector_db.hpp`, `include/API/StreamAPI.hpp`) | Torch-based in-memory `VectorDB` with ad-hoc streaming helpers (`VectorDBStream::map/filter/to_sink`). Relies on `SeparateANNSBase` and Torch tensors. | Replaced by `sage_db::VectorStore` + `sage_flow` streaming/runtime layers (`sageFlow/src/stream/*`, `storage/storage_manager.cpp`). Modern code is thread-safe, Torch-free, and already integrated with the middleware. | **Skip** – keeping the new `VectorStore`/`sage_flow` stack is cleaner; porting the old Torch-centric API would regress architecture. |
| **Storage engine** (`IO/BasicStorage.*`) | Simple `std::map<vid, torch::Tensor>` plus LibTorch distance helpers. No persistence or concurrency. | Superseded by `VectorStore` and `sage_flow::StorageManager`, both operating on `std::vector<float>`/`VectorRecord` with shared-mutex protection and persistence hooks. | **Skip** – obsolete; new storage layer is richer and Torch-free. |
| **Data loaders** (`DataLoader/FVECSDataLoader.cpp`, `RandomDataLoader.cpp`) | Torch tensor loaders for `.fvecs` and synthetic data. | `sage_flow` ships fvec readers (`stream/data_stream_source/sift_stream_source.cpp`), dataset configs, and examples; Python layer also covers dataset ingestion. | **Optional** – only port if you need legacy Torch tensor APIs; otherwise rely on `sage_flow` sources. |
| **Compute engine** (`ComputeEngine/BasicComputeEngine.*`) | Wraps Torch distance computation for the old storage engine. | New pipeline embeds distance logic inside ANNS plugins (`VectorStore`) and `sage_flow` compute engines; no Torch requirement. | **Skip** – redundant with current modules. |
| **GPU/Optimization/Parallelism/Performance/Transaction** | Mostly placeholder headers (`class gpu_scheduler {}` etc.) with no usable implementation. | Modern repo already has richer GPU + scheduling components inside `sage_flow` or relies on external libraries. | **Skip** – nothing actionable to migrate. |
| **Utilities** (`Utils/TensorOP.cpp`, `file_loader.cpp`, `thread_pool.cpp`) | Torch helpers for tensor slicing and file-based dataset loading. | New codebase uses STL/`VectorRecord` helpers and has its own logging/config utilities (`sageFlow/src/utils`). Where needed, equivalent helpers already exist without Torch. | **Selective** – only extract specific utilities (e.g., fvec readers) if gaps show up; otherwise the new stack covers them. |

**Bottom line:** beyond the ANN CUDA backends (SONG/Vamana/FlatGPU), the legacy repository does not contain production-ready features that the modern codebase lacks. Most other directories are either Torch-dependent stopgaps or empty shells. It is safe to drop `sage-db_outdated` once the desired ANN ports (if any) are captured or re-implemented.

## Suggested follow-up issues

1. **Port SONG CUDA graph index** – spike on build integration, dependency footprint, and runtime wiring to `sage_db` storage.
2. **Evaluate Vamana integration** – confirm performance goals, plan for graph maintenance APIs, and feature-flag experimental backend.
3. **Assess FlatGPUIndex gap** – decide whether FAISS GPU indices cover the same use cases or if the custom implementation is still required (especially for sketch-based DCO flows).
4. **Inventory smaller CPU indices (KDTree/KNN/LSH)** – confirm whether FAISS parity is sufficient; if not, detail missing features.

These notes should provide enough context to author targeted GitHub issues in the core repository.
