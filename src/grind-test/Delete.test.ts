
import { startSuite } from '.'
const { test } = startSuite();

test('delete works', ({run}) => {
    run('set deletetest/1');
    expect(run('delete deletetest/1')).toEqual('#done');
    expect(run('get deletetest/1')).toEqual('#null');
});

test('delete * works', ({run}) => {
    run('set deletetest/1');
    run('set deletetest/2');
    run('set deletetest/3');
    expect(run('delete deletetest/*')).toEqual('#done');
    expect(run('get deletetest/1')).toEqual('#null');
    expect(run('get deletetest/2')).toEqual('#null');
    expect(run('get deletetest/3')).toEqual('#null');
});

test('delete t1/x t2/*', ({run}) => {
    run('set deletetest/1 t2/1');
    run('set deletetest/1 t2/2');
    run('set deletetest/2 t2/1');
    expect(run('delete deletetest/1 t2/*')).toEqual('#done');
    expect(run('get deletetest/1 t2/1')).toEqual('#null');
    expect(run('get deletetest/1 t2/2')).toEqual('#null');
    expect(run('get deletetest/2 t2/1')).toEqual('#exists');
});
