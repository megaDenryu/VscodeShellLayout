import { DivC } from "sengen-ui";
import type { I配線可能 } from "sengen-ui";
import { 配線ポート } from "sengen-ui";
import * as styles from './style.css';
import { サイドバーアイコン } from '../../アイコン/アイコン定義';
import type { Iレイアウトトグル操作 } from '../レイアウトトグル操作';

// LV1拡張: 右サイドバーの開閉トグルを単独のボタンとして提供する。
// メニューバーに固定されていたトグルを切り出したもので、
// ステータスバー・アクティビティバー下部等、アプリが選んだ任意のスロットに配置できる。
// 配線先には 外殻レイアウト のインスタンス、または 領域トグルサービス を渡す（両方が
// Iレイアウトトグル操作 を実装する）。
export class サイドバートグルボタン extends DivC implements I配線可能<Iレイアウトトグル操作> {
    private readonly _配線 = new 配線ポート<Iレイアウトトグル操作>("サイドバートグルボタン");

    constructor() {
        super({ class: styles.ボタン });
        this.child(サイドバーアイコン(16, 'currentColor'))
            .addTypedEventListener('click', () => this._配線.先.サイドバーを切り替える());
    }

    配線する(操作: Iレイアウトトグル操作): this {
        this._配線.配線する(操作);
        return this;
    }
}
