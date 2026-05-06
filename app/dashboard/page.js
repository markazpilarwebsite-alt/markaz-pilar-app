'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const menus = [
    { label: 'Employee', emoji: '👥', href: '/dashboard/employees' },
    { label: 'Donors', emoji: '❤️', href: '/dashboard/donors' },
    { label: 'Pesantren', emoji: '🕌', href: '/dashboard/pesantren' },
    { label: 'Santri', emoji: '🎓', href: '/dashboard/santri' },
    { label: 'Kakak Pengajar', emoji: '👨‍🏫', href: '/dashboard/kakak-pengajar' },
    { label: 'Partners', emoji: '🤝', href: '/dashboard/partners' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg">Markaz Pilar</h1>
          <p className="text-green-200 text-xs">Internal Management Platform</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-green-200">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="bg-green-700 hover:bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Selamat datang 👋</h2>
        <p className="text-gray-500 text-sm mb-8">Pilih modul yang ingin lo kelola.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <a
              key={menu.label}
              href={menu.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-3 hover:shadow-md hover:border-green-200 transition"
            >
              <span className="text-4xl">{menu.emoji}</span>
              <span className="text-sm font-medium text-gray-700">{menu.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
