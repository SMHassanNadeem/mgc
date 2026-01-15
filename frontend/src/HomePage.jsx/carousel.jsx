import { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CarouselFunction() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  return (
    <div className="banner h-[80vh] w-full relative">
      <Carousel
        slide
        activeIndex={index}
        onSelect={handleSelect}
        interval={5000}
        pause={false}
        className="w-full h-full"
      >
        <Carousel.Item className="h-full">
          <img
            className="w-full h-full object-cover"
            src="https://thumbs.dreamstime.com/b/person-holding-cardboard-box-likely-package-ready-delivery-just-received-person-holds-cardboard-package-ready-396642188.jpg"
            alt="Second slide"
          />
        </Carousel.Item>
        <Carousel.Item className="w-full h-full">
          <img
            className="w-full h-full object-cover"
            src="https://static.vecteezy.com/system/resources/thumbnails/033/225/671/small/close-up-courier-holding-cardboard-boxes-with-parcels-inside-for-delivery-ai-generated-photo.jpg"
            alt="First slide"
          />
        </Carousel.Item>

        <Carousel.Item className="w-full h-full">
          <img
            className="w-full h-full object-cover"
            src="https://media.istockphoto.com/id/905865682/photo/portrait-of-courier-with-digital-tablet-delivering-package.jpg?s=612x612&w=0&k=20&c=WbZu7QdzQHVqqgKI78SA4bGLzKo7jZqp5jYaGPvQaRs="
            alt="Second slide"
          />
        </Carousel.Item>
      </Carousel>
    </div>


    // <div className="h-full hidden md:block mt-30 md:mt-20 lg:mt-0 w-[80%] bg-black z-9">
    //   <Carousel
    //     slide
    //     activeIndex={index}
    //     onSelect={handleSelect}
    //     interval={2500}
    //     pause={true}
    //     className="w-full h-full"
    //   >
    //     <Carousel.Item className="h-full">
    //       <img
    //         className="w-full h-full object-cover"
    //         src="https://postex.pk/assets/images/home/home-AED-to-PKR.png"
    //         alt="Second slide"
    //       />
    //     </Carousel.Item>
    //     <Carousel.Item className="h-full">
    //       <img
    //         className="w-full h-full object-cover"
    //         src="https://postex.pk/assets/images/home/home-AED-to-PKR.png"
    //         alt="First slide"
    //       />
    //     </Carousel.Item>

    //     <Carousel.Item className="h-full">
    //       <img
    //         className="w-full h-full object-cover"
    //         src="https://postex.pk/assets/images/home/home-AED-to-PKR.png"
    //         alt="Second slide"
    //       />
    //     </Carousel.Item>

    //     <Carousel.Item className="h-full">
    //       <img
    //         className="w-full h-full object-cover"
    //         src="https://postex.pk/assets/images/home/home-AED-to-PKR.png"
    //         alt="Second slide"
    //       />
    //     </Carousel.Item>
    //   </Carousel>
    // </div>
  );
}
