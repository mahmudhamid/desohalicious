export default function RadioGroup(props) {
    const {
        fullWidth,
        className,
        name,
        options,
        onChange,
        value,
        disabled,
        label
    } = props;

    return (
        <div className={`${!!className ? className : "margin-bottom-sm"} ${!fullWidth ? "grid items-center@md" : "width-100%@md"}`}>
            {!!label ? <p className={`form-label text-sm margin-bottom-xxs${!fullWidth ? " col-3@md margin-0@md" : ""}`}>{label}</p> : null}
            <div className={`${!fullWidth ? "col-6@md" : "width-100%"}`}>

                <ul className="radio-switch-v2 width-100%">
                    {options.map((option, index) => {
                        const optionID = `${name}-${option.value}`;
                        return (
                            <li key={`${optionID}`} className="radio-switch-v2__item">
                                <input className="radio-switch-v2__input reset" type="radio" disabled={!!disabled} name={name} id={optionID} value={option.value} checked={value == option.value} onChange={onChange} />
                                <label className="radio-switch-v2__label" htmlFor={optionID}>{option.label}</label>
                                {index == 1 ? (
                                    <div aria-hidden="true" className="radio-switch-v2__toggle"><span className="radio-switch-v2__marker"></span></div>
                                ) : null}
                            </li>
                        )
                    })}
                </ul>

            </div>
        </div>
    )
}