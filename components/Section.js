export default function Section(props) {
    const {
        title,
        actions,
        children
    } = props;

    return (
        <div className="padding-md bg shadow-xs radius-md margin-bottom-sm">
            <ul className="flex items-center margin-bottom-sm">
                <li className="flex-grow">
                    <h2 className="text-md">{title}</h2>
                </li>

                {!!actions ? <li>
                    {actions}
                </li> : null}
            </ul>

            <div className="content">
                {children}
            </div>
        </div>
    )
}