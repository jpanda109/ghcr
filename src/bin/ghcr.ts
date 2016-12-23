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
let subcommands = [ command_show ];
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
            for (let result of results) {
                console.log(result);
            }
        }
    )
    .demand(1)
    .help('help')
    .argv;

checkIfValidCommand(yargs, argv, subcommands);