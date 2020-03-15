
export default class IDSource {
    next: number = 1;

    take(): string {
        const result = this.next + '';
        this.next += 1;
        return result;
    }
}
