/**
 * @vitest-environment jsdom
 */

// Fudaba札#92「タブ構造変更時も開いているiframeの状態を保持する」の検証。
// iframeはjsdomで実体化できないため、コンテンツ要素の DOM 上の親子関係(参照同一性)と
// removeChild が呼ばれたかどうかで detach/reattach の有無を検証する。無関係なタブが
// document から切断されないことは iframe の browsing context が破棄されないことの
// 十分条件になる(切断が一度も起きなければ再読み込みも起きない)。

import { describe, expect, it } from "vitest";
import { div, type DivC } from "sengen-ui";
import { 分割可能エディタエリア } from "./分割可能エディタエリア";

function ダミーコンテンツ(ラベル: string): DivC {
    return div({ text: ラベル });
}

// 指定した要素に対して removeChild が一度でも呼ばれたかを観測するヘルパ。
// 呼び出し後は必ず元の実装へ戻すこと(他テストへ波及させないため呼び出し側が finally で戻す)。
function removeChild呼び出しを監視する(対象: Node): { 呼ばれたか: () => boolean; 復元する: () => void } {
    let 呼ばれた = false;
    const 元removeChild = Element.prototype.removeChild;
    Element.prototype.removeChild = function (this: Element, child: Node): Node {
        if (child === 対象) 呼ばれた = true;
        return 元removeChild.call(this, child);
    };
    return {
        呼ばれたか: () => 呼ばれた,
        復元する: () => { Element.prototype.removeChild = 元removeChild; },
    };
}

describe("分割可能エディタエリア - 構造変更時の無関係なコンテンツ要素の保持(Fudaba#92)", () => {
    it("タブ追加時、既存タブのコンテンツ要素は removeChild されず親も変わらない", () => {
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        const bコンテンツ = ダミーコンテンツ("B");
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        area.タブを追加する("b", "タブB", bコンテンツ);

        const bDOM要素 = bコンテンツ.dom.element;
        const b親要素前 = bDOM要素.parentElement;
        const 監視 = removeChild呼び出しを監視する(bDOM要素);
        try {
            area.タブを追加する("c", "タブC", ダミーコンテンツ("C"));
        } finally {
            監視.復元する();
        }

        expect(監視.呼ばれたか()).toBe(false);
        expect(bDOM要素.parentElement).toBe(b親要素前);
    });

    it("タブを閉じても、残りのタブのコンテンツ要素は removeChild されず親も変わらない", () => {
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        const bコンテンツ = ダミーコンテンツ("B");
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        area.タブを追加する("b", "タブB", bコンテンツ);
        area.タブを追加する("c", "タブC", ダミーコンテンツ("C"));

        const bDOM要素 = bコンテンツ.dom.element;
        const b親要素前 = bDOM要素.parentElement;
        const 監視 = removeChild呼び出しを監視する(bDOM要素);
        try {
            area.タブを閉じる("a");
        } finally {
            監視.復元する();
        }

        expect(監視.呼ばれたか()).toBe(false);
        expect(bDOM要素.parentElement).toBe(b親要素前);
    });

    it("タブを閉じると、そのタブのコンテンツ要素は DOM から除去される", () => {
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        const aコンテンツ = ダミーコンテンツ("A");
        area.タブを追加する("a", "タブA", aコンテンツ);
        area.タブを追加する("b", "タブB", ダミーコンテンツ("B"));

        area.タブを閉じる("a");

        expect(aコンテンツ.dom.element.parentElement).toBeNull();
    });

    it("片方のペインへの追加操作で、もう片方のペイン(分割済み)のコンテンツ要素は detach されない", () => {
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        const bコンテンツ = ダミーコンテンツ("B");
        area.タブを追加する("a", "タブA", ダミーコンテンツ("A"));
        area.基準タブを基準に分割追加する("a", "右", "b", "タブB", bコンテンツ);

        const bDOM要素 = bコンテンツ.dom.element;
        const b親要素前 = bDOM要素.parentElement;
        const 監視 = removeChild呼び出しを監視する(bDOM要素);
        try {
            // "a" と同じペイン(最初に見つかるタブ群)へ新規タブを追加する。
            // "b" は別ペインに分割済みのため、この操作とは無関係。
            area.タブを追加する("c", "タブC", ダミーコンテンツ("C"));
        } finally {
            監視.復元する();
        }

        expect(監視.呼ばれたか()).toBe(false);
        expect(bDOM要素.parentElement).toBe(b親要素前);
    });

    it("タブ内ボタンを追加しても、他のタブのコンテンツ要素は detach されない", () => {
        const area = new 分割可能エディタエリア();
        area.マウントする(document.body);
        const aコンテンツ = ダミーコンテンツ("A");
        area.タブを追加する("a", "タブA", aコンテンツ);
        area.タブを追加する("b", "タブB", ダミーコンテンツ("B"));

        const aDOM要素 = aコンテンツ.dom.element;
        const a親要素前 = aDOM要素.parentElement;
        const 監視 = removeChild呼び出しを監視する(aDOM要素);
        try {
            area.タブ内ボタンを追加する("b", "action", "実行", () => {});
        } finally {
            監視.復元する();
        }

        expect(監視.呼ばれたか()).toBe(false);
        expect(aDOM要素.parentElement).toBe(a親要素前);
    });
});
