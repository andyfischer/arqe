
import Tuple from '../Tuple'
import { parsePattern } from '..'

const houseSize = 9;
const halfHouseSize = 4;
const storyHeight = 5;
const storyCount = 3;

const rodDownData = '0'
const rodUpData = '1'
const rodPlusZData = '2'
const rodMinusZData = '3'
const rodPlusXData = '4'
const rodMinusXData = '5'

const stairUpX = '0'
const stairDownX = '1'
const stairUpZ = '2'
const stairDownZ = '3'

class Vec3 {
    x: number
    y: number
    z: number

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(rhs: Vec3) {
        return new Vec3(this.x + rhs.x, this.y + rhs.y, this.z + rhs.z)
    }

    cw_yrotate() {
        return new Vec3(-this.z,this.y,this.x)
    }

    ccw_yrotate() {
        return new Vec3(this.z,this.y,-this.x)
    }

    toRodData() {
        if (this.x > 0 && this.z == 0)
            return rodPlusXData;
        if (this.x < 0 && this.z == 0)
            return rodMinusXData;
        if (this.x === 0 && this.z < 0)
            return rodMinusZData;
        if (this.x === 0 && this.z > 0)
            return rodPlusZData;

        throw new Error("can't toRodData vec3: " + JSON.stringify(this));
    }

    toStairData() {

        if (this.x > 0 && this.z == 0)
            return stairUpX;
        if (this.x < 0 && this.z == 0)
            return stairDownX;
        if (this.x === 0 && this.z > 0)
            return stairUpZ;
        if (this.x === 0 && this.z < 0)
            return stairDownZ;

        throw new Error("can't toRodData vec3: " + JSON.stringify(this));
    }
}

export function move(tup: Tuple, dx: number, dy: number, dz: number) {
    const x = parseInt(tup.getVal("x"));
    const y = parseInt(tup.getVal("y"));
    const z = parseInt(tup.getVal("z"));

    if (!isFinite(x))
        throw new Error("bad number: " + x);
    if (!isFinite(y))
        throw new Error("bad number: " + y);
    if (!isFinite(z))
        throw new Error("bad number: " + z);

    return (tup
            .setVal("x", x + dx + '')
            .setVal("y", y + dy + '')
            .setVal("z", z + dz + ''));
}

function setBlock(tup: Tuple, block: string) {
    return tup.setVal("block", block)
}

function setData(tup: Tuple, data: string) {
    return tup.setVal("data", data)
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
    yield move(nw, dx, 0, dz);
    yield move(nw, 0, 0, dz);
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
        yield* vbar(corner, storyHeight + 1);

    // Elevator
    const eleNw = setBlock(move(nw, 1, -1, 1), 'scaffolding');
    yield setBlock(move(eleNw, 1, 0, 0), 'air');
    yield* vbar(eleNw, storyHeight + 2);

    // Lighting
    let side = new Vec3(1, 0, 0);
    let front = new Vec3(0, 0, 1);

    const rodDist = 2;

    for (let corner of fourCorners(nw, houseSize, houseSize)) {
        corner = setBlock(corner, 'end_rod');
        corner = move(corner, 0, 3, 0);
        yield setBlock(corner, 'redstone_block');
        corner = move(corner, side.x, 0, side.z);
        corner = move(corner, front.x, 0, front.z);

        yield setData(move(corner, side.x * rodDist, 0, side.z * rodDist),
                      side.cw_yrotate().toRodData());
        yield setData(move(corner, front.x * rodDist, 0, front.z * rodDist),
                      front.ccw_yrotate().toRodData());

        front = front.cw_yrotate();
        side = side.cw_yrotate();
    }
}

function* xline(start: Tuple, length: number) {
    for (let i = 0; i <= length; i++)
        yield move(start, i, 0, 0);
}

function* yline(start: Tuple, length: number) {
    for (let i = 0; i <= length; i++)
        yield move(start, 0, i, 0);
}

function* zline(start: Tuple, length: number) {
    for (let i = 0; i <= length; i++)
        yield move(start, 0, 0, i);
}

function* ydonut(nw: Tuple, dx: number, dz: number) {

    yield* xline(nw, dx);
    yield* zline(nw, dz);
    yield* xline(move(nw, 0, 0, dz), dx);
    yield* zline(move(nw, dx, 0, 0), dz);
}

function* roof(nw: Tuple) {
    nw = setBlock(nw, 'quartz_block');
    yield* floor(nw, houseSize, houseSize);

    nw = setBlock(nw, 'quartz_stairs');
    nw = move(nw, -1, 0, -1);

    const dx = houseSize + 2;
    const dz = houseSize + 2;

    yield* xline(setData(nw, stairUpZ), dx);
    yield* xline(setData(move(nw, 0, 0, dz), stairDownZ), dx);
    yield* zline(setData(nw, stairUpX), dz);
    yield* zline(setData(move(nw, dx, 0, 0), stairDownX), dz);
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

        yield* roof(nw);
    },
    *rodtest() {
        const start = parsePattern("x/0 y/0 z/0");

        yield setBlock(start, 'cobblestone');

        let v = new Vec3(1, 0, 0);

        for (let i = 0; i < 4; i++) {
            const pos = move(start, v.x, 0, v.z);
            yield setBlock(setData(pos, v.toRodData()), 'end_rod');
            v = v.cw_yrotate();
        }
    },
    *stairtest() {
        const start = parsePattern("x/0 y/0 z/0 block/stone_stairs");

        for (let i = 0; i < 16; i++) {
            yield move(setData(start, i+''), i, 0, 0);
        }
    }
}

export default predefs;
