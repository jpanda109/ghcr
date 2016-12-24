/**
 * shallow layer over git commands
 * Q: why's everything sync instead of async?
 * A: because there's no concurrency required in this tool.
 */

import { execSync } from "child_process";

function execSyncUTF8(command: string): string {
    return execSync(command, {encoding: "utf8"});
}

export function root(): string {
    let root = execSyncUTF8("git rev-parse --show-toplevel");
    return root;
}

export function lsTree(): string[] {
    let output = execSyncUTF8("git ls-tree HEAD --name-only");
    let files = output.split("\n");
    return files;
}

export function diffLocal(): string[] {
    let output = execSyncUTF8("git diff --name-only")
    let files = output.split("\n");
    return files;
}

export function getCurrentCommit(): string {
    let output = execSyncUTF8("git rev-parse HEAD");
    output = output.trim();
    return output;
}