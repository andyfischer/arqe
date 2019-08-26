
import { TokenizeResult, Token, t_ident } from '../lexer'
import { parseString, Expr, PipedExpr, QueryExpr } from '../parse-query'
import CodeFile from './CodeFile'
import Cursor, { TokenRange } from './Cursor'

function forAll(item, conds) {
    for (const cond of conds)
        if (!cond(item))
            return false;

    return true;
}

function findIdent(query: QueryExpr, cursor: Cursor) {
    const filterConditions: ((Token) => boolean)[] = [];
    const file = cursor.file;

    const identText = query.getKeywords()[0];
    const options = query.getNameValuePairs();

    if (options.indent) {
        const indentVal = parseInt(options.indent);
        filterConditions.push((token: Token) => {
            return token.leadingIndent === indentVal;
        });
    }

    const ranges: TokenRange[] = [];

    for (const token of cursor.eachTokenInRange()) {

        if (token.match === t_ident
                && file.tokens.getTokenText(token) === identText
                && forAll(token, filterConditions)) {

            ranges.push({
                start: token.tokenIndex,
                end: token.tokenIndex + 1
            });
        }
    }

    cursor.ranges = ranges;
}

/*
function advanceToNextBlock(file: CodeFile, range: TokenRange): TokenRange? {
    for (const i = range.start) {
        const t = file.tokens.tokens[i];
        if (t.match === t_lbracket) {
            
        }
    }
}
*/

function enterBlock(query: QueryExpr, cursor: Cursor) {
    if (cursor.ranges.length === 0)
        throw new Error("cursor is currently empty");


}

function handleCommand(query: QueryExpr, cursor: Cursor) {
    if (query.type !== 'query')
        throw new Error('expected query expr');

    const command = query.args[0].keyword;
    switch (command) {

    case 'find-ident':
        findIdent(query, cursor);
        break;

    case 'find-call':
        break;

    case 'enter-block':
        enterBlock(query, cursor);
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
    const cursor = new Cursor(file)

    // Loop through each barred section.
    for (const expr of statement.getPipedQueries()) {
        handleCommand(expr, cursor);
    }

    return cursor;
}

// examples:
//       find-string implementAll | enter-block | after-contents
//       insert after-imports
//       replace call func=implement argument 0

