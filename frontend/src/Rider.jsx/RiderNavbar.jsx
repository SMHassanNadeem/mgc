import { useNavigate } from "react-router-dom"
import logo from '../assets/MGC.png';

import { useState } from "react";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { io } from 'socket.io-client';

export default function RiderNavbar() {
    const navigate = useNavigate()
    const [toggle, setToggle] = useState(false)

    const queryClient = useQueryClient()

    const [newPickupNotif, setNewPickupNotif] = useState(() => {
        return parseInt(localStorage.getItem('newPickupNotif')) || 0;
    });
    const [newDeliveryNotif, setNewDeliveryNotif] = useState(() => {
        return parseInt(localStorage.getItem('newDeliveryNotif')) || 0;
    });
    const [newReturnNotif, setNewReturnNotif] = useState(() => {
        return parseInt(localStorage.getItem('newReturnNotif')) || 0;
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        // Create socket connection
        const newSocket = io('http://localhost:3000', {
            transports: ['websocket', 'polling'],
            auth: {
                token: token
            }
        });

        newSocket.on('rider-assigned-order-pickup', (data) => {
            console.log(data)
            // toast.info(`New Pickup Order Assigned!`, {
            //     position: "top-right",
            //     autoClose: 3000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     style: {
            //         background: '#2196F3',
            //         color: 'white',
            //         fontSize: '16px'
            //     }
            // });
            setNewPickupNotif(prev => {
                const newValue = prev + 1;
                localStorage.setItem('newPickupNotif', newValue.toString());
                return newValue;
            });
        });
        newSocket.on('rider-assigned-order-delivery', (data) => {
            console.log(data)
            // toast.info(`New Delivery Order Assigned!`, {
            //     position: "top-right",
            //     autoClose: 3000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     style: {
            //         background: '#2196F3',
            //         color: 'white',
            //         fontSize: '16px'
            //     }
            // });
            setNewDeliveryNotif(prev => {
                const newValue = prev + 1;
                localStorage.setItem('newDeliveryNotif', newValue.toString());
                return newValue;
            });
        });
        newSocket.on('rider-assigned-order-return', (data) => {
            console.log(data)
            // toast.info(`New Return Order Assigned!`, {
            //     position: "top-right",
            //     autoClose: 3000,
            //     hideProgressBar: false,
            //     closeOnClick: true,
            //     pauseOnHover: true,
            //     style: {
            //         background: '#2196F3',
            //         color: 'white',
            //         fontSize: '16px'
            //     }
            // });
            setNewReturnNotif(prev => {
                const newValue = prev + 1;
                localStorage.setItem('newReturnNotif', newValue.toString());
                return newValue;
            });
        });

        // Cleanup on component unmount
        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, []);

    return (
        <div className="py-2 px-2 flex items-center justify-between! bg-white text-[#041026] text-lg font-md w-full! xl:w-300!">

            <ToastContainer />

            <div className="cursor-pointer font-bold">
                <img className="w-40 object-fit" src={logo} alt="logo" />
            </div>
            <div className="gap-3 pr-3 hidden xl:flex">
                <button onClick={() => navigate('/rider')} className="text-nowrap border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Dashboard</button>
                <button onClick={() => navigate('/rider/assigned-orders')} className="text-nowrap border-b border-gray-200 w-full flex items-center justify-between py-3 pl-4 font-medium text-lg">
                    Pickup
                    <i className={`ml-1 ${newPickupNotif > 0 ? "bg-red-500 text-white flex justify-center items-center w-5 h-5 rounded-[50%]!" : null}`}>{newPickupNotif > 0 ? newPickupNotif : null}</i>
                </button>
                <button onClick={() => navigate('/rider/scan-orders')} className="text-nowrap border-b border-gray-200 w-full flex items-center justify-between py-3 pl-4 font-medium text-lg">Scan for Pickup</button>

                <button onClick={() => navigate('/rider/delivery')} className="text-nowrap border-b border-gray-200 w-full flex items-center justify-between py-3 pl-4 font-medium text-lg">
                    Delivery
                    <i className={`ml-1 ${newDeliveryNotif > 0 ? "bg-red-500 text-white flex justify-center items-center w-5 h-5 rounded-[50%]!" : null}`}>{newDeliveryNotif > 0 ? newDeliveryNotif : null}</i>
                </button>
                <button onClick={() => navigate('/rider/return')} className="text-nowrap border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">
                    Return
                    <i className={`ml-1 ${newReturnNotif > 0 ? "bg-red-500 text-white flex justify-center items-center w-5 h-5 rounded-[50%]!" : null}`}>{newReturnNotif > 0 ? newReturnNotif : null}</i>
                </button>

                <button onClick={() => navigate('/rider/orders-with-rider')} className="text-nowrap border-b border-gray-200 w-full flex items-center justify-between py-3 pl-4 font-medium text-lg">Orders With Rider</button>
                <button onClick={() => { localStorage.removeItem("token"), window.location.reload() }} className="text-red-500 font-bold! text-nowrap border-b border-gray-200 w-full flex justify-between py-3 pl-4 text-lg">Logout</button>
            </div>
            <div className="transition-all duration-1000 ease-in-out flex xl:hidden items-center text-[#041026] text-3xl">
                <i onClick={() => setToggle(!toggle)} className={`fa-solid fa-bars cursor-pointer transition-all duration-500`}></i>
            </div>
            <>
                <div className={`${toggle ? 'left-0' : 'left-[-100vw]'} ${toggle ? 'md:left-0' : 'md:left-[-33vw]'} w-full md:w-[27vw] transition-all duration-700 ease-in-out bg-white h-screen flex flex-col py-3 gap-0 items-start text-[#041026] fixed left-0 top-18! sm:top-18! border-t border-gray-100 z-12`}>
                    <div className="h-5 w-50"></div>
                    <div className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">
                        <p className="m-0">Menu</p>
                        <i onClick={() => setToggle(!toggle)} className="fa-solid fa-x pr-5"></i>
                    </div>
                    <button onClick={() => navigate('/rider')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Dashboard</button>
                    <button onClick={() => navigate('/rider/assigned-orders')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Pickup</button>
                    <button onClick={() => navigate('/rider/scan-orders')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Scan for Pickup</button>

                    <button onClick={() => navigate('/rider/delivery')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Delivery</button>
                    <button onClick={() => navigate('/rider/return')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Return</button>

                    <button onClick={() => navigate('/rider/orders-with-rider')} className="border-b border-gray-200 w-full flex justify-between py-3 pl-4 font-medium text-lg">Orders With Rider</button>
                    <button onClick={() => { localStorage.removeItem("token"), window.location.reload() }} className="text-red-400 font-bold border-b border-gray-200 w-full flex justify-between py-3 pl-4 text-lg">Logout</button>
                </div>
                {
                    toggle ?
                        <div onClick={() => setToggle(!toggle)} className="w-screen h-screen bg-[rgb(0,0,0,0.5)] fixed top-20 right-0 z-11"></div>
                        : null
                }
            </>
        </div>
    )
}