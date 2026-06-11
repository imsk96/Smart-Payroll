import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./components/Dashboard";
import Staff from "./pages/Staff";
import Upload from "./pages/Upload";
import Attendance from "./pages/Attendance";
import Salary from "./pages/Salary";
import Settings from "./pages/Settings";

function App(){

return (

<BrowserRouter>

<Routes>

<Route path="/" element={<Dashboard/>}/>

<Route path="/staff" element={<Staff/>}/>

<Route path="/upload" element={<Upload/>}/>

<Route path="/attendance" element={<Attendance/>}/>

<Route path="/salary" element={<Salary/>}/>

<Route path="/settings" element={<Settings/>}/>


</Routes>

</BrowserRouter>

)

}

export default App;