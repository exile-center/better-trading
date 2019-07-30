# Build configuration
# -------------------

APP_NAME = `grep -m1 name package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
APP_VERSION = `grep -m1 version package.json | awk -F: '{ print $$2 }' | sed 's/[ ",]//g'`
GIT_REVISION = `git rev-parse HEAD`

# Linter and formatter configuration
# ----------------------------------

JAVASCRIPT_FILES_PATTERN = ember-cli-build.js testem.js app/ tests/ config/ scripts/
PRETTIER_FILES_PATTERN = ember-cli-build.js testem.js '{app,tests,config,scripts}/**/*.{ts,js,scss}' '**/*.md'
STYLES_PATTERN = './app/**/*.scss'
TEMPLATES_PATTERN = './app/**/*.hbs'
TYPESCRIPT_FILES_PATTERN = '{app,tests,config}/**/*.ts'

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
	npm install

.PHONY: build-app
build-app:
	npm run build

.PHONY: test
test: ## Run the test suite
	rm -rf ./coverage && COVERAGE=true npx ember exam --split 5 --parallel --reporter dot

# Check, lint and format targets
# ------------------------------

.PHONY: check-format
check-format:
	npx prettier --check $(PRETTIER_FILES_PATTERN)

.PHONY: check-types
check-types:
	npx tsc

.PHONY: check-code-overage
check-code-coverage:
	npx nyc check-coverage

.PHONY: format
format: ## Format project files
	- npx prettier --write $(PRETTIER_FILES_PATTERN)
	- npx eslint --fix $(JAVASCRIPT_FILES_PATTERN)
	- npx stylelint --fix $(STYLES_PATTERN)
	- count=`ls -1 ./public/**/*.svg 2>/dev/null | wc -l` ; \
    if [ $$count != 0 ] ; then \
      npx svgo --config=.svgo.yml --recursive --folder ./public ; \
    fi;

.PHONY: lint
lint: lint-scripts lint-styles lint-templates ## Lint project files

.PHONY: lint-scripts
lint-scripts:
	npx eslint $(JAVASCRIPT_FILES_PATTERN)
	npx tslint $(TYPESCRIPT_FILES_PATTERN)

.PHONY: lint-styles
lint-styles:
	npx stylelint $(STYLES_PATTERN)

.PHONY: lint-templates
lint-templates:
	npx ember-template-lint $(TEMPLATES_PATTERN)
