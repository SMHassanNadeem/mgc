import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useCallback } from 'react';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Return() {
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient()

    const navigate = useNavigate()

    async function getAssignedOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch('http://localhost:3000/orders/orders-assigned-return', {
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
        return info.order;
    }
    const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['assignedOrdersToReturn'],
        queryFn: getAssignedOrders,
        retry: 1,
        refetchOnWindowFocus: false
    })


    async function confirmOrderRiderDeliveredLogic(id) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch(`http://localhost:3000/orders/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                status: "Return - Back To Vendor",
            })
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
    }
    const confirmOrderRiderDeliveredMutation = useMutation({
        mutationFn: confirmOrderRiderDeliveredLogic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assignedOrdersToReturn'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            alert(`Failed to assign rider: ${error.message}`);
        }
    })
    function confirmOrderRiderDelivered(id) {
        confirmOrderRiderDeliveredMutation.mutate(id)
    }

    // ----------------filtering-----------------------------
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
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-full h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading data...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (ordersError) {
        return (
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-full h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading data: {ordersError?.message}</p>
                </div>
            </div>
        );
    }

    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-screen h-auto">

            <div className="flex items-center justify-between w-full">
                <h4 className='ml-4'>Assigned Orders To Return</h4>
            </div>

            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search ...." />
            </div>

            {filteredData?.length > 0
                ?
                <>
                    <div className='overflow-x-scroll w-full'>
                        <table className="bg-white border w-full rounded-lg shadow-md">
                            <thead className="bg-[#041026] text-white border-b-2 border-black">
                                <tr>
                                    <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Customer Name </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Customer Contact No </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Dimensions </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Cancel Reason </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Order Amount </td> */}
                                    <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Fragility </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Confirm Return</td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Rider Assigned at</td> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredData?.map((b) => (
                                        <tr key={b?._id}>
                                            <td className="p-4 text-center text-nowrap">{b?.creatorName}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.CustomerName}</td>
                                            {/* <td className="p-4 text-center text-nowrap">{b?.DeliveryAddress}</td> */}
                                            <td className="p-4 text-center text-nowrap">{b?.CustomerContactNo}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.PickupAddress}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.Dimensions}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.cancelReasons}</td>
                                            {/* <td className="p-4 text-center text-nowrap">{b?.OrderAmount} Rs</td> */}
                                            <td className="p-4 text-center text-nowrap">{b?.status}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.fragility}</td>
                                            <td className="p-4 text-center text-nowrap">
                                                <button className='bg-red-600 p-2 rounded text-white' onClick={() => confirmOrderRiderDelivered(b?._id)}>Confirm</button>
                                            </td>
                                            {/* <td className="p-4 text-center text-nowrap">{b?.RiderAssignedDate}</td> */}
                                        </tr>
                                    )
                                    )
                                }
                            </tbody>
                        </table>
                    </div>
                </>
                :
                <h1 className='ml-4'>No Order Found To Return</h1>
            }
        </div>
    )
}