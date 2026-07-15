// ドラッグ中の視覚フィードバックを集約する DOM 書き換え専用層。
// CSS transform でドラッグタブをカーソル追従させ、間に挟まる他タブをスライドさせる。
// ドロップヒント (青枠) の位置・表示更新もここに合流させる (DOM Write の凝集)。
//
// 設計原則:
//   - 状態を持たない。引数として「ドラッグ中状態」「所属ペイン」「ドロップヒント要素」等を受け取る。
//   - ドロップヒント要素そのものの所有・生成・dispose は配線層に残す (ライフサイクル責務の分離)。
//   - 純関数 ヒント矩形を計算 はモジュール末尾に export し続ける (LV2 と独立してテスト可能)。

import { type DivC } from "sengen-ui";
import { タブを持つペインを探す } from "./レイアウト操作";
import type { レイアウト, タブ群ペイン, タブID } from "./レイアウト型";
import type { DnD状態, ドロップターゲット, ペイン矩形情報 } from "./DnD制御";
import { タブ項目属性 } from "./DOM同期";

export class タブ視覚効果 {
    constructor(private readonly _メイン領域: DivC) {}

    // ドラッグタブを transform: translateX でカーソル追従させ、間に挟まる他タブを
    // ドラッグタブ幅分シフトする。DOM 構造は変えないため video 要素や状態は影響しない。
    // ドロップ時に純関数 タブ移動 でレイアウトを確定すると、再描画で transform は消える。
    タブ位置を更新(状態: Extract<DnD状態, { kind: "ドラッグ中" }>, レイアウト: レイアウト): void {
        if (状態.現在ターゲット === null || 状態.現在ターゲット.kind !== "タブ群挿入") {
            this.全タブ位置をリセット();
            return;
        }
        const ターゲット = 状態.現在ターゲット;
        const 所属ペイン = タブを持つペインを探す(レイアウト.メインペイン, 状態.ドラッグタブ);
        if (所属ペイン === null) {
            this.全タブ位置をリセット();
            return;
        }
        // 別ペインへの挿入は視覚スライドの対象外 (元ペインのタブは元の位置のまま、ドラッグタブだけ追従)。
        if (所属ペイン.id !== ターゲット.ペイン) {
            this._ドラッグタブ追従のみ更新(状態, 所属ペイン);
            return;
        }
        const 元index = 所属ペイン.タブ一覧.findIndex(t => t.id === 状態.ドラッグタブ);
        const ドラッグタブ要素 = this._タブ要素を取得(状態.ドラッグタブ);
        if (ドラッグタブ要素 === null) return;
        const ドラッグタブ幅 = ドラッグタブ要素.offsetWidth;
        const カーソル差分x = 状態.現在座標.x - 状態.開始座標.x;

        ドラッグタブ要素.style.transition = "none";
        ドラッグタブ要素.style.transform = `translateX(${カーソル差分x}px)`;

        // 削除後挿入位置 N のとき、削除後配列で位置 0..N-1 のタブはそのまま、N..end のタブは右にずれる。
        // 元配列 (ドラッグタブ含む) の他タブ i (i !== 元index) を削除後配列の index i' に
        // マッピング: i' = (i < 元index) ? i : (i - 1)
        // i' < N なら左詰め (シフト 0)、i' >= N なら本来の位置よりドラッグタブ 1 個分右にいるべき
        // ところを、押下時 DOM 位置のまま表示しているため「左へドラッグタブ幅」シフトが必要。
        const 新index = ターゲット.挿入位置;
        所属ペイン.タブ一覧.forEach((タブ定義, i) => {
            if (タブ定義.id === 状態.ドラッグタブ) return;
            const 他要素 = this._タブ要素を取得(タブ定義.id);
            if (他要素 === null) return;
            // 他タブの transition は CSS で 0.2s ease を静的に定義済 (style.css.ts タブボタン)。
            // JS 側で再設定しないことで二重管理を避ける (W-156 Gemini [設計][低] 採用反映)。
            const 削除後index = i < 元index ? i : i - 1;
            let シフト = 0;
            if (i > 元index && 削除後index < 新index) {
                シフト = -ドラッグタブ幅;
            } else if (i < 元index && 削除後index >= 新index) {
                シフト = ドラッグタブ幅;
            }
            他要素.style.transform = `translateX(${シフト}px)`;
        });
    }

    // 別ペイン挿入中: ドラッグタブのみカーソル追従、他タブはホーム位置に戻す。
    // タブ位置を更新 内部からのみ呼ぶため private。
    private _ドラッグタブ追従のみ更新(
        状態: Extract<DnD状態, { kind: "ドラッグ中" }>,
        所属ペイン: タブ群ペイン,
    ): void {
        所属ペイン.タブ一覧.forEach(タブ定義 => {
            const 要素 = this._タブ要素を取得(タブ定義.id);
            if (要素 === null) return;
            if (タブ定義.id === 状態.ドラッグタブ) {
                要素.style.transition = "none";
                const 差分 = 状態.現在座標.x - 状態.開始座標.x;
                要素.style.transform = `translateX(${差分}px)`;
            } else {
                // 他タブの transition は CSS デフォルト (0.2s ease) を使う。
                要素.style.transform = "translateX(0)";
            }
        });
    }

    // 全タブの transform をクリア。transition は CSS (style.css.ts) 側に静的定義済。
    // ドラッグタブに transition: none を一時上書きしていた可能性があるため、inline 値もクリアする。
    全タブ位置をリセット(): void {
        const 全タブ項目 = this._メイン領域.dom.element.querySelectorAll<HTMLElement>(`[${タブ項目属性}]`);
        全タブ項目.forEach(b => {
            b.style.transform = "";
            b.style.transition = "";
        });
    }

    // ドロップヒント要素は配線層が所有・dispose する (ライフサイクル分離)。
    // 表示更新ロジック (位置決定 + display 切替) のみ本層に集約する。
    ドロップヒントを更新(
        ヒント要素: HTMLElement,
        ターゲット: ドロップターゲット | null,
        キャッシュ: readonly ペイン矩形情報[],
    ): void {
        if (ターゲット === null) {
            ヒント要素.style.display = "none";
            return;
        }
        const ペイン矩形 = キャッシュ.find(c => c.ペイン === ターゲット.ペイン)?.矩形;
        if (ペイン矩形 === undefined) {
            ヒント要素.style.display = "none";
            return;
        }
        const ヒント矩形 = ヒント矩形を計算(ターゲット, ペイン矩形);
        ヒント要素.style.display = "block";
        ヒント要素.style.left = `${ヒント矩形.x}px`;
        ヒント要素.style.top = `${ヒント矩形.y}px`;
        ヒント要素.style.width = `${ヒント矩形.w}px`;
        ヒント要素.style.height = `${ヒント矩形.h}px`;
    }

    ドロップヒントを隠す(ヒント要素: HTMLElement): void {
        ヒント要素.style.display = "none";
    }

    private _タブ要素を取得(タブ: タブID): HTMLElement | null {
        const el = this._メイン領域.dom.element.querySelector(`[${タブ項目属性}="${タブ}"]`);
        return el instanceof HTMLElement ? el : null;
    }
}

// ドロップターゲット種別に応じてヒント矩形を計算する純関数。LV2 と独立してテストできる。
export function ヒント矩形を計算(
    ターゲット: ドロップターゲット,
    ペイン矩形: { readonly x: number; readonly y: number; readonly w: number; readonly h: number },
): { x: number; y: number; w: number; h: number } {
    switch (ターゲット.kind) {
        case "タブ群挿入":
            return { x: ペイン矩形.x, y: ペイン矩形.y, w: ペイン矩形.w, h: ペイン矩形.h };
        case "ペイン方向分割":
            switch (ターゲット.方向) {
                case "左":
                    return { x: ペイン矩形.x, y: ペイン矩形.y, w: ペイン矩形.w / 2, h: ペイン矩形.h };
                case "右":
                    return { x: ペイン矩形.x + ペイン矩形.w / 2, y: ペイン矩形.y, w: ペイン矩形.w / 2, h: ペイン矩形.h };
                case "上":
                    return { x: ペイン矩形.x, y: ペイン矩形.y, w: ペイン矩形.w, h: ペイン矩形.h / 2 };
                case "下":
                    return { x: ペイン矩形.x, y: ペイン矩形.y + ペイン矩形.h / 2, w: ペイン矩形.w, h: ペイン矩形.h / 2 };
            }
    }
}
