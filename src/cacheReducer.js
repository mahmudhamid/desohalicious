import { getCurrencySymbol } from "./appConfig"
import { availableFilters, cart, checkoutClientData, currencySymbol, filters, innerCart, keyword, processingCheckout, shopBasicData, shopData, siteWideError, userData, userDataLoaded, viewOptions } from "./cache";

export const cacheReducer = (action, value) => {
    switch (action) {
        case 'SETVIEWOPTIONS':
            viewOptions(value);
            cart({});
            shopData({});
            break;
        case 'SETERROR':
            siteWideError(value);
            break;
        case 'SETCHECKOUTCLIENTDATA':
            checkoutClientData(value);
            break;
        case 'LOADINITIALSTATE':
            if (value.viewOptions) {
                viewOptions(value.viewOptions)
            }
            if (value.cart) {
                cart(value.cart)
            }
            if (value.innerCart) {
                innerCart(value.innerCart)
            }
            if (value.shopData) {
                shopBasicData(value.shopData)
            }
            currencySymbol(getCurrencySymbol(value.currency));
            break;
        case 'SAVECARTDATA':
            if (value.cart) {
                cart(value.cart)
            }
            if (value.innerCart) {
                innerCart(value.innerCart)
            }
            break;
        case 'SAVELOGEDINUSER':
            userData(value);
            userDataLoaded(true);
            break;
        case 'SAVESHOPDATA':
            shopData(value);
            break;
        case 'SAVEACTIVEFILTERS':
            filters(value);
            break;
        case 'AVAILABLEFILTERS':
            availableFilters(value);
            break;
        case 'SAVEITEMSSEARCHKEYWORD':
            keyword(value);
            break;
        case 'LOGOUT':
            userData({});
            cart({});
            innerCart([]);
            checkoutClientData({});
            break;
        case 'PROCESSINGCHECKPUT':
            processingCheckout(value);
            break;
        default:
            return false
    }
}