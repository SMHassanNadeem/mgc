import { useEffect, useRef, useState } from "react";
import { motion } from 'motion/react'
import { useInView } from "framer-motion";
export default function AccomplishementCounter() {
    // Framer Motion counter trigger on scroll
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef);
    if (inView && !isVisible) setIsVisible(true);
    if (!inView && isVisible) setIsVisible(false);

    // Counter Handling
    const [packageCounter, setPackageCounter] = useState(0);
    const [countriesCounter, setCountriesCounter] = useState(0);
    const [tonsCounter, setTonsCounter] = useState(0)
    const [cashCounter, setCashCounter] = useState(0)
    useEffect(() => {
        const start = performance.now();
        const duration = 2000;

        const finalValues = {
            cash: 992370492176,
            packages: 5137,
            cities: 127,
            tons: 27150748
        };
        function animate(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);

            setPackageCounter(Math.round(finalValues.packages * progress));  //it is wroking like finding %
            setCountriesCounter(Math.round(finalValues.cities * progress));
            setTonsCounter(Math.round(finalValues.tons * progress));
            setCashCounter(Math.round(finalValues.cash * progress));

            if (progress < 1) {    //to loop the process until the entire task is complete
                requestAnimationFrame(animate);
            }
        }
        requestAnimationFrame(animate);
    }, [isVisible]);  //in dependency use value which change when we scroll down to certain position, use framer motion to do it
    return (
        <>
            {/* Accomplishement */}
            <div ref={sectionRef} className="flex flex-col items-center gap-5 py-30">
                <p className="m-0 font-extrabold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Accomplishment</p>
                <h1 className="font-bold! text-gray-900! text-center">Let the numbers speak for themselves</h1>

                <div className="flex flex-wrap w-full! lg:w-[60%]! xl:w-full! 2xl:w-full! justify-center xl:justify-center">
                    <div className="mt-19! grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                        <div className="pb-5 rounded flex flex-col items-center w-[250px] sm:w-82! h-100">
                            <img className="py-4 px-3 -mt-19 w-[188px] h-[183px]" src="https://freepngimg.com/save/136388-international-dollar-banknote-currency-hd-image-free/512x321" alt="" />
                            <h3 className="font-extrabold!">{cashCounter.toLocaleString()}</h3>
                            <h3 className="font-bold!">Cash Handled</h3>
                            <p className="m-0 text-center w-80">We strongly support best practice sharing across our operations around the world and across various industrial sectors.</p>
                        </div>
                    </div>
                    <div className=" mt-5 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                        <div className=" pb-5 rounded flex flex-col items-center w-[250px] sm:w-82! h-100">
                            <img className="py-4 px-3 -mt-19" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/10a.png" alt="" />
                            <h3 className="font-extrabold!">{packageCounter.toLocaleString()}</h3>
                            <h3 className="font-bold!">Delivered Packages</h3>
                            <p className="m-0 text-center w-80">We strongly support best practice sharing across our operations around the world and across various industrial sectors.</p>
                        </div>
                    </div>
                    <div className=" mt-5 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                        <div className="pb-5 rounded flex flex-col items-center w-[250px] sm:w-82! h-100">
                            <img className="py-4 px-3 -mt-19" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/11a.png" alt="" />
                            <h3 className="font-extrabold!">{countriesCounter.toLocaleString()}</h3>
                            <h3 className="font-bold! text-center">Cities Covered Across <br /> Pakistan</h3>
                            <p className="m-0 text-center w-80">As one of the world’s leading supply chain management companies, we design and implement industry-leading solutions.</p>
                        </div>
                    </div>
                    <div className=" mt-5 grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1">
                        <div className="pb-5 rounded flex flex-col items-center w-[250px] sm:w-82! h-100">
                            <img className="py-4 px-3 -mt-19" src="https://moovit.foxthemes.me/wp-content/uploads/2019/08/12.png" alt="" />
                            <h3 className="font-extrabold!">{tonsCounter.toLocaleString()}</h3>
                            <h3 className="font-bold!">Shipments Delivered</h3>
                            <p className="m-0 text-center w-80">Our commitment to sustainability helps us reduce waste and share the benefits with our customers.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}