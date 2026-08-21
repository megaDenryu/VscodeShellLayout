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
    ペイン木DOM同期,
    タブID属性,
    type DOM同期コンテキスト,
} from "./DOM同期";
import type { タブ内ボタン定義 } from "./タブボタン";
import { ペイン木入力配線 } from "./ペイン木入力配線";
import { ペインID採番器 } from "./ID採番器";
import * as styles from "./style.css";

export interface I分割可能エディタイベント {
    onタブ選択: (id: string) => void;
    onタブ閉じる: (id: string) => void;
}

// タブ内ボタン未設定のタブが毎回このインスタンスを共有して返す。
// `?? []` のように呼び出しのたびに新しい配列を作ると、DOM同期の「タブ内ボタン一覧の
// 参照が変わっていないか」という差分判定が常に「変わった」と誤検知し、無関係なタブでも
// 毎回タブバーを作り直すことになる(コンテンツの detach/reattach 自体は起きないが無駄な
// DOM 操作が発生する)。空配列を固定インスタンスにして参照比較を機能させる。
const 空タブ内ボタン一覧: readonly タブ内ボタン定義[] = [];

export class 分割可能エディタエリア extends LV2HtmlComponentBase {
    protected _componentRoot: DivC;

    private readonly _メイン領域: DivC;

    private readonly _ルートID: ペインID;
    private _レイアウト: レイアウト;
    private readonly _コンテンツ管理 = new Map<タブID, HtmlComponentBase>();
    private readonly _タブ内ボタン管理 = new Map<タブID, タブ内ボタン定義[]>();
    private _イベント: I分割可能エディタイベント | null = null;

    private readonly _入力配線: ペイン木入力配線;
    private readonly _新タブ群ID採番器 = new ペインID採番器("tabs", 1);
    private readonly _分割ID採番器 = new ペインID採番器("split", 0);
    private readonly _DOM同期: ペイン木DOM同期;

    constructor(private readonly _タブバーをウィンドウドラッグ領域にする = false) {
        super();
        this._ルートID = ペインIDを作る("main-root");
        this._レイアウト = 空レイアウト(this._ルートID);

        this._メイン領域 = div({ class: styles.ルート });
        this._componentRoot = div({ class: styles.ルート }).child(this._メイン領域);
        // _DOM同期コンテキスト() が返す各コールバックは this を捕捉するだけで、
        // 呼び出し時点で確定済みの値は読まない(_入力配線 等はこの時点で未代入だが、
        // 実際に呼ばれるのはコンストラクタ完了後のため問題ない)。ここで一度構築して
        // ペイン木DOM同期 に渡し、以降の同期する() 呼び出しでは持参させない。
        this._DOM同期 = new ペイン木DOM同期(this._メイン領域, this._DOM同期コンテキスト());

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
            this._タブ内ボタン管理.delete(タブID値);
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
            this._選択状態のみ反映();
            this._イベント?.onタブ選択(id);
        }
    }

    タブが存在するか(id: string): boolean {
        return this._コンテンツ管理.has(タブIDを作る(id));
    }

    タブ内ボタンを追加する(
        タブid: string,
        ボタンid: string,
        ラベル: string,
        onクリック: () => void,
        アイコン?: "再読み込み",
    ): void {
        const タブID値 = タブIDを作る(タブid);
        if (!this._コンテンツ管理.has(タブID値)) return;
        const 一覧 = this._タブ内ボタン管理.get(タブID値) ?? [];
        if (一覧.some(ボタン => ボタン.id === ボタンid)) return;
        this._タブ内ボタン管理.set(タブID値, [...一覧, { id: ボタンid, ラベル, アイコン, onクリック }]);
        this._再描画();
    }

    タブ再読み込みボタンを追加する(タブid: string, onクリック: () => void): void {
        this.タブ内ボタンを追加する(タブid, "reload", "更新", onクリック, "再読み込み");
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
        this._DOM同期.同期する(this._レイアウト.メインペイン);
    }

    // タブの追加/削除/分割/移動を伴わない「選択の切り替えだけ」は最頻出の操作。
    // 元々は _再描画() が親.clearChildren() → ペインを構築 による全再構築だったため、
    // 選択切替のたびに既存のコンテンツDOMノード(iframe等)が一度documentから切断されてから
    // 再接続され、iframeの読み込み中browsing contextが破棄されて再読み込みになっていた
    // (Fudaba札#51「タブAからタブBに移動して、またタブAに戻ってくると状態がリセットされる」)。
    // 現在は _再描画() 自体が ペイン木DOM同期 による差分更新(旧木と新木を比較し、参照/id が
    // 一致する部分の DOM 要素は一切 detach せず再利用する)になり、無関係なタブは
    // タブの追加/削除/分割/移動でも保持されるようになった(Fudaba札#92)。
    // それでも選択切替専用にこの経路を残しているのは、選択変更はDOM構造(どの要素がどの親に
    // 属するか)を一切変える必要がなく、木全体の差分比較すら不要な最も軽い経路だから。
    // 既存ノードの親子関係には触れず、表示中/非表示の切り替えとタブボタンの見た目だけを
    // 直接書き換える。
    private _選択状態のみ反映(): void {
        for (const ペイン of 木の全ペイン(this._レイアウト.メインペイン)) {
            if (ペイン.kind !== "タブ群") continue;
            for (const タブ of ペイン.タブ一覧) {
                const 選択中か = ペイン.選択中 === タブ.id;
                this._コンテンツ管理.get(タブ.id)?.setStyleCSS({ display: 選択中か ? "flex" : "none" });

                const ボタン要素 = this._メイン領域.dom.element.querySelector(`button[${タブID属性}="${タブ.id}"]`);
                if (ボタン要素 instanceof HTMLElement) {
                    ボタン要素.setAttribute(
                        styles.タブ状態.attribute,
                        選択中か ? styles.タブ状態.value.active : styles.タブ状態.value.inactive,
                    );
                }
            }
        }
    }

    private _DOM同期コンテキスト(): DOM同期コンテキスト {
        return {
            コンテンツ取得: タブ => this._コンテンツ管理.get(タブ) ?? null,
            タブ内ボタン取得: タブ => this._タブ内ボタン管理.get(タブ) ?? 空タブ内ボタン一覧,
            タブクリック: タブ => this.タブを選択する(タブ),
            タブ閉じるクリック: タブ => this.タブを閉じる(タブ),
            DnD押下: (タブ, 座標) => this._入力配線.DnD押下処理(タブ, 座標),
            直前にドラッグした: () => this._入力配線.直前にドラッグしたか(),
            スプリッター押下: (分割ペイン, 方向, 開始座標) =>
                this._入力配線.スプリッター押下処理(分割ペイン, 方向, 開始座標),
            タブバードラッグ領域: this._タブバーをウィンドウドラッグ領域にする,
        };
    }

    dispose(): void {
        this._入力配線.dispose();
        // コンテンツ実体は外部所有 (タブを追加する で渡されたもの)、ここでは dispose しない。
        this._コンテンツ管理.clear();
        this._タブ内ボタン管理.clear();
    }
}

// TODO(W-149-A3-active-pane): 選択中タブID() は深さ優先で最初に見つかった選択中タブを返すだけで、
// 複数ペイン分割後に「最後に操作したアクティブペイン」とずれる。
// 複数ペイン使用が常態化したら「アクティブペインID」フィールドで保持する形に拡張する。
