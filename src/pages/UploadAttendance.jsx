import { useState, useEffect } from 'react';
import UploadBox from '../components/UploadBox';
import { parseAttendanceExcel } from '../logic/excelParser';
import { attendanceStore, getEmployees } from '../database/storage';
import { CheckCircle, AlertTriangle, Save } from 'lucide-react';

export default function UploadAttendance() {
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setParsedData(null);
    setError('');
    setSaved(false);
    if (!selectedFile) return;

    // Automatically parse
    (async () => {
      setParsing(true);
      try {
        const data = await parseAttendanceExcel(selectedFile);
        setParsedData(data);
      } catch (err) {
        setError(err.message);
        setParsedData(null);
      } finally {
        setParsing(false);
      }
    })();
  };

  const handleSaveAttendance = async () => {
    if (!parsedData || parsedData.records.length === 0) return;
    setSaving(true);
    try {
      // Check if employees from DB match parsed employee IDs
      const dbEmployees = await getEmployees();
      const unmatched = parsedData.records.filter(
        rec => !dbEmployees.find(e => String(e.id) === rec.employeeId)
      );
      if (unmatched.length > 0) {
        const names = unmatched.map(r => `${r.employeeName} (ID: ${r.employeeId})`).join(', ');
        if (!window.confirm(`These employees from Excel are not in your database:\n${names}\n\nDo you want to continue saving anyway?`)) {
          setSaving(false);
          return;
        }
      }

      // Save attendance data to IndexedDB, overwriting previous
      await attendanceStore.setItem('currentAttendance', {
        uploadedAt: new Date().toISOString(),
        fileName: file.name,
        month: parsedData.month,
        year: parsedData.year,
        records: parsedData.records
      });
      setSaved(true);
    } catch (err) {
      alert('Failed to save attendance: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Upload Attendance Excel</h1>

      <UploadBox onFileSelect={handleFileSelect} />

      {/* Parsing state */}
      {parsing && (
        <div className="mt-6 text-center text-gray-600">
          <div className="animate-pulse">Parsing Excel file...</div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-0.5" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {parsedData && !error && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700">
                Parsed Attendance
                {parsedData.month && ` - ${new Date(2000, parsedData.month-1).toLocaleString('default', { month: 'long' })} ${parsedData.year}`}
              </h2>
              <p className="text-sm text-gray-500">
                {parsedData.records.length} employees, up to {parsedData.records[0]?.dates.length || 0} days
              </p>
            </div>
            <button
              onClick={handleSaveAttendance}
              disabled={saving || saved}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium text-sm transition ${
                saved
                  ? 'bg-green-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700'
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle size={18} />
                  Saved
                </>
              ) : saving ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} />
                  Save Attendance
                </>
              )}
            </button>
          </div>

          {/* Preview table - show first few employees */}
          <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Employee ID</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  {parsedData.records[0]?.dates.slice(0, 7).map((d, i) => (
                    <th key={i} className="px-2 py-2 text-center font-normal">
                      {d.dateStr}
                    </th>
                  ))}
                  {parsedData.records[0]?.dates.length > 7 && (
                    <th className="px-2 py-2 text-center text-gray-400">...</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {parsedData.records.slice(0, 5).map((rec) => (
                  <tr key={rec.employeeId}>
                    <td className="px-3 py-2 font-mono">{rec.employeeId}</td>
                    <td className="px-3 py-2">{rec.employeeName}</td>
                    {rec.dates.slice(0, 7).map((d, i) => (
                      <td key={i} className={`px-2 py-2 text-center ${
                        d.status === 'Present' ? 'text-green-700' :
                        d.status === 'Absent' ? 'text-red-500' :
                        'text-gray-500'
                      }`}>
                        {d.status === 'Present' ? '✓' : d.status}
                      </td>
                    ))}
                    {rec.dates.length > 7 && (
                      <td className="px-2 py-2 text-center text-gray-400">...</td>
                    )}
                  </tr>
                ))}
                {parsedData.records.length > 5 && (
                  <tr>
                    <td colSpan={2 + Math.min(7, parsedData.records[0]?.dates.length || 0)} className="px-3 py-2 text-center text-gray-400">
                      ... and {parsedData.records.length - 5} more employees
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}