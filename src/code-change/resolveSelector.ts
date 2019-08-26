
import { TokenizeResult } from '../lexer'
import { parseString, Expr, PipedExpr, QueryExpr } from '../parse-query'
import CodeFile from './CodeFile'
import Cursor from './Cursor'

function findIdent(query: QueryExpr, cursor: Cursor) {
    const filterConditions = [];
}

function handleCommand(expr: QueryExpr, cursor: Cursor) {
    if (expr.type !== 'query')
        throw new Error('expected query expr');

    const command = expr.args[0].keyword;
    switch (command) {
    case 'find-ident':
        findIdent(expr, cursor);
        break;
    case 'find-call':
        break;
    case 'enter-block':
        break;
    case 'after-contents':
        break;
    case 'replace-arg':
        break;

    default:
        throw new Error('unrecognized command: ' + command);
    }
}

export default function resolveSelector(file: CodeFile, selector: string) {
    const syntax = parseString(selector, 'statement');

    // Find the statement.
    const statement = syntax.getStatement();

    // Maintain an in-progress cursor.
    const cursor = new Cursor()

    // Loop through each barred section.
    for (const expr of statement.getPipedQueries()) {
    }

    // For each queryExpr, dispatch based on the command.
    // Each command will update the in-progress cursor.
}

// examples:
//       find-string implementAll | enter-block | after-contents
//       insert after-imports
//       replace call func=implement argument 0

