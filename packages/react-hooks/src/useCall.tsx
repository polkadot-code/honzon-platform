import { useState, useEffect } from 'react';
import { Observable } from 'rxjs';

interface Options<T>  {
    formatter: (a: T) => T;
}

const defaultFormatter = (value: any) => {
    return value;
}

export function useCall<T> (observer: Observable<T>, { formatter } = { formatter: defaultFormatter}) {
    const [data, setData] = useState<T>();
    useEffect(() => {
        observer.subscribe((result: T) => {
            console.log('hello');
            setData(formatter(result));
        });
    }, []);
    return { data };
}