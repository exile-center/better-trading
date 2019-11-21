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
dependencies: ## Install dependencies required by the application
	node ./scripts/enforce-engine-versions.js
	npm install

.PHONY: build
build:
	node ./scripts/enforce-engine-versions.js
	npm run build

.PHONY: dev
dev:
	node ./scripts/enforce-engine-versions.js
	npx ember build --watch

.PHONY: test
test: ## Run the test suite
	node ./scripts/enforce-engine-versions.js
	npx ember exam --reporter dot

.PHONY: test-browser
test-browser: ## Run the test suite
	node ./scripts/enforce-engine-versions.js
	npx ember test --server

# Check, lint and format targets
# ------------------------------

.PHONY: check-format
check-format:
	npx prettier --check $(PRETTIER_FILES_PATTERN)

.PHONY: check-types
check-types:
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
