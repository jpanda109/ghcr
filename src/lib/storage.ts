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
    files: { [filename: string]: FileMeta | undefined}
}

function getStoragePath(): string {
    let projectRoot = git.root();
    let storagePath = path.join(projectRoot, storageFilename);
    return storagePath;
}

function readStorage(): Storage {
    let storagePath = getStoragePath();
    let storage = JSON.parse(fs.readFileSync(storagePath, "utf8"));
    return storage;
}

function writeStorage(storage: Storage): void {
    let storagePath = getStoragePath();
    fs.writeFileSync(storagePath, JSON.stringify(storage));
}

export function init(): void {
    let storagePath = getStoragePath();
    fs.closeSync(fs.openSync(storagePath, 'w'));
    let storage: Storage = {
        files: {}
    }
    writeStorage(storage);
}

export function update(): void {
    let storage = readStorage();
    let currentFiles = git.lsTree();
    let currentCommit = git.getCurrentCommit();
    currentFiles.forEach((filename) => {
        if (storage.files[filename] === undefined) {
            storage.files[filename] = {
                filename,
                lastReviewed: null,
                needsReview: true
            };
        }
    });
    for (let filename in storage.files) {
        let fileMeta = storage.files[filename]!;
        if (git.hasDiff(fileMeta.filename, currentCommit, fileMeta.lastReviewed)) {
            fileMeta.needsReview = true;
        }
    }
    writeStorage(storage);
}

export function getFilesNeedingReview(): FileMeta[] {
    let storage = readStorage();
    let files = [];
    for (let filename in storage.files) {
        let fileMeta = storage.files[filename]!;
        if (fileMeta.needsReview) {
            files.push(fileMeta);
        }
    }
    return files; 
}

export function review(filenames: string[]) {
    let storage = readStorage();
    let currentCommit = git.getCurrentCommit();
    filenames.forEach((filename) => {
        let fileMeta = storage.files[filename]!;
        fileMeta.lastReviewed = currentCommit;
        fileMeta.needsReview = false;
    });
    writeStorage(storage);
}