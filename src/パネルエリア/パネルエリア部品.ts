import { div, DivC } from "sengen-ui";
import type { HtmlComponentBase } from "sengen-ui";
import * as styles from './style.css';
import { タブストリップ, type タブ項目 } from './タブストリップ';

// パネルエリアが集約する部品の型契約（部品DTO）
export class パネルエリア部品 {
    private constructor(
        readonly タブストリップ: タブストリップ,
        readonly コンテンツ: DivC,
    ) {}

    // コンテンツのスロットは display:block（既定）で、高さの決まった箱として振る舞う
    // （パネルエリアの高さから タブバーの高さを引いた残り）。注入される内容は自分で
    // width/height を決めること。参照: SengenUIガイド第15条「コンテンツスロットのレイアウト契約」。
    static 作る(タブ一覧: タブ項目[], 内容?: HtmlComponentBase): パネルエリア部品 {
        const コンテンツ = div({ class: styles.コンテンツ });
        if (内容 !== undefined) コンテンツ.child(内容);
        return new パネルエリア部品(new タブストリップ(タブ一覧), コンテンツ);
    }
}
