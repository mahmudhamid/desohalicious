import i18n from "../i18n/config";
import ErrorIcon from "../src/icons/Error";
import MessageAlert from "./MessageAlert";

export default function TableList(props) {
    const {
        loading,
        error,
        head,
        body,
        noDataMsg,
        skeleton
    } = props;

    if (error) {
        return (
            <MessageAlert
                icon={<ErrorIcon className="icon icon--lg" />}
                title={i18n.t("CouldNotLoadThisList")}
            />
        )
    }

    if (body?.length == 0 && !loading) {
        return (
            <MessageAlert {...noDataMsg} />
        )
    }

    return (
        <div className="tbl text-sm">
            <table className="tbl__table border-2" aria-label="Table Example">
                <thead className="tbl__header border-bottom border-2">
                    <tr className="tbl__row">
                        {head.map(item => (
                            <th key={item} className="tbl__cell text-left" scope="col">
                                <span className="font-bold">{item}</span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody className="tbl__body">
                    {!!loading || !body ? [...Array(6).keys()].map(index => (
                        <tr key={`${index}`} className="tbl__row">
                            {[...Array(head.length).keys()].map(index => (
                                <td key={`${index}`} className="tbl__cell" role="cell">
                                    <div className={`ske ske--text col-10${skeleton == "cards" ? " margin-xs" : ""}`} />
                                </td>
                            ))}
                        </tr>
                    )) : body.map((item, index) => (
                        <tr key={`${index}`} className={`tbl__row${item.className ? ` ${item.className}` : ""}`} {...item.props}>
                            {item.list.map((value, index) => (
                                <td key={`${index}`} className="tbl__cell" role="cell">{value}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}