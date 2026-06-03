# Apify eBay相場更新Actor

Sony Cyber-shot T/TXシリーズのeBay Sold相場を取得し、Supabaseの `model_market_metrics` を更新します。

## できること

- T/TX 32型番を順番に調査
- eBay Sold listingsから売価と送料を取得
- 検索語とタイトル判定でアクセサリー、部品、ジャンクを除外
- 平均売価、下限、上限、セルスルー、Rankを再計算
- Supabaseへ上書き保存
- 実行履歴を `refresh_runs` に保存
- 取得したSold明細を `market_snapshots` に保存

## Apifyでの作成手順

1. Apifyにログイン
2. 左メニューの **Actors** を開く
3. **Create new Actor** を押す
4. **Import from GitHub** を選ぶ
5. Repository URLにこれを入れる

```text
https://github.com/AjitoJapan/cybershot-sourcing-tool.git
```

6. Source directory / subfolder にこれを入れる

```text
apify-actor
```

7. Buildする
8. Input画面で以下を設定する

```text
Supabase URL:
https://shejaburznracvhzzdhw.supabase.co

Supabase service role key:
SupabaseのSettings > API Keysにある secret/service_role のキー
```

重要: service role keyはApifyのInputまたはSecretだけに入れます。GitHub、Vercel、ブラウザ用ファイルには絶対に入れません。

## 初回テスト

最初は無料枠を守るため、modelsを3つだけにして動かすのがおすすめです。

```text
T1
T100
TX30
```

Runが成功したら、Webアプリを開いて最終相場更新日と価格が変わるか確認します。

## 検索キーワードと除外ルール

各型番は、最初のスプレッドシート調査と同じ条件に合わせます。

```text
検索キーワード:
1. SONY Cyber-shot 型番
2. SONY 型番
3. Cyber-shot 型番

カテゴリ: デジタルカメラ
最低価格: $80
```

例:

```text
SONY Cyber-shot T100
SONY T100
Cyber-shot T100

SONY Cyber-shot TX30
SONY TX30
Cyber-shot TX30
```

複数キーワードで取った結果は、商品URLで重複排除します。
出品数は複数検索の合計ではなく、一番大きい検索結果数を使います。
これにより、拾い漏れを減らしつつ、同じ商品を二重計上しないようにします。

検索後、タイトル側でさらに絞ります。

集計に入れる条件:

- `Sony` が入っている
- `Cyber-shot` または `Cybershot` が入っている
- `DSC-T100` / `DSCT100` / `Cyber-shot T100` / `T100` のように対象型番が入っている

除外する例:

- case / bag / strap / cable / dock
- manual / CD / box only
- LCD / screen protector
- parts / repair / broken / not working
- untested / junk / as-is

バッテリーや充電器は、カメラ本体とセットで売られている場合は集計に入れます。
ただし、タイトルがバッテリー単体・充電器単体に見える場合は外します。

例:

```text
入れる: SONY Cyber-shot T100 digital camera with battery charger
外す: SONY Cyber-shot T100 battery charger only
```

このため、カメラ本体付きの通常Soldは残しつつ、アクセサリー単体・ケース・部品取り・ジャンク品は平均相場から外します。

## 月2回スケジュール

初回Runが成功したあと、Apifyの **Schedules** から設定します。

おすすめ:

```text
毎月 1日 06:00
毎月 15日 06:00
Timezone: Asia/Tokyo
```

ApifyのCronで入れる場合:

```text
0 6 1,15 * *
```

## 注意

- eBayのページ構造が変わると、取得できない場合があります。
- 取得できない型番があっても、他の型番は更新を続けます。
- 低頻度運用（月2回）向けです。毎日・高頻度で回す設計ではありません。
- Service role keyは強い権限を持つため、公開リポジトリへ入れないでください。
