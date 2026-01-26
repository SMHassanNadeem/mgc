import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function RiderScanOrders() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [openMenu, setOpenMenu] = useState(false)
    const [openMenuAddUser, setOpenMenuAddUser] = useState(false)
    const [searchTerm, setSearchTerm] = useState("");
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const videoRef = useRef(null);
    const codeReader = useRef(new BrowserMultiFormatReader());

    // Error Handling for scanner
    const [scanMessage, setScanMessage] = useState("Camera is starting...");
    const [errorCount, setErrorCount] = useState(0);
    const lastFrameRef = useRef(null);

    // -----------------------Scanner---------------------------------
    useEffect(() => {
        if (scanning) {
            startScanning();
            setScanMessage("Scanning")
        } else {
            stopScanning();
        }
        return () => stopScanning();
    }, [scanning]);

    // Error Handling for scanner
    const analyzeFrame = () => {
        if (!videoRef.current) return;

        const video = videoRef.current;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // LIGHT CHECK
        let total = 0;
        for (let i = 0; i < frame.data.length; i += 4) {
            total += frame.data[i] + frame.data[i + 1] + frame.data[i + 2];
        }
        const brightness = total / (frame.data.length / 4);

        if (brightness < 80) {
            setScanMessage("⚠ Lighting too low! Increase light.");
            return;
        } else {
            setScanMessage("Scanning")
        }

        // SHAKE / BLUR CHECK
        if (lastFrameRef.current) {
            let diff = 0;
            for (let i = 0; i < frame.data.length; i += 4) {
                diff += Math.abs(frame.data[i] - lastFrameRef.current.data[i]);
            }

            if (diff > 10000000) {
                setScanMessage("⚠ Camera shaking! Hold still.");
                return;
            } else {
                setScanMessage("Scanning")
            }
        }

        lastFrameRef.current = frame;
    };

    const startScanning = () => {
        codeReader.current.decodeFromVideoDevice(
            null,
            videoRef.current,
            (result, err) => {
                analyzeFrame(); // for error handling of scanner
                if (result) {
                    setResult(result.getText())
                    setScanning(false)
                }
                if (err && (err.name === "NotFoundException")) {
                    console.error(err)
                }
            }
        )
    }
    const stopScanning = () => {
        codeReader.current.reset()
        const stream = videoRef.current?.srcObject;
        const tracks = stream?.getTracks();
        if (tracks) {
            tracks.forEach((tracks) => tracks.stop())
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }
    const handleClick = () => {
        setResult(null)
        setScanning(!scanning)
    }
    useEffect(() => {
        if (result) setSearchTerm(result);
    }, [result]);


    // ------------------- API----------------------------------------
    async function getRiderAssignedOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch('http://localhost:3000/orders/assigned-to-rider-to-pickup-auth-rider', {
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
        queryKey: ['assignedOrders'],
        queryFn: getRiderAssignedOrders,
        retry: 1,
        refetchOnWindowFocus: false
    })

    async function addShipmentFunLogic(id) {
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
                status: "Shipment - Rider Picked",
                RiderDeliveredDate: new Date().toString().split(' ').splice(0, 5).join(' ')
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
    const addShipmentMutation = useMutation({
        mutationFn: addShipmentFunLogic,
        onSuccess: () => {
            toast.success("added", {
                position: "top-right",
                autoClose: 3000,
            })
            // setResult(undefined)
            queryClient.invalidateQueries({ queryKey: ['assignedOrders'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
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
    function addShipmentFun(id) {
        addShipmentMutation.mutate(id)
    }


    const [openMenuCancelOrder, setOpenMenuCancelOrder] = useState(false)
    async function cancelShipmentFunLogic({ id, cancelReasonsText }) {
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
                status: "Shipment - Cancelled By Vendor",
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
    const cancelShipmentMutation = useMutation({
        mutationFn: cancelShipmentFunLogic,
        onSuccess: () => {
            toast.success("Canceled", {
                position: "top-right",
                autoClose: 3000,
            })
            // setResult(undefined)
            queryClient.invalidateQueries({ queryKey: ['assignedOrders'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
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
    function cancelShipmentFun(id) {
        const cancelReasonsText = reasonsArray.join(',')
        cancelShipmentMutation.mutate({ id, cancelReasonsText })
    }

    // -------------------Search--------------------------------------------
    const filteredData = apiData?.filter((item) =>
        [item.trackingId]
            .some((field) =>
                String(field).toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const [inputTrackingId, setInputTrackingId] = useState("");
    function submitFun(e) {
        e.preventDefault();
        setResult(inputTrackingId)
    }


    const [selectedOrderId, setSelectedOrderId] = useState(null);
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

    return (
        <div className=" bg-gray-100 flex flex-col gap-4 p-4 mt-2 w-screen h-auto">

            <ToastContainer
                pauseOnHover
            />

            <div className="flex items-center! justify-between w-full">
                <form className='w-full' onSubmit={submitFun}>
                    <input onChange={(e) => setInputTrackingId(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Scan, by entering tracking Id" />
                </form>
                <button
                    onClick={handleClick}
                    className="bg-[#d10115] text-white font-bold py-3 px-4 rounded w-[20%]"
                >
                    Scan QR Code
                </button>
            </div>
            <div className='m-auto w-full h-full'>
                {
                    scanning && (
                        <div className='w-full'>
                            <video ref={videoRef} width="300" height="300" className="" />
                            <p className="text-red-600 font-semibold">{scanMessage}</p>
                        </div>
                    )
                }
                {
                    result && (
                        <>
                            <h3>Scanned Result: </h3>
                            {filteredData?.length > 0 ? (
                                filteredData?.map((a) => (
                                    <div className='overflow-x-scroll w-[97vw] h-auto'>
                                        <table className="bg-white border w-full rounded-lg shadow-md">
                                            <thead className="bg-[#041026] text-white border-b-2 border-black">
                                                <tr>
                                                    <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                                    <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>
                                                    <td className="p-4 text-center text-nowrap font-semibold">Tracking Id </td>
                                                    <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Customer Contact No </td> */}
                                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td> */}
                                                    <td className="p-4 text-center text-nowrap font-semibold">Add </td>
                                                    {/* <td className="p-4 text-center text-nowrap font-semibold">Cancel </td> */}
                                                    <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.PickupAddress}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                    {/* <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td> */}
                                                    {/* <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td> */}
                                                    <td className="p-4 text-center text-nowrap">
                                                        <button className='bg-[#041026] text-white p-2 rounded' onClick={() => addShipmentFun(a?._id)}>Add</button>
                                                    </td>
                                                    {/* <td className="p-4 text-center text-nowrap">
                                                        <button className='bg-[#d10115] text-white p-2 rounded' onClick={() => { setOpenMenuCancelOrder(a?._id), setSelectedOrderId(a?._id); }}>Cancel</button>
                                                    </td> */}
                                                    <td className="p-4 text-center text-nowrap" style={{ color: (a?.status === "pending") ? "green" : "red" }}>{a?.status}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                        <Dialog
                                            open={openMenuCancelOrder === a?._id}
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
                                                        <button className='bg-[#d10115] text-white p-2 rounded' type='button' onClick={() => cancelShipmentFun(selectedOrderId)}>Cancel</button>
                                                    </form>
                                                </div>
                                            </DialogTitle>
                                        </Dialog>
                                    </div>
                                ))
                            )
                                :
                                <h1 className='my-5 text-red-600!'>No Result</h1>
                            }
                        </>
                    )
                }
            </div>
        </div>
    )
}