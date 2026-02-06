# How to Submit Benchmark Results

This directory contains the source data for the SAGE Performance Leaderboard. The live website fetches data directly from the Hugging Face Dataset repository: [**intellistream/sagellm-benchmark-results**](https://huggingface.co/datasets/intellistream/sagellm-benchmark-results).

To contribute new benchmark results (e.g., for a new SAGE version release), follow these steps.

## 1. Data Structure

We track three main metrics for standard workloads (Q1, Q2, Q3):
- **Latency P99 (ms)**
- **Throughput (QPS)**
- **Success Rate (%)**

Results are stored in two JSON files:
- `leaderboard_single.json`: Single-node benchmarks (e.g., 1x A100, 1x H800)
- `leaderboard_multi.json`: Distributed/Cluster benchmarks (e.g., 8x A100)

## 2. JSON Schema

Each entry in the JSON array must follow this structure:

```json
{
  "entry_id": "sha256-hash-or-unique-string",  // Unique identifier for this run
  "sage_version": "0.6.0",                      // SAGE Core version
  "resource_config": {
    "gpu_type": "A100-80G",                     // Hardware identifier
    "gpu_count": 1,
    "memory_gb": 80
  },
  "workload": "Q1 (Standard RAG)",              // Q1, Q2, or Q3
  "metrics": {
    "latency_p99": 145.2,                       // Milliseconds
    "throughput_qps": 22.5,                     // Queries Per Second
    "success_rate": 99.9,                       // Percentage (0-100)
    "input_tokens_avg": 512,                    // Workload characteristic
    "output_tokens_avg": 128                    // Workload characteristic
  },
  "components": {                               // Version breakdown for detail view
    "sage_core": "0.6.0",
    "engine": "v0.6.0",                         // e.g. vLLM version
    "retriever": "sagevdb-0.2.1"                // Component version
  },
  "timestamp": "2024-03-20T10:00:00Z"           // Run time
}
```

### Supported Workloads
- **Q1 (Standard RAG)**: Simple retrieval-augmented generation.
- **Q2 (Long Context)**: Long-context summarization/QA.
- **Q3 (Agent Planning)**: Multi-step agentic reasoning.

## 3. Submission Process

1. **Run Benchmark**:
   Use `sage-benchmark` to generate result metrics.
   ```bash
   sage-benchmark run --workload q1 --output results.json
   ```

2. **Format Data**:
   Convert your raw results into the JSON entry format above.

3. **Clone Dataset**:
   ```bash
   git clone https://huggingface.co/datasets/intellistream/sagellm-benchmark-results
   cd sagellm-benchmark-results
   ```

4. **Update Files**:
   Append your new entry to `leaderboard_single.json` (or multi).

   **Important**: Ensure `entry_id` is unique.

5. **Push Changes**:
   ```bash
   git add leaderboard_single.json
   git commit -m "Add benchmark results for SAGE v0.6.0 on A100"
   git push
   ```

The SAGE website will automatically reflect the changes within a few minutes (depending on cache/deployment).
