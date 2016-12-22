import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as git from "./git";

function execSyncUTF8(command: string): string {
    return execSync(command, {encoding: "utf8"});
}

export interface SearchResult {
    filename  : string,
    contents  : string,
    lineNumber: number,
}

export function grep(pattern: string, contents: string, filename: string): SearchResult[] {
    let lineCharCounts = contents.split("\n").map(s => s.length);
    let curLine = 0;
    let curCharCount = 0;
    let re = new RegExp(pattern, 'gm');
    let results = [];
    let match = re.exec(contents);
    while (match !== null) {
        let index = match.index;
        while (index > curCharCount) {
            curCharCount += lineCharCounts[curLine];
            curLine += 1
        }
        let lineNumber = curLine;
        let result = {
            contents: match[0],
            lineNumber,
            filename
        };
        results.push(result);
        match = re.exec(contents);
    }
    return results;
}

export type CRType = "cr" | "xcr"

export function stringOfCRType(crtype: CRType): string {
    return crtype;
}

export function crtypeOfString(s: string): CRType | null {
    switch (s) {
        case "cr": return "cr";
        case "xcr": return "xcr";
    }
    return null;
}

export type Language = "ml" | "js"

function languageOfExtname(extname: string): Language | null {
    switch (extname) {
        case ".ml": return "ml";
        case ".ts": return "js";
        case ".js": return "js";
    }
    return null;
}

function createRegex(language: Language, crtype: CRType): string {
    let base = stringOfCRType(crtype).toUpperCase();
    base += ":[^]*";
    switch (language) {
        case "ml": return "\\(\\* " + base + "\\*\\)";
        case "js": return "/\\*" + base + "\\*/";
    }
}

export function findCRs(filenames: string[], crtype: CRType): SearchResult[] {
    let results = [];
    for (let filename of filenames) {
        let extname = path.extname(filename);
        let language = languageOfExtname(extname);
        if (language === null) {
            continue;
        }
        let regex = createRegex(language, crtype);
        let contents = fs.readFileSync(filename, "utf8");
        let file_results = grep(regex, contents, filename);
        for (let result of file_results) {
            results.push(result);
        }
    }
    return results;
}

export function findCRsInRepo(crtype: CRType): SearchResult[] {
    let filenames = git.lsTree();
    let results = findCRs(filenames, crtype);
    return results;
}