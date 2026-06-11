import { Pencil, Trash2 } from 'lucide-react';

export default function EmployeeTable({ employees, onEdit, onDelete }) {
  if (!employees || employees.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No employees added yet. Click "Add Employee" to create one.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Name</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Department</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Shift Start</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Grace</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Half Day</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Monthly Salary</th>
            <th className="px-4 py-3 text-left font-medium text-gray-600">Late Fine</th>
            <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {employees.map((emp) => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-mono text-xs">{emp.id}</td>
              <td className="px-4 py-3 font-medium">{emp.name}</td>
              <td className="px-4 py-3">{emp.department}</td>
              <td className="px-4 py-3">{emp.shiftStartTime}</td>
              <td className="px-4 py-3">{emp.graceTimeMinutes} min</td>
              <td className="px-4 py-3">{emp.halfDayTime}</td>
              <td className="px-4 py-3">₹{emp.monthlySalary?.toLocaleString()}</td>
              <td className="px-4 py-3">
                {emp.lateFineEnabled ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-gray-400">No</span>
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => onEdit(emp)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(emp.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}