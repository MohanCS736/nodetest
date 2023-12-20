const multer = require('multer')
const ProfilePic = 'src/storage/profilePics'
const courseImagePath = 'src/storage/courses'
const subjectsImagePath = 'src/storage/subjects'
const documentsPath = 'src/storage/documents'
/* array of mime type of images */
const imagesMimeArray = ['image/jpeg','image/jpg','image/png'] 
/* array of mime type of document */
const docuemntsMimeArray = ['application/msword', 'application/pdf',] 
/* set the max size of images */
const imageSize =1024 * 1024 * 1;
/* set the max size of documents */
const documentSize = 1024 * 1024 * 5;
/* filter the images before uploading */
const imagesFilter = (req,file,cb)=>{
    console.log(file);
    if(imagesMimeArray.includes(file.mimetype)){
        cb(null,true);
    }else{
        cb(new multer.MulterError("UNSUPPORTED_FILE_FORMATED","image")
        ,false);
    }
}
/* filter the documents before uploading */
const documentsFilter = (req,file,cb)=>{
    if(docuemntsMimeArray.includes(file.mimetype)){
        cd(null,true);
    }else{
        cb(null,false);
    }
}

/* set the file name with current date */
const filename = (req,file,cb)=>{
    const date = new Date();
    let fileDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getTime()}-`;
    file.originalname = (fileDate+file.originalname).split(" ").join('');
    cb(null,file.originalname);
}
/* uploading the courses images */
module.exports.uploadCoursesImages = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,courseImagePath);
        },
        filename:filename
    }),
    fileFilter:imagesFilter,
    limits: {
        fileSize: imageSize, 
      },
});
/* uploading the subjects images */
module.exports.uploadSubjectsImages = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,subjectsImagePath);
        },
        filename:filename
    }),
    fileFilter:imagesFilter,
    limits: {
        fileSize: imageSize,
      },
});
/* uploading the documents */
module.exports.uploadDocuments = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,documentsPath);
        },
        filename:filename
    }),
    // fileFilter:documentsFilter,
    // limits:documentSize
});

/* uploading the profile images */
module.exports.uploadProfilepic = multer({
    storage:multer.diskStorage({
        destination:(req,file,cb)=>{
            cb(null,ProfilePic);
        },
        filename:filename
    }),
    fileFilter:imagesFilter,
    limits: {
        fileSize: imageSize, 
      },
});