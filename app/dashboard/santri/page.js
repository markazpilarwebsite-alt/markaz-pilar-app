'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

const PROVINSI = [
  "Aceh","Sumatera Utara","Sumatera Barat","Riau","Kepulauan Riau","Jambi",
  "Sumatera Selatan","Kepulauan Bangka Belitung","Bengkulu","Lampung",
  "DKI Jakarta","Jawa Barat","Banten","Jawa Tengah","DI Yogyakarta","Jawa Timur",
  "Bali","Nusa Tenggara Barat","Nusa Tenggara Timur",
  "Kalimantan Barat","Kalimantan Tengah","Kalimantan Selatan","Kalimantan Timur","Kalimantan Utara",
  "Sulawesi Utara","Gorontalo","Sulawesi Tengah","Sulawesi Barat","Sulawesi Selatan","Sulawesi Tenggara",
  "Maluku","Maluku Utara","Papua Barat","Papua Barat Daya","Papua","Papua Pegunungan","Papua Selatan","Papua Tengah"
]

const BATCH_YEARS = [2020,2021,2022,2023,2024,2025,2026]

const emptyForm = {
  full_name: '', email: '', phone: '', birth_date: '', gender: 'Laki-laki',
  hafalan_juz: 0, level: 'Beginner', pesantren_id: '',
  provinsi_asal: '', kota_asal: '', batch_tahun: '', status: 'active'
}

export default function SantriPage() {
  const [list, setList] = useState([])
  const [pesantrenList, setPesantrenList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editData, setEditData] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' })
  const router = useRouter()

  useEffect(() => { checkAuth(); fetchData(); fetchPesantren() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/')
  }

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from('santri').select('*, pesantren(name)').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const fetchPesantren = async () => {
    const { data } = await supabase.from('pesantren').select('id, name').eq('status', 'active')
    setPesantrenList(data || [])
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowForm(true) }

  const openEdit = (item) => {
    setEditData(item)
    setForm({
      full_name: item.full_name || '', email: item.email || '', phone: item.phone || '',
      birth_date: item.birth_date || '', gender: item.gender || 'Laki-laki',
      hafalan_juz: item.hafalan_juz || 0, level: item.level || 'Beginner',
      pesantren_id: item.pesantren_id || '', provinsi_asal: item.provinsi_asal || '',
      kota_asal: item.kota_asal || '', batch_tahun: item.batch_tahun || '', status: item.status || 'active'
    })
    setShowForm(true)
  }

  const openDetail = (item) => { setDetailData(item); setShowDetail(true) }

  const handleSave = async () => {
    if (!form.full_name) return alert('Nama wajib diisi!')
    setSaving(true)
    const payload = { ...form, hafalan_juz: parseInt(form.hafalan_juz) || 0, pesantren_id: form.pesantren_id || null, batch_tahun: form.batch_tahun || null }
    if (editData) {
      await supabase.from('santri').update(payload).eq('id', editData.id)
    } else {
      await supabase.from('santri').insert(payload)
    }
    setSaving(false); setShowForm(false); fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus santri ini?')) return
    await supabase.from('santri').delete().eq('id', id); fetchData()
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
  }

  const sortedList = [...list].sort((a, b) => {
    if (!sortConfig.key) return 0
    const av = a[sortConfig.key] ?? ''; const bv = b[sortConfig.key] ?? ''
    return sortConfig.dir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av))
  })

  const SortBtn = ({ col }) => (
    <button onClick={() => handleSort(col)} className="ml-1 text-gray-400 hover:text-green-700 text-xs">
      {sortConfig.key === col ? (sortConfig.dir === 'asc' ? '▲' : '▼') : '⇅'}
    </button>
  )

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex items-center gap-3">
        <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
        <span className="text-green-400">/</span>
        <h1 className="font-bold">Santri</h1>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Santri</h2>
            <p className="text-gray-500 text-sm">{list.length} santri terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">
            + Tambah Santri
          </button>
        </div>

        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data santri.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['full_name','Nama'],['pesantren_id','Pesantren'],['level','Level'],['hafalan_juz','Hafalan'],['provinsi_asal','Provinsi'],['batch_tahun','Batch'],['gender','Gender'],['status','Status']].map(([key, label]) => (
                    <th key={key} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">
                      {label}<SortBtn col={key} />
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{item.full_name}</p>
                      <p className="text-xs text-gray-400">{item.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.pesantren?.name || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.level === 'Beginner' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                        {item.level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.hafalan_juz} juz</td>
                    <td className="px-4 py-3 text-gray-600">{item.provinsi_asal || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.batch_tahun || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.gender || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {item.status === 'active' ? 'Aktif' : 'Alumni'}
                      </span>
                    </td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button onClick={() => openDetail(item)} className="text-green-600 hover:underline text-xs">Lihat</button>
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

      {/* Modal Tambah/Edit */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData ? 'Edit Santri' : 'Tambah Santri'}</h3>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Nama Lengkap *</label>
                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Ahmad ..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Pesantren</label>
                <select value={form.pesantren_id} onChange={e => setForm({...form, pesantren_id: e.target.value})} className={inputClass}>
                  <option value="">-- Pilih Pesantren --</option>
                  {pesantrenList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="email@gmail.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>No. HP</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="08..." className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tanggal Lahir</label>
                <input type="date" value={form.birth_date} onChange={e => setForm({...form, birth_date: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Gender</label>
                <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className={inputClass}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Provinsi Asal</label>
                  <select value={form.provinsi_asal} onChange={e => setForm({...form, provinsi_asal: e.target.value})} className={inputClass}>
                    <option value="">-- Pilih Provinsi --</option>
                    {PROVINSI.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Kota/Kabupaten Asal</label>
                  <input value={form.kota_asal} onChange={e => setForm({...form, kota_asal: e.target.value})} placeholder="Kota/Kab..." className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Hafalan (Juz)</label>
                <input type="number" min="0" max="30" value={form.hafalan_juz} onChange={e => setForm({...form, hafalan_juz: e.target.value})} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Level</label>
                  <select value={form.level} onChange={e => setForm({...form, level: e.target.value})} className={inputClass}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Batch Tahun</label>
                  <select value={form.batch_tahun} onChange={e => setForm({...form, batch_tahun: e.target.value})} className={inputClass}>
                    <option value="">-- Pilih Batch --</option>
                    {BATCH_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={inputClass}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Alumni</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button onClick={() => setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition">Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Detail */}
      {showDetail && detailData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{detailData.full_name}</h3>
                <p className="text-sm text-gray-400">{detailData.email || '-'}</p>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Pesantren', detailData.pesantren?.name],
                ['Level', detailData.level],
                ['Batch Tahun', detailData.batch_tahun],
                ['Hafalan', `${detailData.hafalan_juz} juz`],
                ['Gender', detailData.gender],
                ['Tanggal Lahir', detailData.birth_date],
                ['No. HP', detailData.phone],
                ['Provinsi Asal', detailData.provinsi_asal],
                ['Kota/Kab Asal', detailData.kota_asal],
                ['Status', detailData.status === 'active' ? 'Aktif' : 'Alumni'],
              ].map(([label, val]) => (
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2">
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-sm font-medium text-gray-800">{val || '-'}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowDetail(false); openEdit(detailData) }} className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">Edit</button>
              <button onClick={() => setShowDetail(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
