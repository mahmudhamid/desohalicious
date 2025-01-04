export default function RadioGroup(props) {
    const {
        fullWidth,
        name,
        options,
        onChange,
        value,
        disabled,
        label
    } = props;

    function renderLabel(option, optionID) {
        return <label htmlFor={optionID}>{option.label}</label>
    }

    function renderInput(option, optionID) {
        return (
            <>
                <input
                    name={name}
                    className="radio radio--bg"
                    type="radio"
                    id={optionID}
                    disabled={!!disabled}
                    value={option.value}
                    onChange={onChange}
                    checked={value == option.value}
                />
                {renderLabel(option, optionID)}
            </>
        )
    }

    return (
        <div className={`margin-bottom-sm${!fullWidth ? " grid items-center@md" : ""}`}>
            {!!label ? <h3 className={`text-sm ${!fullWidth ? " col-3@md margin-0@md" : ""}`}>{label}</h3> : null}

            <div className={`select margin-top-xs${!fullWidth ? " col-6@md" : " width-100%"}`}>
                <ul className="flex flex-wrap gap-xxs">
                    {options.map(option => {
                        const optionID = `${name}-${option.value}`;

                        return (
                            <li key={`${optionID}`}>
                                {typeof option.box == "function" ? (
                                    <div className="flex items-center">
                                        <div className="margin-right-sm">
                                            {renderInput(option, optionID)}
                                        </div>
                                        {option.box()}
                                    </div>
                                ) : renderInput(option, optionID)}
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>
    )
}