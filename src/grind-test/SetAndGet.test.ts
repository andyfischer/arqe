
import { startSuite } from './TestSuite'
const { test } = startSuite();

test("initially doesn't have a value", ({run}) => {
    const existing = run('get testval/1');
    expect(existing).toEqual('#null');
});

test("set and get #exists", ({run}) => {
    const existing = run('get testval/2');
    expect(existing).toEqual('#null');

    run('set testval/2');
    const found = run('get testval/2');
    expect(found).toEqual('#exists');
});

test("set and get payload", ({run}) => {
    const existing = run('get testval/3');
    expect(existing).toEqual('#null');

    run('set testval/3 == 123');
    const found = run('get testval/3');
    expect(found).toEqual('123');
});

test("overwrite set and get the value", ({run}) => {
    const existing = run('get testval/4');
    expect(existing).toEqual('#null');

    run('set testval/4 == 123');
    const found = run('get testval/4');
    expect(found).toEqual('123');

    run('set testval/4 == 456');
    const found2 = run('get testval/4');
    expect(found2).toEqual('456');
});

test("overwrite value with #exists", ({run}) => {
    const existing = run('get testval/5');
    expect(existing).toEqual('#null');

    run('set testval/5 == 123');
    const found = run('get testval/5');
    expect(found).toEqual('123');

    run('set testval/5');
    const found2 = run('get testval/5');
    expect(found2).toEqual('#exists');
});

test("overwrite #exists with value", ({run}) => {
    const existing = run('get testval/6');
    expect(existing).toEqual('#null');

    run('set testval/6');
    const found = run('get testval/6');
    expect(found).toEqual('#exists');

    run('set testval/6 == 123');
    const found2 = run('get testval/6');
    expect(found2).toEqual('123');
});
