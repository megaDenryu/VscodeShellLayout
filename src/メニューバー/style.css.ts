import { style } from '@vanilla-extract/css';
import { フォント } from '../テーマ/デフォルトテーマ';
import { css変数 } from '../テーマ/テーマCSS変数';

export const バー = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '35px',
    minHeight: '35px',
    backgroundColor: css変数('クローム背景'),
    borderBottom: `1px solid ${css変数('クローム境界線')}`,
    padding: '0 12px',
});

export const タイトル = style({
    fontSize: '12px',
    fontFamily: フォント.モノ,
    color: css変数('テキスト副'),
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
    color: css変数('テキスト副'),
    padding: 0,
    ':hover': {
        backgroundColor: css変数('ホバー背景'),
        color: css変数('テキスト主'),
    },
});
