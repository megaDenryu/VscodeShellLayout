import { DivC } from "sengen-ui";
import type { I配線可能 } from "sengen-ui";
import { 配線ポート } from "sengen-ui";
import * as styles from './style.css';
import { パネルアイコン } from '../../アイコン/アイコン定義';
import type { Iレイアウトトグル操作 } from '../レイアウトトグル操作';

// LV1拡張: 下部パネルの開閉トグルを単独のボタンとして提供する（サイドバートグルボタンと対）。
export class パネルトグルボタン extends DivC implements I配線可能<Iレイアウトトグル操作> {
    private readonly _配線 = new 配線ポート<Iレイアウトトグル操作>("パネルトグルボタン");

    constructor() {
        super({ class: styles.ボタン });
        this.child(パネルアイコン(16, 'currentColor'))
            .addTypedEventListener('click', () => this._配線.先.パネルを切り替える());
    }

    配線する(操作: Iレイアウトトグル操作): this {
        this._配線.配線する(操作);
        return this;
    }
}
