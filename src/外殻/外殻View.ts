import { div, DivC } from "sengen-ui";
import * as styles from './style.css';
import type { メニューバー } from '../メニューバー/メニューバー';
import type { アクティビティバー } from '../アクティビティバー/アクティビティバー';
import type { エディタエリア } from '../エディタエリア/エディタエリア';
import type { パネルエリア } from '../パネルエリア/パネルエリア';
import type { ステータスバー } from '../ステータスバー/ステータスバー';
import type { スプリッター } from '../スプリッター/スプリッター';

// =============================================================================
// 純粋関数コンポーネント群
// =============================================================================

interface 外殻ViewProps {
    メニューバー: メニューバー;
    アクティビティバー: アクティビティバー;
    エディタエリア: エディタエリア;
    パネルスプリッター: スプリッター;
    パネルエリア: パネルエリア;
    サイドバースプリッター: スプリッター;
    右サイドバー: DivC;
    ステータスバー: ステータスバー;
    メインエリア参照: (el: DivC) => void;
}

export function 外殻ViewRoot(props: 外殻ViewProps): DivC {
    return (
        div({ class: styles.ルート }).childs([
            props.メニューバー,
            div({ class: styles.中央エリア }).childs([
                props.アクティビティバー,
                div({ class: styles.メインエリア })
                    .tap(el => props.メインエリア参照(el))
                    .childs([
                        props.エディタエリア,
                        props.パネルスプリッター,
                        props.パネルエリア]),
                props.サイドバースプリッター,
                props.右サイドバー]),
            props.ステータスバー,
        ])
    );
}
