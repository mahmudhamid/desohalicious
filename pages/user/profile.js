import { useRouter } from 'next/router';
import i18n from '../../i18n/config';
import PageTitle from '../../components/PageTitle';
import Tabs from '../../components/Tabs';
import Content from '../../components/Content';
import ProfileForm from '../../components/forms/user/Profile';
import PasswordForm from '../../components/forms/user/Password';
import Page from '../../components/Page';
import LoginMsg from '../../components/LoginMsg';
import useCache from '../../hooks/useCache';

export default function UserProfile(props) {
    const router = useRouter();
    const userData = useCache("userData");
    const basePath = props.basePath || {
        href: `/user/profile`,
        as: `/user/profile`,
    }

    function closeDialogs() {
        router.push(basePath.as);
    }

    return (
        <Page
            title={i18n.t("Profile")}
            closeDialogs={closeDialogs}
            basePath={basePath}
        >
            <PageTitle
                title={i18n.t("Profile")}
            />

            <Tabs
                label={i18n.t("ProfileTabs")}
                links={[
                    {
                        label: i18n.t("Account"),
                        href: basePath.href,
                        as: basePath.as,
                    },
                    {
                        label: i18n.t("Password"),
                        href: `${basePath.href}?password_form`,
                        as: `${basePath.as}?password_form`
                    }
                ]}
            />

            <Content>
                {!userData.username ? (
                    <LoginMsg basePath={basePath} />
                ) : "password_form" in router.query ? (
                    <PasswordForm />
                ) : (
                    <ProfileForm
                        basePath={basePath}
                        closeDialogs={closeDialogs}
                    />
                )}
            </Content>
        </Page>
    )
}