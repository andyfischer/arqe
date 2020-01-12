
import { startSuite } from './TestSuite'
const suite = startSuite();

suite.test('-x flag returns "set" command', ({run}) => {
    run('set getflags/1');
    expect(run('get -x getflags/1')).toEqual('set getflags/1');
});
