import { useEffect, useRef } from 'react';
import Link from "next/link"

export default function PopMenu(props) {
    const {
        btnID,
        open,
        onClose,
        options
    } = props;
    const menuRef = useRef();

    useEffect(() => {
        if (open) {
            positionMenu();

            window.addEventListener('click', watchScreenClick);
        }

        return () => {
            window.removeEventListener('click', watchScreenClick);
        }
    }, [open]);

    function watchScreenClick(event) {
        const target = event.target;

        if (!menuRef?.current?.contains(target) && !target.id != btnID) onClose();
    }

    function positionMenu(event, direction) {
        const selectedTrigger = document.getElementById(btnID);

        const selectedTriggerPosition = selectedTrigger.getBoundingClientRect(),
            menuOnTop = (window.innerHeight - selectedTriggerPosition.bottom) < selectedTriggerPosition.top;
        // menuOnTop = window.innerHeight < selectedTriggerPosition.bottom + menu.offsetHeight;

        const left = selectedTriggerPosition.left,
            right = (window.innerWidth - selectedTriggerPosition.right),
            isRight = (window.innerWidth < selectedTriggerPosition.left + menuRef.current.offsetWidth);

        var horizontal = isRight ? 'right: ' + right + 'px;' : 'left: ' + left + 'px;',
            vertical = menuOnTop
                ? 'bottom: ' + (window.innerHeight - selectedTriggerPosition.top) + 'px;'
                : 'top: ' + selectedTriggerPosition.bottom + 'px;';
        // check right position is correct -> otherwise set left to 0
        if (isRight && (right + menuRef.current.offsetWidth) > window.innerWidth) horizontal = 'left: ' + parseInt((window.innerWidth - menuRef.current.offsetWidth) / 2) + 'px;';
        var maxHeight = menuOnTop ? selectedTriggerPosition.top - 20 : window.innerHeight - selectedTriggerPosition.bottom - 20;

        menuRef.current.setAttribute('style', horizontal + vertical + 'max-height:' + Math.floor(maxHeight) + 'px;');
    };

    return (
        <menu ref={menuRef} className={`menu${!!open ? " menu--is-visible" : ""}`}>
            {options.map((option, index) => option.isSeparator ? (
                <li key={`${index}`} className="menu__separator" role="separator"></li>
            ) : (
                    <li key={`${index}`} role="menuitem">
                        {!!option.isButton ? (
                            <button className="btn btn--text menu__content width-100% radius-0" onClick={option.onClick} disabled={!!option.disabled}>
                                {option.icon || null}
                                {option.label}
                            </button>
                        ) : (
                                <Link href={option.href} as={option.as}>
                                    <a className="menu__content" tabIndex={`${index - 1}`}>
                                        {option.icon || null}
                                        {option.label}
                                    </a>
                                </Link>
                            )}
                    </li>
                ))}
        </menu>
    )
}