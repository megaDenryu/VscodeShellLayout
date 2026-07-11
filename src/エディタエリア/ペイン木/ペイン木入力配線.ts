// タブ DnD / スプリッター / ドロップヒント DOM の入力系副作用を集約する。
// document リスナ・querySelector・body inline style 上書きをすべて本クラスに閉じ込める。
// 純データ (レイアウト + コンテンツ管理) と DOM 構築 (DOM同期.ts) は本クラスの責務に含めない。

import { div, type DivC } from "sengen-ui";
import {
    type レイアウト, type タブID, type ペインID,
} from "./レイアウト型";
import { 適用, 木の全ペイン } from "./レイアウト操作";
import {
    DnD適用, 初期DnD状態,
    type DnD状態, type ペイン矩形情報, type 座標, type 矩形, type 確定要求,
} from "./DnD制御";
import { ペインID採番器 } from "./ID採番器";
import { ペイン木矩形計測器 } from "./矩形計測";
import { タブ視覚効果 } from "./視覚効果";
import * as styles from "./style.css";
import {
    iframeへのポインタイベントを一時停止する,
    type iframeポインタ制御ハンドル,
} from "../../ドラッグ制御/iframeポインタ制御";

export interface ペイン木入力配線コールバック {
    readonly 現在のレイアウトを取得: () => レイアウト;
    readonly レイアウトを更新: (新: レイアウト) => void;
    readonly 再描画: () => void;
}

interface 退避済body様式 {
    readonly userSelect: string;
    readonly cursor: string;
}

export class ペイン木入力配線 {
    private readonly _ドロップヒント: DivC;
    private readonly _矩形計測: ペイン木矩形計測器;
    private readonly _視覚効果: タブ視覚効果;

    private _DnD状態: DnD状態 = 初期DnD状態;
    private _DnD矩形キャッシュ: ペイン矩形情報[] | null = null;
    // click 発火時に「直前にしきい値超えのドラッグだった」場合タブ選択を抑止するため、
    // 押下開始でリセット、しきい値超えで true、配線解除後 setTimeout で次サイクルクリアする。
    private _直前にドラッグした: boolean = false;

    private _スプリッタードラッグ: {
        分割ペイン: ペインID;
        方向: "水平" | "垂直";
        前回座標: 座標;
    } | null = null;

    private _onDocumentMove: ((e: PointerEvent) => void) | null = null;
    private _onDocumentUp: ((e: PointerEvent) => void) | null = null;
    private _onDocumentKeydown: ((e: KeyboardEvent) => void) | null = null;
    // マトリョーシカシェル対策: ドラッグ追跡中(タブDnD/スプリッター共通)はiframeへの
    // ポインタイベントを止める(iframeポインタ制御.ts参照)。_入力配線解除()で必ず解除する。
    private _iframe制御: iframeポインタ制御ハンドル | null = null;
    // body の inline style を退避してから上書きする。空文字復元すると親アプリが
    // body cursor/userSelect を使っていた場合に値を破壊するため、押下時の元値で正確に戻す。
    private _body元style: 退避済body様式 | null = null;

    // 接頭辞分離で衝突を回避し、深さ優先探索が誤った親ペインを返すのを防ぐ。
    private readonly _新タブ群ID採番器 = new ペインID採番器("tabs", 1);
    private readonly _分割ID採番器 = new ペインID採番器("split", 0);

    constructor(
        private readonly _メイン領域: DivC,
        private readonly _コールバック: ペイン木入力配線コールバック,
    ) {
        // ドロップヒント DOM は外殻の overflow:hidden 影響を避けるため document.body 直下にマウントする。
        this._ドロップヒント = div({ class: styles.DnD領域ヒント });
        document.body.appendChild(this._ドロップヒント.dom.element);
        this._矩形計測 = new ペイン木矩形計測器(this._メイン領域, () => this._コールバック.現在のレイアウトを取得());
        this._視覚効果 = new タブ視覚効果(this._メイン領域);
    }

    // =========================================================================
    // 入口
    // =========================================================================

    DnD押下処理(タブ: タブID, 座標: 座標): void {
        this._入力配線解除();
        this._直前にドラッグした = false;
        this._DnD矩形キャッシュ = this._矩形計測.全ペイン矩形を計測();
        const 元タブバー矩形 = this._ドラッグタブの元タブバー矩形(タブ);
        this._DnD状態 = DnD適用(
            this._DnD状態,
            { kind: "押下", タブ, 座標, 元タブバー矩形 },
        ).新状態;
        this._onDocumentMove = e => this._DnD移動処理({ x: e.clientX, y: e.clientY });
        this._onDocumentUp = e => this._DnD離す処理({ x: e.clientX, y: e.clientY });
        document.addEventListener("pointermove", this._onDocumentMove);
        document.addEventListener("pointerup", this._onDocumentUp);
        this._Esc配線を登録();
        this._body様式を上書き("grabbing");
        this._iframe制御 = iframeへのポインタイベントを一時停止する();
    }

    private _ドラッグタブの元タブバー矩形(タブ: タブID): 矩形 | null {
        const キャッシュ = this._DnD矩形キャッシュ ?? [];
        for (const 情報 of キャッシュ) {
            if (情報.タブ矩形一覧.some(t => t.タブ === タブ)) {
                return 情報.タブバー矩形;
            }
        }
        return null;
    }

    スプリッター押下処理(分割ペイン: ペインID, 方向: "水平" | "垂直", 開始座標: 座標): void {
        this._入力配線解除();
        this._スプリッタードラッグ = { 分割ペイン, 方向, 前回座標: 開始座標 };
        this._onDocumentMove = e => this._スプリッター移動({ x: e.clientX, y: e.clientY });
        this._onDocumentUp = () => {
            this._入力配線解除();
            this._スプリッタードラッグ = null;
        };
        document.addEventListener("pointermove", this._onDocumentMove);
        document.addEventListener("pointerup", this._onDocumentUp);
        this._Esc配線を登録();
        // 水平スプリッターは上下分割の境界を縦にドラッグするので row-resize、
        // 垂直スプリッターは左右分割の境界を横にドラッグするので col-resize。
        this._body様式を上書き(方向 === "水平" ? "row-resize" : "col-resize");
        this._iframe制御 = iframeへのポインタイベントを一時停止する();
    }

    直前にドラッグしたか(): boolean {
        return this._直前にドラッグした;
    }

    dispose(): void {
        this._入力配線解除();
        this._スプリッタードラッグ = null;
        // SengenUI ライフサイクル規約: HtmlComponentBase.delete() でクリーンアップ込み破棄。
        // 現状は DivC にイベント未付与なので element.remove() と等価だが、
        // 将来 DivC へイベントを足した時の保険として delete() を使う。
        this._ドロップヒント.delete();
    }

    // =========================================================================
    // body 様式の退避・上書き・復元
    // =========================================================================

    private _body様式を上書き(カーソル: string): void {
        this._body元style = {
            userSelect: document.body.style.userSelect,
            cursor: document.body.style.cursor,
        };
        document.body.style.userSelect = "none";
        document.body.style.cursor = カーソル;
    }

    private _body様式を復元(): void {
        if (this._body元style === null) return;
        document.body.style.userSelect = this._body元style.userSelect;
        document.body.style.cursor = this._body元style.cursor;
        this._body元style = null;
    }

    // =========================================================================
    // DnD 内部処理
    // =========================================================================

    private _DnD移動処理(座標: 座標): void {
        const キャッシュ = this._DnD矩形キャッシュ ?? [];
        const r = DnD適用(this._DnD状態, { kind: "移動", 座標, ペイン矩形一覧: キャッシュ });
        this._DnD状態 = r.新状態;
        if (this._DnD状態.kind !== "ドラッグ中") {
            this._視覚効果.ドロップヒントを隠す(this._ドロップヒント.dom.element);
            this._視覚効果.全タブ位置をリセット();
            return;
        }
        this._直前にドラッグした = true;
        if (this._DnD状態.サブモード === "並べ替え") {
            // タブバー上は CSS transform でドラッグタブをカーソル追従、他タブをスライド表示する。
            // 純関数 タブ移動 はドロップ時に 1 回だけ適用し、ドラッグ中の毎フレーム再描画で
            // WebRTC video 等のコンテンツ実体が DOM ツリーから着脱される副作用を避ける。
            this._視覚効果.ドロップヒントを隠す(this._ドロップヒント.dom.element);
            this._視覚効果.タブ位置を更新(this._DnD状態, this._コールバック.現在のレイアウトを取得());
        } else {
            // ペイン移動モード: 視覚的スライドはリセットし、ドロップヒントで挿入位置候補を青枠表示。
            this._視覚効果.全タブ位置をリセット();
            this._視覚効果.ドロップヒントを更新(
                this._ドロップヒント.dom.element,
                this._DnD状態.現在ターゲット,
                キャッシュ,
            );
        }
    }

    private _DnD離す処理(座標: 座標): void {
        const キャッシュ = this._DnD矩形キャッシュ ?? [];
        const r = DnD適用(this._DnD状態, { kind: "離す", 座標, ペイン矩形一覧: キャッシュ });
        this._DnD状態 = r.新状態;
        if (r.確定要求 !== null) this._確定要求を適用(r.確定要求);
        this._入力配線解除();
    }

    private _入力配線解除(): void {
        if (this._onDocumentMove) document.removeEventListener("pointermove", this._onDocumentMove);
        if (this._onDocumentUp) document.removeEventListener("pointerup", this._onDocumentUp);
        if (this._onDocumentKeydown) document.removeEventListener("keydown", this._onDocumentKeydown);
        // ドロップ確定で再描画が走るとタブ DOM が再生成されて transform は消えるが、
        // ドロップ確定が走らない経路 (Esc 中断・しきい値未到達クリック) では明示的にリセットする。
        this._視覚効果.全タブ位置をリセット();
        this._onDocumentMove = null;
        this._onDocumentUp = null;
        this._onDocumentKeydown = null;
        this._DnD矩形キャッシュ = null;
        this._視覚効果.ドロップヒントを隠す(this._ドロップヒント.dom.element);
        this._body様式を復元();
        this._iframe制御?.解除する();
        this._iframe制御 = null;
        // queueMicrotask は click より前に走るため使えない。setTimeout で次サイクルへ逃がす。
        setTimeout(() => { this._直前にドラッグした = false; }, 0);
    }

    // =========================================================================
    // Esc 中断配線 (DnD/スプリッター 共通)
    // =========================================================================

    private _Esc配線を登録(): void {
        this._onDocumentKeydown = e => {
            if (e.key !== "Escape") return;
            // DnD 中の Esc は配線層が専有し、親アプリの Esc ショートカットへ伝播させない。
            e.preventDefault();
            e.stopPropagation();
            this._中断処理();
        };
        document.addEventListener("keydown", this._onDocumentKeydown);
    }

    private _中断処理(): void {
        if (this._DnD状態.kind === "ドラッグ中") {
            this._直前にドラッグした = true;
        }
        this._DnD状態 = DnD適用(this._DnD状態, { kind: "中断" }).新状態;
        this._スプリッタードラッグ = null;
        this._入力配線解除();
    }

    private _確定要求を適用(要求: 確定要求): void {
        const 現在 = this._コールバック.現在のレイアウトを取得();
        const 結果 = 適用(現在, this._確定要求からレイアウト操作(要求));
        if (結果.kind === "成功") {
            this._コールバック.レイアウトを更新(結果.新レイアウト);
            this._コールバック.再描画();
        }
    }

    private _確定要求からレイアウト操作(要求: 確定要求) {
        switch (要求.kind) {
            case "タブ群挿入":
                return {
                    kind: "タブ移動" as const,
                    タブ: 要求.タブ,
                    移動先ペイン: 要求.移動先ペイン,
                    // DnD 制御純核の挿入位置は「ドラッグタブを除外した削除後タブ列に対する位置」で
                    // レイアウト操作.タブ移動 純関数の期待値と既に一致する。配線層での変換は不要。
                    挿入位置: 要求.挿入位置,
                };
            case "ペイン方向分割":
                return {
                    kind: "タブ→新ペイン分割" as const,
                    タブ: 要求.タブ,
                    分割対象: 要求.分割対象,
                    方向: 要求.方向,
                    新タブ群ペインID: this._新タブ群ID採番器.発行(),
                    新分割ペインID: this._分割ID採番器.発行(),
                };
        }
    }

    // =========================================================================
    // スプリッター内部処理
    // =========================================================================

    private _スプリッター移動(座標: 座標): void {
        const 状態 = this._スプリッタードラッグ;
        if (状態 === null) return;
        const レイアウト = this._コールバック.現在のレイアウトを取得();
        const ペイン = 木の全ペイン(レイアウト.メインペイン).find(p => p.id === 状態.分割ペイン);
        if (ペイン === undefined || (ペイン.kind !== "左右分割" && ペイン.kind !== "上下分割")) return;
        // 比率計算は分割ペイン自身の bounding rect を基準にする。
        // メイン領域全体を基準にすると入れ子分割で内側ほど鈍くなる。
        const 分割ペイン矩形 = this._矩形計測.ペインの矩形を見つける(状態.分割ペイン);
        if (分割ペイン矩形 === null) return;
        const 全長 = 状態.方向 === "水平" ? 分割ペイン矩形.h : 分割ペイン矩形.w;
        if (全長 === 0) return;
        const delta = 状態.方向 === "水平" ? 座標.y - 状態.前回座標.y : 座標.x - 状態.前回座標.x;
        const 新比率 = Math.max(0.05, Math.min(0.95, ペイン.比率 + delta / 全長));
        const 結果 = 適用(レイアウト, {
            kind: "ペイン比率変更", ペイン: 状態.分割ペイン, 新比率,
        });
        if (結果.kind === "成功") {
            this._コールバック.レイアウトを更新(結果.新レイアウト);
            this._スプリッタードラッグ = { ...状態, 前回座標: 座標 };
            this._コールバック.再描画();
        }
    }

}
