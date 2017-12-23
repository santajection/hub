santa jection Hub Web socket API
===

# hub

### リポジトリのクローン

```sh
git clone git@github.com:santajection/hub.git
```

## 実行

Node.js でサーバネイティブにインストールするやり方と、`docker-compose` を使う方法がある。

### Node.js 編

#### パッケージインストール

```sh
cd hub
npm install
```

#### 起動

```sh
npm start
```

または

```sh
./bin/www
```

### `docker-compose` 編

#### 起動

```sh
docker-compose up
```

## ソケット一覧

### `/mobile` routes

- `socket.emit('move', 1)`: 振った
- `socket.emit('join', {name: 'someone', color: 'red'})`: 参加表明 (colorは `'red', 'blu', 'yel', 'gre'`)。受け付けられたら `notify` ルートで `{message: '参加が受け付けられました'}` を受信、受け付けられなかったら　`notify` ルートで `{message: '参加が受け付けられませんでした'}` を受信。
- `socket.emit('glow', null)`: 自分を光らせろと要求する
----
- `socket.on('notify', [Object])`: 運営からのメッセージ受信
- `socket.on('setstate', {method: 'setstate', options: {state: 'xxx'}})`: アプリの状態を設定

### `/proj` routes

- `socket.on('mobile_move', {method: 'mobile_move', options: ..., timestamp: 12345678999987321})`: サンタが動いた
- `socket.on('join', {method: 'join', options: {id: 'socketid', name: 'someone', color: 'red'}, timestamp: 1234321444)`: 新サンタ加入
- `socket.on('glow_santa', {method: 'glow_santa', options: {id: 'socketid'}, timestamp: 12314123333})`
- `socket.on('change_scene', {method: 'change_scene', options: {???}, timestamp: 12323422224123})`: 画面遷移指示
- `socket.on('initialize', {method: 'initialize', options: {}, timestamp: 12312312323})`: 参加受付状態遷移指示
- `socket.on('start', {method: 'start', options: {}, timestamp: 12332342412321})`: ゲーム開始指示
- `socket.on('notify', {method: 'notify', options: {...}, timestamp: 1231231231})`: 運営からのメッセージを受信
- `socket.on('santa_move', {method: 'santa_move', options: {color: 'red', amount: 123}, timestamp: 1232141312})`: `color` 色のサンタを `amount` だけ進める指示
----
- `socket.emit('initialized', null)`: 参加受付状態になった
- `socket.emit('started', null)`: ゲームがスタートした
- `socket.emit('ended', null)`: ゲームが終了した
- `socket.emit('goaled', {id: 'socketid'})`: `socketid` のサンタがゴールした
- `socket.emit('hit_tonakai', {id: 'socketid'})`: `socketid` のサンタがトナカイに衝突した
- `socket.emit('sound', {name: 'audio_name', method: 'play'})`: サウンドを鳴らす（止める）

### `/unnei` routes
- `socket.on('sound', {options: {name: 'audio_name', 'method': 'play'}, method: 'sound', timestamp: 1231231231})`: サウンドを鳴らす
---
- `socket.emit('initialize', {active_game_id: id})`: 参加受付状態にしろ
- `socket.emit('start', null)`: ゲームを開始しろ
- `socket.emit('santa_move', {color: 'red', amount: 123})`: `color` 色のサンタを `amount` だけ進めろ
- `socket.emit('change_scene', {???})`: 画面を遷移しろ
- `socket.emit('notify_proj', {message: 'some message'})`: プロジェクタへメッセージ送信
- `socket.emit('notify_mobile', {..., message: 'some message'})`: モバイルへメッセージ送信 ...部は送信先の指定に使う。
    - `{id: 'socketid', message: 'some message'}`: IDのサンタへ `'some message'` 送信
    - `{status: 'playing', message: 'some message'}`: ゴールしてないサンタ全員へ `'some message'` を送信
    - `{status: 'goaled', message: 'some message'}`: ゴールしたサンタ全員へ `'some message'` を送信
    - `{message: 'some message'}`: 参加中の全てのサンタへ `'some message'` を送信
    - `{broadcast: true, message: 'some message'}`: ソケット接続している全てのサンタに送信
