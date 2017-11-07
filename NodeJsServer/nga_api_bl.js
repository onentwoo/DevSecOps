var promise = require('es6-promise');


var request = require('request');
//require('request-debug')(request);

var cookie = require('cookie');
var url  = require('url');
var extend  = require('extend')

var OCTANE_SERVER = '';
//const SHAREDSPACE_ID = 1001;
//const WORKSPACE_ID = 2027;

var sessionMap = {};


var requestor = request.defaults({
	jar: true,
	json: true,
	// if running from within HPE you will need to set a proxy.  Change according to nearest proxy
	//proxy: 'http://web-proxy.il.hpecorp.net:8080'
});

var responseRequestor = {};

var releaseList = [];
var teamList = [];
var sprintList = [];

function connect(req, res, name) {

	var apiKey = 'fortify_m9430op658yvefnzd3og67d6o';
	var serverURL = 'http://localhost:8080';
	var apiSecret = '#d17141a9cfe05c7cP';


	login(requestor, apiKey, apiSecret, serverURL, function (requestor) {
		console.log('trying to login..');
		if (requestor===null) {
			console.log('error - 503');
			res.status(503).send('cannot connect to octane');
		} else {
			responseRequestor = requestor;
			var sessionRequestor = responseRequestor;
			var dName = name;
			var defectBody = JSON.parse('{"data":[{"parent":{"id":"1001","type":"work_item","subtype":"work_item_root","name":"Backlog"},"author":{"name":"sa@nga","language":"lang.en","id":"1001","type":"workspace_user","email":"sa@nga","roles":["role.workspace.admin","role.shared.space.leader.user.internal","role.shared.space.internal","role.shared.space.admin"],"groups":[],"fullName":"sa@nga sa@nga","phone1":"000"},"release":null,"subtype":"defect","phase":{"id":"1001","type":"phase"},"detected_by":{"id":"1001","type":"workspace_user"},"name":"'+dName+'","severity":{"id":"1004","name":"High","index":3,"logical_name":"list_node.severity.high","type":"list_node"}}]}');
			sessionRequestor.post({uri: 'shared_spaces/2001/workspaces/1002/defects', body: defectBody}, function (error, message, defects) {
				res.send('ok');
				console.log('error is '+error+' message: '+JSON.stringify(message));
				console.log('defect added');
			});


		}
	});
}

function connectWorkspaces(req, res) {
	responseRequestor.userId = req.params.userId;
	responseRequestor.workSpaceURL  = 'shared_spaces/' + responseRequestor.sharedSpace + '/workspaces/'+ req.params.workSpaceId;
	res.send('ok');
}

/**
 * Use to log in. Returns the HPSSO_COOKIE_CSRF header which needs to be reused with all communication to the server
 * @param requestor The request object used for HTTP
 * @param callback The callback that will be called once login is successful
 * @returns {*}
 */
function login(requestor, apiKey, apiSecret, serverURL, callback) {
	OCTANE_SERVER = serverURL;
	var HPSSO_COOKIE_CSRF = null;

	requestor.post({
		uri: serverURL+'/authentication/sign_in',
		body: {
			client_id: apiKey,//'Ido Raz_z2wmdyo6x4vqwbg5595n70lx8', // put API KEY here
			client_secret: apiSecret // PUT API SECRET HERE
			//user: 'hackathon@user',
			//password: 'Mission-impossible'
			/**
			 * alternatively you can use API key like this
			 * client_id: '', // put API KEY here
			 * client_secret: '' // PUT API SECRET HERE
			 */
		}/*,
		headers: {
			'HPECLIENTTYPE': 'HPE_MQM_UI'
		}*/
	}, function (error, response) {

		if (error || response.statusCode !== 200) {
			console.log('error - return from post');
			console.error(error);
			callback(null);
			return;
		}
		var cookies = response.headers['set-cookie'];
		if (cookies) {
			cookies.forEach(function (value) {
				var parsedCookie = cookie.parse(value);
				if (parsedCookie.HPSSO_COOKIE_CSRF) {
					HPSSO_COOKIE_CSRF = parsedCookie.HPSSO_COOKIE_CSRF;
				}
			});
		} else {
			// problem getting cookies; something happened
		}

		requestor = requestor.defaults({
			baseUrl: (serverURL + '/api/'),// + SHAREDSPACE_ID + '/workspaces/' + WORKSPACE_ID),
			headers: {
				'HPSSO_HEADER_CSRF': HPSSO_COOKIE_CSRF,
				'HPSSO-HEADER-CSRF': HPSSO_COOKIE_CSRF,
				'HPECLIENTTYPE': 'HPE_MQM_UI'
			}
		});
		callback(requestor);
	});
}


/*function getSharedSpaces(req, res) {
	responseRequestor.get('shared_spaces', function (error, message, sharedSpaces) {
		console.log('shared space '+JSON.stringify(sharedSpaces));
		sharedSpaceList = [];
		sharedSpaces.data.forEach(function (sharedSpace) {
			console.log('id: ' + sharedSpace.id + ' name: ' + sharedSpace.name);
			sharedSpaceList.push({'id': sharedSpace.id, 'name': sharedSpace.name});
		});
		res.send(sharedSpaceList);
	});
}*/

function getWorkspaces(req, res) {
	responseRequestor.get('shared_spaces', function (error, message, sharedSpaces) {
		console.log('shared space '+JSON.stringify(sharedSpaces));
		if (sharedSpaces.data === undefined) {
			responseRequestor.sharedSpace = 1001;
		} else {
			responseRequestor.sharedSpace = sharedSpaces.data[0].id;
		}

		responseRequestor.get('shared_spaces/' + responseRequestor.sharedSpace + '/workspaces/', function (error, message, workSpaces) {
			workSpaceList = [];
			workSpaces.data.forEach(function (workSpace) {
				console.log('id: ' + workSpace.id + ' name: ' + workSpace.name);
				workSpaceList.push({'id': workSpace.id, 'name': workSpace.name});
			});
			res.send(workSpaceList);
		});
	})
}


function getReleases(req, res) {

	responseRequestor.get(responseRequestor.workSpaceURL+'/releases', function (error, message, releases) {
		console.log(JSON.stringify(releases));
		if (releases !== undefined && releases.data !== undefined) {
			releaseList = [];
			releases.data.forEach(function (release) {
				//console.log('id: ' + release.id + ' name: ' + release.name);
				releaseList.push({'id': release.id, 'name': release.name});
			});
			res.send(releaseList);
			
		} else {
			res.send(message);
		}
	});

}

function getTeams(req, res) {

	responseRequestor.get(responseRequestor.workSpaceURL+'/teams', function (error, message, teams) {
		if (teams !== undefined && teams.data !== undefined) {
			teamList = [];
			teams.data.forEach(function (team) {
				//console.log('id: ' + team.id + ' name: ' + team.name);
				teamList.push({'id': team.id, 'name': team.name});
			});
			res.send(teamList);
		} else {
			res.send(message);
		}
	});

}


function getSprints(req, res) {
	var queryString = '/sprints';
	var url_parts = url.parse(req.url, true);
	var params = url_parts.query;
	if (params !== undefined) {
		if (params['release'] !== undefined) {
			queryString = queryString + '?query="release={id='+params['release']+'}"';
		}
	}
	console.log('query string is '+queryString);
	responseRequestor.get(responseRequestor.workSpaceURL+queryString, function (error, message, sprints) {
		if (sprints !== undefined && sprints.data !== undefined) {
			sprintList = [];
			sprints.data.forEach(function (sprint) {
				//console.log('id: ' + sprint.id + ' name: ' + sprint.name);
				sprintList.push({'id': sprint.id, 'name': sprint.name});
			});
			res.send(sprintList);
		} else {
			res.send(message);
		}
	});

}

function innerGetWorkItems(itemsType, releaseId, sprintId, teamId) {
	var promise = new Promise(function(resolve, reject) {
		var queryString = '';

		if (releaseId !== undefined && releaseId !== '-1') {
			queryString = queryString + 'release={id=' + releaseId + '}';
		}
		if (sprintId !== undefined && sprintId !== '-1') {
			queryString = queryString + ';sprint={id=' + sprintId + '}';
		}
		if (teamId !== undefined && teamId !== '-1') {
			queryString = queryString + ';team={id=' + teamId + '}';
		}
		if (queryString !== '') {
			queryString = queryString + ';';
		}
		if (itemsType === 'Stories') {
			queryString = queryString + 'subtype=\'story\'';
		} else if (itemsType === 'Features') {
			queryString = queryString + 'subtype=\'feature\'';
		}

		console.log('query string is '+queryString);
		responseRequestor.get(responseRequestor.workSpaceURL+'/work_items?query="'+queryString+'"&fields=id,name,description&order_by=rank,id', function (error, message, workItems) {
			console.log(workItems);
			if (workItems !== undefined && workItems.data !== undefined) {
				console.log('WORK_ITEMS: '+workItems.data.length);
				var workItemsList = [];
				workItems.data.forEach(function (workItem) {
					//console.log(JSON.stringify(story));
				//	console.log('id: ' + workItem.id + ' name: ' + workItem.name + ' sp: '+ workItem.story_points);
					workItemsList.push({'id': workItem.id, 'name': workItem.name, 'type':itemsType, 'description': (workItem.description) ? String(workItem.description).replace(/<[^>]+>/gm, '') : "" });

				});
				resolve(workItemsList);
			}
		});
		
	});
	return promise;
}


function setTablePerSession(tableId) {
	sessionMap[tableId] = extend(responseRequestor, { status: 'copied' });;
}

function deleteTableSession(tableId) {
	if (sessionMap[tableId] !== undefined) {
		delete sessionMap[tableId];
		console.log('table ' + tableId + ' deleted');
	}
}

function getUser(req, res) {
	var workspaceID = req.params.workspaceID;
	console.log('shared_spaces/' + responseRequestor.sharedSpace + '/workspaces/'+workspaceID+'/workspace_users');
	responseRequestor.get('shared_spaces/' + responseRequestor.sharedSpace + '/workspaces/' + workspaceID + '/workspace_users?limit=1000', function (error, message, users) {
		console.log(JSON.stringify(users));
		console.log(message);
		var userList = [];
		if (users.data !== undefined) {
			users.data.forEach(function (user) {
				var user_name;
				if (user.full_name !== undefined) {
					user_name = user.full_name;
				} else if (user.name !== undefined) {
					user_name = user.name;
				} else {
					user_name = user.first_name + ' ' + user.last_name;
				}

				userList.push({'id': user.id, 'name': user_name});
			});
		}
		res.send(userList);
	});
}

function addDefect(req, res) {

}

function updateWorkItem(req, res) {
	var body = req.body;
	var id = body.id;
	var sp = body.sp;
	var comment = body.comment;
	var tableId = body.tableId;
	console.log ('updating id '+id+' sp '+ sp);
	var putStoryExample = {};

	var sessionRequestor = sessionMap[tableId];
	if (sessionRequestor === undefined) {
		console.log('could not find open session for this tableId');
		res.send('could not find open session for this game');
		return;
	}

	putStoryExample['story_points'] = parseInt(sp);

	sessionRequestor.put({uri: sessionRequestor.workSpaceURL+'/work_items/'+id, body: putStoryExample}, function (error, message, workItems){
		res.send(workItems);
	});




	var postCommentExample = {
		"data":
			[
				{
					"author": {
						"id": sessionRequestor.userId,
						"type": "workspace_user"
					},
					"owner_work_item": {
						"id" : id,
						"type": "work_item"
					},
					'text': comment
				}
			]
	}
	sessionRequestor.post({uri: sessionRequestor.workSpaceURL+'/comments', body: postCommentExample}, function (error, message, comments) {
		console.log('error is '+error+' message: '+message);
		console.log('comment added');
	});
}




exports.connect = connect;
exports.connectWorkspaces = connectWorkspaces;
exports.getWorkspaces = getWorkspaces;
exports.getUser = getUser;
exports.getReleases = getReleases;
exports.getSprints = getSprints;
exports.getTeams = getTeams;
exports.updateWorkItem = updateWorkItem;
exports.setTablePerSession = setTablePerSession;
exports.deleteTableSession = deleteTableSession;
exports.innerGetWorkItems = innerGetWorkItems;
exports.requestor = requestor;

