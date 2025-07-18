import { useEffect, useState } from "react";
import { useDarkMode } from "../../context/DarkModeContext";

function ToggleSwitch() {
  const [isOn, setIsOn] = useState(false);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const darkModeLocalStorage = localStorage.getItem("darkModeStatus");

  // useEffect(()=>{
  //   if (darkModeLocalStorage === "true") {
  //     setIsOn(!isOn);
  //   }
  // }, [darkModeLocalStorage])
  
  return (
    <div
      onClick={() => setIsOn(!isOn)}
      className={`w-12 h-7 flex items-center p-1  rounded-full cursor-pointer ${isOn ? "bg-green-500" : "bg-gray-300"}`}
    >
        <div className={`w-5 h-5  rounded-full transform transition-transform duration-300 ${isOn ? "translate-x-5" : ""}`}
        style={{
            backgroundColor: isOn ? "white" : "gray"
        }}
        >

        </div>
    </div>
  );
}

export default ToggleSwitch;
