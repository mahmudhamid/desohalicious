import HTMLHead from "./HTMLHead";
import Header from "./Header";
import Footer from "./Footer";
import BottomTabs from "./BottomTabs";
import useScreenSize from "../hooks/useScreenSize";
import LoginForm from "./forms/Login";
import UserHeader from "./user/UserHeader";
import AsideMenu from "./user/AsideMenu";
import SearchField from "./SearchField";
import useCurrentPage from "../hooks/useCurrentPage";
import { useRouter } from "next/router";
import Auth from "@aws-amplify/auth";
import ConfirmSignUp from "./forms/ConfirmSignUp";
import SignUp from "./forms/SignUp";
import Alert from "./Alert";
import { useEffect } from "react";
import { idbGet } from "../src/storage";
import CookiesSettingsForm from "./forms/Cookies";
import { useReactiveVar } from "@apollo/client";
import { showCookiesSettings } from "../src/cache";
import { cacheReducer } from "../src/cacheReducer";
import useCache from "../hooks/useCache";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import { recaptchaKey } from "../src/appConfig";

export default function Page(props) {
    const {
        title,
        desc,
        children,
        closeDialogs,
        basePath,
        className,
        fullWidth
    } = props;
    const router = useRouter();
    const { md } = useScreenSize();
    const showCookies = useReactiveVar(showCookiesSettings);
    const error = useCache("siteWideError");
    const currentPage = useCurrentPage();
    const isUserPage = currentPage.indexOf("user") > -1;

    useEffect(() => {
        checkCookiesSettings()
    }, [])

    async function checkCookiesSettings() {
        try {
            const cs = await idbGet("cs");
            if (!cs) {
                showCookiesSettings(true)
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <HTMLHead title={title} desc={desc} />

            {currentPage == "search" ? (
                <SearchField autofocus={true} />
            ) : !!isUserPage && !md ? <UserHeader /> : <Header />}

            <main className={`page-main overflow-hidden flex flex-column ${!!className ? className : "bg-contrast-lower"}`}>
                <div className={`flex-grow${!fullWidth ? " container max-width-md" : ""}${!!isUserPage && !!md ? " flex flex-column" : ""}`}>
                    {!!isUserPage && !!md ? (
                        <div className="grid flex-grow">
                            <div className="col-3">
                                <AsideMenu />
                            </div>
                            <div className="col-9 padding-md">
                                {children}
                            </div>
                        </div>
                    ) : !!isUserPage ? (
                        <div className="padding-y-md">
                            {children}
                        </div>
                    ) : children}
                </div>
            </main>

            <Footer basePath={basePath} />

            {!md ? <BottomTabs /> : null}

            <Alert
                severity={error.severity}
                message={error.message}
                className="position-fixed alert-onscreen"
                open={!!error.message}
                onClose={() => {
                    cacheReducer("SETERROR", {});
                }}
            />

            {"login_form" in router.query ? (
                <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
                    <LoginForm
                        onClose={closeDialogs}
                        loginComplete={closeDialogs}
                        basePath={basePath}
                    />
                </GoogleReCaptchaProvider>
            ) : null}

            {"verify_email" in router.query ?
                    <ConfirmSignUp
                        onClose={closeDialogs}
                        loginComplete={async () => {
                            try {
                                const user = await Auth.currentAuthenticatedUser();
                                cacheReducer("SAVELOGEDINUSER", { username: user.username, name: `${user.attributes.given_name} ${user.attributes.family_name}`, ...user.attributes });
                                closeDialogs();
                            } catch (error) {
                                console.log(error);
                                router.push(`${basePath.href}?login_form`, `${basePath.as}?login_form`)
                            }
                        }}
                    />
                : null}

            {"signup_form" in router.query ?
                <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
                    <SignUp
                        onClose={closeDialogs}
                        basePath={basePath}
                    />
                </GoogleReCaptchaProvider>
            : null}

            {!!showCookies ? (
                <CookiesSettingsForm
                    onComplete={() => {showCookiesSettings(false)}}
                />
            ) : null}
        </>
    )
}