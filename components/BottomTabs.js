import i18n from '../i18n/config';
import HomeIcon from '../src/icons/Home';
import ShoppingBagIcon from '../src/icons/ShoppingBag';
import UserIcon from '../src/icons/User';
import SearchIcon from '../src/icons/Search';
import Link from 'next/link';
import useCurrentPage from '../hooks/useCurrentPage';
import useCache from '../hooks/useCache';

export default function BottomTabs(props) {
    const cartData = useCache("cart");
    const currencySymbol = useCache("currencySymbol");
    const currentPage = useCurrentPage();
    const cartTabText = Object.keys(cartData).length > 0 ? `${currencySymbol}${i18n.toNumber(cartData.totals.total, { precision: 3, strip_insignificant_zeros: true })}` : i18n.t('Cart');
    const menu = [
        {
            icon: <HomeIcon />,
            label: i18n.t('Home'),
            href: "/",
            active: currentPage == "home"
        },
        {
            icon: <SearchIcon />,
            label: i18n.t('Search'),
            href: "/search",
            active: currentPage == "search"
        },
        {
            icon: <ShoppingBagIcon />,
            label: cartTabText,
            href: "/checkout",
            active: currentPage == "checkout"
        },
        {
            icon: <UserIcon />,
            label: i18n.t('Account'),
            href: "/user",
            active: currentPage.indexOf("user") > -1
        }
    ];

    return (
        <nav className="bottom-nav bg flex items-center flex-column z-index-overlay-plus">
            <ul className="grid items-center width-100% flex-grow">
                {menu.map((item, index) => (
                    <Link key={`${index}`} href={item.href}>
                        <a className={`text-center col-3 overflow-hidden ${!!item.active ? "color-primary" : "color-black"}`}>
                            {item.icon}
                            <p className="text-truncate">{item.label}</p>
                        </a>
                    </Link>
                ))}
            </ul>
        </nav>
    )
}