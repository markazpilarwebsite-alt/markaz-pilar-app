'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function PartnersPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [form, setForm] = useState({ org_name: '', pic_name: '', pic_email: '', pic_phone: '', type: 'perusahaan', status: 'active', start_date: '' })
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
    const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ org_name: '', pic_name: '', pic_email: '', pic_phone: '', type: 'perusahaan', status: 'active', start_date: '' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditData(item)
    setForm({
      org_name: item.org_name || '',
      pic_name: item.pic_name || '',
      pic_email: item.pic_email || '',
      pic_phone: item.pic_phone || '',
      type: item.type || 'perusahaan',
      status: item.status || 'active',
      start_date: item.start_date || ''
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.org_name) return alert('Nama organisasi wajib diisi!')
    setSaving(true)
    if (editData) {
      await supabase.from('partners').update(form).eq('id', editData.id)
    } else {
      await supabase.from('partners').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus partner ini?')) return
    await supabase.from('partners').delete().eq('id', id)
    fetchData()
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
          <span className="text-green-400">/</span>
          <h1 className="font-bold">Partners</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Partners</h2>
            <p className="text-gray-500 text-sm">{list.length} partner terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">
            + Tambah Partner
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data partner.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Organisasi</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipe</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">PIC</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Mulai Kerja Sama</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.org_name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{item.type || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{item.pic_name || '-'}</p>
                      <p className="text-xs text-gray-400">{item.pic_email || ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.start_date || '-'}</td>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData ? 'Edit Partner' : 'Tambah Partner'}</h3>
            <div className="space-y-3">
              {[
                { key: 'org_name', label: 'Nama Organisasi *', placeholder: 'PT. Contoh Indonesia' },
                { key: 'pic_name', label: 'Nama PIC', placeholder: 'Budi Santoso' },
                { key: 'pic_email', label: 'Email PIC', placeholder: 'budi@perusahaan.com' },
                { key: 'pic_phone', label: 'No. HP PIC', placeholder: '08...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipe Partner</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  <option value="perusahaan">Perusahaan</option>
                  <option value="komunitas">Komunitas</option>
                  <option value="lembaga">Lembaga</option>
                  <option value="kampus">Kampus</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal Mulai Kerja Sama</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
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
