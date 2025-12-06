import styles from '../index.css?inline';

const tailwindStyleSheet = new CSSStyleSheet();

function replaceStyle(style: string) {
    return style.replaceAll(':root', ':host');
}

tailwindStyleSheet.replaceSync(replaceStyle(styles));

if (import.meta.hot) {
    import.meta.hot.accept('../index.css?inline', (newModule) => {
        const _styles = newModule!.default;

        tailwindStyleSheet.replaceSync(replaceStyle(_styles));
    });
}

export default tailwindStyleSheet;
