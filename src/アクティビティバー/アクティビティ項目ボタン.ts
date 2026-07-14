import { span, DivC } from "sengen-ui";
import * as styles from './style.css';
import { 項目状態 } from './style.css';
import type { アクティビティ項目 } from './アクティビティバー';

// LV1拡張: アクティビティバー1項目の見た目 + アクティブ状態切り替えを1要素に閉じ込める。
// 親(アクティビティバー)が裸のDivCを配列で保持して外からsetAttributeするのを避けるための昇格。
export class アクティビティ項目ボタン extends DivC {
    constructor(項目: アクティビティ項目, on選択: () => void) {
        super({ class: styles.項目 });
        this.setAttribute(項目状態.attribute, 項目状態.value.inactive)
            .setTooltip(項目.ラベル)
            .childs([
                項目.アイコン(20, 'currentColor'),
                span({ text: 項目.ラベル, class: styles.項目ラベル })])
            .addTypedEventListener('click', on選択);
    }

    アクティブ状態を設定する(isActive: boolean): this {
        this.setAttribute(
            項目状態.attribute,
            isActive ? 項目状態.value.active : 項目状態.value.inactive,
        );
        return this;
    }
}
