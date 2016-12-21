#!/usr/bin/env node

import { something } from "../lib/something";

import * as yargs from "yargs";

function checkForCommands(yargs: yargs.Argv, argv: any, validSubcommands: string[]): void {
    if (argv._.length < 1) {
        yargs.showHelp();
    } else {
        let subcommand = argv._[0];
        if (validSubcommands.indexOf(subcommand) < 0) {
            yargs.showHelp();
        }
    }
}

let command_yo = "yo";
let subcommands = [ command_yo ];
let argv = yargs
    .command(
        command_yo,
        "yoyoyo", 
        function(yargs) {
            return yargs;
        },
        function(argv) {
            console.log("yo");
        }
    )
    .demand(1)
    .help('help')
    .argv;

checkForCommands(yargs, argv, ["yo"]);