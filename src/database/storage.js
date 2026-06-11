import localforage from 'localforage';

// Initialize stores
const employeesStore = localforage.createInstance({
  name: 'smartPayroll',
  storeName: 'employees'
});

// Employee CRUD
export async function getEmployees() {
  const employees = await employeesStore.getItem('list');
  return employees || [];
}

export async function saveEmployee(employee) {
  const employees = await getEmployees();
  if (!employee.id) {
    employee.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    employees.push(employee);
  } else {
    const index = employees.findIndex(emp => emp.id === employee.id);
    if (index !== -1) {
      employees[index] = employee;
    }
  }
  await employeesStore.setItem('list', employees);
  return employees;
}

export async function deleteEmployee(id) {
  const employees = await getEmployees();
  const filtered = employees.filter(emp => emp.id !== id);
  await employeesStore.setItem('list', filtered);
  return filtered;
}

// Additional global stores for later use
export const attendanceStore = localforage.createInstance({
  name: 'smartPayroll',
  storeName: 'attendance'
});

export const settingsStore = localforage.createInstance({
  name: 'smartPayroll',
  storeName: 'settings'
});