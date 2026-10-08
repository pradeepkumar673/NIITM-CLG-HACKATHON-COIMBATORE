import sys
import time

import torch


def check_gpu():
    print(f"PyTorch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    if not torch.cuda.is_available():
        print("CUDA is not available. Exiting.")
        sys.exit(1)
        
    print(f"CUDA Version: {torch.version.cuda}")
    print(f"GPU Name: {torch.cuda.get_device_name(0)}")
    
    cap = torch.cuda.get_device_capability(0)
    print(f"Compute Capability: {cap[0]}.{cap[1]}")
    
    total_mem = torch.cuda.get_device_properties(0).total_memory / (1024**3)
    free_mem, _ = torch.cuda.mem_get_info(0)
    free_mem = free_mem / (1024**3)
    print(f"VRAM Total: {total_mem:.2f} GB, Free: {free_mem:.2f} GB")
    
    print("\nRunning matmul test...")
    # 4096x4096 half-precision matmul
    A = torch.randn(4096, 4096, dtype=torch.float16, device="cuda")
    B = torch.randn(4096, 4096, dtype=torch.float16, device="cuda")
    torch.cuda.synchronize()
    
    start = time.time()
    C = torch.matmul(A, B)
    torch.cuda.synchronize()
    elapsed = time.time() - start
    print(f"Matmul Time: {elapsed:.4f} seconds")
    
    print("\nRunning DenseNet121 test...")
    try:
        from torchvision import models
        model = models.densenet121(weights=None).cuda()
        # autocast at batch 8, 224x224
        x = torch.randn(8, 3, 224, 224, device="cuda")
        
        optimizer = torch.optim.SGD(model.parameters(), lr=0.01)
        optimizer.zero_grad()
        
        torch.cuda.reset_peak_memory_stats()
        
        with torch.autocast(device_type="cuda", dtype=torch.float16):
            out = model(x)
            loss = out.sum()
            
        loss.backward()
        optimizer.step()
        
        peak_mem = torch.cuda.max_memory_allocated() / (1024**2)
        print(f"Peak VRAM during forward+backward: {peak_mem:.2f} MB")
        
    except Exception as e:
        print(f"Error during DenseNet121 test: {e}")

if __name__ == "__main__":
    check_gpu()
