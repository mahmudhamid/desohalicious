import { makeVar } from "@apollo/client";

export let showCookiesSettings = makeVar(false);
export let viewOptions = makeVar({
    orderType: {},
    address: null
});
export let siteWideError = makeVar({});
export let shopBasicData = makeVar({});
export let shopData = makeVar({});
export let filters = makeVar({ labels: [] });
export let availableFilters = makeVar({ labels: [] });
export let keyword = makeVar(null);
export let currencySymbol = makeVar(null);
export let userData = makeVar({});
export let userDataLoaded = makeVar(false);
export let cart = makeVar({});
export let innerCart = makeVar([]);
export let checkoutClientData = makeVar({});
export let processingCheckout = makeVar(false);