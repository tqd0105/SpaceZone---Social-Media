import {
  leftbarItems,
  Avatar,
  MoreRight,
} from "../../assets/icons/leftbar/leftbar";
import TwoColumns from "../common/TwoColumns";
import { Icon, Text } from "../common/UIElement";
// import styles from './Leftbar.module.scss';
import defaultAvatar from '../../../spacezone-backend/uploads/avatar/default.png'
import { Link, NavLink } from "react-router-dom";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Leftbar({user}) {
  const fullAvatarURL = user?.avatar ? `${API_URL}${user.avatar}` : defaultAvatar;
  
  return (
    <div className="sticky top-[72px] h-[calc(100vh-72px)] sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-[25%]">
      <div className="flex flex-col h-full"> {/* Thêm container flex để quản lý layout */}
        <div className="flex-grow flex flex-col align-center justify-between  overflow-y-auto">
          {leftbarItems.map((item, index) => (
            <div key={index}>
              <TwoColumns
                left={<img src={item.icon} width={36} height={36} />}
                right={<span className="text-base font-semibold">{item.text}</span>}
                className="flex-row-start gap-4 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-200 "
              />
            </div>
          ))}
          <NavLink to="/home" className={`flex-row-center `}>
          <Text
            className="w-3/4 font-semibold py-3 rounded-full bg-black cursor-pointer hover:bg-gray-900 text-center mx-3 mb-3"
            size="16px"
            color="white"
            children="Đăng"
          />
          </NavLink>
        </div>
        <div className="h-[1px] bg-gray-200 "></div>
        {/* Profile section at bottom */}
        <Link to={`/${user?.username}`} className="mt-auto"> {/* Đẩy profile xuống dưới cùng */}
          <TwoColumns
            left={
              <TwoColumns
                left={<img src={fullAvatarURL} width={50} height={50} className="rounded-full w-[50px] h-[50px] object-cover"/>}
                right={
                  <TwoColumns
                    left={<Text children={user?.name} className="font-bold text-black text-left text-base" size="18px"/>}
                    right={<Text children={`@${user?.username}`} className="text-gray-500 text-left font-medium"/>}
                    className="flex-col-start gap-2"
                  />
                }
                className="flex-row-start gap-4"
              />
            }
            right={<Icon src={MoreRight} width={15} height={15} />}
            className="flex-row-between gap-4 px-3 py-3 my-3 rounded-full hover:bg-gray-200 cursor-pointer"
          />
        </Link>
      </div>
    </div>
  );
}


export default Leftbar;
