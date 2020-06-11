
import Tuple from '../Tuple'
import { parsePattern } from '..'

const houseSize = 9;
const halfHouseSize = 4;
const storyHeight = 4;
const storyCount = 10;

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

const floorMaterial = 'quartz_block'
const cornerMaterial = 'stonebrick'
const doorframeMaterial = 'quartz_block'

const floorMaterials = [
    [ 'quartz_block', 0 ],
    [ 'concrete', 6 ],
    [ 'concrete', 14 ],
    [ 'concrete', 1 ],
    [ 'concrete', 4 ],
    [ 'concrete', 5 ],
    [ 'concrete', 9 ],
    [ 'concrete', 10 ],
    [ 'concrete', 11 ],
    [ 'concrete', 2 ],
]


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

export function up(tup: Tuple, dy) {
    return move(tup, 0, dy, 0);
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

function* story(nw: Tuple, storyIndex: number) {

    const material = floorMaterials[storyIndex];

    nw = setBlock(nw, material[0]+'')
    nw = setData(nw, material[1]+'')

    yield* floor(nw, houseSize, houseSize);

    nw = move(nw, 0, 1, 0);
    yield* xwall(setBlock(nw, 'glass'), houseSize, storyHeight);
    yield* zwall(setBlock(nw, 'glass'), houseSize, storyHeight);
    yield* xwall(move(setBlock(nw, 'glass'), 0, 0, houseSize), houseSize, storyHeight);
    yield* zwall(move(setBlock(nw, 'glass'), houseSize, 0, 0), houseSize, storyHeight);

    // Corners
    for (const corner of fourCorners(setBlock(nw, cornerMaterial), houseSize, houseSize))
        yield* vbar(move(corner, 0, -1, 0), storyHeight + 1);

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
        yield setBlock(corner, cornerMaterial);
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

function* zline_v2(start: Tuple, length: number) {
    for (let i = 0; i < length; i++)
        yield move(start, 0, 0, i);
}

function* ydonut(nw: Tuple, dx: number, dz: number) {

    yield* xline(nw, dx);
    yield* zline(nw, dz);
    yield* xline(move(nw, 0, 0, dz), dx);
    yield* zline(move(nw, dx, 0, 0), dz);
}

function* roof(nw: Tuple, size) {
    nw = setBlock(nw, 'quartz_block');
    yield* floor(nw, size, size);

    nw = setBlock(nw, 'quartz_stairs');
    nw = move(nw, -1, 0, -1);

    const dx = size + 2;
    const dz = size + 2;

    yield* xline(setData(nw, stairUpZ), dx);
    yield* xline(setData(move(nw, 0, 0, dz), stairDownZ), dx);
    yield* zline(setData(nw, stairUpX), dz);
    yield* zline(setData(move(nw, dx, 0, 0), stairDownX), dz);
}

function* frontDoor(nw: Tuple) {
    const door = move(nw, houseSize, 1, halfHouseSize);

    yield setData(setBlock(door, 'iron_door'), '2')
    yield setData(setBlock(move(door, 0, 0, 1), 'iron_door'), '2')

    //yield setData(setBlock(up(door, 1), 'iron_door'), '8');
    //yield setData(setBlock(move(door, 0, 1, 1), 'iron_door'), '9');

    yield* yline(setBlock(move(door, 0, 0, -1), doorframeMaterial), 2);
    yield* yline(setBlock(move(door, 0, 0, 2), doorframeMaterial), 2);

    yield* zline_v2(setBlock(move(door, 0, 2, -1), doorframeMaterial), 4);

    yield* zline_v2(setBlock(move(door, 1, -1, 0), doorframeMaterial), 2);
    yield* zline_v2(setBlock(move(door, 1, 0, 0), 'heavy_weighted_pressure_plate'), 2);
    yield* zline_v2(setBlock(move(door, -1, 0, 0), 'heavy_weighted_pressure_plate'), 2);

    yield* zline_v2(setData(setBlock(move(door, 2, -1, 0), 'quartz_stairs'), stairDownX), 2);
}

const predefs = {
    *vincentHouse() {
        const bottomCenter = parsePattern("x/0 y/0 z/0");

        let nw = move(bottomCenter, -halfHouseSize, 0, -halfHouseSize);

        const groundNw = nw;

        // below the bottom elevator
        yield move(setBlock(nw, 'cobblestone'), 1, -1, 1);

        for (let s = 0; s < storyCount; s++) {
            yield* story(nw, s);
            nw = move(nw, 0, storyHeight + 1, 0);

            if (s === 0)
                yield* frontDoor(groundNw);
        }

        yield* roof(nw, houseSize);
        yield* roof(move(nw, 1, 1, 1), houseSize -2);
        yield* roof(move(nw, 2, 2, 2), houseSize -4);
        yield* roof(move(nw, 3, 3, 3), houseSize -6);

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
