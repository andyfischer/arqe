"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("./Command"));
const CommandChain_1 = __importDefault(require("./CommandChain"));
const RelationPattern_1 = require("./RelationPattern");
const lexer_1 = require("./lexer");
function acceptableTagValue(token) {
    return token.match !== lexer_1.t_space && token.match !== lexer_1.t_newline;
}
function nextIsPayloadStart(it) {
    return it.nextIs(lexer_1.t_double_equals);
}
function parseOneTag(it) {
    if (it.tryConsume(lexer_1.t_star)) {
        if (it.tryConsume(lexer_1.t_star)) {
            return {
                doubleStar: true
            };
        }
        return {
            star: true
        };
    }
    let negate = false;
    if (it.nextIs(lexer_1.t_exclamation)) {
        negate = true;
        it.consume();
    }
    if (it.tryConsume(lexer_1.t_dot)) {
        const optionValue = it.consumeTextWhile(acceptableTagValue);
        return {
            tagType: 'option',
            tagValue: optionValue,
            negate
        };
    }
    if (it.tryConsume(lexer_1.t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return {
            tagType: null,
            unboundType: unboundVar,
            star: true
        };
    }
    const tagType = it.consumeNextUnquotedText();
    if (tagType === '/')
        throw new Error("syntax error, tagType was '/'");
    let tagValue = null;
    let starValue = false;
    let questionValue = false;
    let unboundValue = null;
    if (it.tryConsume(lexer_1.t_slash)) {
        if (it.tryConsume(lexer_1.t_star)) {
            starValue = true;
        }
        else if (it.tryConsume(lexer_1.t_question)) {
            questionValue = true;
        }
        else if (it.tryConsume(lexer_1.t_dollar)) {
            unboundValue = it.consumeNextUnquotedText();
            starValue = true;
        }
        else {
            tagValue = it.consumeTextWhile(acceptableTagValue);
        }
    }
    return {
        tagType,
        tagValue,
        negate,
        starValue,
        questionValue,
        unboundValue
    };
}
function parseFlag(it, query) {
    it.consume(lexer_1.t_dash);
    if (!(it.nextIs(lexer_1.t_ident) || it.nextIs(lexer_1.t_integer))) {
        throw new Error('expected letter or number after -, found: ' + it.nextText());
    }
    const str = it.consumeNextText();
    query.flags[str] = true;
    if (!it.finished() && !it.nextIs(lexer_1.t_space))
        throw new Error(`Expected space after -${str}`);
}
function parseArgs(it, query) {
    while (true) {
        it.skipSpaces();
        if (it.finished() || it.nextIs(lexer_1.t_newline) || it.nextIs(lexer_1.t_bar) || nextIsPayloadStart(it))
            break;
        if (it.nextIs(lexer_1.t_dash)) {
            parseFlag(it, query);
            continue;
        }
        const tag = parseOneTag(it);
        query.tags.push(tag);
    }
    parsePayload(it, query);
}
function parsePayload(it, query) {
    if (!nextIsPayloadStart(it)) {
        return null;
    }
    it.consume(lexer_1.t_double_equals);
    it.skipSpaces();
    let str = "";
    while (!it.nextIs(lexer_1.t_newline) && !it.finished())
        str += it.consumeNextText();
    return query.payload = str;
}
function parseOneCommand(it) {
    it.skipSpaces();
    if (!it.nextIs(lexer_1.t_ident) && !it.nextIs(lexer_1.t_quoted_string))
        throw new Error("expected identifier, saw: " + it.nextText());
    const command = it.consumeNextUnquotedText();
    const query = {
        tags: [],
        flags: {},
        payload: null
    };
    parseArgs(it, query);
    return new Command_1.default(command, query.tags, query.payload, query.flags);
}
function parseOneCommandChain(it) {
    const chain = new CommandChain_1.default();
    while (!it.finished()) {
        const command = parseOneCommand(it);
        chain.commands.push(command);
        it.skipSpaces();
        if (it.finished())
            break;
        if (!it.tryConsume(lexer_1.t_bar))
            throw new Error("expected: |, saw: " + it.nextText());
    }
    return chain;
}
function parseRelation(str) {
    const it = lexer_1.lexStringToIterator(str);
    const query = {
        tags: [],
        flags: {},
        payload: null
    };
    parseArgs(it, query);
    if (Object.keys(query.flags).length !== 0) {
        throw new Error("didn't expect any flags in parseRelation(): " + str);
    }
    return RelationPattern_1.commandTagsToRelation(query.tags, query.payload);
}
exports.parseRelation = parseRelation;
function parseTag(str) {
    const it = lexer_1.lexStringToIterator(str);
    return parseOneTag(it);
}
exports.parseTag = parseTag;
function parsePattern(str) {
    return parseCommand('get ' + str).toPattern();
}
exports.parsePattern = parsePattern;
function parseCommand(str) {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);
    if (str.startsWith('get get '))
        throw new Error("command starts with 'get get': " + str);
    const it = lexer_1.lexStringToIterator(str);
    it.skipSpaces();
    if (it.nextIs(lexer_1.t_bar)) {
        throw new Error('parseCommand was called on a command chain: ' + str);
    }
    const command = parseOneCommand(it);
    return command;
}
exports.default = parseCommand;
function parseCommandChain(str) {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);
    if (str.startsWith('get get '))
        throw new Error("command starts with 'get get': " + str);
    const it = lexer_1.lexStringToIterator(str);
    const chain = parseOneCommandChain(it);
    return chain;
}
exports.parseCommandChain = parseCommandChain;
//# sourceMappingURL=parseCommand.js.map