import logo from '../assets/MGC.png';
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"
import { jsPDF } from 'jspdf';

export default function RidersDetails() {
    const navigate = useNavigate()

    const [ridersData, setRidersData] = useState("")
    const [ordersData, setOrdersData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const data = await fetch(`http://localhost:3000/orders/get-all-orders`, {
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
            setOrdersData(info)
        }
        a();
    }, [])


    const loadImage = (url) =>
        new Promise((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve(img);
        });
    const generatePDF = async () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 5;
            const pageWidth = 250;
            const pageHeight = 297;
            const contentWidth = 190; // Fixed width for table
            let yPosition = margin;

            // Add rider info
            const rider = ridersData?.[0];

            // Title
            yPosition += 10;

            const img = await loadImage(logo);

            // Sizes
            const headingFontSize = 20;
            const logoHeight = 25;
            const logoWidth = 70    ;
            pdf.setFontSize(headingFontSize);
            const text = 'INVOICE REPORT';
            const textWidth = pdf.getTextWidth(text);
            const gap = 3;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = ((pdf.internal.pageSize.getWidth() - totalWidth) / 2)-40;
            pdf.addImage(
                img,
                'PNG',
                startX,
                yPosition - logoHeight + 15, // vertical alignment tweak
                logoWidth,
                logoHeight
            );
            pdf.text(
                text,
                (pageWidth / 2),
                yPosition
                , { align: 'center' }
            );
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${new Date().toLocaleDateString()}`, (pageWidth / 2), yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Sender Info', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const DataRows = [
                ['Sender Name:', filteredData?.creatorName && filteredData?.creatorName.length > 0 ? 'Different-Senders' : filteredData[0]?.creatorName || 'N/A'],
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
                const headers = ['Vendor', 'Receiver', 'Order Date', 'Amount', 'Status'];
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
                        // order?.DeliveryAddress || 'N/A',
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
                pdf.text(`Total Orders: ${filteredData.length}`, pageWidth - margin - 60, yPosition, { align: 'right' });
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

    const filteredOrders = ordersData?.filter(order => {
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

    const [searchTerm, setSearchTerm] = useState("")
    const filteredData = filteredOrders?.filter((item) =>
        [
            item?.creatorName,
            item?.trackingId,
        ].some((field) =>
            String(field).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <>
            <>
                <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-4 justify-start items-start w-7/8! sm:w-3/4 h-screen">
                    <div className="bg-white px-[2%] p-4 text-center rounded flex items-center justify-start w-full">
                        <label htmlFor="search"><i className="fas fa-search text-gray-400 m-0 p-0"></i></label>
                        <input onChange={(e) => setSearchTerm(e.target.value)} id="search" className="rounded pl-2 w-[150px] sm:w-full focus:outline-0 text-md! font-medium" type="search" placeholder="Search through vendor name" />
                    </div>

                    <div className="w-full flex flex-col gap-2">
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
                                        <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                        {/* <td className="p-4 text-center text-nowrap font-semibold">After Assign, Delivered in </td> */}
                                        <td className="p-4 text-center text-nowrap font-semibold">Order Date </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Receiver Contact No </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Pickup Address </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Order Type</td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Order Amount</td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Status</td>
                                        <td className="p-4 text-center text-nowrap font-semibold">Dimensions </td>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        filteredData?.map((a) => (
                                            <tr>
                                                <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                {/* <td className="p-4 text-center text-nowrap">{timerFun(a?.RiderAssignedDate, a?.RiderDeliveredDate)}</td> */}
                                                <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                                <td className="p-4 text-center text-nowrap max-w-[100px] text-wrap!">{a?.PickupAddress}</td>

                                                <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td>
                                                <td className="p-4 text-center text-nowrap max-w-[100px] text-wrap!">{a?.DeliveryAddress}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                                <td className="p-4 text-center text-nowrap">{a?.Dimensions}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </>
        </>
    )
}