#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { createInterface } from "readline";

const PACKAGE_NAME = "@baebyeongil/clarion";

const run = (command) => execSync(command, { encoding: "utf-8" }).trim();

const ask = (question) => {
    const readline = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => {
        readline.question(question, (answer) => {
            readline.close();
            resolve(answer);
        });
    });
};

const getPackageVersion = () => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    return packageJson.version;
};

const bumpVersion = (version, type) => {
    const [major, minor, patch] = version.split(".").map(Number);
    if (type === "patch") return `${major}.${minor}.${patch + 1}`;
    if (type === "minor") return `${major}.${minor + 1}.0`;
    if (type === "major") return `${major + 1}.0.0`;
    return version;
};

const setPackageVersion = (newVersion) => {
    const packageJson = JSON.parse(readFileSync("package.json", "utf-8"));
    packageJson.version = newVersion;
    writeFileSync("package.json", JSON.stringify(packageJson, null, 4) + "\n");

    /* plugin.json 버전도 동기화 */
    const pluginJsonPath = ".claude-plugin/plugin.json";
    const pluginJson = JSON.parse(readFileSync(pluginJsonPath, "utf-8"));
    pluginJson.version = newVersion;
    writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 4) + "\n");
};

const main = async () => {
    console.log("=== Clarion Publish Script ===\n");

    /* 1. Check for uncommitted changes */
    const gitStatus = run("git status --porcelain");
    if (gitStatus) {
        console.error("[ERROR] Uncommitted changes detected. Commit or stash before publishing.");
        console.error(gitStatus);
        process.exit(1);
    }

    /* 2. Show current version */
    const currentVersion = getPackageVersion();
    console.log(`Current version: ${currentVersion}`);

    /* 3. Check if version already published */
    let remoteVersion;
    try {
        remoteVersion = run(`npm view ${PACKAGE_NAME} version`);
    } catch {
        remoteVersion = "not published";
    }
    console.log(`Published version: ${remoteVersion}`);

    let newVersion = currentVersion;

    if (currentVersion === remoteVersion) {
        console.log(`\nVersion ${currentVersion} is already published. Bumping version...\n`);

        /* 4. Select bump type */
        console.log("Select version bump:");
        console.log(`  1) patch`);
        console.log(`  2) minor`);
        console.log(`  3) major`);
        const bumpChoice = await ask("Choice [1/2/3]: ");

        const bumpTypes = { "1": "patch", "2": "minor", "3": "major" };
        const bumpType = bumpTypes[bumpChoice];

        if (!bumpType) {
            console.error("[ERROR] Invalid choice.");
            process.exit(1);
        }

        newVersion = bumpVersion(currentVersion, bumpType);
        setPackageVersion(newVersion);
        console.log(`Bumped to: ${newVersion}`);
    } else {
        console.log(`\nVersion ${currentVersion} is not yet published. Proceeding...`);
    }

    /* 5. Build */
    console.log("\nBuilding...");
    run("npx tsc");
    console.log("Build complete.");

    /* 6. Dry run */
    console.log("\nDry run...");
    const dryRunOutput = run("npm publish --access public --dry-run 2>&1");
    console.log(dryRunOutput);

    /* 7. Confirm */
    const confirm = await ask(`\nPublish ${PACKAGE_NAME}@${newVersion}? [y/N]: `);
    if (confirm !== "y" && confirm !== "Y") {
        console.log("Aborted.");
        process.exit(0);
    }

    /* 8. Publish */
    console.log(run("npm publish --access public"));

    /* 9. Git commit + tag (if version was bumped) */
    if (newVersion !== currentVersion) {
        run("git add package.json");
        run(`git commit -m "chore: release v${newVersion}"`);
        run(`git tag v${newVersion}`);
        run("git push && git push --tags");
        console.log(`\nCommitted and tagged v${newVersion}`);
    }

    console.log(`\n=== Published ${PACKAGE_NAME}@${newVersion} ===`);
};

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
