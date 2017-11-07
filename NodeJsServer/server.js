var express = require('express')
//var http = require("http");
var https = require("https");
var fileSystem = require('fs');
var path = require('path');
var requestLibrary = require("request");
var fs = require('fs');
var api = require('./nga_api_bl');
var fodHost = 'https://stg.hpfod.com';
var key = '10ac6969-8f48-4a15-9c9c-c194f5da4870'
var secret = 'Ebe0m>3FS5AxoM8jOmkm9LOse_tS:h'
var token = '';
 

var app = express()
app.use(express.static('../AngularClient'));

/*function sendFOD(path, reqeust, response) {

    response.header('Access-Control-Allow-Origin', reqeust.headers.origin);

    var options = {
        host: fodHost,
        port: 443,
        path: path,
        headers: {
            'Accept': 'application/json, text/plain,
            'Cache-Control': 'no-cache',
            'Authorization': 'Basic YWRtaW46Wm9ya25lbWVzaXM1Njc4IQ=='
        },
		proxy: 'proxy.il.hpecorp.net:8080'
    };
	

    requestLibrary.get(path, options, function(err,res,body) {
        response.send(body);
        console.log(body);
    });
	
	
}*/

getToken();


function getToken() {
	
	
	/*var obj =  {
			grant_type:'password',
			scope:'https://hpfod.com/tenant',
			username:'Octane\\nir.yom-tov@hpe.com',
			password:'Zorknemesis1976!'
			};*/
			
			var obj =  {
			grant_type:'client_credentials',
			scope:'https://hpfod.com/tenant',
			client_id:key,
			client_secret:secret
			};
	
	var bodyString=JSON.stringify(obj)
	
	 var options = {
		port: 443,
		host: 'api.sandbox.fortify.com',
		path: '/oauth/token',
		method: 'POST',
		secureProtocol: 'TLSv1_method',
		body: bodyString
		//proxy: 'proxy.il.hpecorp.net:8080'
    };
	
	//https.globalAgent.options.secureProtocol = 'TLSv1_method';
	
	/*var req = https.request(options, function(res) {
		console.log(res);
	});
	req.on('error', function(e) {
		console.log('problem with request: ' + e.message);
	});*/
	
/*	let r = requestLibrary.defaults({'proxy': 'proxy.il.hpecorp.net:8080'});
	var authtUrl = 'https://api.sandbox.fortify.com' + ("/oauth/token?client_id=" + key + "&client_secret=" + secret + "&grant_type=client_credentials");
    r.post(authtUrl, {}, function (err, res) {
        console.log(err);
		console.log(res);
    });*/
	
	
	var options = {
		//method: 'POST',
		//body:bodyString,
		//secureProtocol: 'SSLv3_method'
		proxy: 'http://proxy.il.hpecorp.net:8080'
	}
	
//	request.post('http://service.com/upload', {form:{key:'value'}})
// or
	
	  requestLibrary.post({uri:'https://api.sandbox.fortify.com/oauth/token', form: obj, proxy:'http://proxy.il.hpecorp.net:8080'}, function(err,httpResponse,body) {
		  console.log(httpResponse.statusCode);
		   var bodyObj = JSON.parse(body);
		  token = bodyObj.access_token;
		  console.log(token);
		  getReleases();
	  })
	  
	  
	  /*.on("response", function (response){
	  console.log(response.data);
  }).on("data", function (data){
		 //console.log(data);
  });*/
}


function getReleases() {
	
	var autho = 'bearer '+token;
	
	var options = {
		headers: {
            'Accept': 'application/json, text/plain',
            'Cache-Control': 'no-cache',
            'Authorization': autho
        },
		proxy: 'http://proxy.il.hpecorp.net:8080'
	};
	
	
	requestLibrary.get('https://api.sandbox.fortify.com/api/v3/releases', options, function(err,res,body) {
        var bodyObj = JSON.parse(body);
        console.log(bodyObj.items[0].releaseId);
		
    });
	
}

//https://api.sandbox.fortify.com/api/v3/releases

/*app.get('/fortify/apps', function (reqeust, response) {

    var path = "http://" + host + ":8180/ssc/api/v1/projectVersions";
    sendFortify(path, reqeust, response);
});


app.get('/fortify/app/:id', function (reqeust, response) {

    var appId = reqeust.params.id;
    var path = "http://" + host + ":8180/ssc/api/v1/projectVersions/" + appId;
    sendFortify(path, reqeust, response);
})


//GET /api/v3/releases/{releaseId}/vulnerabilities
app.get('/fortify/app/:id/issues', function (reqeust, response) {

    var appId = reqeust.params.id;
    var path = 'http://' + fodHost + ':443/api/v3/releases/990/vulnerabilities';
    sendFortify(path, reqeust, response);
})

app.get('/octane/defect/:name', function (reqeust, response) {
    var name = reqeust.params.name;
    api.connect(reqeust, response, name);
    
})*/



app.listen(3000, function () {
   // console.log('Server is up and listening on port 3000')
})