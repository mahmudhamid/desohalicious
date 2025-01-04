import { useRouter } from 'next/router';
import Page from '../components/Page';
import SearchField from '../components/SearchField';
//import RatingInfo from '../components/RatingInfo';
import ViewOptionsInput from '../components/view-options/ViewOptionsInput';
import useScreenSize from '../hooks/useScreenSize';
import HourInfo from '../components/HourInfo';
import Filters from '../components/Filters';
import ProductsList from '../components/ProductsList';
import Overlay from '../components/Overlay';
import i18n from '../i18n/config';
import AddToCart from '../components/AddToCart';
import LocationOption from '../components/view-options/LocationOption';

export default function Home(props) {
    const router = useRouter();
    const { md } = useScreenSize();
    const basePath = {
        href: "/",
        as: "/"
    }

    function closeDialogs() {
        router.replace("/");
    }

    return (
        <>
            <Page
                closeDialogs={closeDialogs}
                basePath={basePath}
            >
                <div className="grid padding-y-xs padding-y-lg@md">
                    {md ? (
                        <div className="col-3">
                            <div className="flex items-center justify-between flex-column@md">
                                <ViewOptionsInput />
                                <HourInfo />
                            </div>
                            <Filters />
                        </div>
                    ) : <HourInfo />}

                    <div className="col-9@md padding-left-lg@sm">
                        {md ? <SearchField /> : null}
                        <ProductsList />
                    </div>
                </div>
            </Page>


            {"add_to_cart" in router.query ? (
                <AddToCart
                    close={closeDialogs}
                    checkDiscounts={true}
                />
            ) : null}

            {!md ? (
                <Overlay
                    open={"filter_drawer" in router.query}
                    close={closeDialogs}
                    title={i18n.t("Filters")}
                >
                    <Filters />
                </Overlay>
            ) : null}

            {"location_form" in router.query ? (
                <LocationOption
                    onClose={closeDialogs}
                />
            ) : null}
        </>
    )
}