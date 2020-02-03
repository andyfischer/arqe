
import path from 'path'
import { startSuite } from '.'
const { test } = startSuite();

test("filesystem mount works", async ({run}) => {

    if (run.chaosMode && run.chaosMode.name === 'insertExtraTag')
        return;

    if (run.chaosMode && run.chaosMode.name === 'getInheritedBranch')
        return;

    const id = 'filesystem-mount/124';
    const dir = path.resolve(__dirname, 'filesystem-mount-test');

    await run(`set ${id}`)
    await run(`set ${id} .directory == ${dir}`)

    const list = await run(`get -list ${id} filename/*`);

    expect(list).toEqual(['filename/file1.txt']);
});
