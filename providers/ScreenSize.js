import { useEffect, createContext, useRef, useState } from 'react';

const sizes = {
    xs: 512,
    sm: 768,
    md: 1024,
    lg: 1280,
    xl: 1440
};

const initialState = { sm: false, md: false, lg: false, xl: false };

export const ScreenSizeContext = createContext(false);

export default function ScreenSizeProvider(props) {
    const {
        children
    } = props;
    const [currentSizes, setCurrentSizes] = useState(() => {
        const size = window.innerWidth;
        let initialSizes = { ...initialState };

        if (size > sizes.xs) {
            initialSizes.sm = true;
        }
        if (size > sizes.sm) {
            initialSizes.md = true;
        }
        if (size > sizes.md) {
            initialSizes.lg = true;
        }
        if (size > sizes.lg) {
            initialSizes.xl = true;
        }
        return initialSizes;
    });
    let sizesRef = useRef(currentSizes);

    useEffect(() => {
        window.addEventListener('resize', screenSizeChangeHandler);
        return () => {
            window.removeEventListener('resize', screenSizeChangeHandler);
        };
    }, []);

    const screenSizeChangeHandler = () => {
        const size = window.innerWidth;
        const currentSizesRef = sizesRef.current;
        let dirty = false;
        let newSizes = { ...sizesRef.current };

        if (size > sizes.xs) {
            if (!currentSizesRef.sm) {
                dirty = true;
                newSizes.sm = true;
            }
        } else if (currentSizesRef.sm) {
            dirty = true;
            newSizes.sm = false;
        }

        if (size > sizes.sm) {
            if (!currentSizesRef.md) {
                dirty = true;
                newSizes.md = true;
            }
        } else if (currentSizesRef.md) {
            dirty = true;
            newSizes.md = false;
        }

        if (size > sizes.md) {
            if (!currentSizesRef.lg) {
                dirty = true;
                newSizes.lg = true;
            }
        } else if (currentSizesRef.lg) {
            dirty = true;
            newSizes.lg = false;
        }

        if (size > sizes.lg) {
            if (!currentSizesRef.xl) {
                dirty = true;
                newSizes.xl = true;
            }
        } else if (currentSizesRef.xl) {
            dirty = true;
            newSizes.xl = false;
        }

        if (dirty) {
            sizesRef.current = newSizes;
            setCurrentSizes(newSizes)
        }
    }

    return (
        <ScreenSizeContext.Provider value={currentSizes}>
            {children}
        </ScreenSizeContext.Provider>
    )
}