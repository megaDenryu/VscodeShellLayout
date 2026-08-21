// レイアウト型 → 実 DOM の同期(差分更新方式)。
// 旧ペイン木と新ペイン木を位置対応で比較し、参照または id が一致する部分木は
// 既存の DOM 要素をそのまま流用する。タブ追加/削除/分割/移動のたびに親.clearChildren()
// で全再構築すると、無関係な既存タブのコンテンツ(iframe 等)まで document から
// 切断→再接続され、iframe の読み込み中 browsing context が破棄されて再読み込みに
// なっていた問題(Fudaba札#92)を、変化のあった部分だけを差分更新することで避ける。
// タブのコンテンツ実体は LV2 オーケストレータ管理の Map から再利用するため、
// 差分更新でもユーザーから見たコンテンツは破棄されない。
// SengenUI の宣言的 API のみを使い、素 DOM API・addEventListener 直叩きは禁止。

import { type DivC, type HtmlComponentBase } from "sengen-ui";
import type { ペイン, タブID, ペインID } from "./レイアウト型";
import type { タブ内ボタン定義 } from "./タブボタン";
import { タブ群ペイン同期器 } from "./タブ群ペイン同期";
import { 分割ペイン同期器 } from "./分割ペイン同期";
import type { 構築済みペイン } from "./構築済みペイン";
import type { 座標 } from "./DnD制御";

// data 属性は配線層の querySelector で実 DOM を逆引きするため。動的に生成される DOM 構造で
// レイアウト型のペイン ID と DOM 要素を 1:1 対応させる必要がある。
export const ペインID属性 = "data-pane-id";
export const タブID属性 = "data-tab-id";
export const タブ項目属性 = "data-tab-item-id";
// タブバー要素を逆引きしてタブバー矩形を計測する用。タブバー内の押下は端ゾーン判定をスキップし
// 必ずタブ群挿入として扱うため、配線層が DOM からタブバー矩形を取得する。
export const タブバー属性 = "data-tab-bar";

export interface DOM同期コンテキスト {
    readonly コンテンツ取得: (タブ: タブID) => HtmlComponentBase | null;
    readonly タブ内ボタン取得: (タブ: タブID) => readonly タブ内ボタン定義[];
    readonly タブクリック: (タブ: タブID) => void;
    readonly タブ閉じるクリック: (タブ: タブID) => void;
    readonly DnD押下: (タブ: タブID, 座標: 座標) => void;
    // click 発火時に直前がドラッグだったかを判定し、ドラッグ後のタブ選択暴発を抑止するためのフック。
    readonly 直前にドラッグした: () => boolean;
    readonly スプリッター押下: (
        分割ペイン: ペインID,
        方向: "水平" | "垂直",
        開始座標: 座標,
    ) => void;
    // Electronでtitlebarを除去したアプリ向け。trueならタブバーの空き領域を
    // ウィンドウドラッグ領域にする(外殻レイアウトオプションから配線される)。
    readonly タブバードラッグ領域: boolean;
}

// ペイン木の同期セッション。コンテンツ管理・タブ内ボタン管理へのアクセス手段(コンテキスト)は
// コンストラクタで受け取り保持し、以後の呼び出しで持参させない。直近に構築した DOM 状態も
// 保持し、同期のたびに差分だけを適用する。ルート要素の付け替えが必要なとき(初回、または
// ルート自体の種別が変わったとき)だけ 親 に触れ、それ以外は 親 の子構成を一切変更しない。
export class ペイン木DOM同期 {
    private _現在: 構築済みペイン | null = null;
    private readonly _タブ群同期器: タブ群ペイン同期器;
    private readonly _分割ペイン同期器: 分割ペイン同期器;

    constructor(
        private readonly _親: DivC,
        コンテキスト: DOM同期コンテキスト,
    ) {
        this._タブ群同期器 = new タブ群ペイン同期器(コンテキスト);
        this._分割ペイン同期器 = new 分割ペイン同期器(コンテキスト);
    }

    同期する(新ペイン: ペイン): void {
        const 新構築済み = this._ペインを同期(新ペイン, this._現在);
        if (this._現在 === null) {
            this._親.child(新構築済み.要素);
        } else if (新構築済み.要素 !== this._現在.要素) {
            this._親.removeChild(this._現在.要素);
            this._親.child(新構築済み.要素);
        }
        this._現在 = 新構築済み;
    }

    // 木の再帰。左右分割/上下分割は子の同期のためにこの関数自体をコールバックとして
    // 要求する(再帰の順序・回数を決めるのは受け手側という構造的理由。分割ペイン同期.ts
    // 参照)。アロー関数フィールドにして、コールバックとして渡しても this 束縛を保つ。
    private _ペインを同期 = (新: ペイン, 旧: 構築済みペイン | null): 構築済みペイン => {
        switch (新.kind) {
            case "タブ群": {
                const 対応旧 = 旧 !== null && 旧.kind === "タブ群" && 旧.ペイン.id === 新.id ? 旧 : null;
                return this._タブ群同期器.同期する(新, 対応旧);
            }
            case "左右分割": {
                const 対応旧 = 旧 !== null && 旧.kind === "左右分割" && 旧.ペイン.id === 新.id ? 旧 : null;
                return this._分割ペイン同期器.左右分割を同期(新, 対応旧, this._ペインを同期);
            }
            case "上下分割": {
                const 対応旧 = 旧 !== null && 旧.kind === "上下分割" && 旧.ペイン.id === 新.id ? 旧 : null;
                return this._分割ペイン同期器.上下分割を同期(新, 対応旧, this._ペインを同期);
            }
        }
    };
}
