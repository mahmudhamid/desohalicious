import { useState } from 'react';
import i18n from '../../i18n/config';
import EyeCloseIcon from '../../src/icons/EyeClose';
import EyeOpenIcon from '../../src/icons/EyeOpen';
import JsLink from '../JsLink';
import FieldError from './FieldError';
import HelpText from './HelpText';

export default function PasswordField(props) {
    const {
        name,
        label,
        fullWidth,
        showForgot,
        onForgotClick,
        hideLabel,
        inputProps,
        error,
        touched,
        helpText
    } = props;
    const [showPassword, setShowPassword] = useState(false);

    function renderInput() {
        return (
            <div className={`${!fullWidth ? "col-6@md" : "width-100%"}`}>
                <div className="password">
                    <input
                        id={name}
                        name={name}
                        aria-label={label}
                        aria-invalid={!!error && !!touched}
                        className={`form-control width-100% password__input`}
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        disabled={!!props.disabled}
                        value={props.value || ""}
                        onChange={props.onChange}
                        onBlur={props.onBlur}
                        {...inputProps}
                    />

                    {!props.disabled ? (
                        <button type="button" className="password__btn" onClick={() => { setShowPassword(!showPassword) }}>
                            {showPassword ? <EyeOpenIcon className="icon icon--xs" /> : <EyeCloseIcon className="icon icon--xs" />}
                        </button>
                    ) : null}
                </div>
                <HelpText text={helpText} />
                <FieldError error={error} touched={touched} />
            </div>
        )
    }

    function renderRawLabel() {
        return <label className={`form-label text-sm margin-bottom-xxs${!fullWidth ? " col-3@md margin-0@md" : ""}${hideLabel ? " is-hidden" : ""}`} htmlFor={name}>{label}</label>
    }

    function renderLabel() {
        if (!!showForgot) {
            return (
                <div className="flex justify-between">
                    {renderRawLabel()}
                    <span className="text-sm text-right">
                        <JsLink onClick={onForgotClick} title={i18n.t("ResetPassword")}>{i18n.t("Forgot")}</JsLink>
                    </span>
                </div>
            )
        } else {
            return renderRawLabel();
        }
    }

    return (
        <div className={`margin-bottom-sm${!fullWidth ? " grid items-center@md" : ""}`}>
            {renderLabel()}
            {renderInput()}
        </div>
    )
}