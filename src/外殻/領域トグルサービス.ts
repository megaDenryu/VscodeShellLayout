import type { DivC } from "sengen-ui";
import { 表示状態 } from './表示状態';
import type { パネルエリア } from '../パネルエリア/パネルエリア';
import type { スプリッター } from '../スプリッター/スプリッター';
import type { Iレイアウトトグル操作 } from './レイアウトトグル操作';

// サイドバー/パネル/左サイドバーの表示中フラグと、それに連動するdata-attribute切り替えを1箇所に集約する。
// メニューバー内蔵ボタン・独立トグルボタン（サイドバートグルボタン/パネルトグルボタン）は
// いずれもこのサービスを経由して操作するため、表示状態の食い違いが起きない。
export class 領域トグルサービス implements Iレイアウトトグル操作 {
    private _サイドバー表示中: boolean;
    private _サイドバー表示希望: boolean;
    private _サイドバー利用可能 = true;
    private _パネル表示中: boolean;
    private _左サイドバー表示中: boolean;
    private _左サイドバー表示希望: boolean;
    private _左サイドバー利用可能 = true;

    constructor(
        private readonly _サイドバー: DivC,
        private readonly _パネル: パネルエリア,
        サイドバー初期表示: boolean,
        パネル初期表示: boolean,
        private readonly _左サイドバー?: DivC,
        左サイドバー初期表示: boolean = false,
        private readonly _左サイドバースプリッター?: スプリッター,
    ) {
        this._サイドバー表示中 = サイドバー初期表示;
        this._サイドバー表示希望 = サイドバー初期表示;
        this._パネル表示中 = パネル初期表示;
        this._左サイドバー表示中 = 左サイドバー初期表示;
        this._左サイドバー表示希望 = 左サイドバー初期表示;
    }

    サイドバーを切り替える(): void {
        if (!this._サイドバー利用可能) return;
        this._サイドバー表示中 = !this._サイドバー表示中;
        this._サイドバー表示希望 = this._サイドバー表示中;
        this._サイドバー.toggleAttribute(表示状態.attribute, !this._サイドバー表示中, 表示状態.value.collapsed);
    }

    サイドバー利用可能を設定する(利用可能: boolean): void {
        this._サイドバー利用可能 = 利用可能;
        this._サイドバー表示中 = 利用可能 && this._サイドバー表示希望;
        this._サイドバー.toggleAttribute(表示状態.attribute, !this._サイドバー表示中, 表示状態.value.collapsed);
    }

    パネルを切り替える(): void {
        this._パネル表示中 = !this._パネル表示中;
        this._パネル.toggleAttribute(表示状態.attribute, !this._パネル表示中, 表示状態.value.collapsed);
    }

    左サイドバーを切り替える(): void {
        if (!this._左サイドバー || !this._左サイドバー利用可能) return;
        this._左サイドバー表示中 = !this._左サイドバー表示中;
        this._左サイドバー表示希望 = this._左サイドバー表示中;
        this._左サイドバー.toggleAttribute(表示状態.attribute, !this._左サイドバー表示中, 表示状態.value.collapsed);
        this._左サイドバースプリッター?.toggleAttribute(表示状態.attribute, !this._左サイドバー表示中, 表示状態.value.collapsed);
    }

    左サイドバーを開く(): void {
        if (!this._左サイドバー || !this._左サイドバー利用可能) return;
        this._左サイドバー表示中 = true;
        this._左サイドバー表示希望 = true;
        this._左サイドバー.toggleAttribute(表示状態.attribute, false, 表示状態.value.collapsed);
        this._左サイドバースプリッター?.toggleAttribute(表示状態.attribute, false, 表示状態.value.collapsed);
    }

    左サイドバーを閉じる(): void {
        if (!this._左サイドバー) return;
        this._左サイドバー表示中 = false;
        this._左サイドバー表示希望 = false;
        this._左サイドバー.toggleAttribute(表示状態.attribute, true, 表示状態.value.collapsed);
        this._左サイドバースプリッター?.toggleAttribute(表示状態.attribute, true, 表示状態.value.collapsed);
    }

    左サイドバー表示中か(): boolean {
        return this._左サイドバー表示中;
    }

    左サイドバー利用可能を設定する(利用可能: boolean): void {
        if (!this._左サイドバー) return;
        this._左サイドバー利用可能 = 利用可能;
        this._左サイドバー表示中 = 利用可能 && this._左サイドバー表示希望;
        this._左サイドバー.toggleAttribute(表示状態.attribute, !this._左サイドバー表示中, 表示状態.value.collapsed);
        this._左サイドバースプリッター?.toggleAttribute(表示状態.attribute, !this._左サイドバー表示中, 表示状態.value.collapsed);
    }
}
