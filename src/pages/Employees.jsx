import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import EmployeeTable from '../components/EmployeeTable';
import { getEmployees, saveEmployee, deleteEmployee } from '../database/storage';
import {
  DEFAULT_SHIFT_START,
  DEFAULT_GRACE_MINUTES,
  DEFAULT_HALF_DAY_TIME,
  DEFAULT_LATE_FINE_ENABLED
} from '../utils/constants';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const emptyForm = {
    name: '',
    department: '',
    monthlySalary: '',
    shiftStartTime: DEFAULT_SHIFT_START,
    graceTimeMinutes: DEFAULT_GRACE_MINUTES,
    halfDayTime: DEFAULT_HALF_DAY_TIME,
    lateFineEnabled: DEFAULT_LATE_FINE_ENABLED,
    advance: ''
  };

  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    const list = await getEmployees();
    setEmployees(list);
  };

  const openAddModal = () => {
    setEditingEmployee(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  };

  const openEditModal = (employee) => {
    setEditingEmployee(employee);
    setForm({
      name: employee.name || '',
      department: employee.department || '',
      monthlySalary: employee.monthlySalary || '',
      shiftStartTime: employee.shiftStartTime || DEFAULT_SHIFT_START,
      graceTimeMinutes: employee.graceTimeMinutes ?? DEFAULT_GRACE_MINUTES,
      halfDayTime: employee.halfDayTime || DEFAULT_HALF_DAY_TIME,
      lateFineEnabled: employee.lateFineEnabled ?? DEFAULT_LATE_FINE_ENABLED,
      advance: employee.advance ?? ''
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.monthlySalary) {
      alert('Name and Monthly Salary are required');
      return;
    }
    const employeeData = {
      ...form,
      monthlySalary: parseFloat(form.monthlySalary),
      graceTimeMinutes: parseInt(form.graceTimeMinutes, 10),
      advance: parseFloat(form.advance) || 0
    };
    if (editingEmployee) {
      employeeData.id = editingEmployee.id;
    }
    await saveEmployee(employeeData);
    setModalOpen(false);
    await loadEmployees();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee?')) {
      await deleteEmployee(id);
      await loadEmployees();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Management</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      <EmployeeTable
        employees={employees}
        onEdit={openEditModal}
        onDelete={handleDelete}
      />

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">
                {editingEmployee ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Salary (₹) *</label>
                <input
                  type="number"
                  name="monthlySalary"
                  value={form.monthlySalary}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift Start Time</label>
                  <input
                    type="text"
                    name="shiftStartTime"
                    value={form.shiftStartTime}
                    onChange={handleChange}
                    placeholder="10:00 AM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Half Day Time</label>
                  <input
                    type="text"
                    name="halfDayTime"
                    value={form.halfDayTime}
                    onChange={handleChange}
                    placeholder="1:00 PM"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grace Time (minutes)</label>
                  <input
                    type="number"
                    name="graceTimeMinutes"
                    value={form.graceTimeMinutes}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <input
                    type="checkbox"
                    name="lateFineEnabled"
                    checked={form.lateFineEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300 mr-2"
                  />
                  <label className="text-sm text-gray-700">Late Fine Enabled</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advance Deduction (₹)</label>
                <input
                  type="number"
                  name="advance"
                  value={form.advance}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">Amount to deduct from this month’s salary (set to 0 when paid).</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}