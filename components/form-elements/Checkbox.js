import HelpText from "./HelpText";

export default function Checkbox(props) {
    const {
        name,
        label,
        checked,
        onChange,
        hideLabel,
        wrapperClass,
        helpText,
        bg
    } = props;

    return (
        <div>
            <div className={`${!!wrapperClass ? wrapperClass : "margin-bottom-sm"}`}>
                <input
                    id={name}
                    name={name}
                    aria-label={label}
                    className={`checkbox${!!bg ? " checkbox--bg" : ""}`}
                    type="checkbox"
                    checked={checked}
                    disabled={props.disabled || false}
                    onChange={onChange}
                />
                <label className={`form-label${!!hideLabel ? " is-hidden" : ""}`} htmlFor={name}>{label}</label>
            </div>
            <HelpText text={helpText} />
        </div>
    )
}