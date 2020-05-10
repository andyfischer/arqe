"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t_lparen = {
    name: "lparen",
    str: "(",
    bracketPairsWith: 'rparen',
    bracketSide: 'left'
};
exports.t_rparen = {
    name: "rparen",
    str: ")",
    bracketPairsWith: 'lparen',
    bracketSide: 'right'
};
exports.t_lbracket = {
    name: "lbracket",
    str: "[",
    bracketPairsWith: 'rbracket',
    bracketSide: 'left'
};
exports.t_rbracket = {
    name: "rbracket",
    str: "]",
    bracketPairsWith: 'lbracket',
    bracketSide: 'right'
};
exports.t_lbrace = {
    name: "lbrace",
    str: "{",
    bracketPairsWith: 'rbrace',
    bracketSide: 'left'
};
exports.t_rbrace = {
    name: "rbrace",
    str: "}",
    bracketPairsWith: 'lbrace',
    bracketSide: 'right'
};
exports.t_slash = {
    name: "slash",
    str: "/"
};
exports.t_dot = {
    name: "dot",
    str: "."
};
exports.t_double_dot = {
    name: "double-dot",
    str: ".."
};
exports.t_semicolon = {
    "name": "semicolon",
    "str": ";"
};
exports.t_colon = {
    "name": "colon",
    "str": ":"
};
exports.t_plus = {
    name: "plus",
    str: "+"
};
exports.t_dash = {
    name: "dash",
    str: "-"
};
exports.t_double_dash = {
    name: "double-dash",
    str: "--"
};
exports.t_star = {
    name: "star",
    str: "*"
};
exports.t_equals = {
    name: "equals",
    str: "="
};
exports.t_double_equals = {
    name: "double-equals",
    str: "=="
};
exports.t_hash = {
    name: "hash",
    str: "#"
};
exports.t_percent = {
    name: "percent",
    str: "%"
};
exports.t_dollar = {
    name: "dollar",
    str: "$"
};
exports.t_tilde = {
    name: "tilde",
    str: "~"
};
exports.t_exclamation = {
    name: "exclamation",
    str: "!"
};
exports.t_bar = {
    name: "bar",
    str: "|"
};
exports.t_question = {
    name: "question",
    str: "?"
};
exports.t_ident = {
    name: "ident"
};
exports.t_integer = {
    name: "integer"
};
exports.t_space = {
    name: "space"
};
exports.t_newline = {
    name: "newline",
    str: '\n'
};
exports.t_quoted_string = {
    name: "quoted_string",
};
exports.t_line_comment = {
    name: 'line_comment'
};
exports.t_unrecognized = {
    name: "unrecognized"
};
exports.everyToken = [
    exports.t_lparen,
    exports.t_rparen,
    exports.t_lbracket,
    exports.t_rbracket,
    exports.t_lbrace,
    exports.t_rbrace,
    exports.t_slash,
    exports.t_dot,
    exports.t_double_dot,
    exports.t_semicolon,
    exports.t_colon,
    exports.t_plus,
    exports.t_dash,
    exports.t_star,
    exports.t_equals,
    exports.t_double_equals,
    exports.t_hash,
    exports.t_percent,
    exports.t_dollar,
    exports.t_tilde,
    exports.t_exclamation,
    exports.t_bar,
    exports.t_question,
    exports.t_ident,
    exports.t_integer,
    exports.t_space,
    exports.t_newline,
    exports.t_quoted_string,
    exports.t_line_comment,
    exports.t_unrecognized
];
exports.tokenFromSingleCharCode = {};
const tokensByName = {};
for (const token of exports.everyToken) {
    if (!token.name)
        throw new Error("token is missing name: " + token);
    if (token.str && token.str.length === 1) {
        exports.tokenFromSingleCharCode[token.str.charCodeAt(0)] = token;
    }
    if (tokensByName[token.name])
        throw new Error("duplicate token name: " + token.name);
    tokensByName[token.name] = token;
}
//# sourceMappingURL=tokens.js.map