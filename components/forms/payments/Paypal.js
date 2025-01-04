import React, { useState } from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom'
import i18n from "../../../i18n/config";
import { useMutation, gql } from '@apollo/client';
import useCheckout from '../../../hooks/useCheckout';
import Loader from '../../Loader';
import Alert from '../../Alert';
import { isDemoShop } from '../../../src/appConfig';
import { idbSet } from '../../../src/storage';
import { cacheReducer } from '../../../src/cacheReducer';
import useCache from '../../../hooks/useCache';
import useQueryCart from '../../../hooks/useQueryCart';

const createOrderRequestMutation = gql`
    mutation CreateOrderRequest($input: PaypalCreateOrderRequestInput!) {
        paypalCreateOrderRequest(input: $input) {
            orderID
            status
        }
    }
`;

const completeOrderRequestMutation = gql`
    mutation CompleteOrderRequest($orderID: ID!) {
        paypalCompleteOrderRequest(orderID: $orderID) {
            orderID
            status
        }
    }
`;

const captureOrderRequestMutation = gql`
    mutation CaptureOrderRequest($requestID: ID!) {
        paypalCaptureOrderRequest(requestID: $requestID) {
            orderID
            status
        }
    }
`;


function getScript(source, callback) {
    var script = document.createElement('script');
    var prior = document.getElementsByTagName('script')[0];
    script.async = 1;

    script.onload = script.onreadystatechange = function (_, isAbort) {
        if (isAbort || !script.readyState || /loaded|complete/.test(script.readyState)) {
            script.onload = script.onreadystatechange = null;
            script = undefined;

            if (!isAbort) { if (callback) callback(); }
        }
    };

    script.src = source;
    prior.parentNode.insertBefore(script, prior);
}

let PayPalButton;

function PaypalPaymentForm(props) {
    const {
        type,
        basePath,
        orderData,
        paymentReceived
    } = props;
    const [createOrderRequest, createOrderRequestStatus] = useMutation(createOrderRequestMutation);
    const [captureOrderRequest, captureOrderRequestStatus] = useMutation(captureOrderRequestMutation);
    const [completeOrderRequest, completeOrderRequestStatus] = useMutation(completeOrderRequestMutation);
    const [buttonLoaded, setButtonLoaded] = useState(false); //Just to relaod the component when PayPal is ready.
    const [error, setError] = useState("");
    const [valicateCheckoutForm] = useCheckout();
    const queryCart = useQueryCart();
    const processingCheckout = useCache("processingCheckout");
    const checkoutClientData = useCache("checkoutClientData");
    const viewOptions = useCache("viewOptions");
    const cart = useCache("cart");
    const shopBasicData = useCache("shopBasicData");
    const paypalClientID = shopBasicData.payments?.paypal?.clientID;

    useEffect(() => {
        if (paypalClientID) {
            getScript(`https://www.paypal.com/sdk/js?client-id=${paypalClientID}&disable-funding=card&currency=${shopBasicData.currency}`, () => {
                PayPalButton = paypal.Buttons.driver('react', { React, ReactDOM });
                setButtonLoaded(true);
            });
        }
    }, [paypalClientID]);

    async function createOrder() {
        let requestArgs = {
            cart: queryCart,
            client: {
                name: checkoutClientData.name
            }
        }

        if (cart.paypalRequestID) {
            requestArgs.requestID = cart.paypalRequestID;
        }

        try {
            const createResult = await createOrderRequest({ variables: { input: requestArgs } });
            const requestData = createResult?.data?.paypalCreateOrderRequest || {};

            if (createResult.errors) {
                throw createResult.errors[0]
            }
            if (requestData.status == "COMPLETED") {
                await paymentReceived({
                    id: requestData.orderID,
                    code: "paypal"
                });
            } else {
                //Save order id with cart
                const cartData = {
                    ...cart,
                    paypalRequestID: requestData.orderID
                };
                await idbSet('cd', cartData);
                cacheReducer('SAVECARTDATA', {cart: cartData });

                return requestData.orderID;
            }
        } catch (err) {
            console.log(err);
            if (err.message) {
                if (err.message == "shop_is_closed") {
                    setError(i18n.t("ShopIsClosedFor", { type: i18n.t(viewOptions.orderType.id) }))
                } else {
                    setError(err.message)
                }
            } else {
                setError(i18n.t("SomethingWentWrong"))
            }
        }
    }

    async function completeOrder() {
        try {
            const completeResult = await completeOrderRequest({ variables: { orderID: orderData.id } });
            const requestData = completeResult?.data?.paypalCompleteOrderRequest || {};

            if (completeResult.errors) {
                throw completeResult.errors[0]
            }
            if (requestData.status == "COMPLETED") {
                await paymentReceived({
                    id: requestData.orderID,
                    code: "paypal"
                });
            } else {
                return requestData.orderID;
            }
        } catch (err) {
            console.log(err);
            if (err.message) {
                setError(err.message);
            } else {
                setError(i18n.t("SomethingWentWrong"))
            }
        }
    }

    async function onApprove(dat) {
        try {
            const captureResult = await captureOrderRequest({ variables: { requestID: dat.orderID } });
            const requestData = captureResult.data?.paypalCaptureOrderRequest || {};

            if (captureResult.errors) {
                throw captureResult.errors[0]
            }
            if (requestData.status == "COMPLETED") {
                await paymentReceived({
                    id: requestData.orderID,
                    code: "paypal"
                });
            }
        } catch (err) {
            console.log(err);
            if (err.message) {
                setError(err.message)
            } else {
                setError(i18n.t("SomethingWentWrong"))
            }
        }
    }

    async function onClick() {
        try {
            await valicateCheckoutForm();
        } catch (err) {
            console.log(err);
            if (err.message) {
                setError(err.message)
            } else {
                setError(i18n.t("SomethingWentWrong"))
            }
        }
    }

    async function onError(err) {
        if (err.message == "PAYMENT_ALREADY_DONE") {
            if (cart.paypalRequestID) {
                await onApprove({ orderID: cart.paypalRequestID });
            }
        }
    }

    async function onCompleteError(err) {
        if (err.message == "PAYMENT_ALREADY_DONE") {
            await completeOrder();
        }
    }

    if (!PayPalButton) {
        return <Loader center={true} />
    }

    return (
        <>
            <Alert
                severity="error"
                message={error}
                open={!!error && error.length > 0}
                onClose={() => { setError("") }}
            />

            <Alert
                severity="warning"
                message={
                    <>
                        <span>{i18n.t("DemoStorePayPalDesc")}</span>
                        <a className="margin-x-xxxs" href="https://developer.paypal.com/developer/accounts/" title="PayPal">{i18n.t("PayPalDocs")}</a>
                        <span>{i18n.t("ForMoreInfo")}</span>
                    </>
                }
                open={isDemoShop}
            />

            {!!processingCheckout ? <Loader /> : null}

            {type == "complete" ? (
                <PayPalButton
                    style={{
                        shape: 'rect',
                        color: 'blue',
                        layout: 'vertical',
                        label: 'checkout',
                        size: 'responsive',
                        tagline: false
                    }}
                    createOrder={completeOrder}
                    onApprove={onApprove}
                    onError={onCompleteError}
                />
            ) : (
                <PayPalButton
                    style={{
                        shape: 'rect',
                        color: 'blue',
                        layout: 'vertical',
                        label: 'checkout',
                        size: 'responsive',
                        tagline: false
                    }}
                    onClick={onClick}
                    createOrder={createOrder}
                    onApprove={onApprove}
                    onError={onError}
                />
            )}
        </>
    )
}
export default PaypalPaymentForm;