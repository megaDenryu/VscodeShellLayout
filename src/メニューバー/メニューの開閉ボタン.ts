import { ButtonC } from "sengen-ui";
import type { HtmlComponentChild } from "sengen-ui";
import * as styles from './style.css';
import { 押せる状態, type I開閉ボタン } from '../外殻/開閉ボタン';

// LV1拡張: メニューバーに並ぶ領域の開閉ボタン1つ。アイコンと押されたときの処理を受け取り、
// 「いま押せるか」を自分で持つ。押せないあいだはクリックを自分で止めるため、
// 見た目（style.css.tsのglobalStyle）と振る舞いが食い違わない。
export class メニューの開閉ボタン extends ButtonC implements I開閉ボタン {
    private _押せるか = true;

    constructor(アイコン: HtmlComponentChild, 押されたときの処理: () => void) {
        super({ class: styles.トグルボタン });
        this.押せるかを示す(true);
        this.child(アイコン).onClick(() => {
            if (this._押せるか) 押されたときの処理();
        });
    }

    押せるかを示す(押せるか: boolean): void {
        this._押せるか = 押せるか;
        this.setAttribute(
            押せる状態.attribute,
            押せるか ? 押せる状態.value.押せる : 押せる状態.value.押せない,
        );
    }
}
