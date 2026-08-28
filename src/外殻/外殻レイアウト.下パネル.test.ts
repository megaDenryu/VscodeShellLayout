/**
 * @vitest-environment jsdom
 */

// 下パネルのスロット注入と、出すものを持たない文脈で閉じたままになることを検証する。
// 過去に「空のパネル領域が既定で表示されて画面下部に帯が出る」不具合があったため、
// パネル本体とそのスプリッター（横一直線の帯）の両方が隠れていることを確かめる。

import { describe, expect, it } from "vitest";
import { div } from "sengen-ui";
import { 外殻レイアウト } from "./外殻レイアウト";
import { 表示状態 } from "./表示状態";
import { エリア as パネルエリアのクラス, タブバー as タブバーのクラス } from "../パネルエリア/style.css";
import { 水平 as 水平スプリッターのクラス } from "../スプリッター/style.css";

function 基本オプション() {
    return { タイトル: "テストアプリ", アクティビティ項目一覧: [] };
}

function 隠れているか(シェル: 外殻レイアウト, クラス: string): boolean {
    const 要素 = シェル.dom.element.querySelector(`.${クラス}`);
    if (要素 === null) throw new Error(`外殻レイアウトに ${クラス} の要素が見つからない`);
    return 要素.getAttribute(表示状態.attribute) === 表示状態.value.collapsed;
}

function パネルもスプリッターも隠れているか(シェル: 外殻レイアウト): boolean {
    return 隠れているか(シェル, パネルエリアのクラス) && 隠れているか(シェル, 水平スプリッターのクラス);
}

function パネルもスプリッターも見えているか(シェル: 外殻レイアウト): boolean {
    return !隠れているか(シェル, パネルエリアのクラス) && !隠れているか(シェル, 水平スプリッターのクラス);
}

describe("外殻レイアウトの下パネル", () => {
    it("パネル内容を渡すと下パネルの中へ描画される", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル内容: div({ text: "棚の中身" }) });
        expect(シェル.dom.element.textContent).toContain("棚の中身");
    });

    it("パネル利用可能: false で作ると、パネル本体とスプリッターが最初から隠れている", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル利用可能: false });
        expect(シェル.パネル表示中か()).toBe(false);
        expect(パネルもスプリッターも隠れているか(シェル)).toBe(true);
    });

    it("利用できない文脈ではパネルを切り替えても開かない", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル利用可能: false });
        シェル.パネルを切り替える();
        expect(シェル.パネル表示中か()).toBe(false);
        expect(パネルもスプリッターも隠れているか(シェル)).toBe(true);
    });

    it("利用可能へ戻すと人の開閉の希望どおりに開き、人が閉じていたなら閉じたままになる", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル利用可能: false });
        シェル.パネル利用可能を設定する(true);
        expect(シェル.パネル表示中か()).toBe(true);
        expect(パネルもスプリッターも見えているか(シェル)).toBe(true);

        シェル.パネルを切り替える();
        シェル.パネル利用可能を設定する(false);
        シェル.パネル利用可能を設定する(true);
        expect(シェル.パネル表示中か()).toBe(false);
        expect(パネルもスプリッターも隠れているか(シェル)).toBe(true);
    });

    it("パネル初期表示: false で作ってもパネルとスプリッターが揃って隠れる", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル初期表示: false });
        expect(パネルもスプリッターも隠れているか(シェル)).toBe(true);
    });

    it("パネル利用可能を省略すると従来どおり利用可能として扱う", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        expect(シェル.パネル表示中か()).toBe(true);
        expect(パネルもスプリッターも見えているか(シェル)).toBe(true);
    });
});

describe("下パネルのタブバー", () => {
    it("パネルタブ一覧を渡さないときはタブバーを作らない（押せるものが無い帯を残さない）", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), パネル内容: div({ text: "棚の中身" }) });
        expect(シェル.dom.element.querySelector(`.${タブバーのクラス}`)).toBeNull();
    });

    it("パネルタブ一覧を渡したときは従来どおりタブバーを作る", () => {
        const シェル = new 外殻レイアウト({
            ...基本オプション(),
            パネルタブ一覧: [{ id: "shelf", ラベル: "棚" }],
        });
        expect(シェル.dom.element.querySelector(`.${タブバーのクラス}`)).not.toBeNull();
    });
});
