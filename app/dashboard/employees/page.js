'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

const emptyForm = { full_name: '', email: '', phone: '', position: '', division: '', employment_status: 'full-time', join_date: '', status: 'active' }

export default function EmployeesPage() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editData, setEditData] = useState(null)
  const [detailData, setDetailData] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [sortConfig, setSortConfig] = useState({ key: null, dir: 'asc' })
  const router = useRouter()

  useEffect(() => { checkAuth(); fetchData() }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/')
  }

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase.from('employees').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (item) => { setEditData(item); setForm({ full_name: item.full_name||'', email: item.email||'', phone: item.phone||'', position: item.position||'', division: item.division||'', employment_status: item.employment_status||'full-time', join_date: item.join_date||'', status: item.status||'active' }); setShowForm(true) }
  const openDetail = (item) => { setDetailData(item); setShowDetail(true) }

  const handleSave = async () => {
    if (!form.full_name) return alert('Nama wajib diisi!')
    setSaving(true)
    if (editData) { await supabase.from('employees').update(form).eq('id', editData.id) }
    else { await supabase.from('employees').insert(form) }
    setSaving(false); setShowForm(false); fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus employee ini?')) return
    await supabase.from('employees').delete().eq('id', id); fetchData()
  }

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }))
  const sortedList = [...list].sort((a, b) => {
    if (!sortConfig.key) return 0
    const av = a[sortConfig.key]??''; const bv = b[sortConfig.key]??''
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
        <h1 className="font-bold">Employee</h1>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Database Employee</h2>
            <p className="text-gray-500 text-sm">{list.length} karyawan terdaftar</p>
          </div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">+ Tambah Employee</button>
        </div>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : list.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400">Belum ada data employee.</p>
            <button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['full_name','Nama'],['position','Posisi'],['division','Divisi'],['employment_status','Status Kerja'],['status','Status']].map(([key,label]) => (
                    <th key={key} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{label}<SortBtn col={key}/></th>
                  ))}
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((item, i) => (
                  <tr key={item.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                    <td className="px-4 py-3"><p className="font-medium text-gray-800">{item.full_name}</p><p className="text-xs text-gray-400">{item.email||'-'}</p></td>
                    <td className="px-4 py-3 text-gray-600">{item.position||'-'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.division||'-'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{item.employment_status||'-'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{item.status==='active'?'Aktif':'Tidak Aktif'}</span></td>
                    <td className="px-4 py-3 flex gap-2 items-center">
                      <button onClick={()=>openDetail(item)} className="text-green-600 hover:underline text-xs">Lihat</button>
                      <button onClick={()=>openEdit(item)} className="text-blue-600 hover:underline text-xs">Edit</button>
                      <button onClick={()=>handleDelete(item.id)} className="text-red-500 hover:underline text-xs">Hapus</button>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData?'Edit Employee':'Tambah Employee'}</h3>
            <div className="space-y-3">
              <div><label className={labelClass}>Nama Lengkap *</label><input value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Ahmad ..." className={inputClass}/></div>
              <div><label className={labelClass}>Email</label><input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="email@gmail.com" className={inputClass}/></div>
              <div><label className={labelClass}>No. HP</label><input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="08..." className={inputClass}/></div>
              <div><label className={labelClass}>Posisi / Jabatan</label><input value={form.position} onChange={e=>setForm({...form,position:e.target.value})} placeholder="Program Manager" className={inputClass}/></div>
              <div><label className={labelClass}>Divisi</label><input value={form.division} onChange={e=>setForm({...form,division:e.target.value})} placeholder="Operasional" className={inputClass}/></div>
              <div><label className={labelClass}>Tanggal Bergabung</label><input type="date" value={form.join_date} onChange={e=>setForm({...form,join_date:e.target.value})} className={inputClass}/></div>
              <div><label className={labelClass}>Status Kepegawaian</label>
                <select value={form.employment_status} onChange={e=>setForm({...form,employment_status:e.target.value})} className={inputClass}>
                  <option value="full-time">Full-time</option><option value="part-time">Part-time</option>
                  <option value="contract">Kontrak</option><option value="intern">Magang</option>
                </select>
              </div>
              <div><label className={labelClass}>Status</label>
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})} className={inputClass}>
                  <option value="active">Aktif</option><option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">{saving?'Menyimpan...':'Simpan'}</button>
              <button onClick={()=>setShowForm(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition">Batal</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && detailData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-5">
              <div><h3 className="text-lg font-bold text-gray-800">{detailData.full_name}</h3><p className="text-sm text-gray-400">{detailData.email||'-'}</p></div>
              <button onClick={()=>setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['Posisi',detailData.position],['Divisi',detailData.division],['Status Kerja',detailData.employment_status],['Tanggal Bergabung',detailData.join_date],['No. HP',detailData.phone],['Status',detailData.status==='active'?'Aktif':'Tidak Aktif']].map(([label,val])=>(
                <div key={label} className="bg-gray-50 rounded-lg px-3 py-2"><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-medium text-gray-800">{val||'-'}</p></div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={()=>{setShowDetail(false);openEdit(detailData)}} className="flex-1 bg-green-700 hover:bg-green-800 text-white text-sm py-2 rounded-lg transition">Edit</button>
              <button onClick={()=>setShowDetail(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 rounded-lg transition">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
