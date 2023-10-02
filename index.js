var express = require("express");
var cors = require("cors");
require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");

var app = express();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const storage = multer.diskStorage({
  destination: `${__dirname}/public/img/` ,
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.originalname}.${ext}`);
  },
});
const upload = multer({ storage: storage })

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

// Creating Database Schema
const Schema = mongoose.Schema;

const PictureMetadaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  }
});

const PictureMetadataModel = mongoose.model("picture_metadata", PictureMetadaSchema);

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", upload.single('upfile'), async (req, res) => {
  if(!req.file) {
    res.json({message: 'No file inserted!'});
  }

  const metadata = {
    name: req.file.originalname,
    type: req.file.mimetype,
    size: req.file.size,
  }

  const pictureMetadata = new PictureMetadataModel(metadata);

  try {
    await pictureMetadata.save()
    res.json(metadata)
  } catch (err) {
    console.error(err);
  }
});

const port = process.env.PORT || 3000;
const host = process.env.HOST;
app.listen(port, host, function () {
  console.log(`Your app is listening on http://${host}:${port}`);
});
