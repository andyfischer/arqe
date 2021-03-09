

export default function exprToString(expr: string[] | string): string {

    if (Array.isArray(expr))
        return '(' + expr.map(exprToString).join(' ') + ')'
    else
        return expr;
}
