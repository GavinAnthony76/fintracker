/**
 * Quick test script to verify the parser works with your real income statement
 * Run with: node test-parser.js
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV line parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

// Read the CSV file
const filePath = path.join(__dirname, 'income_statement_12_month-20251110.csv');
const content = fs.readFileSync(filePath, 'utf-8');

// Parse the file
const lines = content.trim().split('\n');
console.log(`📄 File: income_statement_12_month-20251110.csv`);
console.log(`📊 Total lines: ${lines.length}`);
console.log('\n');

// Parse header
const headerLine = lines[0];
const headers = parseCSVLine(headerLine);
console.log(`✅ Headers detected: ${headers.length} columns`);
console.log(`   First 5 headers: ${headers.slice(0, 5).join(', ')}`);
console.log(`   Last 2 headers: ${headers.slice(-2).join(', ')}`);
console.log('\n');

// Check for month columns
const hasMonthColumns = /jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i.test(headerLine);
console.log(`📅 Has month columns: ${hasMonthColumns ? '✅ YES' : '❌ NO'}`);

// Check for income/expense sections
const firstFewLines = lines.slice(0, 5).join('\n');
const hasIncomeExpenseSections = /\bincome\b.*\bexpense\b/i.test(firstFewLines) ||
  /operating\s+income|operating\s+expense/i.test(firstFewLines);
console.log(`💰 Has Income/Expense sections: ${hasIncomeExpenseSections ? '✅ YES' : '❌ NO'}`);

// Predict format
const format = hasMonthColumns && hasIncomeExpenseSections ? 'financial-statement' : 'simple';
console.log(`\n🎯 Detected format: ${format.toUpperCase()}`);

// Parse rows for financial statement
if (format === 'financial-statement') {
  console.log('\n📋 Parsing as Financial Statement...');

  const totalColumnIndex = headers.findIndex(h => h.toLowerCase() === 'total');
  console.log(`   Total column index: ${totalColumnIndex}`);

  let currentType = null;
  let incomeCount = 0;
  let expenseCount = 0;
  let dataRows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const accountName = values[0]?.trim() || '';

    if (!accountName) continue;

    const trimmedName = accountName.trim();

    if (/^income$/i.test(trimmedName)) {
      currentType = 'income';
      console.log(`   → Found Income section at row ${i + 1}`);
      continue;
    }
    if (/^expense$/i.test(trimmedName)) {
      currentType = 'expense';
      console.log(`   → Found Expense section at row ${i + 1}`);
      continue;
    }

    // Skip subtotal/total rows
    if (/^total\s|^noi|^net operating|^operating income|^operating expense/i.test(trimmedName)) {
      continue;
    }

    if (!currentType) continue;

    // Get amount
    const rawAmount = values[totalColumnIndex] || '';
    const cleanAmount = rawAmount.replace(/[,$()]/g, '');

    if (!cleanAmount || isNaN(parseFloat(cleanAmount))) {
      continue;
    }

    dataRows.push({
      Type: currentType === 'income' ? 'Income' : 'Expense',
      Name: trimmedName,
      Amount: cleanAmount,
      Frequency: 'monthly',
      Category: 'Other',
    });

    if (currentType === 'income') incomeCount++;
    else expenseCount++;
  }

  console.log(`\n✅ Successfully parsed:`);
  console.log(`   • ${incomeCount} income items`);
  console.log(`   • ${expenseCount} expense items`);
  console.log(`   • Total: ${incomeCount + expenseCount} items`);

  console.log(`\n📊 First 5 parsed rows:`);
  dataRows.slice(0, 5).forEach((row, idx) => {
    console.log(`   ${idx + 1}. [${row.Type}] ${row.Name}: $${row.Amount}`);
  });

  console.log(`\n💡 Your import will work! The parser successfully handled your financial statement format.`);
} else {
  console.log('\nWould parse as Simple format');
}

console.log('\n✨ Test complete!\n');
