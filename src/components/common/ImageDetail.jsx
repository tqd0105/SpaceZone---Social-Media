import {CloseWhite } from "../../assets/icons/main/main";
const API_URL = import.meta.env.VITE_API_URL || "https://spacezone-backend.up.railway.app";

function ImageDetail ({isAvatar, user, onClose}) {
    const imageUrl = isAvatar
    ? `${API_URL}${user?.avatar}`
    : `${API_URL}${user?.coverImage}`;
    return (
        <div className="fixed inset-0 flex-row-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-80" onClick={onClose}></div>
            <div className="absolute top-4 left-4 hover:bg-gray-800 bg-black rounded-full p-3" onClick={onClose}>
                <img src={CloseWhite} width={20} height={20} alt="" />
            </div>
            <div className={`relative  bg-white shadow-lg ${isAvatar ? "rounded-full" : "rounded-md w-11/12"} shadow-2xl flex-row-center animate__animated animate__zoomIn animate__slow`}>
                <img src={imageUrl} className={` object-cover ${isAvatar ? "rounded-full w-[700px] h-[700px] " : " rounded-md w-full h-[600px] "} `} alt="" />
            </div>
        </div>
    )
}

export default ImageDetail;
