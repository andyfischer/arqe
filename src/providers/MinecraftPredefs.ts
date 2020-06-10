
import Tuple from '../Tuple'
import { parsePattern } from '..'

const houseSize = 9;
const halfHouseSize = 4;
const storyHeight = 5;
const storyCount = 3;

class Vec3 {
    x: number
    y: number
    z: number

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    yrotate() {
        return new Vec3(this.z,this.y,-this.x)
    }
}

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
    for (let x = 0; x <= width; x++)
        for (let y = 0; y <= height; y++)
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

function* vbar(bot: Tuple, height: number) {
    for (let y = 0; y < height; y++)
        yield move(bot, 0, y, 0);
}

function* fourCorners(nw: Tuple, dx: number, dz: number) {
    yield nw;
    yield move(nw, dx, 0, 0);
    yield move(nw, 0, 0, dz);
    yield move(nw, dx, 0, dz);
}


function* story(nw: Tuple) {
    yield* floor(setBlock(nw, 'planks'), houseSize, houseSize);

    nw = move(nw, 0, 1, 0);
    yield* xwall(setBlock(nw, 'glass'), houseSize, storyHeight);
    yield* zwall(setBlock(nw, 'glass'), houseSize, storyHeight);
    yield* xwall(move(setBlock(nw, 'glass'), 0, 0, houseSize), houseSize, storyHeight);
    yield* zwall(move(setBlock(nw, 'glass'), houseSize, 0, 0), houseSize, storyHeight);

    // Corners
    for (const corner of fourCorners(setBlock(nw, 'redstone_block'), houseSize, houseSize))
        yield* vbar(corner, storyHeight);

    // Elevator
    const eleNw = setBlock(move(nw, 1, -1, 1), 'scaffolding');
    yield setBlock(move(nw, 1, 0, 0), 'air');
    yield* vbar(eleNw, storyHeight + 2);

    // Lighting
    let inward = new Vec3(1, 0, 1);
    for (let corner of fourCorners(nw, houseSize, houseSize)) {
        corner = setBlock(corner, 'end_rod');

        corner = move(corner, inward.x, 3, inward.y);

        yield move(corner, inward.x * 3, 0, 0);
        yield move(corner, 0, 0, inward.z * 3);

        inward = inward.yrotate();
    }

}

const predefs = {
    *vincentHouse() {
        const bottomCenter = parsePattern("x/0 y/0 z/0");

        let nw = move(bottomCenter, -halfHouseSize, 0, -halfHouseSize);

        // below the bottom elevator
        yield move(setBlock(nw, 'cobblestone'), 1, -1, 1);

        for (let s = 0; s < storyCount; s++) {
            yield* story(nw);
            nw = move(nw, 0, storyHeight + 1, 0);
        }
    }
}

export default predefs;
