
import { Query } from '..'
import { declareReducer } from '../framework'
import { print } from '../utils'
import { getCommandDatabase, CommandDatabase } from '../types/CommandDatabase'

const verbose = !!process.env.verbose;

function initCommand(db: CommandDatabase, name) {
    if (!db.byName[name]) {
        db.byName[name] = {
            name,
            mainArgs: [],
            args: {}
        }

        if (verbose)
            print('defined command: ' + name);
    }
}

function update(query: Query, db: CommandDatabase) {

    if (query.command === 'def-command' || query.command === 'def-function') {
        const name = query.args && query.args[0];
        initCommand(db, name);
        return;
    }

    if (query.command === 'def-declaration') {
        const name = query.args && query.args[0];
        initCommand(db, name);
        db.byName[name].hasNoImplementation = true;
        return;
    }
    
    if (query.relation === 'requires-arg') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');

        const command = db.byName[commandName];
        const argName = query.args[0];

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

        if (command.mainArgs.length === 0)
            command.mainArgs.push(null);

        command.mainArgs[0] = query.args[0];
        return;
    }

    if (query.relation === 'has-second-main-arg') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        while (command.mainArgs.length < 2)
            command.mainArgs.push(null);

        command.mainArgs[1] = query.args[0];
        return;
    }

    if (query.relation === 'from-lazy-module') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.fromLazyModule = query.args[0];
        return;
    }

    if (query.relation === 'not-for-humans') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.notForHumans = true;
        return;
    }

    if (query.relation === 'takes-any-args') {
        const commandName = query.relationSubject
            .replace(/^command\//, '');
        const command = db.byName[commandName];

        if (!command) {
            print('command not found: ' + commandName);
            return;
        }

        command.takesAnyArgs = true;
        return;
    }
}

declareReducer(() => {
    return {
        name: 'commandDB',
        value: {},
        reducer(query: Query) {
            update(query, getCommandDatabase(query));
        }
    }
});
