export default function Details(props) {
    const {
        label,
        children,
        className
    } = props;

    return (
        <div className={`grid gap-xxs margin-bottom-sm${!!className ? ` ${className}` : ""}`}>
            <dt className="col-5@md">{label}</dt>
            <dd className="col-7@md">{children}</dd>
        </div>
    )
}