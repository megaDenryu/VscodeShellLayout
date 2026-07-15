// タブ群ペインのタブボタン + 閉じるボタン。DOM同期.ts の全再描画から毎回 new されるため、
// LV1拡張化しても更新用メソッドは持たない（インスタンスは常に使い捨て）。
// 動的生成される項目自体を独立したクラスに切り出す第4条の原則に従い、
// 「引数を受けてDOMツリーを返す関数」だったものをLV1拡張クラスへ昇格した。

import { ButtonC, SpanC, icon } from "sengen-ui";
import type { タブID } from "./レイアウト型";
import type { DOM同期コンテキスト } from "./DOM同期";
import { タブID属性 } from "./DOM同期";
import * as styles from "./style.css";

export interface タブ内ボタン定義 {
    readonly id: string;
    readonly ラベル: string;
    readonly アイコン?: "再読み込み";
    readonly onクリック: () => void;
}

export class タブボタン extends ButtonC {
    constructor(
        タブ: { readonly id: タブID; readonly ラベル: string; readonly 閉じれる: boolean },
        isActive: boolean,
        コンテキスト: DOM同期コンテキスト,
    ) {
        super({ text: タブ.ラベル, class: styles.タブボタン });
        this.setAttribute(タブID属性, タブ.id)
            .setAttributeIf({
                If: isActive,
                True: { attr: styles.タブ状態.attribute, value: styles.タブ状態.value.active },
                False: { attr: styles.タブ状態.attribute, value: styles.タブ状態.value.inactive },
            });
        this.addTypedEventListener("pointerdown", (e: PointerEvent) => {
            コンテキスト.DnD押下(タブ.id, { x: e.clientX, y: e.clientY });
        });
        // 直前のドラッグはタブ選択ではなく DnD 操作なので、配線層フラグで click を抑止する。
        this.addTypedEventListener("click", () => {
            if (コンテキスト.直前にドラッグした()) return;
            コンテキスト.タブクリック(タブ.id);
        });
        this.childIf({
            If: タブ.閉じれる,
            True: () => new タブ閉じるボタン(タブ.id, コンテキスト),
        });
    }
}

export class タブ内ボタン extends ButtonC {
    constructor(定義: タブ内ボタン定義) {
        super({ class: styles.タブ内ボタン });
        this.setAttribute("data-tab-action", 定義.id)
            .setAttribute("aria-label", 定義.ラベル)
            .setAttribute("title", 定義.ラベル)
            .onClick(() => 定義.onクリック());
        if (定義.アイコン === "再読み込み") {
            this.child(icon({
                size: 15,
                color: "currentColor",
                paths: ["M21 12a9 9 0 1 1-2.64-6.36L21 8", "M21 3v5h-5"],
            }));
        } else {
            this.setTextContent(定義.ラベル);
        }
        this.addTypedEventListener("pointerdown", (e: PointerEvent) => e.stopPropagation());
    }
}

class タブ閉じるボタン extends SpanC {
    constructor(タブID値: タブID, コンテキスト: DOM同期コンテキスト) {
        super({ class: styles.タブ閉じる });
        // SengenUI に SVG ファクトリがないため innerHTML で × アイコンを注入する
        // (ライブ映像View.ts:142-148 と同じく素 DOM API での回避策)。
        // stroke="currentColor" で span の color を継承するため、状態に応じて色変更可能。
        this.dom.element.innerHTML =
            '<svg viewBox="0 0 10 10" width="10" height="10" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
            '<line x1="2" y1="2" x2="8" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
            '<line x1="8" y1="2" x2="2" y2="8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>' +
            '</svg>';
        this.addTypedEventListener("click", (e: MouseEvent) => {
            e.stopPropagation();
            コンテキスト.タブ閉じるクリック(タブID値);
        });
        // 閉じるボタンの pointerdown は親へバブルさせない (DnD 開始しない)。
        this.addTypedEventListener("pointerdown", (e: PointerEvent) => {
            e.stopPropagation();
        });
    }
}
