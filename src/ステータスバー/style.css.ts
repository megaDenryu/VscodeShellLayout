import { style } from '@vanilla-extract/css';
import { フォント } from '../テーマ/デフォルトテーマ';
import { css変数 } from '../テーマ/テーマCSS変数';

export const バー = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '22px',
    minHeight: '22px',
    backgroundColor: css変数('ネイビー'),
    padding: '0 8px',
    flexShrink: 0,
});

export const セクション = style({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
});

export const テキスト = style({
    fontSize: '11px',
    fontFamily: フォント.標準,
    color: css変数('ステータスバーテキスト'),
    userSelect: 'none',
    lineHeight: '22px',
});
