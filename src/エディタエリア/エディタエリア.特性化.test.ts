/**
 * @vitest-environment jsdom
 */

// 特性化テスト: 既存 `エディタエリア.ts` の現状挙動を 8 件で凍結する。
//
// 目的: W-149 Step A.6 で内部実装を「ペイン木 + 純関数 適用() + DOM 同期」へ
// 全面刷新する前に、現状の公開 API 挙動と DOM 副作用列を固定保護する。
// 刷新後にこれらが全て pass し続けることを「公開 API 互換維持」の証拠とする。
// (meta_strangler_stages の純核 → 配線 → 旧ファサード撤去段階の前段階)
//
// 観点: テストは「実装の中身」ではなく「公開 API を呼んだ時の DOM の見え方と
// 内部状態(選択中タブID 等)」だけを検証する。内部 Map のキー名や DOM 構造の
// 微細な差(span 要素の class 名等)は検証しない。

import { describe, expect, it, beforeEach } from "vitest";
import { div, type DivC } from "sengen-ui";
import { エディタエリア } from "./エディタエリア";

// テスト用のダミーコンテンツ。
// 中身は何でもよく、識別できるラベルだけ持っていれば良い。
function ダミーコンテンツ(ラベル: string): DivC {
    return div({ text: ラベル });
}

// 表示中(display ≠ "none") のコンテンツのテキストを取得。
// 「現在ユーザーに見えているコンテンツは何か」を判定する。
// W-149 Step A.6 で内部実装が 分割可能エディタエリア に変わったため、DOM 階層の
// 細部を仮定せず「テキストを持つリーフ要素で display 系統が表示中」のみを拾う方式。
function 表示中コンテンツテキスト(area: エディタエリア): string[] {
    const root = area.dom.element;
    const 全要素 = root.querySelectorAll<HTMLElement>("*");
    const 結果: string[] = [];
    全要素.forEach(el => {
        if (el.children.length !== 0) return;
        const text = el.textContent ?? "";
        if (text.length === 0) return;
        // タブボタン内のテキストと閉じる「x」span は除外
        if (el.tagName === "BUTTON" || el.parentElement?.tagName === "BUTTON") return;
        if (display系統が表示中(el)) 結果.push(text);
    });
    return 結果;
}

function display系統が表示中(el: HTMLElement): boolean {
    let cur: HTMLElement | null = el;
    while (cur !== null) {
        if (cur.style.display === "none") return false;
        cur = cur.parentElement;
    }
    return true;
}

function タブボタンラベル一覧(area: エディタエリア): string[] {
    const root = area.dom.element;
    const ボタン群 = root.querySelectorAll<HTMLElement>("button");
    return Array.from(ボタン群).map(b => {
        // 閉じる x の span が末尾に付くため、テキスト全体から末尾の "x" を除去する
        const text = b.textContent ?? "";
        return text.endsWith("x") ? text.slice(0, -1) : text;
    });
}

describe("エディタエリア 特性化テスト (W-149 Step A.6 刷新前の現状挙動凍結)", () => {
    let area: エディタエリア;

    beforeEach(() => {
        area = new エディタエリア();
        // jsdom は document.body を持つので、エリアの DOM をマウントしておく
        // (querySelector で確実に拾えるように)
        area.マウントする(document.body);
    });

    it("特性 1: タブを追加すると DOM にタブボタンが現れる", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        expect(タブボタンラベル一覧(area)).toEqual(["タブA"]);
    });

    it("特性 2: タブ追加直後はそのタブが選択中で、コンテンツが表示される", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        expect(area.選択中タブID()).toBe("a");
        expect(表示中コンテンツテキスト(area)).toEqual(["コンテンツA"]);
    });

    it("特性 3: 複数タブ追加で、最後に追加したタブが選択中になる", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        area.タブを追加する("b", "タブB", ダミーコンテンツ("コンテンツB"));
        expect(area.選択中タブID()).toBe("b");
        expect(表示中コンテンツテキスト(area)).toEqual(["コンテンツB"]);
    });

    it("特性 4: タブを選択するとコンテンツの表示が切り替わる(他は非表示)", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        area.タブを追加する("b", "タブB", ダミーコンテンツ("コンテンツB"));
        area.タブを選択する("a");
        expect(area.選択中タブID()).toBe("a");
        expect(表示中コンテンツテキスト(area)).toEqual(["コンテンツA"]);
    });

    it("特性 5: タブを閉じると DOM とラベル一覧から消える", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        area.タブを追加する("b", "タブB", ダミーコンテンツ("コンテンツB"));
        area.タブを閉じる("a");
        expect(タブボタンラベル一覧(area)).toEqual(["タブB"]);
        expect(area.タブが存在するか("a")).toBe(false);
        expect(area.タブが存在するか("b")).toBe(true);
    });

    it("特性 6: 選択中タブを閉じると残りの最後のタブが選択される", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        area.タブを追加する("b", "タブB", ダミーコンテンツ("コンテンツB"));
        area.タブを追加する("c", "タブC", ダミーコンテンツ("コンテンツC"));
        area.タブを選択する("b");
        area.タブを閉じる("b");
        expect(area.選択中タブID()).toBe("c");
        expect(表示中コンテンツテキスト(area)).toEqual(["コンテンツC"]);
    });

    it("特性 7: 既存 ID で タブを追加 → 切り替えのみ、新規タブは作られない", () => {
        const コンテンツA = ダミーコンテンツ("コンテンツA");
        const コンテンツA再 = ダミーコンテンツ("コンテンツA再");
        area.タブを追加する("a", "タブA", コンテンツA);
        area.タブを追加する("b", "タブB", ダミーコンテンツ("コンテンツB"));
        area.タブを追加する("a", "タブA", コンテンツA再);
        // 既存 ID では切り替えのみ。タブ数は 2 のまま、コンテンツ実体は最初のもの。
        expect(タブボタンラベル一覧(area)).toEqual(["タブA", "タブB"]);
        expect(area.選択中タブID()).toBe("a");
        expect(表示中コンテンツテキスト(area)).toEqual(["コンテンツA"]);
    });

    it("特性 8: 全タブ閉じた後は選択中タブIDが null", () => {
        area.タブを追加する("a", "タブA", ダミーコンテンツ("コンテンツA"));
        area.タブを閉じる("a");
        expect(area.選択中タブID()).toBeNull();
        expect(タブボタンラベル一覧(area)).toEqual([]);
    });
});
