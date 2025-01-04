import Link from 'next/link';
import i18n from '../i18n/config';
import useScreenSize from '../hooks/useScreenSize';
import CallIcon from '../src/icons/Call';
import NavigateIcon from '../src/icons/Navigate';
import { showCookiesSettings } from '../src/cache';
import useCache from '../hooks/useCache';

export const footerLinks = [
    {
        label: i18n.t("PrivacyNotice"),
        href: "/legal/privacy-notice"
    },
    {
        label: i18n.t("TermsOfUse"),
        href: "/legal/terms-of-use"
    }
];

export default function Footer(props) {
    const {
        basePath
    } = props;
    const shopBasicData = useCache("shopBasicData");
    const { md } = useScreenSize();

    function renderLinks() {
        return (
            <ul className="flex items-center">
                {footerLinks.map((link, index) => (
                    <li key={`${index}`} className={`${index != 0 ? "margin-left-sm" : ""}`}>
                        <Link href={link.href}>
                            <a>{link.label}</a>
                        </Link>
                    </li>
                ))}
                <li className="margin-left-sm">
                    <button className="btn--text link" onClick={() => {showCookiesSettings(true)}}>
                        {i18n.t("CookiesPreferences")}
                    </button>
                </li>
            </ul>
        )
    }

    if (!md) {
        return null
    }

    return (
        <footer className="main-footer padding-y-md border-top text-sm">
            <div className="container flex max-width-lg items-center justify-between">
                <div className="flex">
                    <a className="flex items-center margin-right-xs" href={`tel:${shopBasicData?.contactNumber}`} title={i18n.t("Call", { shopname: shopBasicData.name })}>
                        <CallIcon className="margin-right-xs icon" />
                        <span>{i18n.t("Call", { shopname: shopBasicData.name })}</span>
                    </a>

                    <a className="flex items-center" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${shopBasicData?.address?.latlng?.lat},${shopBasicData?.address?.latlng?.lng}`} title={i18n.t("DirectionsTo", { shopname: shopBasicData.name })}>
                        <NavigateIcon className="margin-right-xs icon" />
                        <span>{i18n.t("DirectionsTo", { shopname: shopBasicData.name })}</span>
                    </a>
                </div>

                <div className="flex items-center">
                    {renderLinks()}
                    <span className="margin-left-sm">&copy; 2021 {shopBasicData.name}</span>
                </div>
            </div>
        </footer>
    )
}
