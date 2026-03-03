#!/usr/bin/env python3
"""Main entry point for Hearthstone CLI."""
from cli.menu.menu_system import MenuSystem


def main():
    """Main entry point."""
    print("欢迎来到炉石传说 CLI!")
    print()

    try:
        menu = MenuSystem()
        menu.run()
    except KeyboardInterrupt:
        print("\n\n感谢游玩!")
    except Exception as e:
        print(f"\n错误: {e}")
        return 1

    return 0


if __name__ == "__main__":
    exit(main())
