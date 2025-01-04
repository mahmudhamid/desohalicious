import { ApolloProvider } from '@apollo/client';
import Auth from '@aws-amplify/auth';
import { useEffect, useState } from 'react';
import ScreenSizeProvider from '../providers/ScreenSize';
import Loader from './Loader';
import CloseIcon from '../src/icons/Close';
import { idbGet, idbSet } from '../src/storage';
import { cacheReducer } from '../src/cacheReducer';
import useCache from '../hooks/useCache';

export default function NitronAuthenticator(props) {
    const {
        initClient,
        Component,
        pageProps
    } = props;
    const [apolloClient, setApolloClient] = useState();
    const [hideNotice, setHideNotice] = useState(true);
    const userData = useCache("userData");
    const shopBasicData = useCache("shopBasicData");

    useEffect(() => {
        initAuth(true);
        noticeExSetting();
    }, []);

    useEffect(() => {
        initAuth()
    }, [userData.username]);

    async function noticeExSetting() {
        try {
            if (!(await idbGet("hsn"))) {
                setHideNotice(false);
            }
        } catch (error) {
            console.log(error);
        }
    }

    function initAuth(saveUserData) {
        Auth.currentAuthenticatedUser().then(currentUser => {
            const info = currentUser.attributes;
            const identity = {
                username: currentUser.username,
                claims: {
                    email: info.email,
                    name: info.name || null,
                    phone_number: info.phone_number
                }
            }

            setApolloClient(initClient(identity));

            if (saveUserData) {
                cacheReducer("SAVELOGEDINUSER", { username: currentUser.username, name: `${currentUser.attributes.given_name} ${currentUser.attributes.family_name}`, ...currentUser.attributes });
            }
        }).catch(e => {
            setApolloClient(initClient());
            if (saveUserData) {
                cacheReducer("SAVELOGEDINUSER", {});
            }
            console.log(e);
        });
    }

    function renderNotice() {
        if (!shopBasicData.siteNotice || !!hideNotice) {
            return null
        }

        return (
            <div className="notice notice--v2">
                <div className="notice__banner bg-contrast-lower padding-y-sm padding-y-xxxs@sm border-bottom">
                    <div className="container max-width-md">
                        <div className="flex justify-between items-center@sm">
                            <p className="text-sm">{shopBasicData.siteNotice}</p>
                            <button className="reset notice__close-btn margin-left-sm" onClick={() => {
                                idbSet('hsn', true);
                                setHideNotice(true);
                            }}>
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (!apolloClient) {
        return <Loader center={true} />
    }

    return (
        <ApolloProvider client={apolloClient}>
            <ScreenSizeProvider>
                {renderNotice()}
                <Component {...pageProps} />
            </ScreenSizeProvider>
        </ApolloProvider>
    )
}