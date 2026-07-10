// メイン領域 DOM からペイン / タブ / タブバー の矩形を読み取る純粋計測層。
// 配線層は本モジュールへ計測を委譲し、querySelector + getBoundingClientRect の散在を防ぐ。
// 副作用は DOM 読み取りのみ。書き込み・状態保持は持たない。

import { type DivC } from "sengen-ui";
import { タブIDを作る, type レイアウト, type ペインID, type タブID } from "./レイアウト型";
import { 木の全ペイン } from "./レイアウト操作";
import { ペインID属性, タブID属性, タブバー属性 } from "./DOM同期";
import type { ペイン矩形情報, 矩形 } from "./DnD制御";

export class ペイン木矩形計測器 {
    constructor(
        private readonly _メイン領域: DivC,
        private readonly _レイアウト取得: () => レイアウト,
    ) {}

    // 押下時に 1 回呼んでドラッグ中はキャッシュを再利用する想定の集計関数。
    // 分割ペインは矩形リストに含めない。木の全ペイン() は深さ優先で親 (分割ペイン) を
    // 先に返すため、含めるとヒットテストの for ループで親矩形 (子ペインを包含) が先に
    // ヒットして「挿入可能 false → null」で子のタブ群ペインへの判定がスキップされる。
    全ペイン矩形を計測(): ペイン矩形情報[] {
        const 結果: ペイン矩形情報[] = [];
        const レイアウト = this._レイアウト取得();
        for (const ペイン of 木の全ペイン(レイアウト.メインペイン)) {
            if (ペイン.kind !== "タブ群") continue;
            const 矩形 = this.ペインの矩形を見つける(ペイン.id);
            if (矩形 === null) continue;
            結果.push({
                ペイン: ペイン.id,
                矩形,
                タブ矩形一覧: this._タブ矩形一覧を計測(ペイン.id),
                タブバー矩形: this._タブバー矩形を計測(ペイン.id),
                挿入可能: true,
            });
        }
        return 結果;
    }

    // スプリッター移動時に分割ペイン自身の矩形を引きたいために公開する。
    // メイン領域全体を基準にすると入れ子分割で内側ほど鈍くなるため、分割ペイン自身を基準にする。
    ペインの矩形を見つける(id: ペインID): 矩形 | null {
        const el = this._メイン領域.dom.element.querySelector(`[${ペインID属性}="${id}"]`);
        if (!(el instanceof HTMLElement)) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return { x: r.left, y: r.top, w: r.width, h: r.height };
    }

    private _タブ矩形一覧を計測(ペインID値: ペインID): { タブ: タブID; 矩形: 矩形 }[] {
        const ペイン要素 = this._メイン領域.dom.element.querySelector(`[${ペインID属性}="${ペインID値}"]`);
        if (!(ペイン要素 instanceof HTMLElement)) return [];
        const ボタン群 = ペイン要素.querySelectorAll<HTMLElement>(`button[${タブID属性}]`);
        const 結果: { タブ: タブID; 矩形: 矩形 }[] = [];
        ボタン群.forEach(b => {
            const id = b.getAttribute(タブID属性);
            if (id === null) return;
            const r = b.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return;
            結果.push({ タブ: タブIDを作る(id), 矩形: { x: r.left, y: r.top, w: r.width, h: r.height } });
        });
        return 結果;
    }

    private _タブバー矩形を計測(ペインID値: ペインID): 矩形 | null {
        const el = this._メイン領域.dom.element.querySelector(`[${タブバー属性}="${ペインID値}"]`);
        if (!(el instanceof HTMLElement)) return null;
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return null;
        return { x: r.left, y: r.top, w: r.width, h: r.height };
    }
}
