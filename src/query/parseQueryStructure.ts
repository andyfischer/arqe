
import { Clause, ParseContext, Query } from '.'
import { print, freeze } from '../utils'
import QuerySyntax from './QuerySyntax'

// this is not used yet:
const clauseExpansionFormats = [
    'omitted relation something',
    'omitted relation omitted',
    'something relation omitted',
    'command ...'
];

function checkKnownWordTypes(clause: Clause, context: ParseContext) {
    if (clause.assignVal)
        return;

    if (context.isRelation(clause.key))
        clause.isRelation = true;

    if (context.isCommand(clause.key))
        clause.isCommand = true;
}

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

export default function parseQueryStructure(context: ParseContext, syntax: QuerySyntax): Query {

    if (syntax.incomplete) {
        return {
            syntax,
            type: 'empty',
            isIncomplete: true,
            options: {}
        }
    }

    let clauses = syntax.clauses;
    const options = getOptions(syntax);

    if (clauses.length === 0) {
        return {
            syntax,
            type: 'empty',
            isComment: true,
            options: {}
        }
    }

    // Check if this query is indented. If so then try to fill in with the
    // last incomplete clause.
    if (syntax.indent > 0) {
        const lastIncompleteClause = context.getLastIncompleteClause();

        if (lastIncompleteClause) {
            const dotsLocation = findIndex(lastIncompleteClause.syntax.clauses, x => x.isDots);
            const combined = lastIncompleteClause.syntax.clauses.slice(0, dotsLocation)
                .concat(clauses)
                .concat(lastIncompleteClause.syntax.clauses.slice(dotsLocation + 1));

            clauses = combined;
        }
    }

    if (context.isCommand(clauses[0].key)) {
        return {
            syntax,
            type: 'command',
            command: clauses[0].key,
            commandArgs: getCommandArgs(syntax),
            options
        }
    }

    if (clauses[1] && context.isRelation(clauses[1].key)) {

        const relationSubject = clauses[0].key;
        const relation = clauses[1].key;
        const relationObject = clauses[2] && clauses[2].key;

        return {
            syntax,
            type: 'relation',
            relationSubject,
            relation,
            relationObject,
            options
        }
    }

    return {
        syntax,
        type: 'unknown',
        options
    }
}
