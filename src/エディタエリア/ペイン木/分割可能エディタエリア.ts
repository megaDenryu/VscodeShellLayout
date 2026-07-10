// LV2 オーケストレータ: ペイン木の純データ管理と DOM 同期の指揮のみを担う。
// 入力系副作用 (DnD / スプリッター / document リスナ / querySelector) は ペイン木入力配線 に委譲する。
// 公開 API は 既存 エディタエリア.ts と互換。

import { div, type DivC, type HtmlComponentBase, LV2HtmlComponentBase } from "sengen-ui";
import {
    タブIDを作る, ペインIDを作る,
    空レイアウト,
    type レイアウト, type タブID, type ペインID, type タブ定義,
} from "./レイアウト型";
import { 適用, 木の全ペイン, タブを持つペインを探す } from "./レイアウト操作";
import {
    ペイン木をDOMに同期,
    type DOM同期コンテキスト,
} from "./DOM同期";
import { ペイン木入力配線 } from "./ペイン木入力配線";
import { ペインID採番器 } from "./ID採番器";
import * as styles from "./style.css";

export interface I分割可能エディタイベント {
    onタブ選択: (id: string) => void;
    onタブ閉じる: (id: string) => void;
}

export class 分割可能エディタエリア extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    private readonly _メイン領域: DivC;

    private readonly _ルートID: ペインID;
    private _レイアウト: レイアウト;
    private readonly _コンテンツ管理 = new Map<タブID, HtmlComponentBase>();
    private _イベント: I分割可能エディタイベント | null = null;

    private readonly _入力配線: ペイン木入力配線;
    private readonly _新タブ群ID採番器 = new ペインID採番器("tabs", 1);
    private readonly _分割ID採番器 = new ペインID採番器("split", 0);

    constructor() {
        super();
        this._ルートID = ペインIDを作る("main-root");
        this._レイアウト = 空レイアウト(this._ルートID);

        this._メイン領域 = div({ class: styles.ルート });
        this._componentRoot = div({ class: styles.ルート }).child(this._メイン領域);

        this._入力配線 = new ペイン木入力配線(
            this._メイン領域,
            {
                現在のレイアウトを取得: () => this._レイアウト,
                レイアウトを更新: (新) => { this._レイアウト = 新; },
                再描画: () => this._再描画(),
            },
        );

        this._再描画();
    }

    // =========================================================================
    // 公開 API
    // =========================================================================

    タブを追加する(id: string, ラベル: string, コンテンツ: HtmlComponentBase): void {
        const タブID値 = タブIDを作る(id);
        if (this._コンテンツ管理.has(タブID値)) {
            this.タブを選択する(id);
            return;
        }
        this._コンテンツ管理.set(タブID値, コンテンツ);
        const 新タブ: タブ定義 = { id: タブID値, ラベル, 閉じれる: true };
        const 配置先ペイン = this._最初のタブ群ペインID();
        const 追加結果 = 適用(this._レイアウト, {
            kind: "タブ追加", タブ: 新タブ, 配置先ペイン,
        });
        if (追加結果.kind !== "成功") return;
        this._レイアウト = 追加結果.新レイアウト;
        // 既存挙動互換: 追加直後に必ず選択する。
        const 選択結果 = 適用(this._レイアウト, { kind: "タブ選択", タブ: 新タブ.id });
        if (選択結果.kind === "成功") this._レイアウト = 選択結果.新レイアウト;
        this._再描画();
        this._イベント?.onタブ選択(id);
    }

    基準タブを基準に分割追加する(
        基準タブid: string,
        方向: "左" | "右" | "上" | "下",
        id: string,
        ラベル: string,
        コンテンツ: HtmlComponentBase,
    ): void {
        const タブID値 = タブIDを作る(id);
        if (this._コンテンツ管理.has(タブID値)) {
            this.タブを選択する(id);
            return;
        }
        const 基準タブID値 = タブIDを作る(基準タブid);
        const 選択中ペイン = タブを持つペインを探す(this._レイアウト.メインペイン, 基準タブID値);
        if (選択中ペイン === null) {
            this.タブを追加する(id, ラベル, コンテンツ);
            return;
        }

        this._コンテンツ管理.set(タブID値, コンテンツ);
        const 新タブ: タブ定義 = { id: タブID値, ラベル, 閉じれる: true };
        const 追加結果 = 適用(this._レイアウト, {
            kind: "タブ追加",
            タブ: 新タブ,
            配置先ペイン: 選択中ペイン.id,
        });
        if (追加結果.kind !== "成功") {
            this._コンテンツ管理.delete(タブID値);
            return;
        }
        const 分割結果 = 適用(追加結果.新レイアウト, {
            kind: "タブ→新ペイン分割",
            タブ: 新タブ.id,
            分割対象: 選択中ペイン.id,
            方向,
            新タブ群ペインID: this._新タブ群ID採番器.発行(),
            新分割ペインID: this._分割ID採番器.発行(),
        });
        if (分割結果.kind !== "成功") {
            this._コンテンツ管理.delete(タブID値);
            return;
        }
        this._レイアウト = 分割結果.新レイアウト;
        this._再描画();
        this._イベント?.onタブ選択(id);
    }

    タブを閉じる(id: string): void {
        const タブID値 = タブIDを作る(id);
        if (!this._コンテンツ管理.has(タブID値)) return;
        const 結果 = 適用(this._レイアウト, { kind: "タブ閉じる", タブ: タブID値 });
        if (結果.kind === "成功") {
            this._レイアウト = 結果.新レイアウト;
            this._コンテンツ管理.delete(タブID値);
            this._再描画();
            this._イベント?.onタブ閉じる(id);
            const 新選択 = this.選択中タブID();
            if (新選択 !== null) this._イベント?.onタブ選択(新選択);
        }
    }

    タブを選択する(id: string): void {
        const タブID値 = タブIDを作る(id);
        const 結果 = 適用(this._レイアウト, { kind: "タブ選択", タブ: タブID値 });
        if (結果.kind === "成功") {
            this._レイアウト = 結果.新レイアウト;
            this._再描画();
            this._イベント?.onタブ選択(id);
        }
    }

    タブが存在するか(id: string): boolean {
        return this._コンテンツ管理.has(タブIDを作る(id));
    }

    イベントを設定する(イベント: I分割可能エディタイベント): void {
        this._イベント = イベント;
    }

    選択中タブID(): string | null {
        // 複数タブ群のうちどれが「アクティブな選択」かは現状未定義のため、
        // 深さ優先で最初に見つかった選択中タブを返す。
        for (const ペイン of 木の全ペイン(this._レイアウト.メインペイン)) {
            if (ペイン.kind === "タブ群" && ペイン.選択中 !== null) {
                return ペイン.選択中;
            }
        }
        return null;
    }

    // =========================================================================
    // 内部
    // =========================================================================

    private _最初のタブ群ペインID(): ペインID {
        for (const ペイン of 木の全ペイン(this._レイアウト.メインペイン)) {
            if (ペイン.kind === "タブ群") return ペイン.id;
        }
        return this._ルートID;
    }

    private _再描画(): void {
        ペイン木をDOMに同期(this._メイン領域, this._レイアウト.メインペイン, this._DOM同期コンテキスト());
    }

    private _DOM同期コンテキスト(): DOM同期コンテキスト {
        return {
            コンテンツ取得: タブ => this._コンテンツ管理.get(タブ) ?? null,
            タブクリック: タブ => this.タブを選択する(タブ),
            タブ閉じるクリック: タブ => this.タブを閉じる(タブ),
            DnD押下: (タブ, 座標) => this._入力配線.DnD押下処理(タブ, 座標),
            直前にドラッグした: () => this._入力配線.直前にドラッグしたか(),
            スプリッター押下: (分割ペイン, 方向, 開始座標) =>
                this._入力配線.スプリッター押下処理(分割ペイン, 方向, 開始座標),
        };
    }

    dispose(): void {
        this._入力配線.dispose();
        // コンテンツ実体は外部所有 (タブを追加する で渡されたもの)、ここでは dispose しない。
        this._コンテンツ管理.clear();
    }
}

// TODO(W-149-A3-active-pane): 選択中タブID() は深さ優先で最初に見つかった選択中タブを返すだけで、
// 複数ペイン分割後に「最後に操作したアクティブペイン」とずれる。
// 複数ペイン使用が常態化したら「アクティブペインID」フィールドで保持する形に拡張する。
