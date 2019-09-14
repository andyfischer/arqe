
import { Token, t_ident, t_lbrace, t_rbrace, LexedText } from '../lexer'
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
    const lexed = cursor.file.getLexed();

    const identText = query.getPositionalArgs()[0];
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
                && lexed.getTokenText(token) === identText
                && forAll(token, filterConditions)) {

            ranges.push({
                start: token.tokenIndex,
                end: token.tokenIndex + 1
            });
        }
    }

    cursor.ranges = ranges;
}

function advanceToNextBlock(file: CodeFile, range: TokenRange): TokenRange {
    const lexed = file.getLexed();

    for (let i = range.start; i < lexed.tokens.length; i++) {
        const t = lexed.tokens[i];

        if (t.match === t_lbrace) {
            return {
                start: i,
                end: t.pairsWithIndex
            }
        }

        if (t.match === t_rbrace)
            return null;
    }
}

function enterBlock(query: QueryExpr, cursor: Cursor) {
    if (cursor.ranges.length === 0)
        throw new Error("cursor is currently empty");

    const out: TokenRange[] = []

    for (const range of cursor.ranges) {
        const next = advanceToNextBlock(cursor.file, range);
        if (next)
            out.push(next);
    }

    if (out.length === 0)
        throw new Error("no block found");

    cursor.ranges = out;
}

function toStartOfLine(text: LexedText, pos: number) {
    const line = text.tokens[pos].lineStart;

    while (true) {
        const next = pos - 1;
        if (next >= 0 && text.tokens[next].lineStart === line) {
            pos = next;
            continue;
        }

        break;
    }

    return pos;
}

function toEndOfLine(text: LexedText, pos: number) {
    const line = text.tokens[pos].lineStart;

    while (true) {
        const next = pos + 1;
        if (next < text.tokens.length && text.tokens[next].lineStart === line) {
            pos = next;
            continue;
        }

        break;
    }

    return pos;
}

function selectLine(query: QueryExpr, cursor: Cursor) {
    const lexed = cursor.file.getLexed();

    cursor.ranges = cursor.ranges.map(range => {
        return {
            start: toStartOfLine(lexed, range.start),
            end: toEndOfLine(lexed, range.end)
        }
    });
}

function appendNewLine(cursor: Cursor) {
}

function insert(query: QueryExpr, cursor: Cursor) {
    const text = query.getPositionalArgs()[0];
    const file: CodeFile = cursor.file;
    const lexed = file.getLexed();
    for (const range of cursor.ranges) {
        const charStart = lexed.tokenCharIndex(range.start);
        const charEnd = lexed.tokenCharIndex(range.end);
        file.patch(charStart, charEnd, text);
    }
}

function selectFile(query: QueryExpr, cursor: Cursor) {
    const lexed = cursor.file.getLexed();

    cursor.ranges = [{
        start: 0,
        end: lexed.tokens.length
    }];
}

function afterImports(query: QueryExpr, cursor: Cursor) {
    const file = cursor.file;
    const lexed: LexedText = cursor.file.getLexed();

    let lastImport = -1;

    for (let pos = 0; pos < lexed.tokens.length; pos += 1) {
        const token = lexed.tokens[pos];
        if (token.match === t_ident && lexed.getTokenText(token) === "import") {
            lastImport = pos;
        }
    }

    if (lastImport === -1)
        throw new Error("no 'import' found in file");
}

export default function handleCommand(query: QueryExpr, cursor: Cursor) {
    if (query.type !== 'query')
        throw new Error('expected query expr');

    const command = query.args[0].keyword;
    switch (command) {

    case 'find-ident':
        findIdent(query, cursor);
        break;

    //case 'find-call':
    //    break;

    case 'enter-block':
        enterBlock(query, cursor);
        break;

    case 'select-current-line':
        selectLine(query, cursor);
        break;

    case 'select-file':
        selectFile(query, cursor);
        break;

    case 'after-imports':
        afterImports(query, cursor);
        break;

    //case 'after-contents':
    //    break;

    case 'insert':
        insert(query, cursor);
        break;

    case 'replace-arg':
        break;

    default:
        throw new Error('unrecognized command: ' + command);
    }
}

