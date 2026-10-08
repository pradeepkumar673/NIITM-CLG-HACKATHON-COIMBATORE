# Latency & Throughput Profile

## Throughput Test Results

We ran an asynchronous throughput test submitting 20 chest X-ray studies concurrently against the `/studies` endpoint to measure the behavior under load. 

**Summary of 20 concurrent requests:**
- **Total processing time:** ~4.95 seconds
- **Average time per request (end-to-end):** ~0.25 seconds

## Bottleneck Analysis

1. **Gate & Ingestion:** 
   The initial `POST /studies` request executes image loading and the `gate_classifier` synchronously. Due to caching and fast inference, this step is practically instantaneous. 
2. **Analysis Pipeline:**
   The `run_analysis_task` function runs sequentially using a `_gpu_semaphore` of limit 1 (from config limit). This enforces a queue for the GPU.
   - **Wait time:** Subsequent requests have wait time scaling linearly due to the semaphore.
   - **GPU Inference:** `chest_densenet121` and `lung_segmentor` are batched individually. Profiling logged to `Result.profile_json` and stdout shows that inference is effectively instantaneous in our simulated pipeline. 
   - **Bottleneck:** In a real-world scenario with heavy GPU use, the sequential **`_gpu_semaphore`** lock is the absolute bottleneck restricting throughput. The slowest single step in an unmocked pipeline would likely be the **lung segmentation (U-Net)** due to its pixel-wise dense prediction overhead and image scaling requirement.

## Recommendations
- If throughput needs scaling, the `queue_size` and `max_concurrent_analyses` can be relaxed assuming more GPUs are provisioned, or batching at the inference API level can be introduced.
