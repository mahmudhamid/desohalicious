

export default function JsLink(props) {
    const {
        children,
        onClick,
        className,
        ...others
    } = props;

    function handleClick(e) {
        e.preventDefault();

        onClick();
    }

    return (
        <a href="#0" className={`link${!!className ? ` ${className}` : ""}`} onClick={handleClick} {...others} >
            {children}
        </a>
    )
}