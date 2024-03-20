// import * as Cesium from "cesium";
// import "cesium/Build/Cesium/Widgets/widgets.css";

// CDNの場合はここにwindowオブジェクトからCesiumを入れる
let Cesium;

const viewModel = {
  compassBias: 0, // コンパス手動調整用のバイアス
};

// view層グローバル変数
let cesiumViewer;
let cesiumCamera;
let postProcessStages;
let occlusionStage;
let silhouetteStage;
let selectedFeatures = [];

// GPSトラッキングのID
let gpsTrackingWatchId = 0;

// 前フレームの端末姿勢・位置を保持しておく用 (CesiumのSetViewがこれらを全部同時にセットしないといけない仕様であるために用意している)
let oldDestination; // = new Cesium.Cartesian3();
let oldDirection; // = new Cesium.Cartesian3();
let oldUp; // = new Cesium.Cartesian3();

// iOS用方位初期値管理
let isiosHeadingInitialized = false;
let iosInitialHeading = 0;

// iOS判定
function detectIsIos() {
  if (
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    const ua = navigator.userAgent.toLowerCase();
    return ua.indexOf("iphone") !== -1;
  }
  return false; // ブラウザ環境でない場合はfalseを返す
}
export const isios = detectIsIos();

// スロットリング
function throttle(fn, delay) {
  let timerId;
  let lastExecTime = 0;
  return () => {
    const context = this;
    const args = arguments;
    let elapsedTime = performance.now() - lastExecTime;
    const execute = () => {
      fn.apply(context, args);
      lastExecTime = performance.now();
    };
    if (!timerId) {
      execute();
    }
    if (timerId) {
      clearTimeout(timerId);
    }
    if (elapsedTime > delay) {
      execute();
    } else {
      timerId = setTimeout(execute, delay);
    }
  };
}

// Cesiumのセットアップ
async function setupCesiumViewer(tilesetUrls) {
  // Set Tokens
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlY2EyZTg0NS04Y2VlLTRjNmEtYTIxZS0zODdlNjlkZWE2OGQiLCJpZCI6MTQ5ODk3LCJpYXQiOjE2OTEwNTU3OTV9.LJmPN5Q_QDbxCHxtWVBOB9Y13E-VySEmyiauA6BllwU";

  // Initialize the Cesium Viewer in the HTML element with the `cesiumContainer` ID.
  cesiumViewer = new Cesium.Viewer("cesium_container", {
    animation: false,
    baseLayerPicker: false,
    fullscreenButton: false,
    geocoder: false,
    homeButton: false,
    infoBox: false,
    sceneModePicker: false,
    selectionIndicator: false,
    timeline: false,
    navigationHelpButton: false,
    navigationInstructionsInitiallyVisible: false,
    skyBox: false, // スカイボックス無効化
    skyAtmosphere: false, // 空を非表示
    contextOptions: {
      webgl: {
        preserveDrawingBuffer: true,
        alpha: true, // 透過
      },
    },
    globe: false, // 地球と地形↓を非表示
    //terrainProvider: Cesium.createWorldTerrain()
  });
  // 背景透過
  cesiumViewer.scene.backgroundColor = Cesium.Color.TRANSPARENT;

  // カメラを取っておく
  cesiumCamera = cesiumViewer.camera;

  // FOV (π/x) のxを取得しておく
  const defaultFov = cesiumCamera.frustum.fov;
  const defaultFovPiOver = Cesium.Math.PI / cesiumCamera.frustum.fov;
  console.log("Default FOV: %f", defaultFov);
  console.log("Default FOV Pi Over: %f", defaultFovPiOver);
  viewModel.fovPiOver = defaultFovPiOver;

  // ポストプロセスステージをとっておく
  postProcessStages = cesiumViewer.scene.postProcessStages;

  // // カスタムシェーダ
  // const customShader = new Cesium.CustomShader({
  //     // 全頂点において一律で不変に使用する変数
  //     uniforms: {},
  //     // 頂点シェーダーからフラグメントシェーダーに橋渡しする場合に用いる変数
  //     varyings: {},
  //     // 元のマテリアルを加工して描画するのか、元のマテリアルを完全に無視してシェーダーのみで描画するのか
  //     mode: Cesium.CustomShaderMode.MODIFY_MATERIAL,
  //     // ライティングを物理ベースレンダリング(PBR)にするかライティングなし(UNLIT)にするか
  //     lightingModel: Cesium.LightingModel.PBR,
  //     // 元のマテリアルの透明度をシェーダにも反映するか
  //     // https://cesium.com/learn/cesiumjs/ref-doc/global.html#CustomShaderTranslucencyMode
  //     translucencyMode: Cesium.CustomShaderTranslucencyMode.TRANSLUCENT,
  //     // 頂点シェーダ
  //     vertexShaderText: `
  //         void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput) {
  //             // Do nothing.
  //         }
  //     `,
  //     // フラグメントシェーダ
  //     fragmentShaderText: `
  //         void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
  //             //material.diffuse = vec3(1.0, 0.0, 0.0);
  //             material.alpha = 0.8;
  //         }
  //     `,
  // });

  // PLATEAUのテクスチャ付き3DTilesを表示
  // PLATEAUのデータはここから取得
  // https://github.com/Project-PLATEAU/plateau-streaming-tutorial/blob/main/3d-tiles/plateau-3dtiles-streaming.md
  // 港区LOD2
  // "https://assets.cms.plateau.reearth.io/assets/df/b95190-23af-4087-9981-430ca798f502/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13103_minato-ku_lod2/tileset.json",
  // 中央区LOD2
  // "https://assets.cms.plateau.reearth.io/assets/38/9cf378-c397-49bb-a4fb-894ce86647d8/13100_tokyo23-ku_2022_3dtiles_1_1_op_bldg_13102_chuo-ku_lod2/tileset.json",
  // 千代田区LOD2
  // "https://assets.cms.plateau.reearth.io/assets/14/b8f886-921d-46d3-9fd4-4f6e568b27d4/13100_tokyo23-ku_2022_3dtiles%20_1_1_op_bldg_13101_chiyoda-ku_lod2/tileset.json",
  // 川崎市多摩区LOD1
  // "https://assets.cms.plateau.reearth.io/assets/f5/9392d2-5974-4df4-bb49-bcd4ebd44ff8/14130_kawasaki-shi_2022_3dtiles_1_op_bldg_14135_tama-ku_lod1/tileset.json",
  // 郡山市LOD2
  // "https://assets.cms.plateau.reearth.io/assets/0b/095119-b1e9-48c0-b5bd-0b18518e5a36/07203_koriyama-shi_2020_3dtiles_6_op_bldg_lod2/tileset.json",

  tilesetUrls.map(async tilesetUrl => {
    try {
      // https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html
      const plateauTileset = await Cesium.Cesium3DTileset.fromUrl(
        tilesetUrl,
        // オプション一覧はこちら https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileset.html#.ConstructorOptions
        {
          //debugShowBoundingVolume: true, // ローカルのファイルシステムから実行している場合はエラーが出る
          //debugShowContentBoundingVolume: true
          //customShader: customShader // ここでカスタムシェーダーを渡す https://cesium.com/learn/cesiumjs/ref-doc/CustomShader.html
        }
      );
      // 3DTiles専用のスタイルを作成
      // https://cesium.com/learn/cesiumjs/ref-doc/Cesium3DTileStyle.html
      // const style = new Cesium.Cesium3DTileStyle();
      // 3DTilesのStyleExpressionsの記法で指定
      // https://github.com/CesiumGS/3d-tiles/tree/main/specification/Styling
      // style.color = 'color("aliceblue", 0.8)';
      // plateauTileset.style = style;
  
      console.log("Success loading tileset");
  
      cesiumViewer.scene.primitives.add(plateauTileset);
      cesiumViewer.flyTo(plateauTileset);
    } catch (error) {
      console.log(`Error loading tileset: ${error}`);
    }
  });
}

// Cesium Viewer を破棄
function destroyCesiumViewer() {
  cesiumViewer.scene.primitives.removeAll();
  cesiumViewer.destroy();
}

// 輪郭表示シェーダーのポストプロセスステージをセットアップ
function setupSilhouetteStage() {
  const edgeDetectionStage =
    Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
  edgeDetectionStage.uniforms.color = Cesium.Color.LIME;
  edgeDetectionStage.selected = [];
  silhouetteStage = postProcessStages.add(
    Cesium.PostProcessStageLibrary.createSilhouetteStage([edgeDetectionStage])
  );
}

// オクルージョンシェーダーのポストプロセスステージをセットアップ
function setupOcclusionStage() {
  const fragmentShaderSource = `
        uniform sampler2D colorTexture;
        in vec2 v_textureCoordinates;
        void main() {
            vec4 color = texture(colorTexture, v_textureCoordinates);
            if (czm_selected()) {
                // 選択されているFeatureの場合はそのまま描画する
                out_FragColor = color;
            } else {
                // 選択されていないFeatureは描画しない
                // discardだとclearColorオプションをTRANSPARENTにしても黒でクリアされてしまうので使用しない
                // discard;
                // 透過カラーで描画
                out_FragColor = vec4(0,0,0,0);
            }
        }
    `;
  occlusionStage = postProcessStages.add(
    new Cesium.PostProcessStage({
      fragmentShader: fragmentShaderSource,
      uniforms: {},
      // 本オプションは指定せずともシェーダーの透明カラーは使用可能
      // またこれとdiscardを組み合わせても透過はできない
      //clearColor: Cesium.Color.TRANSPARENT,
    })
  );
  occlusionStage.selected = [];
}

// Cesium系セットアップ
function setupCesium(tilesetUrls) {
  Cesium = window.Cesium;
  oldDestination = new Cesium.Cartesian3();
  oldDirection = new Cesium.Cartesian3();
  oldUp = new Cesium.Cartesian3();
  setupCesiumViewer(tilesetUrls);
  setupSilhouetteStage();
  // setupOcclusionStage();
}

// Cesium系クリーンアップ
function cleanUpCesium() {
  destroyCesiumViewer();
}

// デバイスカメラプレビューのセットアップ
async function startDeviceCameraPreview() {
  const devicCameraPreview = document.getElementById("device_camera_preview");

  // TODO: onResizeイベントでdebounce
  const cameraWidth = window.innerWidth;
  const cameraHeight = window.innerHeight;
  console.log("Camera Width: %d", cameraWidth);
  console.log("Camera Height: %d", cameraHeight);

  const constraints = {
    audio: false,
    video: {
      // ここはあくまでカメラに要求する解像度を指定するオプションなので、この通りの解像度でフィードがくるわけではなく、要求した値に近い最適な解像度で返ってくる。
      // https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia
      // よってそこから更に全画面にしたければコンテナ側のobject-fitをcoverにするなどする。
      width: cameraWidth,
      height: cameraHeight,
      facingMode: "environment",
    },
  };

  try {
    devicCameraPreview.srcObject =
      await navigator.mediaDevices.getUserMedia(constraints);
  } catch (err) {
    // window.alert(window.isSecurityContext);
    // window.alert(err.toString());
    console.log(err.toString());
  }
}

// Cesiumのカメラ座標を更新
function moveCesiumCamera(destination) {
  // console.log(`camera moved: ${destination}`);
  cesiumCamera.setView({
    destination: destination,
    // orientation: isios ? oldHeadingPitchRoll : { direction: oldDirection, up: oldUp }
    orientation: { direction: oldDirection, up: oldUp },
  });
  oldDestination = destination;
}

// Cesiumのカメラ姿勢を更新
function poseCesiumCamera(orientation) {
  // destinationが初期化時のCartesian3(0,0,0)の場合はCesium.CameraのsetViewが内部で高度を算出できずエラーとなり、
  // その際の迂回処理がCesiumで提供されておらず、Cesiumがそのままエラーを吐いて止まるだけの仕様のため、その間はsetViewしない
  const cartographic = Cesium.Cartographic.fromCartesian(oldDestination);
  if (cartographic && cartographic.height) {
    cesiumCamera.setView({
      destination: oldDestination,
      orientation: orientation,
    });
  }
  oldDirection = orientation.direction;
  oldUp = orientation.up;
}

// デバイス位置のトラッキングを開始
function startGpsTracking() {
  let options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };

  gpsTrackingWatchId = navigator.geolocation.watchPosition(
    function (pos) {
      throttle(gpsTrackingProcess(pos), 100);
    },
    function (err) {
      console.log(err.toString());
    },
    options
  );
}

// デバイス位置のトラッキングを終了
function stopGpsTracking() {
  navigator.geolocation.clearWatch(gpsTrackingWatchId);
}

// デバイスGPSの値をもとにCesiumのカメラ座標を更新
function gpsTrackingProcess(pos) {
  // 標高はWGS84楕円体からのメートル高度。ArcGISを使用する手もある
  // GPSのHeadingは更新頻度が激遅なので実質役に立たないため不使用
  const coords = pos.coords;
  const lat = coords.latitude ?? 0;
  const long = coords.longitude ?? 0;
  const alt = coords.altitude ?? 0;
  const head = coords.heading ?? 0;
  const accur = coords.accuracy ?? 0;

  // 緯度経度高度のデカルト座標にまとめる
  // Cesiumの指定はlong, lat, altの順であることに注意
  // const destination = Cesium.Cartesian3.fromDegrees(139.74530681029205, 35.65807022172221, 60); // 東京タワー前
  // const destination = Cesium.Cartesian3.fromDegrees(140.38804838405298, 37.39840050666605, 400); // 郡山駅前
  const destination = Cesium.Cartesian3.fromDegrees(long, lat, alt);

  // カメラ座標を更新
  moveCesiumCamera(destination);

  // 数値表示
  const geolocationStatusView = document.getElementById("geolocation_status");
  geolocationStatusView.innerText = `Your current position:
    Latitude : ${lat}
    Longitude: ${long}
    More or less: ${accur} meters
    Altitude: ${alt}
    Heading: ${head}`;
}

// // 回転行列はW3Cのドキュメントにもあるこちらの方法でで手構成してもよいが、今回はせっかくなのでCesiumの行列系の便利メソッドを使用して構成することとする
// let degtorad = Math.PI / 180; /*  度° ↔ ラジアン 間の換算用  */
// function getRotationMatrix(alpha, beta, gamma) {
//     let _x = beta  ? beta  * degtorad : 0; // β 値
//     let _y = gamma ? gamma * degtorad : 0; // γ 値
//     let _z = alpha ? alpha * degtorad : 0; // α 値

//     let cX = Math.cos( _x );
//     let cY = Math.cos( _y );
//     let cZ = Math.cos( _z );
//     let sX = Math.sin( _x );
//     let sY = Math.sin( _y );
//     let sZ = Math.sin( _z );

//     /*  ZXY 回転行列の構築  */

//     let m11 = cZ * cY - sZ * sX * sY;
//     let m12 = - cX * sZ;
//     let m13 = cY * sZ * sX + cZ * sY;

//     let m21 = cY * sZ + cZ * sX * sY;
//     let m22 = cZ * cX;
//     let m23 = sZ * sY - cZ * cY * sX;

//     let m31 = - cX * sY;
//     let m32 = sX;
//     let m33 = cX * cY;

//     return [
//         m11,    m12,    m13,
//         m21,    m22,    m23,
//         m31,    m32,    m33
//     ];
// };

function throttledOrientationTrackingProcess(event) {
  throttle(orientationTrackingProcess(event), 100);
}

// デバイス姿勢のトラッキングを開始
function startOrientationTracking() {
  window.addEventListener(
    // 通常のdeviceorientationは方角AlphaがBeta,Gammaで変化して補正が必要なのでdeviceorientationabsoluteを用いるが
    // iOSではabsoluteが存在しないため代わりにdeviceorientation/webkitCompassHeadingを使用する
    isios ? "deviceorientation" : "deviceorientationabsolute",
    throttledOrientationTrackingProcess
  );
}

// デバイス姿勢のトラッキングを終了
function stopOrientationTracking() {
  window.removeEventListener(
    // 通常のdeviceorientationは方角AlphaがBeta,Gammaで変化して補正が必要なのでdeviceorientationabsoluteを用いるが
    // iOSではabsoluteが存在しないため代わりにdeviceorientation/webkitCompassHeadingを使用する
    isios ? "deviceorientation" : "deviceorientationabsolute",
    throttledOrientationTrackingProcess
  );
}

// デバイスIMUの値をもとにCesiumのカメラ姿勢を更新
function orientationTrackingProcess(event) {
  // https://www.w3.org/TR/orientation-event/
  // https://triple-underscore.github.io/deviceorientation-ja.html
  // https://developer.mozilla.org/ja/docs/Web/API/Device_orientation_events/Orientation_and_motion_data_explained
  // https://developer.mozilla.org/ja/docs/Web/API/Device_orientation_events/Detecting_device_orientation
  // https://developer.mozilla.org/en-US/docs/Web/API/Device_orientation_events/Using_device_orientation_with_3D_transforms
  // https://dev.opera.com/articles/w3c-device-orientation-usage/
  // https://stackoverflow.com/questions/56769428/device-orientation-using-quaternion
  // https://blog.bascule.co.jp/entry/2021/10/20/104350
  // https://sakapon.wordpress.com/2017/01/15/3d-rotation-conversion/

  // iOSの場合はdeviceorientationabsoluteが使用不可の代わりに、端末姿勢に影響されないコンパス値が別のプロパティで取得できるのでそちらを初期値として使う
  // https://developer.apple.com/documentation/webkitjs/deviceorientationevent/1804777-webkitcompassheading
  // ただしiOSの場合デバイスがどんな姿勢であってもデバイスの時計回転でもwebkitCompassHeadingが変わってしまうというクソお節介仕様があるので継続使用せず初期値使用に留める必要がある
  // nullではない最初のwebkitCompassHeadingのみを取得して初期値として使用する
  if (isios && event.webkitCompassHeading != null && !isiosHeadingInitialized) {
    iosInitialHeading = event.webkitCompassHeading;
    isiosHeadingInitialized = true;
  }

  // alphaは画面平面中心と直交する軸z(画面より手前が正)を中心として、デバイスを地面に対して水平にしたとき北向きを0とし、軸を正の方向に見て時計回り(画面を見る者からは反時計回り)に全周で360までの値を返す。
  // (alphaは画面を見る者からは軸に対して反時計回りで値が増加するように見えるが、他の値と同じく軸を正の方向に見た際には時計回りで値が増加するので一貫している)
  // デバイスにピッチとロールが掛かった場合にはそのままでは方位の値としては使用できず、方位のみの値として扱いたい場合は別途計算が必要。回転行列用の値としてならそのまま使用する。
  // (iOSの場合event.webkitCompassHeadingはalphaとは異なる端末姿勢条件での方位変化の入ってくる仕様なのでそのまま代用にはならなず、初期化専用とする)
  const deviceAlpha = isios
    ? iosInitialHeading + event.alpha
    : event.alpha ?? 0;
  // betaは画面平面中心を原点とする妻手方向の軸x(画面右方向が正)を中心として、デバイスを地面に対して水平にしたときを0とし、機首上げ方向(軸を正の方向に見て時計回り)にピッチをとると+180、機首下げ方向(軸を正の方向に見て反時計回り)にピッチをとると-180までの値を返す
  // デバイスの長辺の端Aと端Bのそれぞれの地面からの距離の差が0のときに0となり、AとBの差が大きくなるほど値が大きくなる
  const deviceBeta = event.beta ?? 0;
  // gammaは画面平面中心を原点とする長手方向の軸y(画面上方向が正)を中心として、デバイスを地面に対して水平にしたときを0とし、軸を正の方向に見て時計回りにロールさせると+90、軸を正の方向に見て反時計回りにロールさせると-90までの値を返す (裏返しの場合も同様)
  // デバイスの短辺の端Cと端Dのそれぞれの地面からの距離の差が0のときに0となり、CとDの差が大きくなるほど値が大きくなる
  const deviceGamma = event.gamma ?? 0;

  // alpha/beta/gammaの値を素直にHeading/Pitch/Rollのに変換することはできない。これらを素直に変換できるのは、端末を地面に対して水平にしているときのみ。
  // それ以外の場合は、alpha, betaの性質(それぞれの辺の端点の地面からの距離の差が値になること)が、Heading/Pitch/Rollへの変換には不適切になる。
  // また、alpha/beta/gammaのオイラー角のままでは、betaの値が90度になるとalpha/gammaが180度飛んでしまうジンバルロックが発生する。
  // よって、Heading/Pitch/Rollのorientationではなく、alpha/beta/gammaの値を回転行列または四元数に変換してから別の方法でカメラに適用してあげるほうが適切となる。
  // このとき、endTransformを用いて回転行列でカメラの向きを制御する方法もありそうなのだが、うまく動かなかったため今回は使用せず、direction/upベクトルを指定する方法をとる。
  // https://community.cesium.com/t/control-cesium-camera-with-device-orientation/6844
  // https://groups.google.com/g/cesium-dev/c/cr2P2wfOwl4

  // 軸周りのオイラー角を3次元回転行列に変換していく。
  // W3Cの定義によると、デバイスオリエンテーションの一連のローテーションは、intrinsic Tait-Bryan angles (オイラー角) of type Z-X'-Y" と定められている。
  // これは、intrinsicなのでデバイスに追従するデバイス座標系であり、X'は最初にZ軸周りの回転を適用した後のX軸、Y"はさらにX'軸周りの回転を適用した後のY軸を表す。
  // なお右手左手系については、軸の正な方向に向かって眺めたときに、時計回りが軸周りの正な回転であるとするため、右手系とする。
  // https://www.w3.org/TR/orientation-event/#device-orientation-model
  // Tait-Bryan angles (オイラー角) から回転行列への変換は、下記のW3Cのドキュメント内でも取り扱われているので、それに従いつつCesiumを使用したバージョンとして以下を実装する。
  // https://www.w3.org/TR/orientation-event/#worked-example-2

  // TODO: 単純にalphaにバイアスを入れるだけだと、betaの値によっては方位にズレが発生するので、厳密にやるならそれにも対処する
  // 0-360のalphaに0-360のバイアスを足す計算 (0~360をはみ出た場合は循環させる)
  let biasedAlpha = 0;
  const biasedDegree = Number(deviceAlpha) + Number(viewModel.compassBias); // アノテーションしないとここが文字列の結合になってしまい正しく足せない
  if (biasedDegree > 360) {
    biasedAlpha = biasedDegree - 360;
  } else if (biasedDegree < 0) {
    biasedAlpha = biasedDegree + 360;
  } else {
    biasedAlpha = biasedDegree;
  }
  console.log("===");
  console.log("device alpha: ", deviceAlpha);
  console.log("compass bias: ", viewModel.compassBias);
  console.log("biased degree: ", biasedDegree);
  console.log("biased alpha: ", biasedAlpha);

  // alpha/beta/gammaをそれぞれラジアンに変換
  //const deviceAlphaRad = Cesium.Math.toRadians(180 - deviceAlpha); // 0~360の値をラジアン変換用に-180~180の値に直す(toRadiansは受け取ったdegreeにMath.PI/180.0を掛けるので)
  const deviceAlphaRad = Cesium.Math.toRadians(180 - biasedAlpha); // ↑に加えてコンパス手動調整用のバイアスを考慮するバージョン
  const deviceBetaRad = Cesium.Math.toRadians(deviceBeta);
  const deviceGammaRad = Cesium.Math.toRadians(deviceGamma);

  // 軸毎の回転行列に変換
  const xRotation = Cesium.Matrix3.fromRotationX(deviceBetaRad); // x軸をデバイス画面妻手軸にとった場合の軸周り回転 (==ピッチ)
  const yRotation = Cesium.Matrix3.fromRotationY(deviceGammaRad); // y軸をデバイス画面長手軸にとった場合の軸周り回転 (==ロール)
  const zRotation = Cesium.Matrix3.fromRotationZ(deviceAlphaRad); // z軸をデバイス画面直交軸にとった場合の軸周り回転 (==ヨー)

  // 3次元の回転行列に変換
  // 軸毎の回転行列を、W3Cの定義通りZ-X'-Y"の順に掛ける。
  // (multiplyの第三引数は返り値と同値が入るものだが不使用かつoptionalでないためダミーを入れている)
  let rotation = Cesium.Matrix3.multiply(
    yRotation,
    Cesium.Matrix3.multiply(xRotation, zRotation, new Cesium.Matrix3()),
    new Cesium.Matrix3()
  );
  // 手構成のgetRotationMatrixで計算した回転行列と、↑の構成方法での回転行列では、構成の仕方で正負が反転している軸があるが同様
  // const rotArray = getRotationMatrix(deviceAlpha, deviceBeta, deviceGamma);
  // const rot = Cesium.Matrix3.fromArray(rotArray);

  // 正規化
  Cesium.Quaternion.normalize(rotation, rotation);

  // ところで、CameraのendTransformを指定する方法でもカメラの姿勢を変更できるはずだが、自分で指定してもどうやら効果がないようなので、こちらは使わないこととした
  // カメラ移動用の4次元行列に変換
  // const transform = Cesium.Matrix4.fromRotation(rotation);

  // https://tomofiles.hatenablog.com/entry/2019/11/03/222226
  // 宇宙の座標系には、任意の天体や銀河を中心とする天球座標系と、地球を中心とした地理座標系がある。
  // 地理座標系において、地球にくっついて地球と共に回転する地球中心の座標系・参照フレームがご存知ECEFとなる。
  // ECEF内には3つの座標系の表現方法がある。
  // - 測地座標系 (WGS84の緯度経度高度)
  // - ローカル地平直交座標系 (LTP=Local tangent plane coordinates) (ある地球上の1点における地球の接面を基準としたときに東を指し示すeast, 北を指し示すnorth, 法線方向を指し示すup (ENU)軸により構成される)
  //   - https://en.wikipedia.org/wiki/Local_tangent_plane_coordinates
  // - WGS84の楕円体の中心を基準とした3次元直交座標

  // によるセンサ値は地面に対して水平を基準とした値であるため、これをもとに構成した回転行列は、ローカル地平直交座標系における回転行列である。
  // よって、ローカル地平直交座標系における回転を、WGS84の固定参照フレームにおける回転に変換してやる必要がある。
  // https://en.wikipedia.org/wiki/Axes_conventions
  // https://en.wikipedia.org/wiki/Geographic_coordinate_conversion
  // https://ja.wikipedia.org/wiki/%E7%B5%8C%E7%B7%AF%E5%BA%A6

  // Cesiumのカメラはdestinationだけセットするとデフォルトで地面を向いて北を指すようになっている。
  // カメラのコードを読んでみると、カメラの初期transformとして、指定した経緯度におけるeastNorthUpToFixedFrameのtransformを掛けていることがわかった。
  // しかし、様々に実験を行ったところ、setViewで指定するdirection, upベクトルは、これを指定してもeastNorthUpToFixedFrameの補正をかけてくれないことが分かった。
  // よって、setViewで指定するdirection, upベクトルについては、IMUから計算したローカル地平直交座標系における回転を、現在座標のeastNorthUpToFixedFrameで補正してからこれを与えるべきであると分かった。
  // この辺りの実験経緯は、別プロジェクトCesiumJS-NoVPS-sandcastleに残してある。

  // 現在の座標におけるENU参照フレーム(ローカル地平直交座標系)をCesiumの固定参照フレームに変換する行列
  // ==IMUから計算したローカル地平直交座標系における回転を、現在座標のeastNorthUpToFixedFrameで補正する行列
  const mtx4 = Cesium.Transforms.eastNorthUpToFixedFrame(oldDestination);
  // 上記は4次元で返されるので3次元の回転行列だけ抽出 (getMatrix3でも左上3x3が取れるので同じ)
  const mtx3 = Cesium.Matrix4.getRotation(mtx4, new Cesium.Matrix3());
  // // 回転行列の座標系を変換
  // rotation = Cesium.Matrix3.multiply(mtx3, rotation, new Cesium.Matrix3());

  // direction, upに変換 (getRowの第三引数は返り値と同値が入るものだが不使用かつoptionalでないためダミーを入れている)
  // directionベクトルは回転行列からZ軸を取り出し、upベクトルは回転行列からY軸を取り出す
  // http://marupeke296.sakura.ne.jp/DXG_No39_WorldMatrixInformation.html
  // https://groups.google.com/g/cesium-dev/c/cr2P2wfOwl4
  let direction = Cesium.Cartesian3.negate(
    Cesium.Matrix3.getRow(rotation, 2, new Cesium.Matrix3()),
    new Cesium.Cartesian3()
  );
  let up = Cesium.Cartesian3.negate(
    Cesium.Matrix3.getRow(rotation, 1, new Cesium.Matrix3()),
    new Cesium.Cartesian3()
  );

  // IMUから計算したローカル地平直交座標系における回転を、現在座標のeastNorthUpToFixedFrameで補正する
  direction = Cesium.Matrix3.multiplyByVector(
    mtx3,
    direction,
    new Cesium.Cartesian3()
  );
  up = Cesium.Matrix3.multiplyByVector(mtx3, up, new Cesium.Cartesian3());

  // カメラ姿勢を更新

  // iOSの場合はHPRに変換してHeadingだけevent.webkitCompassHeadingに差し替える運用を試していたが、event.webkitCompassHeadingは端末がどんな姿勢でも向けた方角以外にもデバイスの時計回転でも値が変わってしまうので不適切だった。
  // direction/upをsetViewしてからそのときのHPRを保存しておきすぐHPRのHだけevent.webkitCompassHeadingを用いてPRは保存した値を使ってsetViewするという二段構え更新も有効かと考えたが、
  // 結局その場合もevent.webkitCompassHeadingは前述のようにheadingとは異なる動きをするので不適当な動きをした。
  // そこで、iOSでは起動時のみwebkitCompassHeadingで北をとって、その直後からiOSでのabsoluteでない方の相対alphaの値を足すことでなんとかandroidと同等っぽい動作をさせている。

  // iOSの失敗実装
  // if (isios) {
  //     // iOSの場合はalphaが絶対値ではとれないので、webkitCompassHeadingを使用するが、そのせいでalpha/beta/gammaからの回転行列の計算ができないので、heading/pitch/rollを用いた更新にする。
  //     // 最終変換済みのdirection/upにrightも用いて回転行列Matrix3に戻し、QuaternionにしてからHeading/Pitch/Rollにし、headingだけをwebkitCompassHeadingに置き換える
  //     let right = Cesium.Cartesian3.negate(Cesium.Matrix3.getRow(rotation, 0, new Cesium.Matrix3()), new Cesium.Cartesian3());
  //     right = Cesium.Matrix3.multiplyByVector(mtx3, right, new Cesium.Cartesian3());
  //     let rot = new Cesium.Matrix3();
  //     right = Cesium.Cartesian3.negate(right, new Cesium.Matrix3());
  //     up = Cesium.Cartesian3.negate(up, new Cesium.Matrix3());
  //     direction = Cesium.Cartesian3.negate(direction, new Cesium.Matrix3());
  //     rot = Cesium.Matrix3.setRow(rot, 0, right, new Cesium.Matrix3());
  //     rot = Cesium.Matrix3.setRow(rot, 1, up, new Cesium.Matrix3());
  //     rot = Cesium.Matrix3.setRow(rot, 2, direction, new Cesium.Matrix3());
  //     const qtn = Cesium.Quaternion.fromRotationMatrix(rot);
  //     const hpr = Cesium.HeadingPitchRoll.fromQuaternion(qtn);
  //     // const iosHpr = new Cesium.HeadingPitchRoll(hpr.heading, hpr.pitch, hpr.roll);
  //     // iOSのwebkitCompassHeadingは、どうやら端末のorientationも見ているよう。ただし、端末垂直状体での首振りだけでなく時計回転でもheadingの値が回ってしまうので取り扱い注意
  //     // const iosHpr = new Cesium.HeadingPitchRoll(iosHeadingRad, 0, 0);
  //     const iosHpr = new Cesium.HeadingPitchRoll(iosHeadingRad, hpr.pitch, hpr.roll);
  //     poseCesiumCamera(iosHpr);
  // } else {
  //     poseCesiumCamera({ direction: direction, up: up });
  // }

  poseCesiumCamera({ direction: direction, up: up });

  // 数値表示
  const absoluteOrientationStatusView = document.getElementById(
    "absolute_orientation_status"
  );
  absoluteOrientationStatusView.innerText = `Your current orientation:
    absolute : ${event.absolute}
    Device Alpha: ${deviceAlpha}
    Device Beta: ${deviceBeta}
    Device Gamma: ${deviceGamma}
    iOS Initial Heading: ${iosInitialHeading}`;
}

// ユーザーインタラクションハンドリング
// TODO: オクルージョン表示中はタップ選択を無効化する
function setupUserInput() {
  const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
  handler.setInputAction(function onLeftClick(movement) {
    const pickedFeature = cesiumViewer.scene.pick(movement.position);    
    if (Cesium.defined(pickedFeature)) {
      // selectedには3DTilesのFeatureをそのまま突っ込めるのでprimitiveにはアクセスしなくてよい
      selectedFeatures = [pickedFeature];
      silhouetteStage.selected = selectedFeatures;
    } else {
      selectedFeatures = [];
      silhouetteStage.selected = [];
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

export let isImuPermissionGranted = false;
export function requestImuPermission() {
  DeviceOrientationEvent.requestPermission()
    .then((response) => {
      if (response === "granted") {
        isImuPermissionGranted = true;

        startOrientationTracking();
      } else {
        window.alert("ジャイロセンサーの使用を許可しないとARが正常に動作しません" + response);
        isImuPermissionGranted = false;
        // requestImuPermission();
      }
    })
    .catch(e =>{
      window.alert(e);
    });
}

let pickedFeatureCallback = null;
export function pickUpFeature(callback) {
  pickedFeatureCallback = callback;
  const handler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
  let pickedFeature;

  handler.setInputAction(function onLeftClick(movement) {
    pickedFeature = cesiumViewer.scene.pick(movement.position);
    if (Cesium.defined(pickedFeature)) {

      console.log("pickedFeature: ", pickedFeature);

      // pickedFeatureの値が更新されたら、コールバック関数を呼び出す
      if (pickedFeatureCallback) {
        pickedFeatureCallback(pickedFeature);
      }
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

// Lifecycle

// ARを開始
export function startAR(tilesetUrls) {
  // Viewセットアップ
  setupCesium(tilesetUrls);
  setupUserInput();
  // Repoセットアップ
  startDeviceCameraPreview();
  startGpsTracking();
  // iOSではパーミッション取ってからIMUの値を読む
  if (isios) {
    if (!isImuPermissionGranted) {
      // window.alert("ARを正常に動作させるためジャイロセンサーの使用を許可してください");
      // 直接ユーザータップのイベントでrequestしないと無効になるため、ARView側のボタンで発動させる
      // requestImuPermission();
    }
  } else {
    startOrientationTracking();
  }
}

// ARを終了
export function stopAR() {
  stopOrientationTracking();
  stopGpsTracking();
  cleanUpCesium();
}

// ARViewで表示するTilesetをリセット
export async function resetTileset(tilesetUrls) {
  cesiumViewer.scene.primitives.removeAll();
  const plateauTilesets = tilesetUrls.map(async tilesetUrl => Cesium.Cesium3DTileset.fromUrl(tilesetUrl));
  await plateauTilesets.map(tileset => cesiumViewer.scene.primitives.add(tileset));
}

// オクルージョン表示を更新
export function updateOcclusion(shouldHideOtherBldgs) {
  if (Boolean(shouldHideOtherBldgs)) {
    silhouetteStage.enabled = false;
    occlusionStage.selected = selectedFeatures;
    occlusionStage.enabled = true;
  } else {
    occlusionStage.enabled = false;
    occlusionStage.selected = [];
    silhouetteStage.enabled = true;
  }
}

// FOVを更新してパースを変更
// π/xのx
export function updateFov(fovPiOver) {
  fovPiOver = Number(fovPiOver) + 0.0001; // fovPiOverが1だとCesiumがエラーを吐くので0.0001を足す
  cesiumCamera.frustum.fov = Cesium.Math.PI / Number(fovPiOver);
}

// コンパス手動調整用のバイアスを更新
export function updateCompassBias(compassBias) {
  viewModel.compassBias = compassBias;
  console.log("compass bias (VM): ", viewModel.compassBias);
}

