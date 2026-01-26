export default function AboutUs() {

    return (
        <>
            <div className="w-screen h-150 flex flex-col items-center">
                <img className="w-full h-150 absolute -z-10" src="https://img.freepik.com/premium-vector/gray-gradient-background-wallpaper-vector-image-backdrop-presentation_1110513-578.jpg" alt="" />
                <div className="w-full flex justify-center">
                    <h2 className="text-red-600! font-bold! absolute z-10 top-77 text-center line-clamp-3">ABOUT</h2>
                    <h1 className="text-red-600! font-extrabold! absolute z-10 top-90 text-center">Our Company</h1>
                    <p className="absolute top-107 text-lg text-center w-80! md:w-200! font-medium">
                        An all round courier problem solving, one call solution to many industries and businesses in the Karachi.
                    </p>
                </div>
            </div>
            <div className="w-80 sm:w-150! lg:w-270! py-20 flex flex-col items-start">
                <h1 className="text-[#041026]! font-extrabold!">About Master Global Courier</h1>
                <p>
                    Being established in 1991 Master Global Couriers has evolved from a legal sector specialist to an all round logistical problem solving/one call solution to many industries and businesses in the Karachi.
                </p>
                <p>
                    Based in karachi city centre we are ideally situated to reach customers quickly when time is of the essence. Our drivers and operational staff are vastly experienced, their same day knowledge and knowhow is a leading factor in what enables Master Global Couriers (PK) Ltd offer such high levels of service.
                </p>
            </div>
        </>
    )
}