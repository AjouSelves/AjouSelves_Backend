const jwt = require("jsonwebtoken");
require("dotenv").config(); // jwt secret key 가져오기

exports.verifyToken = (req, res, next) => {
  // 인증 완료
  try {
    // 요청 헤더에 저장된 토큰(req.headers.authorization)과 비밀키를 사용하여 토큰 반환
    req.decoded = jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    // 인증 실패
    // 유효기간이 초과된 경우
    if (error.name === "TokenExpiredError") {
      return res.status(419).json({
        status: "fail",
        code: 419,
        text: "토큰이 만료되었습니다.",
      });
    }
    // 토큰의 비밀키가 일치하지 않는 경우
    return res.status(401).json({
      status: "fail",
      code: 401,
      text: "유효하지 않은 토큰입니다.",
    });
  }
};
