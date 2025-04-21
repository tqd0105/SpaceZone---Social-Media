import { useState } from "react";
import shareWithFriends, {
  CloseBlack,
  ShareLink,
  shareThrough,
} from "../../assets/icons/main/main";
import styles from "./Main.module.scss";

function Share({ onClose }) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText("http://spacezone.com/zaggfhh12uuufhfss88");
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center  z-50 ">
      <div
        className="absolute inset-0  bg-black opacity-50 z-10"
        onClick={onClose}
      ></div>
      <div className="relative top-0 left-0 w-[600px] max-h-[80vh] bg-white p-4 z-10 rounded-xl shadow-xl animate__animated animate__bounceIn">
        <div className="flex-row-center w-full">
          <h3 className="text-lg font-bold">Chia sẽ ngay</h3>
        </div>
        <div
          className="absolute top-1 right-1 cursor-pointer hover:bg-gray-300 rounded-full p-4 "
          onClick={onClose}
        >
          <img src={CloseBlack} width={15} height={15} alt="" />
        </div>
        <div>
          <button className="bg-black text-white shadow-xl hover:bg-gray-800 my-2">
            Tạo bài đăng
          </button>
        </div>

        <div className="h-[1px] w-full bg-gray-200 my-2"></div>

        <div className="flex flex-col items-start justify-start gap-2 w-full">
          <span className="text-base font-bold">Chia sẽ với bạn bè</span>
          <div className="flex justify-start items-start gap-2 overflow-scroll w-full  ">
            {shareWithFriends.map((item, index) => {
              return (
                <div
                  className="flex flex-col gap-2 hover:bg-gray-200 px-6 py-4 rounded-lg cursor-pointer  min-h-[120px]"
                  key={index}
                >
                  <img
                    src={item.avatar}
                    className="max-w-[50px] max-h-[50px] rounded-full"
                    alt=""
                  />
                  <span
                    className={`${styles.text_ellipsis_2Line} text-xs font-medium`}
                  >
                    {item.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="h-[1px] w-full bg-gray-200 my-2"></div>

        <div>
          <span className="flex-row-start text-base font-bold">
            Chia sẽ qua
          </span>
          <div>
            <div className="relative gap-2 my-4">
              <input
                type="text"
                value="http://spacezone.com/zaggfhh12uuufhfss88"
                className="w-full bg-gray-100 p-4 rounded-lg "
              />
              <div
                className=" absolute flex-row-center gap-2 top-1/2 -translate-y-1/2 right-2 border-2 border-gray-800 hover:bg-gray-200 outline-none p-2 rounded-lg cursor-pointer"
                onClick={handleCopy}
              >
                <img src={ShareLink} width={20} height={20} alt="" />
                <span>{isCopied ? "Đã sao chép" : "Sao chép"}</span>
              </div>
            </div>
            <div className="flex-row-between ">
              {shareThrough.map((item, index) => {
                return (
                  <div
                    className="flex-column-center gap-2 hover:bg-gray-200 py-4 px-6 rounded-lg cursor-pointer"
                    key={index}
                  >
                    <img src={item.src} width={45} height={45} alt="" />
                    <span className="text-xs  ">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Share;
