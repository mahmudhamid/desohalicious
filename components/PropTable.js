import i18n from "../i18n/config";
import ErrorIcon from "../src/icons/Error";
import MessageAlert from "./MessageAlert";

export default function PropTable(props) {
    const {
        loading,
        error,
        ariaLabel,
        list,
        hideEmpty
    } = props;
    const usedList = !!hideEmpty ? list.filter(item => !!item.value) : list;

    function renderValue(value) {
        if (!!value && typeof value == "object") {
            if (typeof value?.map == "function") {
                return value.map((item, index) => (
                    <p key={`${index}`}>{`${item.key}: ${item.value}`}</p>
                ))
            } else {
                return value;
            }
        }
        return value;
    }

    if (!!error) {
        return (
            <MessageAlert
                icon={<ErrorIcon className="icon icon--lg" />}
                title={i18n.t("CouldNotLoadThisList")}
            />
        )
    }

    if (!!loading) {
        return (
            <table className="prop-table width-100% text-sm" aria-label={ariaLabel}>
                <tbody className="prop-table__body">
                    {[...Array(4).keys()].map(index => (
                        <tr key={`${index}`} className="prop-table__row">
                            <th className="prop-table__cell prop-table__cell--th">
                                <div className="ske ske--text" />
                            </th>
                            <td className="prop-table__cell text-right">
                                <div className="ske ske--text" />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )
    }

    return (
        <table className="prop-table width-100% text-sm" aria-label={ariaLabel}>
            <tbody className="prop-table__body">
                {usedList.filter(ref => !!ref.value).map((item, index) => (
                    <tr key={`${index}`} className="prop-table__row">
                        <th className="prop-table__cell prop-table__cell--th">{item.key}</th>
                        <td className="prop-table__cell text-right">
                            {renderValue(item.value)}
                            {!!item.action ? item.action : null}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}