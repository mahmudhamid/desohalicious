
import i18n from '../../i18n/config';


export default function FieldError(props) {
    const {
        error,
        touched,
    } = props;

    if (!touched || !error) {
        return null;
    }

    return (
        <div className="bg-accent text-xs color-contrast-lower padding-xxs margin-top-xxxs radius-md">
            <p className="color-contrast-lower"><strong>{i18n.t("Error")}:</strong> {error}</p>
        </div>
    )
}