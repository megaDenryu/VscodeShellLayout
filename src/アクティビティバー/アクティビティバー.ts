import { div, DivC, LV2HtmlComponentBase } from "sengen-ui";
import type { HtmlComponentChild } from "sengen-ui/SengenBase/HtmlComponentBase";
import * as styles from './style.css';
import type { アクティビティID } from './アクティビティID';
import { アクティビティ項目ボタン } from './アクティビティ項目ボタン';
import { 設定ボタン } from './設定ボタン';

export interface アクティビティ項目 {
    id: アクティビティID;
    ラベル: string;
    // HtmlComponentChild = HtmlComponentBase | SvgC | MathC であり、
    // SVGアイコンもHTMLアイコンもchilds()に渡せる共通型
    アイコン: (size: number, color: string) => HtmlComponentChild;
}

export interface Iアクティビティバーイベント {
    on選択: (id: アクティビティID) => void;
}

// =============================================================================
// Orchestrator（LV2素部品: 子はLV1拡張のみで構成される）
// =============================================================================

export class アクティビティバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private readonly _項目ボタン一覧: アクティビティ項目ボタン[] = [];
    private _選択中ID: アクティビティID | null = null;
    private _イベント: Iアクティビティバーイベント | null = null;
    // 非推奨: on設定クリック の後方互換のためだけに残る。下部項目一覧を明示指定した
    // アプリではボタン自体が存在しなくなるため、登録しても発火しない。
    private _on設定: (() => void) | null = null;

    constructor(
        private readonly _項目一覧: アクティビティ項目[],
        // 未指定時は固定の設定ボタン（旧挙動）を表示する。明示指定すると完全に置き換わる。
        private readonly _下部項目一覧?: アクティビティ項目[],
    ) {
        super();
        this._componentRoot = this._ルートを構築する(this._項目一覧, this._下部項目一覧);
        if (this._項目一覧.length > 0) {
            this.選択する(this._項目一覧[0].id);
        }
    }

    private _ルートを構築する(項目一覧: アクティビティ項目[], 下部項目一覧: アクティビティ項目[] | undefined): DivC {
        return (
            div({ class: styles.バー }).childs([
                div({ class: styles.項目群 }).childs(
                    項目一覧.map(該当項目 =>
                        new アクティビティ項目ボタン(該当項目, () => this.選択する(該当項目.id))
                            .tap(要素 => { this._項目ボタン一覧.push(要素); }))),
                div({ class: styles.下部 }).childs(
                    下部項目一覧
                        ? 下部項目一覧.map(該当項目 =>
                              new アクティビティ項目ボタン(該当項目, () => this._イベント?.on選択(該当項目.id)))
                        : [new 設定ボタン(() => this._on設定?.())])])
        );
    }

    イベントを設定する(イベント: Iアクティビティバーイベント): void {
        this._イベント = イベント;
    }

    /** @deprecated アクティビティバー下部項目一覧 で下部ボタンを注入し、on選択(id) で受け取ること */
    on設定クリック(コールバック: () => void): void {
        this._on設定 = コールバック;
    }

    選択する(id: アクティビティID): void {
        this._選択中ID = id;
        this._項目ボタン一覧.forEach((要素, i) => {
            要素.アクティブ状態を設定する(this._項目一覧[i].id === id);
        });
        this._イベント?.on選択(id);
    }
}
