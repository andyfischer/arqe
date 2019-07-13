
import { Query } from '../query'
import { declareReducer } from '../framework'
import { print } from '../utils'

const verbose = !!process.env.verbose;

interface Arg {
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

function initCommand(db: CommandDatabase, name) {
    if (!db.byName[name]) {
        db.byName[name] = {
            name,
            args: {}
        }

        if (verbose)
            print('defined command: ' + name);
    }
}

function update(query: Query, db: CommandDatabase) {

    if (query.command === 'def-command') {
        const name = query.commandArgs && query.commandArgs[0];
        initCommand(db, name);
        return;
    }

    if (query.command === 'def-declaration') {
        const name = query.commandArgs && query.commandArgs[0];
        initCommand(db, name);
        db.byName[name].hasNoImplementation = true;
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

        command.args[argName] = command.args[argName] || { }
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
                    args: {
                        'command-name': {
                            isRequired: true
                        }
                    },
                    mainArg: 'command-name',
                    hasNoImplementation: true
                },
                'def-relation': {
                    name: 'def-relation',
                    args: {
                        'relation-name': {
                            isRequired: true
                        }
                    },
                    mainArg: 'relation-name',
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
