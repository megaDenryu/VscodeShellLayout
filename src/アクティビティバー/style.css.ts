import { style, globalStyle } from '@vanilla-extract/css';
import { 配色 } from '../テーマ/デフォルトテーマ';

export const バー = style({
    display: 'flex',
    flexDirection: 'column',
    width: '48px',
    backgroundColor: 配色.クローム背景,
    borderRight: `1px solid ${配色.クローム境界線}`,
    paddingTop: '4px',
    flexShrink: 0,
});

export const 項目群 = style({
    display: 'flex',
    flexDirection: 'column',
    flex: '1',
});

export const 下部 = style({
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '4px',
});

export const 項目 = style({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    cursor: 'pointer',
    color: 配色.テキスト副,
    position: 'relative',
    border: 'none',
    background: 'none',
    padding: 0,
    ':hover': { color: 配色.テキスト主 },
});

export const 項目状態 = {
    attribute: 'data-active',
    value: { active: 'true', inactive: 'false' },
} as const;

globalStyle(`${項目}[${項目状態.attribute}="${項目状態.value.active}"]`, {
    color: 配色.テキスト主,
});

globalStyle(`${項目}[${項目状態.attribute}="${項目状態.value.active}"]::before`, {
    content: '""',
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: 配色.ブルー,
});

export const 項目ラベル = style({
    fontSize: '9px',
    marginTop: '2px',
    userSelect: 'none',
    lineHeight: '1',
});
