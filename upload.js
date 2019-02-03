// Load the SDK and UUID
var AWS = require('aws-sdk');
var uuid = require('uuid');
var path = require('path');
var sts = new AWS.STS();
var selectedSong;
var s3;
var fs = require('fs');

const params = {
    RoleArn: 'arn:aws:iam::968506304545:role/S3AccessRole',
    RoleSessionName: 'roleSession1'
};
async function assumeIAMRole() {
    try {
        const assumeRoleStep1 = await sts.assumeRole(params).promise();
        const accessParams = {
            accessKeyId: assumeRoleStep1.Credentials.AccessKeyId,
            secretAccessKey: assumeRoleStep1.Credentials.SecretAccessKey,
            sessionToken: assumeRoleStep1.Credentials.SessionToken
        };
        const innerS3 = await new AWS.S3(accessParams);
        //const sts2 = new AWS.STS(accessParams);
        s3 = innerS3;
    }
    catch (rejVal){
        console.log('Cannot assume role');
        console.log(rejVal);
    }
}
assumeIAMRole();


let pickSongButton = document.getElementById("pick-song-button");
let fileInput = document.getElementById("file-input");
pickSongButton.addEventListener('click', (ev) => {
	fileInput.click();
});


let songPath = document.getElementById("song-path");
let songName = document.getElementById("song-name");
let songAlbum = document.getElementById("song-album");
let songArtist = document.getElementById("song-artist");
let songTextfield = document.getElementById("song-textfield");
let nameTextfield = document.getElementById("name-textfield");

fileInput.addEventListener('change', (ev) => {
    selectedSong = fileInput.files[0];
    songPath.value = selectedSong.path;
    songName.value = selectedSong.name;
    songTextfield.className += " is-dirty";
    nameTextfield.className += " is-dirty";
});

let addSongButton = document.getElementById("add-song-button");
addSongButton.addEventListener('click', (ev) => {
    uploadSong(songPath.value, songName.value, songAlbum.value, songArtist.value);
});


function uploadSong(source, name, album, artist) {    
    var myKey = 'Music/';
    if (artist.length > 1) {
        myKey += artist + '/';
    }
    else {
        myKey += 'No Artist/';
    }

    if (album.length > 1) {
        myKey += album + '/';
    }
    else {
        myKey += 'No Album/';
    }
    myKey += name;

    var fileStream = fs.createReadStream(source);
    fileStream.on('error', function(err) {
        console.log('File Error', err);
    });

    console.log(myKey);
    snackbarToast('Begginning to upload: ' + myKey);
    s3.upload({
        Bucket: "aws-testbucket16",
        Key: myKey,
        Body: fileStream,
        ACL: 'bucket-owner-full-control'
      }, function(err, data) {
        if (err) {
            console.log('Upload error', err.message);  
            return alert('There was an error uploading: ' + myKey);
        }
        snackbarToast('Successfully uploaded: ' + myKey);
      });
}

let pickAlbumButton = document.getElementById("pick-album-button");
let alFileInput = document.getElementById("al-file-input");
pickAlbumButton.addEventListener('click', (ev) => {
	alFileInput.click();
});

let albumPath = document.getElementById("album-path");
let albumName = document.getElementById("album-name");
let albumArtist = document.getElementById("album-artist");
let albumTextfield = document.getElementById("album-textfield");
let alNameTextfield = document.getElementById("al-name-textfield");

alFileInput.addEventListener('change', (ev) => {
    selectedAlbum = alFileInput.files[0];
    albumPath.value = selectedAlbum.path;
    albumName.value = selectedAlbum.name;
    albumTextfield.className += " is-dirty";
    alNameTextfield.className += " is-dirty";
});

let addAlbumButton = document.getElementById("add-album-button");
addAlbumButton.addEventListener('click', (ev) => {
    uploadAlbum(albumPath.value, albumName.value, albumArtist.value);
});

function uploadAlbum(albumPath, album, artist) {
    fs.readdir(albumPath, (err, files) => {
        if(!files || files.length === 0) {
            console.log(`provided folder '${distFolderPath}' is empty or does not exist.`);
            snackbarToast("Folder is empty or doesn't exist");
            return;
        }

        for (const fileName of files) {
            var filePath = path.join(albumPath, fileName);

            //Skip sub-directories
            if (fs.lstatSync(filePath).isDirectory()) {
                continue;
            }
            if (fileName.slice(-4) != '.mp3') {
                continue;
            }

            uploadSong(filePath, fileName, album, artist);
        }
        
    });
}

let pickArtistButton = document.getElementById("pick-artist-button");
let artFileInput = document.getElementById("art-file-input");
pickArtistButton.addEventListener('click', (ev) => {
	artFileInput.click();
});

let artistPath = document.getElementById("artist-path");
let artistName = document.getElementById("artist-name");
let artistTextfield = document.getElementById("artist-textfield");
let artNameTextfield = document.getElementById("art-name-textfield");

artFileInput.addEventListener('change', (ev) => {
    selectedArtist = artFileInput.files[0];
    artistPath.value = selectedArtist.path;
    artistName.value = selectedArtist.name;
    artistTextfield.className += " is-dirty";
    artNameTextfield.className += " is-dirty";
});

let addArtistButton = document.getElementById("add-artist-button");
addArtistButton.addEventListener('click', (ev) => {
    uploadArtist(artistPath.value, artistName.value);
});

function uploadArtist(artistPath, artist) {
    fs.readdir(artistPath, (err, files) => {
        if(!files || files.length === 0) {
            console.log(`provided folder '${distFolderPath}' is empty or does not exist.`);
            snackbarToast("Folder is empty or doesn't exist");
            return;
        }

        for (const pathName of files) {
            var filePath = path.join(artistPath, pathName);

            //If pathName represents an album/folder
            if (fs.lstatSync(filePath).isDirectory()) {
                uploadAlbum(filePath, pathName, artist);
            }
            //If not in an album
            if (pathName.slice(-4) == '.mp3') {
                uploadSong(filePath, pathName, 'No Album', artist);
            }
        }
    });
}


function snackbarToast(toast) {
	var snackbar = document.getElementById('note-snackbar');
	snackbar.MaterialSnackbar.showSnackbar({
		message: toast
	});
}