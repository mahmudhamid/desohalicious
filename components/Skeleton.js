export default function Skeleton(props) {
    const {
        type,
        rows,
        fullWidth,
        hideFieldset,
        className
    } = props;

    function renderText() {
        return [...Array(rows).keys()].map(index => <span key={`${index}`} className={`block ske ske--text margin-bottom-xxs${!!className ? ` ${className}` : ""}`} />)
    }

    function renderList() {
        return [...Array(rows).keys()].map(index => (
            <div key={`${index}`} className={`ske ske--card width-100% margin-bottom-sm${!!className ? ` ${className}` : ""}`} />
        ))
    }
    
    function renderProducts() {
        return [...Array(rows).keys()].map(index => (
            <div className="margin-top-md" key={`${index}`}>
                <div className="padding-y-xs padding-x-sm bg margin-bottom-sm radius-sm">
                    <p className={`ske height-xxs radius-md col-2`} />
                    <p className={`ske col-5 height-xxs margin-top-xs radius-md`} />
                </div>
                <ul className="grid gap-sm">
                    {[...Array(6).keys()].map(i => (
                        <li className="col-6@sm" key={`${i}`}>
                            <p className="ske ske--card margin-bottom-sm" style={{height: "100px"}} />
                        </li>
                    ))}
                </ul>
            </div>
        ))
    }

    function renderForm() {
        return (
            <div className={!hideFieldset ? "padding-top-lg padding-x-md padding-bottom-md" : ""}>
                {!hideFieldset && <div className="ske ske--text col-3 margin-top-sm margin-bottom-md" /> || null}
                {[...Array(rows || 4).keys()].map(index => (
                    <div key={`${index}`} className={`margin-bottom-sm${!fullWidth ? " grid items-center@md" : ""}`}>
                        <div className={`margin-bottom-xs${!fullWidth ? " col-3@md margin-0@md" : ""}`}>
                            <div className={`ske ske--text${!!fullWidth ? " col-3" : " col-6"}`} />
                        </div>

                        <div className={`${!fullWidth ? " col-6@md" : ""}`}>
                            <div className="ske ske--form col-12" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    function renderAddToCart() {
        return (
            <>
                <div className="margin-bottom-lg">
                    <div className="ske ske--text col-12 margin-bottom-xxs" />
                    <div className="ske ske--text col-8 margin-bottom-xxs" />
                </div>
                <div className="ske ske--text col-4 margin-bottom-sm" />
                <div className="grid gap-sm">
                    {[...Array(3).keys()].map(index => (
                        <div key={`${index}`} className="ske ske--addon col-4 radius-full" />
                    ))}
                </div>
            </>
        )
    }

    function renderDetails() {
        return [...Array(4).keys()].map(index => (
            <div key={`${index}`} className="grid margin-bottom-sm">
                <dt className="col-5@md">
                    <div className="ske ske--text col-3" />
                </dt>
                <dd className="col-7@md col-7@md margin-top-xxs margin-top-0@sm">
                    <div className="ske ske--text col-5" />
                </dd>
            </div>
        ));
    }

    switch (type) {
        case "details":
            return renderDetails();
        case "addToCart":
            return renderAddToCart()
        case "form":
            return renderForm();
        case "list":
            return renderList();
        case "text":
            return renderText();
        case "products":
            return renderProducts();
        default:
            return null;
    }
}