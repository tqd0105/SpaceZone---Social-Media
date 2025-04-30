import { useRef, useState, useEffect } from "react";
import {
  Add,
  Avatar,
  storyDetails,
  Next,
  Back,
} from "../../assets/icons/main/main.js";
import TwoColumns from "../common/TwoColumns";
import { Text } from "../common/UIElement.jsx";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import styled from "./Main.module.scss";
import Button from "../common/Button.jsx";
const defaultAvatar =
  "https://spacezone-backend-qy5g.onrender.com/uploads/avatar/default.png";
import { useAuth } from "../../context/AuthProvider.jsx";
const API_URL =
  import.meta.env.VITE_API_URL || "https://spacezone-backend-qy5g.onrender.com";

function Story() {
  const { user } = useAuth();
  const swiperRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const fullAvatarURL = user?.avatar
    ? `${API_URL}${user.avatar}`
    : defaultAvatar;

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  const handleNavigation = () => {
    if (isMobile) {
      window.location.href = '/mobile-link';
    } else {
      window.location.href = '/laptop-link';
    }
  };

  return (
    <div className="flex-row-between gap-2 py-2 w-full overflow-x-auto relative px-2">
      {/* Ô Tạo Tin */}
      <TwoColumns
        left={
          <div className="relative">
            <img
              src={fullAvatarURL}
              width={"100%"}
              alt="avatar"
              className="rounded-t-xl h-[150px]"
            />
            <img
              src={Add}
              width={"40px"}
              height={"40px"}
              alt="add-icon"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-full border-4 rounded-full border-white cursor-pointer"
              onClick={handleNavigation}
            />
          </div>
        }
        right={
          <Text
            children={"Tạo tin"}
            size="14px"
            className="font-semibold text-center text-sm my-2"
          />
        }
        className={
          "flex-column-between bg-white w-[140px] h-[200px] rounded-xl shadow-sm cursor-pointer hover:scale-95 duration-500 border border-gray-300"
        }
      />

      {/* Slider Story */}
      <div className="relative w-full overflow-hidden">
        <img
          src={Back}
          alt="Next"
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 cursor-pointer rounded-full hover:shadow-lg hover:shadow-slate-300 duration-500"
        />
        {/* Slider Story */}
        <Swiper
          spaceBetween={10}
          slidesPerGroup={4}
          navigation={false} // Tắt navigation mặc định
          modules={[Navigation]}
          simulateTouch={false}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          speed={"1500"}
          className="w-full rounded-xl"
          breakpoints={{
            0: {
              slidesPerView: 3,
            },
            768: {
              slidesPerView: 4,
            },
          }}
        >
          {storyDetails.map((story, index) => (
            <SwiperSlide
              key={index}
              className="relative w-[120px] cursor-pointer hover:scale-95 duration-500  "
            >
              <img
                src={story.src}
                alt="story"
                className="rounded-lg shadow-md h-[200px] object-cover w-[160px]"
              />
              <TwoColumns
                left={
                  <img
                    src={story.avatar}
                    width={"40px"}
                    height={"40px"}
                    alt="avatar"
                    className={`rounded-full border-4 border-white absolute top-2 left-2 ${styled.box_shadow}`}
                  />
                }
                right={
                  <Text children={story.name} color={"white"} className={``} />
                }
                classNameRight={`absolute text-center bottom-2 left-0 w-full font-medium ${styled.textShadow}`}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Nút Phải */}
        {/* Nút Phải */}
        <img
          src={Next}
          alt="Next"
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 cursor-pointer rounded-full hover:shadow-lg hover:shadow-slate-300 duration-500"
        />
      </div>
    </div>
  );
}

export default Story;
