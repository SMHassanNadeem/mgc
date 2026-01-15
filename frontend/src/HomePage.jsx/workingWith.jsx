import { useEffect, useRef, useState } from "react";
import { motion } from 'motion/react'
import { useInView } from "framer-motion";

export default function WorkingWith() {

    // Framer Motion counter trigger on scroll
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);
    const inView = useInView(sectionRef);
    if (inView && !isVisible) setIsVisible(true);
    if (!inView && isVisible) setIsVisible(false);

    // Carousel 
    const images = [
        "https://trax.pk/wp-content/uploads/2021/11/Outfitters-Logo.jpg",
        "https://trax.pk/wp-content/uploads/2022/04/saya-e1650367130128.png",
        "https://trax.pk/wp-content/uploads/2022/04/Minnie-Minors-1-e1650367164211.png",
        "https://trax.pk/wp-content/uploads/2022/04/beechtree-e1650367217116.png",
        "https://trax.pk/wp-content/uploads/2024/02/logo.webp",
        "https://trax.pk/wp-content/uploads/2022/06/interwood.png",
    ];
    const ITEM_WIDTH = 192; // w-48
    // const [SPEED,setSPEED] = useState(60); // pixels per second
    const SPEED = useRef(60)
    const MAX_DT = 0.05; //50ms clamp
    const itemRefs = useRef([]);
    const positions = useRef(images.map((_, i) => i * ITEM_WIDTH));
    const lastTime = useRef(null);
    useEffect(() => {
        positions.current = images.map((_, i) => i * ITEM_WIDTH);
    }, [images.length]);
    useEffect(() => {
        let rafId;
        const animate = (time) => {
            if (!lastTime.current) {
                lastTime.current = time;
                rafId = requestAnimationFrame(animate);
                return;
            }
            let delta = (time - lastTime.current) / 1000;
            lastTime.current = time;

            // Clamp delta time to prevent jumps
            delta = Math.min(delta, MAX_DT);

            const maxPos = Math.max(...positions.current);

            positions.current = positions.current.map((pos) => {
                let newPos = pos - SPEED.current * delta;
                if (newPos < -ITEM_WIDTH) {
                    newPos = maxPos + ITEM_WIDTH;
                }
                return newPos;
            });

            // Direct DOM update (fast & safe)
            positions.current.forEach((x, i) => {
                const el = itemRefs.current[i];
                if (el) el.style.transform = `translateX(${x}px)`;
            });

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, []);


    // Carousel 
    const images2 = [
        "https://trax.pk/wp-content/uploads/2022/06/dari-mooch.png",
        "https://trax.pk/wp-content/uploads/2021/11/Chase-up-Logo.jpg",
        "https://trax.pk/wp-content/uploads/2022/06/unilever.png",
        "https://trax.pk/wp-content/uploads/2022/04/Searle-e1650367837827.jpg",
        "https://trax.pk/wp-content/uploads/2022/06/Carrefour.png",
        "https://trax.pk/wp-content/uploads/2022/06/miniso.png",
    ];
    const ITEM_WIDTH2 = 192;
    const SPEED2 = useRef(60)
    const MAX_DT2 = 0.05; //50ms clamp
    const item2Refs = useRef([]);
    const positions2 = useRef(images2.map((_, i) => i * ITEM_WIDTH2));
    const lastTime2 = useRef(null);
    useEffect(() => {
        positions2.current = images2.map((_, i) => i * ITEM_WIDTH2);
    }, [images2.length]);
    useEffect(() => {
        let rafId2;
        const animate = (time) => {
            if (!lastTime2.current) {
                lastTime2.current = time;
                rafId2 = requestAnimationFrame(animate);
                return;
            }
            let delta = (time - lastTime2.current) / 1000;
            lastTime2.current = time;

            // Clamp delta time to prevent jumps
            delta = Math.min(delta, MAX_DT2);

            const maxPos = Math.max(...positions2.current);

            positions2.current = positions2.current.map((pos) => {
                let newPos = pos - SPEED2.current * delta;
                if (newPos < -ITEM_WIDTH2) {
                    newPos = maxPos + ITEM_WIDTH2;
                }
                return newPos;
            });

            // Direct DOM update (fast & safe)
            positions2.current.forEach((x, i) => {
                const el = item2Refs.current[i];
                if (el) el.style.transform = `translateX(${x}px)`;
            });

            rafId2 = requestAnimationFrame(animate);
        };

        rafId2 = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId2);
    }, []);

    // Carousel 
    const images3 = [
        "https://trax.pk/wp-content/uploads/2022/04/mobilink-microfinance-bank1.png",
        "https://trax.pk/wp-content/uploads/2022/06/alfalah.png",
        "https://trax.pk/wp-content/uploads/2022/04/jsbank-01-1-e1651045645807.png",
        "https://trax.pk/wp-content/uploads/2022/06/telenormicro.png",
        "https://trax.pk/wp-content/uploads/2022/04/Searle-e1650367837827.jpg",
        "https://trax.pk/wp-content/uploads/2024/02/153-1531690_soneri-bank-logo-png-transparent-png.png",
    ];
    const ITEM_WIDTH3 = 192;
    const SPEED3 = useRef(60)
    const MAX_DT3 = 0.05; //50ms clamp
    const item3Refs = useRef([]);
    const positions3 = useRef(images3.map((_, i) => i * ITEM_WIDTH2));
    const lastTime3 = useRef(null);
    useEffect(() => {
        positions3.current = images3.map((_, i) => i * ITEM_WIDTH2);
    }, [images3.length]);
    useEffect(() => {
        let rafId3;
        const animate = (time) => {
            if (!lastTime3.current) {
                lastTime3.current = time;
                rafId3 = requestAnimationFrame(animate);
                return;
            }
            let delta = (time - lastTime3.current) / 1000;
            lastTime3.current = time;

            // Clamp delta time to prevent jumps
            delta = Math.min(delta, MAX_DT3);

            const maxPos = Math.max(...positions3.current);

            positions3.current = positions3.current.map((pos) => {
                let newPos = pos - SPEED3.current * delta;
                if (newPos < -ITEM_WIDTH3) {
                    newPos = maxPos + ITEM_WIDTH3;
                }
                return newPos;
            });

            // Direct DOM update (fast & safe)
            positions3.current.forEach((x, i) => {
                const el = item3Refs.current[i];
                if (el) el.style.transform = `translateX(${x}px)`;
            });

            rafId3 = requestAnimationFrame(animate);
        };

        rafId3 = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId3);
    }, []);

    return (
        <>
            {/* Working With */}
            <div className="w-screen flex flex-col items-center gap-2 pb-30">
                <p className="mb-5! m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Proudly Working With</p>

                <div className="flex w-fit! xl:w-300!">
                    <div className="w-[25%] hidden xl:flex flex-col gap-0">
                        <div className="h-48 flex items-center justify-start">
                            <p className="w-fit mb-5! m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Fashion & Lifestyle</p>
                        </div>
                        <div className="h-48 flex items-center justify-start">
                            <p className="w-fit mb-5! m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Corporate</p>
                        </div>
                        <div className="h-48 flex items-center justify-start">
                            <p className="w-fit mb-5! m-0 font-bold text-white px-3 py-1 bg-[#ff3f39] -skew-x-20">Marketplaces & Platforms</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 xl:gap-0 w-full xl:w-[75%] h-fit">
                        <div className="flex shadow-md shadow-black/10 rounded">
                            <div className="flex justify-end -ml-40 w-120! sm:w-200! md:w-220! xl:w-300! ">
                                <div className="group carouselSlider w-full relative ml-41 h-48 overflow-hidden">
                                    {images.map((src, i) => (
                                        <img
                                            key={i}
                                            ref={(el) => (itemRefs.current[i] = el)}
                                            src={src}
                                            alt="brandsLogos"
                                            onMouseEnter={() => SPEED.current = 0}
                                            onMouseLeave={() => SPEED.current = 60}
                                            className="px-3! group-hover:opacity-40 hover:opacity-100! hover:shadow-2xl hover:shadow-black/30 absolute top-0 w-48 h-40 mt-3 object-contain will-change-transform cursor-pointer!"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex shadow-md shadow-black/10 rounded">
                            <div className="flex justify-end -ml-40 w-120! sm:w-200! md:w-220! xl:w-300! ">
                                <div className="group carouselSlider w-full relative ml-41 h-48 overflow-hidden">
                                    {images2.map((src, i) => (
                                        <img
                                            key={i}
                                            ref={(el) => (item2Refs.current[i] = el)}
                                            src={src}
                                            alt="brandsLogos"
                                            onMouseEnter={() => SPEED2.current = 0}
                                            onMouseLeave={() => SPEED2.current = 60}
                                            className="px-3! group-hover:opacity-40 hover:opacity-100! hover:shadow-2xl hover:shadow-black/30 absolute top-0 w-48 h-40 mt-3 object-contain will-change-transform cursor-pointer!"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex shadow-md shadow-black/10 rounded">
                            <div className="flex justify-end -ml-40 w-120! sm:w-200! md:w-220! xl:w-300! ">
                                <div className="group carouselSlider w-full relative ml-41 h-48 overflow-hidden">
                                    {images3.map((src, i) => (
                                        <img
                                            key={i}
                                            ref={(el) => (item3Refs.current[i] = el)}
                                            src={src}
                                            alt="brandsLogos"
                                            onMouseEnter={() => SPEED3.current = 0}
                                            onMouseLeave={() => SPEED3.current = 60}
                                            className="group-hover:opacity-40 hover:opacity-100! hover:shadow-2xl hover:shadow-black/30 absolute top-0 w-48 h-40 mt-3 px-3! object-contain will-change-transform cursor-pointer!"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    )
}