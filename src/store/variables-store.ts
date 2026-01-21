import { createStore } from '@xstate/store';

const STORAGE_KEY = '@email-playground/variables';

function getVariables() {
    try {
        const value = localStorage.getItem(STORAGE_KEY) || '';

        return JSON.parse(value);
    } catch {
        return {};
    }
}

export const variablesStore = createStore({
    context: {
        variables: getVariables() as Record<string, object>,
    },

    on: {
        setVariables: (
            context,
            event: {
                externalReferenceCode: string;
                values: Record<string, string>;
            },
        ) => {
            const variables = {
                ...context.variables,
                [event.externalReferenceCode]: {
                    ...event.values,
                },
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(variables));

            return {
                ...context,
                variables,
            };
        },
    },
});
