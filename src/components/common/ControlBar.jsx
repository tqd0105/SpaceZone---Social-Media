// import "@/assets/styles/globals.css"

function ControlBar({icons, type = "default", size="30", className, classNames}) {
  return (
    <div className={className}>
        {
            icons.map((icon, index) => {
                return (
                    <div key={index} className={classNames}>
                        <img src={icon} alt={`Control Bar Icon ${index}`} width={size} height={size}  />
                    </div>
                )
            })
        }
    </div>
  )
}

export default ControlBar