import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser, reset } from '../features/authSlice'

const Sidebar = ({ children }) => {
  const [open, setOpen] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const logout = () => {
    dispatch(logoutUser())
    dispatch(reset())
    navigate("/")
  }

  return (
    <React.Fragment>
      <div className='w-full flex h-full'>
        <div className={`${open ? 'w-1/6' : 'w-1/12'}`}>
          <div className='flex h-full'>
            {/* Sidebar */}
            <div className={`${open ? "w-full" : "w-20"} duration-300`} style={{ backgroundColor: '#f5f5f5' }} > {/* Light gray background */}
              <span className={`absolute cursor-pointer rounded-full -right-3 top-20 border-2 bg-white border-sky-700 ${!open && "rotate-180"}`} onClick={() => setOpen(!open)}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </span>

              <div className='flex gap-x-4 items-center'>
                <span className='bg-transparent rounded p-2.5 m-2'>
                  <img 
                    src="/admin.svg" // Ganti dengan path gambar Anda
                    alt="Icon persediaan" // Deskripsi gambar
                    className="w-12 h-12 ml-3" // Ukuran gambar dan margin kanan
                  />
                </span>
                <h1 className={`flex text-black origin-left font-bold text-xl duration-300 ${!open && 'scale-0'}`}>Ruang Admin</h1>
              </div>

              <ul className='pt-6'>
                <NavLink to='/dashboard'>
                  <li className={`flex text-black items-center gap-x-4 cursor-pointer p-4 hover:bg-red-400 rounded m-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21H3V10.5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 21h6v-6H9v6z" />
</svg>
                    <p className={`${!open && "hidden"} text-black font-medium px-4 origin-left duration-200`}>Stock Persediaan</p>
                  </li>
                </NavLink>

                <NavLink to='/pesanan'>
                  <li className={`flex text-black items-center gap-x-4 cursor-pointer p-4 hover:bg-red-400 rounded m-3`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l1 9h12l1-9h2M3 3l1 9m0 0h2m-2 0h4m0 0h12m0 0h2M7 21a2 2 0 100 4 2 2 0 000-4zm10 0a2 2 0 100 4 2 2 0 000-4z" />
</svg>
                    <p className={`${!open && "hidden"} font-medium px-4 origin-left duration-200`}>Daftar Pesanan</p>
                  </li>
                </NavLink>

                <NavLink to='/selesai'>
                  <li className={`flex text-black items-center gap-x-4 cursor-pointer p-4 hover:bg-red-400 rounded m-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 12.75l6 6 6-6M5.25 6.75l6 6 6-6" />
                    </svg>
                    <p className={`${!open && "hidden"} font-medium px-4 origin-left duration-200`}>Barang Selesai Diorder</p>
                  </li>
                </NavLink>
              </ul>
            </div>
            {/* End Sidebar */}
          </div>
        </div>
        <div className={`${open ? 'w-5/6' : 'w-11/12'}`}>
          <main>{children}</main>
        </div>
      </div>
    </React.Fragment>
  )
}

export default Sidebar
