
export interface TokenDef {
    name: string
    str?: string
}

export const t_lparen = {
    name: "lparen",
    str: "("
}

export const t_rparen = {
    name: "rparen",
    str: ")"
}

export const t_lbracket = {
    name: "lbracket",
    str: "["
}

export const t_rbracket = {
    name: "rbracket",
    str: "]"
}

export const t_slash = {
    name: "slash",
    str: "/"
}

export const t_dot = {
    name: "dot",
    str: "."
}

export const t_double_dot = {
    name: "dot",
    str: ".."
}

export const t_semicolon = {
    "name": "semicolon",
    "str": ";"
}

export const t_colon = {
    "name": "colon",
    "str": ":"
}

export const t_plus = {
    name: "plus",
    str: "+"
}

export const t_dash = {
    name: "dash",
    str: "-"
}

export const t_double_dash = {
    name: "double-dash",
    str: "--"
}

export const t_star = {
    name: "star",
    str: "*"
}

export const t_equals = {
    name: "equals",
    str: "="
}

export const t_hash = {
    name: "hash",
    str: "#"
}

export const t_percent = {
    name: "percent",
    str: "%"
}

export const t_dollar = {
    name: "dollar",
    str: "$"
}

export const t_bang = {
    name: "bang",
    str: "~"
}

export const t_bar = {
    name: "bar",
    str: "|"
}

export const t_ident = {
    name: "ident"
}

export const t_integer = {
    name: "integer"
}

export const t_space = {
    name: "space"
}

export const t_newline = {
    name: "newline",
    str: '\n'
}

export const t_single_quote = {
    name: "single_quote",
    str: "'"
}

export const t_double_quote = {
    name: "double_quote",
    str: '"'
}

export const t_line_comment = {
    name: 'line_comment'
}

export const t_unrecognized = {
    name: "unrecognized"
}

export const everyToken: TokenDef[] = [
    t_lparen,
    t_rparen,
    t_lbracket,
    t_rbracket,
    t_slash,
    t_dot,
    t_double_dot,
    t_semicolon,
    t_colon,
    t_plus,
    t_dash,
    t_star,
    t_equals,
    t_hash,
    t_percent,
    t_dollar,
    t_bang,
    t_bar,
    t_ident,
    t_integer,
    t_space,
    t_newline,
    t_single_quote,
    t_double_quote,
    t_line_comment,
    t_unrecognized
];

export const tokenFromSingleCharCode: {[code:string]: TokenDef} = {}

for (const token of everyToken) {
    if (token.str && token.str.length === 1) {
        tokenFromSingleCharCode[token.str.charCodeAt(0)] = token;
    }
}
