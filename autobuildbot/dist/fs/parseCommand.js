"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Command_1 = __importDefault(require("./Command"));
const CommandChain_1 = __importDefault(require("./CommandChain"));
const Pattern_1 = __importStar(require("./Pattern"));
const PatternTag_1 = require("./PatternTag");
const parseExpr_1 = require("./parseExpr");
const lexer_1 = require("./lexer");
function parseTagValue(it) {
    let tagValue = null;
    let valueExpr = null;
    let starValue = false;
    let questionValue = false;
    let identifier;
    let hasValue = false;
    let parenSyntax = false;
    if (it.tryConsume(lexer_1.t_slash)) {
        hasValue = true;
    }
    else if (it.tryConsume(lexer_1.t_lparen)) {
        hasValue = true;
        parenSyntax = true;
    }
    if (!hasValue) {
        return {};
    }
    if (!parenSyntax && it.tryConsume(lexer_1.t_star)) {
        starValue = true;
    }
    else if (!parenSyntax && it.tryConsume(lexer_1.t_question)) {
        questionValue = true;
    }
    else if (!parenSyntax && it.nextIs(lexer_1.t_dollar) && it.nextIs(lexer_1.t_ident, 1)) {
        it.consume();
        identifier = it.consumeNextUnquotedText();
        starValue = true;
    }
    else if (it.nextIs(lexer_1.t_lparen)) {
        valueExpr = parseExpr_1.parseExpr(it);
        starValue = true;
    }
    else {
        let iterationCount = 0;
        let parenDepth = 0;
        tagValue = '';
        while (!it.finished()) {
            if ((!parenSyntax) && (it.nextIs(lexer_1.t_space) || it.nextIs(lexer_1.t_newline)))
                break;
            if (parenSyntax && it.nextIs(lexer_1.t_rparen)) {
                if (parenDepth > 0)
                    parenDepth--;
                else
                    break;
            }
            if (parenSyntax && it.nextIs(lexer_1.t_lparen))
                parenDepth += 1;
            iterationCount += 1;
            if (iterationCount > 1000)
                throw new Error('too many iterations when parsing tag value');
            const text = it.consumeNextUnquotedText();
            tagValue += text;
        }
    }
    if (parenSyntax)
        if (!it.tryConsume(lexer_1.t_rparen))
            throw new Error('Expected )');
    return {
        tagValue,
        valueExpr,
        starValue,
        questionValue,
        identifier
    };
}
function parseOneTag(it) {
    let identifier;
    if (it.tryConsume(lexer_1.t_lbracket)) {
        if (!it.nextIs(lexer_1.t_ident) || it.nextText() !== 'from')
            throw new Error("expected 'from', found: " + it.nextText());
        it.consume();
        it.skipSpaces();
        if (!it.tryConsume(lexer_1.t_dollar))
            throw new Error("expected '$', found: " + it.nextText());
        identifier = it.consumeNextText();
        if (!it.tryConsume(lexer_1.t_rbracket))
            throw new Error("expected ']', found: " + it.nextText());
        it.skipSpaces();
    }
    if (it.tryConsume(lexer_1.t_star)) {
        if (it.tryConsume(lexer_1.t_star)) {
            return PatternTag_1.newTagFromObject({
                doubleStar: true
            });
        }
        return PatternTag_1.newTagFromObject({
            star: true,
            identifier
        });
    }
    let negate = false;
    if (it.nextIs(lexer_1.t_exclamation)) {
        negate = true;
        it.consume();
    }
    if (it.tryConsume(lexer_1.t_dot)) {
        const optionValue = it.consumeNextUnquotedText();
        return PatternTag_1.newTagFromObject({
            tagType: 'option',
            tagValue: optionValue,
            identifier,
            negate
        });
    }
    if (it.tryConsume(lexer_1.t_dollar)) {
        const unboundVar = it.consumeNextUnquotedText();
        return PatternTag_1.newTagFromObject({
            tagType: null,
            identifier: unboundVar,
            star: true
        });
    }
    const tagType = it.consumeNextUnquotedText();
    if (tagType === '/')
        throw new Error("syntax error, tagType was '/'");
    const valueOptions = parseTagValue(it);
    return PatternTag_1.newTagFromObject({
        ...valueOptions,
        tagType,
        negate,
        identifier: identifier || valueOptions.identifier,
    });
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
        if (it.finished() || it.nextIs(lexer_1.t_newline) || it.nextIs(lexer_1.t_bar))
            break;
        if (it.nextIs(lexer_1.t_dash)) {
            parseFlag(it, query);
            continue;
        }
        const tag = parseOneTag(it);
        query.tags.push(tag);
    }
}
function parseOneCommand(it) {
    it.skipSpaces();
    if (!it.nextIs(lexer_1.t_ident) && !it.nextIs(lexer_1.t_quoted_string))
        throw new Error("expected identifier, saw: " + it.nextText());
    const command = it.consumeNextUnquotedText();
    const query = {
        tags: [],
        flags: {}
    };
    parseArgs(it, query);
    const pattern = new Pattern_1.default(query.tags);
    return new Command_1.default(command, pattern, query.flags);
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
    if (typeof str !== 'string')
        throw new Error('expected string');
    const it = lexer_1.lexStringToIterator(str);
    const query = {
        tags: [],
        flags: {}
    };
    try {
        parseArgs(it, query);
    }
    catch (e) {
        console.error(e);
        throw new Error('Error trying to parse relation: ' + str);
    }
    if (Object.keys(query.flags).length !== 0) {
        throw new Error("didn't expect any flags in parseRelation(): " + str);
    }
    return Pattern_1.commandTagsToRelation(query.tags, null);
}
exports.parseRelation = parseRelation;
function parseTag(str) {
    const it = lexer_1.lexStringToIterator(str);
    return parseOneTag(it);
}
exports.parseTag = parseTag;
function parsePattern(str) {
    if (typeof str !== 'string')
        throw new Error('expected string, saw: ' + str);
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
    try {
        const command = parseOneCommand(it);
        return command;
    }
    catch (e) {
        console.error('Error trying to parse: ' + str);
        throw e;
    }
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