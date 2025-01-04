import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import ActivePaymentDialog from "../payments/ActivePaymentsDialog";
import SelectedPayment from "../payments/SelectedPayment";
import i18n from "../../i18n/config";
import CompletePaymentForm from "./PaymentForm";

const getUserDataQuery = gql`
    query GetUserData {
        getUserPaymentMethod {
            id
            method
        }
    }
`;

export default function CompletePayment(props) {
    const {
        basePath,
        orderData,
        closeDialogs,
        paymentReceived
    } = props;
    const getUserData = useQuery(getUserDataQuery, { onCompleted: checkUserData, onError: loadError });
    const [paymentMethod, setPaymentMethod] = useState({});

    function loadError(error) {
        console.log(error);
    }

    function checkUserData(data) {
        const userPaymentMethod = data.getUserPaymentMethod || {};

        if ("id" in userPaymentMethod) {
            setPaymentMethod(userPaymentMethod);
        }
    }

    return (
        <>
            <h2 className="text-md margin-bottom-sm">{i18n.t("CompletePayment")}</h2>

            <div>
                <SelectedPayment
                    basePath={basePath}
                    paymentMethod={paymentMethod}
                />

                <CompletePaymentForm
                    paymentMethod={paymentMethod}
                    basePath={basePath}
                    orderData={orderData}
                    closeDialogs={closeDialogs}
                    paymentReceived={paymentReceived}
                />
            </div>

            <ActivePaymentDialog
                closeDialogs={closeDialogs}
                selectedMethod={setPaymentMethod}
            />
        </>
    )
}