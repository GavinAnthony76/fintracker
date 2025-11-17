/**
 * Intelligent Column Mapper for flexible file import
 * Detects and maps columns from various financial data formats
 */

export type ColumnType =
  | 'type' | 'date' | 'description' | 'amount' | 'debit' | 'credit'
  | 'category' | 'account' | 'frequency' | 'name' | 'balance' | 'total' | 'ignore';

export interface ColumnMapping {
  [columnIndex: number]: ColumnType;
}

export interface DetectedColumns {
  mapping: ColumnMapping;
  confidence: number; // 0-100, how confident is the detection
  detectedFormat: 'bank-statement' | 'financial-statement' | 'simple' | 'unknown';
  suggestions: { [columnIndex: number]: ColumnType[] }; // Alternative column type suggestions
}

/**
 * Common column name variations for each type
 */
const COLUMN_ALIASES: Record<ColumnType, string[]> = {
  'type': ['type', 'txtype', 'transaction type', 'kind', 'category type'],
  'date': ['date', 'transaction date', 'posting date', 'date posted', 'trans date', 'date of transaction'],
  'description': ['description', 'memo', 'detail', 'transaction description', 'note', 'narrative', 'details', 'name'],
  'amount': ['amount', 'amt', 'transaction amount', 'value', 'total', 'sum'],
  'debit': ['debit', 'debit amount', 'withdrawal', 'debit amt', 'expenses', 'out'],
  'credit': ['credit', 'credit amount', 'deposit', 'credit amt', 'income', 'in'],
  'category': ['category', 'cat', 'expense category', 'income category', 'type'],
  'account': ['account', 'account name', 'account #', 'account number', 'acct'],
  'frequency': ['frequency', 'freq', 'recurring', 'period', 'cadence'],
  'name': ['name', 'account name', 'item name', 'description', 'title'],
  'balance': ['balance', 'running balance', 'balance after', 'account balance', 'bal'],
  'total': ['total', 'subtotal', 'sum', 'amount total'],
  'ignore': [],
};

/**
 * Intelligently detect column types from headers
 */
export function detectColumns(headers: string[]): DetectedColumns {
  const mapping: ColumnMapping = {};
  const suggestions: { [key: number]: ColumnType[] } = {};
  let totalConfidence = 0;

  headers.forEach((header, index) => {
    const detected = detectColumnType(header, index, headers);
    mapping[index] = detected.type;
    suggestions[index] = detected.suggestions;
    totalConfidence += detected.confidence;
  });

  const averageConfidence = Math.round((totalConfidence / headers.length) * 100);
  const format = detectFileFormat(mapping, headers);

  return {
    mapping,
    confidence: averageConfidence,
    detectedFormat: format,
    suggestions,
  };
}

/**
 * Detect a single column's type
 */
function detectColumnType(
  header: string,
  columnIndex: number,
  allHeaders: string[]
): { type: ColumnType; confidence: number; suggestions: ColumnType[] } {
  const normalized = normalizeHeader(header);
  const suggestions: ColumnType[] = [];
  let bestMatch: ColumnType = 'ignore';
  let bestScore = 0;

  // Score each possible column type
  for (const [columnType, aliases] of Object.entries(COLUMN_ALIASES)) {
    const cType = columnType as ColumnType;

    // Exact match
    if (aliases.some(alias => normalized === alias)) {
      return { type: cType, confidence: 100, suggestions: [cType] };
    }

    // Partial matches (word matches)
    const matchScore = aliases.reduce((score, alias) => {
      if (alias === normalized) return score + 100;
      if (normalized.includes(alias)) return score + 80;
      if (alias.includes(normalized)) return score + 60;
      if (isSimilar(normalized, alias)) return score + 40;
      return score;
    }, 0);

    if (matchScore > 0) {
      suggestions.push(cType);
      if (matchScore > bestScore) {
        bestScore = matchScore;
        bestMatch = cType;
      }
    }
  }

  const confidence = Math.min(bestScore, 100);

  // Return top 3 suggestions
  const topSuggestions = suggestions
    .sort((a, b) => scoreSuggestion(normalized, b) - scoreSuggestion(normalized, a))
    .slice(0, 3);

  return {
    type: bestMatch,
    confidence,
    suggestions: topSuggestions.length > 0 ? topSuggestions : [bestMatch],
  };
}

/**
 * Normalize header text for comparison
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .trim()
    .replace(/[\s_\-/\\]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Check if two strings are similar (simple edit distance)
 */
function isSimilar(str1: string, str2: string, threshold = 0.7): boolean {
  if (!str1 || !str2) return false;

  // Check if one contains the other
  if (str1.includes(str2) || str2.includes(str1)) return true;

  // Simple similarity check
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  const maxDistance = Math.ceil(longer.length * (1 - threshold));

  let commonChars = 0;
  for (let i = 0; i < shorter.length; i++) {
    if (longer.includes(shorter[i])) commonChars++;
  }

  return commonChars / longer.length >= threshold;
}

/**
 * Score a column type suggestion for a normalized header
 */
function scoreSuggestion(normalized: string, columnType: ColumnType): number {
  const aliases = COLUMN_ALIASES[columnType];

  return Math.max(
    ...aliases.map(alias => {
      if (normalized === alias) return 100;
      if (normalized.includes(alias)) return 80;
      if (alias.includes(normalized)) return 60;
      if (isSimilar(normalized, alias)) return 40;
      return 0;
    })
  );
}

/**
 * Detect the overall file format based on detected columns
 */
function detectFileFormat(
  mapping: ColumnMapping,
  headers: string[]
): 'bank-statement' | 'financial-statement' | 'simple' | 'unknown' {

  const types = Object.values(mapping);
  const headerText = headers.join(' ').toLowerCase();

  // Bank statement: has date, description, amount (and possibly debit/credit)
  const hasDate = types.includes('date');
  const hasDescription = types.includes('description');
  const hasAmount = types.includes('amount') || types.includes('debit') || types.includes('credit');

  if (hasDate && hasDescription && hasAmount) {
    return 'bank-statement';
  }

  // Financial statement: has month columns and totals
  if (headerText.includes('jan') || headerText.includes('jan 2') ||
      headerText.includes('total') && types.includes('total')) {
    return 'financial-statement';
  }

  // Simple format: has type, name, amount, frequency
  const hasType = types.includes('type') || types.includes('category');
  const hasName = types.includes('name') || types.includes('description');
  const hasFrequency = types.includes('frequency');

  if ((hasType || hasName) && hasAmount) {
    return 'simple';
  }

  return 'unknown';
}

/**
 * Convert detected columns into normalized row data
 */
export function mapRow(
  rawRow: string[],
  mapping: ColumnMapping,
  headers: string[]
): Record<string, string> {
  const mappedRow: Record<string, string> = {};

  Object.entries(mapping).forEach(([indexStr, columnType]) => {
    const index = parseInt(indexStr, 10);
    const value = rawRow[index] || '';

    // Map to standardized field names
    switch (columnType) {
      case 'type':
        mappedRow['Type'] = value;
        break;
      case 'date':
        mappedRow['Date'] = value;
        break;
      case 'description':
      case 'name':
        mappedRow['Name'] = value || mappedRow['Name'] || '';
        break;
      case 'amount':
        mappedRow['Amount'] = value;
        break;
      case 'debit':
        mappedRow['Debit'] = value;
        break;
      case 'credit':
        mappedRow['Credit'] = value;
        break;
      case 'category':
        mappedRow['Category'] = value;
        break;
      case 'account':
        mappedRow['Account'] = value;
        break;
      case 'frequency':
        mappedRow['Frequency'] = value;
        break;
      case 'balance':
        mappedRow['Balance'] = value;
        break;
      case 'total':
        mappedRow['Total'] = value;
        break;
      case 'ignore':
        // Skip this column
        break;
    }
  });

  return mappedRow;
}

/**
 * Validate a bank statement row (has date, description, amount)
 */
export function validateBankStatementRow(row: Record<string, string>): {
  valid: boolean;
  errors: string[];
  inferredType?: 'income' | 'expense';
} {
  const errors: string[] = [];
  let inferredType: 'income' | 'expense' | undefined;

  // Date validation
  if (!row['Date']) {
    errors.push('Date is required');
  } else if (!isValidDate(row['Date'])) {
    errors.push('Date must be in a valid format (YYYY-MM-DD, MM/DD/YYYY, or similar)');
  }

  // Description/Name validation
  if (!row['Name'] || row['Name'].trim() === '') {
    errors.push('Description is required');
  }

  // Amount validation - handle debit/credit or single amount
  if (row['Debit'] || row['Credit']) {
    const debit = parseFloat(row['Debit'] || '0');
    const credit = parseFloat(row['Credit'] || '0');

    if (isNaN(debit) && isNaN(credit)) {
      errors.push('Debit or Credit must be a valid number');
    }

    if (debit > 0) inferredType = 'expense';
    if (credit > 0) inferredType = 'income';
  } else if (row['Amount']) {
    const amount = parseFloat(row['Amount']);
    if (isNaN(amount)) {
      errors.push('Amount must be a valid number');
    }
    // Amount alone is ambiguous, would need to be classified separately
  } else {
    errors.push('Amount, Debit, or Credit is required');
  }

  return {
    valid: errors.length === 0,
    errors,
    inferredType,
  };
}

/**
 * Simple date validation - checks if string looks like a date
 */
function isValidDate(dateStr: string): boolean {
  if (!dateStr) return false;

  // Try parsing common date formats
  const patterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{1,2}\/\d{1,2}\/\d{2,4}/, // MM/DD/YYYY or M/D/YY
    /^\d{1,2}-\d{1,2}-\d{2,4}/, // MM-DD-YYYY or M-D-YY
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i, // Month names
  ];

  return patterns.some(pattern => pattern.test(dateStr.trim()));
}

/**
 * Create a column mapping template for known formats
 */
export function createMappingTemplate(format: string): ColumnMapping {
  const templates: Record<string, ColumnMapping> = {
    'bank-statement': {
      0: 'date',
      1: 'description',
      2: 'debit',
      3: 'credit',
      4: 'balance',
    },
    'financial-statement': {
      0: 'name',
      // Monthly columns would be 1-12
      13: 'total',
    },
    'simple': {
      0: 'type',
      1: 'name',
      2: 'amount',
      3: 'frequency',
      4: 'category',
    },
  };

  return templates[format] || {};
}
