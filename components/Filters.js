import { useEffect } from "react";
import useCache from "../hooks/useCache";
import useScreenSize from "../hooks/useScreenSize";
import i18n from "../i18n/config";
import { cacheReducer } from "../src/cacheReducer";
import CloseIcon from "../src/icons/Close";

export default function Filters(props) {
    const { md } = useScreenSize();
    const shopData = useCache("shopData");
    const availableFilters = useCache("availableFilters");
    const { labels } = useCache("filters");
    const menuSections = "sections" in shopData && shopData.sections || [];

    useEffect(() => {
        let foundLabels = [];

        menuSections.forEach(menuSection => {
            menuSection.items.forEach(item => {
                if (item.labels) {
                    item.labels.forEach(label => {
                        let result = {
                            ...label,
                            count: 1
                        }
                        const findLabel = foundLabels.findIndex(savedLabel => savedLabel.id == label.id);

                        if (findLabel > -1) {
                            foundLabels[findLabel].count = foundLabels[findLabel].count + 1;
                        } else {
                            foundLabels.push(result)
                        }
                    });
                }
            })
        });

        cacheReducer("AVAILABLEFILTERS", { labels: foundLabels });

    }, [menuSections.length]);


    function handleLabelSelect(id) {
        let newFilters = Array.from(labels);
        const findFilterIndex = newFilters.findIndex(filterID => filterID == id);

        if (findFilterIndex > -1) {
            newFilters.splice(findFilterIndex, 1);
        } else {
            newFilters.push(id);
        }

        cacheReducer("SAVEACTIVEFILTERS", { labels: newFilters });
    }

    if (!availableFilters.labels.length) {
        return null;
    }

    return (
        <div className={`${!!md ? "border-top border-contrast-low margin-top-md padding-top-md" : ""}`}>
            <h3 className="text-base margin-bottom-sm">{i18n.t("FilterByLabel")}</h3>
            <ul className="flex flex-wrap gap-xxs">
                {availableFilters.labels.map(label => (
                    <li key={label.id}>
                        <button type="button" className={`btn btn--label${!!labels.includes(label.id) ? " active" : ""}`} onClick={() => { handleLabelSelect(label.id) }}>
                            {label.name}
                            {!!labels.includes(label.id) ? <CloseIcon className="icon margin-left-xxs" /> : null}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}