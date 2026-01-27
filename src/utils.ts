export const randInt = (min: number, max: number): number => 
    Math.floor(Math.random() * (max - min + 1)) + min;

export const getDomainOrigins = (domain: string): string[] => 
    [
        `https://${domain}`,
        `http://${domain}`,
        `https://www.${domain}`,
        `http://www.${domain}`,
        `https://m.${domain}`,
        `http://m.${domain}`
    ];

export const shuffleList = <T>(arr: readonly T[]): T[] => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
