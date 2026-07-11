import { style, globalStyle } from '@vanilla-extract/css';
import { 配色, フォント } from '../テーマ/デフォルトテーマ';

export const エリア = style({
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
    overflow: 'hidden',
});

export const タブバー = style({
    display: 'flex',
    height: '35px',
    minHeight: '35px',
    backgroundColor: 配色.クローム背景,
    borderBottom: `1px solid ${配色.クローム境界線}`,
    overflow: 'hidden',
});

export const タブ = style({
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    fontSize: '13px',
    fontFamily: フォント.標準,
    color: 配色.テキスト副,
    cursor: 'pointer',
    borderRight: `1px solid ${配色.クローム境界線}`,
    userSelect: 'none',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    ':hover': { color: 配色.テキスト主 },
});

export const タブ状態 = {
    attribute: 'data-active',
    value: { active: 'true', inactive: 'false' },
} as const;

globalStyle(`${タブ}[${タブ状態.attribute}="${タブ状態.value.active}"]`, {
    color: 配色.テキスト主,
    backgroundColor: 配色.アプリ背景,
    borderBottomColor: 配色.ブルー,
});

export const コンテンツ = style({
    flex: '1',
    overflow: 'hidden',
    backgroundColor: 配色.パネル背景,
    display: 'flex',
    position: 'relative',
});
