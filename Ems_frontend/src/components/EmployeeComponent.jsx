import React, { useEffect, useState } from 'react'
import { createEmployee, getEmployee, updateEmployee } from '../services/EmployeeService'
import { useNavigate, useParams } from 'react-router-dom'
import { getAllDepartments } from '../services/DepartmentService'
import { getAllTeams } from '../services/TeamService'
import Swal from 'sweetalert2'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  ShieldCheck, 
  Lock, 
  ChevronLeft,
  Wrench,
  Building2,
  Users as UsersIcon
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const EmployeeComponent = () => {

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('ROLE_EMPLOYEE')
  const [departmentId, setDepartmentId] = useState('')
  const [teamId, setTeamId] = useState('')
  const [phone, setPhone] = useState('')
  const [designation, setDesignation] = useState('')
  const [joiningDate, setJoiningDate] = useState('')
  const [address, setAddress] = useState('')
  const [departments, setDepartments] = useState([])
  const [teams, setTeams] = useState([])
  const [skills, setSkills] = useState('')
  const [loading, setLoading] = useState(false)

  const navigator = useNavigate()
  const {id} = useParams()

  const [errors, setErrors] = useState({
    firstName : '',
    lastName : '',
    email : '',
    username: '',
    password: ''
  })

  useEffect(() => {
    getAllDepartments().then(res => setDepartments(res.data.data.content || [])).catch(err => console.error(err))
    getAllTeams().then(res => setTeams(res.data.data.content || [])).catch(err => console.error(err))

    if(id){
      getEmployee(id).then((response) => {
        const data = response.data.data;
        setFirstName(data.firstName || '');
        setLastName(data.lastName || '');
        setEmail(data.email || '');
        setDepartmentId(data.departmentId || '');
        setTeamId(data.teamId || '');
        if (data.username) setUsername(data.username);
        if (data.role) setRole(data.role);
        setPhone(data.phone || '');
        setDesignation(data.designation || '');
        setJoiningDate(data.joiningDate || '');
        setAddress(data.address || '');
        if (data.skills) setSkills(data.skills.join(', '));
      }).catch(error => {
        console.error(error);
      })
    }

  }, [id])

  function saveOrUpdateEmployee(e) {
    e.preventDefault();
  
    if (validateForm()) {
      setLoading(true);
      const employee = {
        firstName,
        lastName,
        email,
        username,
        password,
        role,
        departmentId: departmentId ? Number(departmentId) : null,
        teamId: teamId ? Number(teamId) : null,
        phone,
        designation,
        joiningDate,
        address,
        skills: skills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
  
      const successToast = (msg) => {
        Swal.fire({
          icon: 'success',
          title: msg,
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          background: '#f8fafc',
          color: '#0f172a'
        });
      };

      if (id) {
        updateEmployee(id, employee).then(() => {
          setLoading(false);
          successToast('Employee updated successfully');
          navigator("/employees");
        }).catch(err => {
          setLoading(false);
          Swal.fire('Error', err.response?.data?.message || 'Update failed', 'error');
        });
      } else {
        createEmployee(employee).then(() => {
          setLoading(false);
          successToast('Employee created successfully');
          navigator("/employees");
        }).catch(err => {
          setLoading(false);
          Swal.fire('Error', err.response?.data?.message || 'Creation failed', 'error');
        });
      }
    }
  }

  function validateForm(){
    let valid = true;
    const errorsCopy = { firstName: '', lastName: '', email: '', username: '', password: '' };

    if (!firstName.trim()) {
      errorsCopy.firstName = "First name is required";
      valid = false;
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          errorsCopy.email = "Enter a valid email address";
          valid = false;
      }
    } else {
        errorsCopy.email = "Email is required";
        valid = false;
    }

    if (!id) {
        if (!username.trim()) {
            errorsCopy.username = "Username is required";
            valid = false;
        }
        if (!password.trim()) {
            errorsCopy.password = "Password is required";
            valid = false;
        }
    }

    setErrors(errorsCopy);
    return valid;
  }
  

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigator('/employees')} className="rounded-full w-10 h-10 p-0">
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {id ? 'Update Employee' : 'Add New Employee'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {id ? `Modifying records for employee ID #${id}` : 'Create a new profile in the organization'}
            </p>
          </div>
        </div>
        <Badge variant={id ? 'info' : 'success'} className="px-4 py-1.5 uppercase tracking-widest animate-pulse">
          {id ? 'Editing Mode' : 'New Entry'}
        </Badge>
      </div>

      <form onSubmit={saveOrUpdateEmployee} className="space-y-8">
        {/* Section 1: Personal Details */}
        <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-primary-600">
              <User size={18} />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Personal Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="First Name" icon={User} error={errors.firstName}>
              <input 
                type="text"
                placeholder="John"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.firstName ? 'border-red-300 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium`}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </InputGroup>

            <InputGroup label="Last Name" icon={User} error={errors.lastName}>
              <input 
                type="text"
                placeholder="Doe"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </InputGroup>

            <InputGroup label="Email Address" icon={Mail} error={errors.email}>
              <input 
                type="email"
                placeholder="john.doe@company.com"
                className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-300 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </InputGroup>

            <InputGroup label="Phone Number" icon={Phone}>
              <input 
                type="text"
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </InputGroup>

            <div className="md:col-span-2">
              <InputGroup label="Residential Address" icon={MapPin}>
                <textarea 
                  placeholder="Enter full residential address..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all font-medium resize-none"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </InputGroup>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Work & Role */}
        <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 text-emerald-600">
              <Briefcase size={18} />
              <CardTitle className="text-sm font-black uppercase tracking-widest">Professional Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputGroup label="Designation" icon={Briefcase}>
              <input 
                type="text"
                placeholder="Senior Software Engineer"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
              />
            </InputGroup>

            <InputGroup label="Joining Date" icon={Calendar}>
              <input 
                type="date"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
              />
            </InputGroup>

            <InputGroup label="Access Role" icon={ShieldCheck}>
              <select 
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                value={role}
                onChange={(e) => {
                    setRole(e.target.value);
                    setDepartmentId('');
                    setTeamId('');
                }}
              >
                  <option value="ROLE_EMPLOYEE">Standard Employee</option>
                  <option value="ROLE_TEAM_LEADER">Team Leader</option>
                  <option value="ROLE_MANAGER">Manager / Head</option>
                  <option value="ROLE_ADMIN">System Administrator</option>
              </select>
            </InputGroup>

            { role === 'ROLE_MANAGER' && (
                <InputGroup label="Managed Department" icon={Building2}>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                    value={departmentId}
                    onChange={(e) => {
                        setDepartmentId(e.target.value);
                        setTeamId('');
                    }}
                  >
                      <option value="">Select Department</option>
                      {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                  </select>
                </InputGroup>
            )}

            { (role === 'ROLE_EMPLOYEE' || role === 'ROLE_TEAM_LEADER') && (
                <InputGroup label="Assigned Team" icon={UsersIcon}>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium appearance-none"
                    value={teamId}
                    onChange={(e) => {
                        setTeamId(e.target.value);
                        setDepartmentId('');
                    }}
                  >
                      <option value="">Select Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} {team.departmentName ? `(${team.departmentName})` : ''}
                        </option>
                      ))}
                  </select>
                </InputGroup>
            )}

            <div className="md:col-span-2">
              <InputGroup label="Skills & Expertise" icon={Wrench}>
                <input 
                  type="text"
                  placeholder="Java, React, Spring Boot, AWS..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest italic">Separate skills with commas</p>
              </InputGroup>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Authentication (Only for New Entry) */}
        {!id && (
          <Card className="overflow-hidden border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900">
            <CardHeader className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
               <div className="flex items-center gap-2 text-amber-600">
                <Lock size={18} />
                <CardTitle className="text-sm font-black uppercase tracking-widest">Login Credentials</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <InputGroup label="Username" icon={User} error={errors.username}>
                <input 
                  type="text"
                  placeholder="johndoe123"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.username ? 'border-red-300 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium`}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </InputGroup>

              <InputGroup label="Password" icon={Lock} error={errors.password}>
                <input 
                  type="password"
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.password ? 'border-red-300 ring-4 ring-red-500/10' : 'border-slate-200 dark:border-slate-800'} rounded-xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </InputGroup>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <Button type="button" variant="outline" onClick={() => navigator('/employees')}>
            Cancel & Discard
          </Button>
          <Button type="submit" loading={loading} className="px-12">
            {id ? 'Save Changes' : 'Create Account'}
          </Button>
        </div>
      </form>
    </div>
  )
}


const InputGroup = ({ label, icon: Icon, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
    </label>
    {children}
    {error && <p className="text-[10px] font-bold text-red-500 mt-1">{error}</p>}
  </div>
);

export default EmployeeComponent;
