/**
 * @vitest-environment jsdom
 */

// アクティビティバー下部の一般化: 固定の設定ボタンを廃止し、
// アクティビティバー下部項目一覧 による注入に置き換えた（後方互換込み）。

import { describe, expect, it, vi } from "vitest";
import { アクティビティバー } from "./アクティビティバー";
import { アクティビティID } from "./アクティビティID";
import { 設定アイコン, サイドバーアイコン } from "../アイコン/アイコン定義";

describe("アクティビティバー 下部スロットの一般化", () => {
    it("下部項目一覧を省略すると、旧挙動どおり固定の設定ボタンが表示され on設定クリック が発火する", () => {
        const バー = new アクティビティバー([]);
        const on設定 = vi.fn();
        バー.on設定クリック(on設定);

        expect(バー.dom.element.textContent).toContain("設定");
        // 設定ボタン自身（子を持たない最も内側のdiv）をクリックする。
        // querySelectorAll は文書順（親→子）で返すため、末尾から探すと最も内側の要素が拾える。
        const 設定ボタン要素 = Array.from(バー.dom.element.querySelectorAll("div"))
            .reverse()
            .find(el => el.textContent === "設定");
        expect(設定ボタン要素).toBeDefined();
        設定ボタン要素?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(on設定).toHaveBeenCalledTimes(1);
    });

    it("下部項目一覧を指定すると、指定した項目に置き換わり on選択(id) で受け取れる", () => {
        const 設定ID = アクティビティID("設定");
        const バー = new アクティビティバー(
            [],
            [{ id: 設定ID, ラベル: "設定", アイコン: 設定アイコン }],
        );
        const on選択 = vi.fn();
        バー.イベントを設定する({ on選択 });

        const 項目要素 = Array.from(バー.dom.element.querySelectorAll("div"))
            .reverse()
            .find(el => el.textContent === "設定");
        項目要素?.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(on選択).toHaveBeenCalledWith(設定ID);
    });

    it("下部項目一覧を指定すると、複数項目・非設定系アイコンも配置できる", () => {
        const 拡張ID = アクティビティID("拡張");
        const バー = new アクティビティバー(
            [],
            [{ id: 拡張ID, ラベル: "拡張", アイコン: サイドバーアイコン }],
        );
        expect(バー.dom.element.textContent).toContain("拡張");
        expect(バー.dom.element.textContent).not.toContain("設定");
    });
});
