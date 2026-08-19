/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";
import { div } from "sengen-ui";
import { パネルエリア } from "../パネルエリア/パネルエリア";
import { 領域トグルサービス } from "./領域トグルサービス";
import { 表示状態 } from "./表示状態";

describe("領域トグルサービス", () => {
    it("サイドバーを切り替えるで data-display=collapsed が付け外しされる", () => {
        const サイドバー = div();
        const パネル = new パネルエリア([]);
        const サービス = new 領域トグルサービス(サイドバー, パネル, true, true);

        サービス.サイドバーを切り替える();
        expect(サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);

        サービス.サイドバーを切り替える();
        expect(サイドバー.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
    });

    it("パネルを切り替えるで data-display=collapsed が付け外しされる", () => {
        const サイドバー = div();
        const パネル = new パネルエリア([]);
        const サービス = new 領域トグルサービス(サイドバー, パネル, true, true);

        サービス.パネルを切り替える();
        expect(パネル.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);

        サービス.パネルを切り替える();
        expect(パネル.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
    });

    it("初期非表示から開始すると、初回の切り替えで表示状態になる", () => {
        const サイドバー = div();
        const パネル = new パネルエリア([]);
        const サービス = new 領域トグルサービス(サイドバー, パネル, false, true);

        サービス.サイドバーを切り替える();
        expect(サイドバー.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
    });

    it("利用できない文脈では隠し、戻るとユーザーの表示希望を復元する", () => {
        const サイドバー = div();
        const サービス = new 領域トグルサービス(サイドバー, new パネルエリア([]), true, true);
        サービス.サイドバー利用可能を設定する(false);
        expect(サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        サービス.サイドバーを切り替える();
        expect(サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        サービス.サイドバー利用可能を設定する(true);
        expect(サイドバー.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
    });

    it("左サイドバーを切り替えるで data-display=collapsed が付け外しされる", () => {
        const 右サイドバー = div();
        const 左サイドバー = div().setAttribute(表示状態.attribute, 表示状態.value.collapsed);
        const パネル = new パネルエリア([]);
        const サービス = new 領域トグルサービス(右サイドバー, パネル, true, true, 左サイドバー, false);

        expect(左サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        expect(サービス.左サイドバー表示中か()).toBe(false);

        サービス.左サイドバーを切り替える();
        expect(左サイドバー.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
        expect(サービス.左サイドバー表示中か()).toBe(true);

        サービス.左サイドバーを切り替える();
        expect(左サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        expect(サービス.左サイドバー表示中か()).toBe(false);
    });

    it("左サイドバーを開く/閉じる で明示的に開閉できる", () => {
        const 右サイドバー = div();
        const 左サイドバー = div().setAttribute(表示状態.attribute, 表示状態.value.collapsed);
        const パネル = new パネルエリア([]);
        const サービス = new 領域トグルサービス(右サイドバー, パネル, true, true, 左サイドバー, false);

        サービス.左サイドバーを開く();
        expect(左サイドバー.dom.element.hasAttribute(表示状態.attribute)).toBe(false);
        expect(サービス.左サイドバー表示中か()).toBe(true);

        サービス.左サイドバーを閉じる();
        expect(左サイドバー.dom.element.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        expect(サービス.左サイドバー表示中か()).toBe(false);
    });
});
