#! /usr/bin/env node
// $.verbose=false;  // Uncomment this after project is done


import * as fs from "fs";
import { $ } from "zx";
import * as process from "process";

const src = "/home/pi/shared/src/";
const cache = "/home/pi/shared/cache/";
const logpath = "./logs/";
const logFileNames = ['deleted.log', 'added.log', 'modified.log'];



async function createLogs() { // Very bad but only way it works is through this method. I do not know why
	let x = await $`rsync -aivnc ${cache} ${src} > ./logs/deleted.log`;
	let y = await $`rsync -aivnc ${src} ${cache} > ./logs/added.log`;
	let z = await $`rsync -anvh --progress ${src} ${cache} --log-file=./logs/modified.log`;
}



function removeLogFiles() { // Remove log files after use. The files can't stay because they append everywhere and makes a mess.
	logFileNames.forEach(fileName => {
		fs.unlink(`./logs/${fileName}`, (err) => {
			if (err) throw err;
		});
	});
}

		

// redundant stuff but :/
function addedLogNames() { // Returns a list of "added log names" that have been ADDED to the source tree.
	let res = [];
	let fileData = fs.readFileSync("./logs/added.log").toString();
	fileData = fileData.split("\n");
	fileData.forEach(line => {
		if (line.includes("f++")) {
			res.push(line.replace(">f+++++++++ ", ""));
		}
	})

	return res;
}

function deletedLogNames() { // Returns a list of "deleted log names" that have been REMOVED FROM the source tree.
	let res = [];
	let fileData = fs.readFileSync("./logs/deleted.log").toString();
	fileData = fileData.split("\n");
	fileData.forEach(line => {
		if (line.includes("f++")) {
			res.push(line.replace(">f+++++++++ ", ""));
		}
	})

	return res;
}

function modifiedLogNames() {
	let res = [];
	let fileData = fs.readFileSync("./logs/added.log").toString();
	fileData = fileData.split("\n");
	fileData.forEach(line=> {
		if (line.includes("st...")) {
			res.push(line.replace(">fcst...... ", ""));
		}
	});
	return res;
}

async function push() {
	await createLogs();
	let added = addedLogNames();
	let deleted = deletedLogNames();
	let modified = modifiedLogNames();

	let tmp;
	for (let i = 0; i < added.length; i++) {
		tmp = src + added[i];
		await $`uplink cp ${tmp} sj://aws-test/shared/`;
	}

	for (let i = 0; i < deleted.length; i++) {
		await $`uplink rm sj://aws-test/shared/${deleted[i]}`;
	}

	for (let i = 0; i < modified.length; i++) {
		let tmp = src + modified[i];
		await $`uplink rm sj://aws-test/shared/${modified[i]}`;
		await $`uplink cp ${tmp} sj://aws-test/shared/${modified[i]}`;
	}
}



async function init() {
	try {
		await $`cp -r ${src} ${cache}` ;
		await $`uplink cp --recursive ${src} sj://aws-test/shared`;
	}
	catch(err) {
		console.log("Invalid input- this directory already exists.");
		return -1;
	}
}


const myArgs = process.argv.slice(2);
switch (myArgs[0]) {
	case 'start':
		init();
		break;
	case 'push':
		push();
		break;
	default: 
		console.log("Usage: \n buqet start \t : \t initializes file tree \n\n buqet push \t : \t pushes changes to storj blockchain")
}



