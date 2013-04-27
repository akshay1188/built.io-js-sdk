/*!
 * Built JavaScript SDK
 * Version: 1.0.0
 * Built: Wed Feb 22 2013 17:40:25
 * http://www.built.io
 * Copyright 2013 Raw Engineering, Inc.
 * The Built JavaScript SDK is freely distributable under the MIT license.
 */


(function (scope,undefined) {
    /**
     * Contains all Built API classes and functions.
     * @name Built
     * @namespace
     * @author Raw Engineering, Inc (www.raweng.com)
     * @version 1.0.0
     * @see Built.init
     * Contains all Built API classes and functions.
     */
    var that = scope,
        urls = {
            Base: '',
            register: '/application/users',
            login: '/application/users/login/',
            logout: '/application/users/logout/',
            user: '/application/users/',
            getUserInfo: '/application/users/current/',
            classes: '/classes/',
            objects: '/objects/',
            upload: '/uploads/',
            version: '/v3/',
            host: '',
            proto: 'https://',
            forgetPassword: "/application/users/forgot_password/request_password_reset/",
            role:'/built_io_application_user_role/objects/'
        }, Built, _Cache, appUserInfo = null, ajaxMethod, httpModule,
        isNode = (typeof exports !== 'undefined') &&
            (typeof module !== 'undefined') &&
            (typeof module.exports !== 'undefined') &&
            (typeof navigator === 'undefined' || typeof navigator.appName === 'undefined')
            ? true : false,
        asyncIt=(isNode?
            function(){
                var func=arguments[0],
                    _args=Array.prototype.slice.apply(arguments,[1,arguments.length]);
                process.nextTick(function(){func.apply(this,_args)});
            }:
            function(){
                var func=arguments[0],
                    _args=Array.prototype.slice.apply(arguments,[1,arguments.length]);
                setTimeout(function(){func.apply(this,_args)},0);
            }
            );
    if (isNode) { Built = exports; httpModule = require('restler'); } else { Built = that.Built = {} }
    Built.VERSION = '1.0.0';
    if (typeof console === 'undefined') {console = { };console.log=function(){}}

    var Headers = {}, //for setting headers globally
        queryString = {},
        random = function () {
            return Math.floor(Math.random() * 123456789);
        },
        serailiseURL = function (url) {
            return url.replace(/[\/]+/g, '/').replace(':/', '://').replace(/[\/]$/, '');
        },
        emptyJSON = function (obj) {
            for (var i in obj) { return false; }
            return true;
        },
        emptyFunc = function () { return function () { } },
        extend = function (protoProps, staticProps) {
            var parent = this;
            var model;
            if (protoProps && Object.prototype.hasOwnProperty.call(protoProps, 'constructor')) { model = protoProps.constructor }
            else { model = function () { return parent.apply(this, arguments); } }
            Built.Util.extend(model, parent, staticProps);
            var iPrototype = function () { this.constructor = model; };
            iPrototype.prototype = parent.prototype;
            model.prototype = new iPrototype;
            if (protoProps) Built.Util.extend(model.prototype, protoProps);
            model.__super__ = parent.prototype;
            return model;
        }
    /**
     * Call this method to Initialize Built SDK using your application tokens for built.io
     * You can get your api key and app uid from <a href="https://manage.built.io" target="_blank">https://manage.built.io</a> website.
     * @param {String} appKey Your Built Application API Key.
     * @param {String} appUid Your Built Application UID.
     */
    Built.init = function (apiKey, appUid) {
        Headers = {},queryString={},appUserInfo=null;
        if (typeof apiKey == 'object') {
            if (apiKey.application_api_key && apiKey.application_uid) {
                Headers['application_api_key'] = apiKey.application_api_key;
                Headers['application_uid'] = apiKey.application_uid;
            }
        } else {
            if (typeof apiKey == 'string') { Headers['application_api_key'] = apiKey }
            if (typeof appUid == 'string') { Headers['application_uid'] = appUid }
        }
        return Built;
    }
    Built.fn = Built.prototype;
    /**
     *Set the common headers for built.io rest calls .
     * @param {String} Key like extraHeaders OR JSON object with multiple headers like ({extraHeaders:"hello"}) .
     * @param {String} Value like hello .
     */
    Built.setHeaders = function (key, val) {
        if (Built.Util.dataType(key) == 'object') {
            Headers = Built.Util.mix(Headers, key);
        } else if (typeof key == 'string' && typeof val == 'string') {
            Headers[key] = val;
        }
        if (Headers['authtoken']) {
            if (Built.Util.dataType(appUserInfo) != 'object') { appUserInfo = { authtoken: Headers['authtoken']} }
        }
        return this;
    };
    /**
     *Get the common headers set for built.io rest calls .
     * @return Headers JSON Object.
     */
    Built.getHeaders = function () {
        return Built.Util.clone(Headers);
    };
    /**
     *Set the host server for built.io .
     * @param {String} HostName Host for built.io server like api.built.io.
     * @param {String} Protocol  Protocol for built.io server connection like https.
     * @return {Built} Return Built object, so you can chain this call.
     */
    Built.setURL = function (host, proto) {
        if (host) { urls.host = host }
        if (typeof proto == 'string' && proto.indexOf('https') >= 0) { urls.proto = "https://" }
        else if (typeof proto == 'string' && proto.indexOf('http') >= 0) { urls.proto = "http://" }
        urls.Base = serailiseURL(urls.proto + urls.host + urls.version);
        return this;
    };

    Built.addQueryString = function (key, val) {
        if (typeof key == 'string' && typeof val == 'string') {
            if (val == "" && queryString[key]) { delete queryString[key]; return; }
            queryString[key] = val;
        }
    };
/////////////////////////////////////////////////      Built.Cache				 ////////////////////////////////////////////////////
    (function (root) {
        var Built = root;
        /**
         * Built Cache Class.
         * @name Built.Cache
         * @class
         */
        Built.Cache={}
        /**
         * Set cache setting for Get data from cache only.
         * @return {Built} Returns the Built object, so you can chain this call.
         */
        Built.Cache.onlyCache=function(){
            _Cache="only_cache";
            return Built;
        }
        /**
         * Set cache setting for Get data from internet or network only.
         * @return {Built} Returns the Built object, so you can chain this call.
         */
        Built.Cache.onlyNetwork=function(){
            _Cache="only_network";
            return Built;
        }
        /**
         * Set cache setting for Get data from cache first if it's not available then fetch it from server.
         * @return {Built} Returns the Built object, so you can chain this call.
         */
        Built.Cache.cacheElseNetwork=function(){
            _Cache="cache_else_network";
            return Built;
        }
        /**
         * Set cache setting for Get data from network first if it's not available then fetch it from cache.
         * @return {Built} Returns the Built object, so you can chain this call.
         */
        Built.Cache.networkElseCache=function(){
            _Cache="network_else_cache";
            return Built;
        }
        /**
         * Set cache setting for Get data from cache first then fetch it from server.
         * Callback occured two times in this option first for cache data and then for network data.
         * @return {Built} Returns the Built object, so you can chain this call.
         */
        Built.Cache.cacheThenNetwork=function(){
            _Cache="cache_then_network";
            return Built;
        }

    })(Built);

/////////////////////////////////////////////////       Built.Util               ///////////////////////////////////////////////////
    (function (root) {
        var Built = root;
        /**
         * Utility Class.
         * @name Built.Util
         * @class
         */
        Built.Util = {}
        /**
         * Utility method to execute multiple tasks parallal and get callback after completion of all tasks.
         * @param {Object} Tasks Object literal containing functions.
         * @param {Function} Callback Function to be executed after completion of all tasks.
         * @return {Built.Util} Returns the Util object, so you can chain this call.
         */
        Built.Util.parallal = function (tasks, callback) {
            if (this.dataType(tasks) == 'object') {
                var me = this;
                var b = function () {
                    var taskCount = 0, completed = 0, err = null, results = {};
                    for (var i in tasks) { taskCount += 1 }
                    var cb = function (id) {
                        var myId = id,
                            cbs = function () {
                                return function (error, result) {
                                    if (error != null) {
                                        if (err == null && typeof callback == 'function') { callback(error, null) }
                                        error = err;
                                    } else {
                                        completed += 1;
                                        results[myId] = result;
                                        if (completed >= taskCount && typeof callback == 'function') {
                                            callback(err, results);
                                        }
                                    }
                                }
                            }
                        return new cbs;
                    }
                    for (var i in tasks) {
                        tasks[i](cb(i));
                    }
                    return me;
                }
                return new b;
            } else { throw new Error("Object parameters required for parallal tasks") }
            return this;
        }
        /**
         * Utility method for creating query string from JSON object
         * @param {Object} JSON object.
         * @param {Boolean} UnEncoded boolean for URI encode.
         * @return {String} Query string.
         */
        Built.Util.param = function (a, unEncoded) {
            var s = [],
                prefix,
                r20 = /%20/g,
                add = function (key, value) {
                    value = (value == null ? "" : value);
                    if (unEncoded) { s[s.length] = key + "=" + value }
                    else { s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value); }
                };

            if (this.dataType(a) == 'object') {
                for (var prefix in a) { this.__buildParams__(prefix, a[prefix], add) }
            } else {
                var x = JSON.parse(a);
                for (var prefix in x) { this.__buildParams__(prefix, x[prefix], add) }
            }
            return s.join("&").replace(r20, "+");
        }
        /**
         * @private
         */
        Built.Util.__buildParams__ = function (prefix, obj, add) {
            var rbracket = /\[\]$/;
            if (this.dataType(obj) == 'array') {
                for (var j = 0; j < obj.length; j++) {
                    if (rbracket.test(prefix)) { add(prefix, obj[j]) }
                    else { this.__buildParams__(prefix + '[' + (isNaN(j) ? j : '') + ']', obj[j], add) }
                }
            }
            else if (this.dataType(obj) == "object") {
                for (name in obj) {
                    this.__buildParams__(prefix + "[" + name + "]", obj[name], add);
                }
            } else { add(prefix, obj) }
        }
        /**
         * Utility method for getting accurate data type of variable.
         * @param {String|Object|Number|Null|Undefined} Var Variable.
         * @return {String} Data Type.
         */
        Built.Util.dataType = function (arg) {
            var x = Object.prototype.toString.call(arg);
            if (arg === undefined) { return 'undefined' }
            else if (arg === null) { return 'null' }
            else if (x.indexOf('Element') >= 0 || typeof arg.tagName !=="undefined") { return 'element' }
            else if (x == "[object Boolean]") { return 'boolean' }
            else if (x == "[object Array]") { return 'array' }
            else if (x == "[object Object]") { return 'object' }
            else if (x == "[object Function]") { return 'function' }
            else if (x == "[object Number]" || isNaN(arg) == false && arg != "") { return 'number' }
            else if (x == "[object String]") { return 'string' }
            else { return 'unknown' }
        }
        /**
         * Utility method for creating object by mixing two object.
         * @param {Object} Object First Object.
         * @param {Object} Object Second Object.
         * @return {Object} Newly created object.
         */
        Built.Util.mix = function (a, b) {
            if (typeof a == 'object' && typeof b == 'object') {
                var x = this.clone(a);
                for (var i in b) {
                    x[i] = b[i]
                }
                return x;
            }
        }
        /**
         * Utility function to get clone object of any object.
         * @param {Object} Object to be cloned.
         * @return {Object} Clone object.
         */
        Built.Util.clone = function (obj) {
            var a = {};
            for (var i in obj) {
                a[i] = obj[i];
            }
            return a;
        }
        /**
         * Iterate any object in any context, similer to Jquery.each.
         * @param {Object} Object to iterate.
         * @param {Function} Iterator function.
         * @param {Object} Context object (optional).
         */
        Built.Util.each = function (obj, iterator, context) {
            var nativeForEach = Array.prototype.forEach, //shortcut for foreach
                breaker = {}; //breaker
            if (obj == null) return;
            if (nativeForEach && obj.forEach === nativeForEach) {
                obj.forEach(iterator, context);
            } else if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === breaker) return;
                }
            } else {
                for (var key in obj) {
                    if (obj[key]) {
                        if (iterator.call(context, obj[key], key, obj) === breaker) return;
                    }
                }
            }
        }
        /**
         * Extend any object/function using extend method, very much like Backbone's extend method.
         * @param {Object} parent object .
         * @param {Object} child objects .
         * @return {Object} new extended object .
         * null or undefined is treated as the empty string.
         */
        Built.Util.extend = function (obj) {
            var slice = Array.prototype.slice; //shortcut for array slice
            this.each(slice.call(arguments, 1), function (source) {
                if (source) {
                    for (var prop in source) {
                        obj[prop] = source[prop];
                    }
                }
            });
            return obj;
        }
        /**
         * Utility method to convert query string to JSON
         * @param {String} QueryString string value.
         * @param {Boolean} returnFormat (optional) true will return parsed JSON or it will return stringify JSON.
         * @return {String} JSON String.
         */
        Built.Util.deparam = function (params, coerce) {
            try {
                var obj = {},
                    coerce_types = { 'true': !0, 'false': !1, 'null': null };
                var iterate = params.replace(/\+/g, ' ').split('&');
                var len = iterate.length;
                for (var cutParams = 0; cutParams < len; cutParams++) {
                    var param = iterate[cutParams].split('='),
                        key = decodeURIComponent(param[0]),
                        val, cur = obj,
                        i = 0,
                        keys = key.split(']['),
                        keys_last = keys.length - 1;
                    if (/\[/.test(keys[0]) && /\]$/.test(keys[keys_last])) {
                        keys[keys_last] = keys[keys_last].replace(/\]$/, '');
                        keys = keys.shift().split('[').concat(keys);
                        keys_last = keys.length - 1;
                    } else {
                        keys_last = 0;
                    }
                    if (param.length === 2) {
                        val = decodeURIComponent(param[1]);
                        if (coerce) {
                            val = val && !isNaN(val) ? +val : val === 'undefined' ? undefined : coerce_types[val] !== undefined ? coerce_types[val] : val;
                        }

                        if (keys_last) {
                            for (; i <= keys_last; i++) {
                                key = keys[i] === '' ? cur.length : keys[i];
                                cur = cur[key] = i < keys_last ? cur[key] || (keys[i + 1] && isNaN(keys[i + 1]) ? {} : []) : val;
                            }

                        } else {
                            if (this.dataType(obj[key]) == 'array') {
                                obj[key].push(val);

                            } else if (obj[key] !== undefined) {
                                obj[key] = [obj[key], val];

                            } else {
                                obj[key] = val;
                            }
                        }

                    } else if (key) {
                        obj[key] = coerce ? undefined : '';
                    }
                }

                return obj;
            } catch (e) { throw e }
        }


    })(Built);


//////////////////////////////////////////////////      Built.File               //////////////////////////////////////////////////

    (function (root) {
        //if (typeof FormData === 'undefined') { return; }
        var Built = root;
        /**
         * File Class to upload images and files in built.io servers.<br/>
         * <b>var builtUpload = new Built.File();</b>
         * @name Built.File
         * @class
         */



        Built.File = function () {
            var __f__ = {};

            /**
             * add method to add images and files in upload queue.
             * @param {String} Key Unique key for each upload like : upload1.
             * @param {HTML Element|FormData} File HTML Input File Element or FormData
             * @example builtUpload.add('upload1',document.getElementById('profile_pic')))
             * @name add
             * @memberOf Built.File
             * @function
             * @return {Built.File} Returns the File object, so you can chain this call.
             */
            this.add= function (key, file) {
                if (key && file) {
                    if(typeof file[0]!=="undefined"){file=file[0]}
                    if (Built.Util.dataType(file) == 'element') {
                        __f__[key] = file;
                    } else if (typeof FormData !== 'undefined' && file instanceof FormData) {
                        __f__[key] = file;
                    } else {
                        throw new Error('Not supported object type for upload, add HTML Input File Element');
                    }
                }else{throw new Error("id and File 2 parameters required")}
                return this;
            }

            /**
             * Upload method to upload one or more images and other files to built.io server.
             * @param {Object} Callback JSON object containing onSuccess, onError callback functions.<br/>
             * @example Eg: builtUpload.upload({onSuccess:function(data){}});
             * onSuccess upload method return data in JSON like:
             * upload1:{content_type:'image/jpeg',file_size: "2161",filename: "pic.jpg",uid: "blt426d6fd75ee87505a"url: "https://--/download"},
             * upload2:{content_type:'image/jpeg',file_size: "2101",filename: "logo.jpg",uid: "blt426d6fd75ee6504f"url: "https://--/download"}
             * @name upload
             * @memberOf Built.File
             * @function
             * @return {Built.File} Returns the File object, so you can chain this call.
             */
            this.upload= function (callback) {
                callback = callback || {};
                var uploads = __f__ || {},
                    me = this,
                    prom=new Built.Promise();
                if (emptyJSON(uploads) == true) {
                    throw new Error("No file found for upload");
                    return;
                }
                if (Built.Util.dataType(uploads) != 'object') { throw new Error("JSON Object required in parameters") }
                var cb = function (err, results) {
                    if (err) {
                        if (typeof callback.onError == 'function') {
                            callback.onError(err, results);
                        }
                        prom.reject(err,results);
                    } else {
                        if (typeof callback.onSuccess == 'function') {
                            me.__f__ = {};
                            callback.onSuccess(results);
                        }
                        prom.resolve(results,null);
                    }
                    if (typeof callback.onAlways == 'function') {
                        callback.onAlways(data, res);
                    }
                }
                var newUps = uploadHelper(uploads);
                Built.Util.parallal(newUps, cb);
                return prom;
            }
            /** @private */
            var uploadHelper = function (uploads) {
                if (Built.Util.dataType(uploads) != 'object') { throw new Error("Object required in parameters") }
                var newUps = {};
                for (var i in uploads) {
                    newUps[i] = function (callback) {
                        var elm = uploads[i];
                        var cb = {};
                        cb.onSuccess = function (data, res) {
                            callback(null, data);
                        }
                        cb.onError = function (data, res) {
                            callback(data, data);
                        }
                        var url = urls.Base + '/' + urls.upload,
                            headers = Headers,
                            options = {};
                        url = serailiseURL(url);
                        uploadWeb(url, headers, elm, cb, options);
                    }
                }
                return newUps;
            }
        }
    })(Built);


//////////////////////////////////////////////////      Built.User               //////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
         * User Class to login, logout, register, deactivate users in Application.
         * @name Built.User
         * @class
         */
        Built.User = {}
        /**
         * Login Built.io Application user .
         * @param {String} Email Email-id registered.
         * @param {String} Password Password.
         * @param {Object} Options containing callbacks and other options ({onSuccess:function(){}}) .
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.login = function (email, pass, option) {
            option = option || {};
            if (typeof email != 'string' || typeof pass != 'string') {
                throw new Error("Email and Password required");
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && data.application_user) {
                    appUserInfo = data.application_user;
                    Headers['authtoken'] = data.application_user.authtoken;
                    prom.resolve(data,res);
                    if (typeof option.onSuccess == 'function') {
                        option.onSuccess(data, res);
                    }
                } else {
                    prom.reject(data,res);
                    if (typeof option.onError == 'function') {
                        option.onError(data, res);
                    }
                }
                if (typeof option.onAlways == 'function') {
                    option.onAlways(data, res);
                }
            }
            var data = { application_user: { email: email, password: pass} }
            rest.user.login(Headers, data, cb, {});
            return prom;
        }
        /**
         * Save Built.io Application user session locally.
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.saveSession = function () {
            if (typeof appUserInfo == 'object' && typeof localStorage !== 'undefined' && Headers['application_api_key']) {
                localStorage.setItem(Headers['application_api_key'], JSON.stringify(appUserInfo));
            }
            if (typeof localStorage === 'undefined') { throw new Error("Saving Session is not supported in this Client") }
            return this;
        }
        /**
         * Set user defined Built.io Application user session.
         * @param {Object} Object object get from Buit.User.getSession method <br/> or JSON object containing authtoken, email etc.
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.setSession = function (key) {
            if (typeof key == 'object' && key.authtoken) {
                appUserInfo = key;
                for (var i in key) {
                    if (i == 'authtoken') { Headers['authtoken'] = key[i] }
                }
            } else if (typeof key == 'string') {
                Headers['authtoken'] = key;
                appUserInfo = { authtoken: key }
            }
            return this;
        }
        /**
         * Get Saved Built.io Application user session.
         * @return {Object} Return Built.User session object .
         */
        Built.User.getSession = function () {
            if (typeof Headers['application_api_key'] !== 'undefined' && typeof localStorage !== 'undefined' && localStorage.getItem(Headers['application_api_key'])) {
                return JSON.parse(localStorage.getItem(Headers['application_api_key']));
            }
            if (typeof Headers['application_api_key'] === 'undefined') { throw new Error("First init Built SDK with Built.init(apiKey,appUid)") }
            return null;
        }
        /**
         * Clear current Built.io Application user session.
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.clearSession = function () {
            if (typeof Headers['authtoken'] !== 'undefined') {
                delete Headers['authtoken'];
            }
            appUserInfo = null;
            return this;
        }
        /**
         * Log Out Built.io Application user .
         * @param {Object} Options containing callbacks and other info ({onSuccess:function(){}}) .
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.logout = function (option) {
            option = option || {};
            if (appUserInfo == null || typeof appUserInfo != 'object' || typeof appUserInfo.authtoken ==='undefined') {
                throw new Error("No user found");
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && typeof data.notice !== "undefined") {
                    appUserInfo = null;
                    if (Headers['authtoken']) { delete Headers['authtoken'] }
                    prom.resolve(data,res);
                    if (typeof option.onSuccess == 'function') {
                        option.onSuccess(data, res);
                    }
                } else {
                    prom.reject(data,res);
                    if (typeof option.onError == 'function') {
                        option.onError(data, res);
                    }
                }
                if (typeof option.onAlways == 'function') {
                    option.onAlways(data, res);
                }
            }
            rest.user.logout(Headers, {}, cb, {});
            return prom;
        }
        /**
         * Register/Create New user in built.io Application .
         * @param {Object} UserInfo JSON object containing user info .<br/>
         * @example UserInfo object contains following parameters:
         * {email: required,
        * password:required,
        * password_confirmation:required,
        * username:optional,
        * first_name:optional,
        * last_name:optional,
        * anydata:anyvalue}
         * @param {Object} Options containing callbacks (onSuccess,onError) and other info ({onSuccess:function(d,r){}}) .
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.register = function (options, callback) {
            options = options || {}
            callback = callback || {}
            if ((typeof options.email==='undefined' ||
                typeof options.password==='undefined' ||
                typeof options.password_confirmation==='undefined') &&
                typeof options.auth_data ==='undefined') {
                throw new Error("Provide required parameters: email, password, password_confirmation OR auth_data");
                return;
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && typeof data.notice !== "undefined") {
                        prom.resolve(data,res);
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data, res);
                        }
                    } else {
                        prom.reject(data,res);
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                    if (typeof callback.onAlways == 'function') {
                        callback.onAlways(data, res);
                    }
                },
                data = { application_user: options };
            rest.user.register(Headers, data, cb, {});
            return prom;
        }
        /**
         * Deactivate application user in built.io Application.<br/>
         * authentcation required
         * @param {Object} Options containing callbacks (onSuccess,onError) .like: {onSuccess:function(d,r){}} .
         * @return {Built.User} Return Built.User object, so you can chain this call.
         */
        Built.User.deactivate = function (options) {
            options = options || {}
            if (typeof Headers['authtoken']==='undefined') {
                throw new Error("authenticated session required") ;
                return;
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && typeof data.notice !== "undefined") {
                    appUserInfo = null;
                    if (Headers['authtoken']) { delete Headers['authtoken'] }
                    prom.resolve(data,res);
                    if (typeof options.onSuccess == 'function') {
                        options.onSuccess(data, res);
                    }
                } else {
                    prom.reject(data,res);
                    if (typeof options.onError == 'function') {
                        options.onError(data, res);
                    }
                }
                if (typeof options.onAlways == 'function') {
                    options.onAlways(data, res);
                }
            }
            rest.user.deactivate(Headers, {}, cb, {});
            return prom;
        }
        /**
         * Check whether user is already logged in.
         * @return {Boolean} Boolean value.
         */
        Built.User.isAuthenticated = function () {
            if (appUserInfo != null && typeof appUserInfo == 'object' && appUserInfo.authtoken) { return true }
            else { return false }

        }
        /**
         * Get Logged In user's all information.
         * @return {Object} JSON Object containing logged in user info or null value.
         */
        Built.User.currentUser = function () {
            if (appUserInfo != null && typeof appUserInfo == 'object' && appUserInfo['authtoken']) { return appUserInfo }
            return null;
        }
        /**
         * Fetch Logged In user's all information from built server.
         * @param {Object} Options containing callbacks (onSuccess,onError) .like: {onSuccess:function(d,r){}} .
         * @return {Object} Return Built.User object, so you can chain this call.
         */
        Built.User.refreshUserInfo = function (option) {
            option = option || {};
            if (typeof Headers['authtoken']==='undefined') {
                throw new Error("No authtoken found");
                return;
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && data.application_user) {
                    var au = appUserInfo.authtoken || Headers['authtoken'];
                    appUserInfo = data;
                    appUserInfo.authtoken = au;
                    prom.resolve(appUserInfo,res);
                    if (typeof option.onSuccess == 'function') {
                        option.onSuccess(appUserInfo, res);
                    }
                } else {
                    prom.reject(data,res);
                    if (typeof option.onError == 'function') {
                        option.onError(data, res);
                    }
                }
                if (typeof option.onAlways == 'function') {
                    option.onAlways(data, res);
                }
            }
            rest.user.fetchUserInfo(Headers, {}, cb, {});
            return prom;
        }
        /**
         * Send request for reseting passward for application user.
         * @param {Object} Options containing callbacks (onSuccess,onError) .like: {onSuccess:function(d,r){}} .
         * @return {Object} Return Built.User object, so you can chain this call.
         */
        Built.User.forgotPassword = function (option) {
            option = option || {};
            if (typeof option.email !== 'string') {
                throw new Error("No email id found");
                return;
            }
            var prom=Built.Promise();
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && typeof data.notice !== "undefined") {
                    prom.resolve(data,res);
                    if (typeof option.onSuccess == 'function') {
                        option.onSuccess(data, res);
                    }
                } else {
                    prom.reject(data,res);
                    if (typeof option.onError == 'function') {
                        option.onError(data, res);
                    }
                }
                if (typeof option.onAlways == 'function') {
                    option.onAlways(data, res);
                }
            }
            var data = { application_user: { email: option.email} };
            rest.user.forgetPassword(Headers, data, cb, {});
            return prom;
        }

    })(Built);

//////////////////////////////////////////////////      Built.Delta              /////////////////////////////////////////////////
    (function (root) {
        var Built = root;
        /**
         * Delta class to get delta objects.
         * Delta objects is objects created, updated, deleted or all after certain time given by user.
         * @name Built.Delta
         * @constructor
         * @class
         */
        Built.Delta = function (class_id) {
            if (typeof class_id != 'string') { throw new Error("Built Class UID required for Delta object") }
            var __q__ = { delta: {} };
            var class_uid = class_id;

            /**
             * Get delta objects created on and after certain time given by user.
             * @param {String} DateTime Time in format of DD-MM-YYYY OR DD-MM-YYYY HH:MM:SS.
             * @name createdAt
             * @memberOf Built.Delta
             * @function
             * @return {Object} Return Built.Delta object, so you can chain this call.
             */
            this.createdAt= function (moment) {
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                if (typeof moment != "string") { throw new Error("Time required to query delta objects") }
                __q__.delta['created_at'] = moment;
                return this;
            }


            /**
             * Get delta objects deleted on and after certain time given by user.
             * @param {String} DateTime Time in format of DD-MM-YYYY OR DD-MM-YYYY HH:MM:SS.
             * @return {Object} Return Built.Delta object, so you can chain this call.
             * @name deletedAt
             * @memberOf Built.Delta
             * @function
             * @return {Object} Return Built.Delta object, so you can chain this call.
             */
            this.deletedAt= function (moment) {
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                if (typeof moment != "string") { throw new Error("Time required to query delta objects") }
                __q__.delta['deleted_at'] = moment;
                return this;
            }

            /**
             * Get delta objects updated on and after certain time given by user.
             * @param {String} DateTime Time in format of DD-MM-YYYY OR DD-MM-YYYY HH:MM:SS.
             * @name updatedAt
             * @memberOf Built.Delta
             * @function
             * @return {Object} Return Built.Delta object, so you can chain this call.
             */
            this.updatedAt= function (moment) {
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                if (typeof moment != "string") { throw new Error("Time required to query delta objects") }
                __q__.delta['updated_at'] = moment;
                return this;
            }

            /**
             * Get ALL delta objects updated, deleted, created on and after certain time given by user.
             * @param {String} DateTime Time in format of DD-MM-YYYY OR DD-MM-YYYY HH:MM:SS.
             * @name allDeltaAt
             * @memberOf Built.Delta
             * @function
             * @return {Object} Return Built.Delta object, so you can chain this call.
             */
            this.allDeltaAt= function (moment) {
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                if (typeof moment != "string") { throw new Error("Time required to query delta objects") }
                __q__.delta['ALL'] = moment;
                return this;
            }

            /**
             * Execute Delta object query to get delta objects.
             * @param {Object} Options JSON Object containing callbacks like onSuccess, onError, model:false etc.
             * @example onSuccess callback return JSON object containing created_at, updated_at and deleted_at key
             * depend on your filters with respected objects in it
             * {created_at:[object,object,object],updated_at:[object,object]}
             * @name exec
             * @memberOf Built.Delta
             * @function
             * @return {Object} Return Built.Delta object, so you can chain this call.
             */
            this.exec= function (options) {
                options = options || {};
                var self = this;
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                if (Built.Util.dataType(__q__) != 'object' || emptyJSON(__q__) == true) {
                    throw new Error("No Delta query found to execute");
                    return;
                }
                var nQ = new Built.Query(class_uid);
                var prom=Built.Promise();
                var opt = {};
                opt.query = __q__;
                opt.model = false;
                opt.onSuccess = function (data, res) {
                    if (options.model === false) {
                        prom.resolve(data,res);
                        if (typeof options.onSuccess == 'function') {
                            options.onSuccess(data, res);
                        }
                    } else {
                        if (typeof data.objects.created_at !== "undefined") {
                            data.objects.created_at = nQ.__toObjectModel__(data.objects.created_at, class_uid);
                        }
                        if (typeof data.objects.updated_at !== "undefined") {
                            data.objects.updated_at = nQ.__toObjectModel__(data.objects.updated_at, class_uid);
                        }
                        if (typeof data.objects.deleted_at !== "undefined") {
                            data.objects.deleted_at = nQ.__toObjectModel__(data.objects.deleted_at, class_uid);
                        }
                        prom.resolve(data.objects,res);
                        if (typeof options.onSuccess == 'function') {
                            options.onSuccess(data.objects, res);
                        }
                    }
                }
                opt.onError = function(data,res){
                    prom.reject(data,res);
                    options.onError(data,res);
                }
                opt.onAlways = options.onAlways;
                nQ.exec(opt);
                return prom;
            }
        }
    })(Built);

/////////////////////////////////////////////////       Built.Object             /////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
         * Object Class.
         * @name Built.Object
         * @class
         * @see Built.Object.extend
         */
        Built.Object = function (attrbs) {
            if (typeof this.class_uid != 'string') { throw new Error("Class UID required") }
            var _schema = null;
            var attributes = {};
            var object_uid = null;
            var __q = {};
            var shadow = {};

            if (typeof attrbs == 'string') { attrbs = {uid: attrbs } }
            if (Built.Util.dataType(attrbs) == 'object') {
                if (attrbs.uid) {
                    object_uid = attrbs.uid
                    attributes = Built.Util.clone(attrbs);
                }
            }
            this.initialize= function () { }

            /**
             * Set Object data or property.
             * @param {String} Key or Property name .
             * @param {String} Value .
             * @name set
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.set= function (key, val) {
                if (typeof key == 'object') {
                    shadow = Built.Util.mix(shadow, key);
                } else if (typeof key == 'string' && val) {
                    shadow[key] = val;
                }
                return this;
            }

            /**
             * Fetch object data from built.io server.
             * @param {Object} Callbacks object containing onSuccess, onError and always method for callbacks .
             * @name fetch
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.fetch= function (callback) {
                if (typeof this.class_uid !== 'string' ||
                    this.class_uid.length <= 0 ||
                    typeof object_uid !== 'string' ||
                    object_uid.length <= 0) {
                    throw new Error('Object Uid and Class Uid required');
                    return;
                }
                var headers,
                    me = this,
                    option = {};
                callback = callback || {};
                var prom=new Built.Promise();
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) {}
                    if (typeof data == 'object' && typeof data.object !== "undefined") {
                        attributes = data.object;
                        object_uid = data.object.uid;
                        shadow = {};
                        prom.resolve(data.object,res);
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data.object, res);
                        }
                    } else {
                        prom.reject(data,res);
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                    if (typeof callback.onAlways == 'function') {
                        callback.onAlways(data, res);
                    }
                }
                option.class_uid = this.class_uid;
                if (object_uid) { option.object_uid = object_uid }
                rest.object.fetch(Headers, __q, cb, option);
                return prom;
            }

            /**
             * Save object data as Draft in built.io server.
             * @param {Object} Callbacks object containing onSuccess, onError and always method for callbacks .
             * @name saveAsDraft
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.saveAsDraft= function (callback) {
                this.set({ published: false });
                this.save(callback);
            }

            /**
             * Add filter while fetching object data from built io server (for including reference, owner etc.).
             * @param {String} Key string .
             * @param {String|Object} Value .
             * @name includeFilter
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.includeFilter=function(key,val){
                if(typeof key=='string' && val){
                    __q[key]=val;
                }
                return this;
            }

            /**
             * Set ACL to this object.
             * @param {Object} builtACL Built.ACL Object.
             * @name setACL
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.setACL=function (aclObject) {
                if(typeof aclObject=='object' &&
                    typeof aclObject.toJSON=='function'){

                    var json=aclObject.toJSON();
                    if(json.others && json.roles && json.users){
                        this.set('ACL',json);
                    }
                }
                return this;
            }

            /**
             * Save object data in built.io server.
             * @param {Object} Callbacks object containing onSuccess, onError and always method for callbacks .
             * @name save
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.save= function (callback) {
                callback = callback || {};
                var me = this,
                    option = {};
                var prom=new Built.Promise();
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) {}
                    if (typeof data == "object" && typeof data.object !=="undefined") {
                        attributes = data.object;
                        object_uid = data.object.uid;
                        shadow = {};
                        prom.resolve(data.object,res);
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data.object, res);
                        }
                    } else {
                        prom.reject(data,res);
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                    if (typeof callback.onAlways == 'function') {
                        callback.onAlways(data, res);
                    }
                }
                option.class_uid = this.class_uid;
                if (object_uid) {
                    option.object_uid = object_uid;
                }
                if (emptyJSON(shadow) == false) {
                    if (typeof object_uid == 'string' && object_uid.length > 0) {
                        shadow.published=true;
                        rest.object.update(Headers, { object: shadow }, cb, option);
                    } else {
                        rest.object.create(Headers, { object: shadow }, cb, option);
                    }
                } else {
                    if (typeof callback.onError == 'function') {
                        callback.onError({ error_message: 'No changes or attribute found' }, null);
                    }
                    throw new Error("No changes found");
                    return this;
                }
                return prom;
            }

            /**
             * Delete object from built.io server.
             * @param {Object} Callbacks object containing onSuccess, onError and always method for callbacks .
             * @name destroy
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.destroy= function (callback) {
                callback = callback || {};
                var me = this,
                    option = {};
                var prom=Built.Promise();
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) {}
                    if (typeof data == 'object' && typeof data.notice !== "undefined") {
                        object_uid = null;
                        attributes = {};
                        shadow = {};
                        prom.resolve(data,res);
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data, res);
                        }
                    } else {
                        prom.reject(data,res);
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                    if (typeof callback.onAlways == 'function') {
                        callback.onAlways(data, res);
                    }
                }
                option.class_uid = this.class_uid;
                if (object_uid) {
                    option.object_uid = object_uid;
                    rest.object.destroy(Headers, {}, cb, option);
                } else {throw new Error('No Object uid found') }
                return prom;

            }

            /**
             * Get Schema of Class in which this object is belong to.
             * @param {Object} Callbacks Hash Map Object contains callbacks onSuccess,onError etc.
             * @name getSchema
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.getSchema= function (callback) {
                callback = callback || {};
                var prom=new Built.Promise();
                /*var calls_=(function(cb,prm,me){
                 return function(){
                 _getSchema(cb,prm,me);
                 }
                 })(callback,prom,this);*/
                //asyncIt(calls_);
                asyncIt(_getSchema,callback,prom,this);
                return prom;
            }
            var _getSchema=function(callback,prom,me){
                if (Built.Util.dataType(_schema) == 'array') {
                    prom.resolve(_schema);
                    if(typeof callback.onSuccess=='function'){
                        callback.onSuccess(_schema);
                    }
                    return prom;
                }
                var option = {},
                    oldCb = callback.onSuccess,
                    cb = function (data, res) {
                        try { data = JSON.parse(data) } catch (e) {}
                        if (typeof data == 'object' && data['class']) {
                            _schema = data['class'].schema;
                            prom.resolve(_schema,res) ;
                            if (typeof oldCb == 'function') {
                                oldCb(data['class'].schema, res);
                            }
                        } else {
                            prom.reject(_schema,res) ;
                            if (typeof callback.onError == 'function') {
                                callback.onError(data, res);
                            }
                        }
                        if (typeof callback.onAlways == 'function') {
                            callback.onAlways(data, res);
                        }
                    }
                callback.onSuccess = cb;
                option.class_uid = me.class_uid;
                rest['class'].fetch(Headers, {}, cb, option);
            }

            /**
             * Check attribute exist in object data.
             * @param {String} Key attribute name.
             * @name has
             * @memberOf Built.Object
             * @function
             * @return {Boolean} Boolean
             */
            this.has= function (key) {
                return hasOwnProperty.call(attributes, key);
            }
            /**
             * Get particular property in object data.
             * @param {String} property name.
             * @name get
             * @memberOf Built.Object
             * @function
             * @return {Object|String} FieldValue
             */
            this.get= function (key) {
                if (key) {
                    return attributes[key];
                } else { return undefined }
            }

            /**
             * Set UID in empty initialized object model to make connection with existing object in built.io server.
             * @param {String} UID Object uid.
             * @name setUid
             * @memberOf Built.Object
             * @function
             * @return {Built.Object} Returns the object, so you can chain this call.
             */
            this.setUid= function (id) {
                if (typeof id == 'string') {
                    object_uid = id;
                }
                return this;
            }
            /**
             * Create clone of object Model.
             * @name clone
             * @memberOf Built.Object
             * @function
             * @return {Object} new Object Model.
             */
            this.clone= function () {
                return new this.constructor(attributes);
            }
            /**
             * Check object model is new or existing in Built.io server.
             * @name isNew
             * @memberOf Built.Object
             * @function
             * @return {Boolean} True OR False.
             */
            this.isNew= function () {
                return !object_uid;
            }
            /**
             * Return JSON representation of object data.
             * @name toJSON
             * @memberOf Built.Object
             * @function
             * @return {Object} JSON object of object attributes.
             */
            this.toJSON= function () {
                return Built.Util.clone(attributes);
            }

            this.initialize.apply(this, arguments);
        }

        /**
         * Built.Object extender, Extend Built.Object with custom methods and parameters.
         * @constructs
         * @param {String} ClassUid Uid of object already created in Built.io to make connection to existing object (optional) OR .
         * @return {Object} Model Object .
         */
        Built.Object.extend = function (args) {
            if (typeof args == 'string') { args = { class_uid: args }; return extend.call(Built.Object, args) }
            return extend.apply(Built.Object, arguments);
        }

    })(Built);


/////////////////////////////////////////////////       Built.ACL                /////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
         * ACL class to set ACL for an objects and roles.
         * @name Built.ACL
         * @class
         */
        Built.ACL = function (jsonACL) {
            var acl={
                    others:{},
                    users:[],
                    roles:[]
                },
                self=this;
            if (jsonACL !=='undefined') {
                if(Built.Util.dataType(jsonACL)!='object'){
                    try{jsonACL=JSON.parse(jsonACL)}catch(e){}
                }
                if(Built.Util.dataType(jsonACL)=='object'){
                    if(jsonACL.others){
                        acl.others=jsonACL.others;
                    }
                    if(jsonACL.users){
                        acl.users=jsonACL.users;
                    }
                    if(jsonACL.roles){
                        acl.roles=jsonACL.roles;
                    }
                }else{

                }
            }

            this.__getAccess=function(accessor,accessType,UID){
                if(typeof accessor ==='undefined' ||
                    typeof accessType ==='undefined' ||
                    typeof UID ==='undefined'){return}
                // eg: getAccess('users','update',hsdjgsyuserID);
                var acc=acl[accessor];
                for(var i=0,j=acc.length;i<j;i++){
                    if(acc[i].uid &&
                        acc[i].uid==UID &&
                        acc[i][accessType] &&
                        acc[i][accessType]==true){

                        return true;
                    }
                }
                return false;
            }
            this.__setAccess=function(accessor,accessType,UID,allowed){
                if(typeof accessor ==='undefined' ||
                    typeof accessType ==='undefined' ||
                    typeof UID ==='undefined'||
                    typeof allowed ==='undefined'){return}
                // eg: getAccess('users','update',hsdjgsyuserID,true);
                if(Built.Util.dataType(allowed)=='boolean' && UID){
                    var acc=acl[accessor];
                    for(var i=0,j=acc.length;i<j;i++){
                        if(acc[i].uid && acc[i].uid==UID){
                            acc[i][accessType]=allowed;
                            return;
                        }
                    }
                    var newPush={};
                    newPush.uid=UID;
                    newPush[accessType]=allowed;
                    acl[accessor].push(newPush);
                }
                return self;
            }
            this.__getd= function() {
                Built.Util.clone(acl);
            }
        }

        Built.Util.extend(Built.ACL.prototype, /** @lends Built.ACL.prototype */{
            /**
             * Get whether the public is allowed to read this object.
             * @return {Boolean} Boolean value
             */
            getPublicReadAccess:function () {
                if(acl.others.read){return true}
                return false;
            },
            /**
             * Get whether the public is allowed to update this object.
             * @return {Boolean} Boolean value
             */
            getPublicWriteAccess:function () {
                if(acl.others.update){return true}
                return false;
            },
            /**
             * Get whether the public is allowed to delete this object.
             * @return {Boolean} Boolean value
             */
            getPublicDeleteAccess:function () {
                if(acl.others['delete']){return true}
                return false;
            },
            /**
             * Get whether the given user uid is allowed to read this object.
             * @param {String} UserUID User's uid.
             * @return {Boolean} Boolean value
             */
            getUserReadAccess:function (userId) {
                return this.__getAccess('users','read',userId);
            },
            /**
             * Get whether the given user uid is allowed to update this object.
             * @param {String} UserUID User's uid.
             * @return {Boolean} Boolean value
             */
            getUserWriteAccess: function (userId) {
                return this.__getAccess('users','update',userId);
            },
            /**
             * Get whether the given user uid is allowed to delete this object.
             * @param {String} UserUID User's uid.
             * @return {Boolean} Boolean value
             */
            getUserDeleteAccess: function (userId) {
                return this.__getAccess('users','delete',userId);
            },
            /**
             * Get whether users belonging to the given role are allowed to read this object.
             * @param {String} roleUID Role uid.
             * @return {Boolean} Boolean value
             */
            getRoleReadAccess: function (roleId) {
                return this.__getAccess('roles','read',roleId);
            },
            /**
             * Get whether users belonging to the given role are allowed to update this object.
             * @param {String} roleUID Role uid.
             * @return {Boolean} Boolean value
             */
            getRoleWriteAccess: function (roleId) {
                return this.__getAccess('roles','update',roleId);
            },
            /**
             * Get whether users belonging to the given role are allowed to delete this object.
             * @param {String} roleUID Role uid.
             * @return {Boolean} Boolean value
             */
            getRoleDeleteAccess: function (roleId) {
                return this.__getAccess('roles','delete',roleId);
            },
            /**
             * Set whether the public is allowed to read this object.
             * @param {Boolean} Boolean Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setPublicReadAccess:function (boolean) {
                if(Built.Util.dataType(boolean)=='boolean'){
                    acl.others.read=true;
                }
                return this;
            },
            /**
             * Set whether the public is allowed to update this object.
             * @param {Boolean} Boolean Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setPublicWriteAccess:function (boolean) {
                if(Built.Util.dataType(boolean)=='boolean'){
                    acl.others.update=true;
                }
                return this;
            },
            /**
             * Set whether the public is allowed to delete this object.
             * @param {Boolean} Boolean Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setPublicDeleteAccess:function (boolean) {
                if(Built.Util.dataType(boolean)=='boolean'){
                    acl.others['delete']=true;
                }
                return this;
            },
            /**
             * Set whether the given user uid is allowed to read this object.
             * @param {String} userUID User's uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setUserReadAccess: function (userId,allowed) {
                return this.__setAccess('users','read',userId,allowed);
            },
            /**
             * Set whether the given user uid is allowed to update this object.
             * @param {String} userUID User's uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setUserWriteAccess: function (userId,allowed) {
                return this.__setAccess('users','update',userId,allowed);
            },
            /**
             * Set whether the given user uid is allowed to delete this object.
             * @param {String} userUID User's uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setUserDeleteAccess: function (userId,allowed) {
                return this.__setAccess('users','delete',userId,allowed);
            },
            /**
             * Set whether users belonging to the given role are allowed to read this object.
             * @param {String} roleUID Role uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setRoleReadAccess: function (roleId,allowed) {
                return this.__setAccess('roles','read',roleId,allowed);
            },
            /**
             * Set whether users belonging to the given role are allowed to update this object.
             * @param {String} roleUID Role uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setRoleWriteAccess: function (roleId,allowed) {
                return this.__setAccess('roles','update',roleId,allowed);
            },
            /**
             * Set whether users belonging to the given role are allowed to delete this object.
             * @param {String} roleUID Role uid.
             * @param {Boolean} allowed Boolean.
             * @return Object Built.ACL object, so you can this call.
             */
            setRoleDeleteAccess: function (roleId,allowed) {
                return this.__setAccess('roles','delete',roleId,allowed);
            },
            /**
             * Return JSON Object of the ACL.
             * @return Object JSON Object.
             */
            toJSON: function(){
                return this.__getd();
            }
        });

    })(Built);

/////////////////////////////////////////////////       Built.Query              ///////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
         * Get new instance of Built.Query.
         * @name Built.Query
         * @param {String} ClassUid Init Built.Query with class uid.
         * @return Built.Query Object Instance.
         * @class
         */
        Built.Query = function (className) {
            if (typeof className != 'string') { throw new Error("Class UID required") }
            var class_uid = className;
            var __cache=null;
            var self = this,
                _skip = 0,
                _where = {},
                _queryable = {},
                _regex = {},
                _limit = -1,
                _include = [],
                _schema = false,
                _count = false,
                _unpublished = false,
                _Filter = {},
                _refWhere = {},
                _refRegex = {},
                _only = {},
                _except = {};

            var _getKey = function (str) {
                switch (str) {
                    case "where":
                        return _where;
                        break;
                    case "queryable":
                        return _queryable;
                        break;
                    case "include":
                        return _include;
                        break;
                    case "regex":
                        return _regex;
                        break;
                    case "Filter":
                        return _Filter;
                        break;
                    case "refwhere":
                        return _refWhere;
                        break;
                    case "refregex":
                        return _refRegex;
                        break;
                    case "only":
                        return _only;
                        break;
                    case "except":
                        return _except;
                        break;
                }
            }
            var _setter = function (key, condition, value, operate) {
                if (!_getKey(operate)[key]) { _getKey(operate)[key] = {} }
                _getKey(operate)[key][condition] = value;
                return this;
            }
            var _toQueryString = function () {
                var json = {}
                if (emptyJSON(_Filter) == false) {
                    for (var i in _Filter) {
                        if (_Filter[i] != "") {
                            json[i] = _Filter[i];
                        }
                    }
                }
                if (_skip && parseInt(_skip) > 0) { json.skip = _skip }
                if (emptyJSON(_where) == false) { json.where = _where }
                if (emptyJSON(_queryable) == false) { json.queryable = _queryable }
                if (emptyJSON(_regex) == false) { json.regex = _regex }
                if (_limit && parseInt(_limit) > 0) { json.limit = _limit }
                if (Built.Util.dataType(_include) == 'array' && _include.length > 0) { json.include = _include }
                if (_schema) { json.include_schema = _schema }
                if (_count) { json.include_count = _count }
                if (_unpublished) { json.include_unpublished = _unpublished }
                if (emptyJSON(_refWhere) == false) { json.ref_where = _refWhere }
                if (emptyJSON(_refRegex) == false) { json.ref_regex = _refRegex }
                if (emptyJSON(_only) == false) { json.only = _only }
                if (emptyJSON(_except) == false) { json.except = _except }
                return json;
            }
            this.__toObjectModel__ = function (objects, class_id) {
                class_id = class_uid || class_id;
                if (!class_id) { throw new Error("Class UID required") }
                var modelProto = Built.Object.extend(class_id), collection = [], model;
                if (Built.Util.dataType(objects) == 'array') {
                    for (var i = 0, j = objects.length; i < j; i++) {
                        if (typeof objects[i] == 'object' && objects[i].uid && typeof objects[i].uid == 'string') {
                            collection[collection.length] = new modelProto(objects[i]);
                        }
                    }
                    return collection;
                } else if (Built.Util.dataType(objects) == 'object') {
                    if (typeof objects == 'object' && objects.uid && typeof objects.uid == 'string') {
                        model = new modelProto(objects);
                        return model;
                    }
                    return null;
                } else { return null; }
            }
            this.Cache={
                onlyNetwork:function(){
                    __cache="only_network";
                    return self;
                },
                onlyCache:function(){
                    __cache="only_cache";
                    return self;
                },
                cacheElseNetwork:function(){
                    __cache="cache_else_network";
                    return self;
                },
                networkElseCache:function(){
                    __cache="network_else_cache";
                    return self;
                },
                cacheThenNetwork:function(){
                    __cache="cache_then_network";
                    return self;
                }
            }

            var cacheResponse=function(options,cacheStr,inst,promi,thenCall){
                var base_64=Base64.encode(cacheStr);
                var res=Store.get(base_64);
                if(res){
                    try{
                        res=JSON.parse(res);
                        if(typeof options.model !== 'undefined' && options.model==false){
                            promi.__resolve(res,null);
                            if(typeof options.onSuccess=='function'){
                                options.onSuccess(res,null);
                            }
                        }else{
                            var obj=typeof res.objects!=='undefined'?
                                res.objects:
                                (typeof res.object !=='undefined')?
                                    res.object:res;
                            promi.__resolve(inst.__toObjectModel__(obj,inst.class_uid),null);
                            if(typeof options.onSuccess=='function'){
                                options.onSuccess(inst.__toObjectModel__(obj,inst.class_uid),null);
                            }
                        }
                    }catch(e){
                        if(typeof options.onError=='function'){
                            options.onError({error_message:"no cache found"},null);
                        }
                    }
                }else{
                    if(typeof options.onError=='function'){
                        options.onError({error_message:"no cache found"},null);
                    }
                }
                if(typeof thenCall!=='undefined'){thenCall()}
            }

            /**
             * Execute the Query.
             * @param {Object} Options Optional Hash map for options and callbacks eg:-  {onSuccess:function(data){}}.
             * @name exec
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.exec= function (options) {
                if (typeof class_uid != 'string') { throw new Error("Class UID required") }
                options = options || {}
                var me = this,
                    option = {},
                    opt = options.query || _toQueryString(),
                    _cache_ = __cache?__cache:_Cache;
                option.class_uid = options.class_uid || class_uid;
                var cacheStr=JSON.stringify(Headers)+option.class_uid+JSON.stringify(opt);
                try { opt = JSON.parse(opt) } catch (e) { }
                //---------------------------------------------------
                var prom=new Built.Promise()
                prom.success=prom.done;
                delete prom.done;
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && typeof data.objects !=="undefined") {
                        if(_cache_ && _cache_ != "only_network"){
                            Store.set(Base64.encode(cacheStr),JSON.stringify(data));
                        }
                        if (typeof options.model !== 'undefined' && options.model == false) {
                            prom.resolve(data,res);
                            if (typeof options.onSuccess == 'function') {
                                options.onSuccess(data, res);
                            }
                        } else {
                            var d;
                            if (data.schema) {
                                d = {
                                    schema:data.schema,
                                    objects:me.__toObjectModel__(data.objects)
                                };
                            }
                            if (data.count) {
                                d = d || {};
                                d.count = data.count;
                                if (typeof d.objects === "undefined") {
                                    d.objects = me.__toObjectModel__(data.objects);
                                }
                            }
                            if (typeof d != 'object' || typeof d.objects != 'object') {
                                d = me.__toObjectModel__(data.objects);
                            }
                            prom.resolve(d,res);
                            if (typeof options.onSuccess == 'function') {
                                options.onSuccess(d, res);
                            }
                        }
                    } else {
                        prom.reject(data,res);
                        if (typeof options.onError == 'function') {
                            options.onError(data, res);
                        }
                    }
                    if (typeof options.onAlways == 'function') {
                        options.onAlways(data, res);
                    }
                }
                //------------------------------------------
                var execute=function(){
                    rest.object.fetch(Headers,opt,cb,option);
                }
                var errorObj=options.onError||function(){};
                /** @private */
                options.onError=function(data,res){
                    prom.reject(data,res);
                    errorObj(data,res) ;
                }
                //------------------------------------------
                if(_cache_==="only_cache"){
                    asyncIt(cacheResponse,options,cacheStr,me,prom);
                }
                else if(_cache_==="cache_else_network"){
                    /** @private */
                    options.onError=function(){
                        /** @private */
                        options.onError=function(data,res){
                            prom.reject(data,res);
                            errorObj(data,res) ;
                        }
                        execute();
                    }
                    asyncIt(cacheResponse,options,cacheStr,me,prom);
                }
                else if(_cache_==="network_else_cache"){
                    var errorObj=options.onError;
                    /** @private */
                    options.onError=function(){
                        /** @private */
                        options.onError=function(data,res){
                            prom.reject(data,res);
                            errorObj(data,res) ;
                        }
                        cacheResponse(options,cacheStr,me)	;
                    }
                    execute();
                }
                else if(_cache_==="cache_then_network"){
                    asyncIt(cacheResponse,options,cacheStr,me,prom,execute);
                }
                else{
                    execute();
                }
                return prom;
            }

            /**
             * The where method allows to filter object for a matching field value in your object.<br/>
             * Nested searches for embedded objects are possible, by using a "." seperator
             * @param {String} Key  Field Uid.
             * @param {String} Value Value.
             * @name where
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.where= function (key, val) {
                if (key && val) {
                    _getKey('where')[key] = val;
                }
                return this;
            }
            /**
             * The "referenceWhere" parameter allows you to query a reference.<br/>
             * Using this, you can query references which are seperated by a ".". <br/>
             * For example, if "Post" has a reference to "Comments", and comments have a reference to "User"<br/>
             * referenceWhere("comment.user.name","John");
             * @param {String} Key Reference Key Uid.
             * @param {String} Value Value.
             * @name referenceWhere
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.referenceWhere= function (key, val) {
                if (key && val) {
                    _getKey('refwhere')[key] = val;
                }
                return this;
            }
            /**
             * The "refRegex" is the same as "refWhere", but here we take a regular expression for the reference search. <br/>
             * For example, if "Post" has a reference to "Comments", and comments have a reference to "User"<br/>
             * referenceRegex("comment.user.name","^Jo");
             * @param {String} Key Reference Key Uid.
             * @param {String} Value Regex Value.
             * @name referenceRegex
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.referenceRegex= function (key, val) {
                if (key && val) {
                    _getKey('refregex')[key] = val;
                }
                return this;
            }


            /**
             * Sets the number of results to skip before returning any results.
             * This is useful for pagination.
             * Default is to skip zero results.
             * @param {Number} n the number of results to skip.
             * @name skip
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.skip= function (number) {
                if (Built.Util.dataType(number) == 'number' && parseInt(number) >= 0) {
                    //this.__s__('skip', number);
                    _skip=number;
                }
                return this;
            }
            /**
             * Sets the limit of the number of results to return.
             * @param {Number} n the number of results to limit to.
             * @name limit
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.limit= function (number) {
                if (Built.Util.dataType(number) == 'number' && parseInt(number) > 0) {
                    //this.__s__('limit', number);
                    _limit=number;
                }
                return this;
            }
            /**
             * Add Class schema in Query result.
             * @name includeSchema
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.includeSchema= function () {
                //this.__s__('schema', 'true');
                _schema=true;
                return this;
            }
            /**
             * Add Count of all objects in Query result.
             * @name includeCount
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.includeCount= function () {
                //this.__s__('count', 'true');
                _count=true;
                return this;
            }
            /**
             * Returned objects Model will also contain a key "_owner", which will include the owner's profile in the objects' data.
             * @name includeUser
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.includeUser= function () {
                _getKey('Filter')['include_user'] = 'true';
                return this;
            }
            /**
             * Returned filter results before specified Uid.
             * @param {String} ObjectUid  .
             * @name beforeUid
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.beforeUid= function (UID) {
                if (Built.Util.dataType(UID) == 'string') {
                    _getKey('Filter')['before_uid'] = UID;
                }
                return this;
            }
            /**
             * Returned filter results after specified Uid.
             * @param {String} ObjectUid  .
             * @name afterUid
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.afterUid= function (UID) {
                if (Built.Util.dataType(UID) == 'string') {
                    _getKey('Filter')['after_uid'] = UID;
                }
                return this;
            }

            /**
             * Add Drafts objects in Query search context.
             * @name includeDrafts
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.includeDrafts= function () {
                //this.__s__('unpublished', 'true');
                _unpublished=true;
                return this;
            }
            /**
             * Return only Drafts objects in Query search context.
             * @name onlyDrafts
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.onlyDrafts= function () {
                this.includeDrafts();
                this.includeFilter('published', 'false');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * be not equal to the provided value.
             * @param {String} key The key to check.
             * @param value The value that must not be equalled.
             * @name notEqualTo
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.notEqualTo= function (key, value) {
                _setter(key, "$ne", value, 'queryable');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * be less than the provided value.
             * @param {String} key The key to check.
             * @param {Number} value The value that provides an upper bound.
             * @name lessThan
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.lessThan= function (key, value) {
                _setter(key, "$lt", value, 'queryable');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * be greater than the provided value.
             * @param {String} key The key to check.
             * @param {Number} value The value that provides an lower bound.
             * @name greaterThan
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.greaterThan= function (key, value) {
                _setter(key, "$gt", value, 'queryable');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * be less than or equal to the provided value.
             * @param {String} key The key to check.
             * @param {Number} value The value that provides an upper bound.
             * @name lessThanOrEqualTo
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.lessThanOrEqualTo= function (key, value) {
                _setter(key, "$lte", value, 'queryable');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * be greater than or equal to the provided value.
             * @param {String} key The key to check.
             * @param {Number} value The value that provides an lower bound.
             * @name greaterThanOrEqualTo
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.greaterThanOrEqualTo= function (key, value) {
                _setter(key, "$gte", value, 'queryable');
                return this;
            }

            /**
             * Add a constraint to the query that requires a particular key's value to
             * be contained in the provided list of values.
             * @param {String} key The key to check.
             * @param {Array} values The values that will match.
             * @name containedIn
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.containedIn= function (key, values) {
                _setter(key, "$in", values, 'queryable');
                return this;
            }
            /**
             * Add a constraint to the query that requires a particular key's value to
             * not be contained in the provided list of values.
             * @param {String} key The key to check.
             * @param {Array} values The values that will not match.
             * @name notContainedIn
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.notContainedIn= function (key, values) {
                _setter(key, "$nin", values, 'queryable');
                return this;
            }
            /**
             * Add a constraint for finding objects that contain the given key.
             * @param {String} key The key that should exist.
             * @name exists
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.exists= function (key) {
                _setter(key, "$exists", true, 'queryable');
                return this;
            }
            /**
             * Add a constraint for finding objects that do not contain a given key.
             * @param {String} key The key that should not exist
             * @name doesNotExist
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.doesNotExist= function (key) {
                _setter(key, "$exists", false, 'queryable');
                return this;
            }
            /**
             * Add a regular expression constraint for finding string values that match
             * the provided regular expression.
             * This may be slow for large datasets.
             * @param {String} key The key that the string to match is stored in.
             * @param {RegExp} regex The regular expression pattern to match.
             * @name matches
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.matches= function (key, regex, modifiers) {
                if (key && regex) {
                    var mod;
                    if (Built.Util.dataType(modifiers) == 'array') {
                        mod = modifiers.join('');
                        try { mod = mod.toLowerCase() } catch (e) { }
                    }
                    if (mod && mod.length > 0) { regex = '(?' + mod + ')' + regex }
                    _getKey('regex')[key] = regex;
                }
                return this;
            }
            /**
             * Include Referenced Built.Objects for the provided key.  You can use dot
             * notation to specify which fields in the included object are also fetch.
             * @param {String} key The name of the key to include.
             * @name include
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.include= function (key) {
                if (Built.Util.dataType(key) == 'array') {
                    for (var i = 0, j = key.length; i < j; i++) {
                        _getKey('include').push(key[i]);
                    }
                } else {
                    _getKey('include').push(key);
                }
                return this;
            }
            /**
             * The "only" parameter specifies an uid's that would be included in the response
             * @param {String} Field_uid uid of the field to include in response.
             * @param {Boolean} Reference Whether Field is reference type or not. Default(false).
             * @name only
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.only= function (key, reference) {
                if (reference) {
                    if (!_getKey('only')['reference_uid']) { _getKey('only')['reference_uid'] = [] }
                    _getKey('only')['reference_uid'].push(key);
                } else {
                    if (!_getKey('only')['BASE']) { _getKey('only')['BASE'] = [] }
                    _getKey('only')['BASE'].push(key);
                }
                return this;
            }
            /**
             * The "except" parameter specifies an uid's of field that would NOT be included in the response
             * @param {String} Field_uid uid of the field to include in response.
             * @param {Boolean} Reference Whether Field is reference type or not. Default(false).
             * @name except
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.except= function (key, reference) {
                if (reference) {
                    if (!_getKey('except')['reference_uid']) { _getKey('except')['reference_uid'] = [] }
                    _getKey('except')['reference_uid'].push(key);
                } else {
                    if (!_getKey('except')['BASE']) { _getKey('except')['BASE'] = [] }
                    _getKey('except')['BASE'].push(key);
                }
                return this;

            }
            /**
             * Include custom query in key value string
             * @param {String} Key Query name to include.
             * @param {String} Value Query value to include.
             * @name includeFilter
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.includeFilter= function (key, val) {
                if (typeof key == 'string' && typeof val == 'string') {
                    _getKey('Filter')[key] = val;
                }
                return this;
            }

            /**
             * Sort Query result in ascending order by specific key field
             * @param {String} Key Field uid.
             * @name ascending
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.ascending= function (key) {
                if (typeof key == 'string') {
                    _getKey('Filter')['asc'] = key;
                }
                return this;
            }
            /**
             * Sort Query result in descending order by specific key field
             * @param {String} Key Field uid.
             * @name descending
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.descending= function (key) {
                if (typeof key == 'string') {
                    _getKey('Filter')['desc'] = key;
                }
                return this;
            }
            /**
             * Get total count of object fits in query without
             * notation to specify which fields in the included object are also fetch.
             * @param {Object} Object Containing onSuccess,onError and always method.
             * @name count
             * @memberOf Built.Query
             * @function
             * @return {Built.Query} Returns the query, so you can chain this call.
             */
            this.count= function (callback) {
                callback = callback || {};
                if (typeof class_uid == 'string' && class_uid.length > 0) {
                    var headers,
                        me = this,
                        option = {};
                    var cb = function (data, res) {
                        try { data = JSON.parse(data) } catch (e) {}
                        if (typeof data == 'object' && typeof data.objects !== "undefined") {
                            if (typeof callback.onSuccess == 'function') {
                                callback.onSuccess(data.objects, res);
                            }
                        } else {
                            if (typeof callback.onError == 'function') {
                                callback.onError(data, res);
                            }
                        }
                        if (typeof callback.onAlways == 'function') {
                            callback.onAlways(data, res);
                        }
                    }
                    option.class_uid = class_uid;
                    var d = opt = _toQueryString() || {};
                    d.count = true;
                    rest.object.fetch(Headers, d, cb, option);
                } else {
                    if (typeof callback == 'object' && typeof callback.onError == 'function') { callback.onError({ error_message: 'incomplete parameters' }) }
                }
                return this;
            }
        }
    })(Built);


////////////////////////////////////////////////        Built.Role               ////////////////////////////////////////////////

    (function(root){
        var Built = root;
        /**
         * Get new instance of Built.Role.
         * @name Built.Role
         * @return Built.Role Object Instance.
         * @class
         */
        Built.Role=function () {
            this.__roles=[];
        }

        Built.Util.extend(Built.Role.prototype,/** @lends Built.Role.prototype*/{
            /**
             * Fetch all roles .
             * @param {Object} Options containing onSuccess , onError callbacks and other options.
             * @return {Built.Role} Returns the object, so you can chain this call.
             */
            fetchRoles:function (options) {
                var url=urls.Base +'/'+urls.classes+'/'+urls.role;
                var self=this;
                url=serailiseURL(url);
                var nQ=new Built.Query('built_io_application_user_role');
                nQ.includeUser();
                nQ.exec({model:false,
                    onSuccess:function(data,res){
                        try{data=JSON.parse(data)}catch(e){}
                        self.__roles=data.objects || [];
                        if(typeof options.onSuccess=='function'){
                            options.onSuccess(data.objects,res);
                        }
                    },
                    onError:options.onError
                })
                return this;
            },
            /**
             * Create new role .
             * @param {String} RoleName roleName.
             * @return {RoleObject} Returns the RoleObject Model, containing resource functions for creating role.
             */
            create: function(roleName) {
                if(typeof roleName !='string'){throw new Error("RoleName required")}
                var role={
                    name:roleName,
                    roles:[],
                    users:[]
                }
                return new roleObject(role);
            },
            /**
             * Get specific role.
             * @param {String} RoleName roleName.
             * @return {RoleObject} Returns the RoleObject Model.
             */
            get: function (roleName) {
                if(typeof roleName !='string'){throw new Error("RoleName required")}
                var self=this;
                for(var i=0;i<self.__roles.length;i++){
                    var item=self.__roles[i];
                    if(typeof item=='object' && item.name==roleName){
                        return self.create(item);
                    }
                }
                return null;
            },
            /**
             * Check whether roleName exist in application.
             * @param {String} RoleName roleName.
             * @return {Boolean} Boolean value.
             */
            has: function (roleName) {
                if(typeof roleName !='string'){throw new Error("RoleName required")}
                var self=this;
                for(var i=0;i<self.__roles.length;i++){
                    var item=self.__roles[i];
                    if(typeof item=='object' && item.name==roleName){
                        return true;
                    }
                }
                return false;
            },
            /**
             * Get count of roles created by user.
             * @return {Number} Number Count
             */
            count: function () {
                return this.__roles.length;
            }

        });

        var roleObject=function (roleJSON) {
            var attrib={};
            if(typeof roleJSON !== 'object' ||
                typeof roleJSON.name ==='undefined' ||
                typeof roleJSON.roles ==='undefined' ||
                typeof roleJSON.users ==='undefined'){throw new Error("Incorrect Object")}
            attrib=roleJSON;
            this.addUSer=function(user){
                if(typeof user=='object'){
                    if(user.uid){
                        attrib.push(user.uid);
                    }
                }else if(typeof user=='string'){
                    attrib.push(user);
                }
            }
            this.removeUser=function(user){
                var uid;
                if(typeof user=='object'){
                    if(user.uid){
                        uid=user.uid;
                    }
                }else if(typeof user=='string'){
                    uid=user;
                }
                if(uid){
                    for(var i=0;i<attrib.users.length;i++){
                        if(user.uid == attrib.users[i]){
                            attrib.users.splice(i,1);
                        }
                    }
                }
            }
            this.addRole=function(roleName){
                var uid;
                if(typeof roleName=='object'){
                    if(roleName.uid){
                        uid=roleName.uid;
                    }
                }else if(typeof user=='string'){
                    uid=roleName;
                }
                if(uid){
                    for(var i=0;i<attrib.roles.length;i++){
                        if(roleName.uid == attrib.roles[i]){
                            return;
                        }
                    }
                    attrib.roles.push(uid);
                }
            }
            this.removeRole=function(roleName){
                var uid;
                if(typeof roleName=='object'){
                    if(roleName.uid){
                        uid=roleName.uid;
                    }
                }else if(typeof user=='string'){
                    uid=roleName;
                }
                if(uid){
                    for(var i=0;i<attrib.roles.length;i++){
                        if(roleName.uid == attrib.roles[i]){
                            attrib.roles.splice(i,1);
                        }
                    }
                }
            }
            this.hasUser=function(user_uid){
                if(user_uid && attrib.users.indexOf(user_uid)>=0){return true}
                return false;
            }
            this.hasRole=function(roleName){
                if(user_uid && attrib.roles.indexOf(roleName)>=0){return true}
                return false;
            }
            this.getUsers=function(){
                return attrib.users;
            }
            this.getRoles=function(){
                return attrib.roles;
            }
            this.destroy=function(options){
                if(typeof attrib !=='object' || attrib.uid==='undefined'){throw new Error("role not found")}
                var url=urls.Base +'/' + urls.role;
                url=serailiseURL(url);
                options = options || {};
                var me = this,
                    option = {};
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) {}
                    if (typeof data == 'object' && typeof data.notice !== "undefined") {
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data, res);
                            attrib.uid = null;
                            attrib.users=[];
                            attrib.roles=[];
                        }
                    } else {
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                }
                option.class_uid = 'built_io_application_user_role';
                if (attrib.object_uid) {
                    option.object_uid = attrib.uid;
                    rest.object.destroy(Headers, {}, cb, option);
                } else { if (typeof callback.onError == 'function') { callback.onError({ error_message: 'No Object uid found' }) } }
            }
            this.save=function(options){
                if(typeof attrib !=='object' || attrib.roles==='undefined' || attrib.users==='undefined'){throw new Error("role not found")}
                options = options || {};
                var me = this,
                    option = {};
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) {}
                    if (typeof data == 'object' && typeof data.object !== "undefined") {
                        attrib=data.object;
                        if (typeof callback.onSuccess == 'function') {
                            callback.onSuccess(data.object, res);
                        }
                    } else {
                        if (typeof callback.onError == 'function') {
                            callback.onError(data, res);
                        }
                    }
                }
                option.class_uid = 'built_io_application_user_role';
                if (attrib.uid) {
                    option.object_uid = attrib.uid;
                }
                if (typeof attrib.uid == 'string' && attrib.uid.length > 0) {
                    rest.object.update(Headers, { object:{roles: attrib.roles,users:attrib.users}}, cb, option);
                } else {
                    rest.object.create(Headers, { object: attrib }, cb, option);
                }
                return this;
            }
        }

    })(Built);


////////////////////////////////////////////////        Built.Promise             //////////////////////////////////////////////////

    (function(root){
        var Built = root;
        /**
         * Create new instance of Built.Promise.
         * @name Built.Promise
         * @return Built.Promise Object Instance.
         * @constructor
         * @class
         */
        Built.Promise=function(){
            this.__s=[];
            this.__e=[];
            this.__d=null;
            this.__f=null;

            /** Add Done callbacks
             * @param {Function} Callback function.
             * @name done
             * @memberOf Built.Promise
             * @function
             * @return {Built.Promise} Built.Promise Object, so you can this call.
             */
            this.done=function(callback){
                if(typeof callback=='function'){
                    this.__s.push(callback);
                    if(this.__d){
                        callback.apply(this,this.__d);
                    };

                }
                return this;
            }
            /** Add Fail callbacks
             * @param {Function} Callback function.
             * @name fail
             * @memberOf Built.Promise
             * @function
             * @return {Built.Promise} Built.Promise Object, so you can this call.
             */
            this.fail=function(callback){
                if(typeof callback=='function'){
                    if(this.__f){
                        callback.apply(this,this.__f);
                        return this;
                    };
                    this.__e.push(callback);
                }
                return this;
            }
            /** Resolve promise
             * @param {Object|String|Number} Arguments for Done Callbacks function.
             * @name resolve
             * @memberOf Built.Promise
             * @function
             * @return {Built.Promise} Built.Promise Object, so you can this call.
             */
            this.resolve=function(){
                var self=this;
                self.__d=Array.prototype.slice.call(arguments);
                for(var i =0,j=self.__s.length;i<j;i++){
                    if(typeof self.__s[i]=='function'){
                        self.__s[i].apply(self,arguments);
                    }
                }
                self.__s=[];
                return this;
            }
            this.__resolve=function(){
                var self=this;
                self.__d=Array.prototype.slice.call(arguments);
                for(var i =0,j=self.__s.length;i<j;i++){
                    if(typeof self.__s[i]=='function'){
                        self.__s[i].apply(self,arguments);
                    }
                }
                return this;
            }
            /** Reject promise
             * @param {Object|String|Number} Arguments for Fail Callbacks function.
             * @name reject
             * @memberOf Built.Promise
             * @function
             * @return {Built.Promise} Built.Promise Object, so you can this call.
             */
            this.reject=function(){
                var self=this;
                this.__f=Array.prototype.slice.call(arguments);
                for(var i =0,j=self.__e.length;i<j;i++){
                    if(typeof self.__e[i]=='function'){
                        self.__e[i].apply(self,arguments);
                    }
                }
                self.__e=[];
                return this;
            }
            this.__reject=function(){
                var self=this;
                this.__f=Array.prototype.slice.call(arguments);
                for(var i =0,j=self.__e.length;i<j;i++){
                    if(typeof self.__e[i]=='function'){
                        self.__e[i].apply(self,arguments);
                    }
                }
                return this;
            }
        }
    })(Built);
////////////////////////////////////////////////        Built.Application         //////////////////////////////////////////////////
    //{TODO}
    (function(root){
        //var Built = root;
        /**
         * Get new instance of Built.Application.
         * @name Built.Application
         * @return Built.Application Object Instance.
         * @class
         */
        Built.Application={}

        /**
         * Get settings of application from built
         * @param {Object} Object JSON object for callbacks like onSuccess and others options.
         * @return {Object} Built.Application Object so you can chain this call.
         */
        Built.Application.getSettings= function (callback) {
			callback=callback||{};
			var cb=function(data,res){
				try{data=JSON.parse(data)}catch(e){}
				if(typeof data=="object" && typeof data.application !=="undefined"){
					if(typeof callback.onSuccess =="function"){
						callback.onSuccess(data, res);
					}
				}else{
					if(typeof callback.onError =="function"){
						callback.onError(data, res);
					}
				}
			}
            rest.app_setting.fetch(Headers,{include_application_variables:true},cb);
			return this;
        }
        /**
         * Get users in application .
         * @param {Object} Object JSON object for callbacks like onSuccess and others options.
         * @return {Object} Built.ApplicationUserQuery Object.
         */
        Built.Application.users= function (){
            return new Built.Query('built_io_application_user');
        }

    })(Built);


    ////////////////////////////////////////////////    Built.Cloud              //////////////////////////////////////////////////
    // {TODO}
    (function(root){
        return;
        //var Built = root;
        /**
         * Get new instance of Built.Cloud.
         * @name Built.Cloud
         * @return Built.Cloud Object Instance.
         * @class
         */
        Built.Cloud={}


        /**
         * Execute defined logic in cloud server .
         * @param {String} API-ID String id.
         * @param {Object} Object JSON object for callbacks like onSuccess and others options.
         * @return {Object} Built.Cloud Object so you can chain this call.
         */
        Built.Cloud.run= function (id,options){
            return this;
        }

        if(isNode){
            /**
             * Define logic in cloud server (only for NodeJs)
             * @param {String} API-ID String id eg: hello .
             * @param {Function} Logic eg: function(req,res){res.send("hello world")}.
             * @return {Object} Built.Application Object so you can chain this call.
             */
            Built.Cloud.define= function (id,options) {
                return this;
            }

            /**
             * Execute logic before saving date in built server (only for NodeJs).
             * @param {String} CLASS-UID String class id of built Application.
             * @param {Function} Function containing req (request) and res (response).
             * @return {Object} Built.Cloud Object so you can chain this call.
             */
            Built.Cloud.beforeSave= function (class_id,func){
                return this;
            }


            /**
             * Execute logic after saving date in built server (only for NodeJs).
             * @param {String} CLASS-UID String class id of built Application.
             * @param {Function} Function containing req (request) and res (response).
             * @return {Object} Built.Cloud Object so you can chain this call.
             */
            Built.Cloud.afterSave= function (class_id,func){
                return this;
            }

            /**
             * HTTP Request Module for cloud code (only for NodeJs).
             * @function
             * @return {Object} HTTP Object.
             */
            Built.Cloud.http= httpModule;
        }

    })(Built);


////////////////////////////////////////////////        Built.Analytics           //////////////////////////////////////////////////
    //{TODO}
    (function(root){
        var Built = root;
        /**
         * Get new instance of Built.Role.
         * @name Built.Analytics
         * @return Built.Analytics Object Instance.
         * @class
         */
        Built.Analytics={
            __lastPid:"",
            __superProp:{}
        }
        /**
         * Push analytics to built server
         * @param {String} Event_Uid Event Uid like login, logout, signup etc (Required).
         * @param {Object} Properties JSON Object for extra properties required for each event (Optional).
         * @param {Object} Callback JSON Object for Callbacks (Optional).
         * @param {String} Previous_Event_Uid for funneling purpose (Optional).
         * @return {Built.Analytics} Returns the object, so you can chain this call.
         */
        Built.Analytics.triggerEvent=function(eventUid,prop,callback,pId){
            if(eventUid){
                if(typeof prop=='function'){callback=prop}
                callback=callback||{}
                prop=prop||{};
                prop=Built.Util.mix(this.__superProp, prop);
                var prom=new Built.Promise();

                var cb=function(data,res){
                    try{data=JSON.parse(data)}catch(e){}
                    if(typeof data.notice !== "undefined"){
                        if(typeof callback.onSuccess=='function'){callback.onSuccess(data,res);prom.resolve(data,res)}
                    }else{
                        if(typeof callback.onError=='function'){callback.onError(data,res);prom.reject(data,res)}
                    }
                }
                if(typeof pId !== 'undefined'){this.__lastPid=pId}
                rest.as.triggerEvent(headers,prop,eventUid,cb,this.__lastPid);
                this.__lastPid=eventUid;

                return prom;//this;
            }else{throw new Error("event UID required")}
        }
        /**
         * Push analytics in batch to built server
         * @param {Array} Events contained JSON objects eg: [{eventId:'login',prop:{platform:"web"},previousId:"Previous event Uid"}] (Required).
         * @param {Object} Callback JSON Object for Callbacks (Optional).
         * @return {Built.Analytics} Returns the object, so you can chain this call.
         */
        Built.Analytics.triggerMultipleEvents=function(events,callback){
            return this;
        }
        /**
         * Set Global Properties for all Events
         * @param {Object} Properties contained JSON objects eg: {device:'android',region:'usa'} (Required).
         * @return {Built.Analytics} Returns the object, so you can chain this call.
         */
        Built.Analytics.superProperties=function(prop){
            if(Built.Util.dataType(prop)=='object'){
                this.__superProp=prop;
            }
            return this;
        }

    })(Built);

/////////////////////////////////////////////////       Built Rest api          /////////////////////////////////////////////////////

    var rest = {
        object: {
            create: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.classes + option.class_uid + urls.objects;
                    url = serailiseURL(url);
                    httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            fetch: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.classes + option.class_uid + urls.objects + (option.object_uid ? option.object_uid : "");
                    url = serailiseURL(url);
                    httpGet(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            update: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && option.object_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.classes + option.class_uid + urls.objects + option.object_uid;
                    url = serailiseURL(url);
                    httpPut(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            destroy: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && option.object_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.classes + option.class_uid + urls.objects + option.object_uid;
                    url = serailiseURL(url);
                    httpDelete(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } }
                return this;
            }
        },
        'class': {
            fetch: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.classes + option.class_uid;
                    url = serailiseURL(url);
                    httpGet(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } }
                return this;
            }
        },
        file: {
            upload: function (headers, data, callback, option) {
                headers = headers || {};
                option = option || {};
                if (option.class_uid && headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + urls.upload;
                    url = serailiseURL(url);
                    httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            }
        },
        user: {
            login: function (headers, data, callback, option) {
                headers = headers || {};
                if (headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + '/' + urls.login;
                    url = serailiseURL(url);
                    httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            logout: function (headers, data, callback, option) {
                headers = headers || {};
                if (headers.application_api_key && headers.application_uid && headers.authtoken) {
                    var url = urls.Base + '/' + urls.logout;
                    url = serailiseURL(url);
                    httpDelete(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            fetchUserInfo: function (headers, data, callback, option) {
                headers = headers || {};
                if (headers.application_api_key && headers.application_uid && headers.authtoken) {
                    var url = urls.Base + '/' + urls.getUserInfo;
                    url = serailiseURL(url);
                    httpGet(url, headers, {}, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            register: function (headers, data, callback, option) {
                headers = headers || {};
                if (headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + '/' + urls.user;
                    url = serailiseURL(url);
                    httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            },
            forgetPassword: function (headers, data, callback, option) {
                headers = headers || {};
                data = data || {};
                if (headers.application_api_key && headers.application_uid && data.application_user && data.application_user.email) {
                    var url = urls.Base + urls.forgetPassword;
                    url = serailiseURL(url);
                    return httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            }
        },
        as:{
            trigger:function(headers,data,eventUid,callback,pId){
                var url =  urls.Base+'/events/' + eventUid + '/trigger';
                url=serailiseURL(url);
                headers=headers||{};
                data=data||{};
                data={event:data};
                if(pId && pId !=""){data.previous_event_uid=pId}
                if (headers.application_api_key && headers.application_uid) {
                    return httpPost(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            }
        },
		app_setting:{
			fetch: function (headers, data, callback) {
                headers = headers || {};
				callback=callback||{};
                if (headers.application_api_key && headers.application_uid) {
                    var url = urls.Base + '/applications/'+headers.application_uid
                    url = serailiseURL(url);
                    httpGet(url, headers, data, callback);
                } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //onError
                return this;
            }
		}
    }

////////////////////////////////////////////////        Web HTTP Request        ////////////////////////////////////////////////////////////

    var httpPost = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'POST', callback);
    }
    var httpGet = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'GET', callback);
    }
    var httpDelete = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'DELETE', callback);
    }
    var httpPut = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'PUT', callback);
    }
    var ajaxWeb = function (url, headers, data, method, callback) {
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        if (typeof callback != 'function') { callback = function () { } }
        method = method.toUpperCase();
        data = data || {};
        headers = headers || {};
        if (typeof XDomainRequest !== 'undefined') {
            ajaxIE(url, headers, data, method, callback);
            return;
        }
        var http = new XMLHttpRequest();
        try{
            if (method != 'POST') {
                data['_method'] = method.toUpperCase();
                method = 'POST';
            }
            http.open(method, url, true);
            try{http.setRequestHeader('Content-Type', 'application/json') } catch (e) {throw e}
            if (Built.Util.dataType(headers) == 'object') {
                for (var k in headers) {
                    http.setRequestHeader(k, headers[k]);
                }
            }
            data = JSON.stringify(data);
            /**@private*/
            http.onreadystatechange = function (e) {
                if (http.readyState == 4 && http.status != 0) {
                    callback(http.responseText, http);
                } else if (http.readyState == 4 && http.status == 0) {
                    try{data=JSON.parse(data)}catch(e){}
                    var _method=data['_method'];
                    try{delete data._method}catch(e){}
                    fallbackAjaxIE(url, headers, data, _method, callback);
                }
            }
            /**@private*/
            http.ontimeout = function (e) {
                var ret = { error_message: 'error timeout', http: http, event: e };
                callback(ret, http);
            }
            /**@private*/
            http.onerror = function (e) {
                var ret = { error_message: 'error http client', http: http, event: e };
                callback(ret, http);
            }
            http.send(data);
        }catch(e){
            try{data=JSON.parse(data)}catch(e){}
            var _meth=data['_method'];
            try{delete data._method}catch(e){}
            fallbackAjaxIE(url, headers, data, method, callback);
        }
    }
    var ajaxIE = function (url, headers, data, method, callback) {
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        method = method.toUpperCase();
        data = data || {};

        var callId=random();
        if(typeof Built.callbackTray !="object"){Built.callbackTray={}}

        var xdr = new XDomainRequest();
        try{
            for (var k in headers) {
                xdr.setRequestHeader(k, headers[k]);
            }
            xdr.setRequestHeader('Content-Type', 'application/json');
            xdr.onload = function () {
                var response;
                try { response = JSON.parse(xdr.responseText) } catch (e) { response=xdr.responseText}
                callback(response, xdr);
            };
            xdr.ontimeout = function (e) {
                callback({ error_message: 'error timeout', event: e, http: xdr }, xdr);
            };
            xdr.onerror = function (e) {
                callback({ error_message: 'error http client', event: e, http: xdr }, xdr);
            };
            if (method != 'POST') {
                data['_method'] = method.toUpperCase();
                method = 'POST';
            }
            try { data = JSON.stringify(data) } catch (e) { }
            xdr.onprogress = function () { };
            xdr.open(method, url);
            xdr.send(data);
        }catch(e){
            fallbackAjaxIE(url, headers, data, method, callback);
        }
    }
    var fallbackAjaxIE=function(url, headers, data, method, callback){
        var randNum=random().toString();
        if(typeof Built.cbTray !="object"){Built.cbTray={}}
        Built.cbTray[randNum]=callback;
        var frame=makeIframe(url, headers, data, method,randNum);
        var mdf=makeDataForm(url, headers, data, method,randNum);
        mdf.submit();
    }
    var makeIframe=function(url, headers, data, method,rand){
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        method = method.toUpperCase();
        var callFrame=cr_frame('frame_'+rand);
        callFrame.setAttribute("width", "0");
        callFrame.setAttribute("height", "0");
        callFrame.setAttribute("style", "display:none");
        document.body.appendChild(callFrame);
        return callFrame;
    }
    var makeDataForm=function(url, headers, data, method,rand){
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        method = method.toUpperCase();
        var form =document.createElement('form');
        form.setAttribute('id','form_'+rand);
        form.setAttribute("target", 'frame_'+rand);
        form.setAttribute("method", "post");
        //form.setAttribute("enctype", "multipart/form-data");
        //form.setAttribute("encoding", "multipart/form-data");
        if(url.charAt(url.length-1)=='/'){url=url.substring(0,url.length-1)}
        url=url+'.postmessage';
        url=url.replace('https://','http://');
        form.setAttribute("action",url);
        for(var i in headers){
            try{
                form.appendChild(cr_input(i.toString().toUpperCase(),headers[i]));
            }catch(e){}
        }
        data = data || {};
        var d=(typeof data=='object'?JSON.stringify(data):data);
        form.appendChild(cr_input("PARAM",d));
        form.appendChild(cr_input("postmessage_payload",rand));
        form.appendChild(cr_input("_method",method));
        form.appendChild(cr_input("host",(document.location.origin?document.location.origin:(document.location.protocol+"//"+document.location.host))));
        document.body.appendChild(form);
        return form;
    }
    var cr_frame=function( name) {
        var frame;
        try {
            frame = document.createElement('<iframe name="' + name + '" id="' + name + '" />');
        } catch(e) {
            frame = document.createElement("iframe");
            frame.id=name;
            frame.name = name;
        }
        return frame;
    }
    var cr_input=function( name, val ) {
        var inp;
        try {
            inp = document.createElement('<input type="hidden" name="' + name + '" />');
        } catch(e) {
            inp = document.createElement("input");
            inp.type = "hidden";
            inp.name = name;
        }
        inp.value = val;
        return inp;
    }
    var postMessageHook=function(){
        var listener=function(e){
            var data=(e.data?e.data:e.message);
            try{
                data=JSON.parse(data);
            }catch(e){
                //{TODO} error handling
            }
            if(typeof data=='object'){
                var cid=data.postmessage_payload;
                try {delete data['postmessage_payload']}catch(e){}
                if(typeof Built.cbTray[cid]=='function'){
                    try{data=JSON.parse(data)}catch(e){}
                    Built.cbTray[cid](data,{});
                    try{delete Built.cbTray[cid]}catch(e){}
                    try{
                        var ele = document.getElementById("frame_"+cid);
                        ele.parentNode.removeChild(ele);
                    }catch(e){}
                    try{
                        var elem = document.getElementById("form_"+cid);
                        //var yy=document.getElementById('yyyy');
                        //var xx=document.getElementById('xxxx');
                        try{xx.parentNode.insertBefore(yy,xx)}catch(e){}
                        elem.parentNode.removeChild(elem);
                    }catch(e){}
                }else{}
            }else{}
        }
        if (typeof window.addEventListener !== "undefined"){window.addEventListener("message", listener, false)}
        else {window.attachEvent("onmessage", listener)}

    }
    if(isNode==false){postMessageHook()}
//////////////////////////////////////////////          Node HTTP Module        //////////////////////////////////////////////////////////////

    var ajaxNode = function (url, headers, data, method, callback) {
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        headers = headers || {}
        method = method.toUpperCase();
        data = data || {};
        if (emptyJSON(queryString) == false) {
            var qS = Built.Util.param(queryString);
            url += '?' + qS;
        }
        if (method != 'POST') {
            data['_method'] = method.toUpperCase();
            method = 'POST';
        }
        headers['Content-Type'] = "application/json";
        data = JSON.stringify(data);
        return httpModule.post(url, { headers: headers, data: data }).on('complete', function (retData, response) {
            callback(retData, response);
        });
    }

/////////////////////////////////////////////      ----------Web Upload-------------     /////////////////////////////////////////////////////////

    var uploadFileWeb = function (url, headers, data, callback, options) {
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        headers = headers || {};
        options = options || {};
        callback = callback || function () { };
        if(typeof window=="object" && typeof window.FormData !=="undefined"){
            var http = new XMLHttpRequest(),
                formd;
            if (data instanceof FormData) { formd = data }
            else if (Built.Util.dataType(data) == 'element') {
                formd = new FormData();
                if (data.getAttribute('type') == 'file' && data.getAttribute('name')) {
                    formd.append("upload[upload]", data.files[0]);
                } else {
                    callback({ error_message: "Input File Element Required" }, null);
                    throw new Error("Input File Element Required");
                }
            } else {
                callback({ error_message: "HTML Input File Element or FormData Required for upload" }, null);
                throw new Error("HTML Input File Element or FormData Required for upload");
            }
            if (options.tags) { formd.append("upload[tags]", options.tags) }
            http.open('POST', url, true);
            if (Built.Util.dataType(headers) == 'object') {
                for (var k in headers) {
                    http.setRequestHeader(k, headers[k]);

                }
            }
            if (typeof callback == 'function') {
                /**@private*/
                http.onreadystatechange = function (e) {
                    if (http.readyState == 4 && http.status != 0) {
                        callback(http.responseText, http);
                    } else if (http.readyState == 4 && http.status == 0) {
                        fallbackUploadFileWeb(url, headers, data, callback, options);
                    }
                }
            }
            /**@private*/
            http.ontimeout = function (e) {
                var ret = { error_message: 'error occured', http: http, event: e };
                callback(http.responseText, http, ret);
            }
            http.onerror = http.ontimeout
            http.send(formd);

        }else{
            fallbackUploadFileWeb(url, headers, data, callback, options);
        }

    }

    var uploadWeb = function (url, headers, data, callback, options) {
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        callback = callback || {};
        var cb = function (d, res) {
            try { d = JSON.parse(d) } catch (e) { }
            if (typeof d == 'object' && typeof d.notice !== "undefined") {
                if (typeof callback.onSuccess == 'function') {
                    callback.onSuccess(d.upload, res);
                }
            } else {
                if (typeof callback.onError == 'function') {
                    callback.onError(d, res);
                }
            }
            if (typeof callback.onAlways == 'function') {
                callback.onAlways(d, res);
            }
        }
        uploadFileWeb(url, headers, data, cb, options);
    }

    var fallbackUploadFileWeb=function(url, headers, data, callback, options){
        if(typeof data[0] !=="undefined"){data=data[0]}
        if (Built.Util.dataType(data) == 'element') {
            if (data.getAttribute('type') == 'file') {
                var cloneElm=data.cloneNode();
                data.style.display="none";
                data.parentNode.insertBefore(cloneElm,data);
                var method="POST";
                var randNum=random().toString();
                if(typeof Built.cbTray !="object"){Built.cbTray={}}
                Built.cbTray[randNum]=callback;
                var frame=makeIframe(url, headers, data, method,randNum);
                var mdf=makeUploadForm(url, headers, data, method,randNum);
                mdf.submit();
            } else {
                callback({ error_message: "Input File Element Required" }, null);
                throw new Error("Input File Element Required");
            }
        } else {
            callback({ error_message: "HTML Input File Element or FormData Required for upload" }, null);
            throw new Error("HTML Input File Element or FormData Required for upload");
        }
    }
    var makeUploadForm=function(url, headers, data, method,rand){
        if(urls.host =="" || typeof urls.host !=="string" || urls.host.length<=0){
            throw new Error("Set host for built server first. eg: Built.setURL('built.io')");
            return;
        }
        method = method.toUpperCase();
        var form =document.createElement('form');
        form.setAttribute('id','form_'+rand);
        form.setAttribute("target", 'frame_'+rand);
        form.setAttribute("method", "post");
        form.setAttribute("height","0");
        form.setAttribute("width","0");
        form.setAttribute("style","display:none");
        form.setAttribute("enctype", "multipart/form-data");
        form.setAttribute("encoding", "multipart/form-data");
        if(url.charAt(url.length-1)=='/'){url=url.substring(0,url.length-1)}
        url=url+'.postmessage';
        url=url.replace('https://','http://');
        form.setAttribute("action",url);
        for(var i in headers){
            try{form.appendChild(cr_input(i.toString().toUpperCase(),headers[i]))}catch(e){}
        }
        data.setAttribute('name',"upload[upload]");
        form.appendChild(data);
        form.appendChild(cr_input("postmessage_payload",rand));
        form.appendChild(cr_input("host",(document.location.origin?document.location.origin:(document.location.protocol+"//"+document.location.host))));
        document.body.appendChild(form);
        return form;
    }
    if (isNode) { ajaxMethod = ajaxNode } else { ajaxMethod = ajaxWeb }
    var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(a){var c,d,e,f,g,h,i,b="",j=0;for(a=Base64._utf8_encode(a);a.length>j;)c=a.charCodeAt(j++),d=a.charCodeAt(j++),e=a.charCodeAt(j++),f=c>>2,g=(3&c)<<4|d>>4,h=(15&d)<<2|e>>6,i=63&e,isNaN(d)?h=i=64:isNaN(e)&&(i=64),b=b+this._keyStr.charAt(f)+this._keyStr.charAt(g)+this._keyStr.charAt(h)+this._keyStr.charAt(i);return b},decode:function(a){var c,d,e,f,g,h,i,b="",j=0;for(a=a.replace(/[^A-Za-z0-9\+\/\=]/g,"");a.length>j;)f=this._keyStr.indexOf(a.charAt(j++)),g=this._keyStr.indexOf(a.charAt(j++)),h=this._keyStr.indexOf(a.charAt(j++)),i=this._keyStr.indexOf(a.charAt(j++)),c=f<<2|g>>4,d=(15&g)<<4|h>>2,e=(3&h)<<6|i,b+=String.fromCharCode(c),64!=h&&(b+=String.fromCharCode(d)),64!=i&&(b+=String.fromCharCode(e));return b=Base64._utf8_decode(b)},_utf8_encode:function(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;a.length>c;c++){var d=a.charCodeAt(c);128>d?b+=String.fromCharCode(d):d>127&&2048>d?(b+=String.fromCharCode(192|d>>6),b+=String.fromCharCode(128|63&d)):(b+=String.fromCharCode(224|d>>12),b+=String.fromCharCode(128|63&d>>6),b+=String.fromCharCode(128|63&d))}return b},_utf8_decode:function(a){for(var b="",c=0,d=c1=c2=0;a.length>c;)d=a.charCodeAt(c),128>d?(b+=String.fromCharCode(d),c++):d>191&&224>d?(c2=a.charCodeAt(c+1),b+=String.fromCharCode((31&d)<<6|63&c2),c+=2):(c2=a.charCodeAt(c+1),c3=a.charCodeAt(c+2),b+=String.fromCharCode((15&d)<<12|(63&c2)<<6|63&c3),c+=3);return b}};
    var Store={
        get:function(id){
            if(typeof localStorage !=='undefined'){
                return localStorage.getItem(id) || null;
            }else{return null}
        },
        set:function(id,value){
            if(typeof localStorage !=='undefined' && id && value){
                return localStorage.setItem(id,value)
            }else{return null}
        }
    }
    if ( typeof define === "function" && define.amd) {
        define( "Built", [], function () { return Built; } );
    }
})(this);

