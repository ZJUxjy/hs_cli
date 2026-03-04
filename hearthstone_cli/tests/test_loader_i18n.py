"""测试卡牌加载器的i18n支持"""
import pytest
from unittest.mock import patch, MagicMock
from pathlib import Path

from hearthstone_cli.cards.loader import CardLoader
from hearthstone_cli.i18n import set_language


class TestCardLoaderI18n:
    """测试 CardLoader 的国际化支持"""

    def test_using_cached_data_zhCN(self, capsys, tmp_path):
        """测试中文缓存数据提示"""
        set_language("zhCN")
        cache_path = tmp_path / "cards_zhCN.json"
        cache_path.write_text("[]")

        loader = CardLoader(locale="zhCN", cache_dir=tmp_path)

        with patch.object(loader, '_get_cache_path', return_value=cache_path):
            loader.download_cards()

        captured = capsys.readouterr()
        assert "使用缓存的卡牌数据:" in captured.out

    def test_using_cached_data_enUS(self, capsys, tmp_path):
        """测试英文缓存数据提示"""
        set_language("enUS")
        cache_path = tmp_path / "cards_enUS.json"
        cache_path.write_text("[]")

        loader = CardLoader(locale="enUS", cache_dir=tmp_path)

        with patch.object(loader, '_get_cache_path', return_value=cache_path):
            loader.download_cards()

        captured = capsys.readouterr()
        assert "Using cached card data:" in captured.out

    def test_downloading_cards_zhCN(self, capsys, tmp_path):
        """测试中文下载卡牌提示"""
        set_language("zhCN")
        loader = CardLoader(locale="zhCN", cache_dir=tmp_path)

        # 确保没有缓存
        cache_path = loader._get_cache_path()
        if cache_path.exists():
            cache_path.unlink()

        with patch('requests.get') as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = [{"id": "TEST_001"}]
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response

            loader.download_cards()

        captured = capsys.readouterr()
        assert "正在下载卡牌数据:" in captured.out
        assert "已下载" in captured.out
        assert "张卡牌" in captured.out

    def test_downloading_cards_enUS(self, capsys, tmp_path):
        """测试英文下载卡牌提示"""
        set_language("enUS")
        loader = CardLoader(locale="enUS", cache_dir=tmp_path)

        # 确保没有缓存
        cache_path = loader._get_cache_path()
        if cache_path.exists():
            cache_path.unlink()

        with patch('requests.get') as mock_get:
            mock_response = MagicMock()
            mock_response.json.return_value = [{"id": "TEST_001"}]
            mock_response.raise_for_status.return_value = None
            mock_get.return_value = mock_response

            loader.download_cards()

        captured = capsys.readouterr()
        assert "Downloading card data:" in captured.out
        assert "Downloaded" in captured.out
        assert "cards" in captured.out

    def test_download_failed_zhCN(self, capsys, tmp_path):
        """测试中文下载失败提示"""
        set_language("zhCN")
        loader = CardLoader(locale="zhCN", cache_dir=tmp_path)

        # 确保没有缓存，这样失败时不会使用缓存
        cache_path = loader._get_cache_path()
        if cache_path.exists():
            cache_path.unlink()

        with patch('requests.get') as mock_get:
            import requests
            mock_get.side_effect = requests.RequestException("网络错误")

            with pytest.raises(requests.RequestException):
                loader.download_cards()

        captured = capsys.readouterr()
        assert "下载失败:" in captured.out

    def test_download_failed_enUS(self, capsys, tmp_path):
        """测试英文下载失败提示"""
        set_language("enUS")
        loader = CardLoader(locale="enUS", cache_dir=tmp_path)

        # 确保没有缓存，这样失败时不会使用缓存
        cache_path = loader._get_cache_path()
        if cache_path.exists():
            cache_path.unlink()

        with patch('requests.get') as mock_get:
            import requests
            mock_get.side_effect = requests.RequestException("Network error")

            with pytest.raises(requests.RequestException):
                loader.download_cards()

        captured = capsys.readouterr()
        assert "Download failed:" in captured.out
