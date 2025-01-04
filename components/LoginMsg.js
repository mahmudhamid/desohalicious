import Link from "next/link";
import i18n from "../i18n/config";
import LoginIcon from "../src/icons/Login";
import MessageAlert from "./MessageAlert";

export default function LoginMsg(props) {
    const {
        basePath
    } = props;

    return (
        <MessageAlert
            icon={<LoginIcon className="icon icon--lg" />}
            title={i18n.t("loginInToContinue")}
            btn={
                <Link href={`${basePath.href}?login_form`} as={`${basePath.as}?login_form`}>
                    <button type="button" className="btn btn--primary">
                        {i18n.t("Login")}
                    </button>
                </Link>
            }
        />
    )
}