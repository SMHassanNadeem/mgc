import logo from '../assets/MGC.png';
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { jsPDF } from 'jspdf';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { Global } from "../global";
import { useContext } from 'react';
import EditUser from '../Auth/edit-user';

export default function UsersDetail() {

    const { openMenuAddUser, setOpenMenuAddUser } = useContext(Global)

    const queryClient = useQueryClient()
    const { uid } = useParams()
    const navigate = useNavigate()
    async function usersLogic() {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/');
            return;
        }

        const data = await fetch(`http://localhost:3000/users/${uid}`, {
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
        return [info?.user];
    }
    const { data: userData, isLoading: dataLoading, error: dataError, isFetching } = useQuery({
        queryKey: ['userData'],
        queryFn: usersLogic,
        retry: 1,
        refetchOnWindowFocus: false,
    })


    const [ordersData, setOrdersData] = useState()
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const data = await fetch(`http://localhost:3000/orders/admin/user/${uid}`, {
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
            setOrdersData(info?.order)
        }
        a();
    }, [])

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
            const contentWidth = 190;
            let yPosition = margin;

            // Add user info
            const user = userData?.[0];

            // Title
            yPosition += 10;

            const img = await loadImage(logo);

            // Sizes
            const headingFontSize = 20;
            const logoHeight = 25;
            const logoWidth = 70;
            pdf.setFontSize(headingFontSize);
            const text = 'User Report';
            const textWidth = pdf.getTextWidth(text);
            const gap = 3;
            const totalWidth = logoWidth + gap + textWidth;
            const startX = ((pdf.internal.pageSize.getWidth() - totalWidth) / 2) - 40;
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

            // User Info Table
            pdf.setFontSize(14);
            pdf.text('Company Information', margin, yPosition);
            yPosition += 10;

            pdf.setFontSize(10);
            const userDataRows = [
                ['sender Name:', user?.CompanyName || 'N/A'],
                ['CNIC:', user?.Cnic || 'N/A'],
                ['Contact No:', user?.PhoneNo || 'N/A'],
                ['Total Orders:', ordersData?.length || 0],
                ['Bank Name:', user?.BankName || 'N/A'],
                ['IBAN:', user?.IBAN || 'N/A']
            ];

            userDataRows.forEach(([label, value]) => {
                if (yPosition > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }
                pdf.text(`${label} ${value}`, margin, yPosition);
                yPosition += 7;
            });

            yPosition += 10;

            // Orders Table
            if (filteredOrders.length > 0) {
                pdf.setFontSize(14);
                pdf.text('Orders Summary', margin, yPosition);
                yPosition += 10;

                pdf.setFontSize(8); // Smaller font for table

                // Table headers
                const headers = ['Sender', 'Receiver', 'Order Date', 'Amount', 'Status'];
                let xPosition = margin;
                const colWidth = contentWidth / headers.length;

                headers.forEach(header => {
                    pdf.text(header, xPosition, yPosition);
                    xPosition += colWidth;
                });

                yPosition += 7;
                xPosition = margin;

                // Draw line under headers
                pdf.line(margin, yPosition - 3, pageWidth - margin, yPosition - 3);

                // Add orders with automatic pagination
                filteredOrders.forEach((order, index) => {
                    // Check if we need new page
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    const row = [
                        order?.creatorName || 'N/A',
                        order?.CustomerName || 'N/A',
                        // order?.DeliveryAddress || 'N/A',
                        new Date(order?.OrderDate).toLocaleDateString(),
                        order?.OrderAmount + ' ' + 'Rs' || '0 Rs',
                        order?.status || 'N/A'
                    ];

                    xPosition = margin;
                    row.forEach(cell => {
                        pdf.text(cell.toString(), xPosition, yPosition);
                        xPosition += colWidth;
                    });

                    yPosition += 6;
                });

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
                filteredOrders.forEach((order, index) => {
                    if (yPosition > pageHeight - margin) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.text(`${index + 1}. ${order?.trackingId || 'N/A'}`, margin, yPosition);
                    yPosition += 6;
                });

                // Add total
                yPosition += 10;
                const totalAmount = filteredOrders.reduce((sum, order) => sum + (parseFloat(order?.OrderAmount) || 0), 0);
                pdf.setFontSize(10);
                pdf.text(`Total Amount: ${totalAmount.toFixed(2)}`, margin, yPosition);
                pdf.text(`Total Orders: ${filteredOrders.length}`, pageWidth - margin - 60, yPosition, { align: 'right' });
            }

            // Save PDF
            pdf.save(`User_Report_${user?.CompanyName || 'Unknown'}_${new Date().getTime()}.pdf`);

        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Error generating PDF. Please try again.');
        }
    };


    async function blockUserLogic({ id, status }) {
        try {
            const response = await fetch(`http://localhost:3000/users/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: status,
                })
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update order status');
            }
            // toast.success("Order Confirmed Successfully!", {
            //     position: "top-right",
            //     autoClose: 3000,
            // })
        } catch (error) {
            console.error('Error confirming order:', error);
            // toast.error(`Failed to confirm order: ${error.message}`, {
            //     position: "top-right",
            //     autoClose: 3000,
            //     style: {
            //         background: '#d10115',
            //         color: 'white',
            //     },
            // })
        }
    }
    const blockUserMutation = useMutation({
        mutationFn: blockUserLogic,
        onSuccess: (data, variables) => {
            console.log(data)
            queryClient.invalidateQueries({ queryKey: ['userData'] });
        },
        onError: (error) => {
            console.error('Error assigning rider:', error);
            // toast.error(`Failed to confirm: ${error.message}`, {
            //     position: "top-right",
            //     autoClose: 3000,
            //     style: {
            //         background: '#d10115',
            //         color: 'white',
            //     },
            // })
        }
    })
    function blockUserFun(id, status) {
        blockUserMutation.mutate({ id, status })
    }
    const isBlocking = blockUserMutation.isPending;

    return (
        <>
            {
                userData?.map((a) => (
                    <>
                        <div className="overflow-y-scroll bg-gray-100 flex flex-col gap-4 p-4 justify-start items-start w-7/8! sm:w-3/4 h-screen">
                            <div className="w-full flex gap-2">
                                <div className="flex-1 rounded-lg p-4 text-white bg-linear-to-r from-gray-600 to-gray-800">
                                    <div>
                                        <h4>Sender Name :</h4>
                                        <h5>{a?.CompanyName}</h5>
                                    </div>
                                    <div>
                                        <h4>CNIC :</h4>
                                        <h5>{a?.Cnic}</h5>
                                    </div>
                                    <div>
                                        <h4>Contact No :</h4>
                                        <h5>{a?.PhoneNo}</h5>
                                    </div>
                                    <div>
                                        <h4>No of Orders :</h4>
                                        <h5>{filteredOrders?.length}</h5>
                                    </div>
                                    <div>
                                        <button disabled={isBlocking} style={{ backgroundColor: a?.status !== "Blocked" ? "red" : "blue" }} className='bg-red-700 rounded p-2' onClick={() => {
                                            a?.status === "Blocked" ? blockUserFun(a?._id, 'approved') : blockUserFun(a?._id, 'Blocked')
                                        }}>
                                            {
                                                (isBlocking || isFetching) ? 'Blocking..' : a?.status === "Blocked" ? "UNBLOCK" : "BLOCK"
                                            }
                                        </button>
                                        <button disabled={isBlocking} style={{ backgroundColor: "blue" }} className='ml-2! bg-red-700 rounded p-2' onClick={() => setOpenMenuAddUser(true)}>
                                            Update
                                        </button>
                                        <EditUser vendorId={a?._id} openMenuAddUser={openMenuAddUser} setOpenMenuAddUser={setOpenMenuAddUser} />
                                    </div>
                                </div>
                                <div className="flex-1 rounded-lg p-4 text-white bg-linear-to-r from-gray-700 to-gray-900">
                                    <div>
                                        <h4>Bank Name :</h4>
                                        <h5>{a?.BankName}</h5>
                                    </div>
                                    <div>
                                        <h4>Branch Name :</h4>
                                        <h5>{a?.BankName}</h5>
                                    </div>
                                    <div>
                                        <h4>Branch Code :</h4>
                                        <h5>{a?.BranchCode}</h5>
                                    </div>
                                    <div>
                                        <h4>IBAN :</h4>
                                        <h5>{a?.IBAN}</h5>
                                    </div>
                                    <div>
                                        <h4>Swift Code :</h4>
                                        <h5>{a?.SwiftCode}</h5>
                                    </div>
                                </div>
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
                                                <td className="p-4 text-center text-nowrap font-semibold">Delivery City </td>
                                                <td className="p-4 text-center text-nowrap font-semibold">Order tracking Id </td>
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
                                                filteredOrders?.map((a) => (
                                                    <tr>
                                                        <td className="p-4 text-center text-nowrap">{a?.creatorName}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.CustomerName}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.DeliveryCity}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.trackingId}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.OrderDate}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.CustomerContactNo}</td>
                                                        <td className="p-4 text-center text-nowrap max-w-[100px] text-wrap!">{a?.PickupAddress}</td>

                                                        <td className="p-4 text-center text-nowrap">{a?.OrderType}</td>
                                                        <td className="p-4 text-center text-nowrap">{a?.OrderAmount + ' ' + 'Rs'}</td>
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
                ))
            }
        </>
    )
}