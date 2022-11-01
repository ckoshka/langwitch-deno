export const makeRecord = <T>(data: T[], via: (a0: T) => string) => {
    const rec: Record<string, T> = {};
    data.forEach((c) => rec[via(c)] = c);
    return rec;
}