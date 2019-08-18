
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

function getCommandSubject(query) {
    if (query.relationSubject) {
        return query.relationSubject.replace(/^command\//, '');
    }

    return null;
}

function update(query: Query, db: CommandDatabase) {

    const commandSubject = getCommandSubject(query);

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
    
    if (commandSubject && query.relation === 'requires-arg') {
        const command = db.byName[commandSubject];
        const argName = query.args[0];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        command.args[argName] = command.args[argName] || { }
        const arg = command.args[argName];

        arg.isRequired = true;
        return;
    }
    
    if (commandSubject && query.relation === 'has-no-implementation') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        command.hasNoImplementation = true;
        return;
    }

    if (commandSubject && query.relation === 'has-main-arg') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        if (command.mainArgs.length === 0)
            command.mainArgs.push(null);

        command.mainArgs[0] = query.args[0];
        return;
    }

    if (commandSubject === 'has-second-main-arg') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        while (command.mainArgs.length < 2)
            command.mainArgs.push(null);

        command.mainArgs[1] = query.args[0];
        return;
    }

    if (commandSubject && query.relation === 'from-lazy-module') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        command.fromLazyModule = query.args[0];
        return;
    }

    if (commandSubject && query.relation === 'not-for-humans') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
            return;
        }

        command.notForHumans = true;
        return;
    }

    if (commandSubject && query.relation === 'takes-any-args') {
        const command = db.byName[commandSubject];

        if (!command) {
            print('command not found: ' + commandSubject);
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
