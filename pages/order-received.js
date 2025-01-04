import React, { useEffect } from 'react';
import i18n from '../i18n/config';
import { useRouter } from 'next/router';
import { gql, useLazyQuery } from '@apollo/client';
import Loader from '../components/Loader';
import { DateTime } from 'luxon';
import Link from 'next/link';
import { readFriendlyOrderStatus } from '../src/appConfig';
import Page from '../components/Page';
import Details from '../components/Details';
import useCache from '../hooks/useCache';

const getOrderDataQuery = gql`
    query GetOrder($id: ID!) {
        getOrder(id: $id) {
            id
            status
            receivedDate
            client {
                name
                contact
                address
                address_2
                deliveryNote
            }
            orderTypeID
            deliveryTime {
                time
                confirmed
                note
            }
        }
    }
`;

export default function OrderReceived(props) {
    const router = useRouter();
    const orderID = router.query.id || null;
    const [getOrderData, getOrderDataStatus] = useLazyQuery(getOrderDataQuery, { onError: loadError });
    const shopBasicData = useCache("shopBasicData");
    const orderData = getOrderDataStatus.data != null && getOrderDataStatus.data.getOrder || {};
    const receivedDate = "receivedDate" in orderData && DateTime.fromSeconds(orderData.receivedDate).setLocale(i18n.locale).setZone(shopBasicData.timezone).toLocaleString(DateTime.DATETIME_MED) || null;
    const deliveryDate = !!orderData?.deliveryTime?.time && DateTime.fromSeconds(orderData.deliveryTime.time).setLocale(i18n.locale).setZone(shopBasicData.timezone).toLocaleString(DateTime.DATETIME_MED) || null;
    const isLoading = getOrderDataStatus.loading || !getOrderDataStatus.called;
    const basePath = {
        href: `/order-received?id=${orderID}`,
        as: `/order-received?id=${orderID}`
    };

    useEffect(() => {
        if (orderID != null) {
            getOrderData({ variables: { id: orderID } })
        }
    }, [orderID]);

    function loadError(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    return (
        <>
            <Page
                title={i18n.t("OrderReceived")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <section className="thank-you padding-bottom-xl padding-top-lg bg">
                    <div className="container max-width-xxxxs">
                        <div className="text-center">
                            <svg className="thank-you__icon margin-bottom-sm" viewBox="0 0 80 80" aria-hidden="true"><g className="thank-you__icon-group"><circle fill="var(--color-success)" cx="40" cy="40" r="40" /><polyline points="21 41 33 53 59 27" fill="none" stroke="#fff" strokeMiterlimit="10" strokeWidth="2" /></g></svg>
                            <h1 className="text-xxxl">{i18n.t("OrderReceived")}</h1>
                        </div>

                        <p className="color-contrast-medium margin-y-md text-center">{receivedDate}</p>

                        {isLoading ? (

                            <Loader center={true} />

                        ) : "id" in orderData ? (
                            <>
                                <Details label={i18n.t("OrderStatus")}>
                                    <p className="text-right@md">{readFriendlyOrderStatus[orderData.status]}</p>
                                </Details>

                                {orderData.orderTypeID == "delivery" ? (
                                    <>
                                        <Details label={i18n.t('ThisOrderWillBeDeliveredTo')}>
                                            <p className="text-right@md">
                                                {orderData.client.name} <br />
                                                {orderData.client.address_2 != null && orderData.client.address_2.length > 0 && <>{orderData.client.address_2} <br /></> || null}
                                                {orderData.client.address} <br />
                                                {orderData.client.contact} <br />
                                            </p>
                                        </Details>

                                        {orderData.client?.deliveryNote && (
                                            <Details label={i18n.t("DeliveryNote")}>
                                                <p className="text-right@md">
                                                    {orderData.client.deliveryNote}
                                                </p>
                                            </Details>
                                        )}
                                    </>
                                ) : (
                                    <Details label={i18n.t("ThisOrderShouldBePickedUpFrom")}>
                                        <p className="text-right@md">
                                            {shopBasicData.address.address}
                                        </p>
                                    </Details>
                                )}

                                {!!deliveryDate ? (
                                    <Details label={orderData.orderTypeID == "delivery" && i18n.t("EstimateDeliveryTime") || i18n.t("EstimatePickupTime")}>
                                        <p className="text-right@md">
                                            {`${deliveryDate}${!orderData.deliveryTime.confirmed ? ` (${i18n.t("PendingConfirmation")})` : ""}`}
                                        </p>
                                    </Details>
                                ) : null}

                                {!!orderData.deliveryTime.note ? (
                                    <Details label={i18n.t("DeliveryNote")}>
                                        <p className="text-right@md">
                                            {i18n.t("Note", { note: orderData.deliveryTime.note })}
                                        </p>
                                    </Details>
                                ) : null}

                            </>
                        ) : null}

                        <p className="flex items-center justify-center margin-top-lg">
                            <Link href="/">
                                <a className="btn btn--subtle margin-right-sm">{i18n.t("BackHome")}</a>
                            </Link>
                            <Link href="/user/orders/[orderid]" as={`/user/orders/${orderData.id}`}>
                                <a className="btn btn--primary">{i18n.t("ViewOrder")}</a>
                            </Link>
                        </p>
                    </div>
                </section>
            </Page>
        </>
    )
}