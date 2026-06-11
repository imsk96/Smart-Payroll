import DashboardCard from '../components/DashboardCard'
import { Users, CalendarCheck, UserCheck, UserX, AlertTriangle, DollarSign } from 'lucide-react'

export default function Dashboard() {
  // Placeholder data – will be dynamic in later phases
  const stats = [
    { title: 'Total Employees', value: 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Total Working Days', value: 0, icon: CalendarCheck, color: 'bg-emerald-500' },
    { title: 'Total Present', value: 0, icon: UserCheck, color: 'bg-green-500' },
    { title: 'Total Absent', value: 0, icon: UserX, color: 'bg-red-500' },
    { title: 'Total Fine', value: '₹0', icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Total Salary', value: '₹0', icon: DollarSign, color: 'bg-purple-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <DashboardCard key={stat.title} {...stat} />
        ))}
      </div>
    </div>
  )
}