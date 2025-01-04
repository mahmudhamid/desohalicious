import Link from 'next/link';

export default function PageTitle(props) {
    const {
        title,
        subTitle,
        icon,
        btn,
        actions,
        className
    } = props;

    return (
        <div className={`flex items-center margin-y-md${!!className ? ` ${className}` : ""}`}>
            <div className="flex-grow flex items-center overflow-hidden">
                {!!icon ? <div className="margin-right-sm">{icon}</div> : null}

                <div className="flex-grow overflow-hidden">
                    <h1 className="text-md text-truncate">{title}</h1>
                    {!!subTitle ? subTitle : null}
                </div>
            </div>

            <div className="flex items-center">
                {!!btn && !btn.onClick ? (
                    <Link href={btn.href} as={btn.as}>
                        <button className={`btn ${btn.className || ""}`}>
                            {btn.label}
                        </button>
                    </Link>
                ) : !!btn ? (
                    <button id={btn.id} className={`btn ${btn.className || ""}`} onClick={btn.onClick}>
                        {btn.label}
                    </button>
                ) : null}
                {!!actions ? actions : null}
            </div>
        </div>
    )
}