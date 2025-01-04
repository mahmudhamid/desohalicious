import { DateTime } from "luxon";
import i18n from "../../i18n/config";

export default function StatusDate(props) {
    const {
        orderData
    } = props;
    let timeOutput = DateTime.fromSeconds(orderData.receivedDate, { zone: "utc", locale: i18n.locale });
    let label = "ReceivedAt";

    switch (orderData.status) {
        case "delivered":
            timeOutput = DateTime.fromSeconds(orderData.completedDate, { zone: "utc", locale: i18n.locale });
            label = "DeliveredOn";
            break;
        case "ready_for_driver":
        case "ready_for_pickup":
            timeOutput = DateTime.fromSeconds(orderData.readyDate, { zone: "utc", locale: i18n.locale });
            label = "ReadySince";
            break;
        case "out_for_delivery":
            timeOutput = DateTime.fromSeconds(orderData.pickedupDate, { zone: "utc", locale: i18n.locale });
            label = "PickedupByDriverOn";
            break;
        case "refunded":
            timeOutput = DateTime.fromSeconds(orderData.refundDate, { zone: "utc", locale: i18n.locale });
            label = "RefundedOn";
            break;
    }

    if (["received", "processing"].includes(orderData.status)) {
        return (
            <abbr title={timeOutput.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}>
                <time dateTime={timeOutput.toISO()}>{i18n.t(label, { date: timeOutput.toLocaleString(DateTime.TIME_SIMPLE) })}</time>
            </abbr>
        )
    }

    return <span>{i18n.t(label, { date: timeOutput.toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) })}</span>
}