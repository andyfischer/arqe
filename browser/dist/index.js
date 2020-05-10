"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const playwright_1 = __importDefault(require("playwright"));
const Graph_1 = __importDefault(require("./fs/Graph"));
const graph = new Graph_1.default();
async function main() {
    const browserType = 'chromium';
    const browser = await playwright_1.default[browserType].launch({
        headless: false
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('http://twitch.tv/');
    await browser.close();
}
main()
    .catch(console.error);
