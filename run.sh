#!/usr/bin/env sh
# @kiavashmax
cd "$(dirname "$0")"
P=8080
if command -v python3 >/dev/null 2>&1; then
    python3 -m http.server $P
elif command -v python >/dev/null 2>&1; then
    python -m http.server $P
elif command -v npx >/dev/null 2>&1; then
    npx --yes serve -l $P .
else
    echo "need python or node"
fi