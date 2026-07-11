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
});
