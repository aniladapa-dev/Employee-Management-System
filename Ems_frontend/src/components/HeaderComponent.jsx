import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const HeaderComponent = () => {
  const navigate = useNavigate();

  
  const [theme, setTheme] = useState("light");

  
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm px-4">

      
      <span
        className="navbar-brand fw-bold text-primary"
        style={{ cursor: "pointer" }}
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

          <li className="nav-item">
            <NavLink className="nav-link" to="/employees">Employees</NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link" to="/add-employee">Create</NavLink>
          </li>
        </ul>

        
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={toggleTheme}
          >
            {theme === "light" ? "🌙 Dark" : "☀ Light"}
          </button>

          <button
            className="btn btn-primary px-4"
            onClick={() => navigate("/employees")}
          >
            Dashboard
          </button>
        </div>

      </div>
    </nav>
  );
};

export default HeaderComponent;
