import { useNavigate } from "react-router-dom"
import logo from '../assets/MGC.png';
import { useContext, useState } from "react";
import Signup from "../Auth/signup";
import Login from "../Auth/login";
import {Global} from "../global";

export default function Navbar() {
    const navigate = useNavigate()
    const [toggle, setToggle] = useState(false)
    
    const {openMenuAddUser, setOpenMenuAddUser, openMenuLogin,setOpenMenuLogin} = useContext(Global)

    // #d10115
    //rgb (209,1,21,1)

    // #041026
    return (
        <>
            <div className="w-full py-2 bg-[#ff3f39] text-white flex justify-center">
                <p className="m-0 text-center text-nowrap overflow-hidden"><b>Forbes Asia</b> names MGC to its 100 to watch 2025 list </p>
            </div>
            <div className="shadow-2xl shadow-black/30 bg-white  border-gray-500 sticky top-0 z-50 text-gray-100 w-full flex justify-center">
                <div className="w-306 flex justify-between px-3 py-3">
                    <div onClick={() => navigate('/')} className="cursor-pointer pl-4 text-3xl font-bold">
                        <img className="w-40 object-fit" src={logo} alt="logo" />
                    </div>
                    <div className="hidden xl:flex gap-7 text-[#041026] font-extrabold! text-lg! tracking-wider" style={{ fontFamily: 'poppins' }}>
                        <button onClick={()=> navigate('/home')} className="">Home</button>
                        <button onClick={()=> navigate('/about-us')} className="">About Us</button>
                        {/* <button className="">Services</button> */}
                        <button onClick={()=> navigate('/contact-us')} className="">Contact Us</button>
                        <button onClick={() => navigate('/tracking-id')} className="">Tracking <b className="px-2 ripple"></b> </button>
                    </div>
                    
                    <div className="gap-2 text-md font-bold hidden xl:flex">
                        <button onClick={() => setOpenMenuLogin(true)} className="bg-[#d10115] rounded-4xl! px-9 text-lg! hover:border-gray-600! transition-all duration-300 ease-in-out hover:bg-[#ff3f39]! hover:text-black text-white">Login</button>
                        <button onClick={() => setOpenMenuAddUser(true)} className="rounded-4xl! px-9 text-lg! transition-all duration-300 ease-in-out hover:text-gray-200! bg-[#041026]! hover:bg-[#042840]! text-white">Sign Up</button>
                    </div>

                    {/* Toggle Bar */}
                    <div className="transition-all duration-1000 ease-in-out flex xl:hidden items-center text-[#041026] text-3xl">
                        <div className="px-5 gap-4 text-[15px] font-bold flex xl:hidden">
                            <button onClick={() => setOpenMenuLogin(true)} className="text-[#d10115]">Login</button>
                            <button onClick={() => setOpenMenuAddUser(true)}  className="text-[#041b26]">SignUp</button>
                        </div>
                        <i onClick={() => setToggle(!toggle)} className={`fa-solid fa-bars cursor-pointer transition-all duration-500`}></i>
                        {/* <i onClick={() => setToggle(!toggle)} className={`fa-solid fa-bars cursor-pointer transition-all duration-500 ${toggle ? "opacity-0 rotate-90 scale-0" : "opacity-100 rotate-0 scale-100"}`}></i> */}
                        {/* <i onClick={() => setToggle(!toggle)} className={`fa-solid fa-x cursor-pointer transition-all duration-500 ${toggle ? "opacity-100 rotate-0 scale-100 -translate-x-5" : "opacity-0 -rotate-90 scale-0"}`}></i> */}
                    </div>
                </div>
            </div>
            {/* Toggle List */}
            <>
                <div className={`${toggle ? 'left-0' : 'left-[-100vw]'} ${toggle ? 'md:left-0' : 'md:left-[-33vw]'} w-full md:w-[27vw] transition-all duration-700 ease-in-out bg-white h-screen flex flex-col py-3 gap-0 items-start text-[#041026] fixed left-0 top-24! sm:top-30! border-t border-gray-100 z-12`}>
                    <div className="h-5 w-50"></div>
                    <div className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">
                        <p className="m-0">Menu</p>
                        <i onClick={() => setToggle(!toggle)} className="fa-solid fa-x pr-5"></i>
                    </div>
                    <button onClick={()=> navigate('/')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Home</button>
                    <button onClick={()=> navigate('/about-us')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">About Us</button>
                    {/* <button className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Services</button> */}
                    <button onClick={()=> navigate('/contact-us')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Contact Us</button>
                    <button onClick={()=> navigate('/tracking-id')} className="hover:bg-[#d10115] bg-[#ff3f39] mt-4 text-lg! ml-3! py-4 px-5 text-white flex justify-between font-medium">Tracking Id</button>
                </div>
                {
                    toggle ?
                        <div onClick={() => setToggle(!toggle)} className="w-screen h-screen bg-[rgb(0,0,0,0.5)] fixed top-20 right-0 z-11"></div>
                        : null
                }
            </>
            
            <Signup openMenuAddUser={openMenuAddUser} setOpenMenuAddUser={setOpenMenuAddUser} />

            <Login openMenuLogin={openMenuLogin} setOpenMenuLogin={setOpenMenuLogin} setOpenMenuAddUser={setOpenMenuAddUser}/>
        </>
    )
}