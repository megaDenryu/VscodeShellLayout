import { style } from '@vanilla-extract/css';
import { css変数 } from '../テーマ/テーマCSS変数';

export const 垂直 = style({
    width: '4px',
    cursor: 'col-resize',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s',
    flexShrink: 0,
    ':hover': { backgroundColor: css変数('ブルー') },
});

export const 水平 = style({
    height: '4px',
    cursor: 'row-resize',
    backgroundColor: 'transparent',
    transition: 'background-color 0.15s',
    flexShrink: 0,
    ':hover': { backgroundColor: css変数('ブルー') },
});
