export const fmt = (n: number, d = 4) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(n);
