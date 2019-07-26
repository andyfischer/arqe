
import TerminalConnection from './TerminalConnection'
import EventEmitter from 'events'

const ansi_delete = '\x7f';
const ansi_backspace = '\x08';
const ansi_return = '\r';
const ansi_up = '\u001b[A';
const ansi_down = '\u001b[B';
const ansi_left = '\u001b[C';
const ansi_right = '\u001b[D';

export default class TerminalState {
    connection: TerminalConnection

    history = [] as string[]
    historyPosition = null

    output = [] as string[]

    currentInput = ''

    events = new EventEmitter()

    constructor(connection) {
        this.connection = connection;
    }

    historyUp() {
        if (this.history.length === 0)
            return;

        if (this.historyPosition === null)
            this.historyPosition = this.history.length;

        this.historyPosition -= 1;

        if (this.historyPosition < 0)
            this.historyPosition = 0;

        this.currentInput = this.history[this.historyPosition]
    }

    historyDown() {
        if (this.historyPosition === null)
            return;

        if (this.history.length === 0)
            return;

        this.historyPosition += 1;

        if (this.historyPosition >= this.history.length)
            this.historyPosition = null;

        if (this.historyPosition)
            this.currentInput = this.history[this.historyPosition]
        else
            this.currentInput = ''
    }

    handleInput(data) {
        switch (data) {
        case ansi_backspace:
        case ansi_delete:
            this.backspace();
            break;
        case ansi_return:
            this.submit();
            break;
        case ansi_up:
            this.historyUp();
            break;
        case ansi_down:
            this.historyDown();
            break;
        default:
            //this.currentInput = JSON.stringify(data)
            this.currentInput += data;
        }

        this.events.emit('change');
    }

    backspace() {
        if (this.currentInput) {
            this.currentInput = this.currentInput.slice(0, this.currentInput.length - 1);
        }
    }

    async submit() {
        const cmd = this.currentInput;

        this.currentInput = '';
        this.events.emit('change');
        this.output.push('> ' + cmd);

        if (!cmd)
            return;

        this.history.push(cmd);
        this.historyPosition = null;

        const response = await this.connection.submitQuery(cmd);
        this.output.push(JSON.stringify(response));
        this.events.emit('change');
    }
}
