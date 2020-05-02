# Build configuration
# -------------------

APP_NAME = `grep -m1 name package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
APP_VERSION = `grep -m1 version package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
GIT_REVISION = `git rev-parse HEAD`

# Linter and formatter configuration
# ----------------------------------

PRETTIER_FILES_PATTERN = ember-cli-build.js testem.js '{app,tests,config,scripts}/**/*.{ts,js,graphql,scss}' '**/*.md'
STYLES_PATTERN = './app/**/*.scss'
TEMPLATES_PATTERN = './app/**/*.hbs'

# Introspection targets
# ---------------------

.PHONY: help
help: header targets

.PHONY: header
header:
	@echo "\033[34mEnvironment\033[0m"
	@echo "\033[34m---------------------------------------------------------------\033[0m"
	@printf "\033[33m%-23s\033[0m" "APP_NAME"
	@printf "\033[35m%s\033[0m" $(APP_NAME)
	@echo ""
	@printf "\033[33m%-23s\033[0m" "APP_VERSION"
	@printf "\033[35m%s\033[0m" $(APP_VERSION)
	@echo ""
	@printf "\033[33m%-23s\033[0m" "GIT_REVISION"
	@printf "\033[35m%s\033[0m" $(GIT_REVISION)
	@echo "\n"

.PHONY: targets
targets:
	@echo "\033[34mTargets\033[0m"
	@echo "\033[34m---------------------------------------------------------------\033[0m"
	@perl -nle'print $& if m{^[a-zA-Z_-]+:.*?## .*$$}' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'


# Development targets
# -------------------

.PHONY: dependencies
dependencies: ## Install required dependencies
	node ./scripts/enforce-engine-versions.js
	npm install

.PHONY: build
build: ## Build and bundle the extension for release
	node ./scripts/enforce-engine-versions.js
	rm -rf ./dist
	npx ember build --environment production --output-path ./dist/ember-build
	## Patch the vendor.js to prevent a check from failing on Firefox
	sed -i "" -E 's/var t="object"==typeof self&&null!==self&&self.Object===Object&&"undefined"!=typeof Window&&self.constructor===Window&&"object"==typeof document&&null!==document&&self.document===document&&"object"==typeof location&&null!==location&&self.location===location&&"object"==typeof history&&null!==history&&self.history===history&&"object"==typeof navigator&&null!==navigator&&self.navigator===navigator&&"string"==typeof navigator.userAgent/var t=true/g' ./dist/ember-build/assets/vendor.js
	mkdir -p ./dist/staged/assets
	cp -R ./dist/ember-build/assets/{better-trading.js,better-trading.css,vendor.js,vendor.css,images} ./dist/staged/assets
	node ./scripts/generate-manifest.js production
	cp ./extension/* ./dist/staged
	(cd ./dist/staged/; zip -r ../chrome.zip *)

.PHONY: dev
dev: ## Build the extension for development purposes, watching files for update
	node ./scripts/enforce-engine-versions.js
	rm -rf ./dist
	mkdir -p ./dist/dev
	node ./scripts/generate-manifest.js dev
	cp ./extension/* ./dist/dev
	npx ember build --watch --environment development --output-path ./dist/dev/ember-build

.PHONY: test
test: ## Run the test suite
	node ./scripts/enforce-engine-versions.js
	npx ember exam --reporter dot

.PHONY: test-browser
test-browser: ## Run the test suite within a browser
	node ./scripts/enforce-engine-versions.js
	npx ember test --server

# Check, lint and format targets
# ------------------------------

.PHONY: check-format
check-format: ## Verify prettier formatting
	npx prettier --check $(PRETTIER_FILES_PATTERN)

.PHONY: check-types
check-types: ## Verify typescript typings
	# See https://github.com/glimmerjs/glimmer-vm/issues/946 for details about the
	# --skipLibCheck flag
	npx tsc --skipLibCheck

.PHONY: format
format: ## Format project files
	- npx prettier --write $(PRETTIER_FILES_PATTERN)
	- npx stylelint $(STYLES_PATTERN) --fix --quiet
	- npx eslint --ext .js,.ts . --fix --quiet

.PHONY: lint
lint: lint-scripts lint-styles lint-templates ## Lint project files

.PHONY: lint-scripts
lint-scripts:
	npx eslint --ext .js,.ts .

.PHONY: lint-styles
lint-styles:
	npx stylelint $(STYLES_PATTERN)

.PHONY: lint-templates
lint-templates:
	npx ember-template-lint $(TEMPLATES_PATTERN)
