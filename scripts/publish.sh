#!/usr/bin/env bash
set -euo pipefail

PACKAGE_NAME="@baebyeongil/clarion"

echo "=== Clarion Publish Script ==="
echo ""

## 1. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "[ERROR] Uncommitted changes detected. Commit or stash before publishing."
    git status --short
    exit 1
fi

## 2. Show current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Current version: $CURRENT_VERSION"

## 3. Check if version already published
REMOTE_VERSION=$(npm view "$PACKAGE_NAME" version 2>/dev/null || echo "not published")
echo "Published version: $REMOTE_VERSION"

if [ "$CURRENT_VERSION" = "$REMOTE_VERSION" ]; then
    echo ""
    echo "Version $CURRENT_VERSION is already published. Bumping version..."
    echo ""

    ## 4. Select bump type
    echo "Select version bump:"
    echo "  1) patch  ($CURRENT_VERSION -> next patch)"
    echo "  2) minor"
    echo "  3) major"
    read -rp "Choice [1/2/3]: " BUMP_CHOICE

    case $BUMP_CHOICE in
        1) BUMP_TYPE="patch" ;;
        2) BUMP_TYPE="minor" ;;
        3) BUMP_TYPE="major" ;;
        *) echo "[ERROR] Invalid choice."; exit 1 ;;
    esac

    npm version "$BUMP_TYPE" --no-git-tag-version
    NEW_VERSION=$(node -p "require('./package.json').version")
    echo "Bumped to: $NEW_VERSION"
else
    echo ""
    echo "Version $CURRENT_VERSION is not yet published. Proceeding..."
    NEW_VERSION="$CURRENT_VERSION"
fi

## 5. Build
echo ""
echo "Building..."
yarn build

## 6. Dry run
echo ""
echo "Dry run..."
npm publish --access public --dry-run

## 7. Confirm
echo ""
read -rp "Publish $PACKAGE_NAME@$NEW_VERSION? [y/N]: " CONFIRM
if [ "$CONFIRM" != "y" ] && [ "$CONFIRM" != "Y" ]; then
    echo "Aborted."
    exit 0
fi

## 8. Publish
npm publish --access public

## 9. Git commit + tag (if version was bumped)
if [ "$NEW_VERSION" != "$CURRENT_VERSION" ]; then
    git add package.json
    git commit -m "chore: release v$NEW_VERSION"
    git tag "v$NEW_VERSION"
    git push && git push --tags
    echo ""
    echo "Committed and tagged v$NEW_VERSION"
fi

echo ""
echo "=== Published $PACKAGE_NAME@$NEW_VERSION ==="
