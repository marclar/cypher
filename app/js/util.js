util = {

    currentAllow : "crypto",
    q : "",
    b : "",
    gx : "",
    gy : "",
    n : "",
    rng : "",
    privateKey : '',
    publicKey : '',
    partnerKey : '',
    encryptionKey : '',

    changeDirection : function () {
        util.currentAllow = ( util.currentAllow == "crypto" ) ?  "text" : "crypto";
    },

    getText : function () {
        ui.context.querySelector( "#left" ).value = util.getFromClipBoard();
    },

    copyToClipBoard : function ( msg ) {
        clipboard.set( msg, 'text' );
    },

    getFromClipBoard : function () {
        return clipboard.get( 'text' );
    },

    transform : function () {

        var val = ui.context.querySelector( "#left" ).value;

        if ( util.currentAllow == "crypto" ) {

            util.chiper( val )

        } else {

            util.dechiper( val );

        }

    },

    chiper : function ( txt ) {

        var cipher = require( "crypto" ).createCipher( 'des-ede3-cbc', util.encryptionKey );
        var ciph = cipher.update( txt, 'utf8', 'hex' );
        ciph += cipher.final( 'hex' );
        ui.context.querySelector( "#right" ).value = ciph;

    },

    dechiper : function ( ciph ) {

        var decipher = require( "crypto" ).createDecipher( 'des-ede3-cbc', util.encryptionKey );
        var txt = decipher.update( ciph, 'hex', 'utf8' );
        txt += decipher.final( 'utf8' );
        ui.context.querySelector( "#right" ).value = txt;

    },

    formControl : function ( obj ) {

        switch ( obj.dataset.action ) {
            case "doRand":
                util.doRand();
                break;
            case "doPublicKey":
                util.doPublicKey();
                break;
            case "copyKey":
                util.copyKey();
                break;
            case "getKey":
                util.getKey();
                break;
            case "doSecretKey":
                util.doSecretKey();
                break;
        }
    },

    doInit : function () {

        util.set_ec_params( "secp160r1" );
        util.rng = new SecureRandom();

    },

    doRand : function() {

        util.doInit();

        var r = util.pickRand();
        util.privateKey = r.toString();
        ui.context.querySelector( "input[name='privateKey']" ).value = r.toString();

    },


    doPublicKey : function () {

        if ( util.privateKey == "" ) {
            alert( "Please generate Alice's private value first" );
            //ui.showAlert( { id : "content", value : "Please generate private value first"} );
            return;
        }

        var curve = util.getCurve();
        var G = util.getG( curve );
        var a = new BigInteger( util.privateKey );
        var P = G.multiply( a );

        var value = P.getX().toBigInteger().toString() + ":" + P.getY().toBigInteger().toString();
        util.publicKey = value;
        ui.context.querySelector( "input[name='publicKey']" ).value =  value;

    },

    copyKey : function () {

        util.copyToClipBoard( util.publicKey );

    },

    getKey : function () {

        util.partnerKey = util.getFromClipBoard();
        ui.context.querySelector( "input[name='partnerKey']" ).value = util.partnerKey;

    },

    doSecretKey : function() {

        if( util.privateKey == "" ) {
            alert("Please generate Alice's private value first");
            return;
        }

        if( util.partnerKey == "" ) {
            alert("Please compute Bob's public value first");
            return;
        }

        var curve = util.getCurve();
        var partnerKey = util.partnerKey.split(":");
        var P = new ECPointFp(curve,
                        curve.fromBigInteger(new BigInteger( partnerKey[0] )),
                        curve.fromBigInteger(new BigInteger( partnerKey[1] )));
        var a = new BigInteger( util.privateKey );
        var S = P.multiply(a);

        var value = S.getX().toBigInteger().toString() + ':' + S.getY().toBigInteger().toString();
        util.encryptionKey = value;
        ui.context.querySelector( "input[name='secretKey']" ).value = value;

    },

    set_ec_params : function ( name ) {

        var c = getSECCurveByName( name );

        util.q = c.getCurve().getQ().toString();
        util.a = c.getCurve().getA().toBigInteger().toString();
        util.b = c.getCurve().getB().toBigInteger().toString();
        util.gx = c.getG().getX().toBigInteger().toString();
        util.gy = c.getG().getY().toBigInteger().toString();
        util.n = c.getN().toString();

    },

    pickRand : function () {

        var n0 = new BigInteger( util.n );
        var n1 = n0.subtract( BigInteger.ONE );
        var r = new BigInteger( n0.bitLength(), util.rng );

        return r.mod(n1).add( BigInteger.ONE );

    },

    getCurve : function () {

        return new ECCurveFp(new BigInteger( util.q ),
                             new BigInteger( util.a ),
                             new BigInteger( util.b ));

    },

    getG : function (curve) {
        return new ECPointFp(curve,
                             curve.fromBigInteger(new BigInteger( util.gx )),
                             curve.fromBigInteger(new BigInteger( util.gy )));
    }

};