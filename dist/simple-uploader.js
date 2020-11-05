/**
 * simple-uploader v3.0.0
 * https://github.com/mycolorway/simple-uploader
 *
 * Copyright Mycolorway Design
 * Released under the MIT license
 * https://github.com/mycolorway/simple-uploader/license.html
 *
 * Date: 2017-11-23
 */
;(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('jquery'),require('simple-module'));
  } else {
    root.SimpleUploader = factory(root.jQuery,root.SimpleModule);
  }
}(this, function ($,SimpleModule) {
var define, module, exports;
var b = require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"simple-uploader":[function(require,module,exports){
var SimpleUploader,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

SimpleUploader = (function(_super) {
  __extends(SimpleUploader, _super);

  SimpleUploader.count = 0;

  SimpleUploader.opts = {
    url: '',
    params: null,
    fileKey: 'upload_file',
    connectionCount: 3,
    locales: null,
    transformResponse: null
  };

  SimpleUploader.locales = {
    leaveConfirm: 'Are you sure you want to leave?'
  };

  function SimpleUploader(opts) {
    SimpleUploader.__super__.constructor.apply(this, arguments);
    this.opts = $.extend({}, SimpleUploader.opts, opts);
    this._locales = $.extend({}, SimpleUploader.locales, this.opts.locales);
    this.files = [];
    this.queue = [];
    this.uploading = false;
    this.id = ++SimpleUploader.count;
    this._bind();
  }

  SimpleUploader.prototype._bind = function() {
    this.on('uploadcomplete', (function(_this) {
      return function(e, file) {
        _this.files.splice($.inArray(file, _this.files), 1);
        if (_this.queue.length > 0 && _this.files.length < _this.opts.connectionCount) {
          return _this.upload(_this.queue.shift());
        } else if (_this.files.length === 0) {
          return _this.uploading = false;
        }
      };
    })(this));
    return $(window).on('beforeunload.uploader-' + this.id, (function(_this) {
      return function(e) {
        if (!_this.uploading) {
          return;
        }
        e.originalEvent.returnValue = _this._locales.leaveConfirm;
        return _this._locales.leaveConfirm;
      };
    })(this));
  };

  SimpleUploader.prototype.generateId = (function() {
    var id;
    id = 0;
    return function() {
      return id += 1;
    };
  })();

  SimpleUploader.prototype.upload = function(file, opts) {
    var f, key, _i, _len;
    if (opts == null) {
      opts = {};
    }
    if (file == null) {
      return;
    }
    if ($.isArray(file) || file instanceof FileList) {
      for (_i = 0, _len = file.length; _i < _len; _i++) {
        f = file[_i];
        this.upload(f, opts);
      }
    } else if ($(file).is('input:file')) {
      key = $(file).attr('name');
      if (key) {
        opts.fileKey = key;
      }
      this.upload($.makeArray($(file)[0].files), opts);
    } else if (!file.id || !file.obj) {
      file = this.getFile(file);
    }
    if (!(file && file.obj)) {
      return;
    }
    $.extend(file, opts);
    if (this.files.length >= this.opts.connectionCount) {
      this.queue.push(file);
      return;
    }
    if (this.trigger('beforeupload', [file]) === false) {
      return;
    }
    this.files.push(file);
    this._xhrUpload(file);
    return this.uploading = true;
  };

  SimpleUploader.prototype.getFile = function(fileObj) {
    var name, _ref, _ref1;
    if (fileObj instanceof window.File || fileObj instanceof window.Blob) {
      name = (_ref = fileObj.fileName) != null ? _ref : fileObj.name;
    } else {
      return null;
    }
    return {
      id: this.generateId(),
      url: this.opts.url,
      params: this.opts.params,
      fileKey: this.opts.fileKey,
      name: name,
      size: (_ref1 = fileObj.fileSize) != null ? _ref1 : fileObj.size,
      ext: name ? name.split('.').pop().toLowerCase() : '',
      obj: fileObj
    };
  };

  SimpleUploader.prototype._xhrUpload = function(file) {
    var formData, k, v, _ref;
    formData = new FormData();
    formData.append(file.fileKey, file.obj);
    formData.append("original_filename", file.name);
    if (file.params) {
      _ref = file.params;
      for (k in _ref) {
        v = _ref[k];
        formData.append(k, v);
      }
    }
    return file.xhr = $.ajax({
      url: file.url,
      data: formData,
      processData: false,
      contentType: false,
      type: 'POST',
      xhr: function() {
        var req;
        req = $.ajaxSettings.xhr();
        if (req) {
          req.upload.onprogress = (function(_this) {
            return function(e) {
              return _this.progress(e);
            };
          })(this);
        }
        return req;
      },
      progress: (function(_this) {
        return function(e) {
          if (!e.lengthComputable) {
            return;
          }
          return _this.trigger('uploadprogress', [file, e.loaded, e.total]);
        };
      })(this),
      error: (function(_this) {
        return function(xhr, status, err) {
          return _this.trigger('uploaderror', [file, xhr, status]);
        };
      })(this),
      success: (function(_this) {
        return function(result) {
          if (_this.opts.transformResponse) {
            result = _this.opts.transformResponse(result);
          }
          _this.trigger('uploadprogress', [file, file.size, file.size]);
          _this.trigger('uploadsuccess', [file, result]);
          return $(document).trigger('uploadsuccess', [file, result, _this]);
        };
      })(this),
      complete: (function(_this) {
        return function(xhr, status) {
          return _this.trigger('uploadcomplete', [file, xhr.responseText]);
        };
      })(this)
    });
  };

  SimpleUploader.prototype.cancel = function(file) {
    var f, _i, _len, _ref;
    if (!file.id) {
      _ref = this.files;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        f = _ref[_i];
        if (f.id === file * 1) {
          file = f;
          break;
        }
      }
    }
    this.files.splice($.inArray(file, this.files), 1);
    this.trigger('uploadcancel', [file]);
    if (file.xhr) {
      file.xhr.abort();
    }
    return file.xhr = null;
  };

  SimpleUploader.prototype.readImageFile = function(fileObj, callback) {
    var fileReader, img;
    if (!$.isFunction(callback)) {
      return;
    }
    img = new Image();
    img.onload = function() {
      return callback(img);
    };
    img.onerror = function() {
      return callback(false);
    };
    if (window.FileReader && FileReader.prototype.readAsDataURL && /^image/.test(fileObj.type)) {
      fileReader = new FileReader();
      fileReader.onload = function(e) {
        return img.src = e.target.result;
      };
      return fileReader.readAsDataURL(fileObj);
    } else {
      return callback(false);
    }
  };

  SimpleUploader.prototype.destroy = function() {
    var file, _i, _len, _ref;
    this.queue.length = 0;
    _ref = this.files;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      file = _ref[_i];
      this.cancel(file);
    }
    $(window).off('.uploader-' + this.id);
    return $(document).off('.uploader-' + this.id);
  };

  return SimpleUploader;

})(SimpleModule);

module.exports = SimpleUploader;

},{}]},{},[]);

return b('simple-uploader');
}));
