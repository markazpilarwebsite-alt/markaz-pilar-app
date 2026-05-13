'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

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
      {/* Navbar */}
      <div className="bg-green-800 text-white px-5 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Image
            src="/logo.svg"
            alt="Markaz Pilar"
            width={80}
            height={32}
            className="object-contain"
          />
          {/* Right side */}
          <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-xs text-green-200 truncate max-w-[150px] sm:max-w-none sm:text-sm">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="bg-green-700 hover:bg-green-600 text-white text-xs sm:text-sm px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Selamat datang Qur'an Leaders! 👋</h2>
        <p className="text-gray-500 text-sm mb-6">Pilih modul yang ingin kamu kelola.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {menus.map((menu) => (
            <a
              key={menu.label}
              href={menu.href}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col items-center gap-3 hover:shadow-md hover:border-green-200 transition"
            >
              <span className="text-3xl sm:text-4xl">{menu.emoji}</span>
              <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">{menu.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
