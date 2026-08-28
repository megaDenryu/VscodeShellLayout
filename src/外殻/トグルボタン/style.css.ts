import { globalStyle, style } from '@vanilla-extract/css';
import { css変数 } from '../../テーマ/テーマCSS変数';
import { 押せる状態 } from '../開閉ボタン';

// メニューバー以外の任意のスロット（ステータスバー・アクティビティバー下部等）に
// 置いても収まるよう、メニューバーのトグルボタンより一回り小さいサイズにする。
export const ボタン = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    background: 'none',
    border: 'none',
    borderRadius: '3px',
    cursor: 'pointer',
    color: css変数('テキスト副'),
    padding: 0,
    ':hover': {
        backgroundColor: css変数('ホバー背景'),
        color: css変数('テキスト主'),
    },
});

// 領域が利用できない文脈では押せない見た目にする(メニューバーの開閉ボタンと同じ扱い)。
globalStyle(`${ボタン}[${押せる状態.attribute}="${押せる状態.value.押せない}"]`, {
    opacity: 0.35,
    cursor: 'default',
    pointerEvents: 'none',
});
