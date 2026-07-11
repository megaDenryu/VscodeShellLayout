import { div, span, DivC, LV2HtmlComponentBase } from "sengen-ui";
import type { HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';

// =============================================================================
// Orchestrator（LV2素部品: LV1のみの単純な複合なので構築はクラス内に閉じる）
// =============================================================================

export class ステータスバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _左セクション!: DivC;
    private _右セクション!: DivC;

    constructor() {
        super();
        this._componentRoot = this._ルートを構築する();
    }

    private _ルートを構築する(): DivC {
        return (
            div({ class: styles.バー }).childs([
                div({ class: styles.セクション }).tap(d => { this._左セクション = d; }),
                div({ class: styles.セクション }).tap(d => { this._右セクション = d; })])
        );
    }

    左にテキストを追加する(テキスト: string): this {
        this._左セクション.child(span({ text: テキスト, class: styles.テキスト }));
        return this;
    }

    右にテキストを追加する(テキスト: string): this {
        this._右セクション.child(span({ text: テキスト, class: styles.テキスト }));
        return this;
    }

    左にコンポーネントを追加する(コンポーネント: HtmlComponentBase): this {
        this._左セクション.child(コンポーネント);
        return this;
    }

    右にコンポーネントを追加する(コンポーネント: HtmlComponentBase): this {
        this._右セクション.child(コンポーネント);
        return this;
    }
}
