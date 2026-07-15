// ペイン木 + DnD 用スタイル定義(Vanilla Extract)。
//
// SengenUI 規約: 静的 CSS は必ず Vanilla Extract、動的値のみ setStyleCSS。
// data-attribute による状態スタイルは globalStyle で定義する(selectors では実行時エラー)。

import { style, globalStyle } from "@vanilla-extract/css";
import { css変数 } from "../../テーマ/テーマCSS変数";

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
    backgroundColor: css変数("ペインスプリッター"),
    flexShrink: 0,
    ":hover": { backgroundColor: css変数("ペインアクセント") },
});

export const スプリッター垂直 = style({
    width: "4px",
    height: "100%",
    cursor: "col-resize",
    backgroundColor: css変数("ペインスプリッター"),
    flexShrink: 0,
    ":hover": { backgroundColor: css変数("ペインアクセント") },
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
    backgroundColor: css変数("ペイン背景"),
});

export const タブバー = style({
    display: "flex",
    flexDirection: "row",
    overflow: "auto",
    backgroundColor: css変数("ペインタブバー背景"),
    borderBottom: `1px solid ${css変数("ペインタブ境界線")}`,
    flexShrink: 0,
    minHeight: "32px",
});

// =============================================================================
// タブバーのウィンドウドラッグ領域化(Electron titlebar除去アプリ向け、外殻レイアウトオプション経由)
// =============================================================================

// csstype(vanilla-extractの型基盤)は -webkit-app-region を未定義のベンダープロパティとして
// 扱う(標準ではないため)。表示状態.ts の !important 回避と同種の型境界キャストで通す。
type ドラッグ領域スタイル = Parameters<typeof globalStyle>[1];

export const タブバードラッグ状態 = {
    attribute: "data-drag-region",
    value: { 有効: "true" },
} as const;

globalStyle(`${タブバー}[${タブバードラッグ状態.attribute}="${タブバードラッグ状態.value.有効}"]`, {
    WebkitAppRegion: "drag",
    // 右端はウィンドウ操作ボタン(最小化/最大化/閉じる)のオーバーレイと重なるため、
    // その分の余白を確保してタブがボタン群の下に潜り込まないようにする。
    // env(titlebar-area-width)はオーバーレイを除いた「安全な」幅そのものなので、
    // バー全幅からそれを引いた値(=オーバーレイの幅)を余白にする。
    // titlebarOverlayが使えない環境(通常ブラウザ等)ではenv()自体が未定義になり、
    // 内側のフォールバック calc(100% - 140px) が使われた結果、外側の計算で140pxになる。
    paddingRight: "calc(100% - env(titlebar-area-width, calc(100% - 140px)))",
} as unknown as ドラッグ領域スタイル);

// 固定幅にしてタブ間で長さを統一。長いラベルは text-overflow: ellipsis で省略表示する。
// 幅統一により DnD 中の挿入位置判定 (タブ中央 x の比較) が直感と一致しやすくなる。
// transition は他タブのスライドアニメ用、ドラッグ中タブ自身は追従の即時性のため
// transition: none を上書き側で当てる。
export const タブボタン = style({
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 58px 6px 12px",
    flex: 1,
    minWidth: 0,
    flexShrink: 0,
    color: css変数("ペインタブテキスト"),
    backgroundColor: css変数("ペインタブ境界線"),
    border: "none",
    borderRight: "none",
    cursor: "pointer",
    fontSize: "13px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    userSelect: "none",
    transition: "transform 0.2s ease",
    willChange: "transform",
    // タブバードラッグ領域が有効な祖先の下でも、タブ自体は常にクリック/DnD操作可能にする。
    // ドラッグ領域が無効なときは無害(-webkit-app-regionはドラッグ祖先がない限り無視される)。
    // csstypeが -webkit-app-region 未定義のため型境界キャスト(タブバードラッグ状態と同種)。
    WebkitAppRegion: "no-drag",
} as unknown as Parameters<typeof style>[0]);

// アクティブタブの状態スタイル(data-attribute)
export const タブ状態 = {
    attribute: "data-tab-state",
    value: { active: "active", inactive: "inactive" },
} as const;

// 選択中タブを「持ち上がったカード」として描き分ける(ユーザー実機指摘: 背景がペイン背景と
// 同一だったため、ペイン背景自体が明るいテーマで周囲の白と同化し無境界で判別不能だった)。
// 背景をペイン背景ではなくパネル表面トークンにし、タブバー背景(半透過白になりうる)との
// 微差で選択状態を示す。上辺にペインアクセントの太線、左右にペインタブ境界線の細線を足し、
// 4本とも box-shadow(inset) で表現する: border だと幅ぶんの高さ/幅補正が要り、ホスト側の
// box-sizing 設定(このライブラリはリセットCSSを持たない)に依存してタブが1〜3pxずれる
// リスクがあるが、inset box-shadow はボックスサイズに一切影響しないため補正不要で済む。
globalStyle(`${タブボタン}[${タブ状態.attribute}="${タブ状態.value.active}"]`, {
    backgroundColor: css変数("パネル表面"),
    color: css変数("ペインタブアクティブテキスト"),
    border: "none",
    boxShadow: [
        `inset 0 2px 0 0 ${css変数("ペインアクセント")}`,
        `inset 1px 0 0 0 ${css変数("ペインタブ境界線")}`,
        `inset -1px 0 0 0 ${css変数("ペインタブ境界線")}`,
    ].join(", "),
});

export const タブ閉じる = style({
    position: "absolute",
    right: "6px",
    top: "8px",
    flexShrink: 0,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "16px",
    height: "16px",
    borderRadius: "3px",
    color: css変数("ペインタブテキスト"),
    cursor: "pointer",
    opacity: 0.6,
    ":hover": {
        opacity: 1,
        backgroundColor: css変数("ペイン閉じるホバー"),
    },
});

export const タブ内ボタン = style({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: "28px",
    top: "4px",
    width: "24px",
    height: "24px",
    margin: 0,
    padding: 0,
    border: "none",
    borderRadius: "4px",
    color: css変数("ペインタブテキスト"),
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "11px",
    whiteSpace: "nowrap",
    WebkitAppRegion: "no-drag",
    ":hover": { backgroundColor: css変数("ペイン閉じるホバー") },
} as unknown as Parameters<typeof style>[0]);

export const タブ項目 = style({
    display: "inline-flex",
    position: "relative",
    alignItems: "stretch",
    width: "190px",
    minHeight: "32px",
    boxSizing: "border-box",
    flexShrink: 0,
    backgroundColor: css変数("ペインタブ境界線"),
    borderRight: `1px solid ${css変数("ペイン背景")}`,
    transition: "transform 0.2s ease",
    willChange: "transform",
});

globalStyle(`${タブ項目}:has(${タブボタン}[${タブ状態.attribute}="${タブ状態.value.active}"])`, {
    backgroundColor: css変数("パネル表面"),
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
    backgroundColor: css変数("ペインDnDヒント背景"),
    border: `2px solid ${css変数("ペインアクセント")}`,
    boxSizing: "border-box",
    transition: "left 0.06s ease-out, top 0.06s ease-out, width 0.06s ease-out, height 0.06s ease-out",
    zIndex: 9999,
    display: "none",
});

