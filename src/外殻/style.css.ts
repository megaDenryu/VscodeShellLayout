import { style, globalStyle } from '@vanilla-extract/css';
import { フォント } from '../テーマ/デフォルトテーマ';
import { css変数 } from '../テーマ/テーマCSS変数';
import { 表示状態 } from './表示状態';

// SengenUIガイド第13条の表示状態ルール。
// 外殻レイアウト配下の任意の要素に data-display="collapsed" を付けると
// display:none になる。show()/hide() の非推奨代替。
globalStyle(`[${表示状態.attribute}="${表示状態.value.collapsed}"]`, {
    display: 'none !important' as unknown as 'none',
});

export const ルート = style({
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    backgroundColor: css変数('アプリ背景'),
    fontFamily: フォント.標準,
    color: css変数('クロームテキスト'),
    overflow: 'hidden',
});

export const 中央エリア = style({
    display: 'flex',
    flexDirection: 'row',
    flex: '1',
    overflow: 'hidden',
});

export const メインエリア = style({
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
});

export const 右サイドバー = style({
    width: '260px',
    backgroundColor: css変数('パネル表面'),
    borderLeft: `1px solid ${css変数('パネル境界線')}`,
    overflow: 'auto',
});
