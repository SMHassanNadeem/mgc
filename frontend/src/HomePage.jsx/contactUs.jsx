export default function ContactUs() {

    return (
        <>
            <div className="w-screen flex flex-col items-center">

                <img className="w-full" src="https://www.tcsexpress.com/new-image/contact-us.jpg" alt="" />

                <div className="flex justify-center bg-gray-200 p-5 text-center w-full">
                    <div className="w-200">
                        As an organisation that directly interacts with its customers on a daily basis, we believe in finding ways to constantly improve our services by understanding your needs better. Our call centre, highly motivated social media teams and WhatsApp response systems are all ears. Please do not hesitate to contact us with your queries, input, or feedback.
                    </div>
                </div>

                <div className="py-5 flex flex-col md:flex-row justify-center items-center w-90! md:w-200!">
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-3 py-10 -mt-5">
                            <img className="w-95" src="https://www.tcsexpress.com/Home/support3.png" alt="" />
                            <img className="w-95" src="https://www.tcsexpress.com/Home/customersupport1.jpg" alt="" />
                        </div>
                        <div className="flex flex-col gap-3 py-10 mt-5s">
                            <img className="w-95" src="https://www.tcsexpress.com/Home/support2.png" alt="" />
                            <img className="w-95" src="https://www.tcsexpress.com/Home/customersupport2.jpg" alt="" />
                        </div>
                    </div>
                    <div className="pl-5 flex flex-col items-start gap-1 m-9 w-full">
                        <h2 className="text-[#041026]! font-extrabold!">EMAIL US</h2>
                        <p className="text-gray-900 text-lg">mgc@gmail.com</p>

                        <h2 className="text-[#041026]! font-extrabold!">TALK TO US</h2>
                        <p className="text-gray-900 text-lg">0300000000</p>

                        <h2 className="text-[#041026]! font-extrabold!">SOCIALS</h2>
                        <p className='flex m-0 gap-3 text-3xl!'>
                            <a href="#" className="text-green-500!">
                                <i className="fa-brands fa-whatsapp"></i>
                            </a>
                            <a href="#">
                                <i className="fa-brands fa-facebook"></i>
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}