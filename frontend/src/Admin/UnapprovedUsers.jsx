import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function UnapprovedUsers() {
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    async function getUnapprovedUsers() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/users/unapproved', {
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
        return info?.user
    }
    const { data: apiData, isLoading: usersLoading, error: usersError } = useQuery({
        queryKey: ['unapprovedUsers'],
        queryFn: getUnapprovedUsers,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    async function approveLogic(id) {
        const data = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                status: "approved"
            })
        })
    }
    const approveMutation = useMutation({
        mutationFn: approveLogic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unapprovedUsers'] });
        },
        onError: (error) => {
            console.error('Error:', error);
            toast.success(`Failed : ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function approve(id) {
        approveMutation.mutate(id)
    }

    async function cancelLogic(id) {
        const data = await fetch(`http://localhost:3000/users/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
    }
    const cancelMutation = useMutation({
        mutationFn: cancelLogic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['unapprovedUsers'] });
        },
        onError: (error) => {
            console.error('Error canceling order:', error);
            toast.success(`Failed : ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function cancel(id) {
        cancelMutation.mutate(id)
    }

    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = apiData?.filter((item) =>
        [
            item?.CompanyName,
            item?._id,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Loading state
    if (usersLoading) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading Users...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (usersError) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading users: {usersError.message}</p>
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
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Unapproved Users</h4>
            </div>

            {
                filteredData?.length !== 0
                    ?
                    <div className='w-full h-auto overflow-scroll'>
                        <table className="bg-white border w-full rounded-lg shadow-md">
                            <thead className="text-white bg-[#041026]">
                                <tr>
                                    <td className="p-4 text-center text-nowrap font-semibold">Company Name</td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Email </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Phone No </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Cnic</td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Approve</td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Cancel</td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredData?.map((a) => (
                                        <tr key={a?._id}>
                                            <td className="p-4 text-center text-nowrap">{a?.CompanyName}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.Email}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.PhoneNo}</td>
                                            {/* <td className="p-4 text-center text-nowrap">{a?.cnic}</td> */}
                                            <td className="p-4 text-center text-nowrap">
                                                <button onClick={() => approve(a?._id)} className='bg-blue-400 text-white rounded p-2'>Approve</button>
                                            </td>
                                            <td className="p-4 text-center text-nowrap">
                                                <button onClick={() => cancel(a?._id)} className='bg-red-700 text-white rounded p-2'>Cancel</button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                    :
                    <h1>No User Found</h1>
            }
        </div>
    )
}
