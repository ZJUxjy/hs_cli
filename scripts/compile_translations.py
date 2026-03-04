"""编译.po文件为.mo文件"""

import subprocess
import sys
from pathlib import Path


def compile_po_files():
    """将所有.po文件编译为.mo文件"""
    locale_dir = Path(__file__).parent.parent / "hearthstone_cli" / "i18n" / "locales"

    po_files = list(locale_dir.rglob("*.po"))

    if not po_files:
        print("No .po files found!")
        return False

    for po_file in po_files:
        mo_file = po_file.parent / "messages.mo"

        try:
            subprocess.run(
                ["msgfmt", "-o", str(mo_file), str(po_file)],
                check=True
            )
            print(f"Compiled: {po_file} -> {mo_file}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to compile {po_file}: {e}")
            return False
        except FileNotFoundError:
            print("Error: msgfmt not found. Please install gettext.")
            print("  Ubuntu/Debian: sudo apt-get install gettext")
            print("  macOS: brew install gettext")
            return False

    print("All translations compiled successfully!")
    return True


if __name__ == "__main__":
    success = compile_po_files()
    sys.exit(0 if success else 1)
