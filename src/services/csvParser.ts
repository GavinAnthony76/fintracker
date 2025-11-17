/**
 * CSV & Excel Parser utility for importing financial data
 * Now supports flexible format detection with intelligent column mapping
 */
import * as XLSX from 'xlsx';
import { detectColumns, mapRow, DetectedColumns, type ColumnType } from './columnMapper';

export interface ParsedRow {
  [key: string]: string;
}

export interface ParsedCSVData {
  headers: string[];
  rows: ParsedRow[];
  rawData: string[][];
  format: 'simple' | 'financial-statement' | 'bank-statement' | 'unknown';
  detectedColumns?: DetectedColumns;
  columnMappingConfidence?: number;
}

export interface FinancialStatementItem {
  name: string;
  type: 'income' | 'expense';
  monthlyValues: Record<string, number>;
  total: number;
}

/**
 * Parse CSV content into structured data with intelligent format detection
 */
export function parseCSV(content: string): ParsedCSVData {
  const lines = content.trim().split('\n');
  if (lines.length === 0) {
    throw new Error('Empty CSV file');
  }

  // Parse the CSV structure first
  const csvLines = lines.map(line => parseCSVLine(line));
  if (csvLines.length === 0) {
    throw new Error('No valid data rows found');
  }

  const headers = csvLines[0].map(h => h.trim());

  // Use intelligent column detection
  const detectedColumns = detectColumns(headers);

  // Parse based on detected format
  if (detectedColumns.detectedFormat === 'financial-statement') {
    return parseFinancialStatementCSV(lines);
  }

  if (detectedColumns.detectedFormat === 'bank-statement') {
    return parseBankStatementCSV(csvLines, headers, detectedColumns);
  }

  // Parse as flexible format using detected column mapping
  return parseFlexibleCSV(csvLines, headers, detectedColumns);
}

/**
 * Parse CSV with flexible column mapping (works for simple and bank statement formats)
 */
function parseFlexibleCSV(
  csvLines: string[][],
  headers: string[],
  detectedColumns: DetectedColumns
): ParsedCSVData {
  const rows: ParsedRow[] = [];
  const rawData: string[][] = [headers];

  // Parse data rows using the detected column mapping
  for (let i = 1; i < csvLines.length; i++) {
    const rawRow = csvLines[i];
    if (!rawRow || rawRow.every(cell => !cell)) continue; // Skip empty rows

    // Map raw row to normalized field names
    const mappedRow = mapRow(rawRow, detectedColumns.mapping, headers);

    // Skip rows with no meaningful data
    if (!Object.values(mappedRow).some(v => v && v.trim())) continue;

    rows.push(mappedRow);
    rawData.push(rawRow);
  }

  const parsedHeaders = rows.length > 0 ? Object.keys(rows[0]) : headers;

  return {
    headers: parsedHeaders,
    rows,
    rawData,
    format: detectedColumns.detectedFormat === 'bank-statement' ? 'bank-statement' : 'simple',
    detectedColumns,
    columnMappingConfidence: detectedColumns.confidence,
  };
}

/**
 * Parse bank statement format (Date, Description, Amount/Debit/Credit)
 */
function parseBankStatementCSV(
  csvLines: string[][],
  headers: string[],
  detectedColumns: DetectedColumns
): ParsedCSVData {
  const rows: ParsedRow[] = [];
  const rawData: string[][] = [headers];

  // Parse data rows
  for (let i = 1; i < csvLines.length; i++) {
    const rawRow = csvLines[i];
    if (!rawRow || rawRow.every(cell => !cell)) continue; // Skip empty rows

    // Map to standardized fields
    const mappedRow = mapRow(rawRow, detectedColumns.mapping, headers);

    // Calculate actual amount if we have debit/credit
    if (mappedRow['Debit'] || mappedRow['Credit']) {
      const debit = parseFloat(mappedRow['Debit'] || '0');
      const credit = parseFloat(mappedRow['Credit'] || '0');

      if (debit > 0) {
        mappedRow['Type'] = 'Expense';
        mappedRow['Amount'] = String(debit);
      } else if (credit > 0) {
        mappedRow['Type'] = 'Income';
        mappedRow['Amount'] = String(credit);
      }
    }

    // Set default values if missing
    if (!mappedRow['Type']) mappedRow['Type'] = 'Expense';
    if (!mappedRow['Frequency']) mappedRow['Frequency'] = 'one-time';
    if (!mappedRow['Category']) mappedRow['Category'] = 'Other';
    if (!mappedRow['Name']) mappedRow['Name'] = 'Transaction';

    rows.push(mappedRow);
    rawData.push(rawRow);
  }

  return {
    headers: ['Type', 'Date', 'Name', 'Amount', 'Frequency', 'Category'],
    rows,
    rawData,
    format: 'bank-statement',
    detectedColumns,
    columnMappingConfidence: detectedColumns.confidence,
  };
}

/**
 * Parse financial statement CSV format (Account Name with monthly columns)
 */
function parseFinancialStatementCSV(lines: string[]): ParsedCSVData {
  const headers = parseCSVLine(lines[0]).map((h) => h.trim());

  // Find total column
  const totalColumnIndex = headers.findIndex((h) => h.toLowerCase() === 'total');

  const rows: ParsedRow[] = [];
  const rawData: string[][] = [headers];

  let currentType: 'income' | 'expense' | null = null;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const accountName = values[0]?.trim() || '';

    // Skip rows with empty first value (separators)
    if (!accountName) continue;

    // Detect section headers (trimmed to remove indentation)
    const trimmedName = accountName.trim();
    if (/^income$/i.test(trimmedName)) {
      currentType = 'income';
      continue;
    }
    if (/^expense$/i.test(trimmedName)) {
      currentType = 'expense';
      continue;
    }

    // Skip subtotal/total rows and summary rows
    if (
      /^total\s|^noi|^net operating|^operating income|^operating expense/i.test(trimmedName)
    ) {
      continue;
    }

    // Skip rows without a type
    if (!currentType) continue;

    // Get amount and clean it (remove commas, parentheses for negative values)
    const rawAmount = values[totalColumnIndex] || '';
    const cleanAmount = rawAmount.replace(/[,$()]/g, '');

    // Only add rows with valid numeric amounts
    if (!cleanAmount || isNaN(parseFloat(cleanAmount))) {
      continue;
    }

    // Create row with consistent format
    const row: ParsedRow = {
      Type: currentType === 'income' ? 'Income' : 'Expense',
      Name: trimmedName,
      Amount: cleanAmount,
      Frequency: 'monthly',
      Category: 'Other',
      Status: 'Active',
    };

    rows.push(row);
    rawData.push(values);
  }

  return {
    headers: ['Type', 'Name', 'Amount', 'Frequency', 'Category', 'Status'],
    rows,
    rawData,
    format: 'financial-statement',
  };
}

/**
 * Parse a single CSV line accounting for quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
}

/**
 * Detect the data type of a CSV file (income/expense or asset/liability)
 * More flexible - accepts various column naming conventions
 */
export function detectCSVType(headers: string[]): 'income-expense' | 'asset-liability' | 'unknown' {
  const headerLower = headers.join(',').toLowerCase();
  const normalizedHeaders = headers.map(h => h.toLowerCase().replace(/[_\-\s]/g, ''));

  // Income/Expense format: needs at least Type/Name and Amount
  const hasNameCol = normalizedHeaders.some(h =>
    h.includes('type') || h.includes('name') || h.includes('description')
  );
  const hasAmountCol = normalizedHeaders.some(h =>
    h.includes('amount') || h.includes('value') || h.includes('total')
  );

  if (hasNameCol && hasAmountCol) {
    // Check if it has frequency or debit/credit columns (income/expense data)
    const hasFrequency = normalizedHeaders.some(h => h.includes('frequency'));
    const hasDebitCredit = normalizedHeaders.some(h => h.includes('debit') || h.includes('credit'));
    const hasDate = normalizedHeaders.some(h => h.includes('date'));

    if (hasFrequency || hasDebitCredit || hasDate) {
      return 'income-expense';
    }
  }

  // Asset/Liability format: has balance, currentvalue, or valuationdate
  const hasAssetLiabilityMarkers = normalizedHeaders.some(h =>
    h.includes('balance') || h.includes('currentvalue') || h.includes('valuationdate') ||
    h.includes('interestrate') || h.includes('monthlypayment')
  );

  if (hasAssetLiabilityMarkers) {
    return 'asset-liability';
  }

  // If we can detect basic amount data, assume it's income-expense
  if (hasAmountCol) {
    return 'income-expense';
  }

  return 'unknown';
}

/**
 * Validate a row of income/expense data - More forgiving with suggestions
 */
export function validateIncomeExpenseRow(row: ParsedRow): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Type validation - normalize various inputs
  const typeValue = row['Type']?.trim().toLowerCase() || '';
  const validTypes = ['income', 'expense'];
  if (!typeValue) {
    errors.push('Type is required (must be "Income" or "Expense")');
  } else if (!validTypes.some(t => typeValue.includes(t))) {
    // Try to infer from other fields
    if (row['Debit'] && parseFloat(row['Debit']) > 0) {
      // This is expense data in debit/credit format - acceptable
    } else if (row['Credit'] && parseFloat(row['Credit']) > 0) {
      // This is income data in debit/credit format - acceptable
    } else {
      errors.push(`Type must be "Income" or "Expense" (got: "${row['Type']}")`);
    }
  }

  // Name is required
  if (!row['Name'] || row['Name'].trim() === '') {
    errors.push('Description/Name is required');
  }

  // Amount validation - be flexible with format
  let amountValue = 0;
  if (row['Amount']) {
    const cleaned = row['Amount'].toString().replace(/[$,()]/g, '');
    amountValue = parseFloat(cleaned);
    if (isNaN(amountValue)) {
      errors.push(`Amount must be a valid number (got: "${row['Amount']}")`);
    } else if (amountValue < 0) {
      errors.push('Amount must be positive');
    }
  } else if (row['Debit'] || row['Credit']) {
    // Debit/credit format is OK
    const debit = parseFloat(row['Debit'] || '0');
    const credit = parseFloat(row['Credit'] || '0');
    if (isNaN(debit) && isNaN(credit)) {
      errors.push('Debit or Credit amount must be a valid number');
    }
  } else {
    errors.push('Amount (or Debit/Credit) is required');
  }

  // Frequency validation - be more lenient, default to 'one-time' if missing
  const validFrequencies = [
    'daily', 'weekly', 'bi-weekly', 'semi-monthly',
    'monthly', 'quarterly', 'annually', 'one-time',
    'recurring', 'not specified'
  ];
  const frequencyValue = row['Frequency']?.trim().toLowerCase() || '';
  if (frequencyValue && !validFrequencies.some(f => frequencyValue.includes(f))) {
    // Only warn, don't fail - defaults to 'one-time'
  }

  // Optional: Date validation
  if (row['Date'] && !isValidDateString(row['Date'])) {
    errors.push(`Date format not recognized (got: "${row['Date']}")`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Simple date validation helper
 */
function isValidDateString(dateStr: string): boolean {
  if (!dateStr) return true;
  // Check common date patterns
  const patterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY
    /^\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
  ];
  return patterns.some(pattern => pattern.test(dateStr.trim()));
}

/**
 * Parse Excel file (.xlsx) into structured data
 */
export async function parseExcel(file: File): Promise<ParsedCSVData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer;
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }

        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown as string[][];

        if (rows.length === 0) {
          reject(new Error('Empty Excel sheet'));
          return;
        }

        // First row is headers
        const headers = (rows[0] as string[]).map((h) => String(h).trim());

        // Use intelligent column detection
        const detectedColumns = detectColumns(headers);

        if (detectedColumns.detectedFormat === 'financial-statement') {
          // Convert Excel rows to CSV-like format and parse
          const csvLines = rows.map((row) => (row as string[]).map((v) => String(v || '')).join(','));
          return resolve(parseFinancialStatementCSV(csvLines));
        }

        // Parse with flexible column mapping
        const csvLines = (rows as string[][]).map((row) =>
          row.map((v) => String(v || ''))
        );
        return resolve(parseFlexibleCSV(csvLines, headers, detectedColumns));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Failed to parse Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
