/**
 * @vitest-environment jsdom
 */

// 構成とデザインの自由化: メニューバー/ステータスバーのオプション化と、
// テーマのCSSカスタムプロパティ化を検証する。

import { describe, expect, it } from "vitest";
import { 外殻レイアウト } from "./外殻レイアウト";
import { テーマCSS変数名 } from "../テーマ/テーマCSS変数";

function 基本オプション() {
    return { タイトル: "テストアプリ", アクティビティ項目一覧: [] };
}

describe("外殻レイアウト 領域のオプション化", () => {
    it("メニューバー表示/ステータスバー表示を省略すると両方とも表示される（後方互換）", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        // メニューバーのタイトルが描画されている = メニューバーのDOMが存在する
        expect(シェル.dom.element.textContent).toContain("テストアプリ");
    });

    it("メニューバー表示: false のとき、メニューバーのDOMが生成されない（ゼロ高さ）", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), メニューバー表示: false });
        const ルート = シェル.dom.element;
        expect(ルート.textContent).not.toContain("テストアプリ");
    });

    it("ステータスバー表示: false のとき、ステータスバー右テキストのDOMが生成されない", () => {
        const シェル = new 外殻レイアウト({
            ...基本オプション(),
            ステータスバー表示: false,
            ステータスバー右テキスト: "ステータス文言",
        });
        expect(シェル.dom.element.textContent).not.toContain("ステータス文言");
    });

    it("ステータスバー表示: true（省略時含む）なら右テキストが描画される", () => {
        const シェル = new 外殻レイアウト({ ...基本オプション(), ステータスバー右テキスト: "ステータス文言" });
        expect(シェル.dom.element.textContent).toContain("ステータス文言");
    });
});

describe("外殻レイアウト テーマのCSSカスタムプロパティ化", () => {
    it("テーマ未指定なら、ルート要素にCSS変数が一切設定されない（現行デフォルトと完全同一の見た目）", () => {
        const シェル = new 外殻レイアウト(基本オプション());
        const ルートスタイル = シェル.dom.element.style;
        expect(ルートスタイル.getPropertyValue(テーマCSS変数名.アプリ背景)).toBe("");
        expect(ルートスタイル.getPropertyValue(テーマCSS変数名.ブルー)).toBe("");
    });

    it("テーマを指定すると、指定したトークンだけルート要素にCSS変数として設定される", () => {
        const シェル = new 外殻レイアウト({
            ...基本オプション(),
            テーマ: { アプリ背景: "#123456" },
        });
        const ルートスタイル = シェル.dom.element.style;
        expect(ルートスタイル.getPropertyValue(テーマCSS変数名.アプリ背景)).toBe("#123456");
        // 指定していないトークンは未設定のまま(CSS側のフォールバックに委ねる)
        expect(ルートスタイル.getPropertyValue(テーマCSS変数名.ブルー)).toBe("");
    });

    it("入れ子シェル（マトリョーシカシェル）: 内側シェルに別テーマを当てても外側シェルのCSS変数は変わらない", () => {
        const 外側 = new 外殻レイアウト({ ...基本オプション(), テーマ: { アプリ背景: "#111111" } });
        const 内側 = new 外殻レイアウト({ ...基本オプション(), テーマ: { アプリ背景: "#222222" } });
        // 内側シェルをエディタエリアの1タブとしてホストする構成を模して、外側のDOMに接続する
        外側.タブを追加する("内側アプリ", "内側アプリ", 内側);

        expect(外側.dom.element.style.getPropertyValue(テーマCSS変数名.アプリ背景)).toBe("#111111");
        expect(内側.dom.element.style.getPropertyValue(テーマCSS変数名.アプリ背景)).toBe("#222222");
        // 各ルートが自分自身に明示設定した値だけを持つ。この2値が独立して共存できることが、
        // CSS変数のDOMカスケード（内側の上書きが外側へ波及しない）を利用する前提になる。
        // カスケードの継承挙動自体はブラウザのCSS実装が保証する領域であり、jsdomの算出
        // スタイルでは再現しないためここでは検証しない。
    });
});
