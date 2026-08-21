// ペイン木を直近に DOM 同期した結果の状態(レイアウト型.ts の DOM 版)。
// 次回の同期呼び出しで「旧」として渡し、参照/id が一致する部分の DOM 要素を
// そのまま再利用できるかを判定するために使う。型のみを持ち、実装ロジックは
// タブ群ペイン同期.ts / 分割ペイン同期.ts が持つ。

import type { DivC, HtmlComponentBase } from "sengen-ui";
import type { タブID, タブ群ペイン, 左右分割ペイン, 上下分割ペイン } from "./レイアウト型";
import type { タブ内ボタン定義 } from "./タブボタン";

export type 構築済みペイン = 構築済みタブ群 | 構築済み左右分割 | 構築済み上下分割;

export interface 構築済みタブ群 {
    readonly kind: "タブ群";
    readonly ペイン: タブ群ペイン;
    readonly 要素: DivC;
    readonly タブバー: DivC;
    readonly コンテンツエリア: DivC;
    // コンテンツエリアに現在アタッチ済みのタブとその実体。タブが閉じられて
    // _コンテンツ管理 から実体が削除された後でも、ここに残った参照を使えば
    // コンテキスト.コンテンツ取得 に頼らず DOM から取り除ける。
    readonly 添付済みコンテンツ: ReadonlyMap<タブID, HtmlComponentBase>;
    // 直近に使ったタブ内ボタン一覧(参照比較用)。レイアウトが不変でもボタン追加だけは
    // 検知する必要があるため、タブ一覧/選択中とは別に保持する。
    readonly タブボタン一覧記録: ReadonlyMap<タブID, readonly タブ内ボタン定義[]>;
}

export interface 構築済み左右分割 {
    readonly kind: "左右分割";
    readonly ペイン: 左右分割ペイン;
    readonly 要素: DivC;
    readonly スプリッター: DivC;
    readonly 左: 構築済みペイン;
    readonly 右: 構築済みペイン;
}

export interface 構築済み上下分割 {
    readonly kind: "上下分割";
    readonly ペイン: 上下分割ペイン;
    readonly 要素: DivC;
    readonly スプリッター: DivC;
    readonly 上: 構築済みペイン;
    readonly 下: 構築済みペイン;
}
