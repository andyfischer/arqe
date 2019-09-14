
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

    for (const token of cursor.eachTokenInRange()) {
        if (token.match === t_ident
                && lexed.getTokenText(token) === identText
                && forAll(token, filterConditions)) {

            cursor.range = {
                start: token.tokenIndex,
                end: token.tokenIndex + 1
            };

            return;
        }
    }

    // Not found
    cursor.range = null;
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
    const next = advanceToNextBlock(cursor.file, cursor.range);

    if (!next)
        throw new Error("no block found");

    cursor.range = next;
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
    const lineNumber = parseInt(query.getPositionalArgs()[0]);

    let start;
    let end;

    for (let pos = 0; pos < lexed.tokens.length; pos += 1) {
        const token = lexed.tokens[pos];
        if (token.lineStart === lineNumber) {
            end = pos + 1;
            if (start === undefined)
                start = pos;
        }
    }

    cursor.range = { start, end }
}

function selectCurrentLine(query: QueryExpr, cursor: Cursor) {
    const lexed = cursor.file.getLexed();

    cursor.range = {
        start: toStartOfLine(lexed, cursor.range.start),
        end: toEndOfLine(lexed, cursor.range.end)
    }
}

function insert(query: QueryExpr, cursor: Cursor) {
    const text = query.getPositionalArgs()[0];
    cursor.patch(text);
}

function insertLine(query: QueryExpr, cursor: Cursor) {
    const text = query.getPositionalArgs()[0];
    const lexed = cursor.file.getLexed();
    const indent = lexed.tokens[cursor.range.start].leadingIndent;
    cursor.patch(' '.repeat(indent) + text + '\n');
}

function deleteCommand(query: QueryExpr, cursor: Cursor) {
    cursor.patch('');
}

function selectFile(query: QueryExpr, cursor: Cursor) {
    const lexed = cursor.file.getLexed();

    cursor.range = {
        start: 0,
        end: lexed.tokens.length
    };
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

    const pos = toEndOfLine(lexed, lastImport) + 1;

    cursor.range = {
        start: pos,
        end: pos
    };
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
        selectCurrentLine(query, cursor);
        break;

    case 'select-line':
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

    case 'insert-line':
        insertLine(query, cursor);
        break;

    case 'delete':
        deleteCommand(query, cursor);
        break;

    //case 'replace-arg':
        //break;

    default:
        throw new Error('unrecognized command: ' + command);
    }
}

