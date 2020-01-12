
import { run } from './Setup'

it("initially doesn't have a value", () => {
    const existing = run('get testval/1');
    expect(existing).toEqual('#null');
});

it("set and get #exists", () => {
    const existing = run('get testval/2');
    expect(existing).toEqual('#null');

    run('set testval/2');
    const found = run('get testval/2');
    expect(found).toEqual('#exists');
});

it("set and get payload", () => {
    const existing = run('get testval/3');
    expect(existing).toEqual('#null');

    run('set testval/3 == 123');
    const found = run('get testval/3');
    expect(found).toEqual('123');
});

it("overwrite set and get the value", () => {
    const existing = run('get testval/4');
    expect(existing).toEqual('#null');

    run('set testval/4 == 123');
    const found = run('get testval/4');
    expect(found).toEqual('123');

    run('set testval/4 == 456');
    const found2 = run('get testval/4');
    expect(found2).toEqual('456');
});

it("overwrite value with #exists", () => {
    const existing = run('get testval/5');
    expect(existing).toEqual('#null');

    run('set testval/5 == 123');
    const found = run('get testval/5');
    expect(found).toEqual('123');

    run('set testval/5');
    const found2 = run('get testval/5');
    expect(found2).toEqual('#exists');
});

it("overwrite #exists with value", () => {
    const existing = run('get testval/6');
    expect(existing).toEqual('#null');

    run('set testval/6');
    const found = run('get testval/6');
    expect(found).toEqual('#exists');

    run('set testval/6 == 123');
    const found2 = run('get testval/6');
    expect(found2).toEqual('123');
});
