function TwoColumns({left, right, className, classNameLeft, classNameRight}) {
    return (
        <div className={className}>
            <div className={classNameLeft}>{left}</div>
            <div className={classNameRight}>{right}</div>
        </div>
    )
}

export default TwoColumns;