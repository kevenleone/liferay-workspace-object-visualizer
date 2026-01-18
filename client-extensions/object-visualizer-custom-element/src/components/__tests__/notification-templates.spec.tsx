import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TemplatesList } from '../notification-templates';

// Mock dependencies
vi.mock('@tanstack/react-router', () => ({
    useNavigate: vi.fn(() => vi.fn()),
    useRouteContext: vi.fn(() => ({ shadowRoot: null })),
}));

vi.mock('@/hooks/use-variables', () => ({
    useVariablesFlat: vi.fn(() => ({ replaceVariables: vi.fn((text) => text) })),
}));

const mockTemplates = [
    {
        externalReferenceCode: 'erc1',
        id: 1,
        name: 'Template 1',
        recipients: [{ name: 'user1' }],
        subject: { en_US: 'Subject 1' },
    },
] as any;

describe('TemplatesList', () => {
    it('should render templates list', () => {
        render(
            <TemplatesList
                templates={mockTemplates}
                onDeleteTemplate={() => {}}
                onDuplicateTemplate={() => {}}
            />
        );

        expect(screen.getByText('Template 1')).toBeInTheDocument();
        expect(screen.getByText('Subject 1')).toBeInTheDocument();
    });
});