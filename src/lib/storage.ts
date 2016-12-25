import * as fs from "fs";
import * as path from "path";

import * as git from "./git";

const storageFilename = ".ghcr";

export type Commit = string;

export interface FileMeta {
    filename: string,
    lastReviewed: Commit | null,
    needsReview: boolean,
    linesAddedSinceReview: number,
    linesRemovedSinceReview: number
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
    fs.writeFileSync(storagePath, JSON.stringify(storage, null, "\t"));
}

export function init(): void {
    let storagePath = getStoragePath();
    fs.closeSync(fs.openSync(storagePath, 'w'));
    let storage: Storage = {
        files: {}
    }
    _update(storage);
    writeStorage(storage);
}

function countNumLines(filename: string): number {
    let output = fs.readFileSync(filename, "utf8");
    let count = 0;
    for (let i = 0; i < output.length; i++) {
        let c = output[i];
        if (c === "\n") {
            count += 1;
        }
    }
    return count;
}

function _update(storage: Storage): void {
    let currentFiles = git.lsTree();
    let currentCommit = git.getCurrentCommit();
    currentFiles.forEach((filename) => {
        if (storage.files[filename] === undefined) {
            storage.files[filename] = {
                filename,
                lastReviewed: null,
                needsReview: true,
                linesAddedSinceReview: countNumLines(filename),
                linesRemovedSinceReview: 0
            };
        }
    });
    for (let filename in storage.files) {
        let fileMeta = storage.files[filename]!;
        let diffInfo = git.getDiff(fileMeta.filename, currentCommit, fileMeta.lastReviewed);
        if (diffInfo !== null) {
            fileMeta.needsReview = true;
            fileMeta.linesAddedSinceReview = diffInfo.linesAdded;
            fileMeta.linesRemovedSinceReview = diffInfo.linesRemoved;
        }
    }
}

export function update(): void {
    let storage = readStorage();
    _update(storage);
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