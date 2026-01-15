import { useCallback, useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { jsPDF } from 'jspdf';

export default function RidersDetails() {
    const { rid } = useParams()
    const [ridersData, setRidersData] = useState()
    const navigate = useNavigate()



    // ------------------------------Getting Riders Data -------------------------------
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const data = await fetch(`http://localhost:3000/riders/${rid}`, {
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
            setRidersData([info?.riders])
            // console.log(info)
        }
        a();
    }, [])



    // --------------------------------Getting Orders--------------------------------
    // const data = await fetch(`http://localhost:3000/orders/rider/${rid}`, {

    const [pickupOrdersData, setPickupOrdersData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const data = await fetch(`http://localhost:3000/orders/rider/pickup/${rid}`, {
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
            setPickupOrdersData(info?.orders)
        }
        a();
    }, [])

    const [deliveryOrdersData, setDeliveryOrdersData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const data = await fetch(`http://localhost:3000/orders/rider/delivery/${rid}`, {
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
            setDeliveryOrdersData(info?.orders)
        }
        a();
    }, [])

    const [returnOrdersData, setReturnOrdersData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            const data = await fetch(`http://localhost:3000/orders/rider/return/${rid}`, {
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
            setReturnOrdersData(info?.orders)
        }
        a();
    }, [])




    // ------------------Filtering---------------------------------------
    const [filterStartDateDelivery, setFilterStartDateDelivery] = useState("")
    const [filterEndDateDelivery, setFilterEndDateDelivery] = useState("")
    const filteredOrdersDelivery = deliveryOrdersData?.filter(order => {
        if (!filterStartDateDelivery && !filterEndDateDelivery) {
            return true;
        }
        const orderDateDelivery = new Date(order?.OrderDate);
        const startDateDelivery = filterStartDateDelivery ? new Date(filterStartDateDelivery) : null;
        const endDateDelivery = filterEndDateDelivery ? new Date(filterEndDateDelivery) : null;

        // Adjust endDate to end of day (11:59:59 PM)
        if (endDateDelivery) {
            endDateDelivery.setHours(23, 59, 59, 999);
        }
        // Check if order date is within range
        if (startDateDelivery && endDateDelivery) {
            // Both dates selected: order must be between start and end
            return orderDateDelivery >= startDateDelivery && orderDateDelivery <= endDateDelivery;
        } else if (startDateDelivery && !endDateDelivery) {
            // Only start date selected: order must be on or after start
            return orderDateDelivery >= startDateDelivery;
        } else if (!startDateDelivery && endDateDelivery) {
            // Only end date selected: order must be on or before end
            return orderDateDelivery <= endDateDelivery;
        }
        return true;
    })

    const [filterStartDatePickup, setFilterStartDatePickup] = useState("")
    const [filterEndDatePickup, setFilterEndDatePickup] = useState("")
    const filteredOrdersPickup = pickupOrdersData?.filter(order => {
        if (!filterStartDatePickup && !filterEndDatePickup) {
            return true;
        }
        const orderDatePickup = new Date(order?.OrderDatePickup);
        const startDatePickup = filterStartDatePickup ? new Date(filterStartDatePickup) : null;
        const endDatePickup = filterEndDatePickup ? new Date(filterEndDatePickup) : null;

        // Adjust endDate to end of day (11:59:59 PM)
        if (endDatePickup) {
            endDatePickup.setHours(23, 59, 59, 999);
        }
        // Check if order date is within range
        if (startDatePickup && endDatePickup) {
            // Both dates selected: order must be between start and end
            return orderDatePickup >= startDatePickup && orderDatePickup <= endDatePickup;
        } else if (startDatePickup && !endDatePickup) {
            // Only start date selected: order must be on or after start
            return orderDatePickup >= startDatePickup;
        } else if (!startDatePickup && endDatePickup) {
            // Only end date selected: order must be on or before end
            return orderDatePickup <= endDatePickup;
        }
        return true;
    })

    const [filterStartDateReturn, setFilterStartDateReturn] = useState("")
    const [filterEndDateReturn, setFilterEndDateReturn] = useState("")
    const filteredOrdersReturn = returnOrdersData?.filter(order => {
        if (!filterStartDateReturn && !filterEndDateReturn) {
            return true;
        }
        const orderDateReturn = new Date(order?.OrderDate);
        const startDateReturn = filterStartDateReturn ? new Date(filterStartDateReturn) : null;
        const endDateReturn = filterEndDateReturn ? new Date(filterEndDateReturn) : null;

        // Adjust endDate to end of day (11:59:59 PM)
        if (endDateReturn) {
            endDateReturn.setHours(23, 59, 59, 999);
        }
        // Check if order date is within range
        if (startDateReturn && endDateReturn) {
            // Both dates selected: order must be between start and end
            return orderDateReturn >= startDateReturn && orderDateReturn <= endDateReturn;
        } else if (startDateReturn && !endDateReturn) {
            // Only start date selected: order must be on or after start
            return orderDateReturn >= startDateReturn;
        } else if (!startDateReturn && endDateReturn) {
            // Only end date selected: order must be on or before end
            return orderDateReturn <= endDateReturn;
        }
        return true;
    })



    // ---------------PDF Generation----------------------------------------
    const generatePDFDelivery = () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = 200;
            let yPosition = margin;

            // Add rider info
            const rider = ridersData?.[0];

            // Title
            pdf.setFontSize(20);
            pdf.text('RIDER ORDER DELIVERY REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${filterStartDateDelivery !== "" || filterEndDateDelivery !== "" ? " from " : ""} ${filterStartDateDelivery !== "" || filterEndDateDelivery !== "" ? filterStartDateDelivery + " to " + filterEndDateDelivery : "All Orders"}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Rider Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const riderDataRows = [
                ['Rider Name:', rider?.ridersName || 'N/A'],
                ['CNIC:', rider?.cnic || 'N/A'],
                ['Contact No:', rider?.contactNo || 'N/A'],
                ['Vehicle:', rider?.vehicle || 'N/A'],
                ['Assigned Area:', rider?.assignedArea || 'N/A']
            ];

            riderDataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition); // Simple text, no wrapping
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table - NO WRAPPING
            if (filteredOrdersDelivery && filteredOrdersDelivery.length > 0) {
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
                filteredOrdersDelivery.forEach((order, index) => {
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
                filteredOrdersDelivery.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredOrdersDelivery.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredOrdersDelivery.length}`, pageWidth - margin - 30, yPosition, { align: 'right' });
            } else {
                // No orders message
                pdf.setFontSize(12);
                pdf.text('No orders found for the selected date range.', margin, yPosition);
            }

            // Save PDF
            pdf.save(`Rider_Delivery_Report_${rider?.ridersName || 'Unknown'}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    const generatePDFPickup = () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = 200;
            let yPosition = margin;

            // Add rider info
            const rider = ridersData?.[0];

            // Title
            pdf.setFontSize(20);
            pdf.text('RIDER ORDER PICKUP REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${filterStartDatePickup !== "" || filterEndDatePickup !== "" ? " from " : ""} ${filterStartDatePickup !== "" || filterEndDatePickup !== "" ? filterStartDatePickup + " to " + filterEndDatePickup : "All Orders"}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Rider Pickup Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const riderDataRows = [
                ['Rider Name:', rider?.ridersName || 'N/A'],
                ['CNIC:', rider?.cnic || 'N/A'],
                ['Contact No:', rider?.contactNo || 'N/A'],
                ['Vehicle:', rider?.vehicle || 'N/A'],
                ['Assigned Area:', rider?.assignedArea || 'N/A']
            ];

            riderDataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition); // Simple text, no wrapping
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table - NO WRAPPING
            if (filteredOrdersPickup && filteredOrdersPickup.length > 0) {
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
                filteredOrdersPickup.forEach((order, index) => {
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
                filteredOrdersPickup.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredOrdersPickup.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredOrdersPickup.length}`, pageWidth - margin - 30, yPosition, { align: 'right' });
            } else {
                // No orders message
                pdf.setFontSize(12);
                pdf.text('No orders found for the selected date range.', margin, yPosition);
            }

            // Save PDF
            pdf.save(`Rider_Pickup_Report_${rider?.ridersName || 'Unknown'}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };
    const generatePDFReturn = () => {
        try {
            // Create new PDF
            const pdf = new jsPDF('p', 'mm', 'a4');

            // Set margins
            const margin = 10;
            const pageWidth = 210;
            const pageHeight = 297;
            const contentWidth = 200;
            let yPosition = margin;

            // Add rider info
            const rider = ridersData?.[0];

            // Title
            pdf.setFontSize(20);
            pdf.text('RIDER ORDER RETURN REPORT', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 10;

            pdf.setFontSize(12);
            pdf.text(`Generated: ${filterStartDateReturn !== "" || filterEndDateReturn !== "" ? " from " : ""} ${filterStartDateReturn !== "" || filterEndDateReturn !== "" ? filterStartDateReturn + " to " + filterEndDateReturn : "All Orders"}`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 15;

            // Rider Info Table - NO WRAPPING
            pdf.setFontSize(14);
            pdf.text('Rider Return Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const riderDataRows = [
                ['Rider Name:', rider?.ridersName || 'N/A'],
                ['CNIC:', rider?.cnic || 'N/A'],
                ['Contact No:', rider?.contactNo || 'N/A'],
                ['Vehicle:', rider?.vehicle || 'N/A'],
                ['Assigned Area:', rider?.assignedArea || 'N/A']
            ];

            riderDataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition); // Simple text, no wrapping
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table - NO WRAPPING
            if (filteredOrdersReturn && filteredOrdersReturn.length > 0) {
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
                filteredOrdersReturn.forEach((order, index) => {
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
                filteredOrdersReturn.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredOrdersReturn.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredOrdersReturn.length}`, pageWidth - margin - 30, yPosition, { align: 'right' });
            } else {
                // No orders message
                pdf.setFontSize(12);
                pdf.text('No orders found for the selected date range.', margin, yPosition);
            }

            // Save PDF
            pdf.save(`Rider_Return_Report_${rider?.ridersName || 'Unknown'}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };





    // -------------------------Timer----------------------------------
    const [currentTime, setCurrentTime] = useState(0)
    function timerFun(assigned, delivered) {
        if (!assigned && !delivered) {
            return "not assigned yet";
        }
        if (assigned && !delivered) {
            return formatElapsedTime(assignedTime(assigned));
        }
        if (assigned && delivered) {
            return formatElapsedTime(timeDiff(assigned, delivered));
        }
        return "something went wrong";
    }
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, []);
    const formatElapsedTime = useCallback((milliseconds) => {
        if (!milliseconds || milliseconds < 0) return '00:00:00';
        const totalSeconds = Math.floor(milliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')} ${hours ? "h" : ""} : ${minutes.toString().padStart(2, '0')}${minutes ? "min" : ""} : ${seconds.toString().padStart(2, '0')}${seconds ? "s" : ""}`;
    }, []);
    const assignedTime = useCallback((assignedDate) => {
        if (!assignedDate) return 0;
        try {
            const assignedTime = new Date(assignedDate).getTime();
            const elapsed = currentTime - assignedTime;
            return elapsed > 0 ? elapsed : 0;
        } catch (error) {
            return 0;
        }
    }, [currentTime])
    const timeDiff = useCallback((assigned, delivered) => {
        if (!assigned && !delivered) return 0;
        try {
            const assignedTime = new Date(assigned).getTime();
            const deliveredTime = new Date(delivered).getTime();
            const difference = deliveredTime - assignedTime;
            return difference > 0 ? difference : 0;
        } catch (error) {
            return 0;
        }
    }, [])


    // -------------- states for pages -------------------------------
    const [page, setPage] = useState(0)


    return (
        <>
            {
                ridersData?.map((a) => (
                    <>
                        <div key={a?._id} className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-4 justify-start items-start w-7/8! sm:w-3/4 h-screen">
                            <div className="w-full flex gap-2">
                                <div className="flex-1 rounded-lg p-4 text-white bg-linear-to-r from-gray-600 to-gray-800">
                                    <div>
                                        <h4>Rider Name :</h4>
                                        <h5>{a?.ridersName}</h5>
                                    </div>
                                    <div>
                                        <h4>vehicle :</h4>
                                        <h5>{a?.vehicle}</h5>
                                    </div>
                                    <div>
                                        <h4>Contact No :</h4>
                                        <h5>{a?.contactNo}</h5>
                                    </div>
                                    <div>
                                        <h4>Cnic No :</h4>
                                        <h5>{a?.cnic}</h5>
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg p-4 text-white bg-linear-to-r from-gray-700 to-gray-900">
                                    <div>
                                        <h4>License No :</h4>
                                        <h5>{a?.licenseNo}</h5>
                                    </div>
                                    <div>
                                        <h4>Assigned Area :</h4>
                                        <h5>{a?.assignedArea}</h5>
                                    </div>
                                    <div>
                                        <h4>Email Address :</h4>
                                        <h5>{a?.emailAddress}</h5>
                                    </div>
                                    <div>
                                        {/* <h4>Rider Id :</h4>
                                        <h5>{a?._id}</h5> */}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full flex gap-2 text-white">
                                    <button onClick={()=> setPage(0)} className={`font-bold text-lg! w-1/3! ${page === 0 ?"bg-red-700":"bg-red-500"} py-2 rounded`}>
                                        Delivered
                                    </button>
                                    <button onClick={()=> setPage(1)} className={`font-bold text-lg! w-1/3! ${page === 1 ?"bg-red-700":"bg-red-500"} py-2 rounded`}>
                                        Pickup
                                    </button>
                                    <button onClick={()=> setPage(2)} className={`font-bold text-lg! w-1/3! ${page === 2 ?"bg-red-700":"bg-red-500"} py-2 rounded`}>
                                        Return
                                    </button>
                            </div>

                            {
                                page === 0
                                    ?
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl!">Delivered {filterStartDateDelivery !== "" || filterEndDateDelivery !== "" ? filterStartDateDelivery + " to " + filterEndDateDelivery : "All Orders"}</h2>
                                            <button onClick={generatePDFDelivery} className="bg-green-600 rounded text-white p-2">Generate PDF</button>
                                            <div className="flex items-center gap-2">
                                                <label className="text-red-500 font-bold">Set Filter : </label>
                                                <h5 className="m-0 p-0">from</h5>
                                                <input className="bg-blue-200 rounded" type="date" value={filterStartDateDelivery} onChange={(e) => setFilterStartDateDelivery(e.target.value)} />
                                                <h5 className="m-0 p-0">to</h5>
                                                <input className="bg-red-200 rounded" type="date" value={filterEndDateDelivery} onChange={(e) => setFilterEndDateDelivery(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className='w-full h-auto overflow-scroll'>
                                            <table className="bg-white border w-full rounded-lg shadow-md">
                                                <thead className="text-white bg-[#041026]">
                                                    <tr>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                                        {/* <td className="p-4 text-center text-nowrap font-semibold">Time </td> */}
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
                                                    {
                                                        filteredOrdersDelivery?.map((a) => (
                                                            <tr>
                                                                <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                                {/* <td className="p-4 text-center text-nowrap">{timerFun(a?.RiderAssignedDate, a?.RiderDeliveredDate)}</td> */}
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.PickupAddress}</td>

                                                                <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.Items}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    :
                                    null
                            }



                            {
                                page === 1
                                    ?
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl!">Picked {filterStartDatePickup !== "" || filterEndDatePickup !== "" ? filterStartDatePickup + " to " + filterEndDatePickup : "All Orders"}</h2>
                                            <button onClick={generatePDFPickup} className="bg-green-600 rounded text-white p-2">Generate PDF</button>
                                            <div className="flex items-center gap-2">
                                                <label className="text-red-500 font-bold">Set Filter : </label>
                                                <h5 className="m-0 p-0">from</h5>
                                                <input className="bg-blue-200 rounded" type="date" value={filterStartDatePickup} onChange={(e) => setFilterStartDatePickup(e.target.value)} />
                                                <h5 className="m-0 p-0">to</h5>
                                                <input className="bg-red-200 rounded" type="date" value={filterEndDatePickup} onChange={(e) => setFilterEndDatePickup(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className='w-full h-auto overflow-scroll'>
                                            <table className="bg-white border w-full rounded-lg shadow-md">
                                                <thead className="text-white bg-[#041026]">
                                                    <tr>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                                        {/* <td className="p-4 text-center text-nowrap font-semibold">Time </td> */}
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
                                                    {
                                                        filteredOrdersPickup?.map((a) => (
                                                            <tr>
                                                                <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                                {/* <td className="p-4 text-center text-nowrap">{timerFun(a?.RiderAssignedDate, a?.RiderDeliveredDate)}</td> */}
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.PickupAddress}</td>

                                                                <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.Items}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    :
                                    null
                            }

                            {
                                page === 2
                                    ?
                                    <div className="w-full flex flex-col gap-2">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl!">Returned {filterStartDateReturn !== "" || filterEndDateReturn !== "" ? filterStartDateReturn + " to " + filterEndDateReturn : "All Orders"}</h2>
                                            <button onClick={generatePDFReturn} className="bg-green-600 rounded text-white p-2">Generate PDF</button>
                                            <div className="flex items-center gap-2">
                                                <label className="text-red-500 font-bold">Set Filter : </label>
                                                <h5 className="m-0 p-0">from</h5>
                                                <input className="bg-blue-200 rounded" type="date" value={filterStartDateReturn} onChange={(e) => setFilterStartDateReturn(e.target.value)} />
                                                <h5 className="m-0 p-0">to</h5>
                                                <input className="bg-red-200 rounded" type="date" value={filterEndDateReturn} onChange={(e) => setFilterEndDateReturn(e.target.value)} />
                                            </div>
                                        </div>
                                        <div className='w-full h-auto overflow-scroll'>
                                            <table className="bg-white border w-full rounded-lg shadow-md">
                                                <thead className="text-white bg-[#041026]">
                                                    <tr>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Sender Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Receiver Name </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Delivery Address </td>
                                                        <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
                                                        {/* <td className="p-4 text-center text-nowrap font-semibold">Time </td> */}
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
                                                    {
                                                        filteredOrdersReturn?.map((a) => (
                                                            <tr>
                                                                <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                                {/* <td className="p-4 text-center text-nowrap">{timerFun(a?.RiderAssignedDate, a?.RiderDeliveredDate)}</td> */}
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.PickupAddress}</td>

                                                                <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.OrderAmount}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.DeliveryAddress}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.status}</td>
                                                                <td className="p-4 text-center text-nowrap">{a?.Items}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    :
                                    null
                            }

                        </div>
                    </>
                ))
            }
        </>
    )
}