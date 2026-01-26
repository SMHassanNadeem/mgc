import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Global} from "../global";
import { useContext } from 'react';
import SignupVendor from '../Auth/signup-vendor';

export default function VendorsManagement() {
    // const [openMenu, setOpenMenu] = useState(false)
    // const [openMenuAddUser, setOpenMenuAddUser] = useState(false)
    const { openMenuAddUser, setOpenMenuAddUser } = useContext(Global)
    
    const [searchTerm, setSearchTerm] = useState("");

    const navigate = useNavigate()
    const queryClient = useQueryClient()

    async function getRidersLogic() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch('http://localhost:3000/users/vendor', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
        if (data?.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
        }
        if (data?.status === 403) {
            // Not authorized (not admin)
            navigate('/');
            return;
        }
        if (!data?.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }
        const info = await data.json()
        return info;
    }
    const { data: apiData, isLoading: ridersLoading, error: ridersError } = useQuery({
        queryKey: ['vendor-order'],
        queryFn: getRidersLogic,
        retry: 1,
        refetchOnWindowFocus: false,
    })


    // const [formData, setFormData] = useState({
    //     RiderName: "",
    //     ContactNo: "",
    //     EmailAddress: "",
    //     VehicleDetails: "",
    //     LicenseNo: "",
    //     RiderRefrenceNumber: "rider" + Date.now().toString().slice(5, 13),
    //     AssignedArea: "",
    //     confPass: "",
    //     password: "",
    //     cnic: "",
    // });
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormData(prev => {
    //         const updated = { ...prev, [name]: value };
    //         if (name === "password" || name === "confPass") {
    //             validatePasswords(updated.password, updated.confPass);
    //         }
    //         return updated;
    //     });
    // };
    // const confPassRef = useRef(null);

    const filteredData = apiData?.filter((item) =>
        [
            item?.CompanyName,
            item?._id,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    function validatePasswords(pass, conf) {
        if (!confPassRef.current) return;

        if (pass !== conf) {
            confPassRef.current.setCustomValidity("Passwords do not match");
        } else {
            confPassRef.current.setCustomValidity("");
        }
    }

    const [page, setPage] = useState(0)
    function nextPage() {
        if (!formRef.current) return;
        if (formRef.current.checkValidity()) {
            setPage(prev => Math.min(prev + 1, 2));
        } else {
            formRef.current.reportValidity();
        }
    }
    function prevPage() {
        setPage(prev => Math.max(prev - 1, 0));
    }
    const formRef = useRef(null);


    if (ridersLoading) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading vendors...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (ridersError) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading vendors: {ridersError.message}</p>
                    <button
                        onClick={() => queryClient.refetchQueries({ queryKey: ['userOrders'] })}
                        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">
            
            <ToastContainer
                pauseOnHover
            />
            
            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
                <button onClick={() => setOpenMenuAddUser(true)} className="bg-[#d10115] text-gray-100 font-medium py-2 px-4 rounded text-nowrap">Add Vendors</button>
                <SignupVendor openMenuAddUser={openMenuAddUser} setOpenMenuAddUser={setOpenMenuAddUser} />
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Vendors</h4>
            </div>

            <div className="w-full h-auto text-white">
                {
                    filteredData?.length !== 0 ?
                        filteredData?.map((a) => (
                            <>
                                <div onClick={() => navigate(`/admin/vendors-management/${a?._id}/${a?.CompanyName}`)} className='bg-gray-50 cursor-pointer flex justify-between items-center mb-3! shadow shadow-black/30 py-3 pl-2 rounded'>
                                    <div className='flex items-center'>
                                        <div className='mr-10 bg-blue-900 rounded-[50%] h-20 w-20 flex justify-center items-center'>
                                            <h2 className="p-4 text-center text-nowrap">{a?.CompanyName[0]?.toUpperCase()}</h2>
                                        </div>
                                        <div className="text-black flex flex-col justify-between h-15">
                                            <h3 className="text-justify text-nowrap font-bold">{a?.CompanyName}</h3>
                                            <div className="text-justify text-nowrap">{a?.Email}</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ))
                        : <h1 className='text-black'>No Vendor</h1>
                }
            </div>
        </div>
    )
}