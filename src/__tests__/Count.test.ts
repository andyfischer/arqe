
import { setupGraph } from './utils'

function setup() {
    return setupGraph({
        provide: {
            'a': 'memory',
            'b': 'memory',
        }
    });
}

it('empty count', () => {
    const { run } = setup();
    expect(run('count').stringifyBody()).toEqual(['count/0']);
});

it('count search', () => {
    const { run } = setup();
    expect(run('count a').stringifyBody()).toEqual(['count/0']);
    run('set a=1');
    expect(run('count a').stringifyBody()).toEqual(['count/1']);
    run('set a=2');
    run('set a=3');
    run('set a=4');
    expect(run('count a').stringifyBody()).toEqual(['count/4']);
});

it('count piped', () => {
    const { run } = setup();
    expect(run('get a | count').stringifyBody()).toEqual(['count/0']);
    run('set a=1');
    expect(run('get a | count').stringifyBody()).toEqual(['count/1']);
    run('set a=2');
    run('set a=3');
    run('set a=4');
    expect(run('get a | count').stringifyBody()).toEqual(['count/4']);
});

it('count search and piped', () => {
    const { run } = setup();
    expect(run('get a | count b').stringifyBody()).toEqual(['count/0']);
    run('set a=1');
    expect(run('get a | count b').stringifyBody()).toEqual(['count/1']);
    run('set b=1');
    expect(run('get a | count b').stringifyBody()).toEqual(['count/2']);
    run('set a=2');
    run('set a=3');
    run('set a=4');
    expect(run('get a | count b').stringifyBody()).toEqual(['count/5']);
    run('set b=2');
    run('set b=3');
    run('set b=4');
    expect(run('get a | count b').stringifyBody()).toEqual(['count/8']);
});
