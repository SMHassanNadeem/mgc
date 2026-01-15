import { useNavigate } from "react-router-dom"

export default function Logistics() {
    const navigate = useNavigate()
    return (
        <>
            {/* Logistics */}
            <div className="flex w-full h-auto justify-center">
                <div className="xl:pt-0! pt-0 flex items-center xl:items-start! xl:flex-row! flex-column gap-3 w-330! h-100 xl:h-200!">
                    <div className="red-filter w-[90%] h-full">
                        <img className="w-full! h-50 xl:h-150! xl:w-[60%]" src="https://t3.ftcdn.net/jpg/16/28/20/72/360_F_1628207296_AZUGy2LFOMX0YGTrGOCK2zHETTMRQEgv.jpg" alt="" />
                    </div>
                    <div className=" w-[80%] text-center xl:text-justify! flex flex-col items-center xl:items-start! p-4 m-0 xl:mt-40!">
                        <h1 className="font-extrabold!">Logistics Solutions</h1>
                        <p className="m-0 text-gray-600">Providing an independent advice and identifying the right fit for you. Services are sourced and procured based on solution specifications provided by our Supply Chain Solution.</p>
                        <img className="pt-10! hidden xl:flex" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/6.png" alt="" />
                    </div>
                </div>
            </div>
        </>
    )
}