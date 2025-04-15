import { Link } from "react-router-dom";

function ControlBar({ icons, size = "30", className, classNames, active, onClickControlCenter }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {icons.map((item, index) => (
        <Link 
          key={index} 
          to={item.link} 
          className={`flex items-center justify-center ${classNames} p-4 rounded-lg hover:bg-gray-200 cursor-pointer
            ${active === index ? "bg-gray-200" : ""}
          `}
          onClick={()=>onClickControlCenter(index)}
        >
          <img src={item.icon} alt={`Control Bar Icon ${index}`} width={size} height={size} />
        </Link>
      ))}
    </div>
  );
}

export default ControlBar;
