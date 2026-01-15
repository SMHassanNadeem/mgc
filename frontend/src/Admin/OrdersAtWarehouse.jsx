import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { Global } from "../global";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

export default function UnassignedOrders() {
    const navigate = useNavigate()
    const [openMenu, setOpenMenu] = useState(false)
    const queryClient = useQueryClient()

    async function getOrdersAtWarehouse() {
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
        console.log(info)
        return info;
    }
    const { data: apiData, isLoading, error } = useQuery({
        queryKey: ['ordersAtWarehouse'],
        queryFn: getOrdersAtWarehouse,
        retry: 1,
        refetchOnWindowFocus: false
    })

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
    if (isLoading) {
        return (
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-7/8! sm:w-3/4 h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading data...</p>
                </div>
            </div>
        );
    }
    // Error state
    if (error) {
        return (
            <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-center items-center w-7/8! sm:w-3/4 h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading data: {error?.message}</p>
                </div>
            </div>
        );
    }
    return (
        <div className=" overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-screen">
            <div className='text-white w-full flex justify-between gap-3'>
                {/* <div className='w-1/2 bg-gray-500 rounded-2xl p-3'>
                    <h2>At Warehouse</h2>
                    <h3>{apiData?.length}</h3>
                </div> */}

                {/* <div className='w-1/2 bg-gray-500 rounded-2xl p-3'>
                    <h2>Canceled Orders</h2>
                    <h3>{apiData?.length}</h3>
                </div> */}
            </div>

            <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
            </div>

            <div className="flex items-center justify-between w-full">
                {/* <h4>Orders At Warehouse</h4> */}
            </div>


            {
                filteredData?.length > 0
                    ?
                    <div className="h-auto w-full overflow-scroll">
                        <table className="bg-white border w-full rounded-lg shadow-md">
                            <thead className="text-white bg-[#041026]">
                                <tr>
                                    <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Delivery City </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Receiver Contact No </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Tracking Id </td>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredData?.map((a) => (
                                        <tr>
                                            <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.DeliveryCity}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                            <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                    :
                    <h1>No Orders found at warehouse</h1>
            }
        </div>
    )
}