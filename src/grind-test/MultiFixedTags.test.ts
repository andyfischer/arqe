
import { startSuite } from './TestSuite'
const { test } = startSuite();

test('correctly matches several exact tags', ({run}) => {
    run('set a b c');
    expect(run('get a b')).toEqual('#null');
    expect(run('get a b c')).toEqual('#exists');
    expect(run('get a b c d')).toEqual('#null');
});
