import { useState } from "react";
import i18n from "../../i18n/config";
import HelpCircleIcon from "../../src/icons/HelpCircle";
import FieldError from "./FieldError";
import HelpText from "./HelpText";

export default function Switch(props) {
    const {
        fullWidth,
        name,
        checked,
        disabled,
        label,
        className,
        hide,
        helpText,
        hideHelp,
        error,
        touched
    } = props;
    const [showHelp, setShowHelp] = useState(false);

    if (hide) {
        return null
    }

    return (
        <div className={`margin-bottom-sm${!!className ? ` ${className}` : ""}`}>
            <div className="grid items-center@md">
                {!!label ? <p className={`form-label text-sm flex items-center${!fullWidth ? " col-3" : " col-9"}`}>{label}{!!hideHelp ? <button className="btn btn--icon margin-left-xxxs" type="button" onClick={() => { setShowHelp(!showHelp) }}><HelpCircleIcon /></button> : null}</p> : null}
                <div className={`${!fullWidth ? "col-6" : "col-3 flex justify-end"}`}>
                    <div className="switch">
                        <input
                            className="switch__input"
                            aria-label={label}
                            aria-invalid={!!error}
                            type="checkbox"
                            name={name}
                            id={name}
                            checked={checked}
                            value="1"
                            disabled={disabled}
                            readOnly={disabled}
                            onChange={props.onChange || null}
                            onBlur={props.onBlur || null}
                        />
                        <label className="switch__label cursor-pointer flex items-center text-sm color-white" htmlFor={name} aria-hidden="true">
                            {!!checked ? <span className="margin-left-xs">{i18n.t("On")}</span> : <span className="text-right width-100% padding-right-sm">{i18n.t("Off")}</span>}
                        </label>
                        <div className="switch__marker" aria-hidden="true"></div>
                    </div>
                </div>
            </div>
            {!!showHelp || !hideHelp ? <HelpText text={helpText} /> : null}
            <FieldError error={error} touched={touched} />
        </div>
    )
}