#!/usr/bin/env python
import os
import sys

# Set working directory
os.chdir(r"C:\College\Urban Hive\UrbanHive\GreenCorridor\Model")

# Import and run uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "fastapi_server:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )
