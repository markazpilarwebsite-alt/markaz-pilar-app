'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

export default function DonorsPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDonasi, setShowDonasi] = useState(false)
  const [editData, setEditData] = useState(null)
  const [selectedDonor, setSelectedDonor] = useState(null)
  const [donasiList, setDonasiList] = useState([])
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', type: 'individu', status: 'active' })
  const [donasiForm, setDonasiForm] = useState({ jenis: 'uang', nominal: '', deskripsi_barang: '', tanggal: '', status: 'confirmed' })
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
    const { data } = await supabase.from('donors').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const fetchDonasi = async (donorId) => {
    const { data } = await supabase.from('donasi').select('*').eq('donor_id', donorId).order('tanggal', { ascending: false })
    setDonasiList(data || [])
  }

  const openAdd = () => {
    setEditData(null)
    setForm({ full_name: '', email: '', phone: '', type: 'individu', status: 'active' })
    setShowForm(true)
  }

  const openEdit = (item) => {
    setEditData(item)
    setForm({ full_name: item.full_name || '', email: item.email || '', phone: item.phone || '', type: item.type || 'individu', status: item.status || 'active' })
    setShowForm(true)
  }

  const openDonasi = async (item) => {
    setSelectedDonor(item)
    setDonasiForm({ jenis: 'uang', nominal: '', deskripsi_barang: '', tanggal: '', status: 'confirmed' })
    await fetchDonasi(item.id)
    setShowDonasi(true)
  }

  const handleSave = async () => {
    if (!form.full_name) return alert('Nama wajib diisi!')
    setSaving(true)
    if (editData) {
      await supabase.from('donors').update(form).eq('id', editData.id)
    } else {
      await supabase.from('donors').insert(form)
    }
    setSaving(false)
    setShowForm(false)
    fetchData()
  }

  const handleSaveDonasi = async () => {
    if (!donasiForm.tanggal) return alert('Tanggal wajib diisi!')
    if (donasiForm.jenis === 'uang' && !donasiForm.nominal) return alert('Nominal wajib diisi!')
    setSaving(true)
    await supabase.from('donasi').insert({ ...donasiForm, donor_id: selectedDonor.id, nominal: donasiForm.jenis === 'uang' ? parseFloat(donasiForm.nominal) : null })
    setSaving(false)
    setDonasiForm({ jenis: 'uang', nominal: '', deskripsi_barang: '', tanggal: '', status: 'confirmed' })
    fetchDonasi(selectedDonor.id)
  }

  const handleDeleteDonasi = async (id) => {
    if (!confirm('Yakin mau hapus donasi ini?')) return
    await supabase.from('donasi').delete().eq('id', id)
    fetchDonasi(selectedDonor.id)
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus donor ini?')) return
    await supabase.from('donors').delete().eq('id', id)
    fetchData()
  }

  const formatRupiah = (num) => num ? 'Rp ' + Number(num).toLocaleString('id-ID') : '-'

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
          <span className="text-green-400">/</span>
          <h1 className="font-bold">Donors</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Donors</h2>
            <p className="text-gray-500 text-sm">{list.length} donor terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">
            + Tambah Donor
          </button>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data donor.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Nama</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Tipe</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Kontak</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.full_name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{item.type || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <p>{item.email || '-'}</p>
                      <p className="text-xs text-gray-400">{item.phone || ''}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2">
                      <button onClick={() => openDonasi(item)} className="text-green-600 hover:underline text-xs">Donasi</button>
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

      {/* Modal Tambah/Edit Donor */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData ? 'Edit Donor' : 'Tambah Donor'}</h3>
            <div className="space-y-3">
              {[
                { key: 'full_name', label: 'Nama Lengkap *', placeholder: 'Budi Santoso' },
                { key: 'email', label: 'Email', placeholder: 'email@gmail.com' },
                { key: 'phone', label: 'No. HP', placeholder: '08...' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} className={inputClass} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tipe Donor</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={inputClass}>
                  <option value="individu">Individu</option>
                  <option value="perusahaan">Perusahaan</option>
                  <option value="komunitas">Komunitas</option>
                </select>
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

      {/* Modal Riwayat Donasi */}
      {showDonasi && selectedDonor && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-800">Riwayat Donasi</h3>
                <p className="text-sm text-gray-500">{selectedDonor.full_name}</p>
              </div>
              <button onClick={() => setShowDonasi(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            {/* Form Tambah Donasi */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Tambah Donasi Baru</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Jenis</label>
                  <select value={donasiForm.jenis} onChange={(e) => setDonasiForm({ ...donasiForm, jenis: e.target.value })} className={inputClass}>
                    <option value="uang">Uang</option>
                    <option value="barang">Barang</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tanggal *</label>
                  <input type="date" value={donasiForm.tanggal} onChange={(e) => setDonasiForm({ ...donasiForm, tanggal: e.target.value })} className={inputClass} />
                </div>
              </div>
              {donasiForm.jenis === 'uang' ? (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nominal (Rp)</label>
                  <input type="number" value={donasiForm.nominal} onChange={(e) => setDonasiForm({ ...donasiForm, nominal: e.target.value })} placeholder="500000" className={inputClass} />
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Deskripsi Barang</label>
                  <input value={donasiForm.deskripsi_barang} onChange={(e) => setDonasiForm({ ...donasiForm, deskripsi_barang: e.target.value })} placeholder="Laptop, Proyektor, dll" className={inputClass} />
                </div>
              )}
              <button onClick={handleSaveDonasi} disabled={saving} className="w-full bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">
                {saving ? 'Menyimpan...' : '+ Tambah Donasi'}
              </button>
            </div>

            {/* List Donasi */}
            {donasiList.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-4">Belum ada riwayat donasi.</p>
            ) : (
              <div className="space-y-2">
                {donasiList.map((d) => (
                  <div key={d.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {d.jenis === 'uang' ? formatRupiah(d.nominal) : d.deskripsi_barang}
                      </p>
                      <p className="text-xs text-gray-400">{d.tanggal} · {d.jenis}</p>
                    </div>
                    <button onClick={() => handleDeleteDonasi(d.id)} className="text-red-400 hover:text-red-600 text-xs">Hapus</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
