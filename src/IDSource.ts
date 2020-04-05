
export default class IDSource {
    prefix: string;
    next: number = 1;

    constructor(prefix: string = '') {
        this.prefix = prefix;
    }

    take(): string {
        const result = this.prefix + this.next + '';
        this.next += 1;
        return result;
    }
}
