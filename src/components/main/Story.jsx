import { useRef, useState } from "react";
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
import styled from "./Story.module.scss";
import Button from "../common/Button.jsx";

function Story() {
  const swiperRef = useRef(null);
  const [isBegin, setIsBegin] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  return (
    <div className="flex-row-between gap-2 w-full overflow-hidden relative ">
      {/* Ô Tạo Tin */}
      <TwoColumns
        left={
          <div className="relative">
            <img
              src={Avatar}
              width={"100%"}
              alt="avatar"
              className="rounded-t-xl h-[160px]"
            />
            <img
              src={Add}
              width={"40px"}
              height={"40px"}
              alt="add-icon"
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-full border-4 rounded-full border-white"
            />
          </div>
        }
        right={
          <Text
            children={"Tạo tin"}
            size="14px"
            className="font-bold text-center text-sm my-2"
          />
        }
        className={
          "flex-column-between bg-white w-1/5 h-[210px] rounded-xl shadow-sm cursor-pointer hover:scale-95 duration-500"
        }
      />

      {/* Slider Story */}
      <div className="relative w-full overflow-hidden">
        {/* Nút Trái */}
        {/* Nút Phải */}
        <img
          src={Back}
          alt="Next"
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 cursor-pointer rounded-full hover:shadow-lg hover:shadow-slate-300 duration-500"
        />
        {/* Slider Story */}
        <Swiper
          spaceBetween={10}
          slidesPerView={5}
          slidesPerGroup={5}
          navigation={false} // Tắt navigation mặc định
          modules={[Navigation]}
          simulateTouch={false} 
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          speed={"1000"}
          className="w-full rounded-xl"
        >
          {storyDetails.map((story, index) => (
            <SwiperSlide
              key={index}
              className="relative w-[120px] cursor-pointer hover:scale-95 duration-500  "
            >
              <img
                src={story.src}
                alt="story"
                className="rounded-lg shadow-md h-[210px] object-cover w-full "
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
                  <Text
                    children={story.name}
                    color={"white"}
                    className={`   `}
                  />
                }
                classNameRight={`absolute text-center bottom-2 left-0 w-full font-bold ${styled.textShadow}`}
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
