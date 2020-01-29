
import { startSuite } from '.'
const { test } = startSuite();

test('overwrite', async ({run}) => {
    const object = 'tc20/1';
    await run(`set ${object}`);
    expect(await run(`get ${object}`)).toEqual('#exists');

    await run(`set ${object} == 1`)
    expect(await run(`get ${object}`)).toEqual('1');

    await run(`set ${object}`)
    expect(await run(`get ${object}`)).toEqual('#exists');
});

