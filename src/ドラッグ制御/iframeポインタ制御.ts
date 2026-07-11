// マトリョーシカシェル(README「マトリョーシカシェル」参照)でエディタタブに別アプリの
// 外殻レイアウトをiframeとしてホストしている場合、外側のドラッグ操作(サイドバー幅・
// パネル高さ・ペイン分割スプリッター・タブDnD)の追跡中にカーソルがiframe上へ入ると、
// mousemove/pointermoveがiframe自身のdocumentに奪われ、外側のdocumentへ届かなくなる
// (ネイティブのイベント配送はカーソル直下のdocumentへ振り分けられるため、iframeという
// 別docmentの境界を越えて外側へbubbleしない)。ドラッグ開始時にページ上の全iframeへ
// pointer-events:noneを一時適用してカーソルイベントを外側documentへ確実に届かせ、
// ドラッグ終了時に元のインラインstyleへ戻す。

export interface iframeポインタ制御ハンドル {
    解除する(): void;
}

export function iframeへのポインタイベントを一時停止する(): iframeポインタ制御ハンドル {
    const 対象一覧 = Array.from(document.querySelectorAll("iframe"));
    const 退避値一覧 = 対象一覧.map(要素 => 要素.style.pointerEvents);
    対象一覧.forEach(要素 => { 要素.style.pointerEvents = "none"; });

    let 解除済み = false;
    return {
        解除する(): void {
            if (解除済み) return;
            解除済み = true;
            対象一覧.forEach((要素, index) => { 要素.style.pointerEvents = 退避値一覧[index]; });
        },
    };
}
