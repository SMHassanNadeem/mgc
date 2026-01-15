import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { Global } from "../global";
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Orders() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    async function getOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/orders/get-all-orders', {
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
        console.log(info)
        return info;
    }
    const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['assignedOrders'],
        queryFn: getOrders,
        retry: 1,
        refetchOnWindowFocus: false
    })

    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = apiData?.filter((item) =>
        [
            item?.creatorName,
            item?.CustomerName,
            item?.trackingId,
            item?.status,
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
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">
            <div className="bg-white px-[2%] p-4 text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Orders</h4>
            </div>

            {
                filteredData.length > 0
                    ?
                    <div className='w-full h-auto overflow-scroll'>
                        <table className="bg-white border w-full rounded-lg shadow-md">
                            <thead className="text-white bg-[#041026]">
                                <tr>
                                    <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Delivery City </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Receiver Contact No </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Order Type</td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Order Amount</td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Status</td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Items </td>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData?.map((a) => (
                                    <tr>
                                        <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.DeliveryCity}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.PickupAddress}</td>

                                        <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.Items}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    :
                    <h1>No Order Found</h1>
            }
        </div>
    )
}