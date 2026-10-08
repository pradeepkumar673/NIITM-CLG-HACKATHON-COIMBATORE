import asyncio
from backend.app.services.pipeline import run_analysis_task

async def main():
    print("Running analysis for study 96...")
    await run_analysis_task(96, history_flags={}, age=None, sex=None)
    print("Done.")

if __name__ == "__main__":
    asyncio.run(main())
