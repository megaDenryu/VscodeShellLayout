import { span, DivC } from "sengen-ui";
import * as styles from './style.css';
import { 項目状態 } from './style.css';
import type { アクティビティ項目 } from './アクティビティバー';

// LV1拡張: アクティビティバー1項目の見た目 + アクティブ状態切り替えを1要素に閉じ込める。
// 親(アクティビティバー)が裸のDivCを配列で保持して外からsetAttributeするのを避けるための昇格。
export class アクティビティ項目ボタン extends DivC {
    private readonly _バッジ = span({ class: styles.項目バッジ });
    readonly 項目id: アクティビティ項目['id'];

    constructor(項目: アクティビティ項目, on選択: () => void) {
        super({ class: styles.項目 });
        this.項目id = 項目.id;
        this.setAttribute(項目状態.attribute, 項目状態.value.inactive)
            .setTooltip(項目.ラベル)
            .childs([
                項目.アイコン(20, 'currentColor'),
                this._バッジ.setAttribute('data-visible', 'false'),
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

    バッジ件数を設定する(件数: number): this {
        const 表示件数 = Math.max(0, Math.floor(件数));
        this._バッジ
            .setTextContent(表示件数 > 99 ? '99+' : String(表示件数))
            .setAttribute('data-visible', 表示件数 > 0 ? 'true' : 'false');
        return this;
    }
}
