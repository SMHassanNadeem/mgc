import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useCallback } from 'react';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export default function Delivery() {
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient()

    const navigate = useNavigate()

    async function getAssignedOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/orders/orders-assigned-deliver', {
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
        queryKey: ['assignedOrdersToDeliver'],
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
                status: "Return - Rider Delivered",
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
            queryClient.invalidateQueries({ queryKey: ['assignedOrdersToDeliver'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            alert(`Failed to assign rider: ${error.message}`);
        }
    })
    function confirmOrderRiderDelivered(id) {
        confirmOrderRiderDeliveredMutation.mutate(id)
    }


    async function confirmOrderCancelledByReceiverLogic({ id, cancelReasonsText }) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch(`http://localhost:3000/orders/return/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                status: "Return - Cancelled By Receiver",
                cancelReasons: cancelReasonsText,
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
    const confirmOrderCancelledByReceiverMutation = useMutation({
        mutationFn: confirmOrderCancelledByReceiverLogic,
        onSuccess: () => {
            setOpenMenuCancelOrder(false)
            queryClient.invalidateQueries({ queryKey: ['assignedOrdersToDeliver'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            alert(`Failed to assign rider: ${error.message}`);
        }
    })
    function confirmOrderCancelledByReceiver(id) {
        const cancelReasonsText = reasonsArray.join(',')
        confirmOrderCancelledByReceiverMutation.mutate({ id, cancelReasonsText })
    }



    const [openMenuCancelOrder, setOpenMenuCancelOrder] = useState(false)
    const [cancelReasons, setCancelReasons] = useState({
        incompleteAddress: "",
        consigneeNotAvailable: "",
        deliveryAddressClosed: "",
        noSuchPerson: "",

        refusedToReceive: "",
        restrictedArea: "",
        incompleteContactDetails: "",
        payementNotAvailable: "",
        otherReason: "",
    });
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setCancelReasons(prev => ({
            ...prev,
            [name]: checked ? [name] : ""
        }));
    };
    const handleOtherChange = (e) => {
        const { name, value } = e.target;
        setCancelReasons(prev => ({
            ...prev,
            [name]: [value]
        }));
    }
    const reasonsArray = [
        cancelReasons.incompleteAddress
        , cancelReasons.consigneeNotAvailable
        , cancelReasons.deliveryAddressClosed
        , cancelReasons.noSuchPerson
        , cancelReasons.refusedToReceive
        , cancelReasons.restrictedArea
        , cancelReasons.incompleteContactDetails
        , cancelReasons.payementNotAvailable
        , cancelReasons.otherReason
    ];


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
                <h4 className='ml-4'>Assigned Orders To Deliver</h4>
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
                                    <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Customer Contact No </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Dimensions </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Order Amount </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Fragility </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Confirm Delivered </td>
                                    <td className="p-4 text-center text-nowrap font-semibold">Confirm Canceled </td>
                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Rider Assigned at</td> */}
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    filteredData?.map((b) => (
                                        <tr key={b?._id}>
                                            <td className="p-4 text-center text-nowrap">{b?.creatorName}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.CustomerName}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.DeliveryAddress}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.CustomerContactNo}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.PickupAddress}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.Dimensions}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.OrderAmount} Rs</td>
                                            <td className="p-4 text-center text-nowrap">{b?.status}</td>
                                            <td className="p-4 text-center text-nowrap">{b?.fragility}</td>
                                            <td className="p-4 text-center text-nowrap">
                                                <button className='bg-blue-600 p-2 rounded text-white' onClick={() => confirmOrderRiderDelivered(b?._id)}>Add</button>
                                            </td>
                                            <td className="p-4 text-center text-nowrap">
                                                <button className='bg-red-600 p-2 rounded text-white' onClick={() => setOpenMenuCancelOrder(b?._id)}>Cancel</button>
                                            </td>
                                            <Dialog
                                                open={openMenuCancelOrder === b?._id}
                                                onClose={() => setOpenMenuCancelOrder(false)}
                                                PaperProps={{
                                                    sx: {
                                                        width: "50%",
                                                        maxWidth: "none",
                                                    }
                                                }}
                                            >
                                                <DialogTitle
                                                    sx={{
                                                        paddingY: "10px",
                                                        width: "100%",
                                                        display: "flex",
                                                        flexDirection: "column",
                                                        alignItems: 'flex-start',
                                                        gap: "10px",
                                                    }}
                                                >
                                                    <div className="flex flex-col gap-2 items-center w-full h-auto">
                                                        <h1>Reason to Cancel: </h1>
                                                        <form className='flex flex-col gap-2'>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="incompleteAddress"
                                                                    name="incompleteAddress"
                                                                    checked={cancelReasons.incompleteAddress}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="incompleteAddress" className="ml-2">incomplete Address</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="consigneeNotAvailable"
                                                                    name="consigneeNotAvailable"
                                                                    checked={cancelReasons.consigneeNotAvailable}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="consigneeNotAvailable" className="ml-2">consignee Not Available</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="deliveryAddressClosed"
                                                                    name="deliveryAddressClosed"
                                                                    checked={cancelReasons.deliveryAddressClosed}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="deliveryAddressClosed" className="ml-2">delivery Address Closed</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="noSuchPerson"
                                                                    name="noSuchPerson"
                                                                    checked={cancelReasons.noSuchPerson}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="noSuchPerson" className="ml-2">no Such Person</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="refusedToReceive"
                                                                    name="refusedToReceive"
                                                                    checked={cancelReasons.refusedToReceive}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="refusedToReceive" className="ml-2">refused To Receive</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="restrictedArea"
                                                                    name="restrictedArea"
                                                                    checked={cancelReasons.restrictedArea}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="restrictedArea" className="ml-2">restricted Area</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="incompleteContactDetails"
                                                                    name="incompleteContactDetails"
                                                                    checked={cancelReasons.incompleteContactDetails}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="incompleteContactDetails" className="ml-2">incomplete ContactDetails</label>
                                                            </div>
                                                            <div>
                                                                <input
                                                                    type="checkbox"
                                                                    id="payementNotAvailable"
                                                                    name="payementNotAvailable"
                                                                    checked={cancelReasons.payementNotAvailable}
                                                                    onChange={handleCheckboxChange}
                                                                    className="h-4 w-4 text-blue-600"
                                                                />
                                                                <label htmlFor="payementNotAvailable" className="ml-2">payement Not Available</label>
                                                            </div>
                                                            <div>
                                                                <label htmlFor="otherReason" className="mr-2">Other: </label>
                                                                <input
                                                                    type="text"
                                                                    id="otherReason"
                                                                    name="otherReason"
                                                                    value={cancelReasons.otherReason}
                                                                    onChange={handleOtherChange}
                                                                    className="h-6 border-black rounded border text-sm!"
                                                                />
                                                            </div>
                                                            <button type='button' className='bg-[#d10115] text-white p-2 rounded' onClick={() => confirmOrderCancelledByReceiver(b?._id)}>Cancel</button>
                                                        </form>
                                                    </div>
                                                </DialogTitle>
                                            </Dialog>
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
                <h1 className='ml-4'>No Order Found To Deliver</h1>
            }
        </div>
    )
}