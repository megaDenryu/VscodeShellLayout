import { style } from '@vanilla-extract/css';
import { 配色, フォント } from '../テーマ/デフォルトテーマ';

export const バー = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '22px',
    minHeight: '22px',
    backgroundColor: 配色.ネイビー,
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
    color: '#ffffff',
    userSelect: 'none',
    lineHeight: '22px',
});
