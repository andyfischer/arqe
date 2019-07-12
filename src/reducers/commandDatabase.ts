
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

interface Arg {
    key: string
    isMain?: boolean
    isRequired?: boolean
}

export interface CommandDefinition {
    name: string
    mainArg?: string
    args: { [key: string]: Arg }
    hasNoImplementation?: boolean
}

export interface CommandDatabase {
    byName: { [name: string]: CommandDefinition }
}

function update(query: Query, db: CommandDatabase) {

    if (query.command === 'def-command') {
        const command = query.commandArgs && query.commandArgs[0];

        if (!command) {
            print('error: missing args for def-command');
            return;
        }

        if (!db.byName[command]) {
            db.byName[command] = {
                name: command,
                args: {}
            }

            if (verbose)
                print('defined command: ' + command);
        }

        return;
    }
    
    if (query.relation === 'requires-arg') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');

        const command = db.byName[commandName];
        const argName = query.relationObject

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.args[argName] = command.args[argName] || { key: argName }
        const arg = command.args[argName];

        arg.isRequired = true;
        return;
    }
    
    if (query.relation === 'has-no-implementation') {

        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.hasNoImplementation = true;
        return;
    }

    if (query.relation === 'has-main-arg') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.mainArg = query.relationObject;
        return;
    }
}

declareReducer(() => {
    return {
        name: 'commandDB',
        value: {
            byName: {
                'def-command': {
                    name: 'def-command',
                    args: {},
                    hasNoImplementation: true
                },
                'def-relation': {
                    name: 'def-relation',
                    args: {},
                    hasNoImplementation: true
                }
            }
        },
        reducer(query: Query, db: CommandDatabase) {
            update(query, db);
            return db;
        }
    }
});
