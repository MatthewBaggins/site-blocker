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
    