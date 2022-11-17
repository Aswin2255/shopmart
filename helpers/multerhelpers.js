const multer = require('multer')
// set the local storage
 let storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"public/productimage")
    },
    filename:(req,file,cb)=>{
        var ext = file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.originalname+'-'+Date.now()+ext)
    }
})

var upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
        cb(null, true);
      } else {
        cb(null, false);
        return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
      }
    }
  });

module.exports = upload