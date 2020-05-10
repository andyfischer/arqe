interface ProtocolError {
    problem: string;
    causedBy?: string;
    causedByIndex?: number;
}
export default function verifyRespondProtocol(originalCommand: string, onError: (e: ProtocolError) => void): (message: any) => void;
export {};
