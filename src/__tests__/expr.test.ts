
import { parseExprFromString, evalExpr } from '../parseExpr'

it('correctly parses', () => {
    expect(parseExprFromString("(list 1 2 str)")).toEqual(['list', '1', '2', 'str']);
})

it('correctly parses nested exprs', () => {
    expect(parseExprFromString("(list (add 1 2) str)")).toEqual(['list', ['add', '1', '2'], 'str']);
})

it('correctly evals', () => {
    const expr = parseExprFromString("(list 1 2)") as string[]
    expect(evalExpr({}, expr)).toEqual(['1', '2']);
})

it('correctly evals with custom handler', () => {
    const expr = parseExprFromString("(list 1 2)") as string[]
    function add(items: string[]) {
        return items.map(parseInt).reduce((total, i) => total + i).toString()
    }
    expect(evalExpr({add}, expr)).toEqual(['1', '2']);
})
