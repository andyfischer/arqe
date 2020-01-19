
import { parseStringToGraphCommands } from '..'

const testCode = `
function f() {
    const a = 1 + 2;
    console.log(a);
}
`;

describe('parseStringToGraph', () => {
    it("works", () => {
        console.log(parseStringToGraphCommands(testCode));
    });
});
