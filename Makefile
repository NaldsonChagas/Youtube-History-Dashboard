.PHONY: install build-api build-web build-electron build migrate setup dev package help

install:
	cd src/api && pnpm install
	cd src/web && pnpm install
	cd src/electron && pnpm install

build-api:
	cd src/api && pnpm run build

build-web:
	cd src/web && pnpm run build

build-electron:
	cd src/electron && pnpm run build

build: build-api build-web build-electron

migrate: build-api
	cd src/api && pnpm run migrate

setup: install build migrate

dev: setup
	cd src/electron && pnpm run dev

package: install build
	cd src/api && pnpm install --prod --frozen-lockfile
	cd src/electron && pnpm run package

help:
	@echo "Targets:"
	@echo "  install       - pnpm install in src/api, src/web, src/electron"
	@echo "  build-api     - build API (src/api)"
	@echo "  build-web     - build web (src/web)"
	@echo "  build-electron - build Electron (src/electron)"
	@echo "  build         - build-api, build-web, build-electron"
	@echo "  migrate       - run DB migration (uses default path in user home)"
	@echo "  setup         - install, build, migrate"
	@echo "  dev           - setup then run Electron (default)"
	@echo "  package       - build all and create installers (output in releases/)"
	@echo "  help          - show this message"
