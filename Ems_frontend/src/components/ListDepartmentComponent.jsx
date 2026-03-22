import React, { useState, useEffect } from 'react'
import { getAllDepartments, deleteDepartment, createDepartment } from '../services/DepartmentService'
import { useNavigate } from 'react-router-dom'
import { isAdminUser } from '../services/auth/AuthService'
import Swal from 'sweetalert2'
import { Building2, PlusCircle, Edit3, Trash2, User } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'

const ListDepartmentComponent = () => {
    const [departments, setDepartments] = useState([])
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const navigate = useNavigate()

    useEffect(() => { listOfDepartments() }, [])

    function listOfDepartments() {
        setLoading(true)
        getAllDepartments().then((response) => {
            setDepartments(response.data.data.content || [])
            setLoading(false)
        }).catch(error => {
            console.error(error)
            setLoading(false)
        })
    }

    function saveDepartment(e) {
        e.preventDefault()
        if (!name.trim()) {
            Swal.fire('Warning', 'Department name cannot be empty', 'warning')
            return
        }
        setCreating(true)
        createDepartment({ name }).then(() => {
            Swal.fire({ icon: 'success', title: 'Department Created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
            setName('')
            setCreating(false)
            listOfDepartments()
        }).catch(error => {
            setCreating(false)
            const errorData = error.response?.data
            let msg = errorData?.validationErrors ? Object.values(errorData.validationErrors).join(', ') : errorData?.message || 'An unexpected error occurred.'
            Swal.fire('Error', msg, 'error')
        })
    }

    function removeDepartment(id) {
        Swal.fire({
            title: 'Delete Department?',
            text: "This action is not reversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteDepartment(id).then(() => {
                    Swal.fire({ icon: 'success', title: 'Deleted!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
                    listOfDepartments()
                }).catch(error => {
                    console.error(error)
                    Swal.fire('Error', 'Failed to delete department', 'error')
                })
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Departments</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Organize your workforce into functional departments</p>
                </div>
                <Button onClick={() => navigate('/add-department')}>
                    <PlusCircle size={16} className="mr-2" /> New Department
                </Button>
            </div>



            {/* Departments Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Building2 size={20} className="text-primary-600" />
                        <CardTitle>All Departments</CardTitle>
                    </div>
                    <Badge variant="neutral">{departments.length} total</Badge>
                </CardHeader>
                <Table>
                    <THead>
                        <TR>
                            <TH>Department</TH>
                            <TH>Manager</TH>
                            <TH className="text-right">Actions</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <TR key={i}>
                                    <TD colSpan={3}><div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /></TD>
                                </TR>
                            ))
                        ) : departments.length > 0 ? (
                            departments.map(dept => (
                                <TR key={dept.id}>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                                                <Building2 size={16} className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{dept.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{dept.id}</p>
                                            </div>
                                        </div>
                                    </TD>
                                    <TD>
                                        {dept.managerName ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                                                    {dept.managerName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{dept.managerName}</span>
                                            </div>
                                        ) : (
                                            <Badge variant="warning">Not Assigned</Badge>
                                        )}
                                    </TD>
                                    <TD>
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdminUser() && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-department/${dept.id}`)} title="Edit">
                                                        <Edit3 size={16} className="text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => removeDepartment(dept.id)} title="Delete">
                                                        <Trash2 size={16} className="text-red-500" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TD>
                                </TR>
                            ))
                        ) : (
                            <TR>
                                <TD colSpan={3} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Building2 size={40} className="text-slate-300 dark:text-slate-700" />
                                        <p className="font-bold text-slate-800 dark:text-white">No departments yet</p>
                                        <p className="text-sm text-slate-500">Create your first department above</p>
                                    </div>
                                </TD>
                            </TR>
                        )}
                    </TBody>
                </Table>
            </Card>
        </div>
    )
}

export default ListDepartmentComponent
