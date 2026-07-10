import { div, DivC, LV2HtmlComponentBase } from "sengen-ui";
import type { HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { 外殻ViewRoot } from './外殻View';
import { 表示状態 } from './表示状態';
import { アクティビティバー, type アクティビティ項目 } from '../アクティビティバー/アクティビティバー';
import type { アクティビティID } from '../アクティビティバー/アクティビティID';
import { メニューバー } from '../メニューバー/メニューバー';
import { エディタエリア } from '../エディタエリア/エディタエリア';
import { パネルエリア } from '../パネルエリア/パネルエリア';
import { ステータスバー } from '../ステータスバー/ステータスバー';
import { スプリッター } from '../スプリッター/スプリッター';
import type { テーマ配色 } from '../テーマ/テーマ型';
import type { タブ項目 } from '../エディタエリア/タブバー';

// =============================================================================
// 使い方
// =============================================================================
//
// VSCodeライクなレイアウト（メニューバー / アクティビティバー / エディタエリア /
// パネル / 右サイドバー / ステータスバー）を一括で提供する LV2 Orchestrator。
//
// 基本的な使い方:
//
//   const シェル = new 外殻レイアウト({
//       タイトル: "アプリ名",
//       アクティビティ項目一覧: [
//           { id: アクティビティID("..."), ラベル: "...", アイコン: ... },
//           ...
//       ],
//       右サイドバー内容: サイドバーコンポーネント,
//       ステータスバー左: タイトルセレクタ,
//       ステータスバー右テキスト: "アプリ名",
//   });
//   document.body.appendChild(シェル.dom.element);
//
// スロットの注入は全てコンストラクタオプションで行う。
// `右サイドバーを取得する()` のような取得APIは廃止した（外部が late-mutate で
// スロットを書き換えるアンチパターンを防ぐため）。
//
// タブの追加・選択・イベント購読はタブAPIメソッドを通じて行う:
//   シェル.タブを追加する("id", "ラベル", コンポーネント)
//   シェル.タブを選択する("id")
//   シェル.onタブイベント({ onタブ選択: ..., onタブ閉じる: ... })
//
// アクティビティバーの選択通知:
//   シェル.onアクティビティ選択(id => { ... })  // id は アクティビティID
//
// 設定ボタン（アクティビティバー下部）の通知:
//   シェル.on設定クリック(() => { ... })
//
// Orchestrator の配線パターン（推奨）:
//
//   export class アプリシェル extends LV2HtmlComponentBase {
//       protected _componentRoot: 外殻レイアウト;
//       constructor() {
//           super();
//           this._componentRoot = this.createComponentRoot();
//           this._タブ管理器 = new タブ管理(this._componentRoot);
//           this._購読を配線する();
//       }
//       protected createComponentRoot(): 外殻レイアウト {
//           return new 外殻レイアウト({ ... 全スロットをここで渡す ... });
//       }
//   }
//
// 外殻レイアウトは ID を全て string で扱う汎用シェル。
// 呼び出し側のドメイン固有ID（モードIDやタブ種別等）は、呼び出し側が
// 文字列との変換責任を持つ。シェル自身はドメインを知らない。

export interface 外殻レイアウトオプション {
    テーマ?: Partial<テーマ配色>;
    タイトル: string;
    アクティビティ項目一覧: アクティビティ項目[];
    パネルタブ一覧?: タブ項目[];
    右サイドバー有効?: boolean;
    パネル初期表示?: boolean;
    // スロット内容の宣言的注入。呼び出し側はこれらを渡すだけで、
    // 取得→後から子要素追加のような手続き的な late-mutate が不要になる。
    右サイドバー内容?: HtmlComponentBase;
    ステータスバー左?: HtmlComponentBase;
    ステータスバー右テキスト?: string;
}

// =============================================================================
// Orchestrator
// =============================================================================

export class 外殻レイアウト extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    private _アクティビティバー: アクティビティバー;
    private _エディタエリア: エディタエリア;
    private _パネルエリア: パネルエリア;
    private _ステータスバー: ステータスバー;
    private _右サイドバー: DivC;
    private _メインエリア: DivC | null = null;
    private _パネル表示中: boolean;
    private _サイドバー表示中: boolean;

    constructor(オプション: 外殻レイアウトオプション) {
        super();

        this._サイドバー表示中 = オプション.右サイドバー有効 ?? false;
        this._パネル表示中 = オプション.パネル初期表示 ?? true;

        this._アクティビティバー = new アクティビティバー(オプション.アクティビティ項目一覧);
        this._エディタエリア = new エディタエリア();
        this._パネルエリア = new パネルエリア(オプション.パネルタブ一覧 ?? [])
            .setAttributeIf({
                If: !this._パネル表示中,
                True: { attr: 表示状態.attribute, value: 表示状態.value.collapsed },
            });
        this._ステータスバー = new ステータスバー();
        if (オプション.ステータスバー左) {
            this._ステータスバー.左にコンポーネントを追加する(オプション.ステータスバー左);
        }
        if (オプション.ステータスバー右テキスト !== undefined) {
            this._ステータスバー.右にテキストを追加する(オプション.ステータスバー右テキスト);
        }
        this._右サイドバー = div({ class: styles.右サイドバー })
            .setAttributeIf({
                If: !this._サイドバー表示中,
                True: { attr: 表示状態.attribute, value: 表示状態.value.collapsed },
            });
        if (オプション.右サイドバー内容) {
            this._右サイドバー.child(オプション.右サイドバー内容);
        }

        const パネルスプリッター = new スプリッター('水平', {
            onリサイズ中: (delta) => this._パネルエリア.高さを変更する(delta),
        });
        const サイドバースプリッター = new スプリッター('垂直', {
            onリサイズ中: (delta) => this.サイドバー幅を変更する(delta),
        });
        const メニュー = new メニューバー(オプション.タイトル, {
            onサイドバートグル: () => this.サイドバーを切替する(),
            onパネルトグル: () => this.パネルを切替する(),
        });

        this._componentRoot = 外殻ViewRoot({
            メニューバー: メニュー,
            アクティビティバー: this._アクティビティバー,
            エディタエリア: this._エディタエリア,
            パネルスプリッター,
            パネルエリア: this._パネルエリア,
            サイドバースプリッター,
            右サイドバー: this._右サイドバー,
            ステータスバー: this._ステータスバー,
            メインエリア参照: (el) => { this._メインエリア = el; },
        });
    }

    // =========================================================================
    // タブ管理API
    // =========================================================================

    タブを追加する(id: string, ラベル: string, コンテンツ: HtmlComponentBase): void {
        this._エディタエリア.タブを追加する(id, ラベル, コンテンツ);
    }

    基準タブを基準に分割追加する(
        基準タブid: string,
        方向: "左" | "右" | "上" | "下",
        id: string,
        ラベル: string,
        コンテンツ: HtmlComponentBase,
    ): void {
        this._エディタエリア.基準タブを基準に分割追加する(基準タブid, 方向, id, ラベル, コンテンツ);
    }

    タブを選択する(id: string): void {
        this._エディタエリア.タブを選択する(id);
    }

    タブが存在するか(id: string): boolean {
        return this._エディタエリア.タブが存在するか(id);
    }

    onタブ選択(コールバック: (id: string) => void): void {
        this._エディタエリア.イベントを設定する({
            onタブ選択: コールバック,
            onタブ閉じる: () => {},
        });
    }

    onタブイベント(イベント: { onタブ選択: (id: string) => void; onタブ閉じる: (id: string) => void }): void {
        this._エディタエリア.イベントを設定する(イベント);
    }

    // =========================================================================
    // アクティビティバーAPI
    // =========================================================================

    onアクティビティ選択(コールバック: (id: アクティビティID) => void): void {
        this._アクティビティバー.イベントを設定する({ on選択: コールバック });
    }

    on設定クリック(コールバック: () => void): void {
        this._アクティビティバー.on設定クリック(コールバック);
    }

    // =========================================================================
    // 内部操作（メニューバーからのトグル用）
    // =========================================================================

    private サイドバーを切替する(): void {
        this._サイドバー表示中 = !this._サイドバー表示中;
        this._右サイドバー.toggleAttribute(
            表示状態.attribute,
            !this._サイドバー表示中,
            表示状態.value.collapsed,
        );
    }

    private パネルを切替する(): void {
        this._パネル表示中 = !this._パネル表示中;
        this._パネルエリア.toggleAttribute(
            表示状態.attribute,
            !this._パネル表示中,
            表示状態.value.collapsed,
        );
    }

    private サイドバー幅を変更する(delta: number): void {
        const 現在幅 = this._右サイドバー.dom.element.offsetWidth;
        const 新幅 = Math.max(150, Math.min(600, 現在幅 - delta));
        this._右サイドバー.setStyleCSS({ width: `${新幅}px` });
    }
}
