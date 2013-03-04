 /*!
 * Built JavaScript SDK
 * Version: 1.0.0
 * Built: Wed Feb 22 2013 17:40:25
 * http://www.built.io
 * Copyright 2012 Raw Engineering, Inc.
 * The Built JavaScript SDK is freely distributable under the MIT license.
 */

 /*global document: false, window: false, navigator: false, localStorage: false, XMLHttpRequest: false, XDomainRequest: false, exports: false, print:false */
(function () {
    /** 
    * Contains all Built API classes and functions.
    * @name Built
    * @namespace
    * @author Pradeep Mishra, Raw Engineering, Inc (www.raweng.com)
    * @version 1.0.0
    * @see Built.init
    * Contains all Built API classes and functions.
    */
    var that = this,
    urls = {
        Base: 'https://code-bltdev.cloudthis.com/v3/',
        register: '/application/users',
        login: '/application/users/login/',
        logout: '/application/users/logout/',
        user: '/application/users/',
        getUserInfo: '/application/users/current/',
        classes: '/classes/',
        objects: '/objects/',
        upload: '/uploads/',
        version: '/v3/',
        host: 'code-bltdev.cloudthis.com',
        proto: 'https://'
    }, Built, appUserInfo = null, ajaxMethod, httpModule;
    if (typeof exports !== 'undefined') { Built = exports; httpModule = require('restler'); }
    else { Built = that.Built = {} }
    Built.VERSION = '1.0.0';
    if ((typeof window !== 'undefined' && typeof window.console !== 'undefined') || typeof console !== 'undefined') { var print = function () { console.log.apply(console, arguments) } } else { print = function () { } }
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
    * Call this method first to Initialze Built with your application tokens for built.io
    * You can get your keys from <a href="https://manage.built.io" target="_blank">https://manage.built.io</a> website.
    * @param {String} appKey Your Built Application API Key.
    * @param {String} appUid Your Built Application UID.
    */
    Built.init = function (apiKey, appUid) {
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
    /**
    *Set the common headers for built.io rest calls .
    * @param {String} Key like extraHeaders .
    * @param {String} Value like hello OR .
    * @param {Object} JSON object with multiple headers like ({extraHeaders:"hello"}) .
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
    *Set the base URL for built.io .
    * @param {String} Path path for built.io server like http://api.built.io/v1.
    */
    Built.setBaseURL = function (str) {
        if (str.indexOf('http://') || str.indexOf('https://')) {
            urls.Base = str;
            return true;
        } else { return false }
    };
    /**
    *Set the host for built.io .
    * @param {String} HostName Host for built.io server like api.built.io.
    * @param {String} Protocol  Protocol for built.io server connection like https.
    * @param {String} Version built io API version like v1 .
    * @return {Built} Return Built object for chain call .
    */
    Built.setURL = function (host, proto, version) {
        if (host) { urls.host = host }
        if (proto.indexOf('https') >= 0) { urls.proto = "https://" }
        else if (proto.indexOf('http') >= 0) { urls.proto = "http://" }
        if (version) { urls.version = ('/' + version + '/') }
        urls.Base = serailiseURL(urls.proto + urls.host + urls.version);
        return this;
    };

    Built.addQueryString = function (key, val) {
        if (typeof key == 'string' && typeof val == 'string') {
            if (val == "" && queryString[key]) { delete queryString[key]; return; }
            queryString[key] = val;
        }
    };

    //////////////////////////////////////////////          Built.Util                   ////////////////////////////////////////////////////
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
            } else { throw "Object parameters required for parallal tasks" }
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
            else if (x == "[object Array]") { return 'array' }
            else if (x == "[object Object]" || x == "[object Function]") { return 'object' }
            else if (x == "[object Number]" || isNaN(arg) == false && arg != "") { return 'number' }
            else if (x == "[object String]") { return 'string' }
            else if (x.indexOf('Element') >= 0) { return 'element' }
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


    ////////////////////////////////////////////            Built.File              ///////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
        * File Class to upload binaries to built.io.
        * @name Built.File
        * @class
        */
        Built.File = {}
        Built.File.upload = function (uploads, callback) {
            if (Built.Util.dataType(uploads) != 'object') { throw "Object required in parameters" }
            var cb = function (err, results) {
                if (err) {
                    if (typeof callback.fail == 'function') {
                        callback.fail(err);
                    }
                } else {

                }
            }
            var pUpload = {}
            for (var i in uploads) {
                pUpload[i] = {};
            }

        }
        Built.File._uploadHelper = function (uploads, callback) {
            if (Built.Util.dataType(uploads) != 'object') { throw "Object required in parameters" }
            var pUpload = {}
            for (var i in uploads) {
                pUpload[i] = {};
            }
        }

        var fileUploader = function (callback) {

        }
        var _formData = function (json) {
            if (Built.Util.dataType(json) != 'object') { throw "JSON Object required in parameter" }
            var form = new FormData();
            for (var i in json) {
                if (Built.Util.dataType(json[i]) == 'element') {
                    var element = json[i];
                    if (element.tagName == 'FORM') { return new FormData(element) }
                    else {
                        if (element.getAttribute('type') == 'file') {
                            for (var fileLen = 0; fileLen < element.files.length; fileLen++) {
                                form.append(i, element.files[fileLen]);
                            }
                        }
                    }
                } else { }
            }
            return form;
        }
    })(Built);



    ////////////////////////////////////////////            Built.User              ///////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
        * User Class to loing , logout, register users in application.
        * @name Built.User
        * @class
        */
        Built.User = {}
        /**
        * Login Built.io Application user .
        * @param {String} Email Email-id registered.
        * @param {String} Password Password.
        * @param {Object} Options containing callbacks and other info ({success:function(){}}) .
        * @return {Built.User} Return Built.User object for chain call .
        */
        Built.User.login = function (email, pass, option) {
            option = option || {};
            if (typeof email == 'string' && typeof pass == 'string') {
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && data.application_user) {
                        appUserInfo = data.application_user;
                        Headers['authtoken'] = data.application_user.authtoken;
                        if (typeof option.success == 'function') {
                            option.success(data.application_user, res);
                        }
                    } else {
                        if (typeof option.fail == 'function') {
                            option.fail(data, res);
                        }
                    }
                }
                var data = { application_user: { email: email, password: pass} }
                rest.user.login(Headers, data, cb, {});
            }else{throw "Email and Password"}
            return this;
        }
        /**
        * Log Out Built.io Application user .
        * @param {Object} Options containing callbacks and other info ({success:function(){}}) .
        * @return {Built.User} Return Built.User object for chain call.
        */
        Built.User.logout = function (option) {
            option = option || {};
            if (appUserInfo != null & typeof appUserInfo == 'object' && appUserInfo.authtoken) {
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && data.notice) {
                        appUserInfo = null;
                        if (Headers['authtoken']) { delete Headers['authtoken'] }
                        if (typeof option.success == 'function') {
                            option.success(data, res);
                        }
                    } else {
                        if (typeof option.fail == 'function') {
                            option.fail(data, res);
                        }
                    }
                }
                rest.user.logout(Headers, {}, cb, {});
            } else {
                if (typeof option.fail == 'function') {
                    option.fail({ error_message: "No user found" }, null)
                }
            }
            return this;

        }
        /**
        * Remove Built.io authtoken from built SDK incase of it become invalid.
        * @param {Object} Options containing callbacks and other info ({success:function(d,r){}}) .
        * @return {Built.User} Return Built.User object for chain call.
        */
        Built.User.removeAuthtoken = function () {
            if (Headers['authtoken']) {
                appUserInfo = null;
                delete Headers['authtoken'];
            }
            return this;
        }
        /**
        * Register/Create New user in built.io Application .
        * @param {Object} UserInfo JSON object containing user info .<br/>
        *  UserInfo object contains following parameters:<br/><b>
        *  {<br/>email: required,<br/>password:required,<br/>password_confirmation:required,<br/>username:optional,<br/>
        *  first_name:optional,<br/>last_name:optional,<br/>anydata:anyvalue<br/>}</b>
        * @param {Object} Options containing callbacks (success,fail) and other info ({success:function(d,r){}}) .
        * @return {Built.User} Return Built.User object for chain call.
        */
        Built.User.register = function (options, callback) {
            options = options || {}
            callback = callback || {}
            if ((options.email && options.password && options.password_confirmation) || options.auth_data) {
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && data.notice) {
                        if (typeof callback.success == 'function') {
                            callback.success(data, res);
                        }
                    } else {
                        if (typeof callback.fail == 'function') {
                            callback.fail(data, res);
                        }
                    }
                },
                data = { application_user: options }
                rest.user.register(Headers, data, cb, {});
            } else {
                if (typeof callback.fail == 'function') {
                    callback.fail({ error_message: "Provide required parameters: email, password, password_confirmation OR auth_data" }, null);
                }
            }
            return this;
        }
        /**
        * Deactivate application user in built.io Application.<br/>
        * authentcation required
        * @param {Object} Options containing callbacks (success,fail) .like: {success:function(d,r){}} .
        * @return {Built.User} Return Built.User object for chain call.
        */
        Built.User.deactivate = function (options) {
            options = options || {}
            if (Headers['authtoken']) {
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && data.notice) {
                        appUserInfo = null;
                        if (Headers['authtoken']) { delete Headers['authtoken'] }
                        if (typeof options.success == 'function') {
                            options.success(data, res);
                        }
                    } else {
                        if (typeof options.fail == 'function') {
                            options.fail(data, res);
                        }
                    }
                }
                rest.user.deactivate(Headers, {}, cb, {});
            } else {
                if (typeof options.fail == 'function') {
                    options.fail({ error_message: "authenticated session required" }, null);
                }
            }
            return this;
        }
        /**
        * Check whether user is already logged in or had a authtoken.
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
            if (appUserInfo != null && typeof appUserInfo == 'object' && appUserInfo['authtoken'] && appUserInfo['email']) { return appUserInfo }
            return null;
        }
        /**
        * Fetch Logged In user's all information from built server.
        * @return {Object} Return Built.User object for chain call.
        */
        Built.User.fetchUserInfo = function (option) {
            option = option || {};
            if (Headers['authtoken']) {
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { }
                    if (typeof data == 'object' && data.application_user) {
                        var au = appUserInfo.authtoken || Headers['authtoken'];
                        appUserInfo = data.application_user;
                        appUserInfo.authtoken = au;
                        if (typeof option.success == 'function') {
                            option.success(appUserInfo, res);
                        }
                    } else {
                        if (typeof option.fail == 'function') {
                            option.fail(data, res);
                        }
                    }
                }
                rest.user.fetchUserInfo(Headers, {}, cb, {});
            } else {
                if (typeof option.fail == 'function') {
                    option.fail({ error_message: "No authtoken found" }, null);
                }
            }
            return this;
        }

    })(Built);




    /////////////////////////////////////////////           Built.Object              //////////////////////////////////////////////////

    (function (root) {
        var Built = root;
        /**
        * Object Class.
        * @name Built.Object
        * @class
        * @see Built.Object.extend
        */
        Built.Object = function (attrbs) {
            if (typeof this.class_uid != 'string') { throw "Class UID required" }
            this.attributes = {};
            this.object_uid = null;
            this.shadow = {};
            this._schema = null;
            if (typeof attrbs == 'string') { attrbs = { uid: attrbs, attributes: { uid: attrbs}} }
            if (Built.Util.dataType(attrbs) == 'object') {
                if (attrbs.uid) {
                    this.object_uid = attrbs.uid
                    this.attributes = Built.Util.clone(attrbs);
                }
            }
            this.initialize.apply(this, arguments);
        }
        Built.Util.extend(Built.Object.prototype, /** @lends Built.Object.prototype */{
        initialize: function () { },
        /**
        * Set Object data or property.
        * @param {String} Key or Property name .
        * @param {String} Value .
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        set: function (key, val) {
            if (typeof key == 'object') {
                this.shadow = Built.Util.mix(this.shadow, key);
            } else if (typeof key == 'string' && typeof val == 'string') {
                this.shadow[key] = val;
            }
            return this;
        },
        /**
        * Fetch object data from built.io server.
        * @param {Object} Callbacks object containing success, fail and always method for callbacks .
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        fetch: function (callback) {
            if (typeof this.class_uid == 'string' && this.class_uid.length > 0 && typeof this.object_uid == 'string' && this.object_uid.length > 0) {
                var headers,
                    me = this,
                    option = {};
                callback = callback || {};
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { print(e) }
                    if (typeof data == 'object' && data.object) {
                        if (typeof callback.success == 'function') {
                            me.attributes = data.object;
                            me.object_uid = data.object.uid;
                            me.shadow = {};
                            callback.success(data.object, res);
                        }
                    } else {
                        if (typeof callback.fail == 'function') {
                            callback.fail(data, res);
                        }
                    }
                }
                option.class_uid = this.class_uid;
                if (this.object_uid) { option.object_uid = this.object_uid }
                rest.object.fetch(Headers, {}, cb, option);
            } else {
                if (typeof callback.fail == 'function') { callback.fail({ error_message: 'incomplete parameters' }, null) }
                print('incomplete parameters');
            }
            return this;
        },
        /**
        * Save object data to built.io server.
        * @param {Object} Callbacks object containing success, fail and always method for callbacks .
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        save: function (callback) {
            callback = callback || {};
            var me = this,
                option = {};
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { print('intentionally', e) }
                if (typeof data == 'object' && data.object) {
                    if (typeof callback.success == 'function') {
                        me.attributes = data.object;
                        me.object_uid = data.object.uid;
                        me.shadow = {};
                        callback.success(data.object, res);
                    }
                } else {
                    if (typeof callback.fail == 'function') {
                        callback.fail(data, res);
                    }
                }
            }
            option.class_uid = this.class_uid;
            if (this.object_uid) {
                option.object_uid = this.object_uid;
            }
            if (emptyJSON(this.shadow) == false) {
                if (typeof this.object_uid == 'string' && this.object_uid.length > 0) {
                    console.log('updated', this.shadow);
                    rest.object.update(Headers, { object: this.shadow }, cb, option);
                } else {
                    rest.object.create(Headers, { object: this.shadow }, cb, option);
                }
            } else { if (typeof callback.fail == 'function') { callback.fail({ error_message: 'No changes or attribute found' }, null) } }
            return this;
        },
        /**
        * Delete object from built.io server.
        * @param {Object} Callbacks object containing success, fail and always method for callbacks .
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        destroy: function (callback) {
            callback = callback || {};
            var me = this,
                option = {};
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { print(e) }
                if (typeof data == 'object' && data.notice) {
                    if (callback.success == 'function') {
                        callback.success(data, res);
                        this.object_uid = null;
                        this.attributes = {};
                        this.shadow = {};
                    }
                } else {
                    if (typeof callback.fail == 'function') {
                        callback.fail(data, res);
                    }
                }
            }
            option.class_uid = this.class_uid;
            if (this.object_uid) {
                option.object_uid = this.object_uid;
                rest.object.destroy(Headers, {}, cb, option);
            } else { if (typeof callback == 'object' && typeof callback.fail == 'function') { callback.fail({ error_message: 'No Object uid found' }) } }

        },
        /**
        * Get Schema of Class in which this object is belong to.
        * @param {Object} Callbacks Hash Map Object contains callbacks success,fail etc.
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        getSchema: function (callback) {
            callback = callback || {};
            if (Built.Util.dataType(this._schema) == 'array') {
                callback.success(this._schema);
                return this;
            }
            var me = this,
            option = {},
            oldCb = callback.success,
            cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { print(e) }
                if (typeof data == 'object' && data.class) {
                    if (typeof callback.success == 'function') {
                        me._schema = data.class.schema;
                        oldCb(data.class.schema, res);
                    }
                } else {
                    if (typeof callback.fail == 'function') {
                        callback.fail(data, res);
                    }
                }
            }
            callback.success = cb;
            option.class_uid = this.class_uid;
            rest.class.fetch(Headers, {}, cb, option);
            return this;
        },
        /**
        * Check attribute exist in object data.
        * @param {String} Key attribute name.
        */
        has: function (key) {
            return hasOwnProperty.call(obj, key);
        },
        /**
        * Get particular property in object data.
        * @param {String} property name.
        */
        get: function (key) {
            if (key) {
                return this.attributes[key];
            } else { return "" }
        },
        /**
        * Set UID in empty initialized object model to make connection with existing object in built.io server.
        * @param {String} UID Object uid.
        * @return {Built.Object} Returns the object, so you can chain this call.
        */
        setUid: function (id) {
            if (typeof id == 'string') {
                this.object_uid = id;
            }
            return this;
        },
        /**
        * Create clone of object Model.
        * @return {Object} new Object Model.
        */
        clone: function () {
            return new this.constructor(this.attributes);
        },
        /**
        * Check object model is new or existing in Built.io server.
        * @return {Boolean} True OR False.
        */
        isNew: function () {
            return !this.object_uid;
        },
        /**
        * Return JSON representaion of object data.
        * @return {Object} JSON object of object attributes.
        */
        toJSON: function () {
            return Built.Util.clone(this.attributes);
        }
    });
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

} (Built));

////////////////////////////////////////////                Built.Query               ////////////////////////////////////////////////

(function (root) {
    var Built = root;
    /**
    * Get new instance of Built.Query.
    * @name Built.Query
    * @param ClassUid Init Built.Query with class uid.
    * @return Built.Query Object Instance.
    * @class
    */
    Built.Query = function (className) {
        if (typeof className != 'string') { throw "Class UID required" }
        this.class_uid = className;
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
        this.__s__ = function (str, val) {
            switch (str) {
                case "skip":
                    _skip = val;
                    break;
                case "limit":
                    _limit = val;
                    break;
                case "schema":
                    _schema = val;
                    break;
                case "count":
                    _count = val;
                    break;
                case "unpublished":
                    _unpublished = val;
                    break;
            }
        }
        this.__g__ = function (str) {
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
        this.__a__ = function (key, condition, value, operate) {
            if (!this.__g__(operate)[key]) { this.__g__(operate)[key] = {} }
            this.__g__(operate)[key][condition] = value;
            return this;
        }
        this.__q__ = function () {
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
        this.__toObjectModel__ = function (objects, class_uid) {
            class_uid = this.class_uid || class_uid;
            if (!class_uid) { throw "Class UID required" }
            var modelProto = Built.Object.extend(class_uid), collection = [], model;
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
        var historyStore = {};
        /**
        * Built Query.History Class to give user caching facility for Queries Made.
        * @name Built.Query.History
        * @class
        * @see Built.Query.History.get()
        * @see Built.Query.exec()
        */
        this.History = {
            /** @lends Built.Query.History.prototype*/
            set: function (id, objects, query, class_uid) {
                if (typeof id == 'string' && objects && query && class_uid) {
                    class_uid = class_uid || self.class_uid;
                    if (typeof object == 'object') { try { objects = JSON.stringify(objects) } catch (e) { } }
                    if (typeof query == 'object') { try { query = JSON.stringify(query) } catch (e) { } }
                    historyStore[id] = { id: id, class_uid: class_uid, objects: objects, query: query }
                    return true;
                } else { return false }
            },
            /**
            * Get Query cached result by id.
            * This is useful for pagination.
            * @param {String} Id Id given while executing Query.exec() method.
            * @param {Object} Options Hash map for options eg:-  {model:true,refresh:true,success:function(data){}}.
            * @return {Array} Returns the query result from cache if option refresh do not set.
            * @return {Built.Query} Returns the query, so you can chain this call.
            */
            get: function (id, options) {
                options = options || {};
                var rMod = options.model;
                options.model = false;
                if (historyStore[id]) {
                    if (typeof options.refresh != 'string' && options.refresh == true) {
                        var succ = options.success || function () { },
                                    cb = function (data, res) {
                                        if (typeof options.success == 'function') {
                                            var objs = data;
                                            if (typeof objs == 'object') { try { objs = JSON.stringify(objs) } catch (e) { } }
                                            historyStore[id].objects = objs;
                                            if (typeof rMod !== 'undefined' && rMod == false) { succ(data, res) }
                                            else { succ(self.__toObjectModel__(data, historyStore[id].class_uid), res) }
                                        }
                                    }
                        options.success = cb;
                        options.query = historyStore[id].query;
                        if (typeof options.query != 'object') { try { options.query = JSON.parse(options.query) } catch (e) { } }
                        options.class_uid = historyStore[id].class_uid;
                        var nq = new Built.Query(historyStore[id].class_uid);
                        nq.exec(options);
                        return self;
                    } else {
                        var objs = historyStore[id].objects;
                        if (typeof objs != 'object') { try { objs = JSON.parse(objs) } catch (e) { } }
                        if (typeof rMod !== 'undefined' && rMod == false) { return objs }
                        else { return self.__toObjectModel__(objs, historyStore[id].class_uid) }
                    }
                } else { return null }
            },
            g: function () {
                return historyStore;
            }
        }
    }
    Built.Query.prototype = {
        /**
        * Execute the Query and cache result (optional) by providing id. 
        * <br>Cache result can be get using Built.Query.History.get(id) .
        * @param {Object} Options Optional Hash map for options and callbacks eg:-  {id:'page1',success:function(data){}}.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        exec: function (options) {
            if (typeof this.class_uid != 'string') { throw "Class UID required" }
            options = options || {}
            var me = this,
                    option = {},
                    opt = options.query || this.__q__();
            //try{opt=JSON.stringify(opt)}catch(e){}
            option.class_uid = options.class_uid || me.class_uid;
            var cb = function (data, res) {
                try { data = JSON.parse(data) } catch (e) { }
                if (typeof data == 'object' && data.objects) {
                    if (typeof options.success == 'function') {
                        if (options.id && typeof options.id == 'string') {
                            me.History.set(options.id, JSON.stringify(data.objects), JSON.stringify(opt), me.class_uid);
                        }
                        if (typeof options.model !== 'undefined' && options.model == false) {
                            options.success(data, res);
                        } else { options.success(me.__toObjectModel__(data.objects), res); }
                    }
                } else {
                    if (typeof options.fail == 'function') {
                        options.fail(data, res);
                    }
                }
            }
            rest.object.fetch(Headers, opt, cb, option);
            return this;
        },
        /**
        * The where method allows to filter object for a matching field value in your object.<br/>
        * Nested searches for embedded objects are possible, by using a "." seperator
        * @param {String} Key  Field Uid.
        * @param {String} Value Value.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        where: function (key, val) {
            if (key && val) {
                this.__g__('where')[key] = val;
            }
            return this;
        },
        /**
        * The "referenceWhere" parameter allows you to query a reference.<br/> 
        * Using this, you can query references which are seperated by a ".". <br/>
        * For example, if "Post" has a reference to "Comments", and comments have a reference to "User"<br/>
        * referenceWhere("comment.user.name","John");
        * @param {String} Key Reference Key Uid.
        * @param {String} Value Value.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        referenceWhere: function (key, val) {
            if (key && val) {
                this.__g__('refwhere')[key] = val;
            }
            return this;
        },
        /**
        * The "refRegex" is the same as "refWhere", but here we take a regular expression for the reference search. <br/>
        * For example, if "Post" has a reference to "Comments", and comments have a reference to "User"<br/>
        * referenceRegex("comment.user.name","^Jo");
        * @param {String} Key Reference Key Uid.
        * @param {String} Value Regex Value.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        referenceRegex: function (key, val) {
            if (key && val) {
                this.__g__('refregex')[key] = val;
            }
            return this;
        },
        /**
        * Sets the number of results to skip before returning any results.
        * This is useful for pagination.
        * Default is to skip zero results.
        * @param {Number} n the number of results to skip.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        skip: function (number) {
            if (Built.Util.dataType(number) == 'number' && parseInt(number) >= 0) {
                this.__s__('skip', number);
            }
            return this;
        },
        /**
        * Sets the limit of the number of results to return.
        * @param {Number} n the number of results to limit to.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        limit: function (number) {
            if (Built.Util.dataType(number) == 'number' && parseInt(number) > 0 && parseInt(number) <= 30) {
                this.__s__('limit', number);
            }
            return this;
        },
        /**
        * Add Class schema in Query result.
        * @param {Boolean} Boolean .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        includeSchema: function (boolean) {
            if (Built.Util.dataType(boolean) == 'boolean') {
                this.__s__('schema', boolean);
            }
            return this;
        },
        /**
        * Add Count of all objects in Query result.
        * @param {Boolean} Boolean .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        includeCount: function (boolean) {
            if (Built.Util.dataType(boolean) == 'boolean') {
                this.__s__('count', boolean);
            }
            return this;
        },
        /**
        * Returned objects Model will also contain a key "_owner", which will include the owner's profile in the objects' data..
        * @param {Boolean} Boolean .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        includeUser: function (boolean) {
            if (Built.Util.dataType(boolean) == 'boolean') {
                this.__g__('Filter')['include_user'] = boolean;
            }
            return this;
        },
        /**
        * Returned filter results before specified Uid.
        * @param {String} ObjectUid  .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        beforeUid: function (UID) {
            if (Built.Util.dataType(UID) == 'string') {
                this.__g__('Filter')['before_uid'] = UID;
            }
            return this;
        },
        /**
        * Returned filter results after specified Uid.
        * @param {String} ObjectUid  .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        afterUid: function (UID) {
            if (Built.Util.dataType(UID) == 'string') {
                this.__g__('Filter')['after_uid'] = UID;
            }
            return this;
        },

        /**
        * Add Unpublished objects in Query search context.
        * @param {Boolean} Boolean .
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        includeUnpublished: function (boolean) {
            if (Built.Util.dataType(boolean) == 'boolean') {
                this.__s__('unpublished', boolean);
            }
            return this;
        },
        /**
        * Add a constraint to the query that requires a particular key's value to
        * be not equal to the provided value.
        * @param {String} key The key to check.
        * @param value The value that must not be equalled.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        notEqualTo: function (key, value) {
            this.__a__(key, "$ne", value, 'queryable');
            return this;
        },

        /**
        * Add a constraint to the query that requires a particular key's value to
        * be less than the provided value.
        * @param {String} key The key to check.
        * @param value The value that provides an upper bound.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        lessThan: function (key, value) {
            this.__a__(key, "$lt", value, 'queryable');
            return this;
        },
        /**
        * Add a constraint to the query that requires a particular key's value to
        * be greater than the provided value.
        * @param {String} key The key to check.
        * @param value The value that provides an lower bound.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        greaterThan: function (key, value) {
            this.__a__(key, "$gt", value, 'queryable');
            return this;
        },
        /**
        * Add a constraint to the query that requires a particular key's value to
        * be less than or equal to the provided value.
        * @param {String} key The key to check.
        * @param value The value that provides an upper bound.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        lessThanOrEqualTo: function (key, value) {
            this.__a__(key, "$lte", value, 'queryable');
            return this;
        },
        /**
        * Add a constraint to the query that requires a particular key's value to
        * be greater than or equal to the provided value.
        * @param {String} key The key to check.
        * @param value The value that provides an lower bound.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        greaterThanOrEqualTo: function (key, value) {
            this.__a__(key, "$gte", value, 'queryable');
            return this;
        },

        /**
        * Add a constraint to the query that requires a particular key's value to
        * be contained in the provided list of values.
        * @param {String} key The key to check.
        * @param {Array} values The values that will match.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        containedIn: function (key, values) {
            this.__a__(key, "$in", values, 'queryable');
            return this;
        },

        /**
        * Add a constraint to the query that requires a particular key's value to
        * not be contained in the provided list of values.
        * @param {String} key The key to check.
        * @param {Array} values The values that will not match.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        notContainedIn: function (key, values) {
            this.__a__(key, "$nin", values, 'queryable');
            return this;
        },
        /**
        * Add a constraint for finding objects that contain the given key.
        * @param {String} key The key that should exist.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        exists: function (key) {
            this.__a__(key, "$exists", true, 'queryable');
            return this;
        },
        /**
        * Add a constraint for finding objects that do not contain a given key.
        * @param {String} key The key that should not exist
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        doesNotExist: function (key) {
            this.__a__(key, "$exists", false, 'queryable');
            return this;
        },
        /**
        * Add a regular expression constraint for finding string values that match
        * the provided regular expression.
        * This may be slow for large datasets.
        * @param {String} key The key that the string to match is stored in.
        * @param {RegExp} regex The regular expression pattern to match.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        matches: function (key, regex, modifiers) {
            if (key && regex) {
                var mod;
                if (Built.Util.dataType(modifiers) == 'array') {
                    mod = modifiers.join('');
                    try { mod = mod.toLowerCase() } catch (e) { }
                }
                if (mod && mod.length > 0) { regex = '(?' + mod + ')' + regex }
                this.__g__('regex')[key] = regex;
            }
            return this;
        },
        /**
        * Include Referenced Built.Objects for the provided key.  You can use dot
        * notation to specify which fields in the included object are also fetch.
        * @param {String} key The name of the key to include.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        include: function (key) {
            if (Built.Util.dataType(key) == 'array') {
                for (var i = 0, j = key.length; i < j; i++) {
                    this.__g__('include').push(key[i]);
                }
            } else {
                this.__g__('include').push(key);
            }
            return this;
        },
        /**
        * The "only" parameter specifies an uid's that would be included in the response
        * @param {String} Field_uid uid of the field to include in response.
        * @param {Boolean} Reference Whether Field is reference type or not. Default(false).
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        only: function (key, reference) {
            if (reference) {
                if (!this.__g__('only')['reference_uid']) { this.__g__('only')['reference_uid'] = [] }
                this.__g__('only')['reference_uid'].push(key);
            } else {
                if (!this.__g__('only')['BASE']) { this.__g__('only')['BASE'] = [] }
                this.__g__('only')['BASE'].push(key);
            }
            return this;
        },

        /**
        * The "except" parameter specifies an uid's of field that would NOT be included in the response
        * @param {String} Field_uid uid of the field to include in response.
        * @param {Boolean} Reference Whether Field is reference type or not. Default(false).
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        except: function (key, reference) {
            if (reference) {
                if (!this.__g__('except')['reference_uid']) { this.__g__('except')['reference_uid'] = [] }
                this.__g__('except')['reference_uid'].push(key);
            } else {
                if (!this.__g__('except')['BASE']) { this.__g__('except')['BASE'] = [] }
                this.__g__('except')['BASE'].push(key);
            }
            return this;

        },
        /**
        * Include custom query in key value string
        * @param {String} Key Query name to include.
        * @param {String} Value Query value to include.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        includeFilter: function (key, val) {
            if (typeof key == 'string' && typeof val == 'string') {
                this.__g__('Filter')[key] = val;
            }
            return this;
        },
        /**
        * Sort Query result in ascending order by specific key field
        * @param {String} Key Field uid.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        ascending: function (Key) {
            if (typeof key == 'string') {
                this.__g__('Filter')['asc'] = Key;
            }
            return this;
        },
        /**
        * Sort Query result in descending order by specific key field
        * @param {String} Key Field uid.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        descending: function (Key) {
            if (typeof key == 'string') {
                this.__g__('Filter')['desc'] = Key;
            }
            return this;
        },
        /**
        * Get total count of object fits in query without 
        * notation to specify which fields in the included object are also fetch.
        * @param {Object} Object Containing success,fail and always method.
        * @return {Built.Query} Returns the query, so you can chain this call.
        */
        count: function (callback) {
            if (typeof this.class_uid == 'string' && this.class_uid.length > 0) {
                var headers,
                                me = this,
                                option = {};
                var cb = function (data, res) {
                    try { data = JSON.parse(data) } catch (e) { print(e) }
                    if (typeof data == 'object' && data.objects) {
                        if (typeof callback == 'object' && typeof callback.success == 'function') {
                            callback.success(data.objects, res);
                        }
                    } else {
                        if (typeof callback == 'object' && typeof callback.fail == 'function') {
                            callback.fail(data, res);
                        }
                    }
                }
                option.class_uid = this.class_uid;
                var d = opt = this.__q__() || {};
                d.count = true;
                rest.object.fetch(Headers, d, cb, option);
            } else {
                if (typeof callback == 'object' && typeof callback.fail == 'function') { callback.fail({ error_message: 'incomplete parameters' }) }
                print('incomplete parameters');
            }
            return this;
        }

    }

} (Built));


////////////////////////////////////////////                Built Rest api           /////////////////////////////////////////////////////


var rest = {
    object: {
        create: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.classes + option.class_uid + urls.objects;
                url = serailiseURL(url);
                httpPost(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        fetch: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.classes + option.class_uid + urls.objects + (option.object_uid ? option.object_uid : "");
                url = serailiseURL(url);
                httpGet(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        update: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && option.object_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.classes + option.class_uid + urls.objects + option.object_uid;
                url = serailiseURL(url);
                httpPut(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        destroy: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && option.object_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.classes + option.class_uid + urls.objects + option.object_uid;
                url = serailiseURL(url);
                httpDelete(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } }
            return this;
        }
    },
    class: {
        fetch: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.classes + option.class_uid;
                url = serailiseURL(url);
                httpGet(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } }
            return this;
        }
    },
    file: {
        upload: function (headers, data, callback, option) {
            if (headers && option && option.class_uid && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + urls.upload;
                url = serailiseURL(url);
                httpPost(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        }
    },
    user: {
        login: function (headers, data, callback, option) {
            if (headers && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + '/' + urls.login;
                url = serailiseURL(url);
                httpPost(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        logout: function (headers, data, callback, option) {
            if (headers && headers.application_api_key && headers.application_uid && headers.authtoken) {
                var url = urls.Base + '/' + urls.logout;
                url = serailiseURL(url);
                httpDelete(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        fetchUserInfo: function (headers, data, callback, option) {
            if (headers && headers.application_api_key && headers.application_uid && headers.authtoken) {
                var url = urls.Base + '/' + urls.getUserInfo;
                url = serailiseURL(url);
                httpGet(url, headers, {}, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        },
        register: function (headers, data, callback, option) {
            if (headers && headers.application_api_key && headers.application_uid) {
                var url = urls.Base + '/' + urls.user;
                url = serailiseURL(url);
                httpPost(url, headers, data, callback);
            } else { if (typeof callback == 'function') { callback({ error_message: 'provide all parameters' }) } } //fail
            return this;
        }
    }
}


//////////////////////////////////////////////////            HTTP Request            ///////////////////////////////////////////////////

var httpPost = function (url, headers, data, callback) {
    return ajaxMethod(url, headers, data, 'POST', callback);
},
    httpGet = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'GET', callback);
    },
    httpDelete = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'DELETE', callback);
    },
    httpPut = function (url, headers, data, callback) {
        return ajaxMethod(url, headers, data, 'PUT', callback);
    },
    ajaxWeb = function (url, headers, data, method, callback) {
        var http = ((window.XDomainRequest) ? new XDomainRequest() : new XMLHttpRequest()),
        method = (method || 'GET'),
        method = method.toUpperCase();
        data = data || {};
        if (method != 'POST') {
            data['_method'] = method.toUpperCase();
            method = 'POST';
        }
        http.open(method, url, true);
        if (!window.XDomainRequest) {
            try { http.setRequestHeader('Content-Type', 'application/json') }
            catch (e) { print('error occured while setting header') }
        }
        if (Built.Util.dataType(headers) == 'object') {
            for (var k in headers) {
                if (typeof http.setRequestHeader == 'function') {
                    http.setRequestHeader(k, headers[k]);
                } else {
                    try { data[k.toUpperCase()] = headers[k] } catch (e) { }
                }
            }
        }
        data = JSON.stringify(data);
        if (http.onreadystatechange !== 'undefined') {
            if (typeof callback == 'function') {
                http.onreadystatechange = function (e) {
                    if (http.readyState == 4 && http.status != 0) {
                        callback(http.responseText, http);
                    } else if (http.readyState == 4 && http.status == 0) {
                        var ret = { error_message: 'error occured', http: http, event: e };
                        http.onerror = http.ontimeout = null;
                        callback(http.responseText, http, ret);
                    }
                }
            }

        } else {
            if (typeof callback == 'function') {
                http.onload = function () { callback(http.responseText, http) }
            }
        }
        http.onerror = http.ontimeout = function (e) {
            var ret = { error_message: 'error occured', http: http, event: e };
            callback(http.responseText, http, ret);
        }
        http.send(data);
        return http;
    },

//////////////////////////////////////////////          Node HTTP Module        /////////////////////////////////////////////////////////

    ajaxNode = function (url, headers, data, method, callback) {
        var method = (method || 'GET');
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
        if (Built.Util.dataType(headers) == 'object') { headers['Content-Type'] = "application/json" }
        else { headers = { "Content-Type": "application/json"} }
        data = JSON.stringify(data);
        return httpModule.post(url, { headers: headers, data: data }).on('complete', function (retData, response) {
            callback(retData, response);
        });
    }

/////////////////////////////////////////////       End of Node HTTP Module     /////////////////////////////////////////////////////////


if (typeof exports !== 'undefined') { ajaxMethod = ajaxNode }
else { ajaxMethod = ajaxWeb }

}).call(this)

