import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function OrdersWithRider() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    async function getOrdersWithRider() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch('http://localhost:3000/orders/orders-with-rider', {
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
        queryKey: ['orders'],
        queryFn: getOrdersWithRider,
        retry: 1,
        refetchOnWindowFocus: false
    })

    const filteredData = apiData?.filter((item) =>
        [item.CustomerName, item.DeliveryCity, item.trackingId, item.CustomerContactNo, item.DeliveryAddress, item.Dimensions, item.status]
            .some((field) =>
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
            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search ...." />
            </div>

            <div className="flex items-center justify-between w-full">
                <h4>Orders With Rider</h4>
            </div>

            {filteredData?.length > 0 ? (
                <div className='overflow-x-scroll w-full'>
                    <table className="bg-white border w-full rounded-lg shadow-md">
                        <thead className="bg-[#041026] text-white border-b-2 border-black">
                            <tr>
                                <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                <td className="p-4 text-center text-nowrap font-semibold">Delivery City </td>
                                <td className="p-4 text-center text-nowrap font-semibold">Tracking Id </td>
                                <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                                <td className="p-4 text-center text-nowrap font-semibold">Delivered Date </td>
                                {/* <td className="p-4 text-center text-nowrap font-semibold">Customer Contact No </td> */}
                                {/* <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td> */}
                                <td className="p-4 text-center text-nowrap font-semibold">Dimensions </td>
                                <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                filteredData?.map((a) => (
                                    <tr>
                                        <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.DeliveryCity}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.RiderDeliveredDate}</td>
                                        {/* <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td> */}
                                        {/* <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td> */}
                                        <td className="p-4 text-center text-nowrap">{a?.Dimensions}</td>
                                        <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )
                :
                <h1>No Result</h1>
            }
        </div>
    )
}