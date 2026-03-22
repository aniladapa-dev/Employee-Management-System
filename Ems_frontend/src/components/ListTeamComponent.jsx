import React, { useEffect, useState } from 'react'
import { getAllTeams, deleteTeam, createTeam } from '../services/TeamService'
import { getLoggedInEmployee } from '../services/EmployeeService'
import { getAllDepartments } from '../services/DepartmentService'
import { useNavigate } from 'react-router-dom'
import { isAdminUser } from '../services/auth/AuthService'
import Swal from 'sweetalert2'
import { Users, PlusCircle, Edit3, Trash2, Building2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'

const ListTeamComponent = () => {
    const [teams, setTeams] = useState([])
    const [departments, setDepartments] = useState([])
    const [name, setName] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const context = res.data.data;
            const role = sessionStorage.getItem('role') || '';
            if (role.includes('MANAGER') && context.departmentId) {
                setDepartmentId(context.departmentId.toString());
                listOfTeams(context.departmentId);
            } else {
                listOfTeams();
            }
        });
        if (isAdminUser()) listOfDepartments();
    }, [])

    function listOfTeams(deptId = '') {
        setLoading(true)
        getAllTeams(deptId).then((response) => {
            setTeams(response.data.data.content || [])
            setLoading(false)
        }).catch(error => { console.error(error); setLoading(false) })
    }

    function listOfDepartments() {
        getAllDepartments().then((response) => {
            setDepartments(response.data.data.content || [])
        }).catch(error => console.error(error))
    }

    function saveTeam(e) {
        e.preventDefault()
        if (!name.trim() || !departmentId) {
            Swal.fire('Warning', 'Please enter a team name and select a department.', 'warning')
            return
        }
        setCreating(true)
        createTeam({ name, departmentId }).then(() => {
            Swal.fire({ icon: 'success', title: 'Team Created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
            setName(''); setDepartmentId(''); setCreating(false)
            listOfTeams()
        }).catch(error => {
            setCreating(false)
            const errorData = error.response?.data
            const msg = errorData?.validationErrors ? Object.values(errorData.validationErrors).join(', ') : errorData?.message || 'Something went wrong'
            Swal.fire('Error', msg, 'error')
        })
    }

    function removeTeam(id) {
        Swal.fire({
            title: 'Delete Team?', text: "This action cannot be undone!", icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#ef4444', cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTeam(id).then(() => {
                    Swal.fire({ icon: 'success', title: 'Deleted!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
                    listOfTeams()
                }).catch(error => {
                    console.error(error)
                    Swal.fire('Error', 'Failed to delete team', 'error')
                })
            }
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Teams</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage your cross-functional teams and their leadership</p>
                </div>
                {isAdminUser() && (
                    <Button onClick={() => navigate('/add-team')}>
                        <PlusCircle size={16} className="mr-2" /> New Team
                    </Button>
                )}
            </div>



            {/* Teams Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users size={20} className="text-amber-500" />
                        <CardTitle>All Teams</CardTitle>
                    </div>
                    <Badge variant="neutral">{teams.length} total</Badge>
                </CardHeader>
                <Table>
                    <THead>
                        <TR>
                            <TH>Team</TH>
                            <TH>Department</TH>
                            <TH>Team Leader</TH>
                            <TH className="text-right">Actions</TH>
                        </TR>
                    </THead>
                    <TBody>
                        {loading ? (
                            Array(4).fill(0).map((_, i) => (
                                <TR key={i}><TD colSpan={4}><div className="h-10 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-lg" /></TD></TR>
                            ))
                        ) : teams.length > 0 ? (
                            teams.map(team => (
                                <TR key={team.id}>
                                    <TD>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                                                <Users size={16} className="text-amber-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{team.name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: #{team.id}</p>
                                            </div>
                                        </div>
                                    </TD>
                                    <TD>
                                        <div className="flex items-center gap-2">
                                            <Building2 size={14} className="text-slate-400 shrink-0" />
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{team.departmentName || 'N/A'}</span>
                                        </div>
                                    </TD>
                                    <TD>
                                        {team.teamLeaderName ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                                                    {team.teamLeaderName.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-slate-700 dark:text-slate-300">{team.teamLeaderName}</span>
                                            </div>
                                        ) : (
                                            <Badge variant="warning">Not Assigned</Badge>
                                        )}
                                    </TD>
                                    <TD>
                                        <div className="flex items-center justify-end gap-2">
                                            {isAdminUser() && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => navigate(`/edit-team/${team.id}`)} title="Edit">
                                                        <Edit3 size={16} className="text-blue-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => removeTeam(team.id)} title="Delete">
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
                                <TD colSpan={4} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users size={40} className="text-slate-300 dark:text-slate-700" />
                                        <p className="font-bold text-slate-800 dark:text-white">No teams yet</p>
                                        <p className="text-sm text-slate-500">{isAdminUser() ? 'Create your first team above' : 'No teams found for your department'}</p>
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

export default ListTeamComponent
