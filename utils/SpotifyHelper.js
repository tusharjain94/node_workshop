const axios = require('axios');
const qs = require('qs');

// generated from Spotify Dev account Client ID, secret
const base64_auth_string = "NmNhYTc4N2YzZWY4NGQ0M2I1ZDVhYmQ0ZWY4ZjUyMjg6MjRlYjI4MzFiNjI0NDM3OGI2ODliOTc4OGEyZjhkMDc=";
let saved_access_token = null;

// ES5 version: function getAccessToken() {...
const getAccessToken = () => {

	return new Promise((resolve, reject) => {
		if (saved_access_token) {
			console.log("[SPOTIFY] Using saved access token: ", saved_access_token);
			resolve(saved_access_token);
		} else {
			console.log("[SPOTIFY] Requesting a new access token... ");

			const url = 'https://accounts.spotify.com/api/token';
			const auth_data = {
				grant_type: 'client_credentials'
			};

			axios({
				method: 'POST',
				url: url,
				data: qs.stringify(auth_data),
				headers: {
					"Authorization": `Basic ${base64_auth_string}`,
					"Accept": "application/json",
					"Content-Type": "application/x-www-form-urlencoded",
				}
			}).then(response => {
				console.log("[SPOTIFY] Access token: ", response.data.access_token);
				saved_access_token = response.data.access_token;
				resolve(saved_access_token);
			}).catch(err => reject(err));
		}
	});
}

exports.searchTrack = (search) => {
	return new Promise(function (resolve, reject) {
		console.log(`[SPOTIFY] : searching ${search}...`);
		getAccessToken().then( access_token => {
			// send a GET request for search, attaching the access_token
			//				to prove we are verified API user

			const _url = `https://api.spotify.com/v1/search?query=${search}&type=track`;

			axios({
				method: 'GET',
				url: _url,
				headers: {
					"Authorization": `Bearer ${access_token}`,
					"Accept": "application/json"
				}
			}).then( _res => {
				// inspect response data
				// console.log(`search response: ${JSON.stringify(_res.data)}`);

				// "massage" data so we only get the attributes we need
				const search_results = _res.data.tracks.items;
				const squashed_results = search_results.map(function (track) {
					return {
						id: track.id,
						artist: track.artists[0].name,
						album: track.album.name,
						title: track.name
					};
				});
				// console.log(squashed_results);
				// res.send(_res.data.tracks.items);
				// res.json(squashed_results);

				resolve(squashed_results);

			}).catch(function (err) {
				reject(err);
			});

			// testing: send search, access_token to client
			// res.send({ search: search, access_token: access_token });
		});

	});


}
