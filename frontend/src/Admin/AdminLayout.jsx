import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {

    return (
        <div className="flex flex-col">
            <div className="flex w-screen">
                <AdminSidebar />
                <Outlet />
            </div>
        </div>
    )
}