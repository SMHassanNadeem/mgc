import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RiderPage() {
    const navigate = useNavigate()
    const [rider, setRider] = useState([])
    useEffect(() => {
        async function a() {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }

            const data = await fetch('http://localhost:3000/riders/rider-own-data', {
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
            setRider([info.ridersById])
        }
        a();
    }, [])
    return (
        <>{
            rider?.map((a) => (
                <div className="flex flex-col gap-3 items-center h-[88vh] w-screen">
                    <h4 className="p-3 w-full! sm:w-170! md:w-220! lg:w-250! xl:w-300! rounded">Rider Dashboard</h4>
                    <div className="pr-3 w-full! sm:w-170! md:w-220! lg:w-250! xl:w-300! flex gap-5 items-center bg-gray-200 h-[300px] rounded pl-10!">
                        <div className="w-30 h-30 rounded-full bg-[#d10115] flex justify-center items-center text-white text-4xl">
                            <i className="fas fa-user"></i>
                        </div>
                        <div className="ml-5 text-[#041026]">
                            <h2>{a?.ridersName}</h2>
                            <h4> <i className="fas fa-phone"></i> {a?.contactNo}</h4>
                            <h4> <i className="fas fa-envelope"></i> {a?.emailAddress}</h4>
                        </div>
                    </div>
                    <div className="w-full! sm:w-170! md:w-220! lg:w-250! xl:w-300! flex flex-col md:flex-row gap-2 items-center p-2 bg-gray-200 h-[300px] rounded">
                        <div className="flex flex-col gap-2 w-full md:w-full h-full">
                            <div className="h-1/2 w-full bg-white text-xl text-[#041026] font-medium flex gap-3 justify-center items-center rounded">
                                <i className="fa-solid fa-motorcycle"></i>
                                <div className="py-2 flex flex-col">
                                    <div>Vehicle</div>
                                    <div>{a?.vehicle}</div>
                                </div>
                            </div>
                            <div className="h-1/2 w-full bg-white text-xl text-[#041026] font-medium flex gap-3 justify-center items-center rounded">
                                <i className="fa-solid fa-id-card"></i>
                                <div className="py-2 flex flex-col">
                                    <div>License</div>
                                    <div>{a?.licenseNo}</div>
                                </div>
                            </div>
                        </div>
                        {/* <div className="flex flex-col gap-2 w-full md:w-1/2 h-full">
                            <div className="flex gap-2 h-1/2 w-full">
                                <div className="py-2 flex flex-col w-1/2 justify-center items-center bg-white text-xl text-[#041026] font-medium rounded">
                                    <div>101</div>
                                    <div>Total Orders</div>
                                </div>
                                <div className="py-2 flex flex-col w-1/2 justify-center items-center bg-white text-xl text-[#041026] font-medium rounded">
                                    <div>84</div>
                                    <div>Completed</div>
                                </div>
                            </div>
                            <div className="flex gap-2 h-1/2 w-full">
                                <div className="py-2 flex flex-col w-1/2 justify-center items-center bg-white text-xl text-[#041026] font-medium rounded">
                                    <div>3</div>
                                    <div>Canceled</div>
                                </div>
                                <div className="py-2 flex flex-col w-1/2 justify-center items-center bg-white text-xl text-[#041026] font-medium rounded">
                                    <div>20</div>
                                    <div>Pending</div>
                                </div>
                            </div>
                        </div> */}
                    </div>
                </div>
            ))
        }
        </>
    )
}