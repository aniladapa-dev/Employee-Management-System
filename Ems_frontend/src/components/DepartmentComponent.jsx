import React, { useEffect, useState } from 'react'
import { createDepartment, getDepartmentById, updateDepartment } from '../services/DepartmentService'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Building2, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

const DepartmentComponent = () => {
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)
    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        if (id) {
            getDepartmentById(id).then((response) => {
                setName(response.data.data.name)
            }).catch(error => console.error(error))
        }
    }, [id])

    function saveOrUpdateDepartment(e) {
        e.preventDefault()
        if (!name.trim()) {
            Swal.fire('Warning', 'Department name cannot be empty', 'warning')
            return
        }
        setLoading(true)
        const action = id ? updateDepartment(id, { name }) : createDepartment({ name })
        action.then(() => {
            Swal.fire({ icon: 'success', title: id ? 'Department Updated!' : 'Department Created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
            navigate('/departments')
        }).catch(error => {
            setLoading(false)
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error')
        })
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/departments')} className="rounded-full w-10 h-10 p-0">
                    <ChevronLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {id ? 'Update Department' : 'New Department'}
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                        {id ? `Editing department #${id}` : 'Add a new functional department'}
                    </p>
                </div>
                <Badge variant={id ? 'info' : 'success'} className="uppercase tracking-widest">
                    {id ? 'Editing' : 'New'}
                </Badge>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-primary-600">
                        <Building2 size={18} />
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Department Details</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={saveOrUpdateDepartment} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Department Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Engineering, Marketing, Finance..."
                                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium text-slate-900 dark:text-white"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/departments')}>
                                Cancel
                            </Button>
                            <Button type="submit" loading={loading} className="px-8">
                                {id ? 'Save Changes' : 'Create Department'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default DepartmentComponent
