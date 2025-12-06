import { ReactNode } from 'react';
import { createContext, useContext } from 'react';

type ShadcnContextState = {
    shadowRoot: null | ShadowRoot;
};

 const ShadcnContext = createContext<ShadcnContextState>({
    shadowRoot: null,
});

export default function ShadcnContextProvider(
    props: ShadcnContextState & { children: ReactNode },
) {
    return (
        <ShadcnContext.Provider value={{ shadowRoot: props.shadowRoot }}>
            {props.children}
        </ShadcnContext.Provider>
    );
}

export {ShadcnContext}

export function useShadcnContext() {
    return useContext(ShadcnContext);
}
