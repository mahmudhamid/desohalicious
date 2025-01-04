import i18n from '../../i18n/config';
import DownIcon from '../../src/icons/Down';
import FieldError from './FieldError';
import HelpText from './HelpText';

export default function Select(props) {
    const {
        fullWidth,
        name,
        label,
        options,
        hideLabel,
        onChange,
        value,
        multiple,
        error,
        touched,
        helpText,
        inputBtn,
        wrapperClass
    } = props;

    return (
        <div className={`${!!wrapperClass ? wrapperClass : "margin-bottom-sm"}${!fullWidth ? " grid" : ""}`}>
            <label className={`form-label font-bold margin-bottom-xxs${!fullWidth ? " col-3@md margin-0@md" : ""}${hideLabel ? " is-hidden" : ""}`} htmlFor={name}>{label}</label>

            <div className={`select${!fullWidth ? " col-6@md" : " width-100%"}`}>
                <div className={`${!!inputBtn ? " flex items-center" : ""}`}>
                    <div className={`position-relative${!!inputBtn ? " margin-right-xs flex-grow" : ""}`}>
                        <select
                            id={name}
                            aria-label={label}
                            aria-invalid={!!error && !!touched}
                            name={name}
                            disabled={props.disabled || false}
                            className="select__input form-control width-100%"
                            onChange={onChange}
                            value={value}
                            multiple={!!multiple}
                        >
                            <option value="">{i18n.t("SelectOption")}</option>
                            {options.length > 0 ? options.map(option => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            )) : null}
                        </select>
                        {!multiple ? <DownIcon className="select__icon" /> : null}
                    </div>
                    {!!inputBtn ? inputBtn : null}
                </div>
                <HelpText text={helpText} />
                <FieldError error={error} touched={touched} />
            </div>
        </div>
    )
}