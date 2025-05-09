function Button({
  children,
  color = "",
  backgroundColor = "",
  hoverBackgroundColor = "rgb(35, 35, 35)",
  size = "14px",
  width = "150px",
  borderRadius = "50px",
  outline = "none",
  onClick = () => {},
  type, className
}) {
  return (
    <button
      style={{
        color: color,
        backgroundColor: backgroundColor,
        fontSize: size,
        borderRadius: borderRadius,
        width: width,
        outline: outline,
      }}
      onClick={onClick}
      onMouseEnter={(e) => (e.target.style.backgroundColor = hoverBackgroundColor)} // 👈 Đổi màu nền khi hover
      onMouseLeave={(e) => (e.target.style.backgroundColor = backgroundColor)} 
      type={type}
      className={className}
    >
      {children}
    </button>
  );
}

export default Button;
