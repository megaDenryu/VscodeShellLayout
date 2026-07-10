import { div, DivC, ButtonC, LV2HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { タブ状態 } from './style.css';
import { タブバーView, type タブ項目 } from '../エディタエリア/タブバー';

// =============================================================================
// Orchestrator
// =============================================================================

export class パネルエリア extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _タブ要素マップ = new Map<string, ButtonC>();
    private _コンテンツ: DivC;
    private _選択中ID: string | null = null;

    constructor(private タブ一覧: タブ項目[]) {
        super();
        this._コンテンツ = div({ class: styles.コンテンツ });
        this._componentRoot = this.createComponentRoot();
        if (this.タブ一覧.length > 0) {
            this.タブを選択する(this.タブ一覧[0].id);
        }
    }

    private createComponentRoot(): DivC {
        return (
            div({ class: styles.エリア })
                .setStyleCSS({ height: '200px' })
                .childs([
                    タブバーView(
                        this.タブ一覧,
                        styles.タブバー,
                        styles.タブ,
                        タブ状態,
                        (id) => this.タブを選択する(id),
                        (id, 要素) => this._タブ要素マップ.set(id, 要素),
                    ),
                    this._コンテンツ])
        );
    }

    タブを選択する(id: string): void {
        this._選択中ID = id;
        this._タブ要素マップ.forEach((要素, タブID) => {
            要素.setAttribute(
                タブ状態.attribute,
                タブID === id ? タブ状態.value.active : タブ状態.value.inactive,
            );
        });
    }

    コンテンツを取得する(): DivC {
        return this._コンテンツ;
    }

    高さを変更する(delta: number): void {
        const 現在高さ = this._componentRoot.dom.element.offsetHeight;
        const 新高さ = Math.max(100, Math.min(600, 現在高さ - delta));
        this._componentRoot.setStyleCSS({ height: `${新高さ}px` });
    }
}
