import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { jsPDF } from 'jspdf';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Accounts() {
    const navigate = useNavigate()

    const queryClient = useQueryClient()

    // const [ridersData, setRidersData] = useState("")
    // const [ordersData, setOrdersData] = useState()
    async function getOrders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/orders/orders-rider-delivered', {
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
        return info?.order;
    }
    const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
        retry: 1,
        refetchOnWindowFocus: true,
    })


    // Getting Rider Name
    async function getRiders() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }
        const data = await fetch('http://localhost:3000/riders/', {
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
    const { data: riderApiData, isLoading: ridersLoading, error: ridersError } = useQuery({
        queryKey: ['riders'],
        queryFn: getRiders,
        retry: 1,
        refetchOnWindowFocus: false,
    })
    function getRiderNameById(paramId) {
        if (!paramId || paramId === "") {
            return "Not Assigned";
        }
        if (!riderApiData || !Array.isArray(riderApiData)) {
            return "Loading...";
        }
        const rider = riderApiData.find(rider =>
            rider._id === paramId
        );
        return rider ? rider.ridersName || "Unknown Rider" : "Rider Not Found";
    }

    const generatePDF = () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = 200; // Fixed width for table
            let yPosition = margin;

            // Add rider info
            // const rider = ridersData?.[0];

            // Title
            pdf.setFontSize(20);
            pdf.text('INVOICE REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Vendor Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const DataRows = [
                ['Vendor Name:', filteredData?.creatorName && filteredData?.creatorName.length > 0 ? 'Different-Vendors' : filteredData[0]?.creatorName || 'N/A'],
                // ['CNIC:', filteredData?.Cnic || 'N/A'],
                // ['Contact No:', filteredData?.PhoneNo || 'N/A'],
                // ['Email:', filteredData?.Email || 0],
                // [':', filteredData?.assignedArea || 'N/A']
            ];
            DataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition); // Simple text, no wrapping
                yPosition += 7;
            });

            yPosition += 10;

            pdf.setFontSize(14);
            pdf.text('Date Range', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const DatesRows = [
                [filterStartDate ? 'From Date:' : 'All Orders', filterStartDate || ''],
                [filterEndDate ? 'To Date:' : 'All Orders', filterEndDate || ''],
                // ['Date Filter Applied:', (filterStartDate || filterEndDate) ? 'Yes' : 'No']
            ];

            DatesRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table - NO WRAPPING
            if (filteredData && filteredData.length > 0) {
                pdf.setFontSize(14);
                pdf.text('Orders Summary', margin, yPosition);
                yPosition += 10;

                pdf.setFontSize(8); // Smaller font for table

                // Table headers
                const headers = ['Vendor', 'Receiver', 'Delivery Address', 'Order Date', 'Amount', 'Status'];
                let xPosition = margin;
                const colWidth = contentWidth / headers.length; // Equal column width

                // Draw headers
                headers.forEach(header => {
                    pdf.text(header, xPosition, yPosition);
                    xPosition += colWidth;
                });

                yPosition += 7;

                // Draw line under headers
                pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);

                yPosition += 3;

                // Add orders with automatic pagination
                filteredData.forEach((order, index) => {
                    // Check if we need new page
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    // Row data - NO WRAPPING
                    const row = [
                        order?.creatorName || 'N/A',
                        order?.CustomerName || 'N/A',
                        order?.DeliveryAddress || 'N/A',
                        order?.OrderDate ? new Date(order.OrderDate).toLocaleDateString() : 'N/A',
                        order?.OrderAmount || '0',
                        order?.status || 'N/A'
                    ];

                    // Draw row cells - text will overflow if too long
                    xPosition = margin;
                    row.forEach(cell => {
                        pdf.text(cell.toString(), xPosition, yPosition);
                        xPosition += colWidth;
                    });

                    yPosition += 6;
                });

                // Add Tracking IDs section - NO WRAPPING
                yPosition += 10;

                if (yPosition > pageHeight - margin - 30) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.setFontSize(14);
                pdf.text('Tracking IDs', margin, yPosition);
                yPosition += 10;

                pdf.setFontSize(9);

                // List all tracking IDs - NO WRAPPING
                filteredData.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredData.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredData.length}`, pageWidth - margin - 30, yPosition, { align: 'right' });
            } else {
                // No orders message
                pdf.setFontSize(12);
                pdf.text('No orders found for the selected date range.', margin, yPosition);
            }

            // Save PDF
            pdf.save(`Report_${filteredData?.creatorName && filteredData?.creatorName.length > 0 ? 'Different-Vendors' : filteredData[0]?.creatorName}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    const [filterStartDate, setFilterStartDate] = useState("")
    const [filterEndDate, setFilterEndDate] = useState("")


    const filteredOrders = ordersData?.filter(a => a?.accountsStatus !== "Amount - Picked From Rider")?.filter(order => {
        if (!filterStartDate && !filterEndDate) {
            return true;
        }
        const orderDate = new Date(order?.RiderDeliveredDate);
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

    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = filteredOrders?.filter((item) =>
        [
            getRiderNameById(item?.ridersIdForDelivery),
            item?.trackingId,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );



    const generatePDFReturnToVendor = () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = 200; // Fixed width for table
            let yPosition = margin;

            // Add rider info
            // const rider = ridersData?.[0];

            // Title
            pdf.setFontSize(20);
            pdf.text('ACCOUNTS REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Vendor Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const DataRows = [
                ['Vendor Name:', filteredDataReturnToVendor?.creatorName && filteredDataReturnToVendor?.creatorName.length > 0 ? 'Different-Vendors' : filteredDataReturnToVendor[0]?.creatorName || 'N/A'],
                // ['CNIC:', filteredData?.Cnic || 'N/A'],
                // ['Contact No:', filteredData?.PhoneNo || 'N/A'],
                // ['Email:', filteredData?.Email || 0],
                // [':', filteredData?.assignedArea || 'N/A']
            ];
            DataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition); // Simple text, no wrapping
                yPosition += 7;
            });

            yPosition += 10;

            pdf.setFontSize(14);
            pdf.text('Date Range', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const DatesRows = [
                [filterStartDateReturnToVendor ? 'From Date:' : 'All Orders', filterStartDateReturnToVendor || ''],
                [filterEndDateReturnToVendor ? 'To Date:' : 'All Orders', filterEndDateReturnToVendor || ''],
                // ['Date Filter Applied:', (filterStartDate || filterEndDate) ? 'Yes' : 'No']
            ];

            DatesRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table - NO WRAPPING
            if (filteredDataReturnToVendor && filteredDataReturnToVendor.length > 0) {
                pdf.setFontSize(14);
                pdf.text('Orders Summary', margin, yPosition);
                yPosition += 10;

                pdf.setFontSize(8); // Smaller font for table

                // Table headers
                const headers = ['Vendor', 'Receiver', 'Delivery Address', 'Order Date', 'Amount', 'Status'];
                let xPosition = margin;
                const colWidth = contentWidth / headers.length; // Equal column width

                // Draw headers
                headers.forEach(header => {
                    pdf.text(header, xPosition, yPosition);
                    xPosition += colWidth;
                });

                yPosition += 7;

                // Draw line under headers
                pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);

                yPosition += 3;

                // Add orders with automatic pagination
                filteredDataReturnToVendor.forEach((order, index) => {
                    // Check if we need new page
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    // Row data - NO WRAPPING
                    const row = [
                        order?.creatorName || 'N/A',
                        order?.CustomerName || 'N/A',
                        order?.DeliveryAddress || 'N/A',
                        order?.OrderDate ? new Date(order.OrderDate).toLocaleDateString() : 'N/A',
                        order?.OrderAmount || '0',
                        order?.status || 'N/A'
                    ];

                    // Draw row cells - text will overflow if too long
                    xPosition = margin;
                    row.forEach(cell => {
                        pdf.text(cell.toString(), xPosition, yPosition);
                        xPosition += colWidth;
                    });

                    yPosition += 6;
                });

                // Add Tracking IDs section - NO WRAPPING
                yPosition += 10;

                if (yPosition > pageHeight - margin - 30) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.setFontSize(14);
                pdf.text('Tracking IDs', margin, yPosition);
                yPosition += 10;

                pdf.setFontSize(9);

                // List all tracking IDs - NO WRAPPING
                filteredDataReturnToVendor.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredDataReturnToVendor.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredDataReturnToVendor.length}`, pageWidth - margin - 30, yPosition, { align: 'right' });
            } else {
                // No orders message
                pdf.setFontSize(12);
                pdf.text('No orders found for the selected date range.', margin, yPosition);
            }

            // Save PDF
            pdf.save(`Report_${filteredDataReturnToVendor?.creatorName && filteredDataReturnToVendor?.creatorName.length > 0 ? 'Different-Vendors' : filteredDataReturnToVendor[0]?.creatorName}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };

    const [filterStartDateReturnToVendor, setFilterStartDateReturnToVendor] = useState("")
    const [filterEndDateReturnToVendor, setFilterEndDateReturnToVendor] = useState("")

    const filteredOrdersReturnToVendor = ordersData?.filter(a => a?.accountsStatus === "Amount - Picked From Rider")?.filter(order => {
        if (!filterStartDateReturnToVendor && !filterEndDateReturnToVendor) {
            return true;
        }
        const orderDateReturnToVendor = new Date(order?.RiderDeliveredDate);
        const startDateReturnToVendor = filterStartDate ? new Date(filterStartDateReturnToVendor) : null;
        const endDateReturnToVendor = filterEndDateReturnToVendor ? new Date(filterEndDateReturnToVendor) : null;

        // Adjust endDate to end of day (11:59:59 PM)
        if (endDateReturnToVendor) {
            endDateReturnToVendor.setHours(23, 59, 59, 999);
        }
        // Check if order date is within range
        if (startDateReturnToVendor && endDateReturnToVendor) {
            // Both dates selected: order must be between start and end
            return orderDateReturnToVendor >= startDateReturnToVendor && orderDateReturnToVendor <= endDateReturnToVendor;
        } else if (startDateReturnToVendor && !endDateReturnToVendor) {
            // Only start date selected: order must be on or after start
            return orderDateReturnToVendor >= startDateReturnToVendor;
        } else if (!startDateReturnToVendor && endDateReturnToVendor) {
            // Only end date selected: order must be on or before end
            return orderDateReturnToVendor <= endDateReturnToVendor;
        }
        return true;
    })
    const [searchTermReturnToVendor, setSearchTermReturnToVendor] = useState("")
    const filteredDataReturnToVendor = filteredOrdersReturnToVendor?.filter((item) =>
        [
            item?.creatorName,
            item?.trackingId,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTermReturnToVendor.toLowerCase())
        )
    );

    const [page, setPage] = useState(1)


    async function updateAccStatusLogic(orderId) {
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
                accountsStatus: "Amount - Picked From Rider",
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
    const updateAccStatusMutation = useMutation({
        mutationFn: updateAccStatusLogic,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            toast.success(`Failed : ${error.message}`, {
                position: "top-right",
                autoClose: 3000,
                style: {
                    background: '#d10115',
                    color: 'white',
                },
            })
        }
    })
    function updateAccStatusFun(orderId) {
        updateAccStatusMutation.mutate(orderId);
    }

    return (
        <>
            <>
                <ToastContainer
                    pauseOnHover
                />

                <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-4 justify-start items-start w-7/8! sm:w-3/4 h-screen">
                    <div className="w-full flex gap-2 text-white">
                        <button onClick={() => setPage(1)} className={`font-bold text-lg! w-1/2! ${page === 1 ? "bg-blue-700" : "bg-blue-500"} py-2 rounded`}>
                            Amount With Rider
                        </button>
                        <button onClick={() => setPage(2)} className={`font-bold text-lg! w-1/2! ${page === 2 ? "bg-blue-700" : "bg-blue-500"} py-2 rounded`}>
                            Amount To Return To Sender
                        </button>
                        {/* <button onClick={() => setPage(3)} className={`font-bold text-lg! w-1/3! ${page === 3 ? "bg-blue-700" : "bg-blue-500"} py-2 rounded`}>
                            Our Delivery Fee
                        </button> */}
                    </div>

                    {
                        page === 1 &&
                        <div className="w-full flex flex-col gap-2">
                            <h3>Accounts </h3>
                            <div className="my-3 bg-white px-[2%] p-4 text-center rounded flex items-center justify-start w-full">
                                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                                <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search by rider name" />
                            </div>
                            <div className="flex items-center justify-between">
                                <h2>{filterStartDate !== "" || filterEndDate !== "" ? filterStartDate + " to " + filterEndDate : "All Orders"}</h2>
                                <button onClick={generatePDF} className="bg-green-600 rounded text-white p-2">Generate PDF</button>
                                <div className="flex items-center gap-2">
                                    <label className="text-red-500 font-bold">Set Filter : </label>
                                    <h5 className="m-0 p-0">from</h5>
                                    <input className="bg-blue-200 rounded" type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                                    <h5 className="m-0 p-0">to</h5>
                                    <input className="bg-red-200 rounded" type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                                </div>
                            </div>
                            <div className='w-full h-auto overflow-scroll'>
                                <table className="bg-white border w-full rounded-lg shadow-md">
                                    <thead className="text-white bg-[#041026]">
                                        <tr>
                                            <td className="p-4 text-center text-nowrap font-semibold">Rider Delivered</td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Order Amount</td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Confirm Received </td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredData?.filter(a => a?.accountsStatus !== "Amount - Picked From Rider")?.map((a) => (
                                                <tr>
                                                    <td className="p-4 text-center text-nowrap">{getRiderNameById(a?.ridersIdForDelivery)}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.OrderAmount} Rs</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                    <td className="p-4 text-center text-nowrap">
                                                        <button
                                                            onClick={() => updateAccStatusFun(a?._id)}
                                                            className="bg-red-500 text-white rounded p-2"
                                                        >
                                                            Confirm
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>}


                    {
                        page === 2 &&
                        <div className="w-full flex flex-col gap-2">
                            <h3>Accounts </h3>
                            <div className="my-3 bg-white px-[2%] p-4 text-center rounded flex items-center justify-start w-full">
                                <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                                <input onChange={(e) => setSearchTermReturnToVendor(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search by Sender Name" />
                            </div>
                            <div className="flex items-center justify-between">
                                <h2>{filterStartDateReturnToVendor !== "" || filterEndDateReturnToVendor !== "" ? filterStartDateReturnToVendor + " to " + filterEndDateReturnToVendor : "All Orders"}</h2>
                                <button onClick={generatePDFReturnToVendor} className="bg-green-600 rounded text-white p-2">Generate PDF</button>
                                <div className="flex items-center gap-2">
                                    <label className="text-red-500 font-bold">Set Filter : </label>
                                    <h5 className="m-0 p-0">from</h5>
                                    <input className="bg-blue-200 rounded" type="date" value={filterStartDateReturnToVendor} onChange={(e) => setFilterStartDateReturnToVendor(e.target.value)} />
                                    <h5 className="m-0 p-0">to</h5>
                                    <input className="bg-red-200 rounded" type="date" value={filterEndDateReturnToVendor} onChange={(e) => setFilterEndDateReturnToVendor(e.target.value)} />
                                </div>
                            </div>
                            <div className='w-full h-auto overflow-scroll'>
                                <table className="bg-white border w-full rounded-lg shadow-md">
                                    <thead className="text-white bg-[#041026]">
                                        <tr>
                                            <td className="p-4 text-center text-nowrap font-semibold">Rider Delivered</td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Order Amount</td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                            <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                            {/* <td className="p-4 text-center text-nowrap font-semibold">Confirm Received </td> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredDataReturnToVendor?.filter(a => a?.accountsStatus === "Amount - Picked From Rider")?.map((a) => (
                                                <tr>
                                                    <td className="p-4 text-center text-nowrap">{getRiderNameById(a?.ridersIdForDelivery)}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.OrderAmount} Rs</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                    <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                    {/* <td className="p-4 text-center text-nowrap">
                                                    <button
                                                        onClick={() => updateAccStatusFun(a?._id)}
                                                        className="bg-red-500 text-white rounded p-2"
                                                    >
                                                        Confirm
                                                    </button>
                                                </td> */}
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>}
                </div>
            </>
        </>
    )
}