
export default interface TerminalConnection {
    submitQuery: (cmd: string) => Promise<void>
}
