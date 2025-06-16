import React, { Fragment, useEffect, useContext, useState } from "react";
import OrderSuccessMessage from "./OrderSuccessMessage";
import { HomeContext } from "./";
import { sliderImages } from "../../admin/dashboardAdmin/Action";

const Slider = () => {
  const { data, dispatch } = useContext(HomeContext);
  const [slide, setSlide] = useState(0);
  const [direction, setDirection] = useState("next"); // Track slide direction for animation

  useEffect(() => {
    sliderImages(dispatch); // Fetch slider images

    // Auto-slide every 5 seconds
    const interval = setInterval(() => {
      setDirection("next");
      setSlide((prev) => (prev + 1) % data.sliderImages.length);
    }, 5000);

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [data.sliderImages.length, dispatch]);

  const handlePrevSlide = () => {
    setDirection("prev");
    setSlide((prev) =>
      prev === 0 ? data.sliderImages.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setDirection("next");
    setSlide((prev) => (prev + 1) % data.sliderImages.length);
  };

  const handleDotClick = (index) => {
    setDirection(index > slide ? "next" : "prev");
    setSlide(index);
  };

  return (
    <Fragment>
      <div className="relative mt-16 bg-gray-100 border-2 overflow-hidden">
        <div
          className={`w-full transition-transform duration-700 ease-in-out ${
            direction === "next" ? "translate-x-0" : "-translate-x-full"
          }`}
          style={{
            transform: `translateX(-${slide * 100}%)`,
            display: "flex",
          }}
        >
          {data.sliderImages.length > 0
            ? data.sliderImages.map((img, index) => (
                <img
                  key={index}
                  className="w-full flex-shrink-0"
                  src={`${img.slideImage}`}
                  alt={`sliderImage-${index}`}
                />
              ))
            : ""}
        </div>

        {data?.sliderImages?.length > 0 && (
          <>
            {/* Left Arrow */}
            <svg
              onClick={handlePrevSlide}
              className="z-10 absolute top-0 left-0 mt-32 w-12 h-12 text-gray-700 cursor-pointer hover:text-yellow-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>

            {/* Right Arrow */}
            <svg
              onClick={handleNextSlide}
              className="z-10 absolute top-0 right-0 mt-32 w-12 h-12 text-gray-700 cursor-pointer hover:text-yellow-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>

            {/* Dots Navigation */}
            <div className="absolute z-20 flex space-x-2 bottom-4 justify-center">
              {data.sliderImages.map((_, index) => (
                <div
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${
                    slide === index
                      ? "bg-yellow-700"
                      : "bg-white border-2 border-yellow-700"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <OrderSuccessMessage />
    </Fragment>
  );
};

export default Slider;
