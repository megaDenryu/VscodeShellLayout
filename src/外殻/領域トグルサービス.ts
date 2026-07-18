import type { DivC } from "sengen-ui";
import { 表示状態 } from './表示状態';
import type { パネルエリア } from '../パネルエリア/パネルエリア';
import type { Iレイアウトトグル操作 } from './レイアウトトグル操作';

// サイドバー/パネルの表示中フラグと、それに連動するdata-attribute切り替えを1箇所に集約する。
// メニューバー内蔵ボタン・独立トグルボタン（サイドバートグルボタン/パネルトグルボタン）は
// いずれもこのサービスを経由して操作するため、表示状態の食い違いが起きない。
export class 領域トグルサービス implements Iレイアウトトグル操作 {
    private _サイドバー表示中: boolean;
    private _サイドバー表示希望: boolean;
    private _サイドバー利用可能 = true;
    private _パネル表示中: boolean;

    constructor(
        private readonly _サイドバー: DivC,
        private readonly _パネル: パネルエリア,
        サイドバー初期表示: boolean,
        パネル初期表示: boolean,
    ) {
        this._サイドバー表示中 = サイドバー初期表示;
        this._サイドバー表示希望 = サイドバー初期表示;
        this._パネル表示中 = パネル初期表示;
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
}
