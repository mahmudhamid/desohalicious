import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Tabs(props) {
    const {
        label,
        links,
        activeTab
    } = props;
    const router = useRouter();
    const isActiveTab = activeTab || router.asPath;

    return (
        <nav className="s-tabs margin-bottom-md">
            <ul className="s-tabs__list" aria-label={label}>
                {links.map((link, index) => (
                    <li key={`${index}`} className="margin-right-sm">
                        {!link.isButton ? (
                            <Link href={link.href} as={link.as}><a className={`s-tabs__link${isActiveTab == link.as ? " s-tabs__link--current" : ""}`}>{link.label}</a></Link>
                        ) : (
                                <a className={`s-tabs__link${isActiveTab == link.id ? " s-tabs__link--current" : ""}`} href="#0" onClick={link.onClick}>{link.label}</a>
                            )}
                    </li>
                ))}
            </ul>
        </nav>
    )
}