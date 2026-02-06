import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from huggingface_hub import hf_hub_download
from huggingface_hub.utils import RepositoryNotFoundError

# Load .env file
env_path = Path(".") / ".env"
load_dotenv(dotenv_path=env_path)

HF_TOKEN = os.getenv("HF_TOKEN")
REPO_ID = "intellistream/sagellm-benchmark-results"
REPO_TYPE = "dataset"
TARGET_DIR = Path("docs_src/data")

FILES = ["leaderboard_single.json", "leaderboard_multi.json"]


def main():
    print(f"--- Fetching Benchmark Data from HuggingFace ---")
    print(f"Repo: {REPO_ID} ({REPO_TYPE})")

    if not HF_TOKEN:
        print(
            "Warning: HF_TOKEN not found in .env. Attempting anonymous access (public repo only)."
        )
    else:
        print("HF_TOKEN loaded from .env.")

    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    success_count = 0
    for filename in FILES:
        try:
            print(f"Downloading {filename}...")
            file_path = hf_hub_download(
                repo_id=REPO_ID,
                filename=filename,
                repo_type=REPO_TYPE,
                token=HF_TOKEN,
                local_dir=TARGET_DIR,
                local_dir_use_symlinks=False,  # Download actual files, not symlinks
                force_download=True,  # Ensure fresh data
            )
            print(f"✅ Successfully downloaded to {file_path}")
            success_count += 1
        except RepositoryNotFoundError:
            print(
                f"❌ Error: Repository {REPO_ID} not found or not accessible with provided token."
            )
            print("Please check the REPO_ID in script and HF_TOKEN in .env.")
            break
        except Exception as e:
            print(f"❌ Error downloading {filename}: {str(e)}")

    if success_count == len(FILES):
        print("\nAll data files updated successfully.")
    else:
        print(f"\nCompleted with errors. ({success_count}/{len(FILES)} success)")


if __name__ == "__main__":
    main()
