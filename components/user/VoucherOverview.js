import { DateTime } from "luxon";
import { useRouter } from "next/router";
import i18n from "../../i18n/config";
import OrdersIcon from "../../src/icons/Order";
import useCache from "../../hooks/useCache";
import Modal from "../Modal";
import PropTable from "../PropTable";
import TableList from "../TableList";

export default function VoucherOverview(props) {
    const {
        close,
        voucher
    } = props;
    const router = useRouter();
    const {timezone} = useCache("shopBasicData");
    const currencySymbol = useCache("currencySymbol");
    const redeemed = voucher.redeemed?.reduce?.((tot,elem) => {if(!elem.cancelledAt) {tot = [elem,...tot]}return tot},[]) || [];
    const totalRedeemed = voucher.redeemed?.reduce?.((tot,elem) => {if(!elem.cancelledAt) {tot = tot+elem.amount}return tot},0) || 0.0;
    const redeemedPercentage = !!totalRedeemed ? ((totalRedeemed*100)/voucher.amount) : 0;

    return (
        <Modal
            id="voucher-overview"
            open={true}
            onClose={close}
            title={i18n.t("VoucherOverview")}
        >
            <div className="padding-md">
                <div className="grid items-center margin-bottom-xs">
                    <div className={`height-100% flex justify-center overflow-hidden items-center ${redeemedPercentage > 0 ? `col-${Math.floor((redeemedPercentage*12)/100)}` : "col"}`}>
                        <span className="padding-x-sm text-truncate">{i18n.t("Redeemed")}</span>
                    </div>
                    <div className={`flex justify-center items-center overflow-hidden flex-grow ${redeemedPercentage > 0 ? 12-(Math.floor((redeemedPercentage*12)/100)) > 0 ? `col-${12-(Math.floor((redeemedPercentage*12)/100))}` : "col" : "col-12"}`}>
                        <span className="padding-x-sm text-truncate">{i18n.t("VoucherAmount")}</span>
                    </div>
                </div>
                <div className="bg-contrast-lower grid items-center radius-md overflow-hidden">
                    <div className={`height-100% bg-success flex justify-center overflow-hidden items-center ${redeemedPercentage > 0 ? `col-${Math.floor((redeemedPercentage*12)/100)}` : "col"}`}>
                        <span className="padding-xs text-truncate font-bold">{`${currencySymbol}${totalRedeemed}`}</span>
                    </div>
                    <div className={`flex justify-center items-center overflow-hidden flex-grow ${redeemedPercentage > 0 ? 12-(Math.floor((redeemedPercentage*12)/100)) > 0 ? `col-${12-(Math.floor((redeemedPercentage*12)/100))}` : "col" : "col-12"}`}>
                        <span className="padding-xs text-truncate font-bold">{`${currencySymbol}${voucher.amount}`}</span>
                    </div>
                </div>

                <p className="margin-top-md font-bold margin-bottom-sm">{i18n.t("VoucherDetails")}</p>
                <PropTable
                    ariaLabel={i18n.t("VoucherDetails")}
                    list={[
                        {
                            key: i18n.t("CreatedAt"),
                            value: !!voucher.createdAt ? DateTime.fromSeconds(voucher.createdAt, {zone: timezone}).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) : "..."
                        },
                        {
                            key: i18n.t("ExpireDate"),
                            value: !!voucher.ttl ? DateTime.fromSeconds(voucher.ttl, {zone: timezone}).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY) : "..."
                        },
                        {
                            key: i18n.t("Source"),
                            value: voucher.source == "reward" ? i18n.t("Reward") : i18n.t("Manually")
                        },
                        {
                            key: i18n.t("Reason"),
                            value: voucher.reason || null
                        }
                    ]}
                />

                <p className="margin-top-md font-bold margin-bottom-sm">{i18n.t("UsageLog")}</p>
                
                <TableList
                    noDataMsg={{
                        icon: <OrdersIcon className="icon icon--lg" />,
                        title: i18n.t("VoucherNotUsedYet"),
                    }}
                    head={[i18n.t("Date"), i18n.t("Redeemed"), i18n.t("Status")]}
                    body={redeemed.map(ref => ({
                        props: {
                            onClick: () => { router.push(`/uesr/orders/${ref.orderID}`) },
                            role: "button"
                        },
                        className: "cursor-pointer",
                        list: [
                            DateTime.fromSeconds(ref.timestamp, {zone: timezone}).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY),
                            `${currencySymbol}${ref.amount}`,
                            !!ref.completedAt ? i18n.t("Completed") : i18n.t("Pending")
                        ]
                    }) || [])
                    }
                />
            </div>
        </Modal>
    )
}