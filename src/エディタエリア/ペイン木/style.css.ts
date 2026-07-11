// ペイン木 + DnD 用スタイル定義(Vanilla Extract)。
//
// SengenUI 規約: 静的 CSS は必ず Vanilla Extract、動的値のみ setStyleCSS。
// data-attribute による状態スタイルは globalStyle で定義する(selectors では実行時エラー)。

import { style, globalStyle } from "@vanilla-extract/css";

// =============================================================================
// ペイン木のレイアウト
// =============================================================================

// 注: 以下のスタイルは `width: 100% / height: 100%` ではなく `flex: 1; minWidth: 0; minHeight: 0`
// を基本とする。flex 子コンテナで `width/height: 100%` だけ指定すると、内部コンテンツがはみ出した
// 時に親の制約を超えてしまい、コンテンツエリアが「上半分だけ表示、下半分が空(=タブ群が縮んでない)」
// のような実機バグを引き起こす(ユーザー実機指摘 2026-04-30)。
// flex:1 + minWidth:0 + minHeight:0 で親 flex の制約を尊重しつつ、子のはみ出しでも縮められる。
export const ルート = style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
    position: "relative",
});

export const 左右分割 = style({
    display: "flex",
    flexDirection: "row",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
});

export const 上下分割 = style({
    display: "flex",
    flexDirection: "column",
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
    overflow: "hidden",
});

// 分割の境界スプリッター(ドラッグでサイズ変更)
export const スプリッター水平 = style({
    width: "100%",
    height: "4px",
    cursor: "row-resize",
    backgroundColor: "#3c3c3c",
    flexShrink: 0,
    ":hover": { backgroundColor: "#007acc" },
});

export const スプリッター垂直 = style({
    width: "4px",
    height: "100%",
    cursor: "col-resize",
    backgroundColor: "#3c3c3c",
    flexShrink: 0,
    ":hover": { backgroundColor: "#007acc" },
});

// =============================================================================
// タブ群ペイン
// =============================================================================

export const タブ群 = style({
    display: "flex",
    flexDirection: "column",
    // flex:1 で親(分割ペイン or メイン領域) の残り空間を全部取る。
    // minWidth/minHeight:0 で flex 子の最小サイズ制約を解いて、コンテンツがはみ出ても
    // 親の枠内に収める(下半分が空になる実機バグの根治)。
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: "#1e1e1e",
});

export const タブバー = style({
    display: "flex",
    flexDirection: "row",
    overflow: "auto",
    backgroundColor: "#252526",
    borderBottom: "1px solid #2d2d30",
    flexShrink: 0,
    minHeight: "32px",
});

// 固定幅にしてタブ間で長さを統一。長いラベルは text-overflow: ellipsis で省略表示する。
// 幅統一により DnD 中の挿入位置判定 (タブ中央 x の比較) が直感と一致しやすくなる。
// transition は他タブのスライドアニメ用、ドラッグ中タブ自身は追従の即時性のため
// transition: none を上書き側で当てる。
export const タブボタン = style({
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 12px",
    width: "160px",
    flexShrink: 0,
    color: "#cccccc",
    backgroundColor: "#2d2d30",
    border: "none",
    borderRight: "1px solid #1e1e1e",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    userSelect: "none",
    transition: "transform 0.2s ease",
    willChange: "transform",
});

// アクティブタブの状態スタイル(data-attribute)
export const タブ状態 = {
    attribute: "data-tab-state",
    value: { active: "active", inactive: "inactive" },
} as const;

globalStyle(`${タブボタン}[${タブ状態.attribute}="${タブ状態.value.active}"]`, {
    backgroundColor: "#1e1e1e",
    color: "#ffffff",
    borderBottom: "1px solid #1e1e1e",
});

export const タブ閉じる = style({
    // marginLeft: auto でタブボタン (inline-flex) の右端に押し出す。
    marginLeft: "auto",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    color: "#cccccc",
    cursor: "pointer",
    opacity: 0.6,
    ":hover": {
        opacity: 1,
        backgroundColor: "#37373d",
    },
});

export const コンテンツエリア = style({
    flex: 1,
    // minHeight:0 で flex 子の最小サイズ制約を解く。これがないと内部コンテンツが
    // 高さを要求した時にコンテンツエリアが縮まず、親(タブ群)の高さからはみ出す。
    minHeight: 0,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    position: "relative",
});

// 単一コンテンツがコンテンツエリアの中で 100% 高さ/幅を取れるように。
// 各コンテンツ要素には DOM同期 で setStyleCSS({ flex:1, minWidth:0, minHeight:0 }) を当てる
// (width/height:100% ではなく flex で取らせることで、コンテンツの子要素がはみ出した時の
// 親への波及を断つ)。
export const コンテンツアイテム = style({
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    width: "100%",
    height: "100%",
});

// =============================================================================
// DnD 中のドロップ可能領域ハイライト
// =============================================================================

// ドロップヒント枠。現在のドロップターゲットの矩形を半透明で塗り、
// ユーザーが「離した時に何が起きるか」を視覚的に予測できるようにする。
// pointer-events: none で マウスイベントを透過(下のペインへの DnD 配線を妨げない)。
// 既定で hidden、表示時に setStyleCSS で位置・サイズ・display を上書き。
export const DnD領域ヒント = style({
    position: "fixed",
    pointerEvents: "none",
    backgroundColor: "rgba(0, 122, 204, 0.25)",
    border: "2px solid #007acc",
    boxSizing: "border-box",
    transition: "left 0.06s ease-out, top 0.06s ease-out, width 0.06s ease-out, height 0.06s ease-out",
    zIndex: 9999,
    display: "none",
});

