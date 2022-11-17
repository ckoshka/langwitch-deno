const now = () => new Date().getTime() / 1000 / 60 / 60;
export const generateConcepts = (names: string[]) => names.map(name => ({
    name,
    timesSeen: 50,
    firstSeen: now() - 10000,
    decayCurve: -0.09,
    lastSeen: now()
}));

