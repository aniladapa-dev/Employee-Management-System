import React from 'react'
import { useNavigate } from 'react-router-dom'


const Home = () => {

    const navigate = useNavigate()

    return (
    <div className='container text-center mt-5'>
        <h1 className="fw-bold display-5">
        Manage Your Workforce <span className="text-primary">Smarter</span>
        </h1>

        <p className="text-muted fs-5 mt-3">
        A modern Employee Management System built with Spring Boot & React.
        </p>


        <div className="row mt-5">
            <div className="col-md-4">
                <div className="card shadow-sm p-3">
                <h2 className="text-primary">120+</h2>
                <p className="text-muted">Employees Managed</p>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow-sm p-3">
                <h2 className="text-success">8</h2>
                <p className="text-muted">Departments</p>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow-sm p-3">
                <h2 className="text-warning">24/7</h2>
                <p className="text-muted">System Availability</p>
                </div>
            </div>
        </div>

        <div className="row mt-5">
            <div className="col-md-3">
                <div className="card h-100 shadow-sm text-center p-3">
                <h5> Add Employees</h5>
                <p className="text-muted">
                    Quickly onboard new employees with validated forms.
                </p>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 shadow-sm text-center p-3">
                <h5> Update Records</h5>
                <p className="text-muted">
                    Keep employee information accurate and up to date.
                </p>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 shadow-sm text-center p-3">
                <h5> Remove Employees</h5>
                <p className="text-muted">
                    Handle employee exits cleanly and securely.
                </p>
                </div>
            </div>

            <div className="col-md-3">
                <div className="card h-100 shadow-sm text-center p-3">
                <h5> REST APIs</h5>
                <p className="text-muted">
                    Powered by scalable Spring Boot REST services.
                </p>
                </div>
            </div>
        </div>

        <button
            className="btn btn-primary btn-lg mt-5 px-5"
            onClick={() => navigate("/employees")}
            >
            Launch Dashboard 
        </button>



    </div>
    )
}

export default Home