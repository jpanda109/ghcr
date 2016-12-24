import * as fs from "fs";
import * as path from "path";

import * as git from "./git";

const storageFilename = ".ghcr";

export interface FileMeta {
    filename: string,
    reviewed: boolean
}

interface Storage {
    lastUpdatedCommit: string,
    files: Map<string, FileMeta>
}

function getStoragePath(): string {
    let projectRoot = git.root();
    let storagePath = path.join(projectRoot, storageFilename);
    return storagePath;
}

function readStorage(): Storage {
    let storagePath = getStoragePath();
    let storage = require(storagePath);
    return storage;
}

function writeStorage(storage: Storage): void {
    let storagePath = getStoragePath();
    fs.writeFileSync(storagePath, storage);
}

export function init(): void {
    let lastUpdatedCommit = git.getCurrentCommit();
    let storage: Storage = {
        lastUpdatedCommit,
        files: new Map()
    }
    writeStorage(storage);
}

export function update(): void {
    let storage = readStorage();
    storage.lastUpdatedCommit = git.getCurrentCommit();
    let diffedFiles = git.diffLocal();
    diffedFiles.forEach((filename) => {
        let fileMeta = storage.files.get(filename);
        if (fileMeta === undefined) {
            storage.files.set(filename, {
                filename,
                reviewed: false
            });
        } else {
            fileMeta.reviewed = false;
        }
    })
    writeStorage(storage);
}

export function getFilesNeedingReview(): FileMeta[] {
    let storage = readStorage();
    let files = Array.from(storage.files.values());
    return files; 
}