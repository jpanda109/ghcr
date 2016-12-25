#!/usr/bin/env node

import * as yargs from "yargs";
import * as ghcr from "../lib/std";

function checkIfValidCommand(yargs: yargs.Argv, argv: any, validSubcommands: string[]): void {
    if (argv._.length < 1) {
        yargs.showHelp();
    } else {
        let subcommand = argv._[0];
        if (validSubcommands.indexOf(subcommand) < 0) {
            console.log("<" + subcommand + "> is not a valid command")
            yargs.showHelp();
        }
    }
}

let command_show = "show";
let command_todo = "todo";
let command_update = "update";
let command_init = "init";
let subcommands = [ command_show, command_todo, command_update, command_init ];
let argv = yargs
    .command(
        command_show,
        "list CRs, XCRs, etc in current project", 
        function(yargs: yargs.Argv) {
            yargs
                .demand(1);
            return yargs;
        },
        function(argv: any) {
            let crtype = ghcr.crtypeOfString(argv._[1]);
            if (crtype === null) {
                console.log("CR type must be one of [ cr | xcr ]");
                return;
            }
            let results = ghcr.findCRsInRepo(crtype);
            results.forEach(console.log);
        }
    )
    .command(
        command_todo,
        "see files needing review",
        function(yargs: yargs.Argv) {
            return yargs;
        },
        function(_argv: any) {
            let files = ghcr.getFilesNeedingReview();
            files.forEach(console.log);
        }
    )
    .command(
        command_update,
        "update ghcr storage",
        function(yargs: yargs.Argv) {
            return yargs;
        },
        function(_argv: any) {
            ghcr.update();
        }
    )
    .command(
        command_init,
        "init ghcr in repo",
        function(yargs: yargs.Argv) {
            return yargs;
        },
        function(_argv: any) {
            ghcr.init();
        }
    )
    .demand(1)
    .help('help')
    .argv;

checkIfValidCommand(yargs, argv, subcommands);