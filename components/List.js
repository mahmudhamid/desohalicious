
import useScreenSize from '../hooks/useScreenSize';
import i18n from '../i18n/config';
import ErrorIcon from '../src/icons/Error';
import MessageAlert from './MessageAlert';
import Skeleton from './Skeleton';

export default function List(props) {
    const {
        id,
        loading,
        skeleton,
        error,
        list,
        className,
        noDataMsg
    } = props;
    const customClassName = !!className ? ` ${className}` : "";
    const { md } = useScreenSize();

    function widthsCal(item) {
        let icon = !item.icon ? 0 : !!md ? 1 : 2;
        let actions = !item.action ? 0 : !!md ? (item.action.length || 2) : ((item.action.length || 1) + 1);
        let labels = !item.labels ? 0 : !!md ? 1 : ((item.labels.length||1) + 1);

        if (!!md && !!item.action && id == "shops-list") {
            actions = 4
        }

        return {
            icon: `col-${icon}`,
            primary: `col-${12 - icon - actions - labels}`,
            labels: `col-${labels}`,
            actions: `col-${actions}`
        }
    }

    if (!!loading) {
        return <Skeleton {...skeleton} />
    }

    if (!!error) {
        return <MessageAlert
            icon={<ErrorIcon className="icon icon--lg" />}
            title={i18n.t("CouldNotLoadThisList")}
        />
    }

    return (
        <ul className={`gap-sm${customClassName}`}>
            {list.length > 0 ? list.map(item => {
                const isButton = !!item.onClick && !!item.button ? { role: "button", onClick: item.onClick } : {};
                const widths = widthsCal(item);

                return (
                    <li key={item.id}>
                        <ul className={`grid height-list-card bg radius-md shadow-xs border${!!item.className ? ` ${item.className}` : ""}`}>
                            {!!item.icon ? <li className={`flex items-center justify-center ${widths.icon}${!!item.button ? " cursor-pointer" : ""}`} {...isButton}>
                                {item.icon}
                            </li> : null}

                            <li className={`flex items-center justify-center ${widths.primary}${!!item.button ? " cursor-pointer" : ""}`} {...isButton}>
                                <div className="width-100% padding-xs">
                                    <h3 className="text-base">{item.primary}</h3>
                                    {!!item.secondary ? (typeof item.secondary == "string" ? <p className="text-sm margin-top-xxxs">{item.secondary}</p> : item.secondary) : null}
                                </div>
                            </li>

                            {!!item.labels ? <li className={`flex items-center justify-center ${widths.labels}${!!item.button ? " cursor-pointer" : ""}`} {...isButton}>
                                {item.labels}
                            </li> : null}

                            {!!item.action ? <li className={`flex items-center justify-center ${widths.actions}`}>
                                {item.action}
                            </li> : null}
                        </ul>
                    </li>
                )
            }) : (
                <li>
                    <MessageAlert
                        {...noDataMsg}
                    />
                </li>
            )}
        </ul>
    )
}