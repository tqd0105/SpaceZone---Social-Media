function Icon ({src, width, height, className = "", onClick}) {
    return (
            <img src={src} width={width} height={height} className={className} alt="" onClick={onClick}/>
    )
}

function Text ({ size, className = "", children}) {
    return (
            <p className={className} style={{ fontSize: size}}>{children}</p>
    )

}

export {Icon, Text}