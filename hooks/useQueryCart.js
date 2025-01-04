import { v4 as uuid } from "uuid";
import useCache from './useCache';

export default function useQueryCart() {
    const cart = useCache("cart");
    const innerCart = useCache("innerCart");
    const viewOptions = useCache("viewOptions");
    const checkoutClientData = useCache("checkoutClientData");

    let newCartData = {
        id: cart.id || uuid(),
        orderTypeID: viewOptions.orderType.id,
        items: innerCart || [],
    };

    if (viewOptions.orderType.id == "delivery") {
        newCartData.address = viewOptions.address;

        if (checkoutClientData.address) {
            newCartData.address.address_2 = checkoutClientData.address
        }
    }

    if (cart.totals?.discounts?.data?.length > 0) {
        newCartData.discount = {
            id: cart.totals.discounts.data[0].sourceID,
            type: cart.totals.discounts.data[0].source
        }
    }

    return newCartData;
};