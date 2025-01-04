import i18n from '../i18n/config';
import CloseIcon from '../src/icons/Close';
import Skeleton from './Skeleton';

export default function Modal(props) {
    const {
        id,
        title,
        description,
        open,
        onClose,
        children,
        actionBtnProps,
        showCancelBtn,
        hideCloseBtn,
        headerBtn
    } = props;

    if (!open) {
        return null;
    }

    return (
        <div className="modal modal--animate-scale flex flex-center bg-contrast-higher bg-opacity-90% padding-md modal--is-visible" id={id}>
            <div className="modal__content width-100% max-width-xs bg radius-md shadow-md" role="alertdialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
                <header className="bg-contrast-lower padding-y-sm padding-x-md grid items-center justify-between">
                    <div className={`flex items-center justify-between ${!hideCloseBtn ? "col-10" : "col-12"} col@md`}>
                        <h4 className="width-100%" id={`${id}-title`}>{title || <Skeleton type="text" rows={1} className="col-5" />}</h4>
                        {headerBtn || null}
                    </div>

                    {!hideCloseBtn ? (
                        <div className="hide@md col flex justify-end">
                            <button className="reset modal__close-btn modal__close-btn--inner" onClick={onClose}>
                                <CloseIcon />
                            </button>
                        </div>
                    ) : null}
                </header>

                {!!description ? (
                    <p id={`${id}-description`} className="padding-y-sm padding-x-md">
                        {description}
                    </p>
                ) : null}

                {children}

                {!!actionBtnProps || !!showCancelBtn ? (
                    <footer className="padding-md border-top border-contrast-lower">
                        <div className="flex justify-end gap-xs">
                            <button type="button" onClick={onClose} className="btn btn--subtle btn--md">{i18n.t("Cancel")}</button>
                            {!!actionBtnProps && <button type="button" className="btn btn--primary btn--md" {...actionBtnProps}>{actionBtnProps.label || i18n.t("Save")}</button> || null}
                        </div>
                    </footer>
                ) : null}
            </div>

            {!hideCloseBtn ? (
                <button type="submit" className="reset modal__close-btn modal__close-btn--outer display@md" onClick={onClose}>
                    <CloseIcon />
                </button>
            ) : null}
        </div>
    )
}