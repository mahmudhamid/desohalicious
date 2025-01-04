import { useReactiveVar } from '@apollo/client';
import * as reactiveVar from "../src/cache";

export default function useCache(ref) {
    return useReactiveVar(reactiveVar[ref]);
};