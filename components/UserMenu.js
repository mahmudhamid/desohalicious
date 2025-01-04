import { useState } from 'react';
import i18n from '../i18n/config';
import { useRouter } from 'next/router';
import Auth from '@aws-amplify/auth';
import Link from 'next/link';
import NotificationDrawer from './NotificationsDrawer';
import BellOnIcon from '../src/icons/BellOn';
import DownIcon from '../src/icons/Down';
import PopMenu from './PopMenu';
import LoginIcon from '../src/icons/Login';
import { userMenu } from '../src/appConfig';
import useScreenSize from '../hooks/useScreenSize';
import { del } from 'idb-keyval';
import { cacheReducer } from '../src/cacheReducer';
import useCache from '../hooks/useCache';

function UserMenu() {
    const router = useRouter();
    const { md } = useScreenSize();
    const [openMenu, setOpenMenu] = useState(false);
    const [showBadge, setShowBadge] = useState(null);
    const userData = useCache("userData");
    const userDataLoaded = useCache("userDataLoaded");
    const name = userData.given_name;

    async function signOut() {
        try {
            const logout = await Auth.signOut();
            cacheReducer("LOGOUT");
            await del('cid');
            await del('cd');
            router.replace("/");
        } catch (error) {
            console.log(error);
            cacheReducer("SETERROR", { severity: "error", message: i18n.t("UnableToSignOut") });
        }
    }

    function handleOpenNotificationDrawer() {
        if (router.query.length > 0) {
            router.push(`${router.pathname}&notification_panel`, `${router.asPath}&notification_panel`, { shallow: true });
        } else {
            router.push(`${router.pathname}?notification_panel`, `${router.asPath}?notification_panel`, { shallow: true });
        }
    }

    if (!userDataLoaded) {
        return null;
    }

    if (userDataLoaded && name) {
        return (
            <>
                <div className="flex items-center">
                    {md ? (
                        <button id="user-menu-trigger" className="btn btn--text" onClick={() => { setOpenMenu(!openMenu) }}>
                            <span className="font-bold">{i18n.t("Hi", { name: name })}</span>
                            <DownIcon />
                        </button>
                    ) : null}

                    <button className="btn btn--icon items-start" onClick={handleOpenNotificationDrawer}>
                        <BellOnIcon />
                        {!!showBadge ? <div className="dot" /> : null}
                    </button>
                </div>

                {md ? (
                    <PopMenu
                        btnID="user-menu-trigger"
                        open={openMenu}
                        onClose={() => { setOpenMenu(false) }}
                        options={[
                            ...userMenu,
                            {
                                isSeparator: true
                            },
                            {
                                onClick: signOut,
                                isButton: true,
                                label: i18n.t("Logout")
                            }
                        ]}
                    />
                ) : null}
                <NotificationDrawer showBadge={setShowBadge} />
            </>
        )
    } else if (md) {
        return (
            <Link href={`${router.pathname}?login_form`} as={`${router.asPath}?login_form`}>
                <button type="button" className="btn btn--text">
                    <span>{i18n.t("Login")}</span>
                    <LoginIcon className="icon margin-left-xxxs" />
                </button>
            </Link>
        )
    }

    return null
}
export default UserMenu;