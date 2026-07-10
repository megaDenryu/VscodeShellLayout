# VscodeShellLayout

SengenUIの上に構築されたVSCode風ドッキングUI外殻ライブラリ。メニューバー・アクティビティバー・エディタエリア（タブDnD・ペイン分割）・パネル・右サイドバー・ステータスバーを提供する。

元はPokemonBattleAIリポジトリ（`megadenryu_support_ui/submodules/VscodeShellLayout`）内で開発されていたものを、複数プロジェクト（PokemonBattleAI / AgentRoom / MonogatariAI）で共用するため独立リポジトリ化した。それ以前の変更履歴はPokemonBattleAIリポジトリにある。

## 利用方法

npmパッケージとしては配布していない。ホストリポジトリにgit submoduleとして取り込み、TypeScriptソースを直接参照する。

前提（3点セット）:
1. 本リポジトリを `submodules/VscodeShellLayout` に配置
2. SengenUI（git@github.com:megaDenryu/SengenUI.git）を隣の `submodules/SengenUI` に配置（`package.json` が `file:../SengenUI` で参照するため、並び位置が契約）
3. ホスト側のViteに `@vanilla-extract/vite-plugin` を導入し、`resolve.alias` で `sengen-ui` を `submodules/SengenUI` に向ける

エントリポイントは `src/index.ts`。主要APIは `外殻レイアウト`（全スロットをコンストラクタ注入するLV2 Orchestrator）。

## 既知の未実装

- テーマのランタイム差し替え（`テーマ配色` 型は存在するが配線されておらず、配色は `テーマ/デフォルトテーマ.ts` のビルド時値で固定）
- アクティビティバー連動の左サイドバー（右サイドバー固定スロットのみ）
- パネルエリアのタブ動的追加・DnD
