const express = require('express');
const router =express.Router();
const jwt = require('jsonwebtoken');
const DB= require('../database/maria');
DB.connect();

const jwtMiddleware=(req,res,next)=> {
    const token = req.header.token;
    try {
        const decode = jwt.verify(token,"SEC") // thopw
        if(decode) {
            req.user = decode;
            next();
        }
        else {
            res.json({
                status:"fail",
                msg:"유효하지 않은 토큰, 로그인 안했다"
            })
        }
    }
    catch(e) {
        res.json({
            status:"fail",
            msg:"유효기간 만료"
        })
    }
};



router.use(jwtMiddleware);



var searchprojbytitle= async function(req,res){
  //SELECT * FROM proj WHERE title = req.asdf 이런식으로 제목으로 검색
  const title =req.body.title;
  console.log(title);
  const db=req.app.get('database');
  try{
      const [data] = await db.db.query(`SELECT p.projID,p.title,p.state,p.category,p.min_num, p.created_at, u.NICKNAME FROM proj AS p JOIN user as u ON p.userID=u.userid where p.title LIKE '%${title}%';`);
      console.log(data);
      res.json(data);
  }catch{
    
      console.log('searchbytitle error 발생!');
      res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
  }

}


var getproj= async function(req,res){
 //특정한 project 정보 가져오는 코드
  const id = req.params.id;
  const db=req.app.get('database'); 
  try{
      const [proj]= await db.db.query(`SELECT * FROM proj AS p JOIN user AS u ON p.userID=u.userID WHERE p.projID=${id};`);
      proj.comments=new Array();
      const [comments]= await db.db.query(`SELECT * FROM comments WHERE projid=${id}`);
      comments.map((e)=> {
          var temp= new Object();
          temp.projid=e.projid;
          temp.userid=e.userid;
          temp.created_at=e.created_at;
          temp.comments=e.comments;
          temp.nickname=e.nickname;
          temp = JSON.stringify(temp);
          proj.push(JSON.parse(temp));
      })
      console.log(proj);
      res.send(proj);
  }catch{
      console.log('getproj에서 error 발생!');
      res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
  }



}

var getALLproj= async function(req,res){
//모든 project 정보 가져오는 코드

const db=req.app.get('database');


try{
    const [data] = await db.db.query(`SELECT p.projID,p.title, p.state,p.category, p.created_at, u.userid, u.NICKNAME ,p.min_num FROM proj as p join user as u ON p.userID=u.userid ORDER BY created_at DESC`);
    console.log(data);
    res.json(data);


}catch{

    console.log('getALLpost에서 error 발생!');
    res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
}
//SELECT p.title, p.explained, p.created_at, u.userid, u.NICKNAME FROM post AS p join user AS u  ON p.userID=u.userid ;

}

var addproj= async function(req,res){
//project 정보 db에 저장하는코드


const db=req.app.get('database');
const userid=req.body.userid;
const title= req.body.title;
const explained= req.body.explained;
const min_num= req.body.min_num;
const category= req.body.category;
var required={};
required=req.body.required;

required = JSON.stringify(required).replace(/[\']/g,/[\"]/g );

try{
    const data=await db.db.query(`INSERT INTO proj(userID,title,category,min_num,explained,required) VALUES(${userid},'${title}','${category}',${min_num},'${explained}','${required}' )`);
    console.log(data);
    res.json({status:"success"});

}catch{
    console.log('addpost에서 error 발생!');
    res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

}
}

var editproj= async function(req,res){

  const projid=req.params.id;
  const db=req.app.get('database');
  const userid=req.body.userid;
  const title= req.body.title;
  const explained= req.body.explained;
  const min_num= req.body.min_num;
  const category= req.body.category;

  var required={};
  required=req.body.required;
  required = JSON.stringify(required).replace(/[\']/g,/[\"]/g );
 
  try{
      const data= await db.db.query(`UPDATE proj SET title='${title}', explained='${explained}',min_num='${min_num}',category='${category}',required='${required}'  WHERE projId=${projid};`);
      res.json({text:"success"});

  }catch{
      console.log('editpost에서 error 발생!');
      res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });

  }
  

    
}

var delproj = async function(req,res){

//project 정보 삭제
const db=req.app.get('database');
const projid = req.params.id;
try{
    const data =await db.db.query(`DELETE FROM proj WHERE projID=${projid};`);
    console.log(data);
    res.json({text:"success"});
}catch{
    console.log('editpost에서 error 발생!');
    res.status(400).json({ text: 'ErrorCode:400, 잘못된 요청입니다.' });
}
   
}

router.post("/searchbytitle",searchprojbytitle);
router.get("/getall",getALLproj);
router.get("/get/:id",getproj);
router.put("/edit/:id",editproj);
router.delete("/delete/:id",delproj);
router.post("/add",addproj);

module.exports = router;