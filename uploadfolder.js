var myProductName = "uploadfoldertogithub"; myVersion = "0.4.0";    

const fs = require ("fs");
const utils = require ("daveutils"); 
const request = require ("request");
const davegithub = require ("davegithub"); 
const filesystem = require ("davefilesystem");

function uploadToGithub (path, data, type, callback) {
	const options = {
		flUseQueue: true,
		username: config.githubBackup.username,
		repo: config.githubBackup.repo,
		password: config.githubBackup.password,
		repoPath: config.githubBackup.basepath + path,
		data: data.toString (),
		type: (type === undefined) ? "text/plain" : type,
		committer: config.githubBackup.committer,
		message: config.githubBackup.message,
		userAgent: myProductName + " v" + myVersion
		};
	davegithub.uploadFile (options, function (err, response, body) {
		console.log ("uploadToGithub: path == " + options.username + "/" + options.repo + "/" + options.repoPath + ", status == " + response.statusCode);
		if (callback !== undefined) {
			callback ();
			}
		});
	}


function uploadFolder (folderpath, callback) {
	function processFile (f) {
		fs.readFile (f, function (err, filetext) {
			if (err) {
				console.log ("processFile: f == " + f + ", err.message == " + err.message);
				}
			else {
				var relpath = utils.stringDelete (f, 1,  folderpath.length);
				uploadToGithub (relpath, filetext, "application/json", function (err) {
					});
				}
			});
		}
	filesystem.recursivelyVisitFiles (folderpath, function (f) {
		if (f === undefined) {
			callback ();
			}
		else {
			if (utils.endsWith (f, ".json")) {
				processFile (f);
				}
			}
		});
	}

fs.readFile ("config.json", function (err, jsontext) {
	if (err) {
		console.log (err.message);
		}
	else {
		config = JSON.parse (jsontext);
		console.log ("config == " + utils.jsonStringify (config));
		uploadFolder (config.folderToUpload, function () { 
			console.log ("queue is loaded up");
			});
		}
	});
