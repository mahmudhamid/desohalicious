import useCache from "../hooks/useCache";
import i18n from "../i18n/config";
import { cacheReducer } from "../src/cacheReducer";
import SearchIcon from "../src/icons/Search";

export default function SearchField(props) {
    const {
        autofocus
    } = props;
    const viewOptions = useCache("viewOptions");

    function handleChange(e) {
        cacheReducer("SAVEITEMSSEARCHKEYWORD", e.target.value.replace(/([^a-z0-9 ._\-]+)/gi, ''))
    }

    return (
        <div className="search-input search-input--icon-left max-width-sm">
            <input
                className={`search-input__input form-control`}
                type="search"
                placeholder={i18n.t("SearchMenu")}
                aria-label={i18n.t("SearchMenu")}
                onChange={handleChange}
                autoFocus={viewOptions.orderType.id == "delivery" && viewOptions.address.latlng && !!autofocus || viewOptions.orderType.id == "pickup" && !!autofocus}
            />
            <button className="search-input__btn">
                <SearchIcon title={i18n.t("Submit")} />
            </button>
        </div>
    )
}