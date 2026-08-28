import { div, span, DivC, LV2部品集約Base } from "sengen-ui";
import * as styles from './style.css';
import { メニューバー部品 } from './メニューバー部品';
import type { メニューの開閉ボタン } from './メニューの開閉ボタン';

export interface Iメニューバーイベント {
    onサイドバートグル: () => void;
    onパネルトグル: () => void;
}

// =============================================================================
// Orchestrator（LV2部品集約: 子に開閉ボタン（LV1拡張）を持ち、外へ貸し出すため部品DTOで束ねる）
// =============================================================================

export class メニューバー extends LV2部品集約Base<メニューバー部品> {
    protected _componentRoot: DivC;
    private readonly _部品: メニューバー部品;

    constructor(
        private タイトル: string,
        イベント: Iメニューバーイベント,
        private トグルボタン表示: boolean = true,
    ) {
        super();
        this._部品 = メニューバー部品.作る(イベント);
        this._componentRoot = this._ルートを構築する(this._部品);
    }

    // 領域が利用できない文脈で押せない見た目にするため、外殻レイアウトが開閉の登録先へ渡す。
    // トグルボタン表示が false のときも実体は作ってあり、木へ含めないだけである
    // （登録した相手が「木に居ない可能性」を気にせずに済む）。
    get パネルの開閉ボタン(): メニューの開閉ボタン {
        return this._部品.パネルの開閉;
    }

    get サイドバーの開閉ボタン(): メニューの開閉ボタン {
        return this._部品.サイドバーの開閉;
    }

    protected _ルートを構築する(部品: メニューバー部品): DivC {
        return (
            div({ class: styles.バー })
                .child(span({ text: this.タイトル, class: styles.タイトル }))
                .childIf({
                    If: this.トグルボタン表示,
                    True: () => div({ class: styles.右ボタン群 }).childs([
                        部品.パネルの開閉,
                        部品.サイドバーの開閉]),
                })
        );
    }
}
