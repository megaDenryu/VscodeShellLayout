import type { テーマ配色 } from './テーマ型';
import { 配色 } from './デフォルトテーマ';

// テーマ配色の各トークンとCSSカスタムプロパティ名を1対1対応させる。
// 外殻レイアウトはオプションのテーマをここに列挙した変数名でルート要素に適用し（外殻レイアウト.ts）、
// 各style.css.tsは css変数() 経由でこの変数名を参照する。
// CSS変数はDOMカスケードするため、入れ子シェル（マトリョーシカシェル。README参照）では
// 内側シェルのルートに別テーマを適用するだけで内外の配色を描き分けられる。
export const テーマCSS変数名: { readonly [K in keyof テーマ配色]: `--vsl-${string}` } = {
    アプリ背景: '--vsl-app-bg',
    クローム背景: '--vsl-chrome-bg',
    クローム境界線: '--vsl-chrome-border',
    クロームテキスト: '--vsl-chrome-text',
    テキスト主: '--vsl-text-primary',
    テキスト副: '--vsl-text-secondary',
    テキスト薄: '--vsl-text-tertiary',
    アクティブ背景: '--vsl-active-bg',
    ホバー背景: '--vsl-hover-bg',
    パネル背景: '--vsl-panel-bg',
    パネル表面: '--vsl-panel-surface',
    パネルホバー: '--vsl-panel-hover',
    パネル境界線: '--vsl-panel-border',
    パネルテキスト主: '--vsl-panel-text-primary',
    パネルテキスト副: '--vsl-panel-text-secondary',
    パネルテキスト薄: '--vsl-panel-text-tertiary',
    ステータスバーテキスト: '--vsl-statusbar-text',
    ペイン背景: '--vsl-pane-bg',
    ペインタブバー背景: '--vsl-pane-tabbar-bg',
    ペインタブ境界線: '--vsl-pane-tab-border',
    ペインタブテキスト: '--vsl-pane-tab-text',
    ペインタブアクティブテキスト: '--vsl-pane-tab-active-text',
    ペインアクセント: '--vsl-pane-accent',
    ペインスプリッター: '--vsl-pane-splitter',
    ペイン閉じるホバー: '--vsl-pane-close-hover',
    ペインDnDヒント背景: '--vsl-pane-dnd-hint-bg',
    ネイビー: '--vsl-navy',
    イエロー: '--vsl-yellow',
    ブルー: '--vsl-blue',
};

// style.css.ts から呼ぶヘルパー。CSS変数が未設定（テーマ未指定）の間は
// デフォルトテーマ.配色 の値がそのままフォールバックされ、現行の見た目と完全に一致する。
export function css変数(トークン: keyof テーマ配色): string {
    return `var(${テーマCSS変数名[トークン]}, ${配色[トークン]})`;
}
