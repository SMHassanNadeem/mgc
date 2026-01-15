import { Outlet } from "react-router-dom";
import Navbar from "./navbar";
import Footer from "./footer";


export default function Layout() {

    return (
        // <div className="w-screen flex flex-col items-center bg-black">
        <div className="flex flex-col items-center">
            <Navbar />
            <Outlet />
            <Footer/>
        </div>
    )
}