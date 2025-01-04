
import StarIcon from '../../src/icons/Star';
import FieldError from './FieldError';
import HelpText from './HelpText';

export default function RatingField(props) {
    const {
        label,
        disabled,
        onSelect,
        value,
        error,
        touched,
        helpText,
        className
    } = props;

    function handcleStarClick(index) {
        if (!disabled) {
            onSelect(index)
        }
    }

    return (
        <div className={`margin-bottom-sm${!!className ? ` ${className}` : ""}`}>
            <div className={`rating${!!disabled ? " rating--read-only" : ""}`} data-animation={!!disabled ? "off" : "on"}>
                <div className="rating__control">
                    <fieldset>
                        <div className="grid items-center@md">
                            {!!label ? <legend className="form-label margin-bottom-xxs col-3@md margin-0@md">{label}</legend> : null}

                            <div className="col-9@md">
                                <ul role="radiogroup">
                                    <li className={`${value > 0 ? "rating__item--checked" : ""}`} role="radio" aria-label="1" aria-checked="true" tabIndex={`${value == 1 ? "0" : "-1"}`} onClick={() => { handcleStarClick(1) }}>
                                        <div className="rating__icon">
                                            <StarIcon />
                                        </div>
                                    </li>
                                    <li className={`${value > 1 ? "rating__item--checked" : ""}`} role="radio" aria-label="2" aria-checked="false" tabIndex={`${value == 2 ? "0" : "-1"}`} onClick={() => { handcleStarClick(2) }}>
                                        <div className="rating__icon">
                                            <StarIcon />
                                        </div>
                                    </li>
                                    <li className={`${value > 2 ? "rating__item--checked" : ""}`} role="radio" aria-label="3" aria-checked="false" tabIndex={`${value == 3 ? "0" : "-1"}`} onClick={() => { handcleStarClick(3) }}>
                                        <div className="rating__icon">
                                            <StarIcon />
                                        </div>
                                    </li>
                                    <li className={`${value > 3 ? "rating__item--checked" : ""}`} role="radio" aria-label="4" aria-checked="false" tabIndex={`${value == 4 ? "0" : "-1"}`} onClick={() => { handcleStarClick(4) }}>
                                        <div className="rating__icon">
                                            <StarIcon />
                                        </div>
                                    </li>
                                    <li className={`${value > 4 ? "rating__item--checked" : ""}`} role="radio" aria-label="5" aria-checked="false" tabIndex={`${value == 5 ? "0" : "-1"}`} onClick={() => { handcleStarClick(5) }}>
                                        <div className="rating__icon">
                                            <StarIcon />
                                        </div>
                                    </li>
                                </ul>
                                <HelpText text={helpText} />
                                <FieldError error={error} touched={touched} />
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>
        </div>
    )
}