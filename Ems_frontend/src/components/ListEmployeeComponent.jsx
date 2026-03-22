import React, { useEffect, useState } from "react"
import { deleteEmployee, listEmployees, getLoggedInEmployee } from "../services/EmployeeService";
import { getAllDepartments } from "../services/DepartmentService";
import { getAllTeams } from "../services/TeamService";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import { 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from './ui/Table';

const ListEmployeeComponent = () => {
    
    const [employees, setEmployees] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [teamId, setTeamId] = useState('');
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userContext, setUserContext] = useState(null);
    
    const role = sessionStorage.getItem('role') || '';
    const isAdmin = role.includes('ADMIN');

    const navigator = useNavigate();
    
    useEffect(() => {
        getLoggedInEmployee().then(res => {
            const context = res.data.data;
            setUserContext(context);
            if (role === 'ROLE_TEAM_LEADER' && context.teamId) {
                setTeamId(context.teamId.toString());
                setDepartmentId(context.departmentId ? context.departmentId.toString() : '');
            } else if (role.includes('MANAGER') && context.departmentId) {
                setDepartmentId(context.departmentId.toString());
                getAllTeams(context.departmentId).then(r => setTeams(r.data.data.content || r.data.data || []));
            } else if (isAdmin) {
                getAllDepartments().then(r => setDepartments(r.data.data.content || r.data.data || []));
                getAllTeams().then(r => setTeams(r.data.data.content || r.data.data || []));
            }
        });
    }, [])

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            getAllEmployees();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery, departmentId, teamId])

    function getAllEmployees() {
        setLoading(true);
        listEmployees(searchQuery, departmentId, teamId).then((response) => {
            setEmployees(response.data.data.content || [])
            setLoading(false);
        }).catch(error => {
            console.error(error)
            setLoading(false);
        })
    }

    function removeEmployee(id) {
        const isDark = document.documentElement.classList.contains('dark');
        Swal.fire({
            title: 'Are you sure?',
            text: "All associated records (attendance/leaves/salary) will be permanently deleted!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete it!',
            background: isDark ? '#0f172a' : '#ffffff',
            color: isDark ? '#f8fafc' : '#0f172a'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteEmployee(id).then(() => {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: 'Employee record removed successfully.',
                        timer: 2000,
                        showConfirmButton: false,
                        background: isDark ? '#0f172a' : '#ffffff',
                        color: isDark ? '#f8fafc' : '#0f172a'
                    });
                    getAllEmployees();
                }).catch(error => {
                    console.error(error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Could not delete employee',
                        background: isDark ? '#0f172a' : '#ffffff',
                        color: isDark ? '#f8fafc' : '#0f172a'
                    });
                });
            }
        });
    }

    const getInitials = (first, last) => {
      return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`.toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Employees</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Manage and monitor all workforce members</p>
              </div>
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <Button onClick={() => navigator('/add-employee')}>
                    <UserPlus size={16} className="mr-2" /> Add Employee
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Bar */}
            <Card className="bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Search by name, email or ID..." 
                      className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <select 
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-600 dark:text-slate-400"
                        value={departmentId}
                        onChange={e => setDepartmentId(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  )}
                  {role !== 'ROLE_TEAM_LEADER' && (
                    <div className={isAdmin ? "" : "md:col-span-2"}>
                      <select 
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-slate-600 dark:text-slate-400"
                        value={teamId}
                        onChange={e => setTeamId(e.target.value)}
                      >
                        <option value="">{role.includes('MANAGER') ? 'All My Teams' : 'All Teams'}</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Employee Table */}
            <Card>
              <Table>
                <THead>
                  <TR>
                    <TH>Employee</TH>
                    <TH>ID</TH>
                    <TH>Designation</TH>
                    <TH>Department</TH>
                    <TH>Skills</TH>
                    <TH className="text-right">Actions</TH>
                  </TR>
                </THead>
                <TBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TR key={i}>
                        <TD colSpan={6}>
                          <div className="h-12 w-full bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-lg" />
                        </TD>
                      </TR>
                    ))
                  ) : employees.length > 0 ? (
                    employees.map(employee => (
                      <TR key={employee.id}>
                        <TD>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs ring-2 ring-white dark:ring-slate-900">
                              {getInitials(employee.firstName, employee.lastName)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </TD>
                        <TD>
                          <Badge variant="neutral" className="font-mono">#{employee.id}</Badge>
                        </TD>
                        <TD className="font-medium text-slate-700 dark:text-slate-300">
                          {employee.designation || 'N/A'}
                        </TD>
                        <TD>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{employee.departmentName || 'N/A'}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">{employee.teamName || 'Organisational'}</span>
                          </div>
                        </TD>
                        <TD>
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {employee.skills && employee.skills.slice(0, 2).map((skill, idx) => (
                              <Badge key={idx} variant="info" className="text-[10px] px-1.5 py-0">
                                {skill}
                              </Badge>
                            ))}
                            {employee.skills?.length > 2 && (
                               <Badge variant="neutral" className="text-[10px] px-1.5 py-0">
                                 +{employee.skills.length - 2}
                               </Badge>
                            )}
                            {(!employee.skills || employee.skills.length === 0) && '-'}
                          </div>
                        </TD>
                        <TD>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => navigator(`/profile/${employee.id}`)} title="View Profile">
                              <Eye size={16} />
                            </Button>
                            {isAdmin && (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => navigator(`/edit-employee/${employee.id}`)} title="Edit">
                                  <Edit3 size={16} className="text-blue-500" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => removeEmployee(employee.id)} title="Delete">
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
                      <TD colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400">
                            <Search size={32} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">No employees found</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); isAdmin && setDepartmentId(''); setTeamId(''); }}>
                            Clear All Filters
                          </Button>
                        </div>
                      </TD>
                    </TR>
                  )}
                </TBody>
              </Table>
              
              {/* Results Count */}
              {!loading && employees.length > 0 && (
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-sm text-slate-500 font-medium text-center w-full">
                    Showing <span className="text-slate-900 dark:text-white font-bold">{employees.length}</span> results
                  </p>
                </div>
              )}
            </Card>
        </div>
    )
}

export default ListEmployeeComponent