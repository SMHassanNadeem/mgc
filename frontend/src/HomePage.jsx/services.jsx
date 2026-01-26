import { useNavigate } from "react-router-dom"

export default function Services() {
    const navigate = useNavigate()
    return (
        <>
            {/* -------------------- Services -------------------------------- */}
            {/* For Mobile */}
            <div onClick={() => navigate('/form-loader')} className="flex xl:hidden! flex-col items-center gap-3 py-30">
                <p className="m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">OUR SERVICES</p>
                <h1 className="font-extrabold! text-gray-900!">We provide full assistance</h1>

                <div className="transition-all duration-300 ease-in-out hover:-translate-x-5 hover:-translate-y-5 cursor-pointer mt-5 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                    <div className="shadow-2xl shadow-black/30 pb-5 rounded flex flex-col items-center w-[250px] sm:w-82! h-100">
                        <img className="py-4 px-3 -mt-19" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/4c-280x241.png" alt="" />
                        <h3 className="font-bold!">Land Express</h3>
                        <p className="m-0 text-center px-2">Our non-asset based Land network provides you with flexibility, improved service and accelerated delivery</p>
                    </div>
                </div>
            </div>
            {/* for PC Screen */}
            <div className="hidden xl:flex! flex-col items-center gap-3 py-30">
                <p className="m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">OUR SERVICES</p>
                <h1 className="font-extrabold! text-gray-900!">We provide full assistance</h1>

                <div className="w-300">
                    <div className="flex">
                        <div className="rounded flex flex-col items-center w-full h-full">
                            <img className="w-120 h-120" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/4c-280x241.png" alt="" />
                        </div>
                        <div className=" pl-15! rounded flex flex-col gap-3 justify-center items-start w-full h-120">
                            <h1 className="font-bold!">Land Express</h1>
                            <h5 className="m-0 text-justify">Our non-asset based Land network provides you with flexibility, improved service and accelerated delivery</h5>
                            <button
                                onClick={() => navigate('/form-loader')}
                                style={{ fontFamily: 'poppins' }}
                                className="w-40 h-15! rounded-xl! m-0 text-xl! text-nowrap transition-all duration-300 ease-in-out text-gray-100 bg-[#d10115] hover:bg-[#ff3f39]"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}