import React, { useState, useEffect } from 'react'
import { checkIn, checkOut, getEmployeeAttendance, getHierarchyAttendance, approveAttendance, rejectAttendance } from '../services/AttendanceService'
import { getAllOfficeLocations, addOfficeLocation, updateOfficeLocation, deleteOfficeLocation } from '../services/OfficeLocationService'
import { getLoggedInEmployee } from '../services/EmployeeService'
import { getAllDepartments } from '../services/DepartmentService'
import { getAllTeams } from '../services/TeamService'
import Swal from 'sweetalert2'
import { LogIn, LogOut, MapPin, Building2, Clock, CheckCircle2, XCircle, AlertCircle, Pencil, Trash2, Save, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Table, THead, TBody, TR, TH, TD } from './ui/Table'
import clsx from 'clsx'

const AttendanceComponent = () => {
    const [employeeId, setEmployeeId] = useState('')
    const [attendanceLog, setAttendanceLog] = useState([])
    const [orgAttendance, setOrgAttendance] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [departmentId, setDepartmentId] = useState('')
    const [teamId, setTeamId] = useState('')
    const [departments, setDepartments] = useState([])
    const [teams, setTeams] = useState([])
    const [workMode, setWorkMode] = useState('OFFICE')
    const [officeLocations, setOfficeLocations] = useState([])
    const [officeLat, setOfficeLat] = useState('')
    const [officeLng, setOfficeLng] = useState('')
    const [officeRadius, setOfficeRadius] = useState('')
    const [editingLocId, setEditingLocId] = useState(null)
    const [loggedInEmployee, setLoggedInEmployee] = useState(null)
    const [currentDist, setCurrentDist] = useState(null)
    const [locationStatus, setLocationStatus] = useState('FETCHING') // FETCHING, OK, TOO_FAR, DENIED
    const role = sessionStorage.getItem('role') || ''
    const isAdmin = role.includes('ADMIN')
    const isManager = role.includes('MANAGER')
    const isTeamLeader = role.includes('TEAM_LEADER')
    const isApprover = isAdmin || isManager || isTeamLeader

    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const self = res.data.data
            setLoggedInEmployee(self); setEmployeeId(self.id)
            if (!isAdmin) fetchLogs(self.id)
        }).catch(err => console.error('Employee profile not found', err))
        if (isApprover) {
            getAllDepartments().then(r => setDepartments(r.data.data.content || r.data.data || []))
            getAllTeams().then(r => setTeams(r.data.data.content || r.data.data || []))
        }
        fetchOfficeLocations()
    }, [])

    useEffect(() => { if (isApprover) fetchHierarchy(selectedDate, departmentId, teamId) }, [selectedDate, departmentId, teamId])
    useEffect(() => { setTeamId('') }, [departmentId])

    function fetchOfficeLocations() {
        getAllOfficeLocations().then(res => setOfficeLocations(res.data.data || [])).catch(console.error)
    }
    function fetchLogs(id) {
        if (!id) return
        getEmployeeAttendance(id).then(res => setAttendanceLog(res.data.data)).catch(console.error)
    }
    function fetchHierarchy(date, deptId, tId) {
        if (!date) return
        getHierarchyAttendance(date, deptId, tId).then(res => setOrgAttendance(res.data.data)).catch(console.error)
    }

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180;
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;
        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // in metres
    }

    const checkGeofence = (lat, lng, locations) => {
        if (!locations || locations.length === 0) return { ok: true, dist: null };
        let minDist = Infinity;
        let isInside = false;
        locations.forEach(loc => {
            const d = calculateDistance(loc.latitude, loc.longitude, lat, lng);
            if (d < minDist) minDist = d;
            if (d <= (loc.radiusMeters || 250)) isInside = true;
        });
        return { ok: isInside, dist: minDist };
    }

    useEffect(() => {
        if (workMode === 'OFFICE' && !isAdmin && officeLocations.length > 0) {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const { ok, dist } = checkGeofence(latitude, longitude, officeLocations);
                        setCurrentDist(dist);
                        setLocationStatus(ok ? 'OK' : 'TOO_FAR');
                    },
                    () => setLocationStatus('DENIED'),
                    { enableHighAccuracy: true }
                );
            }
        } else {
            setLocationStatus('SKIP');
        }
    }, [workMode, officeLocations]);

    function handleCheckIn() {
        if (!employeeId) { Swal.fire('Error', 'Employee ID not found.', 'error'); return }
        const proc = (lat = null, lng = null) =>
            checkIn(employeeId, { workMode, latitude: lat, longitude: lng })
                .then(() => { Swal.fire({ icon: 'success', title: workMode === 'REMOTE' ? 'Check-In Requested!' : 'Checked In!', showConfirmButton: false, timer: 2000 }); fetchLogs(employeeId) })
                .catch(err => Swal.fire('Failed', err.response?.data?.message || err.message, 'error'))
        if (workMode === 'OFFICE') {
            if ('geolocation' in navigator)
                navigator.geolocation.getCurrentPosition(p => proc(p.coords.latitude, p.coords.longitude), () => Swal.fire('Location Required', 'Please enable GPS.', 'warning'))
            else Swal.fire('Error', 'Geolocation not supported.', 'error')
        } else { proc() }
    }

    function handleCheckOut() {
        if (!employeeId) { Swal.fire('Error', 'Employee ID not found.', 'error'); return }
        checkOut(employeeId).then(() => { Swal.fire({ icon: 'success', title: 'Checked Out!', showConfirmButton: false, timer: 1500 }); fetchLogs(employeeId) })
            .catch(err => Swal.fire('Failed', err.response?.data?.message || err.message, 'error'))
    }

    function handleApprove(id) {
        approveAttendance(id).then(() => { Swal.fire({ icon: 'success', title: 'Approved', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 }); fetchHierarchy(selectedDate, departmentId, teamId) })
            .catch(() => Swal.fire('Error', 'Could not approve', 'error'))
    }
    function handleReject(id) {
        rejectAttendance(id).then(() => { Swal.fire({ icon: 'success', title: 'Rejected', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 }); fetchHierarchy(selectedDate, departmentId, teamId) })
            .catch(() => Swal.fire('Error', 'Could not reject', 'error'))
    }

    function handleSaveOfficeLocation() {
        if (!officeLat || !officeLng || !officeRadius) { Swal.fire('Error', 'All fields required', 'error'); return }
        const dto = { latitude: parseFloat(officeLat), longitude: parseFloat(officeLng), radiusMeters: parseFloat(officeRadius) }
        const action = editingLocId ? updateOfficeLocation(editingLocId, dto) : addOfficeLocation(dto)
        action.then(() => {
            Swal.fire({ icon: 'success', title: editingLocId ? 'Updated' : 'Added', toast: true, position: 'top-end', showConfirmButton: false, timer: 2000 })
            setEditingLocId(null); setOfficeLat(''); setOfficeLng(''); setOfficeRadius('')
            fetchOfficeLocations()
        }).catch(err => Swal.fire('Error', err.response?.data?.message || 'Failed', 'error'))
    }

    function handleDeleteOffice(id) {
        Swal.fire({ title: 'Delete location?', text: 'Cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Delete' })
            .then(r => { if (r.isConfirmed) deleteOfficeLocation(id).then(() => { Swal.fire('Deleted!', '', 'success'); fetchOfficeLocations() }).catch(() => Swal.fire('Error', 'Failed', 'error')) })
    }

    const statusVariant = s => ({ LATE: 'danger', HALF_DAY: 'warning', PENDING_APPROVAL: 'info', PRESENT: 'success' })[s] || 'neutral'
    const inputClass = "px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-900 dark:text-white transition-all w-full"

    return (
        <div className="space-y-6">
            {/* Clock-In Panel */}
            {!isAdmin && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Clock size={18} className="text-primary-600" /> Attendance Dashboard</CardTitle></CardHeader>
                    <CardContent>
                        {employeeId ? (
                            <div className="space-y-5">
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Work Mode</p>
                                    <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl gap-1">
                                        {['OFFICE', 'REMOTE'].map(mode => (
                                            <button key={mode} onClick={() => setWorkMode(mode)}
                                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${workMode === mode ? 'bg-white dark:bg-slate-700 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                                {mode === 'OFFICE' ? <><Building2 size={14} className="inline mr-1.5" />Office</> : <><MapPin size={14} className="inline mr-1.5" />Remote</>}
                                            </button>
                                        ))}
                                    </div>
                                    
                                    {workMode === 'OFFICE' && (
                                        <div className="mt-4 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Proximity</p>
                                                {locationStatus === 'FETCHING' ? (
                                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary-500 animate-pulse">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Locating...
                                                    </span>
                                                ) : locationStatus === 'OK' ? (
                                                    <Badge variant="success" className="text-[9px] uppercase">Inside Range</Badge>
                                                ) : locationStatus === 'TOO_FAR' ? (
                                                    <Badge variant="danger" className="text-[9px] uppercase">Too Far</Badge>
                                                ) : (
                                                    <Badge variant="neutral" className="text-[9px] uppercase">GPS Disabled</Badge>
                                                ) }
                                            </div>
                                            
                                            <div className="flex items-center gap-3">
                                                <div className={clsx(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                    locationStatus === 'OK' ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" :
                                                    locationStatus === 'TOO_FAR' ? "bg-red-100 dark:bg-red-900/30 text-red-600" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                                )}>
                                                    <MapPin size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                        {currentDist !== null ? (currentDist > 1000 ? `${(currentDist/1000).toFixed(2)} km` : `${Math.round(currentDist)}m`) : '—'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        {locationStatus === 'OK' ? 'You are within the 250m safe zone.' : 
                                                         locationStatus === 'TOO_FAR' ? 'Please move closer to the office.' : 'Enable GPS to verify location.'}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => setWorkMode('OFFICE')} // Triggers useEffect
                                                    className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                                                    title="Refresh Location"
                                                >
                                                    <Clock size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {workMode === 'REMOTE' && <p className="text-sm text-amber-600 dark:text-amber-400 mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 font-medium">⚠️ Remote attendance requires Team Lead approval.</p>}
                                </div>
                                <div className="flex gap-4">
                                    <Button onClick={handleCheckIn} 
                                        disabled={workMode === 'OFFICE' && locationStatus !== 'OK'}
                                        className="flex-1 justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale">
                                        <LogIn size={18} /> Clock In
                                    </Button>
                                    <Button onClick={handleCheckOut} variant="outline" className="flex-1 justify-center gap-2 border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20"><LogOut size={18} /> Clock Out</Button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-red-700 dark:text-red-400"><AlertCircle size={18} /> Identity not verified as Employee.</div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* My Attendance History */}
            {!isAdmin && (
                <Card>
                    <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Clock size={15} className="text-slate-400" /> Your Attendance History</CardTitle></CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <THead><TR><TH>Date</TH><TH>Check In</TH><TH>Check Out</TH><TH>Status</TH></TR></THead>
                            <TBody>
                                {attendanceLog.map((log, i) => (
                                    <TR key={log.id || i}>
                                        <TD className="font-medium">{log.date}</TD>
                                        <TD>{log.checkIn || '—'}</TD>
                                        <TD>{log.checkOut || '—'}</TD>
                                        <TD><Badge variant={statusVariant(log.status)}>{log.status?.replace(/_/g, ' ')}</Badge></TD>
                                    </TR>
                                ))}
                                {!attendanceLog.length && <TR><TD colSpan="4" className="text-center py-10 text-slate-400">No attendance records found.</TD></TR>}
                            </TBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Org Attendance (Approvers) */}
            {isApprover && (
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                            <CardTitle className="text-sm flex-1 flex items-center gap-2"><Building2 size={15} className="text-slate-400" /> Organizational Attendance</CardTitle>
                            <div className="flex flex-wrap gap-2">
                                <input type="date" className={`${inputClass} w-auto`} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
                                {isAdmin && <select className={`${inputClass} w-auto`} value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Departments</option>
                                    {departments.map(d => <option key={d.id} value={d.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{d.name}</option>)}
                                </select>}
                                {(isAdmin || isManager) && <select className={`${inputClass} w-auto`} value={teamId} onChange={e => setTeamId(e.target.value)}>
                                    <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">All Teams</option>
                                    {teams.filter(t => isAdmin ? (!departmentId || t.departmentId === Number(departmentId)) : t.departmentId === loggedInEmployee?.departmentId).map(t => <option key={t.id} value={t.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{t.name}</option>)}
                                </select>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <THead><TR><TH>Employee</TH><TH>Date</TH><TH>Check In</TH><TH>Check Out</TH><TH>Status</TH><TH>Action</TH></TR></THead>
                            <TBody>
                                {orgAttendance.map((log, i) => (
                                    <TR key={log.id || i}>
                                        <TD><p className="font-bold text-slate-800 dark:text-slate-200">{log.employeeName}</p><p className="text-xs text-slate-500">{log.isManager ? 'Manager' : log.isTeamLeader ? 'Team Lead' : 'Staff'}</p></TD>
                                        <TD>{log.date}</TD><TD>{log.checkIn || '—'}</TD><TD>{log.checkOut || '—'}</TD>
                                        <TD><Badge variant={statusVariant(log.status)}>{log.status?.replace(/_/g, ' ')}</Badge></TD>
                                        <TD>
                                            {log.status === 'PENDING_APPROVAL' ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprove(log.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"><CheckCircle2 size={16} /></button>
                                                    <button onClick={() => handleReject(log.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><XCircle size={16} /></button>
                                                </div>
                                            ) : <span className="text-slate-400 text-xs">{log.remarks || '—'}</span>}
                                        </TD>
                                    </TR>
                                ))}
                                {!orgAttendance.length && <TR><TD colSpan="6" className="text-center py-10 text-slate-400">No records for this date.</TD></TR>}
                            </TBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {/* Office Location (Admin) */}
            {isAdmin && (
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} className="text-primary-600" /> Office Location Management</CardTitle></CardHeader>
                    <CardContent className="space-y-5">
                        {officeLocations.length > 0 ? (
                            <Table>
                                <THead><TR><TH>ID</TH><TH>Latitude</TH><TH>Longitude</TH><TH>Radius</TH><TH>Actions</TH></TR></THead>
                                <TBody>
                                    {officeLocations.map(loc => (
                                        <TR key={loc.id}>
                                            <TD className="font-mono text-xs">{loc.id}</TD>
                                            <TD>{loc.latitude}</TD><TD>{loc.longitude}</TD><TD>{loc.radiusMeters}m</TD>
                                            <TD>
                                                <div className="flex gap-2">
                                                    <button onClick={() => { setEditingLocId(loc.id); setOfficeLat(loc.latitude); setOfficeLng(loc.longitude); setOfficeRadius(loc.radiusMeters) }} className="p-1.5 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Pencil size={14} /></button>
                                                    <button onClick={() => handleDeleteOffice(loc.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={14} /></button>
                                                </div>
                                            </TD>
                                        </TR>
                                    ))}
                                </TBody>
                            </Table>
                        ) : <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-700 dark:text-amber-400 text-sm"><AlertCircle size={16} /> No office locations defined.</div>}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">{editingLocId ? 'Edit Location' : 'Add New Location'}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Latitude</label><input type="number" step="any" placeholder="28.6139" className={inputClass} value={officeLat} onChange={e => setOfficeLat(e.target.value)} /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Longitude</label><input type="number" step="any" placeholder="77.2090" className={inputClass} value={officeLng} onChange={e => setOfficeLng(e.target.value)} /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Radius (m)</label><input type="number" placeholder="100" className={inputClass} value={officeRadius} onChange={e => setOfficeRadius(e.target.value)} /></div>
                                <div className="flex items-end gap-2">
                                    <Button onClick={handleSaveOfficeLocation} className="flex-1 justify-center gap-1.5"><Save size={14} /> {editingLocId ? 'Update' : 'Add'}</Button>
                                    {editingLocId && <Button variant="ghost" onClick={() => { setEditingLocId(null); setOfficeLat(''); setOfficeLng(''); setOfficeRadius('') }}><X size={14} /></Button>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export default AttendanceComponent
