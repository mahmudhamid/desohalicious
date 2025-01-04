import { useMutation, gql } from "@apollo/client";
import { useRouter } from "next/router";
import i18n from "../i18n/config";
import { getCurrencySymbol } from "../src/appConfig";
import { del } from 'idb-keyval';
import { cacheReducer } from "../src/cacheReducer";
import useCache from "./useCache";
import useQueryCart from "./useQueryCart";

const createOrderMutation = gql`
    mutation CreateOrder($input: CreateOrderInput!) {
        createOrder(input: $input)
    }
`;

export default function useCheckout() {
    const router = useRouter();
    const userData = useCache("userData");
    const clientName = userData && userData.name || null;
    const [createOrder, createOrderStatus] = useMutation(createOrderMutation);
    const queryCart = useQueryCart();
    const viewOptions = useCache("viewOptions");
    const checkoutClientData = useCache("checkoutClientData");
    const shopBasicData = useCache("shopBasicData");

    async function processCheckout(paymentData) {
        try {
            if (!clientName) {
                throw { message: i18n.t("PleaseLoginFirst") }
            }

            cacheReducer("PROCESSINGCHECKPUT", true);

            let checkoutData = {
                cart: queryCart,
                client: {
                    name: checkoutClientData.name
                },
                transaction: paymentData
            }

            if (viewOptions.orderType.id == "delivery") {
                if (checkoutClientData?.deliveryNote?.length > 0) {
                    checkoutData.cart.address.deliveryNote = checkoutClientData.deliveryNote;
                }
                if (checkoutClientData.address) {
                    checkoutData.cart.address.address_2 = checkoutClientData.address;
                }
            }

            await createNewOrder(checkoutData);
        } catch (error) {
            throw error
        }
    }

    async function createNewOrder(data) {
        let args = { variables: { input: data } };
        try {
            const result = await createOrder(args);
            await del('cid');
            await del('cd');
            cacheReducer('SAVECARTDATA', {cart: {}, innerCart: [] });
            cacheReducer("PROCESSINGCHECKPUT", false);

            router.replace(`/order-received?id=${result.data.createOrder}`);
        } catch (error) {
            console.log(error);
            cacheReducer("PROCESSINGCHECKPUT", false);
            if (error.message == "min_order_not_met") {
                throw {
                    message: i18n.t("MinimumOrderNotMet", {
                        min: `${getCurrencySymbol(shopBasicData.currency)}${shopBasicData[`minimum${viewOptions.orderType.label}Order`]}`,
                        type: viewOptions.orderType.label
                    })
                }
            }
            throw error;
        }
    }
    async function valicateCheckoutForm(data) {
        const clientData = data || checkoutClientData;

        try {
            if (!clientName) {
                throw { message: i18n.t("PleaseLoginFirst") }
            }

            if (!clientData.acceptToS) {
                throw { message: i18n.t("MustAcceptOurToS") }
            }
        } catch (error) {
            throw error;
        }
    }

    return [valicateCheckoutForm, processCheckout];
}