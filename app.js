// Express 기본 모듈 불러오기
const fs = require("fs");
var express = require("express"),
  http = require("http"),
  path = require("path");

// Express의 미들웨어 불러오기
var bodyParser = require("body-parser"),
  
  static = require("serve-static"),
  errorHandler = require("errorhandler");

// 에러 핸들러 모듈 사용
var expressErrorHandler = require("express-error-handler");






// 모듈로 분리한 설정 파일 불러오기
var config = require("./config/config");

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require("./database/maria");

// 라우터로 정리한 기능 불러오기
const controller = require("./routes/controller");
const { fstat } = require("fs");
const cors = require("cors");
// 익스프레스 객체 생성
var app = express();
app.use(cors());


//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log("config.server_port : %d", config.server_port);
app.set("port", config.server_port || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }));

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static으로 오픈
app.use("/photo", static(path.join(__dirname, "photo")));
app.use("/qr_pay", static(path.join(__dirname, "qr_pay")));
app.use("/public", static(path.join(__dirname, "public")));


// 라우터로 정리한 기능 사용하기
app.use("/api", controller);

//===== Passport 사용 설정 =====//
// Passport의 세션을 사용할 때는 그 전에 Express의 세션을 사용하는 코드가 있어야 함


//라우팅 정보를 읽어들여 라우팅 설정
var router = express.Router();

//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
  static: {
    404: "./public/404.html",
  },
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on("uncaughtException", function (err) {
  console.log("uncaughtException 발생함 : " + err);
  console.log("서버 프로세스 종료하지 않고 유지함.");

  console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on("SIGTERM", function () {
  console.log("프로세스가 종료됩니다.");
  app.close();
});

app.on("close", function () {
  console.log("Express 서버 객체가 종료됩니다.");
  if (database.db) {
    database.db.close();
  }
});

// 시작된 서버 객체를 리턴받도록 합니다.
var server = http.createServer(app).listen(app.get("port"), function () {
  const dir = "./photo";
  const dir_qr = "./qr_pay";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
  if (!fs.existsSync(dir_qr)) fs.mkdirSync(dir_qr);
  console.log("서버가 시작되었습니다. 포트 : " + app.get("port"));
});
