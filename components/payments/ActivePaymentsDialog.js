import { useRouter } from 'next/router';
import i18n from '../../i18n/config';
import { paymentMethodIcon, paymentMethodLabel, PAYMENTMETHODSSVG } from '../../src/appConfig';
import { useEffect, useState } from 'react';
import Img from '../Img';
import Modal from '../Modal';
import List from '../List';
import WarningIcon from '../../src/icons/Warning';
import CashIcon from '../../src/icons/Cash';
import useCache from '../../hooks/useCache';

const activeStripeMethods = [
    {
        id: "stripeCard",
        active: true
    }
]; //this should be pulled from the shop's settings.

const paymentMethodName = {
    ...paymentMethodLabel,
    stripeCard: <div className="flex items-center justify-between">
        <span>{i18n.t("CardPayment")}</span>
        <div className="flex items-center gap-xxs">
            <Img src={PAYMENTMETHODSSVG.visa} alt="visa" />
            <Img src={PAYMENTMETHODSSVG.mastercard} alt="mastercard" />
            <Img src={PAYMENTMETHODSSVG.amex} alt="amex" />
        </div>
    </div>,
    stripeDigitalWallets: <div className="flex items-center justify-between">
        <span>{i18n.t("DigitalWallets")}</span>
        <div className="flex items-center gap-xxs">
            <Img src={PAYMENTMETHODSSVG.applePay} alt="apple pay" />
            <Img src={PAYMENTMETHODSSVG.googleWallet} alt="google wallet" />
        </div>
    </div>
};

export default function ActivePaymentDialog(props) {
    const {
        selectedMethod,
        closeDialogs
    } = props;
    const router = useRouter();
    const [paymentMethods, setPaymentMethods] = useState([]);
    const shopBasicData = useCache("shopBasicData");
    const viewOptions = useCache("viewOptions");
    const openPaymentsDialog = router.query.dialog == "payments";
    const stripeKey = shopBasicData.payments?.stripe?.publishableKey;
    const paypalClientID = shopBasicData.payments?.paypal?.clientID;
    const codActive = shopBasicData.payments?.cashOnDelivery?.active || false;
    const copActive = shopBasicData.payments?.cashOnPickup?.active || false;

    useEffect(() => {
        let methods = [];
        if (!!paypalClientID) {
            methods.push({
                id: "paypal",
                icon: <img width="24" src={PAYMENTMETHODSSVG.paypal} alt="paypal" />,
                primary: "PayPal",
                button: true,
                onClick: () => {
                    handlePaymentClick("paypal");
                }
            })
        }

        if (!!stripeKey) {
            const pMethods = activeStripeMethods.map(subMethod => ({
                id: subMethod.id,
                icon: paymentMethodIcon[subMethod.id],
                primary: paymentMethodName[subMethod.id],
                button: true,
                onClick: () => {
                    handlePaymentClick("stripe", subMethod.id);
                }
            }));

            methods.push(...pMethods);
        }

        if (!!codActive && viewOptions.orderType.id == "delivery") {
            methods.push({
                id: "cashOnDelivery",
                icon: <CashIcon />,
                primary: i18n.t("CashOnDelivery"),
                button: true,
                onClick: () => {
                    handlePaymentClick("cashOnDelivery");
                }
            })
        }
        if (!!copActive && viewOptions.orderType.id == "pickup") {
            methods.push({
                id: "cashOnPickup",
                icon: <CashIcon />,
                primary: i18n.t("CashOnPickup"),
                button: true,
                onClick: () => {
                    handlePaymentClick("cashOnPickup");
                }
            })
        }

        setPaymentMethods(methods);
    }, []);

    function handlePaymentClick(method, subMethod) {
        const returnData = {
            id: method,
            method: subMethod || method
        }

        selectedMethod(returnData);
        closeDialogs();
    }

    return (
        <Modal
            id="active-payments-dialog"
            title={i18n.t("SelectPayment")}
            open={openPaymentsDialog}
            onClose={closeDialogs}
        >
            <List
                noDataMsg={{
                    icon: <WarningIcon className="icon icon--lg" />,
                    title: i18n.t("SorryNoPaymentMethodsAvailableAtTheMoment")
                }}
                className="padding-sm bg-contrast-low"
                list={paymentMethods}
            />
        </Modal >
    )
}