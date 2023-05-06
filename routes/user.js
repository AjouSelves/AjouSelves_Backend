const express = require("express");
const router = express.Router();
const crypto = require("crypto"); // 비밀번호 암호화 모듈
const { verifyToken } = require("./middleware/tokenmiddleware"); // Token 검증 미들웨어
const authmiddleware = require("./middleware/authmiddleware");

const DB = require("../database/maria"); // DB 정보 가져오기
DB.connect();

//body-parser
router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select email,name,phonenumber,nickname,status,birth,address,account,profilelink from users where userid = ?`,
    userid,
    (err, result) => {
      if (err) {
        res.json({
          status: "fail",
          text: "회원정보 가져오기 실패",
          error: err,
        });
      } else {
        res.status(200).json({ status: "success", data: result });
      }
    }
  );
});

router.get("/all", (req, res) => {
  DB.query(
    "select email,name,phonenumber,nickname,status,birth,address,account,profilelink from users where userid > 1",
    (err, result) => {
      if (err) {
        res.json({
          status: "fail",
          text: "모든 유저 회원정보 가져오기 실패",
          error: err,
        });
      } else {
        res.status(200).json({ status: "success", data: result });
      }
    }
  );
});

// mypage에서 회원탈퇴를 진행할때 DB에서 삭제하는 API
router.delete("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(`delete from users where userid =?`, userid, (err) => {
    if (err) {
      res.status(400).json({
        status: "fail",
        text: "회원탈퇴에 실패했습니다.",
        error: err,
      });
    } else {
      res
        .status(200)
        .json({ status: "success", text: "회원탈퇴에 성공했습니다." });
    }
  });
});

// 회원정보 수정을 위한 API.
router.put("/", verifyToken, (req, res) => {
  const userid = req.decoded._id;

  const encryption = authmiddleware.createHashedPassword(req.body.password);
  const salt = encryption[1];
  const password = encryption[0];

  const name = req.body.name;
  const phonenumber = req.body.phonenumber;
  const nickname = req.body.nickname;
  const status = req.body.status;
  const address = req.body.address;
  const account = req.body.account;

  DB.query(
    `update users set name = '${name}', phonenumber = '${phonenumber}',salt = '${salt}', password = '${password}', nickname = '${nickname}', status = '${status}', address = '${address}', account = '${account}' where userid = ?`,
    userid,
    (err) => {
      if (err) {
        res.status(400).json({
          status: "fail",
          text: "회원정보수정에 실패했습니다.",
          error: err,
        });
      } else {
        res
          .status(200)
          .json({ status: "success", text: "회원정보수정에 성공했습니다." });
      }
    }
  );
});

// 참여 굿즈 title 정보 가져오기
router.get("/join", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result) => {
      if (err) {
        res.json({
          status: "fail",
          text: "프로젝트 불러오기 실패",
          error: err,
        });
      } else if (result.length === 0) {
        res.json({
          status: "fail",
          text: "유저가 참가한 프로젝트가 없습니다.",
        });
      } else {
        const attend_proj = result.map((v) => v.projid);
        DB.query(
          `select projid,title from projs where projid in (${attend_proj})`,
          (err, result) => {
            if (err) {
              res.json({
                status: "fail",
                text: "title 불러오기 실패",
                error: err,
              });
            } else {
              res.status(200).json({ status: "success", data: result });
            }
          }
        );
      }
    }
  );
});

// 제작 굿즈 title 정보 가져오기
router.get("/create", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(`select projid from projs where userid=?`, userid, (err, result) => {
    if (err) {
      res.json({
        status: "fail",
        text: "프로젝트 불러오기 실패",
        error: err,
      });
    } else if (result.length === 0) {
      res.json({
        status: "fail",
        text: "유저가 생성한 프로젝트가 없습니다.",
      });
    } else {
      const create_proj = result.map((v) => v.projid);
      DB.query(
        `select projid,title from projs where projid in (${create_proj})`,
        (err, result) => {
          if (err) {
            res.json({
              status: "fail",
              text: "title 불러오기 실패",
              error: err,
            });
          } else {
            res.status(200).json({ status: "success", data: result });
          }
        }
      );
    }
  });
});

// 참여 굿즈 detail 정보 가져오기
router.get("/join-detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(
    `select projid from participants where userid=?`,
    userid,
    (err, result) => {
      if (err) {
        res.json({
          status: "fail",
          text: "프로젝트 불러오기 실패",
          error: err,
        });
      } else if (result.length === 0) {
        res.json({
          status: "fail",
          text: "유저가 참가한 프로젝트가 없습니다.",
        });
      } else {
        const create_proj = result.map((v) => v.projid);
        DB.query(
          `SELECT p.projid,p.title, p.state,p.category, p.created_at, u.userid, u.nickname,p.amount ,p.min_num,p.cur_num,p.explained, ph.url FROM projs as p join users as u ON p.userid=u.userid LEFT JOIN photos as ph ON ph.projid=p.projid AND ph.thumbnail =1 WHERE p.projid IN (${create_proj})`,
          (err, result) => {
            if (err) {
              res.json({
                status: "fail",
                text: "detail 불러오기 실패",
                error: err,
              });
            } else {
              res.status(200).json({ status: "success", data: result });
            }
          }
        );
      }
    }
  );
});

// 제작 굿즈 detail 정보 가져오기
router.get("/create-detail", verifyToken, (req, res) => {
  const userid = req.decoded._id;
  DB.query(`select projid from projs where userid=?`, userid, (err, result) => {
    if (err) {
      res.json({
        status: "fail",
        text: "프로젝트 불러오기 실패",
        error: err,
      });
    } else if (result.length === 0) {
      res.json({
        status: "fail",
        text: "유저가 생성한 프로젝트가 없습니다.",
      });
    } else {
      const create_proj = result.map((v) => v.projid);
      DB.query(
        `SELECT p.projid,p.title, p.state,p.category, p.created_at, u.userid, u.nickname,p.amount ,p.min_num,p.cur_num,p.explained, ph.url FROM projs as p join users as u ON p.userid=u.userid LEFT JOIN photos as ph ON ph.projid=p.projid AND ph.thumbnail =1 WHERE p.projid IN (${create_proj})`,
        (err, result) => {
          if (err) {
            res.json({
              status: "fail",
              text: "detail 불러오기 실패",
              error: err,
            });
          } else {
            res.status(200).json({ status: "success", data: result });
          }
        }
      );
    }
  });
});

module.exports = router;
