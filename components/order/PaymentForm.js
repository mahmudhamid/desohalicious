import CPBancontact from '../forms/payments/Bancontact';
import CardPaymentForm from '../forms/payments/Card';
import PaypalPaymentForm from '../forms/payments/Paypal';
import CPDigitalWallets from '../forms/payments/DigitalWallets';
import CPEPS from '../forms/payments/EPS';
import CPFPX from '../forms/payments/FPX';
import CPGiropay from '../forms/payments/Giropay';
import CPIdeal from '../forms/payments/Ideal';
import CPPrzelewy24 from '../forms/payments/Przelewy24';
import CashOnDeliveryForm from '../forms/payments/CashOnDelivery';
import CashOnPickupForm from '../forms/payments/CashOnPickup';

export default function CompletePaymentForm(props) {
    const {
        paymentMethod,
        basePath,
        orderData,
        closeDialogs,
        paymentReceived
    } = props;

    switch (paymentMethod.method) {
        case "stripeBancontact":
            return <CPBancontact />
        case "stripeCard":
            return (
                <CardPaymentForm
                    type="complete"
                    basePath={basePath}
                    orderData={orderData}
                    closeDialogs={closeDialogs}
                    paymentReceived={paymentReceived}
                />
            )
        case "stripeDigitalWallets":
            return <CPDigitalWallets />
        case "stripeEps":
            return <CPEPS />
        case "stripeFpx":
            return <CPFPX />
        case "stripeGiropay":
            return <CPGiropay />
        case "stripeIdeal":
            return <CPIdeal />
        case "stripePrzelewy24":
            return <CPPrzelewy24 />
        case "paypal":
            return (
                <PaypalPaymentForm
                    type="complete"
                    basePath={basePath}
                    orderData={orderData}
                    paymentReceived={paymentReceived}
                />
            )
        case "cashOnDelivery":
            return (
                <CashOnDeliveryForm
                    type="complete"
                    closeDialogs={closeDialogs}
                    basePath={basePath}
                    paymentReceived={paymentReceived}
                />
            )
        case "cashOnPickup":
            return (
                <CashOnPickupForm
                    type="complete"
                    closeDialogs={closeDialogs}
                    basePath={basePath}
                    paymentReceived={paymentReceived}
                />
            )
        default:
            return null;
    }
}