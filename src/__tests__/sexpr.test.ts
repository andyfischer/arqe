
import { parseSexprFromString, evalSexpr } from '../sexpr'

it('correctly parses', () => {
    expect(parseSexprFromString("(list 1 2 str)")).toEqual(['list', '1', '2', 'str']);
})

it('correctly parses nested exprs', () => {
    expect(parseSexprFromString("(list (add 1 2) str)")).toEqual(['list', ['add', '1', '2'], 'str']);
})

it('correctly evals', () => {
    const expr = parseSexprFromString("(list 1 2)") as string[]
    expect(evalSexpr({}, expr)).toEqual(['1', '2']);
})

it('correctly evals with custom handler', () => {
    const expr = parseSexprFromString("(list 1 2)") as string[]
    function add(items: string[]) {
        return items.map(parseInt).reduce((total, i) => total + i).toString()
    }
    expect(evalSexpr({add}, expr)).toEqual(['1', '2']);
})