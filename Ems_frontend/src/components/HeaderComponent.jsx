import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isUserLoggedIn, logout, getLoggedInUser, isAdminUser } from "../services/auth/AuthService";
import ChangePasswordModal from "./ChangePasswordModal";

const HeaderComponent = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState(localStorage.getItem('ems-theme') || "light");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    localStorage.setItem('ems-theme', theme);
  }, [theme]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.nav-item.dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const isAuth = isUserLoggedIn();
  const isAdmin = isAdminUser();
  const user = getLoggedInUser();

  function handleLogout() {
    logout();
    navigate('/login');
    setShowDropdown(false);
  }

  return (
    <>
      <nav className="navbar navbar-expand-lg border-bottom sticky-top">
        <div className="container-fluid">
          <span
            className="navbar-brand fw-extrabold text-primary"
            style={{ cursor: "pointer", letterSpacing: '-1px' }}
            onClick={() => navigate("/")}
          >
            EMS
          </span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto gap-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>

            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/employees">Employees</NavLink>
              </li>
            )}

            {isAdmin && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/departments">Departments</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/teams">Teams</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/reports">Reports</NavLink>
                </li>
              </>
            )}

            {isAuth && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/announcements">Announcements</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/leaves">Leaves</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/attendance">Attendance</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/salaries">Salaries</NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/profile">Profile</NavLink>
                </li>
              </>
            )}
          </ul>

          <ul className="navbar-nav gap-2 align-items-center">
            {!isAuth && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/login">Login</NavLink>
              </li>
            )}

            {isAuth && (
              <li className={`nav-item dropdown ${showDropdown ? 'show' : ''}`}>
                <button
                  className="btn btn-outline-primary btn-sm dropdown-toggle"
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {user}
                </button>
                <ul className={`dropdown-menu dropdown-menu-end shadow ${showDropdown ? 'show' : ''}`} 
                    style={{ position: 'absolute', right: 0 }}>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        navigate('/profile');
                        setShowDropdown(false);
                      }}
                    >
                      My Profile
                    </button>
                  </li>
                  <li>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setShowChangePassword(true);
                        setShowDropdown(false);
                      }}
                    >
                      Change Password
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      Logout
                    </button>
                  </li>
                </ul>
              </li>
            )}
          </ul>


          <div className="d-flex align-items-center gap-2 ms-3">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={toggleTheme}
            >
              {theme === "light" ? "Dark" : "Light"}
            </button>
          </div>
        </div>
        </div>
      </nav>

      {showChangePassword && (
        <ChangePasswordModal onClose={() => setShowChangePassword(false)} />
      )}
    </>
  );
};

export default HeaderComponent;
