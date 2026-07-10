// レイアウト型 → 実 DOM の構築/再描画 (全再描画方式)。
// タブのコンテンツ実体は LV2 オーケストレータ管理の Map から再利用するため、
// 全再描画でもユーザーから見たコンテンツは破棄されない。
// SengenUI の宣言的 API のみを使い、素 DOM API・addEventListener 直叩きは禁止。

import { div, span, button, type DivC, type HtmlComponentBase } from "sengen-ui";
import type { ペイン, タブID, ペインID } from "./レイアウト型";
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

function ペインを構築(対象ペイン: ペイン, コンテキスト: DOM同期コンテキスト): DivC {
    switch (対象ペイン.kind) {
        case "タブ群":
            return タブ群ペインを構築(対象ペイン, コンテキスト);
        case "左右分割":
            return 左右分割ペインを構築(対象ペイン, コンテキスト);
        case "上下分割":
            return 上下分割ペインを構築(対象ペイン, コンテキスト);
    }
}

function タブ群ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "タブ群" }>,
    コンテキスト: DOM同期コンテキスト,
): DivC {
    const タブバー = div({ class: styles.タブバー })
        .setAttribute(タブバー属性, 対象ペイン.id)
        .childs(
            対象ペイン.タブ一覧.map(タブ => タブボタンを構築(タブ, 対象ペイン.選択中 === タブ.id, コンテキスト)),
        );
    const コンテンツエリア = div({ class: styles.コンテンツエリア }).childs(
        対象ペイン.タブ一覧.flatMap(タブ => {
            const コンテンツ = コンテキスト.コンテンツ取得(タブ.id);
            if (コンテンツ === null) return [];
            const isActive = 対象ペイン.選択中 === タブ.id;
            // flex:1 + minWidth/minHeight:0 で コンテンツエリア(flex column) の残り空間を全部取り、
            // 内部コンテンツがはみ出しても親を超えない。width/height:100% だけだと flex 親の制約を
            // 尊重しないため「下半分が空」のような表示崩れが起きる。
            コンテンツ.setStyleCSS({
                display: isActive ? "flex" : "none",
                flex: "1",
                minWidth: "0",
                minHeight: "0",
                width: "100%",
                height: "100%",
            });
            return [コンテンツ];
        }),
    );
    return div({ class: styles.タブ群 })
        .setAttribute(ペインID属性, 対象ペイン.id)
        .childs([タブバー, コンテンツエリア]);
}

function タブボタンを構築(
    タブ: { id: タブID; ラベル: string; 閉じれる: boolean },
    isActive: boolean,
    コンテキスト: DOM同期コンテキスト,
) {
    const ボタン = button({ text: タブ.ラベル, class: styles.タブボタン })
        .setAttribute(タブID属性, タブ.id)
        .setAttributeIf({
            If: isActive,
            True: { attr: styles.タブ状態.attribute, value: styles.タブ状態.value.active },
            False: { attr: styles.タブ状態.attribute, value: styles.タブ状態.value.inactive },
        });
    ボタン.addTypedEventListener("pointerdown", (e: PointerEvent) => {
        コンテキスト.DnD押下(タブ.id, { x: e.clientX, y: e.clientY });
    });
    // 直前のドラッグはタブ選択ではなく DnD 操作なので、配線層フラグで click を抑止する。
    ボタン.addTypedEventListener("click", () => {
        if (コンテキスト.直前にドラッグした()) return;
        コンテキスト.タブクリック(タブ.id);
    });
    return ボタン.childIf({
        If: タブ.閉じれる,
        True: () => 閉じるボタンを構築(タブ.id, コンテキスト),
    });
}

function 閉じるボタンを構築(タブID値: タブID, コンテキスト: DOM同期コンテキスト) {
    const 閉じる = span({ class: styles.タブ閉じる });
    // SengenUI に SVG ファクトリがないため innerHTML で × アイコンを注入する
    // (ライブ映像View.ts:142-148 と同じく素 DOM API での回避策)。
    // stroke="currentColor" で span の color を継承するため、状態に応じて色変更可能。
    閉じる.dom.element.innerHTML =
        '<svg viewBox="0 0 10 10" width="10" height="10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
        '<line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
        '</svg>';
    閉じる.addTypedEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        コンテキスト.タブ閉じるクリック(タブID値);
    });
    // 閉じるボタンの pointerdown は親へバブルさせない (DnD 開始しない)。
    閉じる.addTypedEventListener("pointerdown", (e: PointerEvent) => {
        e.stopPropagation();
    });
    return 閉じる;
}

function 左右分割ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "左右分割" }>,
    コンテキスト: DOM同期コンテキスト,
): DivC {
    const 左 = ペインを構築(対象ペイン.左, コンテキスト)
        .setStyleCSS({ flex: `${対象ペイン.比率} 0 0` });
    const 右 = ペインを構築(対象ペイン.右, コンテキスト)
        .setStyleCSS({ flex: `${1 - 対象ペイン.比率} 0 0` });
    const スプリッター = div({ class: styles.スプリッター垂直 });
    スプリッター.addTypedEventListener("pointerdown", (e: PointerEvent) => {
        e.preventDefault();
        コンテキスト.スプリッター押下(対象ペイン.id, "垂直", { x: e.clientX, y: e.clientY });
    });
    return div({ class: styles.左右分割 })
        .setAttribute(ペインID属性, 対象ペイン.id)
        .childs([左, スプリッター, 右]);
}

function 上下分割ペインを構築(
    対象ペイン: Extract<ペイン, { kind: "上下分割" }>,
    コンテキスト: DOM同期コンテキスト,
): DivC {
    const 上 = ペインを構築(対象ペイン.上, コンテキスト)
        .setStyleCSS({ flex: `${対象ペイン.比率} 0 0` });
    const 下 = ペインを構築(対象ペイン.下, コンテキスト)
        .setStyleCSS({ flex: `${1 - 対象ペイン.比率} 0 0` });
    const スプリッター = div({ class: styles.スプリッター水平 });
    スプリッター.addTypedEventListener("pointerdown", (e: PointerEvent) => {
        e.preventDefault();
        コンテキスト.スプリッター押下(対象ペイン.id, "水平", { x: e.clientX, y: e.clientY });
    });
    return div({ class: styles.上下分割 })
        .setAttribute(ペインID属性, 対象ペイン.id)
        .childs([上, スプリッター, 下]);
}
