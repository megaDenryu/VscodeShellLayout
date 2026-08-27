/**
 * @vitest-environment jsdom
 */

import { describe, expect, it, vi } from "vitest";
import { div } from "sengen-ui";
import { 外殻レイアウト } from "./外殻レイアウト";
import { アクティビティID } from "../アクティビティバー/アクティビティID";
import { 表示状態 } from "./表示状態";

const ダミーアイコン = () => div({ text: "icon" });

function 基本オプション() {
    return {
        タイトル: "テストアプリ",
        アクティビティ項目一覧: [
            { id: アクティビティID("探索"), ラベル: "探索", アイコン: ダミーアイコン },
            { id: アクティビティID("検索"), ラベル: "検索", アイコン: ダミーアイコン },
            { id: アクティビティID("設定"), ラベル: "設定", アイコン: ダミーアイコン },
        ],
    };
}

describe("外殻レイアウト 左サイドバー", () => {
    it("ビューを登録しない場合、初期状態で左サイドバーは非表示（後方互換）", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素).not.toBeNull();
        expect(左サイドバー要素?.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
    });

    it("初期選択中のアクティビティにビューを登録すると、自動的に表示され左サイドバーが開く", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });

        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);
        expect(左サイドバー要素?.textContent).toContain("探索コンテンツ");
    });

    it("別のアクティビティを選択すると、左サイドバーのビューが切り替わる", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });
        const 検索ビュー = div({ text: "検索コンテンツ" });

        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);
        シェル.左サイドバーへビューを登録する(アクティビティID("検索"), 検索ビュー);

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.textContent).toContain("探索コンテンツ");

        // 検索ボタンをクリック
        const 検索ボタン = シェル.dom.element.querySelectorAll('[data-active]')[1];
        検索ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);
        expect(左サイドバー要素?.textContent).toContain("検索コンテンツ");
        expect(左サイドバー要素?.textContent).not.toContain("探索コンテンツ");
    });

    it("同じ項目をもう一度クリックしたら左サイドバーをトグルで閉じる（VSCodeの挙動）", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });

        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);

        // 探索ボタン（現在開いている項目）をもう一度クリック
        const 探索ボタン = シェル.dom.element.querySelectorAll('[data-active]')[0];
        expect(探索ボタン.getAttribute("data-active")).toBe("true");

        探索ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        // 閉じる（左サイドバーが非表示になり、アクティビティ選択ハイライトも解除される）
        expect(左サイドバー要素?.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
        expect(探索ボタン.getAttribute("data-active")).toBe("false");

        // 再度クリックすると開く（左サイドバーが表示され、アクティビティ選択ハイライトも復帰する）
        探索ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);
        expect(左サイドバー要素?.textContent).toContain("探索コンテンツ");
        expect(探索ボタン.getAttribute("data-active")).toBe("true");
    });

    it("未登録のアクティビティを選んだときは左サイドバーを閉じる", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });

        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);

        // 未登録の「設定」ボタンをクリック
        const 設定ボタン = シェル.dom.element.querySelectorAll('[data-active]')[2];
        設定ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        // 閉じる
        expect(左サイドバー要素?.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);
    });

    it("左サイドバーを持たない項目として登録した項目は、押しても左サイドバーの内容と開閉を変えない", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });
        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);
        シェル.左サイドバーを持たない項目として登録する(アクティビティID("設定"));

        const コールバック = vi.fn();
        シェル.onアクティビティ選択(コールバック);

        const 設定ボタン = シェル.dom.element.querySelectorAll('[data-active]')[2];
        設定ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);
        expect(左サイドバー要素?.textContent).toContain("探索コンテンツ");
        expect(コールバック).toHaveBeenCalledWith(アクティビティID("設定"));
    });

    it("onアクティビティ選択 コールバックが左サイドバー連動と共存して正常に発火する", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });
        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);

        const コールバック = vi.fn();
        シェル.onアクティビティ選択(コールバック);

        const 検索ボタン = シェル.dom.element.querySelectorAll('[data-active]')[1];
        検索ボタン.dispatchEvent(new MouseEvent("click", { bubbles: true }));

        expect(コールバック).toHaveBeenCalledWith(アクティビティID("検索"));
    });

    it("左サイドバーを切り替える で明示的に開閉できる", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });
        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);

        const 左サイドバー要素 = シェル.dom.element.querySelector('[class*="左サイドバー"]');
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);

        シェル.左サイドバーを切り替える();
        expect(左サイドバー要素?.getAttribute(表示状態.attribute)).toBe(表示状態.value.collapsed);

        シェル.左サイドバーを切り替える();
        expect(左サイドバー要素?.hasAttribute(表示状態.attribute)).toBe(false);
    });

    it("delete() で登録されたビューが破棄される", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const 探索ビュー = div({ text: "探索コンテンツ" });
        const deleteスパイ = vi.spyOn(探索ビュー, "delete");

        シェル.左サイドバーへビューを登録する(アクティビティID("探索"), 探索ビュー);
        シェル.delete();

        expect(deleteスパイ).toHaveBeenCalled();
    });
});
