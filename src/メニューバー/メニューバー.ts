import { div, span, button, DivC, LV2HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { サイドバーアイコン, パネルアイコン } from '../アイコン/アイコン定義';

export interface Iメニューバーイベント {
    onサイドバートグル: () => void;
    onパネルトグル: () => void;
}

// =============================================================================
// 純粋関数コンポーネント群
// =============================================================================

interface メニューバーProps {
    タイトル: string;
    イベント: Iメニューバーイベント;
}

function メニューバーView({ タイトル, イベント }: メニューバーProps): DivC {
    return (
        div({ class: styles.バー }).childs([
            span({ text: タイトル, class: styles.タイトル }),
            div({ class: styles.右ボタン群 }).childs([
                button({ class: styles.トグルボタン })
                    .child(パネルアイコン(16, 'currentColor'))
                    .onClick(() => イベント.onパネルトグル()),
                button({ class: styles.トグルボタン })
                    .child(サイドバーアイコン(16, 'currentColor'))
                    .onClick(() => イベント.onサイドバートグル())])])
    );
}

// =============================================================================
// Orchestrator
// =============================================================================

export class メニューバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    constructor(
        タイトル: string,
        private イベント: Iメニューバーイベント,
    ) {
        super();
        this._componentRoot = メニューバーView({ タイトル, イベント: this.イベント });
    }
}
