'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { useRouter } from 'next/navigation'

const emptyForm = { org_name: '', pic_name: '', pic_email: '', pic_phone: '', type: 'perusahaan', status: 'active', start_date: '' }

export default function PartnersPage() {
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
    const { data } = await supabase.from('partners').select('*').order('created_at', { ascending: false })
    setList(data || [])
    setLoading(false)
  }

  const openAdd = () => { setEditData(null); setForm(emptyForm); setShowForm(true) }
  const openEdit = (item) => { setEditData(item); setForm({ org_name:item.org_name||'', pic_name:item.pic_name||'', pic_email:item.pic_email||'', pic_phone:item.pic_phone||'', type:item.type||'perusahaan', status:item.status||'active', start_date:item.start_date||'' }); setShowForm(true) }
  const openDetail = (item) => { setDetailData(item); setShowDetail(true) }

  const handleSave = async () => {
    if (!form.org_name) return alert('Nama organisasi wajib diisi!')
    setSaving(true)
    if (editData) { await supabase.from('partners').update(form).eq('id', editData.id) }
    else { await supabase.from('partners').insert(form) }
    setSaving(false); setShowForm(false); fetchData()
  }

  const handleDelete = async (id) => {
    if (!confirm('Yakin mau hapus partner ini?')) return
    await supabase.from('partners').delete().eq('id', id); fetchData()
  }

  const handleSort = (key) => setSortConfig(prev => ({ key, dir: prev.key===key&&prev.dir==='asc'?'desc':'asc' }))
  const sortedList = [...list].sort((a,b) => {
    if (!sortConfig.key) return 0
    const av=a[sortConfig.key]??''; const bv=b[sortConfig.key]??''
    return sortConfig.dir==='asc'?String(av).localeCompare(String(bv)):String(bv).localeCompare(String(av))
  })
  const SortBtn = ({ col }) => (
    <button onClick={()=>handleSort(col)} className="ml-1 text-gray-400 hover:text-green-700 text-xs">
      {sortConfig.key===col?(sortConfig.dir==='asc'?'▲':'▼'):'⇅'}
    </button>
  )

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
  const labelClass = "block text-xs font-medium text-gray-600 mb-1"

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-green-800 text-white px-6 py-4 flex items-center gap-3">
        <a href="/dashboard" className="text-green-200 hover:text-white text-sm">← Dashboard</a>
        <span className="text-green-400">/</span>
        <h1 className="font-bold">Partners</h1>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <div><h2 className="text-xl font-bold text-gray-800">Database Partners</h2><p className="text-gray-500 text-sm">{list.length} partner terdaftar</p></div>
          <button onClick={openAdd} className="bg-green-700 hover:bg-green-800 text-white text-sm px-4 py-2 rounded-lg transition">+ Tambah Partner</button>
        </div>
        {loading ? <p className="text-gray-400 text-sm">Loading...</p> : list.length===0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center"><p className="text-gray-400">Belum ada data partner.</p><button onClick={openAdd} className="mt-4 text-green-700 text-sm font-medium hover:underline">Tambah sekarang</button></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[['org_name','Organisasi'],['type','Tipe'],['pic_name','PIC'],['start_date','Mulai Kerja Sama'],['status','Status']].map(([key,label])=>(
                    <th key={key} className="text-left px-4 py-3 text-gray-600 font-medium whitespace-nowrap">{label}<SortBtn col={key}/></th>
                  ))}
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((item,i)=>(
                  <tr key={item.id} className={i%2===0?'bg-white':'bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{item.org_name}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{item.type||'-'}</td>
                    <td className="px-4 py-3 text-gray-600"><p>{item.pic_name||'-'}</p><p className="text-xs text-gray-400">{item.pic_email||''}</p></td>
                    <td className="px-4 py-3 text-gray-600">{item.start_date||'-'}</td>
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
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editData?'Edit Partner':'Tambah Partner'}</h3>
            <div className="space-y-3">
              <div><label className={labelClass}>Nama Organisasi *</label><input value={form.org_name} onChange={e=>setForm({...form,org_name:e.target.value})} placeholder="PT. Contoh Indonesia" className={inputClass}/></div>
              <div><label className={labelClass}>Nama PIC</label><input value={form.pic_name} onChange={e=>setForm({...form,pic_name:e.target.value})} placeholder="Budi Santoso" className={inputClass}/></div>
              <div><label className={labelClass}>Email PIC</label><input value={form.pic_email} onChange={e=>setForm({...form,pic_email:e.target.value})} placeholder="budi@perusahaan.com" className={inputClass}/></div>
              <div><label className={labelClass}>No. HP PIC</label><input value={form.pic_phone} onChange={e=>setForm({...form,pic_phone:e.target.value})} placeholder="08..." className={inputClass}/></div>
              <div><label className={labelClass}>Tipe Partner</label>
                <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className={inputClass}>
                  <option value="perusahaan">Perusahaan</option><option value="komunitas">Komunitas</option>
                  <option value="lembaga">Lembaga</option><option value="kampus">Kampus</option>
                </select>
              </div>
              <div><label className={labelClass}>Tanggal Mulai Kerja Sama</label><input type="date" value={form.start_date} onChange={e=>setForm({...form,start_date:e.target.value})} className={inputClass}/></div>
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-start mb-5">
              <div><h3 className="text-lg font-bold text-gray-800">{detailData.org_name}</h3><p className="text-sm text-gray-400 capitalize">{detailData.type||'-'}</p></div>
              <button onClick={()=>setShowDetail(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[['PIC',detailData.pic_name],['Email PIC',detailData.pic_email],['No. HP PIC',detailData.pic_phone],['Mulai Kerja Sama',detailData.start_date],['Status',detailData.status==='active'?'Aktif':'Tidak Aktif']].map(([label,val])=>(
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
