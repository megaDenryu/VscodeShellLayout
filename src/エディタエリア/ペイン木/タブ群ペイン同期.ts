// タブ群ペインの DOM 構築/差分同期。DOM同期.ts の ペインを同期 から呼ばれる。
// タブバー(ボタン)は状態を持たないため変更があれば毎回作り直して構わないが、
// コンテンツエリア配下(タブのコンテンツ本体。iframe を内包しうる)は、既存のタブに
// ついては一切 detach しない。iframe は document から切断された時点で読み込み中の
// browsing context が破棄される仕様のため、無関係なタブの再読み込みを防ぐ核心部分
// (Fudaba札#92「タブ構造変更時も開いているiframeの状態を保持する」)。

import { div, type DivC, type HtmlComponentBase } from "sengen-ui";
import type { タブ定義, タブID, タブ群ペイン } from "./レイアウト型";
import { タブ項目属性, タブバー属性, ペインID属性, type DOM同期コンテキスト } from "./DOM同期";
import type { 構築済みタブ群 } from "./構築済みペイン";
import { タブボタン, タブ内ボタン, type タブ内ボタン定義 } from "./タブボタン";
import * as styles from "./style.css";

export function タブ群を同期(
    新: タブ群ペイン,
    旧: 構築済みタブ群 | null,
    コンテキスト: DOM同期コンテキスト,
): 構築済みタブ群 {
    if (旧 === null) return タブ群を新規構築(新, コンテキスト);

    const 変化なし =
        新.タブ一覧 === 旧.ペイン.タブ一覧 &&
        新.選択中 === 旧.ペイン.選択中 &&
        新.タブ一覧.every(タブ => コンテキスト.タブ内ボタン取得(タブ.id) === 旧.タブボタン一覧記録.get(タブ.id));
    if (変化なし) return 旧;

    旧.タブバー.clearChildren();
    const { 要素一覧, ボタン一覧記録 } = タブ項目要素一覧を構築(新.タブ一覧, 新.選択中, コンテキスト);
    旧.タブバー.childs(要素一覧);
    const 添付済みコンテンツ = コンテンツエリアを同期(
        旧.コンテンツエリア, 新.タブ一覧, 新.選択中, 旧.添付済みコンテンツ, コンテキスト,
    );

    return {
        kind: "タブ群",
        ペイン: 新,
        要素: 旧.要素,
        タブバー: 旧.タブバー,
        コンテンツエリア: 旧.コンテンツエリア,
        添付済みコンテンツ,
        タブボタン一覧記録: ボタン一覧記録,
    };
}

function タブ群を新規構築(新: タブ群ペイン, コンテキスト: DOM同期コンテキスト): 構築済みタブ群 {
    const タブバー = div({ class: styles.タブバー })
        .setAttribute(タブバー属性, 新.id)
        .setAttributeIf({
            If: コンテキスト.タブバードラッグ領域,
            True: {
                attr: styles.タブバードラッグ状態.attribute,
                value: styles.タブバードラッグ状態.value.有効,
            },
        });
    const { 要素一覧, ボタン一覧記録 } = タブ項目要素一覧を構築(新.タブ一覧, 新.選択中, コンテキスト);
    タブバー.childs(要素一覧);

    const コンテンツエリア = div({ class: styles.コンテンツエリア });
    const 添付済みコンテンツ = コンテンツエリアを同期(
        コンテンツエリア, 新.タブ一覧, 新.選択中, new Map(), コンテキスト,
    );

    const 要素 = div({ class: styles.タブ群 })
        .setAttribute(ペインID属性, 新.id)
        .childs([タブバー, コンテンツエリア]);

    return {
        kind: "タブ群", ペイン: 新, 要素, タブバー, コンテンツエリア,
        添付済みコンテンツ, タブボタン一覧記録: ボタン一覧記録,
    };
}

function タブ項目要素一覧を構築(
    タブ一覧: readonly タブ定義[],
    選択中: タブID | null,
    コンテキスト: DOM同期コンテキスト,
): { readonly 要素一覧: readonly DivC[]; readonly ボタン一覧記録: ReadonlyMap<タブID, readonly タブ内ボタン定義[]> } {
    const ボタン一覧記録 = new Map<タブID, readonly タブ内ボタン定義[]>();
    const 要素一覧 = タブ一覧.map(タブ => {
        const 内部ボタン一覧 = コンテキスト.タブ内ボタン取得(タブ.id);
        ボタン一覧記録.set(タブ.id, 内部ボタン一覧);
        return div({ class: styles.タブ項目 })
            .setAttribute(タブ項目属性, タブ.id)
            .childs([
                new タブボタン(タブ, 選択中 === タブ.id, コンテキスト),
                ...内部ボタン一覧.map(定義 => new タブ内ボタン(定義)),
            ]);
    });
    return { 要素一覧, ボタン一覧記録 };
}

// 新タブ一覧に対し、既存アタッチ済みのタブは一切 detach/reattach せず、
// 新規タブだけ追加・消えたタブだけ除去する。選択中の表示切替は既存要素に対して
// display スタイルを書き換えるだけで、DOM構造には触れない。
function コンテンツエリアを同期(
    コンテンツエリア: DivC,
    新タブ一覧: readonly タブ定義[],
    新選択中: タブID | null,
    旧添付済みコンテンツ: ReadonlyMap<タブID, HtmlComponentBase>,
    コンテキスト: DOM同期コンテキスト,
): Map<タブID, HtmlComponentBase> {
    const 新タブID集合 = new Set(新タブ一覧.map(t => t.id));
    for (const [消えたID, 消えるコンテンツ] of 旧添付済みコンテンツ) {
        if (!新タブID集合.has(消えたID)) コンテンツエリア.removeChild(消えるコンテンツ);
    }

    const 新添付済みコンテンツ = new Map<タブID, HtmlComponentBase>();
    for (const タブ of 新タブ一覧) {
        const 既存アタッチ済み = 旧添付済みコンテンツ.get(タブ.id);
        const コンテンツ = 既存アタッチ済み ?? コンテキスト.コンテンツ取得(タブ.id);
        if (コンテンツ === null) continue;
        if (既存アタッチ済み === undefined) {
            // flex:1 + minWidth/minHeight:0 で コンテンツエリア(flex column) の残り空間を
            // 全部取り、内部コンテンツがはみ出しても親を超えない。width/height:100% だけだと
            // flex 親の制約を尊重しないため「下半分が空」のような表示崩れが起きる。
            コンテンツ.setStyleCSS({ flex: "1", minWidth: "0", minHeight: "0", width: "100%", height: "100%" });
            コンテンツエリア.child(コンテンツ);
        }
        コンテンツ.setStyleCSS({ display: 新選択中 === タブ.id ? "flex" : "none" });
        新添付済みコンテンツ.set(タブ.id, コンテンツ);
    }
    return 新添付済みコンテンツ;
}
