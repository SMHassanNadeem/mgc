import { useNavigate, useLocation } from "react-router-dom";
import logo from '../assets/MGC.png';


import { useEffect } from "react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client'; // ADD THIS

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryClient = useQueryClient()

  const [AssignPickNotif, setAssignPickNotif] = useState(() => {
    return parseInt(localStorage.getItem('AssignPickNotif')) || 0;
  });


  const [newUserNotif, setNewUserNotif] = useState(() => {
    return parseInt(localStorage.getItem('newUserNotif')) || 0;
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Create socket connection
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket', 'polling'],
      auth: {
        token: token
      }
    });

    newSocket.on('order-updated', (data) => {
      if (data.status === "Shipment - Booked") {
        setAssignPickNotif(prev => {
          const newValue = prev + 1;
          localStorage.setItem('AssignPickNotif', newValue.toString());
          return newValue;
        });
      }
    });

    newSocket.on('user-added', (data) => {
      if (data.notif === "new unapproved user") {
        setNewUserNotif(prev => {
          const newValue = prev + 1;
          localStorage.setItem('newUserNotif', newValue.toString());
          return newValue;
        });
      }
    });

    // Cleanup on component unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  const clearNotification = (notifName) => {
    if (notifName === 'AssignPickNotif') {
      setAssignPickNotif(0);
      localStorage.removeItem('AssignPickNotif');
    } else if (notifName === 'newUserNotif') {
      setNewUserNotif(0);
      localStorage.removeItem('newUserNotif');
    }
  };

  const menuItems = [
    { path: "/admin", label: "Admin Stats", iconClass: "fas fa-tachometer-alt" },
    { path: "/admin/riders", label: "Riders", iconClass: "fas fa-motorcycle" },
    { path: "/admin/deleted-riders", label: "Deleted Riders", iconClass: "fa-solid fa-trash" },
    { path: "/admin/vendors-management", label: "Vendors Mangament", iconClass: "fa-solid fa-truck" },
    { path: "/admin/unapproved-users", label: "Unapproved Users", iconClass: "fas fa-user-xmark", notifName: "newUserNotif", notif: newUserNotif, queryKey: "unapprovedUsers" },
    { path: "/admin/users", label: "Users", iconClass: "fas fa-users" },
    { path: "/admin/unassigned-orders", label: "Assign For Pickup", iconClass: "fas fa-box-open", notifName: "AssignPickNotif", notif: AssignPickNotif, queryKey: "unassignedOrders" },
    // { path: "/admin/vandor-cancelled", label: "Cancelled from pickup", iconClass: "fas fa-cancel" },
    { path: "/admin/orders", label: "Orders", iconClass: "fas fa-clipboard-list" },
    { path: "/admin/warehouse-scanner", label: "Warehouse Scanner", iconClass: "fas fa-warehouse" },
    { path: "/admin/order-at-warehouse", label: "Orders at Warehouse", iconClass: "fas fa-boxes" },
    { path: "/admin/return-management", label: "Delivery Management", iconClass: "fas fa-undo-alt" },
    { path: "/admin/cancel-management", label: "Cancel Management", iconClass: "fas fa-x" },
    // { path: "/admin/invoice-report", label: "Invoice Reports", iconClass: "fas fa-file-invoice" },
    { path: "/admin/accounts", label: "Accounts", iconClass: "fa-solid fa-book" },
  ];

  return (
    <div className="flex flex-col items-center py-3 px-0 text-lg font-sans font-medium w-1/7 sm:w-1/4! text-wrap overflow-x-scroll h-screen bg-white shadow-md">

      <ToastContainer />

      <div className="cursor-pointer pl-4 text-3xl font-bold">
        <img className="w-40 object-fit" src={logo} alt="logo" />
      </div>
      {menuItems.map((item) => {
        const isActive = item.path === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.path);
        return (
          <>
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                localStorage.removeItem(`${item?.notifName}`);
                clearNotification(item?.notifName);
                item?.queryKey ? queryClient.invalidateQueries({ queryKey: [`${item?.queryKey}`] }) : null;
              }}
              className={`text-justify flex items-center w-[90%] hover:bg-gray-100 py-2 rounded pl-6 gap-3 transition-all 
              ${isActive ? "bg-gray-100 border-l-4 border-[#041026] text-[#041026]" : "hover:bg-gray-100 text-gray-600"}`}
            >
              <i className={`${item.iconClass} w-4 h-4`}></i>
              <span className="hidden sm:block">{item.label}</span>
              <i className={`${item?.notif > 0 ? "bg-red-500 text-white flex justify-center items-center w-5 h-5 rounded-[50%]!" : null}`}>{item?.notif > 0 ? item?.notif : null}</i>
            </button>
          </>
        );
      })}
      <button
        onClick={() => { localStorage.removeItem("token"), window.location.reload() }}
        className={`text-justify flex items-center w-[90%] hover:bg-gray-100 py-2 rounded pl-6 gap-3 transition-all  bg-red-100 text-[#041026]`}
      >
        <i className={`fa-solid fa-arrow-right-from-bracket w-4 h-4`}></i>
        <span className="hidden sm:block">Logout</span>
      </button>
    </div>
  );
}