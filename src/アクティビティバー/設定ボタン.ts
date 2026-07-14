import { span, DivC } from "sengen-ui";
import * as styles from './style.css';
import { 設定アイコン } from '../アイコン/アイコン定義';

// LV1拡張: アクティビティバー下部の設定ボタン。単独要素+クリックだけなのでLV2は不要
export class 設定ボタン extends DivC {
    constructor(on設定: () => void) {
        super({ class: styles.項目 });
        this.setTooltip('設定').childs([
            設定アイコン(18, 'currentColor'),
            span({ text: "設定", class: styles.項目ラベル })])
            .addTypedEventListener('click', on設定);
    }
}
