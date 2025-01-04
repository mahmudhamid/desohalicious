import CloseIcon from "../src/icons/Close";

export default function Overlay(props) {
    const {
        open,
        close,
        title,
        children
    } = props;

    return (
        <div className={`drawer drawer--bottom ${!!open ? " drawer--is-visible" : ""}`}>
            <div className="drawer__content flex flex-column" role="alertdialog" aria-labelledby="notification-drawer-title">
                <header className="drawer__header">
                    <h4 id="notification-drawer-title" className="text-truncate">{title}</h4>

                    <button className="reset drawer__close-btn" onClick={close}>
                        <CloseIcon />
                    </button>
                </header>

                <div className="drawer__body padding-x-md padding-y-sm">
                    {children}
                </div>
            </div>
        </div>
    )
}