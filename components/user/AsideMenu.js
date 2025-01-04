import Link from 'next/link';
import { userMenu } from '../../src/appConfig';
import useCurrentPage from '../../hooks/useCurrentPage';
import useCache from '../../hooks/useCache';

export default function AsideMenu(props) {
    const userData = useCache("userData");
    const currentPage = useCurrentPage();
    let activePage = userMenu.find(item => item.href == `/${currentPage}`) || {};
    if (!activePage.label) {
        activePage = userMenu.find(item => item.href.search(currentPage) > -1) || {};
    }

    return (
        <aside className="bg height-100%">
            <header className="padding-md bg text-center font-bold text-sm border-bottom">
                <p className="margin-bottom-xs">{userData.name}</p>
                <p>{userData.email}</p>
            </header>

            <nav>
                <ul className="user-side-menu padding-y-sm">
                    {userMenu.map((item, index) => (
                        <li key={`${index}`}>
                            <Link href={item.href}>
                                <a className={`block padding-y-xs padding-x-md color-contrast-higher${activePage.href == item.href ? " active" : ""}`}>{item.label}</a>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
}