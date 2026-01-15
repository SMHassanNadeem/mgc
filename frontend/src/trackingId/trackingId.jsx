// icons
import image1 from '../assets/statusIcons/1.png'
import image2 from '../assets/statusIcons/2.png'
import image3 from '../assets/statusIcons/3.png'
import image4 from '../assets/statusIcons/4.png'
import image5 from '../assets/statusIcons/5.png'
import image6 from '../assets/statusIcons/6.png'
import image7 from '../assets/statusIcons/7.png'
import image8 from '../assets/statusIcons/8.png'
import image9 from '../assets/statusIcons/9.png'
import image10 from '../assets/statusIcons/10.png'

// banner
import banner from '../assets/banners/trackingIdBanner.jpg'
import { useState } from 'react'

export default function TrackingId() {
    const statusData = [
        { iconURL: image1, statusText: "Booked", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image2, statusText: "Rider Assigned", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image3, statusText: "Arrived at Origin", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image4, statusText: "In Transit", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image5, statusText: "Arrived at Destination", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image6, statusText: "Out for Delivery", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image7, statusText: "Delivered", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image8, statusText: "Return - Confirm", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image9, statusText: "Return - In Transit", statusDate: "12/2/2025, 6:16:52 PM" },
        { iconURL: image10, statusText: "Return - Arrived at Origin", statusDate: "12/2/2025, 6:16:52 PM" },
    ]

    const [trackingId, setTrackingId] = useState("")
    const [apiData, setApiData] = useState()
    const [rawData, setRawData] = useState()
    const [error, setError] = useState("")
    
    // Function to get icon based on status
    const getStatusIcon = (status) => {
        if (!status) return image1; // Default icon
        
        // Find matching status in statusData
        const matchedStatus = statusData.find(item => 
            status.toLowerCase().includes(item.statusText.toLowerCase())
        );
        
        // If no exact match, try partial matches
        if (!matchedStatus) {
            if (status.toLowerCase().includes("booked")) return image1;
            if (status.toLowerCase().includes("rider") && status.toLowerCase().includes("assigned")) return image2;
            if (status.toLowerCase().includes("origin")) return image3;
            if (status.toLowerCase().includes("transit")) return image4;
            if (status.toLowerCase().includes("destination")) return image5;
            if (status.toLowerCase().includes("delivery")) return image6;
            if (status.toLowerCase().includes("delivered")) return image7;
            if (status.toLowerCase().includes("return")) return image8;
        }
        
        return matchedStatus ? matchedStatus.iconURL : image1;
    }

    async function track(param) {
        param.preventDefault();

        if(trackingId === ""){
            setError("Please enter a tracking number")
            return;
        }

        try {
            const Response = await fetch(`http://localhost:3000/orders/track/${trackingId}`,{
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
            });
            
            if (!Response.ok) {
                throw new Error('Failed to fetch tracking information');
            }
            
            const Data = await Response.json();
            
            if (Data.message && Data.message.includes("not found")) {
                setApiData(null);
                setRawData(Data);
                setError("");
            } else {
                // Create an array with the order data
                const orderArray = Data.order ? [Data.order] : [];
                setApiData(orderArray);
                setRawData(Data);
                setError("");
            }
        } catch (err) {
            setError("Failed to fetch tracking information. Please try again.");
            setApiData(null);
            setRawData(null);
        }
    }

    return (
        <>
            <div className="w-full flex flex-col items-center">
                <img className="object-fill w-full h-[60vh]!" src={banner} alt="" />
                <div className=" mb-30! flex flex-column gap-3 xl:flex-row! justify-between items-center w-80! sm:w-150! md:w-200! lg:w-250! xl:w-300! -mt-10 rounded text-gray-200 py-4 px-3 bg-[#ff3f39]">
                    <p className='m-0 text-2xl font-bold'>Enter Your Tracking Number</p>
                    <form onSubmit={track} className='flex flex-nowrap w-full xl:w-[400px]!'>
                        <input 
                            value={trackingId} 
                            onChange={(e) => {
                                setTrackingId(e.target.value);
                                setError("");
                            }} 
                            placeholder='Enter Tracking #' 
                            className='bg-white w-[80%] h-15 pl-5 text-black!' 
                            type="text" 
                        />
                        <button type='submit' className='bg-[#041026] px-0 w-[20%] py-3 text-xl!'>
                            Track
                        </button>
                    </form>
                </div>
                
                {error && (
                    <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {
                    apiData && apiData.length > 0 && rawData?.message === undefined
                    ?
                        <>
                            <div className="flex justify-between gap-2 w-80! sm:w-150! md:w-200! xl:w-300!">
                                <div className="w-[45%] shadow shadow-black/30 mt-10">
                                    <h3 className="mt-0 py-3 pl-3 my-3 bg-gray-300 rounded w-full">Shipper Info</h3>
                                    <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">
                                        Shipper Info: <b className='pr-10'>{apiData[0]?.creatorName || "Retail Store"}</b>
                                    </h5>
                                    <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">
                                        Origin: <b className='pr-10'>{apiData[0]?.PickupAddress || "Karachi"}</b>
                                    </h5>
                                </div>

                                <div className="w-[45%] shadow shadow-black/30 mt-10">
                                    <h3 className="mt-0 py-3 pl-3 my-3 bg-gray-300 rounded w-full">Consignee Info</h3>
                                    <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">
                                        Consignee Info: <b className='pr-10'>{apiData[0]?.CustomerName || "sherwear"}</b>
                                    </h5>
                                    <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">
                                        Destination: <b className='pr-10'>{apiData[0]?.DeliveryAddress || "Sialkot"}</b>
                                    </h5>
                                </div>
                            </div>

                            <div className="py-5 flex flex-col items-center w-full h-auto">
                                <div className="h-full! w-80! sm:w-150! md:w-200! xl:w-300! flex flex-col items-center">
                                    <ul className="shadow shadow-black/30 p-0 w-full! h-full! flex flex-col items-center gap-3 pb-10!">
                                        <li className="mt-0 py-3 pl-3 my-3 bg-gray-300 text-gray-500 rounded w-full">
                                            <h2>Tracking History</h2>
                                        </li>
                                        {apiData?.map(p => (
                                            <li key={p?._id} className="p-0 flex items-center ml-0! xl:ml-30! gap-0! sm:gap-3! w-full">
                                                <span className="rounded-[50%] w-[100px]! h-[100px]! sm:w-[100px]! bg-red-500 text-white flex justify-center items-center">
                                                    {/* Use getStatusIcon function to get the correct image */}
                                                    <img 
                                                        className="invert w-[50px] h-[50px]" 
                                                        src={getStatusIcon(p?.status)} 
                                                        alt={p?.status || "Status"} 
                                                    />
                                                </span>
                                                <span className="shadow-md shadow-black/30 rounded py-4 px-3 flex items-center justify-between w-[80%]">
                                                    <h3 className="text-wrap">{p?.status}</h3>
                                                    {p?.OrderDate && (
                                                        <h6 className="text-wrap text-gray-500">
                                                            {/* {new Date(p.OrderDate).toLocaleDateString()} */}
                                                        </h6>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </>
                        :
                        rawData?.message ? 
                            <h1 className='my-20! text-red-600! font-bold!'>{rawData.message}</h1> 
                            : 
                            trackingId && <h1 className='my-20! text-red-600! font-bold!'>No Result Found!</h1>
                }
            </div>
        </>
    )
}


// // icons
// import image1 from '../assets/statusIcons/1.png'
// import image2 from '../assets/statusIcons/2.png'
// import image3 from '../assets/statusIcons/3.png'
// import image4 from '../assets/statusIcons/4.png'
// import image5 from '../assets/statusIcons/5.png'
// import image6 from '../assets/statusIcons/6.png'
// import image7 from '../assets/statusIcons/7.png'
// import image8 from '../assets/statusIcons/8.png'
// import image9 from '../assets/statusIcons/9.png'
// import image10 from '../assets/statusIcons/10.png'

// // banner
// import banner from '../assets/banners/trackingIdBanner.jpg'
// import { useState } from 'react'

// export default function TrackingId() {
//     const statusData = [
//         { iconURL: image1, statusText: "Shipment - Booked", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image2, statusText: "Shipment - Rider Picked", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image3, statusText: "Shipment - Arrived at Origin", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image4, statusText: "Shipment - In Transit", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image5, statusText: "Shipment - Arrived at Destination", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image6, statusText: "Shipment - Out for Delivery", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image7, statusText: "Shipment - Shipper Advise Requested", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image8, statusText: "Return - Confirm", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image9, statusText: "Return - In Transit", statusDate: "12/2/2025, 6:16:52 PM" },
//         { iconURL: image10, statusText: "Return - Arrived at Origin", statusDate: "12/2/2025, 6:16:52 PM" },
//     ]

//     const [trackingId, setTrackingId] = useState("")
//     const [apiData, setApiData] = useState()
//     const [rawData, setRawData] = useState()
//     const [missingError,setMissingError] = useState("")
//     async function track(param) {
//         param.preventDefault();

//         if(trackingId === ""){
//             setError("")
//         }

//         const Response = await fetch(`http://localhost:3000/orders/track/${trackingId}`,{
//             method: 'GET',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//         });
//         const Data = await Response.json();
//         setApiData([Data?.order])
//         setRawData(Data)
//     }

//     return (
//         <>
//             <div className="w-full flex flex-col items-center">
//                 <img className="object-fill w-full h-[60vh]!" src={banner} alt="" />
//                 <div className="flex flex-column gap-3 xl:flex-row! justify-between items-center w-80! sm:w-150! md:w-200! lg:w-250! xl:w-300! -mt-10 rounded text-gray-200 py-4 px-3 bg-[#ff3f39]">
//                     <p className='m-0 text-2xl font-bold'>Enter Your Tracking Number</p>
//                     <form onSubmit={track} className='flex flex-nowrap w-full xl:w-[400px]!'>
//                         <input value={trackingId} onChange={(e) => setTrackingId(e.target.value)} placeholder='Enter Tracking #' className='bg-white w-[80%] h-15 pl-5 text-black!' type="text" />
//                         <button type='submit' className='bg-[#041026] px-0 w-[20%] py-3 text-xl!'>
//                             Track
//                         </button>
//                     </form>
//                 </div>

//                 {
//                     apiData?.length >= 0 && rawData?.message === undefined
//                     ?
//                         <>
//                             <div className="flex justify-between gap-2 w-80! sm:w-150! md:w-200! xl:w-300!">
//                                 <div className="w-[45%] shadow shadow-black/30 mt-10">
//                                     <h3 className="mt-0 py-3 pl-3 my-3 bg-gray-300 rounded w-full">Shipper Info</h3>
//                                     <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">Shipper Info: <b className='pr-10'>Retail Store</b></h5>
//                                     <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">Origin: <b className='pr-10'>Karachi</b></h5>
//                                 </div>

//                                 <div className="w-[45%] shadow shadow-black/30 mt-10">
//                                     <h3 className="mt-0 py-3 pl-3 my-3 bg-gray-300 rounded w-full">Consignee Info</h3>
//                                     <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">Consignee Info: <b className='pr-10'>sherwear</b></h5>
//                                     <h5 className="mt-0 py-3 pl-3 my-3 rounded w-full flex flex-col md:flex-row justify-between text-gray-500!">Destination: <b className='pr-10'>Sialkot</b></h5>
//                                 </div>
//                             </div>

//                             <div className="py-5 flex flex-col items-center w-full h-auto">
//                                 <div className="h-full! w-80! sm:w-150! md:w-200! xl:w-300! flex flex-col items-center">
//                                     <ul className="shadow shadow-black/30 p-0 w-full! h-full! flex flex-col items-center gap-3 pb-10!">
//                                         <li className="mt-0 py-3 pl-3 my-3 bg-gray-300 text-gray-500 rounded w-full">
//                                             <h2>Tracking History</h2>
//                                         </li>
//                                         {apiData?.map(p => (
//                                             <li key={p?._id} className="p-0 flex items-center ml-0! xl:ml-30! gap-0! sm:gap-3! w-full">
//                                                 <span className="rounded-[50%] w-[100px]! h-[100px]! sm:w-[100px]! bg-red-500 text-white flex justify-center items-center">
//                                                     <img className="invert w-[50px] h-[50px]" src={p.iconURL} alt="" />
//                                                 </span>
//                                                 <span className="shadow-md shadow-black/30 rounded py-4 px-3 flex items-center justify-between w-[80%]">
//                                                     <h3 className="text-wrap">{p?.status}</h3>
//                                                     {/* <h6 className="text-wrap" >{p.statusDate}</h6> */}
//                                                 </span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             </div>
//                         </>
//                         :
//                         <h1 className='my-20! text-red-600! font-bold!'>{rawData?.message ? rawData?.message || rawData?.error : "No Result"}</h1> 
//                 }
//             </div>
//         </>
//     )
// } 


