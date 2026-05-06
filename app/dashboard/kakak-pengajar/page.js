'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function KakakPengajarPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', university: '', major: '', division: '', status: 'active' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/')
  }

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from('kakak_pengajar').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ full_name: '', email: '', phone: '', university: '', major: '', division: '', status: 'active' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditData(item)
    setForm({
      full_name: item.full_name || '',
      email: item.email || '',
      phone: item.phone || '',
      university: item.university || '',
      major: item.major || '',
      division: item.division || '',
      status: item.status || 'active'
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.full_name) return alert('Nama wajib diisi!')
    setSaving(true)
    if (editData) {
      await supabase.from('kakak_pengajar').update(form).eq('id', editData.id)
    } else {
      await supabase.from('kakak_pengajar').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus kakak pengajar ini?')) return
    await supabase.from('kakak_pengajar').delete().eq('id', id)
    fetchData()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
          <span className="text-green-400">/</span>
          <h1 className="font-bold">Kakak Pengajar</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Kakak Pengajar</h2>
            <p className="text-gray-500 text-sm">{list.length} kakak pengajar terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">
            + Tambah Kakak Pengajar
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data kakak pengajar.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Universitas</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Jurusan</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Divisi</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.full_name}</p>
                      <p className="text-xs text-gray-400">{item.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.university || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.major || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.division || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status === 'active' ? 'Aktif' : 'Alumni'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openEdit(item)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline text-xs">Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData ? 'Edit Kakak Pengajar' : 'Tambah Kakak Pengajar'}</h3>
            <div className="space-y-3">
              {[
                { key: 'full_name', label: 'Nama Lengkap *', placeholder: 'Ahmad ...' },
                { key: 'email', label: 'Email', placeholder: 'email@gmail.com' },
                { key: 'phone', label: 'No. HP', placeholder: '08...' },
                { key: 'university', label: 'Universitas', placeholder: 'Universitas Indonesia' },
                { key: 'major', label: 'Jurusan', placeholder: 'Teknik Informatika' },
                { key: 'division', label: 'Divisi', placeholder: 'Program' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={inputClass}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Alumni</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
