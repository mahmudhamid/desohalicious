import { useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import i18n from '../../../i18n/config';
import List from '../../../components/List';
import { useRouter } from 'next/router';
import Page from '../../../components/Page';
import PageTitle from '../../../components/PageTitle';
import Tabs from '../../../components/Tabs';
import OrdersIcon from '../../../src/icons/Order';
import Link from 'next/link';
import { readFriendlyOrderStatus } from '../../../src/appConfig';
import StatusDate from '../../../components/order/StatusDate';
import { DateTime } from 'luxon';
import LoginMsg from '../../../components/LoginMsg';
import useCache from '../../../hooks/useCache';

const getOrdersQuery = gql`
    query GetOrders($status: ListOrdersStatus!, $limit: Int, $nextToken: String) {
        listOrders(status: $status, limit: $limit, nextToken: $nextToken) {
            items {
                id
                status
                receivedDate
                completedDate
                refundDate
                totals {
                    total
                }
                orderTypeID
                deliveryTime {
                    time
                    confirmed
                    note
                }
            }
            nextToken
        }
    }
`;

export default function UserOrders(props) {
    const router = useRouter();
    const [getOrders, getOrdersStatus] = useLazyQuery(getOrdersQuery, { onError: loadError, fetchPolicy: "network-only" });
    const currency = useCache("currencySymbol");
    const userData = useCache("userData");
    const shopBasicData = useCache("shopBasicData");
    const orders = getOrdersStatus?.data?.listOrders?.items || [];
    const isLoading = getOrdersStatus.loading || !getOrdersStatus.called;
    const activeTab = router.query.tab || "active";
    const basePath = {
        href: `/user/orders`,
        as: `/user/orders`
    };

    useEffect(() => {
        if (activeTab && userData?.username) {
            getOrders({ variables: { status: activeTab } });
        }
    }, [activeTab, userData?.username]);

    function loadError(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    return (
        <>
            <Page
                title={i18n.t("Orders")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <PageTitle
                    title={i18n.t("Orders")}
                />

                <Tabs
                    label={i18n.t("Orders")}
                    activeTab={`${basePath.as}?tab=${activeTab}`}
                    links={[
                        {
                            href: `${basePath.as}?tab=active`,
                            as: `${basePath.as}?tab=active`,
                            label: i18n.t("ActiveOrders")
                        },
                        {
                            href: `${basePath.as}?tab=history`,
                            as: `${basePath.as}?tab=history`,
                            label: i18n.t("HistoryOrders")
                        }
                    ]}
                />
                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : (
                    <List
                        skeleton={{ type: "list", rows: 3 }}
                        loading={isLoading}
                        noDataMsg={{
                            icon: <OrdersIcon className="icon icon--lg icon-fill" />,
                            title: i18n.t("NoOrdersYet"),
                            btn: (
                                <Link href="/" >
                                    <a className="btn btn--primary">
                                        {i18n.t("CreateYourFirstOrder")}
                                    </a>
                                </Link>
                            )
                        }}
                        error={getOrdersStatus.error != undefined}
                        list={orders.map(order => ({
                            id: order.id,
                            primary: <span className="text-sm">{<StatusDate orderData={order} />}</span>,
                            secondary: <div className="margin-top-xxxs">
                                <div className="flex items-center">
                                    <span>{`${i18n.t("Total")} ${currency}${order.totals.total} -`}</span>
                                    <span className="margin-left-xxs text-uppercase">{i18n.t(order.orderTypeID)}</span>
                                </div>
                                {order.status != "delivered" && order.status != "refunded" && !!order.deliveryTime ? <div className="text-sm">
                                    {order.deliveryTime.time > 0 ? (
                                        <p className="margin-top-xxs">{`${order.orderTypeID == "delivery" && i18n.t("EstDeliveryTime") || i18n.t("EstPickupTime")}: ${DateTime.fromSeconds(order.deliveryTime.time).setLocale(i18n.locale).setZone(shopBasicData.timezone).toLocaleString(DateTime.DATETIME_MED)}`}</p>
                                    ) : null}
                                    {!!order.deliveryTime.note && <p>{i18n.t("Note", { note: order.deliveryTime.note })}</p> || null}
                                </div> : null}
                            </div>,
                            button: true,
                            action: <button type="button" className="reset text-sm" onClick={() => { router.push(`/user/orders/[orderid]`, `/user/orders/${order.id}`) }}>
                                {readFriendlyOrderStatus[order.status]}
                            </button>,
                            onClick: () => {
                                router.push(`/user/orders/[orderid]`, `/user/orders/${order.id}`);
                            }
                        }))}
                    />
                )}
            </Page>
        </>
    )

}