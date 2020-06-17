
import { errorLineRegex } from '../TypescriptCompiler'

it('matches TSC output as expected', () => {

    const example = `src/__tests__/findTableForQuery.test.ts(16,63): error TS2345: Argument of type '{ relation(r: any): void; finish(): void; }' is not assignable to parameter of type 'TupleReceiver'.`

    const match = errorLineRegex.exec(example);
    expect(match).toBeTruthy();

});
