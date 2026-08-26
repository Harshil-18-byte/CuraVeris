"""Script: Build and populate persistent ChromaDB vector index for statutory benchmarks.
Embeds CGHS procedures, NPPA device price caps, and DPCO drug MRPs with BioBERT.
"""

import os
import sys

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.db.chroma_client import init_chroma_collections, get_chroma_client


def main():
    print("[*] Initializing ChromaDB vector index...")
    collections = init_chroma_collections()
    print("[✓] ChromaDB Vector Index built successfully:")
    for name, coll in collections.items():
        print(f"    - {name:20s}: {coll.count()} items indexed")


if __name__ == "__main__":
    main()
