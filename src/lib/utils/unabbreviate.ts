export function unabbreviate(num: string) {
  const base = parseInt(num);
  if (num.toLowerCase().match(/k/)) return Math.round(base * 1000);
  else if (num.toLowerCase().match(/m/)) return Math.round(base * 1000000);
  else if (num.toLowerCase().match(/b/)) return Math.round(base * 1000000000);
  else return base;
}