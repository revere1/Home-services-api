var client = require('./../config/escon');


exports.gSearchData = function(req, res){ 
    var matched_docs = [];
  client.search({
    q:req.body.term.search
  }).then(function (resp) {
    resp.hits.hits.forEach(function(doc, index, arr){
        matched_docs[index] = doc;
    })
    res.type('json'); 
    res.status(201).json({ success: false, message: matched_docs });
}, function (err) {
    console.trace(err.message);
});

    
		
}