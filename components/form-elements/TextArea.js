
import FieldError from './FieldError';
import HelpText from './HelpText';

export default function TextArea(props) {
    const {
        name,
        fullWidth,
        label,
        hideLabel,
        onChange,
        placeholder,
        disabled,
        value,
        rows,
        error,
        touched,
        helpText
    } = props;

    return (
        <div className={`margin-bottom-sm${!fullWidth ? " grid items-center@md" : ""}`}>
            <label className={`form-label margin-bottom-xs${!fullWidth ? " col-3@md margin-0@md" : ""}${hideLabel ? " is-hidden" : ""}`} htmlFor={name}>{label}</label>

            <div className={`${!fullWidth ? " col-6@md" : ""}`}>
                <textarea
                    id={name}
                    name={name}
                    aria-invalid={!!error && !!touched}
                    rows={rows}
                    aria-label={label}
                    className={`form-control width-100%`}
                    onChange={onChange}
                    placeholder={placeholder || ""}
                    disabled={!!disabled || false}
                    value={value}
                />
                <HelpText text={helpText} />
                <FieldError error={error} touched={touched} />
            </div>
        </div>
    )
}