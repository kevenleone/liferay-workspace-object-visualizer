import { useParams } from '@tanstack/react-router';
import { useSelector } from '@xstate/store/react';
import { useCallback, useMemo } from 'react';

import { variablesStore } from '@/store/variables-store';

function replace(text: string, variables: object, customMarkup = true) {
    let result = text || '';

    Object.entries(variables).forEach(([key, value]) => {
        const highlightedValue = customMarkup
            ? `<mark class="variable-highlight" title="${key}">${value}</mark>`
            : value;

        result = result.replaceAll(key, highlightedValue as unknown as string);
    });

    return result;
}

export function useVariablesFlat() {
    const allVariables = useSelector(
        variablesStore,
        ({ context }) => context.variables,
    );

    const replaceVariables = useCallback(
        (text: string, variable: string, customMarkup = true): string => {
            return replace(text, allVariables[variable] ?? {}, customMarkup);
        },
        [allVariables],
    );

    return { replaceVariables };
}

export function useVariables() {
    const { externalReferenceCode } = useParams({
        from: '/p/mailing/notification-templates/$externalReferenceCode',
    });

    const allVariables = useSelector(
        variablesStore,
        ({ context }) => context.variables,
    );

    const variables = useMemo(() => {
        return allVariables[externalReferenceCode] || {};
    }, [allVariables, externalReferenceCode]);

    const replaceVariables = useCallback(
        (text: string, customMarkup = true): string => {
            return replace(text, variables, customMarkup);
        },
        [variables],
    );

    return {
        replaceVariables,
        setVariables: (newValues: Record<string, string>) => {
            const values = {
                ...newValues,
            };

            variablesStore.send({
                externalReferenceCode,
                type: 'setVariables',
                values,
            });
        },
        variables,
    };
}
