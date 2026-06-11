import { useState, useEffect } from 'react';
import { attendanceStore, getEmployees } from '../database/storage';
import { calculateEmployeeAttendance } from '../logic/attendanceCalculator';
import { calculateSalary } from '../logic/salaryCalculator';
import { AlertTriangle, Loader, FileSpreadsheet, FileText } from 'lucide-react';
import { exportPayrollExcel } from '../export/excelExport';
import { exportPayrollPDF } from '../export/pdfExport';

export default function Payroll() {
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payrollData, setPayrollData] = useState([]);

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
        const employee = employees.find(emp => String(emp.id) === record.employeeId);
        if (!employee) {
          const fakeEmp = {
            id: record.employeeId,
            name: record.employeeName,
            monthlySalary: 0,
            shiftStartTime: '10:00 AM',
            graceTimeMinutes: 10,
            halfDayTime: '1:00 PM',
            lateFineEnabled: false,
            advance: 0
          };
          const attResult = calculateEmployeeAttendance(fakeEmp, record);
          const salary = calculateSalary(attResult, fakeEmp);
          return { employee: fakeEmp, attendance: attResult, salary };
        }
        const attResult = calculateEmployeeAttendance(employee, record);
        const salary = calculateSalary(attResult, employee);
        return { employee, attendance: attResult, salary };
      });
      setPayrollData(results);
    } else {
      setPayrollData([]);
    }
  }, [employees, attendanceData]);

  const total = payrollData.reduce((acc, row) => ({
    gross: acc.gross + row.salary.grossSalary,
    net: acc.net + row.salary.netSalary,
    fine: acc.fine + row.attendance.totalFine,
    advance: acc.advance + row.salary.advance
  }), { gross: 0, net: 0, fine: 0, advance: 0 });

  const handleExportExcel = () => {
    const month = attendanceData?.month;
    const year = attendanceData?.year;
    const fileName = `Payroll_${new Date(2000, (month||1)-1).toLocaleString('default', { month: 'long' })}_${year||''}.xlsx`;
    exportPayrollExcel(payrollData, month, year, fileName);
  };

  const handleExportPDF = () => {
    const month = attendanceData?.month;
    const year = attendanceData?.year;
    exportPayrollPDF(payrollData, month, year);
  };

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
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Payroll Report</h1>
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Report</h1>
          {attendanceData && (
            <p className="text-sm text-gray-500 mt-1">
              {attendanceData.fileName} –{' '}
              {attendanceData.month && new Date(2000, attendanceData.month-1).toLocaleString('default', { month: 'long' })} {attendanceData.year}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportExcel}
            disabled={payrollData.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
          >
            <FileSpreadsheet size={16} />
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            disabled={payrollData.length === 0}
            className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {payrollData.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <>
          <div className="overflow-x-auto border border-gray-200 rounded-xl bg-white mb-6">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Employee</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Present</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Half Day</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Absent</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Leave</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Sick Leave</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Late Fine</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Advance</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Gross Salary</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payrollData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {row.employee.name || row.attendance.employeeName}
                      <span className="text-xs text-gray-500 ml-2">({row.employee.id})</span>
                    </td>
                    <td className="px-4 py-3 text-center text-green-600">{row.attendance.presentDays}</td>
                    <td className="px-4 py-3 text-center text-orange-500">{row.attendance.halfDays}</td>
                    <td className="px-4 py-3 text-center text-red-500">{row.attendance.absentDays}</td>
                    <td className="px-4 py-3 text-center text-blue-500">{row.attendance.paidLeaveDays}</td>
                    <td className="px-4 py-3 text-center text-purple-500">{row.attendance.sickLeaveDays}</td>
                    <td className="px-4 py-3 text-center text-red-600">₹{row.attendance.totalFine}</td>
                    <td className="px-4 py-3 text-center">₹{row.salary.advance}</td>
                    <td className="px-4 py-3 text-center font-medium">₹{row.salary.grossSalary.toFixed(0)}</td>
                    <td className="px-4 py-3 text-center font-bold text-primary-700">₹{row.salary.netSalary.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Gross Salary</p>
              <p className="text-xl font-bold text-gray-800">₹{total.gross.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Net Salary</p>
              <p className="text-xl font-bold text-primary-700">₹{total.net.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Late Fine</p>
              <p className="text-xl font-bold text-red-600">₹{total.fine.toFixed(0)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <p className="text-sm text-gray-500">Total Advance</p>
              <p className="text-xl font-bold text-amber-600">₹{total.advance.toFixed(0)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}