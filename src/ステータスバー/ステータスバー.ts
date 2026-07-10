import { div, span, DivC, LV2HtmlComponentBase } from "sengen-ui";
import type { HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';

// =============================================================================
// 純粋関数コンポーネント群
// =============================================================================

interface ステータスバーViewProps {
    左セクション: DivC;
    右セクション: DivC;
}

function ステータスバーView({ 左セクション, 右セクション }: ステータスバーViewProps): DivC {
    return (
        div({ class: styles.バー }).childs([
            左セクション,
            右セクション])
    );
}

// =============================================================================
// Orchestrator
// =============================================================================

export class ステータスバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _左セクション: DivC;
    private _右セクション: DivC;

    constructor() {
        super();
        this._左セクション = div({ class: styles.セクション });
        this._右セクション = div({ class: styles.セクション });
        this._componentRoot = ステータスバーView({
            左セクション: this._左セクション,
            右セクション: this._右セクション,
        });
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
