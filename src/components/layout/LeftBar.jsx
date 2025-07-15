import {
  leftbarItems,
  Avatar,
  MoreRight,
} from "../../assets/icons/leftbar/leftbar";
import TwoColumns from "../common/TwoColumns";
import { Icon, Text } from "../common/UIElement";
// import styles from './Leftbar.module.scss';
const defaultAvatar = `${import.meta.env.VITE_API_URL}/uploads/avatar/default.png`;
import { Link, NavLink } from "react-router-dom";
import '../../styles/responsive.scss';
const API_URL = import.meta.env.VITE_API_URL 

function Leftbar({user,isOpenLeftBar, setIsOpenLeftBar}) {
  const fullAvatarURL = user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar;
  
  return (
    <div className={`sticky top-[72px] h-[calc(100vh-72px)] t_w-fit sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[25%] t_border-right  t_pt-10px ${isOpenLeftBar  ? "m_fixed m_top-62px m_left-0 m_bg-white m_w-full animate__animated animate__fadeInLeft" : "m_hidden"}`} onClick={()=>setIsOpenLeftBar(false)}>
      <div className="flex flex-col m_flex-row  m_justify-between m_pb-50px h-full"> {/* Thêm container flex để quản lý layout */}
        <div className="flex-grow flex flex-col m_flex-row m_justify-between align-center justify-between  overflow-y-auto">
          {leftbarItems.map((item, index) => (
            <div key={index}>
              <TwoColumns
                left={<img src={item.icon} width={36} height={36} />}
                right={<span className="text-base font-semibold text-black">{item.text}</span>}
                className="flex-row-start t_justify-center gap-4 px-3 py-3 lg:rounded-lg cursor-pointer hover:bg-gray-200 "
                classNameRight="t_hidden"
              />
            </div>
          ))}
          <NavLink to="/home" className={`flex-row-center `}>
          <Text
            className="w-3/4 font-semibold py-3 rounded-full bg-black text-white cursor-pointer t_hidden hover:bg-gray-900 text-center mx-3 mb-3"
            size="16px"
            children="Đăng"
          />
          </NavLink>
        </div>
        <div className="h-[1px] bg-gray-200 "></div>
        {/* Profile section at bottom */}
        <Link to={`/${user?.username}`} className="mt-auto"> 
          <TwoColumns
            left={
              <TwoColumns
                left={<img src={fullAvatarURL} width={50} height={50} className="rounded-full w-[50px] h-[50px] object-cover"/>}
                right={
                  <TwoColumns
                    left={<Text children={user?.name} className="font-bold text-black text-left text-base" size="18px"/>}
                    right={<Text children={`@${user?.username}`} className="text-gray-500 text-left font-medium"/>}
                    className="flex-col-start t_hidden gap-2"
                  />
                }
                className="flex-row-start t_justify-center t_gap-0 gap-4"
              />
            }
            right={<Icon src={MoreRight} width={15} height={15} />}
            className="flex-row-between t_justify-center gap-4 px-3 py-3 my-3 rounded-full hover:bg-gray-200 cursor-pointer"
            classNameRight="t_hidden"
          />
        </Link>
      </div>
    </div>
  );
}


export default Leftbar;
