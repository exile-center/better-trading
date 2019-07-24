#!/usr/bin/env sh

# -----------------------------------------------------------------------------
# Configuration
# -----------------------------------------------------------------------------

pascalCaseBefore="EmberBoilerplate"
snakeCaseBefore="ember_boilerplate"
kebabCaseBefore="ember-boilerplate"

# The identifiers above will be replaced in the content of the files found below
content=$(find . -type f \( \
  -name "*.sh" -or \
  -name "*.json" -or \
  -name "*.js" -or \
  -name "*.ts" -or \
  -name "*.html" -or \
  -name "*.yml" -or \
  -name "*.md" -or \
  -name "Dockerfile" -or \
  -name "Makefile" \
\) \
  -and ! -path "./boilerplate-setup.sh" \
  -and ! -path "./assets/node_modules/*" \
)

# The identifiers above will be replaced in the path of the files and directories found here
paths=$(find . -depth 2 \( \
  -path "./types/${kebabCaseBefore}" \
\))

# -----------------------------------------------------------------------------
# Validation
# -----------------------------------------------------------------------------

if [[ -z "$1" ]] ; then
  echo 'You must specify your project name in PascalCase as first argument.'
  exit 0
fi

pascalCaseAfter=$1
snakeCaseAfter=$(echo $pascalCaseAfter | /usr/bin/sed 's/\(.\)\([A-Z]\)/\1_\2/g' | tr '[:upper:]' '[:lower:]')
kebabCaseAfter=$(echo $snakeCaseAfter | tr '_' '-')

# -----------------------------------------------------------------------------
# Helper functions
# -----------------------------------------------------------------------------

header() {
  echo "\033[0;33m▶ $1\033[0m"
}

success() {
  echo "\033[0;32m▶ $1\033[0m"
}

run() {
  echo ${@}
  eval "${@}"
}

# -----------------------------------------------------------------------------
# Execution
# -----------------------------------------------------------------------------

header "Configuration"
echo "${pascalCaseBefore} → ${pascalCaseAfter}"
echo "${snakeCaseBefore} → ${snakeCaseAfter}"
echo "${kebabCaseBefore} → ${kebabCaseAfter}"
echo ""

header "Replacing boilerplate identifiers in content"
for file in $content; do
  run /usr/bin/sed -i "''" "s/$snakeCaseBefore/$snakeCaseAfter/g" $file
  run /usr/bin/sed -i "''" "s/$kebabCaseBefore/$kebabCaseAfter/g" $file
  run /usr/bin/sed -i "''" "s/$pascalCaseBefore/$pascalCaseAfter/g" $file
done
success "Done!\n"

header "Replacing boilerplate identifiers in file and directory paths"
for path in $paths; do
  run mv $path $(echo $path | /usr/bin/sed "s/$snakeCaseBefore/$snakeCaseAfter/g" | /usr/bin/sed "s/$kebabCaseBefore/$kebabCaseAfter/g" | /usr/bin/sed "s/$pascalCaseBefore/$pascalCaseAfter/g")
done
success "Done!\n"

header "Importing project README.md and README.fr.md"
run "rm -fr README.md && mv BOILERPLATE_README.md README.md && mv BOILERPLATE_README.fr.md README.fr.md"
success "Done!\n"

header "Removing boilerplate license → https://choosealicense.com"
run rm -fr LICENSE.md
success "Done!\n"

header "Removing boilerplate code of conduct and contribution information → https://help.github.com/articles/setting-guidelines-for-repository-contributors/"
run rm -fr CODE_OF_CONDUCT.md CONTRIBUTING.md
success "Done!\n"

header "Removing boilerplate setup script"
run rm -fr boilerplate-setup.sh
success "Done!\n"
