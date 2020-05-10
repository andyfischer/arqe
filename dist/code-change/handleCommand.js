"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("../lexer");
function forAll(item, conds) {
    for (const cond of conds)
        if (!cond(item))
            return false;
    return true;
}
function findIdent(cursor, identText, options) {
    const filterConditions = [];
    const lexed = cursor.file.getLexed();
    if (options.indent) {
        const indentVal = parseInt(options.indent);
        filterConditions.push((token) => {
            return token.leadingIndent === indentVal;
        });
    }
    for (const token of cursor.eachTokenInRange()) {
        if (token.match === lexer_1.t_ident
            && lexed.getTokenText(token) === identText
            && forAll(token, filterConditions)) {
            cursor.range = {
                start: token.tokenIndex,
                end: token.tokenIndex + 1
            };
            return cursor;
        }
    }
    cursor.range = null;
    return cursor;
}
function advanceToNextBlock(file, range) {
    const lexed = file.getLexed();
    for (let i = range.start; i < lexed.tokens.length; i++) {
        const t = lexed.tokens[i];
        if (t.match === lexer_1.t_lbrace) {
            return {
                start: i,
                end: t.pairsWithIndex
            };
        }
        if (t.match === lexer_1.t_rbrace)
            return null;
    }
}
function enterBlock(query, cursor) {
    const next = advanceToNextBlock(cursor.file, cursor.range);
    if (!next)
        throw new Error("no block found");
    cursor.range = next;
}
function toStartOfLine(text, pos) {
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
function toEndOfLine(text, pos) {
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
function selectLine(query, cursor) {
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
    cursor.range = { start, end };
}
function selectCurrentLine(query, cursor) {
    const lexed = cursor.file.getLexed();
    cursor.range = {
        start: toStartOfLine(lexed, cursor.range.start),
        end: toEndOfLine(lexed, cursor.range.end)
    };
}
function insert(query, cursor) {
    const text = query.getPositionalArgs()[0];
    cursor.patch(text);
}
function insertLine(query, cursor) {
    const text = query.getPositionalArgs()[0];
    const lexed = cursor.file.getLexed();
    const indent = lexed.tokens[cursor.range.start].leadingIndent;
    cursor.patch(' '.repeat(indent) + text + '\n');
}
function deleteCommand(query, cursor) {
    cursor.patch('');
}
function stringReplaceAll(str, from, to) {
    return str.split(from).join(to);
}
function replaceCommand(query, cursor) {
    const { from, to } = query.getNameValuePairs();
    let text = cursor.getSelectedText();
    text = stringReplaceAll(text, from, to);
    cursor.patch(text);
}
function selectFile(query, cursor) {
    const lexed = cursor.file.getLexed();
    cursor.range = {
        start: 0,
        end: lexed.tokens.length
    };
}
function afterImports(query, cursor) {
    const file = cursor.file;
    const lexed = cursor.file.getLexed();
    let lastImport = -1;
    for (let pos = 0; pos < lexed.tokens.length; pos += 1) {
        const token = lexed.tokens[pos];
        if (token.match === lexer_1.t_ident && lexed.getTokenText(token) === "import") {
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
function handleCommand(query, cursor) {
    if (query.type !== 'query')
        throw new Error('expected query expr');
    const command = query.args[0].keyword;
    switch (command) {
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
        case 'insert':
            insert(query, cursor);
            break;
        case 'insert-line':
            insertLine(query, cursor);
            break;
        case 'delete':
            deleteCommand(query, cursor);
            break;
        case 'replace':
            replaceCommand(query, cursor);
            break;
        default:
            throw new Error('unrecognized command: ' + command);
    }
}
exports.default = handleCommand;
//# sourceMappingURL=handleCommand.js.map