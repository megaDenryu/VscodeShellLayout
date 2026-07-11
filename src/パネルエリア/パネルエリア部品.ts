import { div, DivC } from "sengen-ui";
import * as styles from './style.css';
import { タブストリップ, type タブ項目 } from './タブストリップ';

// パネルエリアが集約する部品の型契約（部品DTO）
export class パネルエリア部品 {
    private constructor(
        readonly タブストリップ: タブストリップ,
        readonly コンテンツ: DivC,
    ) {}

    static 作る(タブ一覧: タブ項目[]): パネルエリア部品 {
        return new パネルエリア部品(
            new タブストリップ(タブ一覧),
            div({ class: styles.コンテンツ }),
        );
    }
}
