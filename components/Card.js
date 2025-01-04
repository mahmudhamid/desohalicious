export default function DataCard(props) {
    const {
        fullWidth,
        icon,
        loading,
        error,
        primary,
        secondary,
        actions,
        bg,
        className,
        ...other
    } = props;

    return (
        <div className={`${!fullWidth ? "col-9@md" : ""}${!!className ? ` ${className}` : ""}`} {...other}>
            {!!loading ? (
                <ul className={`grid items-center ${bg ? "gap-md" : "gap-xs"}`}>
                    <li className="col-7">
                        <div className="ske ske--rect"></div>
                    </li>
                </ul>
            ) : !!error ? (
                <ul className={`grid items-center ${bg ? "gap-md" : "gap-xs"}`}>
                    <li className="col-7">
                        <p>{error}</p>
                    </li>
                </ul>
            ) : (
                        <ul className={`flex items-center margin-bottom-sm border radius-md shadow-sm bg`}>
                            {!!icon ? <li className="padding-sm padding-right-0">
                                {icon}
                            </li> : null}

                            <li className="flex-grow padding-sm">
                                <h3 className="text-base">{primary}</h3>
                                {!!secondary ? <p className="text-sm margin-top-xxxs">{secondary}</p> : null}
                            </li>

                            {!!actions ? <li className="padding-right-sm">
                                {actions}
                            </li> : null}
                        </ul>
                    )}
        </div>
    )
}