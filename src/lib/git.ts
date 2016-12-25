/**
 * shallow layer over git commands
 * Q: why's everything sync instead of async?
 * A: because there's no concurrency required in this tool.
 */

import { execSync } from "child_process";
import * as util from "util";

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

export function diffNames(commit1: string, commit2: string): string[] {
    let command = util.format("git diff-tree --name-only -r %s %s", commit1, commit2);
    let output = execSyncUTF8(command);
    let files = output.split("\n");
    return files;
}

export function hasDiff(filename: string, commit1: string, commit2: string | null): boolean {
    let command = commit2 === null ? 
            util.format("git diff-tree --name-only -r --root %s %s", commit1, filename) 
            : util.format("git diff-tree --name-only -r %s %s %s", commit1, commit2, filename);
    let output = execSyncUTF8(command);
    return output.length > 0;
}

export function getCurrentCommit(): string {
    let output = execSyncUTF8("git rev-parse HEAD");
    output = output.trim();
    return output;
}