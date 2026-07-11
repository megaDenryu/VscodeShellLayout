/**
 * @vitest-environment jsdom
 */

// サイドバートグルボタン/パネルトグルボタン: メニューバーから切り出した独立コンポーネント。
// 配線する() で受けた Iレイアウトトグル操作 を通じて動作すること、
// 未配線のまま操作されたら例外で明示されることを検証する。

import { describe, expect, it, vi } from "vitest";
import { サイドバートグルボタン } from "./サイドバートグルボタン";
import { パネルトグルボタン } from "./パネルトグルボタン";
import type { Iレイアウトトグル操作 } from "../レイアウトトグル操作";

function クリックする(要素: HTMLElement): void {
    要素.dispatchEvent(new MouseEvent("click", { bubbles: true }));
}

describe("サイドバートグルボタン", () => {
    it("配線した操作のサイドバーを切り替えるがクリックで呼ばれる", () => {
        const 操作: Iレイアウトトグル操作 = {
            サイドバーを切り替える: vi.fn(),
            パネルを切り替える: vi.fn(),
        };
        const ボタン = new サイドバートグルボタン().配線する(操作);
        クリックする(ボタン.dom.element);
        expect(操作.サイドバーを切り替える).toHaveBeenCalledTimes(1);
        expect(操作.パネルを切り替える).not.toHaveBeenCalled();
    });

    it("配線する() を呼ばずにクリックすると未配線の例外が発生する（DOM仕様上、リスナ内の例外は呼び出し元へは伝播しないため、window の error イベントで捕捉する）", () => {
        const ボタン = new サイドバートグルボタン();
        let 捕捉した例外: unknown = null;
        const onError = (e: ErrorEvent) => { 捕捉した例外 = e.error; e.preventDefault(); };
        window.addEventListener("error", onError);
        try {
            クリックする(ボタン.dom.element);
        } finally {
            window.removeEventListener("error", onError);
        }
        expect(捕捉した例外).toBeInstanceOf(Error);
        expect((捕捉した例外 as Error).message).toMatch(/未配線/);
    });
});

describe("パネルトグルボタン", () => {
    it("配線した操作のパネルを切り替えるがクリックで呼ばれる", () => {
        const 操作: Iレイアウトトグル操作 = {
            サイドバーを切り替える: vi.fn(),
            パネルを切り替える: vi.fn(),
        };
        const ボタン = new パネルトグルボタン().配線する(操作);
        クリックする(ボタン.dom.element);
        expect(操作.パネルを切り替える).toHaveBeenCalledTimes(1);
        expect(操作.サイドバーを切り替える).not.toHaveBeenCalled();
    });
});

describe("外殻レイアウト は Iレイアウトトグル操作 として独立トグルボタンに直接配線できる", () => {
    it("シェル自身を配線すると、ボタンのクリックで実際のサイドバー表示状態(data-display)が切り替わる", async () => {
        const { 外殻レイアウト } = await import("../外殻レイアウト");
        const { 表示状態 } = await import("../表示状態");
        const サイドバートグル = new サイドバートグルボタン();
        // 構築時オプションでスロットに配置し、シェル構築後に配線する（配線は構築後1回だけでよい）
        const シェル = new 外殻レイアウト({
            タイトル: "t",
            アクティビティ項目一覧: [],
            ステータスバー左: サイドバートグル,
        });
        サイドバートグル.配線する(シェル);

        // 右サイドバー有効省略時は初期非表示 = data-display="collapsed" が付いている
        const 対象 = シェル.dom.element.querySelector(`[${表示状態.attribute}]`);
        expect(対象?.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);

        クリックする(サイドバートグル.dom.element);

        expect(対象?.hasAttribute(表示状態.attribute)).toBe(false);
    });
});
