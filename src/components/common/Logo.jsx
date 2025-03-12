import LogoImage from "@/assets/logoNoText.svg"

function Logo ({width,height,type="default"}) {
    return (
            <img src={LogoImage} width={width} height={height} alt="logo" className={`Logo_${type} rounded-full` }/>
    )
}

export default Logo;