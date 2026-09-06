import sys
import os
sys.path.insert(0, os.path.abspath("."))
import asyncio
import json
from backend.engine.agent_graph import VeritasAgentGraph

async def main():
    print("Testing VeritasAgentGraph live stream...")
    graph = VeritasAgentGraph()
    count = 0
    async for sse_event in graph.run_stream("MIT student nuclear reactor dorm rumor", depth="quick"):
        count += 1
        lines = [l for l in sse_event.split("\n") if l.startswith("data: ")]
        for line in lines:
            payload = json.loads(line[6:])
            evt = payload.get("event")
            print(f"[{evt}]", str(payload.get("data"))[:120])
            if evt == "dossier_ready":
                print(">>> DOSSIER READY: Verdict =", payload["data"]["dossier"]["verdict"], "Truth Score =", payload["data"]["dossier"]["truth_score"])
    print(f"Stream test completed successfully with {count} events!")

if __name__ == "__main__":
    asyncio.run(main())
