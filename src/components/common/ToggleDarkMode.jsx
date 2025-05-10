// import { useState, useEffect } from "react";
// import { useDarkMode } from "../../context/DarkModeContext";

// function ToggleDarkMode() {
// //   // Đọc trạng thái từ localStorage khi component mount
// //   const [isOn, setIsOn] = useState(() => {
// //     const savedMode = localStorage.getItem('darkMode');
// //     return savedMode === 'true';
// //   });

// //   useEffect(() => {
// //     // Lưu trạng thái vào localStorage mỗi khi isOn thay đổi
// //     localStorage.setItem('darkMode', isOn);
    
// //     // Thêm/xóa class dark cho document
// //     if (isOn) {
// //       document.documentElement.classList.add('dark');
// //     } else {
// //       document.documentElement.classList.remove('dark');
// //     }
// //   }, [isOn]);

// //   const toggleSwitch = (e) => {
// //     e.stopPropagation(); 
// //     setIsOn(prev => !prev);
// //   }

// const { darkMode, toggleDarkMode } = useDarkMode();
// const [isOn, setIsOn] = useState(darkMode);
  
//   return (
//     <div
//       onClick={toggleDarkMode}
//       className={`w-12 h-7 flex items-center p-1 rounded-full cursor-pointer ${isOn ? "bg-green-500" : "bg-gray-300"}`}
//     >
//       <div 
//         className={`w-5 h-5 rounded-full transform transition-transform duration-300 ${isOn ? "translate-x-5" : ""}`}
//         style={{
//           backgroundColor: isOn ? "white" : "gray"
//         }}
//       />
//     </div>
//   );
// }

// export default ToggleDarkMode;