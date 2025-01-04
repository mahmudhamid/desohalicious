import UserMenu from './UserMenu';
import Link from 'next/link';
import ShoppingBagIcon from '../src/icons/ShoppingBag';
import useScreenSize from '../hooks/useScreenSize';
import ViewOptionsInput from './view-options/ViewOptionsInput';
import useCurrentPage from '../hooks/useCurrentPage';
import useCache from '../hooks/useCache';

export default function Header(props) {
    const cartData = useCache("cart");
    const currencySymbol = useCache("currencySymbol");
    const shopBasicData = useCache("shopBasicData");
    const acceptedOrderTypes = shopBasicData?.orderTypeIDs || [];
    const { md } = useScreenSize();
    const currentPage = useCurrentPage();
    const shopLogo = shopBasicData.logo?.image;
    const textLogo = shopBasicData.logo?.showName;

    return (
        <header className="header-wrapper bg top-0 z-index-header shadow-xs position-sticky flex items-center">
            <div className="container max-width-md">
                <div className="flex justify-between items-center">
                    {!md && currentPage == "home" && acceptedOrderTypes.includes("delivery") ? (
                        <ViewOptionsInput />
                    ) : (
                        <div className="logo-wrapper">
                            <Link href="/">
                                <a className="flex items-center">
                                    {!!shopLogo ? (
                                        <div
                                            title={shopBasicData.name}
                                            className="logo"
                                            style={{
                                                backgroundImage: `url(${shopLogo})`
                                            }}
                                        />
                                    ) : null}
                                    {!!textLogo ? <span className="flex-grow text-md color-contrast-high font-bold">{shopBasicData.name}</span> : null}
                                </a>
                            </Link>
                        </div>
                    )}
                    <div className="flex items-center">
                        <UserMenu />

                        {md ? (
                            <Link href="/checkout">
                                <button className="btn btn--text">
                                    {Object.keys(cartData).length > 0 ? <span className="margin-right-xs">{`${currencySymbol}${cartData.totals.total}`}</span> : null}
                                    <ShoppingBagIcon />
                                </button>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    )
}
