import { useContext } from 'react';
import { ScreenSizeContext } from '../providers/ScreenSize';

export default function useScreenSize() {
    const screenSize = useContext(ScreenSizeContext);

    return screenSize;
};