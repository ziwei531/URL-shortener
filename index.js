const express = require("express");
const res = require("express/lib/response");
const app = express();
let ejs = require("ejs");
const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;
const uri =
	"mongodb+srv://ziwei531:u3cG96LiJ171CWlk@cluster0.rtpncsr.mongodb.net/test";

//mongoose set up
const mongoose = require("mongoose");
main()
	.then(() => console.log("Successfully connected to mongodb"))
	.catch((err) => console.log(err));

async function main() {
	await mongoose.connect(uri);
}

//create schema
const urlSchema = new mongoose.Schema({
	originalURL: { type: String, required: true },
	shortURL: { type: String, required: true },
});

const Url = mongoose.model("Url", urlSchema);

//req = request
//res = response

//app.set is used to set the view engine
app.set("view engine", "ejs");

app.get("/", (req, res) => {
	res.render("index");
});

let port = process.env.PORT || 5000;
const server = app.listen(port, () => {
	console.log(`This server is listening on port ${port}`);
});

process.once("SIGUSR2", () => {
	// Perform any necessary cleanup here
	server.close(() => {
		console.log("Releasing port ${port}");
		process.kill(process.pid, "SIGUSR2");
	});
});

server.on("error", (err) => {
	if (err.code === "EADDRINUSE") {
		console.log(`Port ${port} is in use, trying another port`);
		setTimeout(() => {
			server.close();
			server.listen(++port);
		}, 1000);
	}
});
