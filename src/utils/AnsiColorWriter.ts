
function csi(code) {
    return '\x1B'+`[${code}m`
}

export const ansi_red = 31;
export const ansi_green = 32;
export const ansi_yellow = 33;

export default class AnsiColorWriter {

    out: string[] = []

    setFG(n: number) {
        this.out.push(csi(n));
    }
    
    write(str: string) {
        this.out.push(str);
    }

    reset() {
        this.out.push(csi(0));
    }

    finish() {
        this.reset();
        return this.out.join('');
    }
}
