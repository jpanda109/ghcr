/**
 * shallow layer over git commands
 * Q: why's everything sync instead of async?
 * A: because there's no concurrency required in this tool.
 */

import { execSync } from "child_process";

function root(): string {
    let root = execSync("git rev-parse --show-toplevel", {encoding: "utf8"});
    return root;
}

function lsTree(): string[] {
    let output = execSync("git ls-tree", {encoding: "utf8"});
    let files = output.split("\n");
    return files;
}
