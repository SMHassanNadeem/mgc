import logo from '../assets/MGC.png';
import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useState, useContext, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function OrderForm() {

    const queryClient = useQueryClient()

    const navigate = useNavigate()
    const [searchTerm, setSearchTerm] = useState("");
    const [openMenuAddUser, setOpenMenuAddUser] = useState(false)
    const [openMenuOrderDetail, setOpenMenuOrderDetail] = useState(false)

    const [formData, setFormData] = useState({
        OrderType: "Normal",
        OrderAmount: "",
        CustomerName: "",
        DeliveryCity: "",
        PickupCity: "",
        OrderDate: new Date().toString().split(' ').splice(0, 5).join(' '),
        CustomerContactNo: "",
        DeliveryAddress: "",
        PickupAddress: "",
        Dimensions: "",
        fragility: "Normal",
        weight: "",
        // status: "Shipment - Booked",
        // creator: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Adding Order
    async function addOrderLogic(formData) {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                OrderType: formData.OrderType,
                OrderAmount: formData.OrderAmount,
                CustomerName: formData.CustomerName,
                DeliveryCity: formData.DeliveryCity,
                PickupCity: formData.PickupCity,
                OrderDate: new Date().toString().split(' ').splice(0, 5).join(' '),
                CustomerContactNo: formData.CustomerContactNo,
                DeliveryAddress: formData.DeliveryAddress,
                PickupAddress: formData.PickupAddress,
                Dimensions: formData.Dimensions,
                fragility: formData.fragility,
                weight: formData.weight,
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
        const info = await data.json()
        console.log(info?.message)
    }
    const assignOrderMutation = useMutation({
        mutationFn: addOrderLogic,
        onSuccess: () => {
            setFormData({
                OrderType: "Normal",
                OrderAmount: "",
                CustomerName: "",
                DeliveryCity: "",
                PickupCity: "",
                OrderDate: new Date().toString().split(' ').splice(0, 5).join(' '),
                CustomerContactNo: "",
                DeliveryAddress: "",
                PickupAddress: "",
                Dimensions: "",
                fragility: "Normal",
                weight: "",
            });
            setOpenMenuAddUser(false);
            toast.success("Please make sure to confirm your order", {
                position: "top-right",
                autoClose: 3000,
                // style: {
                //     background: '#d10115',
                //     color: 'white',
                // },
            })
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
        },
        onError: (error) => {
            console.error('Error :', error);
            toast.error(`Error: ${error?.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function addOrder(e) {
        e.preventDefault();
        assignOrderMutation.mutate(formData)
    }

    async function getOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Please Login',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        const data = await fetch('http://localhost:3000/orders/order-data-of-user', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
        })
        if (data?.status === 401) {
            localStorage.removeItem('token');
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Please Login',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        if (data?.status === 403) {
            navigate('/', {
                state: {
                    from: '/order-form',
                    message: 'Admin will approve your account soon',
                    timestamp: Date.now()
                },
                replace: true
            });
            return [];
        }
        if (!data?.ok) {
            throw new Error(`HTTP error! status: ${data.status}`);
        }
        const info = await data.json()
        return info?.order
    }
    const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['userOrders'],
        queryFn: getOrders,
        retry: 1,
        refetchOnWindowFocus: false,
    })

    const [filterStartDate, setFilterStartDate] = useState("")
    const [filterEndDate, setFilterEndDate] = useState("")
    const filteredOrders = apiData?.filter(order => {
        if (!filterStartDate && !filterEndDate) {
            return true;
        }
        const orderDate = new Date(order?.OrderDate);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;

        // Adjust endDate to end of day (11:59:59 PM)
        if (endDate) {
            endDate.setHours(23, 59, 59, 999);
        }
        // Check if order date is within range
        if (startDate && endDate) {
            // Both dates selected: order must be between start and end
            return orderDate >= startDate && orderDate <= endDate;
        } else if (startDate && !endDate) {
            // Only start date selected: order must be on or after start
            return orderDate >= startDate;
        } else if (!startDate && endDate) {
            // Only end date selected: order must be on or before end
            return orderDate <= endDate;
        }
        return true;
    })

    async function confirmOrderLogic(id) {
        try {
            const existingIds = JSON.parse(localStorage.getItem('confirmedOrderIds') || '[]');
            const response = await fetch(`http://localhost:3000/orders/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: "Shipment - Booked"
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update order status');
            }
            existingIds.push(id);
            localStorage.setItem('confirmedOrderIds', JSON.stringify(existingIds));
            toast.success("Order Confirmed Successfully!", {
                position: "top-right",
                autoClose: 3000,
            })
        } catch (error) {
            console.error('Error confirming order:', error);
            toast.error(`Failed to confirm order: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    }
    const confirmOrderMutation = useMutation({
        mutationFn: confirmOrderLogic,
        onSuccess: (data, variables) => {
            setOpenMenuOrderDetail(variables);
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            toast.error(`Failed to confirm: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function confirmOrderFun(id) {
        const existingIds = JSON.parse(localStorage.getItem('confirmedOrderIds') || '[]');
        const existingOrder = apiData.find(item => item._id === id);
        if (existingIds?.includes(id) || existingOrder?.status !== "order - placed") {
            toast.success("Order already Confirmed", {
                position: "top-right",
                autoClose: 3000,
            });
            setOpenMenuOrderDetail(id);
            return;
        }
        confirmOrderMutation.mutate(id)
    }


    async function deleteOrderLogic(id) {
        try {
            const response = await fetch(`http://localhost:3000/orders/user/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete order status');
            }
            toast.success("Order Deleted Successfully!", {
                position: "top-right",
                autoClose: 3000,
            })
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error(`Failed to delete order: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    }
    const deleteOrderMutation = useMutation({
        mutationFn: deleteOrderLogic,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['userOrders'] });
        },
        onError: (error) => {
            console.error('Error deleting:', error);
            toast.error(`Failed to delete: ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function deleteOrderFun(id) {
        deleteOrderMutation.mutate(id)
    }

    // Loading state
    if (ordersLoading) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center">
                    <p className="text-lg">Loading orders...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (ordersError) {
        return (
            <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-center items-center w-screen h-screen">
                <div className="text-center text-red-600">
                    <p className="text-lg">Error loading orders: {ordersError.message}</p>
                </div>
            </div>
        );
    }

    const filteredData = filteredOrders?.filter((item) =>
        [
            item?.CustomerName,
            item?.trackingId,
            item?.status,
            item?.OrderDate,
            item?.CustomerContactNo
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="pt-25! overflow-scroll! bg-white flex flex-col p-4 justify-start items-center w-screen h-auto">

            <ToastContainer
                pauseOnHover
            />

            <div className="flex flex-col items-center text-[#041026] w-full">
                <h1>Welcome</h1>
                <h3>to Shipper Portal</h3>
                <h3>{localStorage.getItem('name') ? "of" + " " + localStorage.getItem('name') : null}</h3>
                <div className="flex absolute top-20 left-150 mt-[90px] z-1 rounded">
                    <div className="rounded-full shadow-[0_0_260px_100px_rgba(209,1,21,0.8)]"></div>
                </div>
            </div>

            <div className="w-full max-w-350! grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="rounded-full bg-green-100 p-3 mr-4">
                            <i className="fas fa-sack-dollar text-green-600"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Business with Mgc</p>
                            <p className="text-2xl font-bold">Rs
                                {filteredData
                                .filter(st => st?.status !== "order - placed" && st?.status !== "Return - Back To Vendor" )
                                .reduce((sum, order) =>
                                    sum + (parseFloat(order.OrderAmount) || 0), 0).toLocaleString()
                                }
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="rounded-full bg-blue-100 p-3 mr-4">
                            <i className="fas fa-cart-shopping text-blue-600"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-2xl font-bold">{filteredData?.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="rounded-full bg-red-100 p-3 mr-4">
                            <i className="fas fa-box-open text-red-600"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Delivered Orders</p>
                            <p className="text-2xl font-bold">{filteredData.filter(st => st?.status === "Return - Rider Delivered").length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center">
                        <div className="rounded-full bg-orange-100 p-3 mr-4">
                            <i className="fas fa-hourglass-half text-orange-600"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Undelivered Orders</p>
                            <p className="text-2xl font-bold">{filteredData.filter(st => st?.status !== "Return - Rider Delivered" && st?.status !== "order - placed" && st?.status !== "Return - Back To Vendor").length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="print:hidden bg-gray-100 rounded py-3 px-3 flex flex-col lg:flex-row gap-4 items-center justify-between w-full max-w-350!">
                <div className='flex items-center py-2 px-7 pl-2 border border-gray-500! rounded w-full lg:w-[30%] h-full'>
                    <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                    <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search" />
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full rounded py-2 sm:w-fit! bg-gray-200">
                    <label className="text-red-500 font-bold text-nowrap">Set Filter : </label>
                    <h5 className="m-0 p-0">from</h5>
                    <input className="bg-blue-200 rounded" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                    <h5 className="m-0 p-0">to</h5>
                    <input className="bg-red-200 rounded" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                </div>
                <button onClick={() => setOpenMenuAddUser(true)} className="lg:py-3 w-full lg:w-[150px] py-2 bg-[#041026] text-white font-medium px-4 rounded text-nowrap">
                    Create Order
                </button>
                <Dialog
                    open={openMenuAddUser}
                    onClose={() => setOpenMenuAddUser(false)}
                    md
                    maxWidth={false}
                >
                    <DialogTitle
                        sx={{
                            paddingY: "10px",
                            width: "45vw",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: 'flex-start',
                            gap: "1px",
                        }}
                    >
                        <div className="w-full flex flex-col gap-0 items-start">
                            <h3 className='text-gray-600! text-md! font-medium!' > Create Order </h3>
                            <form onSubmit={addOrder} className='w-full flex flex-col'>
                                <div className="flex flex-col! lg:flex-row! gap-[5%]">
                                    <div className="w-full! lg:w-[47.5%]!">
                                        <label className='text-gray-600 text-[17px]'>Order Type:</label>
                                        <select name="OrderType" value={formData.OrderType} onChange={handleChange} className='border w-full rounded py-2 pl-3 text-[17px]! text-gray-400'>
                                            <option value="Normal">Normal</option>
                                            <option value="Express">Express</option>
                                        </select>
                                        <label className='text-gray-600 text-[17px]'>Customer Name:</label>
                                        <input required name="CustomerName" value={formData.CustomerName} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Receiver Name' />
                                        <label className='text-gray-600 text-[17px]'>Delivery City:</label>
                                        <input required name="DeliveryCity" value={formData.DeliveryCity} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Deliver City' />
                                        <label className='text-gray-600 text-[17px]'>Pickup City:</label>
                                        <input required name="PickupCity" value={formData.PickupCity} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup City' />

                                        <label className='text-gray-600 text-[17px]'>Dimensions:</label>
                                        <input required name="Dimensions" value={formData.Dimensions} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='6 by 5' />
                                        <label className='text-gray-600 text-[17px]'>Fragility:</label>
                                        <select name="fragility" value={formData.fragility} onChange={handleChange} className='border w-full rounded py-2 pl-3 text-[17px]! text-gray-400'>
                                            <option value="Normal">Normal</option>
                                            <option value="Fragile">Fragile</option>
                                        </select>
                                    </div>
                                    <div className="w-full! lg:w-[47.5%]!">
                                        <label className='text-gray-600 text-[17px]'>Weight in Kg:</label>
                                        <input required name="weight" value={formData.weight} onChange={handleChange} type="number" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Weight in kg' />
                                        <label className='text-gray-600 text-[17px]'>Customer Contact No:</label>
                                        <input required name="CustomerContactNo" value={formData.CustomerContactNo} onChange={handleChange} type="number" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Receiver Contact No' />
                                        <label className='text-gray-600 text-[17px]'>Delivery Address:</label>
                                        <input required name='DeliveryAddress' value={formData.DeliveryAddress} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Delivery Address' />
                                        <label className='text-gray-600 text-[17px]'>Pickup Address:</label>
                                        <input required name="PickupAddress" value={formData.PickupAddress} onChange={handleChange} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Pickup Address:' />

                                        <label className='text-gray-600 text-[17px]'>Order Amount:</label>
                                        <input required name="OrderAmount" value={formData.OrderAmount} onChange={handleChange} type="number" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='Amount' />
                                        <label className='text-gray-600 text-[17px]'>Order Date:</label>
                                        <input required readOnly name="OrderDate" value={formData.OrderDate} type="text" className='text-gray-600 border w-full rounded py-2 pl-3 text-[17px]!' placeholder='' />
                                    </div>
                                </div>
                                <button type='submit' className='bg-[#041026] text-white rounded py-1 mt-[5px]!'>Add</button>
                            </form>
                        </div>
                    </DialogTitle>
                </Dialog>
            </div>

            <div className='print:hidden overflow-x-scroll w-full! 2xl:w-350!'>
                <table className="bg-white border w-full rounded-lg shadow-md">
                    <thead className="text-black border-b-2 border-black">
                        <tr>
                            <td className="p-2 text-center text-nowrap font-semibold">Order Type</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Order Amount </td>
                            {/* <td className="p-2 text-center text-nowrap font-semibold">Tracking Id </td> */}
                            <td className="p-2 text-center text-nowrap font-semibold">Receiver Name </td>
                            {/* <td className="p-2 text-center text-nowrap font-semibold">Delivery City </td> */}
                            {/* <td className="p-2 text-center text-nowrap font-semibold">Pickup City </td> */}
                            {/* <td className="p-2 text-center text-nowrap font-semibold">Order Date </td> */}
                            <td className="p-2 text-center text-nowrap font-semibold">Receiver Contact</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Delivery Address</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Dimensions</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Pickup Address</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Confirm</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Status</td>
                            <td className="p-2 text-center text-nowrap font-semibold">Delete</td>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData?.length > 0 ? (
                            filteredData?.map((a) => (
                                <tr key={a?._id}>
                                    <td className="p-2 text-center text-nowrap">{a?.OrderType}</td>
                                    <td className="p-2 text-center text-nowrap">{a?.OrderAmount} Rs</td>
                                    {/* <td className="p-2 text-center text-nowrap">{a?._id}</td> */}
                                    <td className="p-2 text-center text-nowrap">{a?.CustomerName}</td>
                                    {/* <td className="p-2 text-center text-nowrap">{a?.DeliveryCity}</td> */}
                                    {/* <td className="p-2 text-center text-nowrap">{a?.PickupCity}</td> */}
                                    {/* <td className="p-2 text-center text-nowrap">{a?.OrderDate}</td> */}
                                    <td className="p-2 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                    <td className="p-2 text-center text-nowrap max-w-[100px] text-wrap!">{a?.DeliveryAddress}</td>
                                    <td className="p-2 text-center text-nowrap">{a?.Dimensions}</td>
                                    <td className="p-2 text-center text-nowrap max-w-[100px] text-wrap!">{a?.PickupAddress}</td>
                                    <td className="p-2 text-center text-nowrap">
                                        <button
                                            onClick={() => { confirmOrderFun(a?._id) }}
                                            className='bg-blue-200 p-2 rounded'>
                                            {a?.status !== "order - placed" ? "View Slip" : "Confirm Order"}
                                        </button>
                                        <Dialog
                                            key={a?._id}
                                            open={openMenuOrderDetail === a?._id}
                                            onClose={() => setOpenMenuOrderDetail(false)}
                                            PaperProps={{
                                                sx: {
                                                    width: "100%",
                                                    maxWidth: "900px",
                                                    margin: "auto"
                                                }
                                            }}
                                        >
                                            <DialogTitle
                                                sx={{
                                                    padding: "8px"
                                                    // paddingY: "10px",
                                                    // width: "90vw",
                                                    // display: "flex",
                                                    // flexDirection: "column",
                                                    // alignItems: 'flex-start',
                                                    // gap: "1px",
                                                }}
                                            >
                                                <div id="divToPrintOnSinglePage" className="border border-black p-3">
                                                    <div className="flex justify-end mb-2 print:hidden">
                                                        <button
                                                            onClick={() => window.print()}
                                                            className="bg-gray-300 rounded px-4 py-1 text-sm"
                                                        >
                                                            Print
                                                        </button>
                                                    </div>

                                                    <div className="flex justify-between items-center mb-3">
                                                        <img className="w-1/2 object-fit" src={logo} alt="logo" />
                                                        <QRCodeSVG
                                                            // className='w-[100px] h-[100px] sm:w-90 sm:h-90 md:w-110 md:h-100'
                                                            className='w-1/2'
                                                            value={a?.trackingId}
                                                            bgColor="#ffffff"
                                                            fgColor="#000000"
                                                            size={190}
                                                            level="H"  // error correction level (L, M, Q, H)
                                                            includeMargin={true}
                                                        />
                                                    </div>
                                                    <div className="overflow-x-auto w-full">
                                                        <table className="min-w-[700px] w-full border border-black border-collapse text-sm">
                                                            <tbody>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Tracking ID</td>
                                                                    <td className="border p-2">{a?.trackingId}</td>
                                                                    <td className="border p-2 font-semibold">Order Date</td>
                                                                    <td className="border p-2">
                                                                        {a?.OrderDate?.split(' ').slice(1, 4).join(' ')}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Order Type</td>
                                                                    <td className="border p-2">{a?.OrderType}</td>
                                                                    <td className="border p-2 font-semibold">Order Amount</td>
                                                                    <td className="border p-2">{a?.OrderAmount} Rs</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Receiver Name</td>
                                                                    <td className="border p-2">{a?.CustomerName}</td>
                                                                    <td className="border p-2 font-semibold">Contact No</td>
                                                                    <td className="border p-2">{a?.CustomerContactNo}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Delivery City</td>
                                                                    <td className="border p-2">{a?.DeliveryCity}</td>
                                                                    <td className="border p-2 font-semibold">Pickup City</td>
                                                                    <td className="border p-2">{a?.PickupCity}</td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Delivery Address</td>
                                                                    <td className="border p-2" colSpan="3">
                                                                        {a?.DeliveryAddress}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Pickup Address</td>
                                                                    <td className="border p-2" colSpan="3">
                                                                        {a?.PickupAddress}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Dimensions</td>
                                                                    <td className="border p-2">{a?.Dimensions}</td>
                                                                    <td className="border p-2 font-semibold">Sender</td>
                                                                    <td className="border p-2">
                                                                        {localStorage.getItem('name') ? localStorage.getItem('name') : null}
                                                                    </td>
                                                                </tr>
                                                                <tr>
                                                                    <td className="border p-2 font-semibold">Fragility</td>
                                                                    <td className="border p-2">{a?.fragility}</td>
                                                                    <td className="border p-2 font-semibold">Weight</td>
                                                                    <td className="border p-2">{a?.weight} Kg</td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </DialogTitle>
                                        </Dialog>
                                    </td>
                                    <td className="py-[2%] text-center text-nowrap font-semibold! text-md" style={{ color: (a?.status === "order - placed") ? "red" : "green" }}>{a?.status}</td>
                                    <td className="py-[2%] text-center text-nowrap font-semibold! text-md">
                                        <button
                                            disabled={a?.status !== "order - placed"}
                                            onClick={() => { deleteOrderFun(a?._id) }}
                                            className={`p-2 rounded text-white 
                                                ${a?.status === "order - placed"
                                                    ? "bg-red-400 hover:bg-red-500 cursor-pointer"
                                                    : "bg-orange-300 cursor-not-allowed"
                                                }`}>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )
                            :
                            <tr>
                                <td className='ml-6'>No Result</td>
                            </tr>
                        }
                    </tbody>
                </table>
            </div>
        </div >
    )
}