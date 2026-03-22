import React, { useState, useEffect } from 'react'
import { applyLeave, getEmployeeLeaves, getPendingForMe, updateLeaveStatus, getLeaveBalance } from '../services/LeaveService'
import { getLoggedInEmployee } from '../services/EmployeeService'
import Swal from 'sweetalert2'
import { CalendarCheck, CalendarClock, CalendarX2, CheckCircle2, XCircle, ClipboardList, PlusCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'

const LEAVE_TYPES = [
    { value: 'CASUAL_LEAVE', label: 'Casual Leave' },
    { value: 'SICK_LEAVE', label: 'Sick Leave' },
    { value: 'EARNED_LEAVE', label: 'Earned Leave' },
    { value: 'MATERNITY_LEAVE', label: 'Maternity Leave' },
    { value: 'PATERNITY_LEAVE', label: 'Paternity Leave' },
    { value: 'UNPAID_LEAVE', label: 'Unpaid Leave' },
]

const LeaveComponent = () => {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [leaveType, setLeaveType] = useState('CASUAL_LEAVE')
    const [reason, setReason] = useState('')
    const role = (sessionStorage.getItem('role') || '').trim().toUpperCase()
    const isAdmin = role === 'ROLE_ADMIN'
    const isApprover = ['ROLE_ADMIN', 'ROLE_MANAGER', 'ROLE_TEAM_LEADER'].includes(role)
    const [myLeaves, setMyLeaves] = useState([])
    const [pendingApprovals, setPendingApprovals] = useState([])
    const [employeeId, setEmployeeId] = useState(null)
    const [activeTab, setActiveTab] = useState(isAdmin ? 'approve' : 'my')
    const [balance, setBalance] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const self = res.data.data
            setEmployeeId(self.id)
            getEmployeeLeaves(self.id).then(r => setMyLeaves(r.data.data || []))
            if (!isAdmin) getLeaveBalance(self.id).then(r => setBalance(r.data.data || r.data))
        }).catch(err => console.error('Employee profile not found', err))
        if (isApprover) getPendingForMe().then(r => setPendingApprovals(r.data.data || [])).catch(console.error)
    }, [])

    function refreshAll() {
        if (employeeId) getEmployeeLeaves(employeeId).then(r => setMyLeaves(r.data.data || []))
        if (isApprover) getPendingForMe().then(r => setPendingApprovals(r.data.data || []))
    }

    function handleApplyLeave(e) {
        e.preventDefault()
        if (!employeeId || !startDate || !endDate || !leaveType) { Swal.fire('Error', 'Please fill all required fields', 'error'); return }
        setSubmitting(true)
        applyLeave({ employeeId, startDate, endDate, leaveType, reason })
            .then(() => {
                Swal.fire({ icon: 'success', title: 'Leave Applied!', showConfirmButton: false, timer: 2000 })
                setStartDate(''); setEndDate(''); setReason(''); setLeaveType('CASUAL_LEAVE')
                refreshAll(); setActiveTab('my')
            })
            .catch(err => {
                const data = err.response?.data
                if (data?.validationErrors) Swal.fire('Validation Failed', Object.entries(data.validationErrors).map(([f, m]) => `${f}: ${m}`).join('\n'), 'error')
                else Swal.fire('Failed', data?.message || err.message, 'error')
            }).finally(() => setSubmitting(false))
    }

    function handleStatusUpdate(id, status) {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({ 
            title: `Enter remarks for ${status}`, 
            input: 'text', 
            inputPlaceholder: 'Remarks (optional)', 
            showCancelButton: true, 
            confirmButtonText: 'Submit',
            background: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a',
            confirmButtonColor: '#2563eb', // primary-600
            inputAttributes: {
                className: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl'
            }
        })
            .then(r => {
                if (r.isConfirmed) updateLeaveStatus(id, status, r.value || '')
                    .then(() => { Swal.fire({ icon: 'success', title: `Leave ${status.toLowerCase()}!`, showConfirmButton: false, timer: 1500, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }); refreshAll() })
                    .catch(err => Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, background: isDark ? '#0f172a' : '#ffffff', color: isDark ? '#f8fafc' : '#0f172a' }))
            })
    }

    const statusVariant = s => ({ PENDING: 'warning', APPROVED: 'success', REJECTED: 'danger' })[s] || 'neutral'

    const approverLabel = () => ({
        'ROLE_TEAM_LEADER': 'Pending from Your Team Members',
        'ROLE_MANAGER': 'Pending from Team Leaders in Your Department',
        'ROLE_ADMIN': 'Pending from Managers',
    })[role] || 'Pending Approvals'

    const inputClass = "mt-1 w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all"
    const tabs = [...(!isAdmin ? [{ id: 'my', label: 'My Leaves', icon: ClipboardList }, { id: 'apply', label: 'Apply Leave', icon: PlusCircle }] : []), ...(isApprover ? [{ id: 'approve', label: 'Approvals', icon: CheckCircle2, badge: pendingApprovals.length }] : [])]

    return (
        <div className="space-y-6">
            {/* Balance Cards */}
            {!isAdmin && balance && (
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { label: 'Total Leaves', value: balance.totalLeaves, icon: CalendarCheck, color: 'bg-primary-600', shadow: 'shadow-primary-600/20' },
                        { label: 'Used Leaves', value: balance.usedLeaves, icon: CalendarClock, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
                        { label: 'Remaining', value: balance.remainingLeaves, icon: CalendarX2, color: 'bg-emerald-600', shadow: 'shadow-emerald-600/20' },
                    ].map(({ label, value, icon: Icon, color, shadow }) => (
                        <Card key={label}>
                            <CardContent className="flex items-center gap-4 py-5">
                                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg ${shadow} shrink-0`}>
                                    <Icon size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{value ?? 0}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <tab.icon size={15} />
                        {tab.label}
                        {tab.badge > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{tab.badge}</span>}
                    </button>
                ))}
            </div>

            {/* My Leaves Tab */}
            {activeTab === 'my' && (
                <Card>
                    <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-widest">Your Leave History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <THead><TR><TH>Type</TH><TH>Start Date</TH><TH>End Date</TH><TH>Reason</TH><TH>Status</TH><TH>Remarks</TH></TR></THead>
                            <TBody>
                                {myLeaves.map(l => (
                                    <TR key={l.id}>
                                        <TD><Badge variant="info" className="text-[10px]">{l.leaveType?.replace(/_/g, ' ')}</Badge></TD>
                                        <TD className="font-medium">{l.startDate}</TD>
                                        <TD>{l.endDate}</TD>
                                        <TD className="text-slate-500 text-xs">{l.reason || '—'}</TD>
                                        <TD><Badge variant={statusVariant(l.status)}>{l.status}</Badge></TD>
                                        <TD className="text-slate-500 text-xs">{l.adminRemarks || '—'}</TD>
                                    </TR>
                                ))}
                                {!myLeaves.length && <TR><TD colSpan="6" className="text-center py-10 text-slate-400">No leave requests found.</TD></TR>}
                            </TBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Apply Leave Tab */}
            {activeTab === 'apply' && (
                <div className="max-w-lg">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><PlusCircle size={18} className="text-primary-600" /> Apply for Leave</CardTitle></CardHeader>
                        <CardContent>
                            <form onSubmit={handleApplyLeave} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type *</label>
                                    <select className={inputClass} value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                                        {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date *</label>
                                        <input type="date" className={inputClass} value={startDate} onChange={e => setStartDate(e.target.value)} required />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date *</label>
                                        <input type="date" className={inputClass} value={endDate} onChange={e => setEndDate(e.target.value)} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reason (Optional)</label>
                                    <textarea rows={3} className={`${inputClass} resize-none`} placeholder="Optional reason..." value={reason} onChange={e => setReason(e.target.value)} />
                                </div>
                                <Button type="submit" className="w-full justify-center" disabled={submitting}>
                                    {submitting ? 'Submitting…' : 'Submit Leave Request'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Approve Leaves Tab */}
            {activeTab === 'approve' && isApprover && (
                <Card>
                    <CardHeader><CardTitle className="text-sm text-slate-500 uppercase tracking-widest">{approverLabel()}</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        {pendingApprovals.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                <CheckCircle2 size={40} className="text-emerald-400 mb-3" />
                                <p className="font-bold text-slate-600 dark:text-slate-400">No pending approvals!</p>
                                <p className="text-sm">You're all caught up.</p>
                            </div>
                        ) : (
                            <Table>
                                <THead><TR><TH>Employee</TH><TH>Type</TH><TH>Start</TH><TH>End</TH><TH>Reason</TH><TH>Actions</TH></TR></THead>
                                <TBody>
                                    {pendingApprovals.map(l => (
                                        <TR key={l.id}>
                                            <TD>
                                                <p className="font-bold text-slate-800 dark:text-slate-200">{l.employeeName}</p>
                                                <p className="text-xs text-slate-500">ID: {l.employeeId}</p>
                                            </TD>
                                            <TD><Badge variant="info" className="text-[10px]">{l.leaveType?.replace(/_/g, ' ')}</Badge></TD>
                                            <TD className="font-medium">{l.startDate}</TD>
                                            <TD>{l.endDate}</TD>
                                            <TD className="text-slate-500 text-xs">{l.reason || '—'}</TD>
                                            <TD>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStatusUpdate(l.id, 'APPROVED')} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Approve"><CheckCircle2 size={16} /></button>
                                                    <button onClick={() => handleStatusUpdate(l.id, 'REJECTED')} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Reject"><XCircle size={16} /></button>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </TBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default LeaveComponent
