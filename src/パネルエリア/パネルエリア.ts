import { div, DivC, LV2部品集約Base } from "sengen-ui";
import * as styles from './style.css';
import { パネルエリア部品 } from './パネルエリア部品';
import type { タブ項目 } from './タブストリップ';

// =============================================================================
// Orchestrator（LV2部品集約: 子にLV2部品（タブストリップ）を含むため）
// =============================================================================

export class パネルエリア extends LV2部品集約Base<パネルエリア部品> {
    protected _componentRoot: DivC;
    private readonly _部品: パネルエリア部品;
    private _選択中ID: string | null = null;

    constructor(タブ一覧: タブ項目[]) {
        super();
        this._部品 = パネルエリア部品.作る(タブ一覧);
        this._componentRoot = this._ルートを構築する(this._部品);
        if (タブ一覧.length > 0) {
            this.タブを選択する(タブ一覧[0].id);
        }
    }

    protected _ルートを構築する(部品: パネルエリア部品): DivC {
        return (
            div({ class: styles.エリア })
                .setStyleCSS({ height: '200px' })
                .childs([
                    部品.タブストリップ.配線する({
                        on選択: (id) => this.タブを選択する(id),
                    }),
                    部品.コンテンツ])
        );
    }

    タブを選択する(id: string): void {
        this._選択中ID = id;
        this._部品.タブストリップ.選択する(id);
    }

    コンテンツを取得する(): DivC {
        return this._部品.コンテンツ;
    }

    高さを変更する(delta: number): void {
        const 現在高さ = this._componentRoot.dom.element.offsetHeight;
        const 新高さ = Math.max(100, Math.min(600, 現在高さ - delta));
        this._componentRoot.setStyleCSS({ height: `${新高さ}px` });
    }
}
