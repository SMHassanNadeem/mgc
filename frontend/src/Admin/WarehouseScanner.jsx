import { Dialog, DialogActions, DialogTitle, Button } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from "@zxing/library";
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function WarehouseScanner() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
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
          // alert(result)
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


  // -------------------API----------------------------------------
  async function getOrdersAtWarehouse() {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    const data = await fetch('http://localhost:3000/orders/orders-with-rider-scan-at-warehouse', {
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
    // console.log(info)
    return info;
  }
  const { data: apiData, isLoading: ordersLoading, error: ordersError } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrdersAtWarehouse,
    retry: 1,
    refetchOnWindowFocus: false
  })



  // -------------------Add to warehouse-------------------------------
  async function addToWarehouseFunLogic(id) {
    const data = await fetch(`http://localhost:3000/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        status: "At Warehouse - Rider Picked"
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
    const info = await data.json()
    // console.log(info)
  }
  const addToWarehouseFunMutation = useMutation({
    mutationFn: addToWarehouseFunLogic,
    onSuccess: () => {
      toast.success("added", {
        position: "top-right",
        autoClose: 3000,
      })
      // setResult(undefined)
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
  function addToWarehouseFun(id) {
    addToWarehouseFunMutation.mutate(id)
  }

  // -------------------Add to warehouse cancelled order -------------------------------
  async function addToWarehouseCanelledOrderFunLogic(id) {
    const data = await fetch(`http://localhost:3000/orders/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        status: "At Warehouse - Receiver Cancelled"
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
    const info = await data.json()
    // console.log(info)
  }
  const addToWarehouseCanelledOrderFunMutation = useMutation({
    mutationFn: addToWarehouseCanelledOrderFunLogic,
    onSuccess: () => {
      toast.success("added", {
        position: "top-right",
        autoClose: 3000,
      })
      // setResult(undefined)
      queryClient.invalidateQueries({ queryKey: ['orders'] });
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
  function addToWarehouseCanelledOrderFun(id) {
    addToWarehouseCanelledOrderFunMutation.mutate(id)
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

  return (
    <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-2 justify-start items-start w-7/8! sm:w-3/4 h-auto">
      <ToastContainer
        pauseOnHover
      />

      <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
        <form className='w-[60%]' onSubmit={submitFun}>
          {/* <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label> */}
          <input onChange={(e) => setInputTrackingId(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search, by entering tracking Id" />
          {/* <button type='submit'>Submit</button> */}
        </form>
        <button
          onClick={handleClick}
          className="bg-[#d10115] text-white font-bold py-3 px-4 rounded w-[40%]"
        >
          Scan QR Code
        </button>
      </div>
      <div className='flex flex-col items-center w-full h-full'>
        {
          scanning && (
            <div>
              <video ref={videoRef} width="300" height="300" className="border" />
              <p className="text-red-600 font-semibold mt-2">{scanMessage}</p>
            </div>
          )
        }
        {
          result && (
            <>
              <h3>Scanned Result: </h3>
              <div className='overflow-x-scroll w-full h-auto'>
                <table className="bg-white border w-screen rounded-lg shadow-md">
                  <thead className="bg-[#041026] text-white border-b-2 border-black">
                    <tr>
                      <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                      {/* <td className="p-4 text-center text-nowrap font-semibold">Delivery City </td> */}
                      <td className="p-4 text-center text-nowrap font-semibold">Tracking Id </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Add in Warehouse </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Receiver Contact No </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Items </td>
                      <td className="p-4 text-center text-nowrap font-semibold">Status </td>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData?.length > 0 ? (
                      filteredData?.map((a) => (
                        <tr>
                          <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                          <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                          {/* <td className="p-4 text-center text-nowrap">{a?.DeliveryCity}</td> */}
                          <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                          <td className="p-4 text-center text-nowrap">
                            {
                              a?.status === "Shipment - Rider Picked"
                                ?
                                <button className='bg-[#d10115] text-white px-4 py-3 rounded' onClick={() => addToWarehouseFun(a?._id)}>{a?.status === "Shipment - Rider Picked" ? "Add Picked" : "Add Cancelled"}</button>
                                :
                                <button className='bg-[#d10115] text-white px-4 py-3 rounded' onClick={() => addToWarehouseCanelledOrderFun(a?._id)}>{a?.status === "Shipment - Rider Picked" ? "Add Picked" : "Add Cancelled"}</button>
                            }
                          </td>
                          <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                          <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                          <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                          <td className="p-4 text-center text-nowrap">{a?.Items}</td>
                          <td className="p-4 text-center text-nowrap" style={{ color: (a?.status === "pending") ? "green" : "red" }}>{a?.status}</td>
                        </tr>
                      ))
                    )
                      :
                      <tr>
                        <td>No Result</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </>
          )
        }
      </div>

      {/* <div className="bg-white px-[2%] py-[2%] text-center rounded flex items-center justify-start w-full">
                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search ...." />
          </div> */}
    </div>
  )
}
