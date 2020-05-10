"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = __importDefault(require("child_process"));
const util_1 = __importDefault(require("util"));
const events_1 = require("events");
exports.printEvents = new events_1.EventEmitter();
function print(...args) {
    console.log(args);
}
exports.print = print;
function printError(err) {
    const message = err.message || '';
    if (message.startsWith('[external] ')) {
        print(message.replace('[external] ', ''));
        return;
    }
    console.log(err.stack || err);
}
exports.printError = printError;
const hexLetters = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
function randomHex(length) {
    let out = '';
    while (length > 0) {
        const letter = hexLetters[Math.floor(Math.random() * hexLetters.length)];
        out += letter;
        length--;
    }
    return out;
}
exports.randomHex = randomHex;
function readTextLinesSync(filename) {
    const contents = require('fs').readFileSync(filename, 'utf8');
    return contents.split('\n');
}
exports.readTextLinesSync = readTextLinesSync;
function toSet(items) {
    const set = {};
    for (const item of items) {
        set[item] = true;
    }
    return set;
}
exports.toSet = toSet;
function freeze(value) {
    return JSON.parse(JSON.stringify(value));
}
exports.freeze = freeze;
function allTrue(items) {
    for (const item of items)
        if (!item)
            return false;
    return true;
}
exports.allTrue = allTrue;
function values(obj) {
    const out = [];
    for (const k in obj) {
        out.push(obj[k]);
    }
    return out;
}
exports.values = values;
exports.exec = util_1.default.promisify(child_process_1.default.exec);
async function timedOut(p, ms) {
    return new Promise((resolve, reject) => {
        setTimeout((() => resolve(true)), ms);
        p.then(() => resolve(false));
    });
}
exports.timedOut = timedOut;
