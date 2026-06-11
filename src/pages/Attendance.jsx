import { useState, useEffect } from 'react';
import { attendanceStore, getEmployees } from '../database/storage';
import { calculateEmployeeAttendance } from '../logic/attendanceCalculator';
import { AlertTriangle, Loader } from 'lucide-react';

export default function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calculated, setCalculated] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const empList = await getEmployees();
      const attData = await attendanceStore.getItem('currentAttendance');
      setEmployees(empList);
      setAttendanceData(attData);
      if (!attData) {
        setError('No attendance data uploaded. Please upload an Excel file first.');
      } else {
        setError('');
      }
    } catch (err) {
      setError('Failed to load data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length && attendanceData?.records) {
      const results = attendanceData.records.map(record => {
        // Find matching employee by ID
        const employee = employees.find(emp => String(emp.id) === record.employeeId);
        if (!employee) {
          // Return raw record with a warning, but still try to show data
          return {
            employeeId: record.employeeId,
            employeeName: record.employeeName,
            error: 'Employee not found in database. Using default settings.',
            totalWorkingDays: 0,
            presentDays: 0,
            halfDays: 0,
            absentDays: 0,
            paidLeaveDays: 0,
            sickLeaveDays: 0,
            totalFine: 0,
            dailyBreakdown: record.dates.map(d => ({ ...d, effectiveStatus: d.status, fine: 0 }))
          };
        }
        return calculateEmployeeAttendance(employee, record);
      });
      setCalculated(results);
    } else {
      setCalculated([]);
    }
  }, [employees, attendanceData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error && !attendanceData) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Attendance Overview</h1>
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 mt-0.5" size={22} />
          <div>
            <p className="text-yellow-800 font-medium">No Attendance Data</p>
            <p className="text-yellow-700 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Attendance Overview</h1>
      {attendanceData && (
        <p className="text-sm text-gray-500 mb-6">
          Based on file: <span className="font-medium">{attendanceData.fileName}</span> –{' '}
          {attendanceData.month && new Date(2000, attendanceData.month-1).toLocaleString('default', { month: 'long' })} {attendanceData.year}
        </p>
      )}

      {calculated.length === 0 && !error && (
        <p className="text-gray-500">No attendance records available.</p>
      )}

      {calculated.map(empResult => (
        <div key={empResult.employeeId} className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">
                {empResult.employeeName} <span className="text-xs font-mono text-gray-500 ml-2">ID: {empResult.employeeId}</span>
              </h3>
              {empResult.error && <p className="text-xs text-red-500 mt-1">{empResult.error}</p>}
            </div>
            <div className="text-sm text-gray-600 space-x-4">
              <span>Present: <b className="text-green-600">{empResult.presentDays}</b></span>
              <span>Half‑Day: <b className="text-orange-500">{empResult.halfDays}</b></span>
              <span>Absent: <b className="text-red-500">{empResult.absentDays}</b></span>
              <span>Leave: <b className="text-blue-500">{empResult.paidLeaveDays}</b></span>
              <span>Sick: <b className="text-purple-500">{empResult.sickLeaveDays}</b></span>
              <span>Fine: <b className="text-red-600">₹{empResult.totalFine.toFixed(0)}</b></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">IN Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">OUT Time</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Late Fine</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {empResult.dailyBreakdown.map((day, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{day.dateStr}</td>
                    <td className="px-4 py-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        day.effectiveStatus === 'Present' ? 'bg-green-100 text-green-800' :
                        day.effectiveStatus === 'HalfDay' ? 'bg-orange-100 text-orange-800' :
                        day.effectiveStatus === 'Absent' ? 'bg-red-100 text-red-800' :
                        day.effectiveStatus === 'Leave' ? 'bg-blue-100 text-blue-800' :
                        day.effectiveStatus === 'SickLeave' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {day.effectiveStatus}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {day.inMinutes !== null ? `${Math.floor(day.inMinutes/60)}:${String(day.inMinutes%60).padStart(2,'0')}` : '–'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {day.outMinutes !== null ? `${Math.floor(day.outMinutes/60)}:${String(day.outMinutes%60).padStart(2,'0')}` : '–'}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">
                      {day.fine > 0 ? `₹${day.fine}` : '–'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}