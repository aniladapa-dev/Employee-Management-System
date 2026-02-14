import './App.css';
import EmployeeComponent from './components/EmployeeComponent';
import FooterComponent from "./components/FooterComponent";
import HeaderComponent from "./components/HeaderComponent";
import ListEmployeeComponent from "./components/ListEmployeeComponent";
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">

        <HeaderComponent />

        <main className="content">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/employees' element={<ListEmployeeComponent />} />
            <Route path='/add-employee' element={<EmployeeComponent />} />
            <Route path='/edit-employee/:id' element={<EmployeeComponent />} />
          </Routes>
        </main>

        <FooterComponent />

      </div>
    </BrowserRouter>
  );
}

export default App;
