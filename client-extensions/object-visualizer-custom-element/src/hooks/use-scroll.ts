import { useShadcnContext } from '@/context/ShadcnContextProvider';
import { useEffect } from 'react';

export default function useScrollUnlocked() {
    const { shadowRoot } = useShadcnContext();

    const rootElement = shadowRoot as unknown as Document;

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            if ((e.target as Element).closest('[data-scrollable]')) return;
            e.stopPropagation();
        };

        const handleTouchMove = (e: TouchEvent) => {
            if ((e.target as Element).closest('[data-scrollable]')) return;
            e.stopPropagation();
        };

        rootElement.addEventListener('wheel', handleWheel, true);
        rootElement.addEventListener('touchmove', handleTouchMove, true);

        return () => {
            rootElement.removeEventListener('wheel', handleWheel, true);
            rootElement.removeEventListener('touchmove', handleTouchMove, true);
        };
    }, [rootElement]);
}
