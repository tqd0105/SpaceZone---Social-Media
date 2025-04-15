import Lottie from "lottie-react";
const ReactionButton = ({animationData, onClick}) => {
    return (
        <div className="w-10 h-10 cursor-pointer" onClick={onClick}>
            <Lottie animationData={animationData} loop={true}/>
        </div>
    )
}

export default ReactionButton;