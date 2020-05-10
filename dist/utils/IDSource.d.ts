export default class IDSource {
    prefix: string;
    next: number;
    constructor(prefix?: string);
    take(): string;
}
