import { Menu, User } from 'lucide-react'
import { useState } from 'react'
import SidebarMobile from './Sidebar' // We'll reuse for mobile; simpler approach: inline mobile menu
// But to keep it clean, I'll just put a placeholder mobile toggle and the title.

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1 rounded hover:bg-gray-100"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          Smart Attendance Payroll
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User size={18} />
          <span>Admin</span>
        </div>
      </div>
      {/* Mobile sidebar overlay will be handled separately if needed; for now a placeholder */}
    </header>
  )
}