# Apify eBay相場更新Actor

Sony Cyber-shot T/TXシリーズのeBay Sold相場を取得し、Supabaseの `model_market_metrics` を更新します。

## 方式

このActorはeBayへ直接アクセスしません。
eBay直取りは403で拒否されやすいため、Apify StoreのSold専用Actorを呼び出して結果を集計します。

使用する専用Actor:

```text
automation-lab/ebay-sold-scraper
```

## 取得・集計するもの

- Sold価格
- 送料
- タイトル
- 売れた日付
- 商品URL
- 状態

そこから以下を計算します。

- 平均売価
- 下限価格
- 上限価格
- 平均送料
- 信頼度
- Rank

## 検索条件

各型番ごとに3パターンで検索します。

```text
SONY Cyber-shot T100
SONY T100
Cyber-shot T100
```

TX系なら:

```text
SONY Cyber-shot TX30
SONY TX30
Cyber-shot TX30
```

共通条件:

```text
最低価格: $80
```

取得後、商品URLで重複排除します。

## 除外するもの

明確に相場を壊すタイトルだけ除外します。

```text
box only
parts
repair
broken
not working
untested
junk
as-is
```

バッテリーや充電器は、カメラ本体とセットで売られている場合があるため、単純除外しません。

## 初回テスト

最初は無料枠と使用量を守るため、modelsを3つだけにして動かします。

```text
T1
T100
TX30
```

Runが成功したら、Webアプリで最終相場更新日と価格を確認します。

## Inputの主な項目

```text
Supabase URL:
https://shejaburznracvhzzdhw.supabase.co

Supabase service role key:
SupabaseのSettings > API Keysにある secret/service_role のキー

eBay Sold scraper Actor:
automation-lab/ebay-sold-scraper
```

`Apify token` は通常空欄でOKです。
もし専用Actor呼び出しでトークンエラーが出た場合だけ、ApifyのAPI tokenを入れます。

## 月2回スケジュール

初回Runが成功したあと、Apifyの **Schedules** から設定します。

おすすめ:

```text
毎月 1日 06:00
毎月 15日 06:00
Timezone: Asia/Tokyo
```

Cronで入れる場合:

```text
0 6 1,15 * *
```

## 注意

- Apify Storeの専用Actor利用分は有料になる可能性があります。
- 32機種を月2回回す前に、必ず3機種でテストしてください。
- service role keyはApify内だけに保存し、GitHubやVercelへ入れないでください。
