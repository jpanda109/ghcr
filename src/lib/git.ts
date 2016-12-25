/**
 * shallow layer over git commands
 * Q: why's everything sync instead of async?
 * A: because there's no concurrency required in this tool.
 */

import { execSync } from "child_process";
import * as util from "util";

function execSyncUTF8(command: string): string {
    return execSync(command, {encoding: "utf8"}).trim();
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

export interface DiffInfo {
    filename: string,
    linesAdded: number,
    linesRemoved: number
}

export function getDiff(filename: string, commit1: string, commit2: string | null): DiffInfo | null {
    if (commit2 === null) {
        let command = util.format("git diff-tree --numstat -r --root %s %s", commit1, filename) 
        let output = execSyncUTF8(command);
        if (output.length === 0) {
            return null
        } else {
            // skip first line of output since it outputs commit hash when --root passed in
            let outputInfo = output.split("\n")[1].split("\t");
            let diffInfo: DiffInfo = {
                filename,
                linesAdded: parseInt(outputInfo[0]),
                linesRemoved: parseInt(outputInfo[1])
            };
            return diffInfo;
        }
    } else {
        let command = util.format("git diff-tree --numstat -r %s %s %s", commit1, commit2, filename);
            let output = execSyncUTF8(command);
        if (output.length === 0) {
            return null
        } else {
            let outputInfo = output.split("\t");
            let diffInfo: DiffInfo = {
                filename,
                linesAdded: parseInt(outputInfo[0]),
                linesRemoved: parseInt(outputInfo[1])
            };
            return diffInfo;
        }
    }
}

export function getCurrentCommit(): string {
    let output = execSyncUTF8("git rev-parse HEAD");
    output = output.trim();
    return output;
}