import React from 'react'
import { Outlet, useLocation } from 'react-router'
import Navbar from "../Shared/Navbar"
import Footer from '../Shared/Footer'

const MainLayout = () => {
  const {pathname} = useLocation()
  return (
    <div className='max-w-[1480px] mx-auto'> 
      <div>
        <div>
             {/* Hide Navbar if pathname starts with /dashboard */}
        {!pathname.startsWith('/dashboard') && <Navbar />}
        </div>
        <div className='min-h-svh'>
            <Outlet/>
        </div>
        <div>
            <Footer/>
        </div>
      </div>
    </div>
  )
}

export default MainLayout
