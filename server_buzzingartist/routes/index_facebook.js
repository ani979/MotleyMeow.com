
var FB              = require('fb'),
    Step            = require('step'),
    config          = require('../config');

    var extendedToken;

FB.options({
    appId:          config.facebook.appId,
    appSecret:      config.facebook.appSecret,
    redirectUri:    config.facebook.redirectUri
});

exports.loginCallback = function (req, res, next) {
    console.log("anupam logincallbackkkkk");
    var code            = req.query.code;
    if(req.query.error) {
        // user might have disallowed the app
        return res.send('login-error ' + req.query.error_description);
    } else if(!code) {
        return res.redirect('/');
    }

    Step(
        function exchangeCodeForAccessToken() {
            FB.napi('oauth/access_token', {
                client_id:      FB.options('appId'),
                client_secret:  FB.options('appSecret'),
                redirect_uri:   FB.options('redirectUri'),
                code:           code
            }, this);
        },
        function extendAccessToken(err, result) {
            console.log("errrr: "+err);
            if(err) throw(err);
            console.log("extendAccessToken result.access_token: "+result.access_token);
            extendedToken = result.access_token;
                // for( x in result ) {
                // console.log( x + "::anupam::: " + result[ x ].length );
                // var dataArray = result[ x ];
                // console.log("dataArrayyyyy: "+dataArray);
                //     }
            FB.napi('oauth/access_token', {
                client_id:          FB.options('appId'),
                client_secret:      FB.options('appSecret'),
                grant_type:         'fb_exchange_token',
                fb_exchange_token:  result.access_token
            }, this);
        },
        function (err, result) {
            console.log("anupam functionnnnnnn");
            if(err) return next(err);
            console.log("resulteeeeeeeeee: "+result);

            // for( x in result ) {
            //     console.log( x + "::function::: " + result[ x ].length );
            //     var dataArray = result[ x ];
            //     console.log("dataArrayyyyy in function: "+dataArray);
            //         }

            // console.log("message 11111111result.access_token: "+result.access_token);
            console.log("request: "+req);

             // for( y in req ) {
             //    console.log( y + "::req function::: " + req[ y ] );
             //    var dataArray = req[ y ];
             //    console.log(y);
             //    if(y === "params") {
             //        console.log("FOR PARAMSSS  "+dataArray.name);
             //                for( z in req[ y ] ) {
             //                    console.log("insideee PARAMS");
             //            console.log( z + ":: for: " + y + " ::: " + result[ z ] );
             //            // var dataArray = result[ z ];
             //            // console.log("dataArrayyyyy in function: "+dataArray);
             //                     }
             //    }
             //    // console.log("dataArrayyyyy in req: "+dataArray);
             //        }

            // console.log("req query: "+req.query);

            // for( y in req.query ) {
            //     console.log( y + "::req.query function::: " + req.query[ y ] );
            //     var dataArray = req.query[ y ];
            //     console.log("dataArrayyyyy in req.query: "+dataArray);
            //         }

            // console.log("req query error: "+req.query.error);
            // if(req.query.error) {
            //         // user might have disallowed the app
            //         console.log("req.query.error_description: "+req.query.error_description);
            //     }
            req.session.access_token    = result.access_token;
            req.session.expires         = result.expires || 0;
            console.log("req.query.state:::: "+req.query.state);
            if(req.query.state) {
                 console.log("message 2222222222");
                var parameters              = JSON.parse(req.query.state);
                parameters.access_token     = req.session.access_token;

                console.log("parametersss: "+ parameters);

                FB.api('/me/', result.access_token, function (result) {
                    console.log("resultttttt: "+ result);
                    if(!result || result.error) {
                        return res.send(500, result || 'error');
                        // return res.send(500, 'error');
                    }

                    return res.redirect('/');
                });
            } else {
                 console.log("message 33333333");
                 console.log("message 11111111result.access_token: "+result.access_token);
                 console.log("extendedTokennnnnnnnn: "+extendedToken);
                //  FB.api('/me',{fields:'email',access_token :result.access_token}, function (result) {
                //     console.log("resultttttt : "+ result);
                //     console.log("resultttttt error: "+ result.error);
                //     var dataArray;
                //             for( x in result ) {
                //                     console.log( x + "::::: " + result[ x ] );
                //                     dataArray = result[ x ];
                //                     // console.log("dataArrayyyyy: "+dataArray);
                //             }
                //             // for( x in dataArray ) {
                //             //         console.log( x + "::anupam dataArray::: " + dataArray[ x ] );
                //             //         // dataArray = result[ x ];
                //             //         // console.log("dataArrayyyyy: "+dataArray);
                //             // }
                //     if(!result || result.error) {
                //         // return res.send(500, result || 'error');
                //         // return res.send(500, 'error');
                //     }
                //     // return res.redirect('/');
                // });
                return res.redirect('/');
            }
        }
    );
};

