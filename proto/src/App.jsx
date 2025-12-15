import './App.css'
import { Route, Routes } from 'react-router'
import Home from './Home'
import Admin from './Admin'
import Test from './Test'
import Auth from './Auth'

function App() {

  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/admin' element={<Admin />} />
      <Route path='/test/:id' element={<Test />} />
    </Routes>
      )
}

export default App
