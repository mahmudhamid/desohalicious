import React, { useState, useEffect } from 'react';
import i18n from '../../i18n/config';
import { useRouter } from 'next/router'
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import AddToCart, { addToCartMutation } from '../../components/AddToCart';
import SelectedPayment from '../../components/payments/SelectedPayment';
import PaymentForm from '../../components/payments/PaymentForm';
import ActivePaymentDialog from '../../components/payments/ActivePaymentsDialog';
import Page from '../../components/Page';
import Content from '../../components/Content';
import BillingForm from '../../components/forms/Billing';
import MessageAlert from '../../components/MessageAlert';
import ShoppingBagIcon from '../../src/icons/ShoppingBag';
import { getCurrencySymbol } from '../../src/appConfig';
import Alert from '../../components/Alert';
import AcceptToS from '../../components/form-elements/AcceptToS';
import { DateTime } from 'luxon';
import PropTable from '../../components/PropTable';
import List from '../../components/List';
import { idbSet } from '../../src/storage';
import { cacheReducer } from '../../src/cacheReducer';
import useQueryCart from '../../hooks/useQueryCart';
import useCache from "../../hooks/useCache";
import Modal from "../../components/Modal";

const getUserDataQuery = gql`
    query GetUserData {
        getUserData {
            id
            vouchers {
                id
                ttl
                createdAt
                source
                sourceID
                amount
                reason
                redeemed {
                    amount
                    orderID
                    timestamp
                    completedAt
                    cancelledAt
                }
            }
            __typename
        }
        getUserPaymentMethod {
            id
            method
            __typename
        }
    }
`;

export default function Checkout(props) {
    const router = useRouter();
    const [getUserData, getUserDataStatus] = useLazyQuery(getUserDataQuery, { onError: loadError });
    const [addToCart, addToCartStatus] = useMutation(addToCartMutation);
    const [paymentMethod, setPaymentMethod] = useState({});
    const [itemIndex, setItemIndex] = useState(null);
    const [showVouchersList, setShowVouchersList] = useState(false);
    const [checkDiscounts, setCheckDiscounts] = useState(true);
    const queryCart = useQueryCart();
    const cart = useCache("cart");
    const userData = useCache("userData");
    const viewOptions = useCache("viewOptions");
    const shopBasicData = useCache("shopBasicData");
    const currencySymbol = useCache("currencySymbol");
    const userPaymentMethod = getUserDataStatus?.data?.getUserPaymentMethod || {};
    const userVouchersData = getUserDataStatus?.data?.getUserData?.vouchers || [];
    const minOrderNotMet = viewOptions.orderType?.id == "delivery" && cart?.totals?.subTotal < shopBasicData.minimumDeliveryOrder || viewOptions.orderType.id == "pickup" && cart?.totals?.subTotal < shopBasicData.minimumPickupOrder;
    const isLoading = addToCartStatus.loading || getUserDataStatus.loading;
    const basePath = {
        href: `/checkout`,
        as: `/checkout`,
    }

    useEffect(() => {
        if (userData.username) {
            getUserData();
        }
    }, [userData.username]);

    useEffect(() => {
        if (getUserDataStatus.called && "id" in userPaymentMethod) {
            setPaymentMethod(userPaymentMethod)
        }
    }, [getUserDataStatus.loading, getUserDataStatus.called])

    function loadError(err) {
        console.log(err);
    }

    function closeDialogs() {
        router.push(basePath.href, basePath.as, { shallow: true });
    }

    async function handleAddVoucher(voucher) {
        try {
            const newCartData = {
                ...queryCart,
                discount: {
                    id: voucher.id,
                    type: "voucher"
                }
            };
            const addResult = await addToCart({ variables: { input: {...newCartData, checkDiscounts: true} } });
            const cartData = addResult.data.addToCart;
            await idbSet("cd", cartData);
            cacheReducer('SAVECARTDATA', {cart: cartData});
        } catch (err) {
            console.log(err);
        }
    }
    
    async function handleRemoveDiscount(elem) {
        const {discount, ...newCartData} = queryCart;
        if (elem.source == "voucher") {
            setCheckDiscounts(true);
        } else {
            setCheckDiscounts(false);
        }
        try {
            const addResult = await addToCart({ variables: { input: {...newCartData, checkDiscounts: false} } });
            const cartData = addResult.data.addToCart;
            await idbSet("cd", cartData);
            cacheReducer('SAVECARTDATA', {cart: cartData});
        } catch (err) {
            console.log(err);
        }
    }

    function outputTotals() {
        const totals = cart.totals;
        let propList = [{
            key: i18n.t('SubTotal'),
            value: `${currencySymbol}${i18n.toNumber(totals.subTotal, { precision: 3, strip_insignificant_zeros: true })}`
        }];

        if (totals?.delivery?.fee > 0) {
            propList.push({
                key: i18n.t('DeliveryFee'),
                value: `${currencySymbol}${i18n.toNumber(totals.delivery.fee, { precision: 3, strip_insignificant_zeros: true })}`
            })
        }
        
        if (totals?.fees?.data?.length > 0) {
            propList = [...propList, ...totals.fees.data.map((elem, index) => ({
                key: elem.name,
                value: `${currencySymbol}${i18n.toNumber(elem.amount, { precision: 3, strip_insignificant_zeros: true })}`
            }))]
        }

        if (totals?.discounts?.data?.length > 0) {
            propList = [...propList, ...totals.discounts.data.map((elem, index) => ({
                key: elem.source == "voucher" ? i18n.t("Voucher") : elem.label,
                value: <>
                    {`- ${currencySymbol}${i18n.toNumber(elem.amount, { precision: 3, strip_insignificant_zeros: true })}`}
                    <button className="reset link cursor-pointer block text-right width-100%" type="button" onClick={() => handleRemoveDiscount(elem)}>{i18n.t("Remove")}</button>
                </>
            }))]
        }

        propList.push({
            key: i18n.t('Total'),
            value: `${currencySymbol}${i18n.toNumber(totals.total, { precision: 3, strip_insignificant_zeros: true })}`
        })

        return (
            <PropTable
                loading={!!addToCartStatus.loading || getUserDataStatus.loading}
                ariaLabel={i18n.t("Totals")}
                list={propList}
            />
        )
    }

    function cartItems() {
        return (
            <aside className="bg padding-x-sm padding-y-md">
                <header>
                    <h2 className="text-md margin-bottom-sm">{i18n.t('CartItems')} ({cart.items.length})</h2>
                </header>
                <ul className="flex flex-column">
                    {cart.items.map((item, index) => (

                        <li key={`item-${index}`} className="margin-bottom-sm">
                            <button className="reset cart-item width-100%" onClick={() => { router.push(`/checkout?add_to_cart=${item.id}`); setItemIndex(index) }}>

                                <div className="flex flex-wrap justify-between">
                                    <div className="text-left">
                                        <p className="color-contrast-higher">{item.name}</p>
                                        <p className="color-contrast-medium text-sm margin-top-xs">{item.qty} X {currencySymbol}{item.price}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="color-contrast-higher">{currencySymbol}{item.total}</p>
                                    </div>
                                </div>
                            </button>

                        </li>
                    ))}
                </ul>

                <footer className="bg-contrast-lower padding-sm">
                    {outputTotals()}
                    {!cart?.totals?.discounts?.total && userVouchersData.length > 0 ? (
                        <button disabled={isLoading} className="btn btn--primary margin-top-sm" onClick={() => {setShowVouchersList(true)}}>{i18n.t("UseVoucher")}</button>
                    ) : null}
                </footer>
            </aside>
        )
    }

    function billingForm() {
        return (
            <Content className="margin-y-sm bg">
                {!Object.keys(userData).length ? (
                    <button className="btn btn--md width-100% btn--primary" onClick={() => { router.push(`${basePath.href}?login_form`, `${basePath.as}?login_form`, { shallow: true }) }}>
                        {i18n.t('LoginToContinue')}
                    </button>
                ) : (
                    <BillingForm fullWidth closeDialogs={closeDialogs} basePath={basePath} />
                )}
            </Content>
        )
    }

    function deliveryInfo() {
        return (
            <Content className="padding-x-sm padding-y-md bg">
                <h2 className="text-md margin-bottom-sm">{i18n.t("DeliveryInfo")}</h2>

                <div>
                    <p className="font-bold text-sm text-uppercase">{i18n.t("ThisOrderWillBeDeliveredTo")}</p>
                    <p className="margin-y-xs">{viewOptions.address.address}</p>
                    {!!cart.totals.delivery.time ? (
                        <>
                            <p className="font-bold text-sm text-uppercase">{i18n.t("EstimateDeliveryTime")}</p>
                            <p className="margin-y-xs">{DateTime.fromObject({ locale: i18n.locale, zone: shopBasicData.timezone }).plus({ minutes: cart.totals.delivery.time }).toLocaleString(DateTime.DATETIME_MED)}</p>
                        </>
                    ) : null}
                </div>
            </Content>
        )
    }

    function pickupInfo() {
        return (
            <Content className="padding-x-sm padding-y-md bg">
                <h2 className="text-md margin-bottom-sm">{i18n.t("PickupInfo")}</h2>

                <div>
                    <p className="font-bold text-sm text-uppercase">{i18n.t("ThisOrderShouldBePickedUpFrom")}</p>
                    <p className="margin-y-xs">{shopBasicData.address.address}</p>
                    {!!shopBasicData.defaultPreparationEstimate ? (
                        <>
                            <p className="font-bold text-sm text-uppercase">{i18n.t("EstimatePickupTime")}</p>
                            <p className="margin-y-xs">{DateTime.fromObject({ locale: i18n.locale, zone: shopBasicData.timezone }).plus({ minutes: shopBasicData.defaultPreparationEstimate }).toLocaleString(DateTime.DATETIME_MED)}</p>
                        </>
                    ) : null}
                </div>
            </Content>
        )
    }

    function paymentSection() {
        if (Object.keys(userData).length == 0) {
            return
        }

        return (
            <Content className="padding-x-sm padding-y-md bg">
                <h2 className="text-md margin-bottom-sm">{i18n.t("Payment")}</h2>
                <AcceptToS />
                <SelectedPayment
                    basePath={basePath}
                    paymentMethod={paymentMethod}
                />
                <PaymentForm
                    basePath={basePath}
                    closeDialogs={closeDialogs}
                    paymentMethod={paymentMethod}
                />
            </Content>
        )
    }

    return (
        <>
            <Page
                title={i18n.t("Checkout")}
                widthClass="width-100%"
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                {Object.keys(cart).length == 0 ? (
                    <MessageAlert
                        icon={<ShoppingBagIcon className="icon icon--lg" />}
                        title={i18n.t("YourCartIsEmpy")}
                    />
                ) : (
                    <div className="grid">
                        <div className="col-4@md order-2@md padding-sm@md margin-bottom-sm">
                            {cartItems()}
                        </div>

                        <div className="col-8@md order-1@sm padding-y-sm@md">
                            {viewOptions.orderType.id == "delivery" ? deliveryInfo() : pickupInfo()}
                            {billingForm()}
                            {!!minOrderNotMet ? (
                                <Alert
                                    severity="warning"
                                    message={i18n.t("MinimumOrderNotMet", {
                                        min: `${getCurrencySymbol(shopBasicData.currency)}${shopBasicData[`minimum${viewOptions.orderType.label}Order`]}`,
                                        type: viewOptions.orderType.label
                                    })}
                                    open={true}
                                    btn={
                                        <button className="btn btn--subtle" onClick={() => { router.push("/") }}>
                                            {i18n.t("BackToMenu")}
                                        </button>
                                    }
                                />
                            ) : paymentSection()}
                        </div>
                    </div>
                )}
            </Page>

            {"add_to_cart" in router.query ? (
                <AddToCart
                    close={closeDialogs}
                    itemIndex={itemIndex}
                    checkDiscounts={checkDiscounts}
                />
            ) : null}
            
            {!!showVouchersList ? (
                <Modal
                    id="vouchers-list-form"
                    open={true}
                    onClose={() => {setShowVouchersList(false)}}
                    title={i18n.t("AvailableVouchers")}
                >
                    <div className="padding-md">
                        <List
                            list={userVouchersData.map(voucher => ({
                                id: voucher.id,
                                primary: `${currencySymbol}${voucher.redeemed?.reduce?.((tot,elem) => {if(!elem.cancelledAt) {tot = tot+elem.amount}return tot},0) || 0.0} / ${currencySymbol}${voucher.amount}`,
                                secondary: `${DateTime.fromSeconds(voucher.createdAt, { zone: shopBasicData.timezone }).toLocaleString(DateTime.DATETIME_MED_WITH_WEEKDAY)}`,
                                button: true,
                                onClick: () => {
                                    handleAddVoucher(voucher);
                                    setShowVouchersList(false);
                                },
                            }))}
                        />
                    </div>
                </Modal>
            ) : null}

            <ActivePaymentDialog
                closeDialogs={closeDialogs}
                selectedMethod={setPaymentMethod}
            />
        </>
    )
}