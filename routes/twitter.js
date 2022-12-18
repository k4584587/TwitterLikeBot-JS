const express = require('express');

const router = express.Router();

const {TwitterApi} = require('twitter-api-v2');
const {API_KEY, API_SECRET, ACCESS_TOKEN, ACCESS_SECRET, IMAGE_DOWNLOAD_FOLDER} = process.env;
const downloadURL = require('../utils/download');
const sqlite3 = require("sqlite3");

const client = new TwitterApi({
    appKey: API_KEY,
    appSecret: API_SECRET,
    accessToken: ACCESS_TOKEN,
    accessSecret: ACCESS_SECRET,
});

let db = new sqlite3.Database('./needon.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
});

router.get('/test', async (req, res) => {

    const query = `SELECT *
                   FROM NB_DOWNLOAD_LOG`;
    db.serialize();
    db.all(query, (err, row) => {
        res.json({data: row});
    });

});

router.get('/likes', async (req, res) => {


    try {
        let resultMessage = ''
        const {twitterId, size, type, url} = req.query;

        const user = await client.v2.userByUsername(twitterId);
        const userId = user.data.id;

        if (type === 'allDown') {

            let allTweets = [];
            let nextToken;
            do {
                const likedTweets = await client.v2.userLikedTweets(userId, {pagination_token: nextToken});
                const tweets = likedTweets.data.data;
                nextToken = likedTweets.data.meta.next_token;
                allTweets.push(tweets);

                for (const tweet of tweets) {
                    console.log(`result id: ${tweet.id}`);
                    const resultTweet = await client.v2.singleTweet(tweet.id, {
                        'tweet.fields': ['attachments'],
                        expansions: ['attachments.media_keys'],
                        'media.fields': ['url'],
                    });
                    const mediaResult = JSON.parse(JSON.stringify(resultTweet.includes?.media ?? {}));

                    if (mediaResult) {

                        const url = mediaResult[0].url;

                        if (url) {
                            const fileName = url.replace(/^.*\//, '');
                            const selectQuery = "SELECT * FROM NB_DOWNLOAD_LOG A WHERE A.url = ? AND A.fileName = ?";
                            console.log(url)
                            let params = [url + "?name=orig", fileName];

                            db.get(selectQuery, params, async (err, row) => {
                                if (err) {
                                    console.error(err.message);
                                }
                                if (row) {
                                    console.info(`this ${url} row with the same name and email already exists`);
                                } else {
                                    await downloadURL.download(`${url}?name=orig`, `${IMAGE_DOWNLOAD_FOLDER}${fileName}`);
                                    const query = `insert into NB_DOWNLOAD_LOG(url, fileName)
                                                   values ('${url}?name=orig', '${fileName}')`;
                                    db.serialize();
                                    db.each(query);
                                }
                            });
                        } else {
                            console.error("Error: url is not defined");
                        }

                    } else {
                        console.error('No media found in resultTweet.includes');
                    }
                }
            } while (nextToken);


            res.status(200).json(allTweets);

        }

        if (type === 'down') {

            const likedTweets = await client.v2.userLikedTweets(userId, {max_results: size});
            const tweets = likedTweets.data.data;
            const mediaUrls = await Promise.all(tweets.map(async (tweet) => {
                const resultTweet = await client.v2.singleTweet(tweet.id, {
                    'tweet.fields': ['attachments'],
                    'expansions': ['attachments.media_keys'],
                    'media.fields': ['url']
                });

                const mediaResult = JSON.parse(JSON.stringify(resultTweet.includes?.media ?? {}));



                if (mediaResult && mediaResult.length > 0) {

                    for (const r of mediaResult) {
                        const url = r.url;

                        if (url) {
                            const fileName = url.replace(/^.*\//, '');

                            const selectQuery = "SELECT * FROM NB_DOWNLOAD_LOG A WHERE A.url = ? AND A.fileName = ?";

                            let params = [url + "?name=orig", fileName];

                            db.get(selectQuery, params, async (err, row) => {
                                if (err) {
                                    console.error(err.message);
                                }
                                if (row) {
                                    console.info(`this ${url} row with the same name and email already exists`);
                                } else {
                                    await downloadURL.download(`${url}?name=orig`, `${IMAGE_DOWNLOAD_FOLDER}${fileName}`);
                                    const query = `insert into NB_DOWNLOAD_LOG(url, fileName)
                                                   values ('${url}?name=orig', '${fileName}')`;
                                    db.serialize();
                                    db.each(query);
                                }
                            });
                        } else {
                            console.error("Error: url is not defined");
                        }

                    } //end if url
                    return mediaResult.map((media) => media.url);
                }

            }));

            const url = mediaUrls.flat().filter(Boolean);

            res.status(200).json({url});

        }
        if (type === 'url') {

            console.log("url :: " + url);

            const urlComponents = new URL(url);
            const path = urlComponents.pathname;

            const id = path.split('/')[3];

            const resultTweet = await client.v2.singleTweet(id, {
                'tweet.fields': ['attachments'],
                'expansions': ['attachments.media_keys'],
                'media.fields': ['url']
            });

            const mediaResult = JSON.parse(JSON.stringify(resultTweet.includes?.media ?? {}));


            for (const r of mediaResult) {
                const url = r.url;
                console.log("url :: " + url);

                if (url) {
                    const fileName = url.replace(/^.*\//, '');

                    const selectQuery = "SELECT * FROM NB_DOWNLOAD_LOG A WHERE A.url = ? AND A.fileName = ?";

                    let params = [url + "?name=orig", fileName];

                    db.get(selectQuery,
                        params,
                        async (err, row) => {
                            if (err) {
                                console.error(err.message);
                            }
                            if (row) {
                                resultMessage = "이미 다운로드한 트윗입니다.";
                                console.info(`(url) this ${url} row with the same name and email already exists`);
                                res.status(200).send({resultMessage});
                            } else {
                                await downloadURL.download(`${url}?name=orig`, `${IMAGE_DOWNLOAD_FOLDER}${fileName}`);
                                const query = `insert into NB_DOWNLOAD_LOG(url, fileName)
                                               values ('${url}?name=orig', '${fileName}')`;
                                db.serialize();
                                db.each(query);
                                resultMessage = "다운로드 완료!";
                                res.status(200).send({resultMessage});
                            }
                        });
                } else {
                    console.error("Error: url is not defined");
                }

            }

        }
        //end if url

    } catch
        (error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while processing the request'});
    }
});

module.exports = router;
