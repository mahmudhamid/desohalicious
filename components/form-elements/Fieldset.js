export default function Fieldset(props) {
    const {
        children,
        title
    } = props;

    return (
        <fieldset>
            {!!title ? <legend className="form-legend">{title}</legend> : null}
            {children}
        </fieldset>
    )
}