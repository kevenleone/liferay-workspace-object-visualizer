import Dexie, { type EntityTable } from 'dexie';

// --- Shared Interfaces ---

export interface QueryHistoryItem {
    id: string;
    executedAt: string;
    status: 'error' | 'success';
    duration?: string;
    name?: string;
    response?: any;
    statusCode?: number;
}

export interface RestHistoryItem extends QueryHistoryItem {
    url: string;
    method: string;
    responseSize?: string;
    payload?: any;
}

export interface GraphqlHistoryItem extends QueryHistoryItem {
    url: string;
    query: string;
}

export interface ODataHistoryItem extends QueryHistoryItem {
    query: string;
    endpoint: string;
    externalReferenceCode: string;
    rowCount?: number;
    error?: string;
}

export interface ColumnVisibility {
    id: string; // The storage key (e.g., 'column-visibility-erc')
    visibility: Record<string, boolean>;
}

export interface AppState {
    id: string; // key
    value: any;
}

// --- Database Definition ---

export class AppDatabase extends Dexie {
    appState!: EntityTable<AppState, 'id'>;
    columnVisibility!: EntityTable<ColumnVisibility, 'id'>;
    graphqlHistory!: EntityTable<GraphqlHistoryItem, 'id'>;
    odataHistory!: EntityTable<ODataHistoryItem, 'id'>;
    restHistory!: EntityTable<RestHistoryItem, 'id'>;

    constructor() {
        super('ObjectVisualizerDB');

        this.version(1).stores({
            appState: 'id',
            columnVisibility: 'id',
            graphqlHistory: 'id, url, executedAt, status, name',
            odataHistory:
                'id, endpoint, externalReferenceCode, executedAt, status, name',
            restHistory: 'id, url, method, executedAt, status, name',
        });
    }
}

export const db = new AppDatabase();
