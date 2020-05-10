"use strict";
// Read and tokenize string
Object.defineProperty(exports, "__esModule", { value: true });
// Output AST nodes
// Create a parse/#unique
// Output:
//   set parse/123 module/123
//   set module/123 function/123
//   set function/123 block/123
//   set block/123 statement/123
const lexer_1 = require("../lexer");
let it;
let out;
let nextUniqueId = 1;
function uniqueId(t) {
    const n = nextUniqueId;
    nextUniqueId += 1;
    return `${t}/${n}`;
}
function set(rel) {
    if (rel.indexOf('undefined') !== -1)
        throw new Error("rel has 'undefined': " + rel);
    out(`set ${rel}`);
}
function parseError(parentId) {
    let id = uniqueId('parseError');
    set(`${parentId} ${id}`);
    const text = it.nextText();
    it.consume();
    set(`${id} .text == ${text}`);
    return id;
}
function errorExpected(parentId, expected) {
    const errorId = parseError(parentId);
    set(`${errorId} .expected == ${expected}`);
    set(`${errorId} .saw == ${it.nextText()}`);
    return errorId;
}
function braceBlock(parentId) {
    let id = uniqueId('block');
    set(`${parentId} ${id}`);
    if (!it.tryConsume(lexer_1.t_lbrace)) {
        errorExpected(id, 'left brace');
        return;
    }
    while (true) {
        it.consumeWhitespace();
        if (it.finished() || it.nextIs(lexer_1.t_rbrace))
            break;
        statement(id);
    }
    if (!it.tryConsume(lexer_1.t_rbrace)) {
        errorExpected(id, 'right brace');
        return;
    }
}
function functionDecl(parentId) {
    let id = uniqueId('function');
    set(`${parentId} ${id}`);
    it.consumeIdentifier('function');
    it.consumeWhitespace();
    if (it.nextIs(lexer_1.t_ident)) {
        const functionName = it.nextText();
        it.consume();
        it.consumeWhitespace();
        set(`${id} .name == ${functionName}`);
    }
    if (!it.tryConsume(lexer_1.t_lparen)) {
        errorExpected(id, 'left paren');
        return;
    }
    it.consumeWhitespace();
    while (!it.finished() && !it.nextIs(lexer_1.t_rparen)) {
        it.consume();
    }
    if (!it.tryConsume(lexer_1.t_rparen)) {
        errorExpected(id, 'right paren');
        return;
    }
    it.consumeWhitespace();
    braceBlock(id);
    it.consumeWhitespace();
}
function atom() {
    const id = uniqueId('expr');
    if (it.nextIs(lexer_1.t_integer)) {
        set(`${id} .type == literal`);
        set(`${id} .literalValue == ${it.nextText()}`);
        it.consume();
        return id;
    }
    else if (it.nextIs(lexer_1.t_ident)) {
        set(`${id} .type == ident`);
        set(`${id} .identName == ${it.nextText()}`);
        it.consume();
        return id;
    }
    else {
        errorExpected(id, "value");
    }
    return id;
}
function funcCallInputs(id) {
    let inputIndex = 0;
    while (true) {
        it.consumeWhitespace();
        if (it.finished())
            break;
        if (it.tryConsume(lexer_1.t_rparen))
            break;
        const expr = expression(null);
        set(`${id} input/${inputIndex} >${expr}`);
    }
}
function atomWithPostfix() {
    let lhs = atom();
    if (!lhs)
        throw new Error("internal error: null lhs in atomWithPostfix");
    while (true) {
        if (it.tryConsume(lexer_1.t_lparen)) {
            const id = uniqueId('expr');
            set(`${lhs} ${id}`);
            set(`${id} .type == funccall`);
            it.consumeWhitespace();
            funcCallInputs(id);
            lhs = id;
            continue;
        }
        if (it.tryConsume(lexer_1.t_dot)) {
            const id = uniqueId('expr');
            const rhs = atomWithPostfix();
            if (!lhs)
                throw new Error("internal error in atomWithPostfix 2: lhs is undefined");
            set(`${id} input/0 >${lhs}`);
            set(`${id} input/1 >${rhs}`);
            set(`${id} .type == memberaccess`);
            it.consumeWhitespace();
            lhs = id;
            continue;
        }
        break;
    }
    return lhs;
}
function getInfixPrecedence(tokenName) {
    switch (tokenName) {
        case 'plus':
        case 'minus':
            return 14;
    }
    return null;
}
function infixExpression() {
    const lhs = atomWithPostfix();
    if (!lhs)
        throw new Error('internal error: lhs id is undefined');
    it.consumeWhitespace();
    const precedence = getInfixPrecedence(it.next().match.name);
    if (precedence === null)
        // No infix operator, just use the atom.
        return lhs;
    // Parse an infix operator.
    const id = uniqueId('expr');
    const operator = it.next().match.name;
    it.consume();
    it.consumeWhitespace();
    // TODO- probably need to loop here for recursive infix exprs
    const rhs = atomWithPostfix();
    if (!lhs)
        throw new Error("internal error in infixExpression: lhs is undefined");
    if (!rhs)
        throw new Error('internal error in infixExpression: rhs is undefined');
    set(`${id} input/0 >${lhs}`);
    set(`${id} input/1 >${rhs}`);
    set(`${id} .operator == ${operator}`);
    return id;
}
function expression(parentId) {
    const id = infixExpression();
    if (parentId)
        set(`${parentId} ${id}`);
    return id;
}
function letDecl(parentId) {
}
function constDecl(parentId) {
    let id = uniqueId('decl');
    set(`${parentId} ${id}`);
    if (!it.nextIsIdentifier("const")) {
        errorExpected(id, "const");
        return;
    }
    it.consume();
    it.consumeWhitespace();
    set(`${id} .name == ${it.nextText()}`);
    it.consume();
    it.consumeWhitespace();
    if (!it.tryConsume(lexer_1.t_equals)) {
        errorExpected(id, "=");
        return;
    }
    it.consumeWhitespace();
    expression(id);
}
function statement(parentId) {
    let id = uniqueId('statement');
    set(`${parentId} ${id}`);
    if (it.nextIsIdentifier("function")) {
        functionDecl(id);
    }
    else if (it.nextIsIdentifier("const")) {
        constDecl(id);
    }
    else {
        const exprId = infixExpression();
        set(`${id} ${exprId}`);
    }
    it.tryConsume(lexer_1.t_semicolon);
}
function moduleStatement(moduleId) {
    let isExport = false;
    // todo: handle 'export'
    statement(moduleId);
}
function parseModule() {
    const id = uniqueId('module');
    set(`${id}`);
    while (!it.finished()) {
        it.consumeWhitespace();
        moduleStatement(id);
    }
}
function parseSourceIntoGraph(graph, str) {
    const commands = [];
    it = lexer_1.lexStringToIterator(str);
    out = cmd => graph.run(cmd);
    parseModule();
    return commands;
}
exports.parseSourceIntoGraph = parseSourceIntoGraph;
