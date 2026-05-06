'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PesantrenPage() {
  const [pesantrenList, setPesantrenList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ name: '', address: '', city: '', province: '', pic_name: '', pic_phone: '', status: 'active' })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    fetchPesantren()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/')
  }

  const fetchPesantren = async () => {
    setLoading(true)
    const { data } = await supabase.from('pesantren').select('*').order('created_at', { ascending: false })
    setPesantrenList(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ name: '', address: '', city: '', province: '', pic_name: '', pic_phone: '', status: 'active' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditData(item)
    setForm({ name: item.name, address: item.address || '', city: item.city || '', province: item.province || '', pic_name: item.pic_name || '', pic_phone: item.pic_phone || '', status: item.status || 'active' })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.name) return alert('Nama pesantren wajib diisi!')
    setSaving(true)
    if (editData) {
      await supabase.from('pesantren').update(form).eq('id', editData.id)
    } else {
      await supabase.from('pesantren').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchPesantren()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus pesantren ini?')) return
    await supabase.from('pesantren').delete().eq('id', id)
    fetchPesantren()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
          <span className="text-green-400">/</span>
          <h1 className="font-bold">Pesantren</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Pesantren</h2>
            <p className="text-gray-500 text-sm">{pesantrenList.length} pesantren terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">
            + Tambah Pesantren
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : pesantrenList.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data pesantren.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nama Pesantren</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Kota</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Provinsi</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">PIC</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pesantrenList.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.name}</td>
                    <td className="px-4 py-3 text-gray-600">{item.city || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.province || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.pic_name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData ? 'Edit Pesantren' : 'Tambah Pesantren'}</h3>
            <div className="space-y-3">
              {[
                { key: 'name', label: 'Nama Pesantren *', placeholder: 'Pondok Pesantren ...' },
                { key: 'address', label: 'Alamat', placeholder: 'Jl. ...' },
                { key: 'city', label: 'Kota', placeholder: 'Jakarta' },
                { key: 'province', label: 'Provinsi', placeholder: 'DKI Jakarta' },
                { key: 'pic_name', label: 'Nama PIC', placeholder: 'Ustadz ...' },
                { key: 'pic_phone', label: 'No. HP PIC', placeholder: '08...' },
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
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={inputClass}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
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