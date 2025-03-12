import {
  leftbarItems,
  Avatar,
  MoreRight,
} from "../../assets/icons/leftbar/leftbar";
import TwoColumns from "../common/TwoColumns";
import { Icon, Text } from "../common/UIElement";
// import styles from './Leftbar.module.scss';

function Leftbar() {
  return (
    <div className="sticky top-[72px] h-[calc(100vh-72px)] sm:w-1/4 md:w-1/5 lg:w-1/6 xl:w-1/6">
      <div className="flex flex-col h-full"> {/* Thêm container flex để quản lý layout */}
        <div className="flex-grow overflow-y-auto">
          {leftbarItems.map((item, index) => (
            <div key={index}>
              <TwoColumns
                left={<img src={item.icon} width={36} height={36} />}
                right={<span className="text-base">{item.text}</span>}
                className="flex-row-start gap-4 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-200"
              />
            </div>
          ))}
          
          <Text
            className="font-semibold py-3 rounded-full bg-black cursor-pointer hover:bg-gray-900 text-center mx-3 my-3"
            size="16px"
            color="white"
            children="Đăng"
          />
        </div>

        {/* Profile section at bottom */}
        <div className="mt-auto"> {/* Đẩy profile xuống dưới cùng */}
          <TwoColumns
            left={
              <TwoColumns
                left={<img src={Avatar} width={50} height={50} className="rounded-full"/>}
                right={
                  <TwoColumns
                    left={<Text children="Dũng Trần" className="font-bold" size="18px"/>}
                    right={<Text children="@tqd0105" className="text-gray-500 text-left font-medium"/>}
                    className="flex-col-start gap-2"
                  />
                }
                className="flex-row-start gap-4"
              />
            }
            right={<Icon src={MoreRight} width={15} height={15} />}
            className="flex-row-between gap-4 px-3 py-3 my-3 rounded-full hover:bg-gray-200"
          />
        </div>
      </div>
    </div>
  );
}


export default Leftbar;
