import { div, span, button, DivC, LV2HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { サイドバーアイコン, パネルアイコン } from '../アイコン/アイコン定義';

export interface Iメニューバーイベント {
    onサイドバートグル: () => void;
    onパネルトグル: () => void;
}

// =============================================================================
// Orchestrator（LV2素部品: LV1のみの単純な複合なので構築はクラス内に閉じる）
// =============================================================================

export class メニューバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    constructor(
        private タイトル: string,
        private イベント: Iメニューバーイベント,
        private トグルボタン表示: boolean = true,
    ) {
        super();
        this._componentRoot = this._ルートを構築する(タイトル, イベント, トグルボタン表示);
    }

    private _ルートを構築する(タイトル: string, イベント: Iメニューバーイベント, トグルボタン表示: boolean): DivC {
        return (
            div({ class: styles.バー })
                .child(span({ text: タイトル, class: styles.タイトル }))
                .childIf({
                    If: トグルボタン表示,
                    True: () => div({ class: styles.右ボタン群 }).childs([
                        button({ class: styles.トグルボタン })
                            .child(パネルアイコン(16, 'currentColor'))
                            .onClick(() => イベント.onパネルトグル()),
                        button({ class: styles.トグルボタン })
                            .child(サイドバーアイコン(16, 'currentColor'))
                            .onClick(() => イベント.onサイドバートグル())]),
                })
        );
    }
}
