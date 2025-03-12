function Icon ({src, width, height, color, className = ""}) {
    return (
            <img src={src} width={width} height={height} className={className} color={color} alt="" />
    )
}

function Text ({color, size, className = "", children}) {
    return (
            <p className={className} style={{color: color, fontSize: size}}>{children}</p>
    )

}

export {Icon, Text}