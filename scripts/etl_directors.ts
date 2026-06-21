import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface Director {
  id: string;
  name: string;
  position: string;
  genre: string;
  specialty: string[];
  brands: string[];
  industry: string[];
  location: string;
  notes: string;
  urls: {
    website?: string;
    vimeo?: string;
    email?: string;
  };
  profile_text: string;
}

// Try new file first, fallback to old file
const NEW_XLSX_PATH = path.resolve(process.cwd(), 'Connective-Director-Database_FINAL_UPDATED-DEMOGRAPHICS_MERGED-RESTORED.xlsx');
const OLD_XLSM_PATH = path.resolve(process.cwd(), 'data', 'DIRECTOR DATABASE MASTER (2).xlsm');
const OUTPUT_PATH = path.resolve(process.cwd(), 'data', 'directors.json');

// Determine which file to use
function getExcelPath(): string {
  if (fs.existsSync(NEW_XLSX_PATH)) {
    console.log('Using new Excel file:', NEW_XLSX_PATH);
    return NEW_XLSX_PATH;
  } else if (fs.existsSync(OLD_XLSM_PATH)) {
    console.log('Using old Excel file:', OLD_XLSM_PATH);
    return OLD_XLSM_PATH;
  } else {
    throw new Error(`No Excel file found. Tried:\n- ${NEW_XLSX_PATH}\n- ${OLD_XLSM_PATH}`);
  }
}

function normalizeSpecialty(specialty: string): string[] {
  if (!specialty) return [];
  
  const normalized = specialty
    .toLowerCase()
    .trim()
    .replace(/mouvement/g, 'movement')
    .replace(/feel-good/g, 'feel good')
    .replace(/\s*\/\s*/g, ',')
    .replace(/\s+and\s+/g, ',');
  
  return normalized
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function splitByDelimiter(text: string): string[] {
  if (!text) return [];
  return text
    .split(/[,\/]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function isDividerRow(name: string): boolean {
  if (!name) return false;
  const trimmed = name.trim();
  return trimmed.length === 1 && /^[A-Z]$/i.test(trimmed);
}

function extractUrls(row: any, headers: string[]): { website?: string; vimeo?: string; email?: string } {
  const urls: { website?: string; vimeo?: string; email?: string } = {};
  
  ['WEBSITE', 'VIMEO', 'EMAIL'].forEach(field => {
    const idx = headers.indexOf(field);
    if (idx >= 0 && row[idx]) {
      const cell = row[idx];
      // Try to extract hyperlink from cell.l.Target
      const url = cell?.l?.Target || (typeof cell === 'string' ? cell : cell?.v || '');
      if (url) {
        urls[field.toLowerCase() as keyof typeof urls] = url;
      }
    }
  });
  
  return urls;
}

function main() {
  const XLSM_PATH = getExcelPath();
  console.log('Reading Excel file:', XLSM_PATH);
  
  const workbook = XLSX.readFile(XLSM_PATH, { cellStyles: true });
  
  // Find sheet named "DIRECTORS" or first sheet containing "DIRECTOR"
  let sheetName = workbook.SheetNames.find(name => name.toUpperCase() === 'DIRECTORS');
  if (!sheetName) {
    sheetName = workbook.SheetNames.find(name => name.toUpperCase().includes('DIRECTOR'));
  }
  if (!sheetName) {
    sheetName = workbook.SheetNames[0];
  }
  
  console.log(`Using sheet: ${sheetName}`);
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false }) as any[][];
  
  if (data.length === 0) {
    console.error('ERROR: Sheet is empty');
    process.exit(1);
  }
  
  // Get headers and find column indices
  const headers = data[0].map((h: any) => String(h).toUpperCase().trim());
  console.log('Headers found:', headers);
  
  const directors: Director[] = [];
  
  // Parse raw cells for hyperlinks
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    
    const nameIdx = headers.indexOf('NAME');
    if (nameIdx < 0 || !row[nameIdx]) continue;
    
    const name = String(row[nameIdx]).trim();
    
    // Skip divider rows
    if (isDividerRow(name)) continue;
    
    // Extract cell objects for hyperlinks
    const cellRow: any = {};
    for (let c = 0; c <= range.e.c; c++) {
      const cellAddress = XLSX.utils.encode_cell({ r: i, c });
      const cell = worksheet[cellAddress];
      cellRow[c] = cell;
    }
    
    const urls = extractUrls(cellRow, headers);
    
    const getField = (field: string): string => {
      const idx = headers.indexOf(field);
      return idx >= 0 && row[idx] ? String(row[idx]).trim() : '';
    };
    
    const position = getField('POSITION') || '';
    const genre = getField('GENRE') || '';
    const specialtyRaw = getField('SPECIALTY');
    const specialty = normalizeSpecialty(specialtyRaw);
    const brands = splitByDelimiter(getField('BRANDS'));
    const industry = splitByDelimiter(getField('INDUSTRY'));
    const location = getField('LOCATION') || '';
    const notes = getField('NOTES') || '';
    
    const profile_text = [
      name,
      position,
      genre,
      ...specialty,
      ...brands,
      ...industry,
      location,
      notes
    ].filter(Boolean).join(' ');
    
    directors.push({
      id: `dir_${i}`,
      name,
      position,
      genre,
      specialty,
      brands,
      industry,
      location,
      notes,
      urls,
      profile_text
    });
  }
  
  console.log(`Extracted ${directors.length} directors`);
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(directors, null, 2));
  console.log(`Saved to ${OUTPUT_PATH}`);
}

main();


