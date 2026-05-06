const dangerPatterns = [
  /glucose[^0-9]*(3\d{2,}|[4-9]\d{2,})/i,
  /hemoglobin[^0-9]*([0-6](\.\d+)?)/i,
  /platelet[^0-9]*([0-4]\d{4})/i,
  /oxygen[^0-9]*([0-8]\d)/i,
  /severe|critical|urgent/i,
];

export function detectUrgency(content: string) {
  return dangerPatterns.some((pattern) => pattern.test(content));
}
