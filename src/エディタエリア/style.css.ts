import { style, globalStyle } from '@vanilla-extract/css';
import { css変数 } from '../テーマ/テーマCSS変数';

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
    backgroundColor: css変数('クローム背景'),
    borderBottom: `1px solid ${css変数('クローム境界線')}`,
    overflow: 'hidden',
});

export const タブ = style({
    display: 'flex',
    alignItems: 'center',
    padding: '0 16px',
    fontSize: '13px',
    fontFamily: css変数('基本フォントファミリ'),
    fontWeight: css変数('基本文字ウェイト'),
    color: css変数('テキスト副'),
    cursor: 'pointer',
    borderRight: `1px solid ${css変数('クローム境界線')}`,
    userSelect: 'none',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    whiteSpace: 'nowrap',
    ':hover': { color: css変数('テキスト主') },
});

export const タブ状態 = {
    attribute: 'data-active',
    value: { active: 'true', inactive: 'false' },
} as const;

globalStyle(`${タブ}[${タブ状態.attribute}="${タブ状態.value.active}"]`, {
    color: css変数('テキスト主'),
    backgroundColor: css変数('アプリ背景'),
    borderBottomColor: css変数('ブルー'),
});

export const コンテンツ = style({
    flex: '1',
    overflow: 'hidden',
    backgroundColor: css変数('パネル背景'),
    display: 'flex',
    position: 'relative',
});
