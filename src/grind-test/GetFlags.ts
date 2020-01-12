
import { run } from './Setup'

it('-x flag returns "set" command', () => {
    run('set getflags/1');
    expect(run('get -x getflags/1')).toEqual('set -x getflags/1');
});
