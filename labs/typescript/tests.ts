const value: { pmid: string } = { pmid: '1001' };
console.log(value.pmid); 

function cleanText(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error('Value must be a string');
  }

  return value.trim();
}
