function Icon ({src, width, height, className = "", onClick}) {
    return (
            <img src={src} width={width} height={height} className={className} alt="" onClick={onClick}/>
    )
}

function Text ({color, size, className = "", children}) {
    return (
            <p className={className} style={{color: color, fontSize: size}}>{children}</p>
    )

}

export {Icon, Text}