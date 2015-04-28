// Generated by IcedCoffeeScript 1.8.0-c
(function() {
  var err, testing, _;

  try {
    _ = require('underscore');
    testing = true;
  } catch (_error) {
    err = _error;
    _ = require('lib/underscore');
  }

  module.exports = function(action_handlers, get_doc_type, prep_doc) {
    return function(doc, req) {
      var action, action_handler, action_name, actor, doc_type, e, error_msg, old_doc, out_doc, write_doc, _ref;
      action = JSON.parse(req.body);
      action_name = action.a;
      actor = req.userCtx;
      if (doc) {
        doc_type = get_doc_type(doc);
      } else {
        doc_type = 'create';
      }
      action_handler = (_ref = action_handlers[doc_type]) != null ? _ref[action_name] : void 0;
      if (!action_handler) {
        error_msg = 'invalid action "' + action_name + '" for doc type "' + doc_type + '".';
        return [
          null, {
            code: 403,
            body: JSON.stringify({
              "status": "error",
              "msg": error_msg
            })
          }
        ];
      }
      doc || (doc = {
        _id: req.uuid,
        audit: []
      });
      old_doc = JSON.parse(JSON.stringify(doc));
      try {
        action_handler(doc, action, actor);
      } catch (_error) {
        e = _error;
        return [
          null, {
            code: 500,
            body: JSON.stringify({
              "status": "error",
              "msg": e
            })
          }
        ];
      }
      if (_.isEqual(old_doc, doc)) {
        write_doc = null;
      } else {
        _.extend(action, {
          u: actor.name,
          dt: +new Date()
        });
        doc.audit.push(action);
        write_doc = doc;
      }
      if (prep_doc) {
        out_doc = JSON.parse(JSON.stringify(doc));
        out_doc = prep_doc(out_doc, actor);
      } else {
        out_doc = doc;
      }
      return [write_doc, JSON.stringify(out_doc)];
    };
  };

}).call(this);