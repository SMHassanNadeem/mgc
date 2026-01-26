import { useLocation, useNavigate } from "react-router-dom";
import CarouselFunction from "./carousel";
import Services from "./services";
import Logistics from "./logistics";
import AccomplishementCounter from "./AccomplishementCounters";
import WorkingWith from "./workingWith";
import { useEffect,useState } from "react";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Section1() {
    const navigate = useNavigate()

    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'error'
    });

    const location = useLocation()
    useEffect(() => {
        if (location.state?.from === '/order-form') {
            // toast.error(location.state.message, {
            //     position: "top-right",
            //     // autoClose: 3000,
            //     style: {
            //         background: '#d10115',
            //         color: 'white',
            //     },
            // })
            setNotification({
                show: true,
                message: location.state.message,
                type: 'error'
            });
            const timer = setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
            }, 3000);

            window.history.replaceState({}, '')

            return () => clearTimeout(timer);
        }
    }, [location.state])

    return (
        <>
            <ToastContainer
                pauseOnHover
            />
            {notification.show && (
                <div
                    className="fixed top-5 right-5 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white transition-all duration-300"
                    style={{
                        background: '#d10115',
                        minWidth: '250px'
                    }}
                >
                    {notification.message}
                </div>
            )}


            <CarouselFunction />

            {/* ------------------- Intro Text----------------------------------- */}
            <div className="flex-col gap-4 top-[45vh] text-gray-300 text-center! w-[300px]! sm:w-[500px]! md:w-[700px]! lg:w-[900px]! flex sm:items-start items-center! text-lg absolute z-10">
                {/* <img src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/M-copy.png" alt="" /> */}
                <h1><b>Get Instant Access</b> </h1>
                <h1 className="text-white text-md">TO GROWTH CAPITAL</h1>
                <button
                    onClick={() => navigate('/form-loader')}
                    style={{ fontFamily: 'poppins' }}
                    className="w-60 h-20! rounded-xl! m-0 text-xl! text-nowrap transition-all duration-300 ease-in-out text-gray-300 bg-[#d10115] hover:bg-[#ff3f39]"
                >
                    Get Started
                </button>
            </div>

            <Services />

            <Logistics />

            <AccomplishementCounter />

            <WorkingWith />

            <div className="pb-20! w-[300px]! sm:w-[500px]! md:w-[700px]! xl:w-[1300px]! flex flex-col items-center">
                <p className="mb-12! w-fit font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Why Choose Us</p>
                <div className="w-full flex justify-center gap-5 flex-wrap">
                    <div className="flex flex-col w-70 p-2">
                        <img className="w-18! h-18! mb-2 object-contain" src="https://moovit.foxthemes.me/wp-content/uploads/2019/10/iconfinder_men2_294051222.png" alt="" />
                        <h4 className="font-bold w-full">People</h4>
                        <p className="text-gray-600 text-justify">
                            We understand that our people impact the success of our business, and we hire people who are smart, dedicated for Moovit.
                        </p>
                    </div>

                    <div className="flex flex-col w-70 p-2">
                        <img className="w-18! h-18! mb-2 object-contain" src="https://moovit.foxthemes.me/wp-content/uploads/2019/10/iconfinder_24-7_assistance_1203858-1.png" alt="" />
                        <h4 className="font-bold w-full">Customer Service</h4>
                        <p className="text-gray-600 text-justify">
                            We strive to provide superior customer service and ensure that every client is completely satisfied with our work.
                        </p>
                    </div>

                    <div className="flex flex-col w-70 p-2">
                        <img className="w-18! h-18! mb-2 object-contain" src="https://moovit.foxthemes.me/wp-content/uploads/2019/10/iconfinder_a_advice_businessman_chat_consultant_conversation_customer_service_customer_support_help_real__3684623-1.png" alt="" />
                        <h4 className="font-bold w-full">Support</h4>
                        <p className="text-gray-600 text-justify">
                            Tell us what you need and our specialist team will deliver it personally, taking care of all the procedures.
                        </p>
                    </div>

                    <div className="flex flex-col w-70 p-2">
                        <img className="w-18! h-18! mb-2 object-contain" src="https://moovit.foxthemes.me/wp-content/uploads/2019/10/iconfinder_SEO_C_50_09.12.14-1_Artboard_37_407876-1.png" alt="" />
                        <h4 className="font-bold w-full">Quality</h4>
                        <p className="text-gray-600 text-justify">
                            We are committed to deliver outstanding, cutting edge IT solutions that add real value that goes beyond what is expected.
                        </p>
                    </div>
                </div>
            </div>

        </>

    )
}