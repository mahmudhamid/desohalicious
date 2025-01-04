import { useEffect } from 'react';
import { useRouter } from 'next/router'
import i18n from '../../../i18n/config';
import { getCurrencySymbol, readFriendlyOrderActivity, readFriendlyOrderStatus } from '../../../src/appConfig';
import { useLazyQuery, gql, useMutation } from '@apollo/client';
import RateOrderForm from '../../../components/forms/RateOrderForm';
import { DateTime } from 'luxon';
import CompletePayment from '../../../components/order/CompletePayment';
import PageTitle from '../../../components/PageTitle';
import LeftIcon from '../../../src/icons/Left';
import Tabs from '../../../components/Tabs';
import Link from 'next/link';
import TableList from '../../../components/TableList';
import PropTable from '../../../components/PropTable';
import Page from '../../../components/Page';
import Section from '../../../components/Section';
import Content from '../../../components/Content';
import Details from '../../../components/Details';
import MessageAlert from '../../../components/MessageAlert';
import StarIcon from '../../../src/icons/Star';
import StatusDate from '../../../components/order/StatusDate';
import LoginMsg from '../../../components/LoginMsg';
import { cacheReducer } from '../../../src/cacheReducer';
import useCache from '../../../hooks/useCache';
import RatingIcon from '../../../src/icons/Rating';
import Skeleton from '../../../components/Skeleton';

const getOrderQuery = gql`
    query GetOrder($id: ID!) {
        getOrder(id: $id) {
            id
            status
            completedDate
            readyDate
            currency
            refundDate
            receivedDate
            activity {
                state
                date
            }
            client {
                name
                contact
                address
                address_2
                deliveryNote
            }
            items {
                id
	            name
	            itemID
	            modifiers {
                    id
                    publicLabel
                    options {
                        id
                        name
                        upcharge
                    }
                }
	            size {
                    id
                    option {
                        id
                        name
                        price
                    }
                }
	            price
	            total
	            modifiersTotal
                qty
            }
            orderTypeID
            deliveryTime {
                time
                confirmed
                note
            }
            clientReview {
                foodWasGood
                deliveryOnTime
                orderWasCorrect
                comment
                createdAt
            }
            totals {
                subTotal
                delivery {
                    fee
	                time
                }
                fees {
                    total
                    data {
                        name
                        amount
                    }
                }
                discounts {
                    total
                    data {
                        id
                        label
                        amount
                        reason
                        source
                        sourceID
                    }
                }
                additionalFees {
                    total
                    data {
                        id
                        label
                        amount
                        reason
                    }
                }
                onAccount
                refundAmount
                amountDue
                total
            }
        }
    }
`;

const confirmOrderAdjustment = gql`
    mutation ConfirmOrderAdjustment($input: ConfirmOrderAdjustmentInput!) {
        confirmOrderAdjustment(input: $input)
    }
`;

export const orderTotals = (totals, order) => {
    const currency = getCurrencySymbol(order.currency);

    let totalsList = [{ key: i18n.t("SubTotal"), value: `${currency}${totals.subTotal}` }];

    if (totals?.discounts?.total > 0) {
        totals.discounts.data.forEach((discount, index) => {
            if (discount.source == "discount") {
                totalsList.push({ key: `${discount.label}${!!discount.reason ? ` - ${discount.reason}` : ""}`, value: `- ${currency}${discount.amount}` });
            } else {
                totalsList.push({ key: i18n.t("Voucher"), value: `- ${currency}${discount.amount}` });
            }
        })
    }

    if (totals?.delivery?.fee > 0) {
        totalsList.push({ key: i18n.t("DeliveryFee"), value: `${currency}${totals.delivery.fee}` });
    }

    if (totals?.fees?.total > 0) {
        totalsList.push({ key: i18n.t("Fees"), value: totals.fees.data.map((fee, index) => ({ key: fee.name, value: `${currency}${fee.amount}` })) });
    }

    if (totals?.additionalFees?.total > 0) {
        totalsList.push({ key: i18n.t("AdditionalFees"), value: totals.additionalFees.data.map((fee, index) => ({ key: `${fee.label} - ${!!fee.reason ? ` - ${fee.reason}` : ""}`, value: `${currency}${fee.amount}` })) });
    }

    totalsList.push({ key: i18n.t("Total"), value: `${currency}${totals.total}` });

    if (!!totals.onAccount) {
        totalsList.push({ key: i18n.t("OnAccount"), value: `${currency}${totals.onAccount}` });
    }

    if (!!totals.refundAmount) {
        totalsList.push({ key: i18n.t("RefundAmount"), value: `${currency}${totals.refundAmount}` });
    }

    if (!!totals.amountDue) {
        totalsList.push({ key: i18n.t("AmountDue"), value: `${currency}${totals.amountDue}` });
    }

    return totalsList;
}

export const queryGetOrder = getOrderQuery;

export default function Order(props) {
    const router = useRouter();
    const orderID = router.query.orderid || null;
    const [getOrder, getOrderStatus] = useLazyQuery(getOrderQuery, { onError: loadError });
    const [processConfirmOrder, processConfirmOrderStatus] = useMutation(confirmOrderAdjustment);
    const shopBasicData = useCache("shopBasicData");
    const userData = useCache("userData");
    const orderData = getOrderStatus?.data?.getOrder || {};
    const currency = getCurrencySymbol(orderData.currency);
    const totals = orderData.totals || {};
    const totalsList = orderTotals(totals, orderData);
    const locale = shopBasicData.locale;
    const deliveryDate = !!orderData?.deliveryTime?.time && DateTime.fromSeconds(orderData.deliveryTime.time).setLocale(i18n.locale).setZone(shopBasicData.timezone).toLocaleString(DateTime.DATETIME_MED) || null;
    const activeTab = router.query.tab || "summary";
    const splitOrderID = orderID.split("-");
    const isLoadingData = getOrderStatus.loading || !getOrderStatus.called;
    const basePath = {
        href: `/user/orders/[orderid]`,
        as: `/user/orders/${orderID}`
    }

    useEffect(() => {
        if (orderID && userData?.username) {
            getOrder({ variables: { id: orderID } });
        }
    }, [orderID, userData?.username]);

    function loadError(error) {
        console.log(error);
    }

    function closeDialogs() {
        router.push(`${basePath.href}?activeTab`, `${basePath.as}?activeTab`);
    }

    async function confirmOrder(paymentData) {
        let args = {
            variables: {
                input: {
                    orderID: orderID
                }
            }
        };

        if (paymentData) {
            args.variables.input.transaction = paymentData;
        }

        try {
            cacheReducer("PROCESSINGCHECKPUT", true);
            const result = await processConfirmOrder(args);
            if (result.errors) {
                throw result.errors
            }
            await getOrderStatus.refetch();
            cacheReducer("PROCESSINGCHECKPUT", false);
        } catch (err) {
            cacheReducer("PROCESSINGCHECKPUT", false);
            throw err;
        }
    }

    function completePayment() {
        if (orderData.status == "client_action_required") {
            return (
                <Content className="bg margin-top-sm padding-md">
                    {totals.amountDue > 0 ? (
                        <CompletePayment
                            orderData={orderData}
                            basePath={basePath}
                            closeDialogs={closeDialogs}
                            paymentReceived={confirmOrder}
                        />
                    ) : (
                        <button disabled={processConfirmOrderStatus.loading} onClick={confirmOrder} className="btn btn--primary">
                            {i18n.t("ConfirmOrderAdjustments")}
                        </button>
                    )}
                </Content>
            )
        }
    }

    function renderSummary() {
        return (
            <>
                <Section
                    title={i18n.t("GeneralInfo")}
                >
                    {!!isLoadingData ? (
                        <Skeleton type="details" />
                    ) : !isLoadingData && !!orderData.id ? (
                        <dl>
                            <Details label={i18n.t("OrderType")}>
                                {i18n.t(orderData.orderTypeID)}
                            </Details>

                            <Details label={i18n.t("Status")}>
                                <span className="margin-right-xs">{readFriendlyOrderStatus[orderData.status]}</span>
                                <StatusDate orderData={orderData} />
                            </Details>

                            <Details label={i18n.t(orderData.orderTypeID == "delivery" ? "DeliveryTo" : "PickupBy")}>
                                <p>{orderData.client.name}</p>
                                <p>{orderData.client.email}</p>
                                {orderData.orderTypeID == "delivery" ? (
                                    <>
                                    {!!orderData.client?.address_2 ? <p>{orderData.client.address_2}</p> : null}
                                    <p>{orderData.client.address}</p>
                                    <p>{orderData.client.contact}</p>
                                    {!!orderData.deliveryNote ? <p className="margin-top-xs">{`${i18n.t("DeliveryNote")}: ${orderData.deliveryNote}`}</p> : null}
                                    </>
                                ) : null}
                            </Details>
                            
                            {orderData.orderTypeID != "delivery" ? (
                            <Details label={i18n.t("PickupInfo")}>
                                <p>{i18n.t("ThisOrderShouldBePickedUpFrom")}</p>
                                <p>{shopBasicData.address.address}</p>
                            </Details>
                            ) : null}

                            {!!deliveryDate ? (
                                <Details label={orderData.orderTypeID == "delivery" && i18n.t("EstimateDeliveryTime") || i18n.t("EstimatePickupTime")}>
                                    <p>
                                        {`${deliveryDate}${!orderData.deliveryTime.confirmed ? ` (${i18n.t("PendingConfirmation")})` : ""}`}
                                    </p>
                                </Details>
                            ) : null}

                            {!!orderData.deliveryTime.note ? (
                                <Details label={i18n.t("NoteTitle")}>
                                    {orderData.deliveryTime.note}
                                </Details>
                            ) : null}

                        </dl>
                    ) : null}
                </Section>
                <Section
                    title={i18n.t("OrderItems")}
                >
                    <TableList
                        loading={isLoadingData}
                        error={!isLoadingData && !orderData.id}
                        head={[i18n.t("Qty"), i18n.t("Item"), i18n.t("Total")]}
                        body={orderData?.items?.map?.(item => ({
                            list: [
                                item.qty,
                                <div>
                                    <p className="margin-bottom-xxxxs font-bold">{`${item.name}${!!item.size && !!item.size.id ? ` (${item.size.option.name})` : null} ${currency}${item.price}`}</p>
                                    {item.modifiers?.length > 0 ?
                                        <div className={`color-error`}>
                                            {item.modifiers.map(modifier => (
                                                <div key={modifier.id} className="margin-top-xs">
                                                    <p>{modifier.internalID || modifier.publicLabel}</p>
                                                    <ul className="border-left margin-left-xxxs padding-left-xxxs margin-top-xxs">
                                                        {modifier.options.map(option => (
                                                            <li key={option.id}>{`${option.name}${option.upcharge > 0 ? ` + ${currency}${option.upcharge}` : ""}`}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                        : null}
                                </div>,
                                `${currency} ${item.total}`
                            ]
                        }) || [])}
                    />
                </Section>
                <Section
                    title={i18n.t("Totals")}
                >
                    <PropTable
                        loading={isLoadingData}
                        error={!isLoadingData && !orderData.id}
                        ariaLabel={i18n.t("Totals")}
                        list={totalsList}
                    />
                </Section>

                {completePayment()}
            </>
        )
    }

    function renderActivity() {
        return (
            <Content>
                <PropTable
                    loading={isLoadingData}
                    error={!isLoadingData && !orderData.id}
                    ariaLabel={i18n.t("Activity")}
                    list={orderData?.activity?.map?.((activity, index) => ({
                        key: DateTime.fromSeconds(activity.date, { zone: "utc", locale: i18n.locale }).toLocaleString(DateTime.DATETIME_FULL),
                        value: readFriendlyOrderActivity[activity.state]
                    })) || []}
                />
            </Content>
        )
    }

    function renderReview() {
        return (
            <Content className="bg margin-top-sm padding-md">
                {orderData.status == "delivered" && !orderData.clientReview ? (
                    <Link href={`${basePath.href}?tab=review&review_form`} as={`${basePath.as}?tab=review&review_form`}>
                        <button className="btn btn--primary">{i18n.t("RateOrder")}</button>
                    </Link>
                ) : !!orderData.clientReview ? (
                    <dl>
                        <Details label={i18n.t("FeedbackAddedOn")}>
                            {DateTime.fromSeconds(orderData.clientReview.createdAt, { zone: "utc", locale: i18n.locale }).toLocaleString(DateTime.DATETIME_FULL)}
                        </Details>

                        <Details label={i18n.t("FoodWasGood")}>
                            <RatingIcon value={orderData.clientReview.foodWasGood} className="width-xxl" />
                        </Details>

                        <Details label={i18n.t("DeliveryWasOnTime")}>
                            <RatingIcon value={orderData.clientReview.deliveryOnTime} className="width-xxl" />
                        </Details>

                        <Details label={i18n.t("OrderWasCorrect")}>
                            <RatingIcon value={orderData.clientReview.orderWasCorrect} className="width-xxl" />
                        </Details>

                        <Details label={i18n.t("Comment")}>
                            {orderData.clientReview.comment}
                        </Details>
                    </dl>
                ) : (
                    <MessageAlert
                        icon={<StarIcon className="icon icon--lg" />}
                        title={i18n.t("ReviewAfterDelivery")}
                    />
                )}
            </Content>
        )
    }

    function renderHelp() {
        return (
            <>
            </>
        )
    }

    function renderContent() {
        if (!isLoadingData && !orderData.id) {
            return (
                <MessageAlert
                    icon={<ErrorIcon className="icon icon--lg" />}
                    title={i18n.t("CouldNotLoadThisOrder")}
                />
            )
        }

        switch (activeTab) {
            case "activity":
                return renderActivity()
                break;
            case "review":
                return renderReview()
                break;
            case "help":
                return renderHelp()
                break;
            default:
                return renderSummary()
                break;
        }
    }

    return (
        <>
            <Page
                title={i18n.t("ViewOrder")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <Link href="/user/orders">
                    <a className="flex items-center margin-bottom-sm link">
                        <LeftIcon />
                        <span className="margin-left-sm text-sm">{i18n.t("BackToOrders")}</span>
                    </a>
                </Link>

                <PageTitle
                    title={`${i18n.t("Order")} #${splitOrderID[0]}`}
                />

                <Tabs
                    label={i18n.t("OrderTabs")}
                    activeTab={`${basePath.as}?tab=${activeTab}`}
                    links={[
                        {
                            label: i18n.t("Summary"),
                            href: `${basePath.href}?tab=summary`,
                            as: `${basePath.as}?tab=summary`,
                        },
                        {
                            label: i18n.t("Activity"),
                            href: `${basePath.href}?tab=activity`,
                            as: `${basePath.as}?tab=activity`,
                        },
                        {
                            label: i18n.t("Review"),
                            href: `${basePath.href}?tab=review`,
                            as: `${basePath.as}?tab=review`,
                        }
                    ]}
                />

                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : renderContent()}

            </Page>

            {"review_form" in router.query &&
                <RateOrderForm
                    open={true}
                    close={closeDialogs}
                    order={orderData}
                />
            }
        </>
    )
}