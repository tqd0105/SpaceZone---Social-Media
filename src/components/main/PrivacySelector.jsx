import { useEffect, useRef, useState } from "react";
import Public from "../../assets/icons/main/Profile/public.png";
import Friend from "../../assets/icons/main/Profile/friends.png";
import OnlyMe from "../../assets/icons/main/Profile/lock.png";
import Custom from "../../assets/icons/main/Profile/setting.png";

function PrivacySelector() {
  const [selected, setSelected] = useState("od_public");
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null)

  useEffect(()=>{
    const handleClickOutside = (e) => {
        if (dropdownRef.current && !dropdownRef.current.contains(e.target)){
            setShowOptions(false)
        }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
        document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const options = [
    { label: "Công khai", value: "od_public", icon: Public },
    { label: "Bạn bè", value: "od_friend", icon: Friend },
    { label: "Chỉ mình tôi", value: "od_only_me", icon: OnlyMe },
    { label: "Tùy chỉnh", value: "od_custom", icon: Custom },
  ];

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className="relative  flex-column-center w-[130px]" ref={dropdownRef}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="flex-row-center gap-1 w-full rounded-md border border-gray-400 p-2 hover:bg-gray-100 text-sm font-semibold"
      >
         <img src={selectedOption?.icon} width={16} height={16} alt="" />
         <span className="text-black">{selectedOption?.label}</span>
      </button>

      {showOptions && (
        <div className="absolute  top-full mt-1 z-10 bg-white border rounded-md shadow-md min-w-[120px]">
          {options.map((opt) => (
            <div
              key={opt.value}
              className="flex-row-center gap-1 p-2 hover:bg-gray-100 cursor-pointer text-sm "
              onClick={() => {
                setSelected(opt.value);
                setShowOptions(false);
              }}
            >
                <img src={opt.icon} width={20} height={20} alt="" />
                <span >{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PrivacySelector;
