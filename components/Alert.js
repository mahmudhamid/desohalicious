import WarningIcon from '../src/icons/Warning';
import ErrorIcon from '../src/icons/Error';
import CheckIcon from '../src/icons/Check';
import CloseIcon from '../src/icons/Close';

export default function Alert(props) {
    const {
        severity,
        message,
        open,
        onClose,
        className,
        btn
    } = props;

    if (!open) {
        return null
    }

    return (
        <div className={`alert alert--${severity} alert--is-visible ${!!className ? className : "margin-bottom-md"}`} role="alert">
            <div className="flex items-center">
                {severity == "error" ? <ErrorIcon className="icon margin-right-sm icon--sm" /> : severity == "success" ? <CheckIcon className="icon margin-right-sm icon--sm" /> : severity == "warning" ? <WarningIcon className="icon margin-right-sm icon--sm" /> : null}

                <p className="flex-grow">{message}</p>

                {!!btn ? btn : null}

                {!!onClose ? <button className="reset alert__close-btn" onClick={onClose}>
                    <CloseIcon />
                </button> : null}
            </div>
        </div>
    )

}