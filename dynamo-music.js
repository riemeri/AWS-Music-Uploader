var AWS = require('aws-sdk');

var docClient;

module.exports.DBAccess = class {
    constructor(params) {
        //this.setAccessParams(params); 
        AWS.config.update({
            region: "us-east-1"
        });
    }

    async setAccessParams(params) {
        const innerDoc = await new AWS.DynamoDB.DocumentClient(params);
        this.docClient = innerDoc;
    }

    addSong(song, album, artist, genre, path) {
        console.log(`Adding song to DB: ${song}, ${album}, ${artist}`);
        
        var art = 'none';
        var gen = 'none';
        if (artist != null) {
            art = artist;
        }
        if (genre != null) {
            gen = genre;
        }
    
        var params = {
            TableName: "songs",
            Item: {
                "album": album,
                "song": song,
                "artist": art,
                "genre": gen,
                "path": path
            }
        }
    
        this.docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                return err;
            }
            else {
                return 0;
            }
        });
    }
    
    addAlbum(album, artist, genre) {
        var params = {
            TableName: "albums",
            Item: {
                "artist": artist,
                "album": album,
                "genre": genre
            }
        }
        this.docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                return err;
            }
            else {
                return 0;
            }
        });
    }
    
    addArtist(artist, genre) {
        var params = {
            TableName: "artists",
            Item: {
                "genre": genre,
                "artist": artist
            }
        }
        this.docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                return err;
            }
            else {
                return 0;
            }
        });
    }
    
    addGenre(genre) {
        var params = {
            TableName: "genres",
            Item: {
                "genre": genre
            }
        }
        this.docClient.put(params, function(err, data) {
            if (err) {
                console.log(err);
                return err;
            }
            else {
                return 0;
            }
        });
    }

    checkAlbum(album, artist) {
        var params = {
            TableName: 'albums',
            Select: 'COUNT',
            KeyConditionExpression: 'artist = :hkey and album = :rkey',
            ExpressionAttributeValues: {
              ':hkey': artist,
              ':rkey': album
            }
        };
        var dc = this.docClient;
        var promise1 = new Promise(function (resolve, reject) {
            dc.query(params, function(err, data) {
                if (err) { 
                    console.log(err);
                    reject();
                }
                else {
                   resolve(data);
                }
            });
        });

        return promise1;
    }

    checkArtist(artist, genre) {
        var params = {
            TableName: 'artists',
            Select: 'COUNT',
            KeyConditionExpression: 'genre = :hkey and artist = :rkey',
            ExpressionAttributeValues: {
              ':hkey': genre,
              ':rkey': artist
            }
        };
          
        var dc = this.docClient;
        var promise1 = new Promise(function (resolve, reject) {
            dc.query(params, function(err, data) {
                if (err) { 
                    console.log(err);
                    reject();
                }
                else {
                   resolve(data);
                }
            });
        });

        return promise1;
    }

    checkGenre(genre) {
        var params = {
            TableName: 'genres',
            Select: 'COUNT',
            KeyConditionExpression: 'genre = :hkey',
            ExpressionAttributeValues: {
              ':hkey': genre
            }
        };
          
        var dc = this.docClient;
        var promise1 = new Promise(function (resolve, reject) {
            dc.query(params, function(err, data) {
                if (err) { 
                    console.log(err);
                    reject();
                }
                else {
                   resolve(data);
                }
            });
        });

        return promise1;
    }

}
