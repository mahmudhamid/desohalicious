import { useRouter } from "next/router";
import AddToCart from "../components/AddToCart";
import Filters from "../components/Filters";
import Overlay from "../components/Overlay";
import Page from "../components/Page";
import ProductsList from "../components/ProductsList";
import LocationOption from "../components/view-options/LocationOption";
import i18n from "../i18n/config";

export default function Search(props) {
    const router = useRouter();
    const basePath = {
        href: "/search",
        as: "/search"
    }

    function closeDialogs() {
        router.replace(basePath.as);
    }

    return (
        <>
            <Page
                title={i18n.t("SearchItems")}
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <ProductsList basePath={basePath} />
            </Page>

            {"add_to_cart" in router.query ? (
                <AddToCart
                    close={closeDialogs}
                    checkDiscounts={true}
                />
            ) : null}

            <Overlay
                open={"filter_drawer" in router.query}
                close={closeDialogs}
                title={i18n.t("Filters")}
            >
                <Filters />
            </Overlay>

            {"location_form" in router.query ? (
                <LocationOption
                    onClose={closeDialogs}
                />
            ) : null}
        </>
    )
}