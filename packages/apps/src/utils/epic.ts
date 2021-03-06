import { tap, filter } from 'rxjs/operators';

export const txLog$ = tap((result: any) => {
    if (process.env['NODE_ENV'] === 'development') {
        console.log('finally? ', result.isFinalized);
        // Loop through Vec<EventRecord> to display all events
        result.events.forEach(({ phase, event: { data, method, section } }: any) => {
            console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
        });
    }
});

export const txResultFilter$ = filter((result: any) => {
    result.events.forEach(({ phase, event: { data, method, section } }: any) => {
        if (method === 'ExtrinsicFailed') {
            console.log('error: ', method);
            throw new Error(method);
        }
    });
    console.log('in block:', result.isInBlock, 'is finalized', result.isFinalized);
    return result.isInBlock;
});
