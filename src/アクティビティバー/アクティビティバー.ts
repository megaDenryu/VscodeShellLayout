import { div, span, DivC, LV2HtmlComponentBase } from "sengen-ui";
import type { HtmlComponentChild } from "sengen-ui/SengenBase/HtmlComponentBase";
import * as styles from './style.css';
import { 項目状態 } from './style.css';
import { 設定アイコン } from '../アイコン/アイコン定義';
import type { アクティビティID } from './アクティビティID';

export interface アクティビティ項目 {
    id: アクティビティID;
    ラベル: string;
    // Why: HtmlComponentChild = HtmlComponentBase | SvgC | MathC
    // SVGアイコンもHTMLアイコンもchilds()に渡せる共通型
    アイコン: (size: number, color: string) => HtmlComponentChild;
}

export interface Iアクティビティバーイベント {
    on選択: (id: アクティビティID) => void;
}

// =============================================================================
// 純粋関数コンポーネント群
// =============================================================================

function 項目View(該当項目: アクティビティ項目, on選択: () => void): DivC {
    return (
        div({ class: styles.項目 })
            .setAttribute(項目状態.attribute, 項目状態.value.inactive)
            .childs([
                該当項目.アイコン(20, 'currentColor'),
                span({ text: 該当項目.ラベル, class: styles.項目ラベル })])
            .addTypedEventListener('click', on選択)
    );
}

function 設定ボタンView(on設定: () => void): DivC {
    return (
        div({ class: styles.項目 }).childs([
            設定アイコン(18, 'currentColor'),
            span({ text: "設定", class: styles.項目ラベル })])
            .addTypedEventListener('click', on設定)
    );
}

// =============================================================================
// Orchestrator
// =============================================================================

export class アクティビティバー extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;
    private _項目要素一覧: DivC[] = [];
    private _選択中ID: アクティビティID | null = null;
    private _イベント: Iアクティビティバーイベント | null = null;
    private _on設定: (() => void) | null = null;

    constructor(private 項目一覧: アクティビティ項目[]) {
        super();
        this._componentRoot = this.createComponentRoot();
        if (this.項目一覧.length > 0) {
            this.選択する(this.項目一覧[0].id);
        }
    }

    private createComponentRoot(): DivC {
        return (
            div({ class: styles.バー }).childs([
                div({ class: styles.項目群 }).childs(
                    this.項目一覧.map((該当項目) => {
                        const 要素 = 項目View(該当項目, () => this.選択する(該当項目.id));
                        this._項目要素一覧.push(要素);
                        return 要素;
                    })),
                div({ class: styles.下部 }).child(
                    設定ボタンView(() => this._on設定?.()))])
        );
    }

    イベントを設定する(イベント: Iアクティビティバーイベント): void {
        this._イベント = イベント;
    }

    on設定クリック(コールバック: () => void): void {
        this._on設定 = コールバック;
    }

    選択する(id: アクティビティID): void {
        this._選択中ID = id;
        this._項目要素一覧.forEach((要素, i) => {
            const isActive = this.項目一覧[i].id === id;
            要素.setAttribute(
                項目状態.attribute,
                isActive ? 項目状態.value.active : 項目状態.value.inactive,
            );
        });
        this._イベント?.on選択(id);
    }
}
