import { useRouter } from 'next/router';
import Page from '../../components/Page';
import useScreenSize from '../../hooks/useScreenSize';
import i18n from '../../i18n/config';
import { footerLinks } from '../../components/Footer';
import Link from 'next/link';
import LoginMsg from '../../components/LoginMsg';
import { userMenu } from '../../src/appConfig';
import UserProfile from './profile';
import CallIcon from '../../src/icons/Call';
import NavigateIcon from '../../src/icons/Navigate';
import useCache from '../../hooks/useCache';

export default function UserPage(props) {
    const router = useRouter();
    const { md } = useScreenSize();
    const userData = useCache("userData");
    const shopBasicData = useCache("shopBasicData");
    const basePath = {
        href: `/user`,
        as: `/user`,
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    if (!!md) {
        return <UserProfile basePath={basePath} />
    }

    return (
        <Page
            title={i18n.t("Account")}
            closeDialogs={closeDialogs}
            basePath={basePath}
            className="bg border-top"
        >
            {!userData.username ? (
                <LoginMsg basePath={basePath} />
            ) : <ul>
                {userMenu.map((link, index) => (
                    <li key={`${index}`}>
                        <Link href={link.as}>
                            <a className="block padding-y-sm">{link.label}</a>
                        </Link>
                    </li>
                ))}
            </ul>}
            <ul className="margin-top-md border-top padding-top-md">
                <li>
                    <a className="flex items-center block padding-y-sm" href={`tel:${shopBasicData?.contactNumber}`} title={i18n.t('CallVendor')}>
                        <CallIcon className="margin-right-xs icon" />
                        <span>{i18n.t("Call", { shopname: shopBasicData.name })}</span>
                    </a>
                </li>
                <li>
                    <a className="flex items-center block padding-y-sm" target="_blank" href={`https://www.google.com/maps/dir/?api=1&destination=${shopBasicData?.address?.latlng?.lat},${shopBasicData?.address?.latlng?.lng}`} title={i18n.t("DirectionsTo", { shopname: shopBasicData.name })}>
                        <NavigateIcon className="margin-right-xs icon" />
                        <span>{i18n.t("DirectionsTo", { shopname: shopBasicData.name })}</span>
                    </a>
                </li>
                {footerLinks.map((link, index) => (
                    <li key={`${index}`}>
                        <Link href={link.href}>
                            <a className="block padding-y-sm">{link.label}</a>
                        </Link>
                    </li>
                ))}
                <li>
                    <button className="btn--text block padding-y-sm" onClick={() => {showCookiesSettings(true)}}>
                        {i18n.t("CookiesPreferences")}
                    </button>
                </li>
            </ul>
            <p className="margin-y-md">&copy; 2021 {shopBasicData.name}</p>
        </Page>
    )
}