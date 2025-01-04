import Link from "next/link";
import useCache from "../../hooks/useCache";
import useCurrentPage from "../../hooks/useCurrentPage";
import i18n from "../../i18n/config";
import { userMenu } from "../../src/appConfig";
import ArrowLeftIcon from "../../src/icons/ArrowLeft";

export default function UserHeader(props) {
    const currentPage = useCurrentPage();
    const userData = useCache("userData");
    const activePage = userMenu.find(item => item.href == `/${currentPage}`) || {};

    function renderBackBtn() {
        if (currentPage == "user") {
            return null
        }

        return (
            <Link href={`${currentPage == "user/order" ? "/user/orders" : "/user"}`}>
                <a className="padding-right-sm height-100% items-center flex"><ArrowLeftIcon /> </a>
            </Link>
        )
    }

    return (
        <header className="header-wrapper">
            <div className="flex height-100% items-center padding-x-lg">
                {renderBackBtn()}
                <p>{currentPage == "user" && userData.name || activePage.label || i18n.t("Account")}</p>
            </div>
        </header>
    )
}