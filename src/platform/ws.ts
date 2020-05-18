
import runningInBrowser from './runningInBrowser'

let _ws;

if (runningInBrowser()) {
    _ws = window['WebSocket'];
} else {
    _ws = require('ws');
}

export default _ws;
