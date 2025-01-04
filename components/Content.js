export default function Content(props) {
    const {
        className,
        children,
        ...others
    } = props;

    return (
        <div className={`${!!className ? `${className}` : "bg margin-bottom-md"}`} {...others} >
            {children}
        </div>
    )
}