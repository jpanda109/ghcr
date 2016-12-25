import * as fs from "fs";
import * as path from "path";

import * as git from "./git";

const storageFilename = ".ghcr";

export type Commit = string;

export interface FileMeta {
    filename: string,
    lastReviewed: Commit | null,
    needsReview: boolean
}

interface Storage {
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
    let storage: Storage = {
        files: new Map()
    }
    writeStorage(storage);
}

export function update(): void {
    let storage = readStorage();
    let currentFiles = git.lsTree();
    let currentCommit = git.getCurrentCommit();
    currentFiles.forEach((filename) => {
        if (!storage.files.has(filename)) {
            storage.files.set(filename, {
                filename,
                lastReviewed: null,
                needsReview: true
            });
        }
    });
    storage.files.forEach((fileMeta) => {
        if (git.hasDiff(fileMeta.filename, currentCommit, fileMeta.lastReviewed)) {
            fileMeta.needsReview = true;
        }
    });
    writeStorage(storage);
}

export function getFilesNeedingReview(): FileMeta[] {
    let storage = readStorage();
    let files = Array.from(storage.files.values()).filter((fileMeta) => {
        fileMeta.needsReview
    });
    return files; 
}

export function review(filenames: string[]) {
    let storage = readStorage();
    let currentCommit = git.getCurrentCommit();
    filenames.forEach((filename) => {
        let fileMeta = storage.files.get(filename);
        if (fileMeta !== undefined) {
            fileMeta.lastReviewed = currentCommit;
            fileMeta.needsReview = false;
        }
    });
    writeStorage(storage);
}