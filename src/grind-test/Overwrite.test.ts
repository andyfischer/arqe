
import { startSuite } from '.'
const { test } = startSuite();

test('overwrite', ({run}) => {
    run('set d/1');
    expect(run('get d/1')).toEqual('#exists');

    run('set d/1 == 1')
    expect(run('get d/1')).toEqual('1');

    run('set d/1')
    expect(run('get d/1')).toEqual('#exists');
});

