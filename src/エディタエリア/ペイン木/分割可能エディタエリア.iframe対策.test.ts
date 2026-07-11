/**
 * @vitest-environment jsdom
 */

// マトリョーシカシェル対策(iframeポインタ制御.ts参照)。タブDnDおよびペイン分割
// スプリッターのドラッグ中、ページ上のiframeへ pointer-events:none が適用され、
// ドラッグ終了(pointerup)・中断(Esc)で確実に解除されることを検証する。

import { describe, expect, it, afterEach } from "vitest";
import { div, type DivC } from "sengen-ui";
import { 分割可能エディタエリア } from "./分割可能エディタエリア";

function ダミーコンテンツ(ラベル: string): DivC {
    return div({ text: ラベル });
}

function iframeを追加する(): HTMLIFrameElement {
    const el = document.createElement("iframe");
    document.body.appendChild(el);
    return el;
}

describe("分割可能エディタエリア - タブDnD中のiframe対策", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("タブpointerdownでiframeがpointer-events:noneになり、pointerupで戻る", () => {
        const iframe = iframeを追加する();
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        const ボタン = area.dom.element.querySelector("button");
        if (ボタン === null) throw new Error("タブボタンが DOM に見つからない");

        ボタン.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, bubbles: true }));
        expect(iframe.style.pointerEvents).toBe("none");

        document.dispatchEvent(new PointerEvent("pointerup", { clientX: 0, clientY: 0 }));
        expect(iframe.style.pointerEvents).toBe("");
    });

    it("ドラッグ中のEsc中断でもiframeのpointer-eventsが復元される", () => {
        const iframe = iframeを追加する();
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        const ボタン = area.dom.element.querySelector("button");
        if (ボタン === null) throw new Error("タブボタンが DOM に見つからない");

        ボタン.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, bubbles: true }));
        expect(iframe.style.pointerEvents).toBe("none");

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        expect(iframe.style.pointerEvents).toBe("");
    });

    it("dispose時にドラッグ中であればiframeのpointer-eventsが復元される", () => {
        const iframe = iframeを追加する();
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        const ボタン = area.dom.element.querySelector("button");
        if (ボタン === null) throw new Error("タブボタンが DOM に見つからない");

        ボタン.dispatchEvent(new PointerEvent("pointerdown", { clientX: 0, clientY: 0, bubbles: true }));
        expect(iframe.style.pointerEvents).toBe("none");

        area.dispose();
        expect(iframe.style.pointerEvents).toBe("");
    });
});
