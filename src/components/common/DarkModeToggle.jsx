import { DarkMode, LightMode } from "../../assets/icons/header/header";
import { useDarkMode } from "../../context/DarkModeContext";
import ToggleSwitch from "./ToggleSwitch";

function DarkModeToggle() {
    const { darkMode, toggleDarkMode } = useDarkMode();

    return (
        <div
            className="p-2 rounded-lg hover:bg-gray-100 flex-row-between m_flex-row
            transition-colors duration-200"
        >
            <div className="flex items-center m_flex-row gap-2">
                <img src={`${darkMode ? DarkMode : LightMode}`} width={25} height={25} alt="" />
                <span className="text-black">Chế độ tối</span>
            </div>
            <div onClick={toggleDarkMode}>
                <ToggleSwitch />
            </div>
        </div>
    );
}

export default DarkModeToggle;