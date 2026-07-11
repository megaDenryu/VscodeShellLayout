/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, afterEach } from "vitest";
import { iframeへのポインタイベントを一時停止する } from "./iframeポインタ制御";

function iframeを追加する(初期pointerEvents?: string): HTMLIFrameElement {
    const el = document.createElement("iframe");
    if (初期pointerEvents !== undefined) el.style.pointerEvents = 初期pointerEvents;
    document.body.appendChild(el);
    return el;
}

describe("iframeへのポインタイベントを一時停止する", () => {
    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("開始するとページ上の全iframeの pointer-events が none になる", () => {
        const a = iframeを追加する();
        const b = iframeを追加する();
        iframeへのポインタイベントを一時停止する();
        expect(a.style.pointerEvents).toBe("none");
        expect(b.style.pointerEvents).toBe("none");
    });

    it("解除するとpointer-eventsが未設定(空文字)へ戻る", () => {
        const iframe = iframeを追加する();
        const 制御 = iframeへのポインタイベントを一時停止する();
        制御.解除する();
        expect(iframe.style.pointerEvents).toBe("");
    });

    it("停止前に既にpointer-eventsが設定されていた場合、その元の値へ戻る(元値を破壊しない)", () => {
        const iframe = iframeを追加する("auto");
        const 制御 = iframeへのポインタイベントを一時停止する();
        expect(iframe.style.pointerEvents).toBe("none");
        制御.解除する();
        expect(iframe.style.pointerEvents).toBe("auto");
    });

    it("解除するを複数回呼んでも二重復元されない(冪等)", () => {
        const iframe = iframeを追加する("auto");
        const 制御 = iframeへのポインタイベントを一時停止する();
        制御.解除する();
        iframe.style.pointerEvents = "none";
        制御.解除する();
        expect(iframe.style.pointerEvents).toBe("none");
    });

    it("停止後に追加されたiframeには影響しない(スナップショット時点の一覧のみ対象)", () => {
        const 既存 = iframeを追加する();
        const 制御 = iframeへのポインタイベントを一時停止する();
        const 後から追加 = iframeを追加する();
        expect(既存.style.pointerEvents).toBe("none");
        expect(後から追加.style.pointerEvents).toBe("");
        制御.解除する();
    });
});
