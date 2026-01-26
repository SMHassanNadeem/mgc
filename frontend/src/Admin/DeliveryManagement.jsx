import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { Global } from "../global";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function DeliveryManagement() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    async function getOrdersToReturn() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/orders/orders-at-warehouse', {
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
    const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['ordersToReturn'],
        queryFn: getOrdersToReturn,
        retry: 1,
        refetchOnWindowFocus: false
    })



    const [openMenuAssignRider, setOpenMenuAssignRider] = useState(false)
    async function getRiders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/riders/riders-active', {
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
    const { data: rider, isLoading: riderLoading, error: riderError } = useQuery({
        queryKey: ['riders'],
        queryFn: getRiders,
        retry: 1,
        refetchOnWindowFocus: false
    })



    async function assignRiderLogic({ orderId, ridersId }) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch(`http://localhost:3000/orders/${orderId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                ridersId: ridersId.toString(),
                ridersIdForDelivery:ridersId.toString(),
                status: "Return - Rider Assigned To Deliver",
            })
        })
        if (data?.status === 401) {
            localStorage.removeItem('token');
            navigate('/');
            return;
        }
        if (data?.status === 403) {
            navigate('/');
            return;
        }
        if (!data?.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }
    }
    const assignRiderMutation = useMutation({
        mutationFn: assignRiderLogic,
        onSuccess: () => {
            setOpenMenuAssignRider(false);
            queryClient.invalidateQueries({ queryKey: ['ordersToReturn'] });
            toast.success(`Assigned successfully`, {
                position: "top-right",
                autoClose: 3000,
                // style: {
                //     background: '#d10115',
                //     color: 'white',
                // },
            })
        },
        onError: (error) => {
            console.error('Error :', error);
            toast.error(`Failed : ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function assignRiderFun(orderId, ridersId) {
        assignRiderMutation.mutate({ orderId, ridersId })
    }


    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = apiData?.filter((item) =>
        [
            item?.CustomerName,
            item?.trackingId,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Loading state
    if (ordersLoading) {
        return (
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-7/8! sm:w-3/4 h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading data...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (ordersError) {
        return (
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-7/8! sm:w-3/4 h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading data: {ordersError?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">
            
            <ToastContainer
                pauseOnHover
            />
            
            <div className="bg-white px-[2%] p-4 text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Delivery Management</h4>
            </div>

            {
                filteredData
                    ?.filter(a => a.status !== "At Warehouse - Receiver Cancelled")
                    ?.length > 0
                    ?
                    <div className="w-full h-auto overflow-scroll">
                        <table className="bg-white border w-full rounded-lg shadow-md">
                            <thead className="text-white bg-[#041026]">
                                <tr>
                                    <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Customer Contact No </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>

                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Order Type</td> */}
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Order Amount</td> */}
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Status</td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Dimensions </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Assign </td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredData
                                        ?.filter(a => a.status !== "At Warehouse - Receiver Cancelled")
                                        ?.map((a) => (
                                            <tr>
                                                <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                {/* <td className="p-4 text-center text-nowrap">{a?.trackingId}</td> */}
                                                <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                {/* <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td> */}
                                                <td className="p-4 text-center text-nowrap max-w-[100px] text-wrap!">{a?.PickupAddress}</td>

                                                {/* <td className="p-4 text-center text-nowrap">{a?.OrderType}</td> */}
                                                {/* <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td> */}
                                                {/* <td className="p-4 text-center text-nowrap max-w-[100px] text-wrap!">{a?.DeliveryAddress}</td> */}
                                                <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                                {/* <td className="p-4 text-center text-nowrap">{a?.Dimensions}</td> */}

                                                <td className="p-4 text-center">
                                                    <button onClick={() => setOpenMenuAssignRider(a?._id)} className='bg-[#d10115] text-white rounded p-2'>Assign</button>
                                                </td>
                                                <Dialog
                                                    open={openMenuAssignRider === a?._id}
                                                    onClose={() => setOpenMenuAssignRider(false)}
                                                    PaperProps={{
                                                        sx: {
                                                            width: "100%",
                                                            maxWidth: "none",
                                                        }
                                                    }}
                                                >
                                                    <DialogTitle
                                                        sx={{
                                                            paddingY: "10px",
                                                            width: "95vw",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: 'flex-start',
                                                            gap: "10px",
                                                        }}
                                                    >
                                                        <div className="w-full h-auto overflow-scroll">
                                                            <table className="bg-white border w-full h-auto rounded-lg shadow-md">
                                                                <thead className="text-white bg-[#041021]">
                                                                    <tr>
                                                                        <td className="p-4 text-center font-semibold">Rider Name</td>
                                                                        <td className="p-4 text-center font-semibold">Contact No</td>
                                                                        <td className="p-4 text-center font-semibold">Assigned Area</td>
                                                                        <td className="p-4 text-center font-semibold">Assign</td>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className='text-nowrap'>
                                                                    {
                                                                        rider?.map((b) => (
                                                                            <tr>
                                                                                <td className="p-4 text-center">{b?.ridersName}</td>
                                                                                <td className="p-4 text-center">{b?.contactNo}</td>
                                                                                <td className="p-4 text-center">{b?.assignedArea}</td>
                                                                                <td className="p-4 text-center">
                                                                                    <button onClick={() => assignRiderFun(a?._id, b?._id)}
                                                                                        className='bg-[#d10115] text-white p-3 rounded'
                                                                                    >Assign</button>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    }
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </DialogTitle>
                                                </Dialog>
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>
                    </div>
                    :
                    <h1>No Order found to return</h1>
            }
        </div>
    )
}