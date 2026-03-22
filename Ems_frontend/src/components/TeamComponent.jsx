import React, { useEffect, useState } from 'react'
import { createTeam, getTeamById, updateTeam } from '../services/TeamService'
import { getAllDepartments } from '../services/DepartmentService'
import { listEmployees } from '../services/EmployeeService'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Users, Building2, UserCheck, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Badge } from './ui/Badge'

const TeamComponent = () => {
    const [name, setName] = useState('')
    const [departmentId, setDepartmentId] = useState('')
    const [teamLeaderId, setTeamLeaderId] = useState('')
    const [departments, setDepartments] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(false)

    const { id } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        getAllDepartments().then(r => setDepartments(r.data.data.content || [])).catch(console.error)
        listEmployees().then(r => setEmployees(r.data.data.content || [])).catch(console.error)
        if (id) {
            getTeamById(id).then((response) => {
                const team = response.data.data
                setName(team.name)
                setDepartmentId(team.departmentId || '')
                setTeamLeaderId(team.teamLeaderId || '')
            }).catch(console.error)
        }
    }, [id])

    function saveOrUpdateTeam(e) {
        e.preventDefault()
        if (!name.trim()) { Swal.fire('Warning', 'Team name is required', 'warning'); return }
        setLoading(true)
        const team = { name, departmentId, teamLeaderId }
        const action = id ? updateTeam(id, team) : createTeam(team)
        action.then(() => {
            Swal.fire({ icon: 'success', title: id ? 'Team Updated!' : 'Team Created!', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
            navigate('/teams')
        }).catch(error => {
            setLoading(false)
            Swal.fire('Error', error.response?.data?.message || 'Operation failed', 'error')
        })
    }

    const selectClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium appearance-none text-slate-700 dark:text-slate-300"

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate('/teams')} className="rounded-full w-10 h-10 p-0">
                    <ChevronLeft size={20} />
                </Button>
                <div className="flex-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{id ? 'Update Team' : 'New Team'}</h2>
                    <p className="text-sm text-slate-500 font-medium">{id ? `Editing team #${id}` : 'Create a new team and assign a leader'}</p>
                </div>
                <Badge variant={id ? 'info' : 'success'} className="uppercase tracking-widest">{id ? 'Editing' : 'New'}</Badge>
            </div>

            <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none">
                <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-amber-600">
                        <Users size={18} />
                        <CardTitle className="text-sm font-black uppercase tracking-widest">Team Configuration</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={saveOrUpdateTeam} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Users size={12} /> Team Name</label>
                            <input type="text" placeholder="e.g. Backend Ninjas, Design Studio..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Building2 size={12} /> Parent Department</label>
                            <select className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                                <option value="">Select Department</option>
                                {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><UserCheck size={12} /> Team Leader (Optional)</label>
                            <select className={selectClass} value={teamLeaderId} onChange={(e) => setTeamLeaderId(e.target.value)}>
                                <option value="">Select Team Leader</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button type="button" variant="outline" onClick={() => navigate('/teams')}>Cancel</Button>
                            <Button type="submit" loading={loading} className="px-8">{id ? 'Save Changes' : 'Create Team'}</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default TeamComponent
