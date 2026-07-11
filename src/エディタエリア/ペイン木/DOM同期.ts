// レイアウト型 → 実 DOM の構築/再描画 (全再描画方式)。
// タブのコンテンツ実体は LV2 オーケストレータ管理の Map から再利用するため、
// 全再描画でもユーザーから見たコンテンツは破棄されない。
// SengenUI の宣言的 API のみを使い、素 DOM API・addEventListener 直叩きは禁止。
//
// 本ファイルの ペインを構築/タブ群ペインを構築 は「不変データ木 → DOMツリー」の再帰変換で、
// LV2コンポーネントのように更新用メソッドを持つ永続インスタンスではなく、再描画のたびに
// 使い捨てで作り直す設計そのものがコンテンツ実体の着脱事故を防ぐ核。そのため個々のペイン種別を
// LV1拡張/LV2素部品へ昇格させず関数のまま維持する（末端の繰り返し要素はタブボタン.ts へ抽出済み）。

import { div, type DivC, type HtmlComponentBase } from "sengen-ui";
import type { ペイン, タブID, ペインID } from "./レイアウト型";
import { タブボタン } from "./タブボタン";
import { 左右分割ペインを構築, 上下分割ペインを構築 } from "./分割ペイン構築";
import * as styles from "./style.css";
import type { 座標 } from "./DnD制御";

// data 属性は配線層の querySelector で実 DOM を逆引きするため。動的に生成される DOM 構造で
// レイアウト型のペイン ID と DOM 要素を 1:1 対応させる必要がある。
export const ペインID属性 = "data-pane-id";
export const タブID属性 = "data-tab-id";
// タブバー要素を逆引きしてタブバー矩形を計測する用。タブバー内の押下は端ゾーン判定をスキップし
// 必ずタブ群挿入として扱うため、配線層が DOM からタブバー矩形を取得する。
export const タブバー属性 = "data-tab-bar";

export interface DOM同期コンテキスト {
    readonly コンテンツ取得: (タブ: タブID) => HtmlComponentBase | null;
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
}

export function ペイン木をDOMに同期(
    親: DivC,
    ペイン: ペイン,
    コンテキスト: DOM同期コンテキスト,
): void {
    親.clearChildren();
    親.child(ペインを構築(ペイン, コンテキスト));
}

export function ペインを構築(対象ペイン: ペイン, コンテキスト: DOM同期コンテキスト): DivC {
    switch (対象ペイン.kind) {
        case "タブ群":
            return タブ群ペインを構築(対象ペイン, コンテキスト);
        case "左右分割":
            return 左右分割ペインを構築(対象ペイン, コンテキスト, ペインを構築);
        case "上下分割":
            return 上下分割ペインを構築(対象ペイン, コンテキスト, ペインを構築);
    }
}

function タブ群ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "タブ群" }>,
    コンテキスト: DOM同期コンテキスト,
): DivC {
    return (
        div({ class: styles.タブ群 })
            .setAttribute(ペインID属性, 対象ペイン.id)
            .childs([
                div({ class: styles.タブバー })
                    .setAttribute(タブバー属性, 対象ペイン.id)
                    .childs(
                        対象ペイン.タブ一覧.map(タブ =>
                            new タブボタン(タブ, 対象ペイン.選択中 === タブ.id, コンテキスト))),
                div({ class: styles.コンテンツエリア }).childs(
                    対象ペイン.タブ一覧.flatMap(タブ => {
                        const コンテンツ = コンテキスト.コンテンツ取得(タブ.id);
                        if (コンテンツ === null) return [];
                        const isActive = 対象ペイン.選択中 === タブ.id;
                        // flex:1 + minWidth/minHeight:0 で コンテンツエリア(flex column) の残り空間を
                        // 全部取り、内部コンテンツがはみ出しても親を超えない。width/height:100% だけだと
                        // flex 親の制約を尊重しないため「下半分が空」のような表示崩れが起きる。
                        コンテンツ.setStyleCSS({
                            display: isActive ? "flex" : "none",
                            flex: "1",
                            minWidth: "0",
                            minHeight: "0",
                            width: "100%",
                            height: "100%",
                        });
                        return [コンテンツ];
                    }))])
    );
}
