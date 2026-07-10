import { style } from '@vanilla-extract/css';
import { 配色 } from '../テーマ/デフォルトテーマ';

export const 垂直 = style({
    width: '4px',
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s',
    flexShrink: 0,
    selectors: {
        '&:hover': { backgroundColor: 配色.ブルー },
    },
});

export const 水平 = style({
    height: '4px',
    cursor: 'row-resize',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s',
    flexShrink: 0,
    selectors: {
        '&:hover': { backgroundColor: 配色.ブルー },
    },
});
