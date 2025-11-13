import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import AvailableFoods from './pages/AvailableFoods.jsx'
import FoodDetails from './pages/FoodDetails.jsx'
import AddFood from './pages/AddFood.jsx'
import ManageFoods from './pages/ManageFoods.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'
import ProtectedRoute from './auth/ProtectedRoute.jsx'

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/foods' element={<AvailableFoods />} />
        <Route
          path='/food/:id'
          element={
            <ProtectedRoute>
              <FoodDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path='/add-food'
          element={
            <ProtectedRoute>
              <AddFood />
            </ProtectedRoute>
          }
        />
        <Route
          path='/manage-foods'
          element={
            <ProtectedRoute>
              <ManageFoods />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default App
