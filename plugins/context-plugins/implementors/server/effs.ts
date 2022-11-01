export type StdoutEffect = {
    writeStdout: (data: string) => Promise<void> | void;
}

export type StdinEffect = {
    readStdin: () => Promise<string> | string;
}