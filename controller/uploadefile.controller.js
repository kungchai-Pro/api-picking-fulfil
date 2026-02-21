const upload = require("../midbleware/fileUpload");
const URL = "http://localhost:4001/get-cfiles/";
const fs = require("fs");
const path = require('path');
// const { google } = require('googleapis');

// const apikeys = require('./googledrive-keyapi.json');
// const SCOPE = ['https://www.googleapis.com/auth/drive'];



// key folder google dive 18PxdfdxumCygtZFYbX0HbjZm0SMC_zJH

// upload file 

const uploadFile = async (req, res) => {

    try {
        await upload(req, res);


        if (req.file == undefined) {
            return res.status(400).send({ message: "Choose a file to upload" });
        }

        res.status(200).send({
            message: "File uploaded successfully: " + req.file.originalname,
            success: true,
            filename:req.file.originalname
        })



    } catch (err) {
        console.log(err);

        if (err.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "File size should be less than 5MB",
                success: false,
            });
        }

        res.status(500).send({
            message: `Error occured: ${err}`,
            success: false,
        });
    }

    // // upload file images to google drive
    // async function authorize() {
    //     const jwtClient = new google.auth.JWT(
    //         apikeys.client_email,
    //         null,
    //         apikeys.private_key,
    //         SCOPE
    //     );
    //     await jwtClient.authorize();
    //     return jwtClient;
    // }

    // async function uploadFiles(authClient) {
    //     return new Promise((resolve, rejected) => {
    //         const drive = google.drive({ version: 'v3', auth: authClient });
    //         var fileMetaData = {
    //             name: `${req.file.originalname}`,
    //             parents: ['18PxdfdxumCygtZFYbX0HbjZm0SMC_zJH'] // A folder ID to which file will get uploaded
    //         }
    //         drive.files.create({
    //             resource: fileMetaData,
    //             media: {
    //                 body: fs.createReadStream(`./public/uploads/${req.file.originalname}`), // files that will get uploaded
    //                 mimeType: '*/*'
    //             },
    //             fields: 'id'
    //         }, function (error, file) {
    //             if (error) {
    //                 return rejected(error)
    //             }
    //             resolve(file);
    //         })
    //     });
    // }
    // authorize().then(uploadFiles).catch("error", console.error());
}


//get file list
const getFilesList = (req, res) => {
    const path = __basedir + "/public/uploads/";

    fs.readdir(path, function (err, files) {
        if (err) {
            res.status(500).send({
                message: "Files not found.",
            });
        }

        let filesList = [];

        files.forEach((file) => {
            filesList.push({
                name: file,
                url: URL + file,
            });
        });

        res.status(200).send(filesList);
    });
};

//down load file 
const downloadFiles = (req, res) => {
    const fileName = req.params.name;
    const path = __basedir + "/public/uploads/";
    // const path ="../filedownload/uploads/";
    res.download(path + fileName, (err) => {
        if (err) {
            res.status(500).send({
                message: "File can not be downloaded: " + err,
            });
        }
    });
};

const WebcamUploadfileImage = (req, res) => {

    const image = req.body.image;
    const imageName = `frame_${Date.now()}.jpg`;
    const imagePath = __basedir + `/public/uploads/${imageName}`;
    const imageBuffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    fs.writeFile(imagePath, imageBuffer, (err) => {
        if (err) {
            console.error('Error saving image:', err);
            res.status(500).send('Error saving image');
        } else {
            console.log('Image saved:', imageName);
            res.status(200).send({
                status: 200,
                filename: imageName
            })
        }
    });
}



module.exports = { uploadFile, getFilesList, downloadFiles, WebcamUploadfileImage }