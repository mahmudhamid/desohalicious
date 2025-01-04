import Link from "next/link";
import useCache from "../../hooks/useCache";
import i18n from "../../i18n/config";
import { cacheReducer } from "../../src/cacheReducer";
import Checkbox from "./Checkbox";

export default function AcceptToS(props) {
    const checkoutClientData = useCache("checkoutClientData");

    return (
        <div className="padding-sm radius-md bg-success-light bg-opacity-20% flex items-center margin-bottom-sm">
            <Checkbox
                name="accept-tos"
                wrapperClass="block"
                checked={checkoutClientData.acceptToS > 0}
                onChange={e => {
                    cacheReducer("SETCHECKOUTCLIENTDATA", {
                            ...checkoutClientData,
                            acceptToS: e.target.checked && 1 || 0
                        })
                }}
                label={
                    <div className="margin-left-xs">
                        <span>{i18n.t("AcceptToSDesc")}</span><span className="margin-x-xxxs">{<Link href="/legal/terms-of-use"><a>{i18n.t("ToS")}</a></Link>}</span>{i18n.t("And")}<span className="margin-left-xxxs">{<Link href="/legal/privacy-notice"><a>{i18n.t("PrivacyNotice")}</a></Link>}</span>
                    </div>
                }
            />
        </div>
    )
}