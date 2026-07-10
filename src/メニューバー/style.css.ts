import { style } from '@vanilla-extract/css';
import { 配色, フォント } from '../テーマ/デフォルトテーマ';

export const バー = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '35px',
    minHeight: '35px',
    backgroundColor: 配色.クローム背景,
    borderBottom: `1px solid ${配色.クローム境界線}`,
    padding: '0 12px',
});

export const タイトル = style({
    fontSize: '12px',
    fontFamily: フォント.モノ,
    color: 配色.テキスト副,
    letterSpacing: '1px',
    userSelect: 'none',
});

export const 右ボタン群 = style({
    display: 'flex',
    gap: '4px',
});

export const トグルボタン = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    background: 'none',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    color: 配色.テキスト副,
    padding: 0,
    selectors: {
        '&:hover': {
            backgroundColor: 配色.ホバー背景,
            color: 配色.テキスト主,
        },
    },
});
