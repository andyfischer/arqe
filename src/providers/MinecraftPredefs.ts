
import Tuple from '../Tuple'
import { parsePattern } from '..'

export function move(tup: Tuple, dx: number, dy: number, dz: number) {
    const x = parseInt(tup.getVal("x"));
    const y = parseInt(tup.getVal("y"));
    const z = parseInt(tup.getVal("z"));

    return (tup
            .setVal("x", x + dx + '')
            .setVal("y", y + dy + '')
            .setVal("z", z + dz + ''));
}

function setBlock(tup: Tuple, block: string) {
    return tup.setVal("block", block)
}

function* floor(nw: Tuple, width: number, height: number) {
    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
            yield move(nw, x, 0, y);
}

function* xwall(nw: Tuple, length: number, height: number) {
    for (let x = 0; x < length; x++)
        for (let y = 0; y < height; y++)
            yield move(nw, x, y, 0);
}

function* zwall(nw: Tuple, length: number, height: number) {
    for (let z = 0; z < length; z++)
        for (let y = 0; y < height; y++)
            yield move(nw, 0, y, z);
}

function* story(nw: Tuple) {
    yield* floor(setBlock(nw, 'planks'), 5, 5);

    nw = move(nw, 0, 1, 0);
    yield* xwall(setBlock(nw, 'glass'), 5, 5);
    yield* zwall(setBlock(nw, 'glass'), 5, 5);
    //yield* xwall(move(setBlock(nw, 'glass'), 0, 0, 5), 5, 5);
    // yield* zwall(move(setBlock(nw, 'glass'), 5, 0, 0), 5, 5);
}

const predefs = {
    *vincentHouse() {
        const bottomCenter = parsePattern("x/0 y/0 z/0");

        let nw = move(bottomCenter, -2, 0, -2);

        yield* story(nw);

        nw = move(nw, 0, 6, 0);

        yield* story(nw);
    }
}

export default predefs;
