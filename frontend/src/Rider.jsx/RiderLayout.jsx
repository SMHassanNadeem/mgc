import { Outlet } from "react-router-dom";
import RiderNavbar from "./RiderNavbar";

export default function RiderLayout() {

    return (
        <div className="flex flex-col items-center w-screen">
            <RiderNavbar />
            <Outlet />
        </div>
    )
}