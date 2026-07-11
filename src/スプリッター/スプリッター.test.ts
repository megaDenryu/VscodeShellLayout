/**
 * @vitest-environment jsdom
 */

// マトリョーシカシェル対策(iframeポインタ制御.ts参照)の配線先である外殻スプリッター
// (右サイドバー幅・パネル高さの調整ハンドル)が、ドラッグ開始でiframeのpointer-eventsを
// noneにし、ドラッグ終了で元へ戻すことを検証する。

import { describe, expect, it, afterEach } from "vitest";
import { スプリッター } from "./スプリッター";

function iframeを追加する(): HTMLIFrameElement {
    const el = document.createElement("iframe");
    document.body.appendChild(el);
    return el;
}

describe("スプリッター - マトリョーシカシェル対策", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("mousedownでドラッグ開始するとiframeのpointer-eventsがnoneになり、mouseupで戻る", () => {
        const iframe = iframeを追加する();
        const 分割ペイン = new スプリッター("垂直", { onリサイズ中: () => {} });
        document.body.appendChild(分割ペイン.dom.element);

        分割ペイン.dom.element.dispatchEvent(
            new MouseEvent("mousedown", { clientX: 0, clientY: 0, bubbles: true }),
        );
        expect(iframe.style.pointerEvents).toBe("none");

        document.dispatchEvent(new MouseEvent("mouseup", { clientX: 10, clientY: 0 }));
        expect(iframe.style.pointerEvents).toBe("");
    });

    it("ドラッグ中のmousemoveはiframe越しでも一時停止済みのためハンドラへ届く", () => {
        const iframeを跨ぐ = iframeを追加する();
        const 受信delta: number[] = [];
        const 分割ペイン = new スプリッター("垂直", {
            onリサイズ中: delta => { 受信delta.push(delta); },
        });
        document.body.appendChild(分割ペイン.dom.element);

        分割ペイン.dom.element.dispatchEvent(
            new MouseEvent("mousedown", { clientX: 0, clientY: 0, bubbles: true }),
        );
        // iframe要素そのものにdispatchしても、pointer-events:noneはCSSヒットテストの話であり
        // jsdomはヒットテストを行わないため、ここでは「document配線への到達」を検証する
        // (実ブラウザでのヒットテスト回避効果は iframeポインタ制御.test.ts でスタイル反映を検証済み)。
        document.dispatchEvent(new MouseEvent("mousemove", { clientX: 25, clientY: 0 }));
        expect(受信delta).toEqual([25]);
        expect(iframeを跨ぐ.style.pointerEvents).toBe("none");

        document.dispatchEvent(new MouseEvent("mouseup", { clientX: 25, clientY: 0 }));
    });
});
