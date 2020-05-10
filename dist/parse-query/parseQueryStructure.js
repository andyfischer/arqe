"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getOptions(syntax) {
    const obj = {};
    for (const clause of syntax.clauses) {
        if (clause.key && clause.assignVal) {
            obj[clause.key] = clause.assignVal;
        }
    }
    return obj;
}
function getCommandArgs(syntax) {
    const args = [];
    for (let i = 1; i < syntax.clauses.length; i++) {
        const clause = syntax.clauses[i];
        if (clause.key && !clause.assignVal) {
            args.push(clause.key);
        }
    }
    return args;
}
function findIndex(items, matcher) {
    for (let i = 0; i < items.length; i++) {
        if (matcher(items[i]))
            return i;
    }
    return -1;
}
function parseQueryStructure(snapshot, syntax) {
    if (syntax.incomplete) {
        return {
            syntax,
            type: 'empty',
            isIncomplete: true,
            options: {}
        };
    }
    let clauses = syntax.clauses;
    if (clauses.length === 0) {
        return {
            syntax,
            type: 'empty',
            options: {}
        };
    }
    if (syntax.indent > 0) {
        const lastIncompleteClause = snapshot.getLastIncompleteClause();
        if (lastIncompleteClause) {
            const dotsLocation = findIndex(lastIncompleteClause.clauses, x => x.isDots);
            const combined = lastIncompleteClause.clauses.slice(0, dotsLocation)
                .concat(clauses)
                .concat(lastIncompleteClause.clauses.slice(dotsLocation + 1));
            clauses = combined;
        }
    }
    let positionalKeys = clauses
        .filter(clause => !clause.assignVal)
        .map(clause => clause.key);
    const options = getOptions(syntax);
    if (positionalKeys.length === 0) {
        return {
            syntax,
            type: 'empty',
            options: {}
        };
    }
    if (snapshot.isCommand(positionalKeys[0])) {
        return {
            syntax,
            type: 'command',
            command: clauses[0].key,
            args: getCommandArgs(syntax),
            options
        };
    }
    if (snapshot.isRelation(positionalKeys[0])) {
        return {
            syntax,
            type: 'relation',
            relation: positionalKeys[0],
            relationSubject: positionalKeys[1] || null,
            args: positionalKeys.slice(2),
            options
        };
    }
    if (positionalKeys[1] && snapshot.isRelation(positionalKeys[1])) {
        const relationSubject = positionalKeys[0];
        const relation = positionalKeys[1];
        return {
            syntax,
            type: 'relation',
            relationSubject,
            relation,
            args: positionalKeys.slice(2),
            options
        };
    }
    return {
        syntax,
        type: 'unknown',
        options
    };
}
exports.default = parseQueryStructure;
//# sourceMappingURL=parseQueryStructure.js.map