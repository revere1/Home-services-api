var models = require('../models');
var multer = require('multer');
var config = require('./../config/config.json')['system'];
var md5 = require('md5');

let utils = module.exports = {
    objLen: (obj) => {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    inArray: (needle, haystack) => {
        var length = haystack.length;
        for (var i = 0; i < length; i++) {
            if (haystack[i] == needle) return true;
        }
        return false;
    },
    nullOrVal: (val) => {
        return val !== undefined ? val : null;
    },
    DeepTrim: (obj) => {
        for (var prop in obj) {
            var value = obj[prop], type = typeof value;
            if(prop === 'id'){
                obj[prop] = parseInt(obj[prop]) ? obj[prop] : null;
            }
            else if (value != null && (type == "string" || type == "object")) {
                if (type == "object") {
                    utils.DeepTrim(obj[prop]);
                } else {
                    obj[prop] = obj[prop].trim();
                }
            }
        }
        return obj
    },
    DeepStripHtml: (obj) => {
        for (var prop in obj) {
            var value = obj[prop], type = typeof value;
            if (value != null && (type == "string" || type == "object") && obj.hasOwnProperty(prop)) {
                if (type == "object") {
                    utils.DeepStripHtml(obj[prop]);
                } else {
                    obj[prop] = utils.stripTags(obj[prop]);
                }
            }
        }
        return obj;
    },
    stripTags(value) {
        return value ? String(value).replace(/<[^>]+>/gm, '') : '';
    },
    sliceChar(str, limit = 240) {
        return str.length > limit ? str.slice(0,limit)+'...' : str;
    },
    seperteByKey: (data, cb) => {
        let finalData = {};
        data.forEach(item => {
            if (finalData[item._type] === undefined) {
                finalData[item._type] = [];
            }
            finalData[item._type].push(item._source);
        });
        cb(finalData);
    },
    getAccessLevel: (access_level_name, cb) => {
        models.access_levels
            .findOne({
                where: {
                    name: access_level_name,
                    status: 'active'
                }
            }).then(access_level => {
                cb(access_level);
            })
    },
    assestDest: (dir) => {
        return multer.diskStorage({
            destination: function (req, file, callback) {
                callback(null, 'uploads/' + dir);
            },
            filename: function (req, file, callback) {

                callback(null, md5(Date.now()) + '-' + file.originalname);

            }
        });
    },

    extractImgs: (rawString) => {
        var regex = /<img.*?src="(.*?)"/gi, result,
            urls = [];
        while ((result = regex.exec(rawString))) {

            urls.push(result[1].replace(config.domain,""));
        }
        // urls = map(image => image.replace(config.domain,""));
        return urls;
    },
    addDate(expires_in){
    Date.prototype.addDays = function(days) {
        var dat = new Date(this.valueOf());
        dat.setDate(dat.getDate() + days);
        // console.log(dat)
      
        return dat;
      }
      var dat = new Date()   
    //   todayDate = new Date('2018-08-04T12:12:00.101Z')
      console.log(dat)
      return dat.addDays(expires_in).toISOString().slice(0,10)+' '+'00:00:00';
      
    }
}