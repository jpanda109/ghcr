import * as fs from "fs";
import * as path from "path";

import * as git from "./git";

const storageFilename = ".ghcr";

interface Storage {
    lastUpdatedCommit: string
}

function getStoragePath(): string {
    let projectRoot = git.root();
    let storagePath = path.join(projectRoot, storageFilename);
    return storagePath;
}

export function init() {
    let lastUpdatedCommit = git.currentCommit();
    let storagePath = getStoragePath();
    let storage: Storage = {
        lastUpdatedCommit
    }
    fs.writeFileSync(storagePath, storage);
}