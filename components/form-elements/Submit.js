import i18n from "../../i18n/config";

export default function Submit(props) {
    const {
        disabled,
        label,
        secondBtn
    } = props;

    return (
        <div className={`padding-md flex border-top border-contrast-lower${!!secondBtn ? " justify-between" : " justify-end"}`}>
            {!!secondBtn ? secondBtn : null}
            <button type="submit" disabled={disabled} className="btn btn--primary btn--md">{label || i18n.t("Save")}</button>
        </div>
    )
}