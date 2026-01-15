import { createContext, useState } from "react";

export const Global = createContext()
export default function GlobalProvider({ children }) {
    const [orders, setOrders] = useState([
        {
            OrderType: "Normal",
            OrderAmount: 1,
            CustomerName: "Hassan",
            DeliveryCity: "Karachi",
            AirwayBillCopies: 1,
            PickupCity: "Karachi",
            OrderRefrenceNumber: "209090990",
            OrderDate: "2025-11-12",
            CustomerContactNo: "03003030000",
            DeliveryAddress: "1/2 A ABC Colony",
            PickupAddress: "2/1 XYZ Colony",
            status: "Delivered"
        },
        {
            OrderType: "Express",
            OrderAmount: 3,
            CustomerName: "Ali Khan",
            DeliveryCity: "Lahore",
            AirwayBillCopies: 2,
            PickupCity: "Islamabad",
            OrderRefrenceNumber: "209090991",
            OrderDate: "2025-11-11",
            CustomerContactNo: "03001234567",
            DeliveryAddress: "House 22, Model Town",
            PickupAddress: "Office 10, Blue Area",
            status: "pending"
        },
    ]);

    const [openMenuAddUser, setOpenMenuAddUser] = useState(false)
    const [openMenuLogin, setOpenMenuLogin] = useState(false)

    return (
        <Global.Provider value={{orders,setOrders, openMenuAddUser,setOpenMenuAddUser,setOpenMenuLogin,openMenuLogin}}>
            {children}
        </Global.Provider>
    )
}