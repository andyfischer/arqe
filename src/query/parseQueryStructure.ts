
import { Query } from '.'
import { print, freeze } from '../utils'
import { Snapshot } from '../framework'
import QuerySyntax from '../parse-query/QuerySyntax'

// this is not used yet:
const clauseExpansionFormats = [
    'omitted relation something',
    'omitted relation omitted',
    'something relation omitted',
    'command ...'
];

function getOptions(syntax: QuerySyntax) {
    const obj: {[key:string]: any} = {};
    for (const clause of syntax.clauses) {
        if (clause.key && clause.assignVal) {
            obj[clause.key] = clause.assignVal;
        }
    }

    return obj;
}

function getCommandArgs(syntax: QuerySyntax) {
    const args = [];

    for (let i = 1; i < syntax.clauses.length; i++) {
        const clause = syntax.clauses[i];
        if (clause.key && !clause.assignVal) {
            args.push(clause.key);
        }
    }

    return args;
}

function findIndex(items: any[], matcher: (el: any) => boolean) {
    for (let i=0; i < items.length; i++) {
        if (matcher(items[i]))
            return i;
    }

    return -1;
}

export default function parseQueryStructure(snapshot: Snapshot, syntax: QuerySyntax): Query {

    if (syntax.incomplete) {
        return {
            syntax,
            type: 'empty',
            isIncomplete: true,
            options: {}
        }
    }

    let clauses = syntax.clauses;

    if (clauses.length === 0) {
        return {
            syntax,
            type: 'empty',
            options: {}
        }
    }

    // Check if this query is indented. If so then try to fill in with the
    // last incomplete clause.
    if (syntax.indent > 0) {
        const lastIncompleteClause = snapshot.getLastIncompleteClause();

        if (lastIncompleteClause) {
            const dotsLocation = findIndex(lastIncompleteClause.syntax.clauses, x => x.isDots);
            const combined = lastIncompleteClause.syntax.clauses.slice(0, dotsLocation)
                .concat(clauses)
                .concat(lastIncompleteClause.syntax.clauses.slice(dotsLocation + 1));

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
        }
    }

    if (snapshot.isCommand(positionalKeys[0])) {
        return {
            syntax,
            type: 'command',
            command: clauses[0].key,
            args: getCommandArgs(syntax),
            options
        }
    }

    if (snapshot.isRelation(positionalKeys[0])) {
        return {
            syntax,
            type: 'relation',
            relation: positionalKeys[0],
            relationSubject: positionalKeys[1] || null,
            args: positionalKeys.slice(2),
            options
        }
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
        }
    }

    return {
        syntax,
        type: 'unknown',
        options
    }
}
