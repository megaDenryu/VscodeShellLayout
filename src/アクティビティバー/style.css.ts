import { style, globalStyle } from '@vanilla-extract/css';
import { css変数 } from '../テーマ/テーマCSS変数';

export const バー = style({
    display: 'flex',
    flexDirection: 'column',
    width: '48px',
    backgroundColor: css変数('クローム背景'),
    borderRight: `1px solid ${css変数('クローム境界線')}`,
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
    color: css変数('テキスト副'),
    position: 'relative',
    border: 'none',
    background: 'none',
    padding: 0,
    ':hover': { color: css変数('テキスト主') },
});

export const 項目状態 = {
    attribute: 'data-active',
    value: { active: 'true', inactive: 'false' },
} as const;

globalStyle(`${項目}[${項目状態.attribute}="${項目状態.value.active}"]`, {
    color: css変数('テキスト主'),
});

globalStyle(`${項目}[${項目状態.attribute}="${項目状態.value.active}"]::before`, {
    content: '""',
    position: 'absolute',
    left: '0',
    top: '0',
    bottom: '0',
    width: '2px',
    backgroundColor: css変数('ブルー'),
});

export const 項目ラベル = style({
    fontSize: '9px',
    marginTop: '2px',
    userSelect: 'none',
    lineHeight: '1',
});

export const 項目バッジ = style({
    position: 'absolute',
    top: '3px',
    right: '3px',
    minWidth: '17px',
    height: '17px',
    padding: '0 4px',
    borderRadius: '999px',
    backgroundColor: '#d94f5c',
    color: '#ffffff',
    fontSize: '10px',
    fontWeight: 700,
    lineHeight: '17px',
    textAlign: 'center',
    boxSizing: 'border-box',
    pointerEvents: 'none',
});

globalStyle(`${項目バッジ}[data-visible="false"]`, { display: 'none' });

// 狭幅対応（オプトイン、外殻レイアウトオプション「狭幅ではラベルを省略する」参照）:
// data-狭幅ラベル省略="true" を明示指定したアプリだけ、狭幅ビューポートでラベルを
// 隠す（アイコンのみ表示。ラベルはtitle属性のツールチップとして残す）。属性未指定の
// 既存アプリ（Jimbo/Pokemon）はメディアクエリの対象外なので挙動は一切変わらない。
globalStyle(`${バー}[data-狭幅ラベル省略="true"] ${項目ラベル}`, {
    '@media': {
        'screen and (max-width: 767px)': {
            display: 'none',
        },
    },
});
