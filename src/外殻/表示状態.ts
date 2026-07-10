// data-attribute による表示制御。SengenUIガイド第13条・頻出パターン集第6章に準拠。
// show()/hide() が非推奨になったため、表示/非表示はこの属性で切り替える。
//
// 使い方:
//   要素.toggleAttribute(表示状態.attribute, 非表示にするか, 表示状態.value.collapsed)
//
// collapsed が付いている間は display:none（レイアウトから除去）される。
// 属性を外すと（toggleAttribute の第2引数を false で呼ぶ）CSSクラス本来の値に戻る。

export const 表示状態 = {
    attribute: "data-display",
    value: {
        collapsed: "collapsed",
    },
} as const;
