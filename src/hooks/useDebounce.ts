import { startTransition, useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 400): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const id = setTimeout(() => startTransition(() => setDebounced(value)), delay);
        return () => clearTimeout(id);
    }, [value, delay]);

    return debounced
}