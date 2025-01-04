export default function MessageAlert(props) {
    const {
        icon,
        title,
        desc,
        btn
    } = props;

    return (
        <div className="flex flex-column justify-center margin-y-lg padding-md items-center max-width-xs margin-x-auto">
            {!!icon ? icon : null}
            {!!title ? <h1 className="text-md margin-y-sm text-center">{title}</h1> : null}
            {!!desc ? <p className="margin-bottom-sm text-center">{desc}</p> : null}
            {!!btn ? btn : null}
        </div>
    )
}