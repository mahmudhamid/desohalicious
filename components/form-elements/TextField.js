import FieldError from './FieldError';
import HelpText from './HelpText';

export default function TextField(props) {
    const {
        name,
        fullWidth,
        type,
        label,
        hideLabel,
        tagStart,
        tagEnd,
        inputProps,
        inputBtn,
        error,
        touched,
        helpText,
        wrapperClass
    } = props;
    const hasTag = !!tagStart || !!tagEnd;

    function renderInputRaw() {
        return (
            <div className="flex-grow">
                <input
                    id={name}
                    name={name}
                    aria-label={label}
                    aria-invalid={!!error && !!touched}
                    className="form-control width-100%"
                    type={type || "text"}
                    value={props.value || ""}
                    onChange={props.onChange}
                    onBlur={props.onBlur}
                    placeholder={props.placeholder || ""}
                    disabled={props.disabled || false}
                    {...inputProps}
                />
                <HelpText text={helpText} />
                <FieldError error={error} touched={touched} />
            </div>
        )
    }

    function renderInput() {
        return !!inputBtn ? (
            <div className="flex flex-grow">
                <div className="flex-grow">
                    {renderInputRaw()}
                </div>
                <div className="padding-left-sm text-right">
                    {inputBtn}
                </div>
            </div>
        ) : renderInputRaw()
    }

    function renderLabel() {
        return <label className={`form-label margin-bottom-xxs${!fullWidth ? " col-3@md margin-0@md" : ""}${hideLabel ? " is-hidden" : ""}`} htmlFor={name}>{label}</label>
    }

    return (
        <div className={`${!!wrapperClass ? wrapperClass : "margin-bottom-sm"}${!fullWidth ? " grid items-center@md" : ""}`}>
            {renderLabel()}
            <div className={`${!fullWidth ? "col-6@md" : "width-100%"}${!!hasTag ? " input-group" : ""}`}>
                {!!tagStart && <div className="input-group__tag">{tagStart}</div> || null}
                {renderInput()}
                {!!tagEnd && <div className="input-group__tag">{tagEnd}</div> || null}
            </div>
        </div>
    )
}