const express = require('express');
const multer = require('multer');
const exphbs = require('express-handlebars');
const path = require('path');
const port = process.env.PORT || 3000;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}

// Init app
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//express handlebars 
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Public Folder
app.use(express.static('./public'));
//mongoose set up 
mongoose.connect("mongodb://localhost:27017/photos", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);

var PhotoSchema = new Schema({ 
    filename: String  
});
var Photo = mongoose.model('Photos',PhotoSchema);

app.get('/', (req, res) => res.render('index'));
app.get('/photo', (req,res)=> {
    Photo.findOne({}).then(result=> {
        const name = result;
        res.render('photo', name)
    });
})

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render('index', {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render('index', {
          msg: 'Error: No File Selected!'
        });
      } else {
        const newPhoto = new Photo({
            filename: req.file.filename
        });
        newPhoto.save();

        res.render('index', {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});



app.listen(port, () => console.log(`Server started on port ${port}`));