import * as XLSX from 'xlsx';
import { timeStringToMinutes } from '../utils/timeHelper';

/**
 * Parse attendance Excel file
 * Expected columns: Employee ID, Employee Name, then date columns (dd-mmm-yyyy)
 * Each date cell contains:
 *   - Time range like "10:05 AM\n07:30 PM"
 *   - Or text: Holiday, Sunday, Leave, Sick Leave, etc.
 * Returns:
 *   {
 *     month: number,
 *     year: number,
 *     records: [ { employeeId, employeeName, dates: [ { dateStr, inMinutes, outMinutes, status, raw } ] } ]
 *   }
 */
export async function parseAttendanceExcel(file) {
  const buffer = await readFileAsArrayBuffer(file);
  const workbook = XLSX.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (jsonData.length < 2) {
    throw new Error('Excel sheet must have at least one header row and one data row.');
  }

  const headers = jsonData[0].map(h => String(h).trim());
  // Find column indices
  const empIdIdx = headers.findIndex(h => h.toLowerCase() === 'employee id' || h.toLowerCase() === 'empid');
  const empNameIdx = headers.findIndex(h => h.toLowerCase() === 'employee name' || h.toLowerCase() === 'name');
  if (empIdIdx === -1 || empNameIdx === -1) {
    throw new Error('Columns "Employee ID" and "Employee Name" are required.');
  }

  // Identify date columns (everything after the first two)
  const dateColumns = headers.slice(2).filter(h => h.length > 0);

  // Parse month/year from first date column (assuming format dd-mmm-yyyy)
  let month = null, year = null;
  if (dateColumns.length > 0) {
    const firstDate = parseDateHeader(dateColumns[0]);
    if (firstDate) {
      month = firstDate.getMonth() + 1;
      year = firstDate.getFullYear();
    }
  }

  const records = [];
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || !row[empIdIdx]) continue; // skip empty rows
    const employeeId = String(row[empIdIdx]).trim();
    const employeeName = String(row[empNameIdx]).trim();

    const dates = [];
    for (let j = 2; j < headers.length; j++) {
      const dateHeader = headers[j];
      if (!dateHeader) continue;
      const cellValue = row[j] !== undefined ? String(row[j]).trim() : '';
      const parsed = parseCellValue(cellValue);
      dates.push({
        dateStr: dateHeader,
        inMinutes: parsed.inMinutes,
        outMinutes: parsed.outMinutes,
        status: parsed.status,
        raw: cellValue
      });
    }

    records.push({ employeeId, employeeName, dates });
  }

  return { month, year, records };
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseDateHeader(header) {
  // Parse "1-Jun-2026" or "01-Jun-2026" etc.
  const parts = header.split('-');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const monthStr = parts[1];
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(year)) return null;
  const monthMap = { jan:0, feb:1, mar:2, apr:3, may:4, jun:5, jul:6, aug:7, sep:8, oct:9, nov:10, dec:11 };
  const month = monthMap[monthStr.toLowerCase()];
  if (month === undefined) return null;
  return new Date(year, month, day);
}

function parseCellValue(value) {
  if (!value) return { inMinutes: null, outMinutes: null, status: 'Absent' };

  const upper = value.toUpperCase();
  // Check for special keywords
  if (upper === 'HOLIDAY') return { status: 'Holiday' };
  if (upper === 'SUNDAY') return { status: 'Sunday' };
  if (upper === 'LEAVE') return { status: 'Leave' };
  if (upper === 'SICK LEAVE' || upper === 'SICKLEAVE') return { status: 'SickLeave' };
  if (upper === 'HALF DAY') return { status: 'HalfDay' };

  // Try to parse as time range: "10:05 AM\n07:30 PM" or "10:05 AM - 07:30 PM" or "10:05AM\n07:30PM"
  const lines = value.split(/\n|\r\n|\r/).map(s => s.trim()).filter(s => s.length > 0);
  if (lines.length >= 2) {
    const inTime = timeStringToMinutes(lines[0]);
    const outTime = timeStringToMinutes(lines[1]);
    if (inTime !== null && outTime !== null) {
      return { inMinutes: inTime, outMinutes: outTime, status: 'Present' };
    }
  }

  // Single line "10:05 AM" might be just in time? We treat as Present if only one time, but better require both.
  // If only one time, we can still treat as Present with no outTime? Not safe. We'll mark as Present only if two times.
  // If nothing else matches, assume Absent or error.
  // Try "10:05 AM - 07:30 PM" dash separated
  const dashParts = value.split('-').map(s => s.trim()).filter(s => s.length > 0);
  if (dashParts.length === 2) {
    const inTime = timeStringToMinutes(dashParts[0]);
    const outTime = timeStringToMinutes(dashParts[1]);
    if (inTime !== null && outTime !== null) {
      return { inMinutes: inTime, outMinutes: outTime, status: 'Present' };
    }
  }

  // If we reach here, treat as Absent (or maybe text we don't recognize)
  return { status: 'Absent', inMinutes: null, outMinutes: null };
}