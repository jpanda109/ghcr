#!/usr/bin/env node

import * as yargs from "yargs";

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

let command_todo = "todo";
let subcommands = [ command_todo ];
let argv = yargs
    .command(
        command_todo,
        "list CRs and XCRs in current project", 
        function(yargs: yargs.Argv) {
            return yargs;
        },
        function(argv: any) {
            console.log("not implemented yet");
        }
    )
    .demand(1)
    .help('help')
    .argv;

checkIfValidCommand(yargs, argv, subcommands);