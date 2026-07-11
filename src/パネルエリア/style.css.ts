import { style, globalStyle } from '@vanilla-extract/css';
import { 配色, フォント } from '../テーマ/デフォルトテーマ';

export const エリア = style({
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
});

export const タブバー = style({
    display: 'flex',
    height: '30px',
    minHeight: '30px',
    backgroundColor: 配色.クローム背景,
    borderTop: `1px solid ${配色.クローム境界線}`,
    borderBottom: `1px solid ${配色.クローム境界線}`,
    overflow: 'hidden',
});

export const タブ = style({
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    fontSize: '11px',
    fontFamily: フォント.標準,
    color: 配色.テキスト副,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    userSelect: 'none',
    ':hover': { color: 配色.テキスト主 },
});

export const タブ状態 = {
    attribute: 'data-active',
    value: { active: 'true', inactive: 'false' },
} as const;

globalStyle(`${タブ}[${タブ状態.attribute}="${タブ状態.value.active}"]`, {
    color: 配色.テキスト主,
    borderBottomColor: 配色.ブルー,
});

export const コンテンツ = style({
    flex: '1',
    overflow: 'auto',
    backgroundColor: 配色.パネル背景,
});
