
import { startSuite } from '.'
const suite = startSuite();

suite.test('-x flag returns "set" command', async ({run}) => {
    await run('set getflags/1');
    expect((await run('get -x getflags/1')).replace(' extra', '')).toEqual('set getflags/1');
});
