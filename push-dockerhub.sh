#!/bin/bash

# Build and tag the image
docker build -t khcjump/mcp-smily:local .

docker tag khcjump/mcp-smily:local khcjump/mcp-smily:latest

# To push to Docker Hub:
docker push khcjump/mcp-smily:latest