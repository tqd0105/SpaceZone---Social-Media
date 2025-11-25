import { Link, useNavigate } from "react-router-dom";

function ControlBar({ icons, size = "30", className, classNames, active, onClickControlCenter, onClickRightBar, setIsShowRightBar }) {
  const navigate = useNavigate();

  return (
    <div className={`flex items-center justify-center ${className}`}>
      {icons.map((item, index) => {
        // 🟥 Nếu là icon thứ 6 → không dùng <Link>
        if (index === 5) {
          return (
            <div
              key={index}
              className={`flex items-center justify-center ${classNames} p-4 rounded-lg l_hidden t_hidden hover:bg-gray-300 cursor-pointer`}
              onClick={() => {
                onClickControlCenter(index);
                onClickRightBar(); // Toggle class ẩn hiện RightBar
              }}
            >
              <img src={item.icon} alt={`Control Bar Icon ${index}`} width={size} height={size} />
            </div>
          );
        }

        // ✅ Các icon khác vẫn dùng <Link>
        return (
          <Link
            key={index}
            to={item.link}
            className={`flex items-center justify-center ${classNames} p-4 rounded-lg hover:bg-gray-300 cursor-pointer
              ${active === index ? "bg-gray-200" : ""}
            `}
            onClick={() => {
              onClickControlCenter(index)
              // setIsShowRightBar(false)
            }}
          >
            <img src={item.icon} alt={`Control Bar Icon ${index}`} width={size} height={size} />
          </Link>
        );
      })}
    </div>
  );
}

export default ControlBar;
