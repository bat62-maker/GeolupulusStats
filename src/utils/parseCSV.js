/**
 * Parsea un CSV a un array de objetos con cabeceras normalizadas a minúsculas.
 */
export const parseCSV = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];
  const regex = /,(?=(?:(?:[^"]*"){2})*[^"]*$)/;
  const headers = lines[0].split(regex).map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
  return lines.slice(1).map(line => {
    const values = line.split(regex).map(v => v.replace(/^"|"$/g, '').trim());
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });
};
