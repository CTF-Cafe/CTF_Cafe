const users = require('../models/userModel');
const teams = require('../models/teamModel');
const challenges = require('../models/challengeModel.js');
const ctfConfig = require('../models/ctfConfigModel.js');
const theme = require('../models/themeModel.js');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ObjectId = require('mongoose').Types.ObjectId;

exports.getStats = async function(req, res) {
    let allChallenges = await challenges.find({});

    switch ((req.body.name)) {
        case 'users':
            let allUsers = await users.find({});
            res.send(allUsers);
            break;
        case 'challenges':
            res.send(allChallenges);
            break;
        case 'challenges&categories':
            let categories = []

            await allChallenges.forEach(challenge => {
                if (categories.indexOf(challenge.category) == -1) categories.push(challenge.category);
            });

            res.send({ categories: categories, challenges: allChallenges });
            break;
        default:
            res.send([]);
            break;
    }

}

exports.saveChallenge = async function(req, res) {
    const challengeExists = await challenges.findById((req.body.id));

    if (challengeExists) {
        await challenges.findByIdAndUpdate((req.body.id), {
            name: req.body.name.trim(),
            points: parseInt(req.body.points),
            level: parseInt(req.body.level),
            info: req.body.info,
            hints: (req.body.hint.length > 0 ? [req.body.hint] : []),
            flag: req.body.flag.trim(),
            file: (req.body.file.length > 0 ? req.body.file : ''),
        });

        // let pointDiff = parseInt(challengeExists.points) - parseInt(updatedChallenge.points);

        // await users.updateMany({
        //     solved: { $elemMatch: { 'challenge._id': challengeExists._id } }
        // }, {
        //     $set: { 'solved.$.challenge': updatedChallenge, 'solved.$._id': updatedChallenge._id },
        //     $inc: { score: -pointDiff },
        // });

        // await teams.updateMany({
        //     users: { $elemMatch: { solved: { $elemMatch: { 'challenge._id': challengeExists._id } } } }
        // }, {
        //     $set: { 'users.$.solved.$[solve].challenge': updatedChallenge, 'users.$.solved.$[solve]._id': updatedChallenge._id },
        //     $inc: { 'users.$.score': -pointDiff },
        // }, {
        //     arrayFilters: [{ 'solve._id': challengeExists._id }],
        //     upsert: true
        // });

        res.send({ state: 'success', message: 'Challenge updated!' });
    } else {
        res.send({ state: 'error', message: 'Challenge does not exist' });
    }

}

exports.createChallenge = async function(req, res) {

    await challenges.create({
        name: req.body.name + Math.random().toString().substr(2, 4),
        points: parseInt(req.body.points),
        level: req.body.level,
        info: req.body.info,
        hints: (req.body.hint.length > 0 ? [req.body.hint] : []),
        flag: req.body.flag,
        file: (req.body.file.length > 0 ? req.body.file : ''),
        category: req.body.category
    });
    res.send({ state: 'success', message: 'Challenge created!' });

}

exports.updateChallengeCategory = async function(req, res) {
    const challengeExists = await challenges.findById((req.body.id));

    if (challengeExists) {
        await challenges.findByIdAndUpdate(req.body.id, { category: req.body.category });
        res.send({ state: 'success', message: 'Challenge category changed!' });
    } else {
        res.send({ state: 'error', message: 'Challenge does not exist' });
    }

}

exports.deleteChallenge = async function(req, res) {
    const challengeExists = await challenges.findById((req.body.id));

    if (challengeExists) {
        await challenges.findByIdAndDelete((req.body.id));

        await users.updateMany({
            solved: { $elemMatch: { 'challenge._id': challengeExists._id } }
        }, {
            $pull: { solved: { _id: challengeExists._id } },
            $inc: { score: -challengeExists.points },
        });

        await teams.updateMany({
            users: { $elemMatch: { solved: { $elemMatch: { 'challenge._id': challengeExists._id } } } }
        }, {
            $pull: { 'users.$.solved': { _id: ObjectId(challengeExists._id) } },
            $inc: { 'users.$.score': -challengeExists.points },
        });

        res.send({ state: 'success', message: 'Challenge deleted!' });
    } else {
        res.send({ state: 'error', message: 'Challenge does not exist' });
    }

}

exports.getAssets = async function(req, res) {
    const assetsPath = path.join(__dirname, '../assets/');

    await fs.readdir(assetsPath, function(err, files) {
        //handling error
        if (err) {
            console.log(err);
            res.send([]);
        } else {
            let fileData = [];
            //listing all files using forEach
            files.forEach(function(file) {
                // Do whatever you want to do with the file
                if (file != '.gitignore') {
                    fileData.push({
                        name: file,
                    })
                }
            });
            res.send(fileData);
        }
    });

}

exports.deleteAsset = async function(req, res) {
    const assetsPath = path.join(__dirname, '../assets/');

    await fs.unlink(assetsPath + req.body.asset, async(err) => {
        if (err) {
            res.send({ state: 'error', message: err.message });
        } else {
            await challenges.updateMany({ file: req.body.asset }, { file: '' });
            res.send({ state: 'success' });
        }
    });

}

exports.uploadAsset = async function(req, res) {
    try {
        if (!req.files) {
            res.send({ state: 'error', message: 'No file uploaded' });
        } else {
            //Use the name of the input field (i.e. "file") to retrieve the uploaded file
            let file = req.files.file;

            //Use the mv() method to place the file in upload directory (i.e. "assets")
            file.mv('./assets/' + file.name);

            //send response
            res.send({ state: 'success', message: 'File uploaded!' });
        }
    } catch (err) {
        res.send({ state: 'error', message: err.message });
    }
}

exports.getConfigs = async function(req, res) {
    const configs = await ctfConfig.find({});

    res.send(configs);
}

exports.saveConfigs = async function(req, res) {
    const newConfigs = req.body.newConfigs;
    let error = false;

    await newConfigs.forEach(async(config) => {
        await ctfConfig.updateOne({ name: config.name }, { value: JSON.parse(config.value) });
    });

    if (!error) {
        res.send({ state: 'success' });
    }
}

exports.getUsers = async function(req, res) {
    let page = (req.body.page);

    if (page <= 0) {
        res.send({ state: 'error', message: 'Page cannot be less than 1!' });
    } else {
        let userCount = await users.count();
        if (((page - 1) * 100) > userCount) {
            res.send({ state: 'error', message: 'No more pages!' });
        } else {
            if (isNaN(page)) {
                page = 1;
            }

            let allUsers = [];
            try {
                allUsers = await users.find().sort({ score: -1, _id: 1 }).skip((page - 1) * 100).limit(100);
            } catch (err) {
                console.log(err.message)
                allUsers = await users.find().sort({ score: -1, _id: 1 });
            }

            // allUsers.splice(0, ((page - 1) * 100));

            await allUsers.forEach(user => {
                user.key = 'Nice try XD';
            });

            res.send(allUsers);
        }
    }
}

exports.deleteUser = async function(req, res) {
    const user = await users.findById((req.body.user._id));

    if (user) {
        await users.findByIdAndRemove((req.body.user._id));

        if (ObjectId.isValid(user.teamId)) {
            await teams.findOneAndUpdate({
                _id: user.teamId,
                users: { $elemMatch: { username: user.username } }
            }, {
                $pull: {
                    users: { username: user.username },
                }
            }, { returnOriginal: false }).then(async function(team) {
                if (team.users) {
                    if (team.users.length <= 0) {
                        await teams.findByIdAndRemove(user.teamId);
                    }
                }
            });

        }

        res.send({ state: 'success' });
    } else {
        res.send({ state: 'error', message: 'User not found!' })
    }
}

exports.addAdmin = async function(req, res) {
    const user = await users.findById((req.body.user._id));

    if (user) {
        if (!user.isAdmin) {
            await users.findByIdAndUpdate((req.body.user._id), { isAdmin: true });
            res.send({ state: 'success' });
        } else {
            res.send({ state: 'error', message: 'User is already an Admin!' })
        }
    } else {
        res.send({ state: 'error', message: 'User not found!' })
    }
}

exports.removeAdmin = async function(req, res) {
    const user = await users.findById((req.body.user._id));

    if (user) {
        if (user.isAdmin) {
            await users.findByIdAndUpdate((req.body.user._id), { isAdmin: false });
            res.send({ state: 'success' });
        } else {
            res.send({ state: 'error', message: 'User is not an Admin!' })
        }
    } else {
        res.send({ state: 'error', message: 'User not found!' })
    }
}

exports.deleteTeam = async function(req, res) {
    const team = await teams.findById((req.body.team._id));

    if (team) {
        await teams.findByIdAndRemove((req.body.team._id));
        res.send({ state: 'success' });
    } else {
        res.send({ state: 'error', message: 'Team not found!' })
    }
}

exports.saveTheme = async function(req, res) {
    const currentTheme = await theme.findOne({});

    if (currentTheme) {
        await theme.findOneAndUpdate({}, { color_1: req.body.color_1, color_2: req.body.color_2, bg_img: req.body.bg_img });
        res.send({ state: 'success' });
    } else {
        res.send({ state: 'error', message: 'No theme found!' })
    }
}