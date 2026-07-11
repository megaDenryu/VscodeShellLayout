import { button, div, DivC, ButtonC, LV2HtmlComponentBase, 配線ポート } from "sengen-ui";
import type { I配線可能 } from "sengen-ui";
import * as styles from './style.css';
import { タブ状態 } from './style.css';

export interface タブ項目 {
    id: string;
    ラベル: string;
}

export interface Iタブストリップ配線 {
    on選択(id: string): void;
}

// LV2素部品: タブ一覧をボタン列として表示し、選択状態をdata-attributeで切り替える。
// パネルエリア専用の内部部品（パッケージ外には公開しない）なので配線ポートを自由に使える。
export class タブストリップ extends LV2HtmlComponentBase implements I配線可能<Iタブストリップ配線> {
    protected _componentRoot: DivC;
    private readonly _配線 = new 配線ポート<Iタブストリップ配線>("タブストリップ");
    private readonly _タブ要素マップ = new Map<string, ButtonC>();

    constructor(private readonly _タブ一覧: タブ項目[]) {
        super();
        this._componentRoot = this._ルートを構築する(this._タブ一覧);
    }

    配線する(配線: Iタブストリップ配線): this {
        this._配線.配線する(配線);
        return this;
    }

    private _ルートを構築する(タブ一覧: タブ項目[]): DivC {
        return (
            div({ class: styles.タブバー }).childs(
                タブ一覧.map(該当タブ =>
                    button({ text: 該当タブ.ラベル, class: styles.タブ })
                        .setAttribute(タブ状態.attribute, タブ状態.value.inactive)
                        .onClick(() => this._配線.先.on選択(該当タブ.id))
                        .tap(要素 => { this._タブ要素マップ.set(該当タブ.id, 要素); })))
        );
    }

    選択する(id: string): void {
        this._タブ要素マップ.forEach((要素, タブID) => {
            要素.setAttribute(
                タブ状態.attribute,
                タブID === id ? タブ状態.value.active : タブ状態.value.inactive,
            );
        });
    }
}
