// 分割可能エディタエリア への薄い委譲ファサード。公開 API は単一タブストリップ時代と互換で、
// 既存呼び出し側 (アプリシェル / タブ管理 / 外殻レイアウト) を変更せずに DnD タブ + ペイン分割を提供する。

import { type HtmlComponentBase, LV2HtmlComponentBase } from "sengen-ui";
import { 分割可能エディタエリア } from "./ペイン木/分割可能エディタエリア";

export interface タブ項目 { id: string; ラベル: string }

export interface Iエディタイベント {
    onタブ選択: (id: string) => void;
    onタブ閉じる: (id: string) => void;
}

export class エディタエリア extends LV2HtmlComponentBase {
    // _componentRoot を 分割可能エディタエリア そのものにすることで、ラッパー div を挟まずに済む。
    protected _componentRoot: 分割可能エディタエリア;

    constructor(タブバーをウィンドウドラッグ領域にする = false) {
        super();
        this._componentRoot = new 分割可能エディタエリア(タブバーをウィンドウドラッグ領域にする);
    }

    イベントを設定する(イベント: Iエディタイベント): void {
        this._componentRoot.イベントを設定する(イベント);
    }

    タブを追加する(id: string, ラベル: string, コンテンツ: HtmlComponentBase): void {
        this._componentRoot.タブを追加する(id, ラベル, コンテンツ);
    }

    基準タブを基準に分割追加する(
        基準タブid: string,
        方向: "左" | "右" | "上" | "下",
        id: string,
        ラベル: string,
        コンテンツ: HtmlComponentBase,
    ): void {
        this._componentRoot.基準タブを基準に分割追加する(基準タブid, 方向, id, ラベル, コンテンツ);
    }

    タブを閉じる(id: string): void {
        this._componentRoot.タブを閉じる(id);
    }

    タブを選択する(id: string): void {
        this._componentRoot.タブを選択する(id);
    }

    タブが存在するか(id: string): boolean {
        return this._componentRoot.タブが存在するか(id);
    }

    タブ内ボタンを追加する(
        タブid: string,
        ボタンid: string,
        ラベル: string,
        onクリック: () => void,
    ): void {
        this._componentRoot.タブ内ボタンを追加する(タブid, ボタンid, ラベル, onクリック);
    }

    選択中タブID(): string | null {
        return this._componentRoot.選択中タブID();
    }

    dispose(): void {
        this._componentRoot.dispose();
    }
}
