.PHONY: i18n-compile test

i18n-compile:
	@python scripts/compile_translations.py

test:
	@pytest tests/test_i18n*.py -v
