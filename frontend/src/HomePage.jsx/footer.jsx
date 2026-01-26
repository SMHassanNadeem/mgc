import logo from '../assets/MGC.png';
import { useNavigate } from 'react-router-dom'
export default function Footer() {
    const navigate = useNavigate()
    return (
        <>
            <div className=' print:hidden! py-15 flex items-center justify-center bg-[#ff3f39] text-gray-100 w-full h-10 text-center'>
                <div className="w-300 flex justify-between items-center">
                    {/* <p className='m-0 text-2xl font-bold'>Subscribe to our Newsletter!</p>
                    <form className='flex flex-nowrap'>
                        <input placeholder='enter your email address' className='bg-white w-50 md:w-80! h-15 pl-5 text-black!' type="text" />
                        <button type='submit' className='bg-[#041026] px-0 md:px-10! py-3 text-xl!'>Subscribe</button>
                    </form> */}
                </div>
            </div>
            <div style={{ fontFamily: 'poppins' }} className=" print:hidden! bg-[#041026] flex justify-center text-gray-100 w-full z-1">
                <div className="w-195 sm:w-310! h-100 flex flex-col sm:flex-row! justify-around px-2 py-25">
                    <div className="flex flex-col gap-3">
                        <img className="w-45 -ml-5" src={logo} alt="logo" />
                        <div className="flex flex-col">
                            <p className='w-80'>With tech-enabled operations and meticulously managed logistics solutions, we are upping the field of logistics and delivery to a whole new level. Be a part of this journey.</p>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                        <h4>Explore Here</h4>
                        <div className="flex flex-col">
                            <p onClick={() => navigate('/about-us')} className="m-0 text-lg! cursor-pointer">About Us</p>
                            <p onClick={() => navigate('/contact-us')} className="m-0 text-lg! cursor-pointer">Contact Us</p>
                            <p onClick={() => navigate('/tracking-id')} className="m-0 text-lg! cursor-pointer">Tracking Id</p>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                        <h4>Address</h4>
                        <div className="flex flex-col">
                            <p className="m-0 text-lg!">Pickup Point Shop :</p>
                            <p className="m-0 text-lg!">Shop# F-17,1st floor,Saima Pari Star,<br /> Block-H, North Nazimabad, Karachi</p>
                            <br />
                            <p className="m-0 text-lg!">Corporate Office :</p>
                            <p className="m-0 text-lg!">D19, Block-D, North Nazimabad, <br /> (behind KFC Hyderi & Opposite <br /> to Mufti Ramadan family park) <br /> Karachi.</p>
                        </div>
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                        <h4>Contact Us</h4>
                        <div className="flex flex-col gap-2 text-2xl">
                            <a href='mailto:info@mgcourier.com.pk' className="m-0 text-lg! text-white!">info@mgcourier.com.pk</a>
                            <a href="tel:+923366624157" className="m-0 text-lg! text-white!">03366624157</a>
                            <a href="tel:+923181144290" className="m-0 text-lg! text-white!">03181144290</a>
                            {/* <p className='flex m-0 gap-3'>
                            <a href="#" className="text-green-500!">
                            <i className="fa-brands fa-whatsapp"></i>
                        </a>
                        <a href="#">
                            <i className="fa-brands fa-facebook"></i>
                        </a>
                        </p> */}
                        </div>
                    </div>
                </div>
            </div>
            <div className='flex items-center justify-center bg-[#041026] text-gray-400 w-full h-10 border-t text-center'>
                <p className='m-0'>All right reserved © MGC</p>
            </div>
        </>
    )
}