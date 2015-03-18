(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govmap.coffee":[function(require,module,exports){
var clear, geocode, geocode_addr, map, pinImage;

pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

map = new GMaps({
  el: '#govmap',
  lat: -12.043333,
  lng: -77.028333,
  zoom: 14
});

geocode_addr = function(addr, data) {
  return GMaps.geocode({
    address: addr,
    callback: function(results, status) {
      var latlng;
      if (status === 'OK') {
        latlng = results[0].geometry.location;
        map.setCenter(latlng.lat(), latlng.lng());
        map.addMarker({
          lat: latlng.lat(),
          lng: latlng.lng(),
          size: 'small',
          title: results[0].formatted_address,
          infoWindow: {
            content: results[0].formatted_address
          }
        });
        if (data) {
          map.addMarker({
            lat: data.latitude,
            lng: data.longitude,
            size: 'small',
            color: 'blue',
            icon: pinImage,
            title: data.latitude + " " + data.longitude,
            infoWindow: {
              content: data.latitude + " " + data.longitude
            }
          });
        }
        $('.govmap-found').html("<strong>FOUND: </strong>" + results[0].formatted_address);
      }
    }
  });
};

clear = function(s) {
  if (s.match(/ box /i)) {
    return '';
  } else {
    return s;
  }
};

geocode = function(data) {
  var addr;
  addr = (clear(data.address1)) + " " + (clear(data.address2)) + ", " + data.city + ", " + data.state + " " + data.zip + ", USA";
  $('#govaddress').val(addr);
  return geocode_addr(addr, data);
};

"1 Doctor Carlton B Goodlett Place, San Francisco, CA 94102, USA";

module.exports = {
  geocode: geocode,
  gocode_addr: geocode_addr
};



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govselector.coffee":[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  var entered_value;

  GovSelector.prototype.on_selected = function(evt, data, name) {};

  function GovSelector(html_selector, docs_url, num_items) {
    this.html_selector = html_selector;
    this.num_items = num_items;
    this.startSuggestion = bind(this.startSuggestion, this);
    $.ajax({
      url: docs_url,
      dataType: 'json',
      cache: true,
      success: this.startSuggestion
    });
  }

  GovSelector.prototype.suggestionTemplate = Handlebars.compile("<div class=\"sugg-box\">\n  <div class=\"sugg-state\">{{{state}}}</div>\n  <div class=\"sugg-name\">{{{gov_name}}}</div>\n  <div class=\"sugg-type\">{{{gov_type}}}</div>\n</div>");

  entered_value = "";

  GovSelector.prototype.startSuggestion = function(govs) {
    $('.typeahead').keyup((function(_this) {
      return function(event) {
        return _this.entered_value = $(event.target).val();
      };
    })(this));
    $(this.html_selector).attr('placeholder', 'GOVERNMENT NAME');
    $(this.html_selector).typeahead({
      hint: false,
      highlight: false,
      minLength: 1
    }, {
      name: 'gov_name',
      displayKey: 'gov_name',
      source: query_matcher(govs, this.num_items),
      templates: {
        suggestion: this.suggestionTemplate
      }
    }).on('typeahead:selected', (function(_this) {
      return function(evt, data, name) {
        $('.typeahead').typeahead('val', _this.entered_value);
        return _this.on_selected(evt, data, name);
      };
    })(this)).on('typeahead:cursorchanged', (function(_this) {
      return function(evt, data, name) {
        return $('.typeahead').val(_this.entered_value);
      };
    })(this));
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/querymatcher.coffee"}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/jquery.govselector.coffee":[function(require,module,exports){
(function($) {
  $.govselector = function(el, options) {
    var base, blur, delay, onkeyup;
    base = this;
    base.$el = $(el);
    base.el = el;
    base.$el.data('govselector', base);
    delay = (function() {
      var timer;
      timer = 0;
      return function(callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
      };
    })();
    onkeyup = function(event) {
      switch (event.which) {
        case 13:
          event.preventDefault();
          $('.typeahead').typeahead('val', base.$el.val());
          $('.typeahead').typeahead('open');
          break;
        case 27:
          $('.typeahead').typeahead('close');
          break;
        case 38:
          break;
        case 40:
          break;
        default:
          $('.typeahead').typeahead('val', base.$el.val());
          $('.typeahead').typeahead('open');
      }
      console.log(event.which);
    };
    blur = function(event) {
      return console.log('blur');
    };
    base.init = function() {
      base.options = $.extend({}, $.govselector.defaultOptions, options);
      base.$el.css('background-color', 'white');
      base.$el.keyup(onkeyup);
      base.$el.blur(onblur);
    };
    base.init();
  };
  $.govselector.defaultOptions = {
    rows: 5,
    template: '{{}}'
  };
  $.fn.govselector = function(options) {
    return this.each(function() {
      new $.govselector(this, options);
    });
  };
  $.fn.getgovselector = function() {
    this.data('govselector');
  };
})(jQuery);



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/main.coffee":[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, _jqgs, activate_tab, active_tab, build_select_element, build_selector, get_record, gov_selector, govmap, templates;

GovSelector = require('./govselector.coffee');

_jqgs = require('./jquery.govselector.coffee');

Templates2 = require('./templates2.coffee');

govmap = require('./govmap.coffee');

window.GOVWIKI = {
  state_filter: '',
  gov_type_filter: ''
};

gov_selector = new GovSelector('.typeahead', 'data/h_types.json', 7);

templates = new Templates2;

active_tab = "";

window.remember_tab = function(name) {
  return active_tab = name;
};

window.geocode_addr = function(input_selector) {
  return govmap.gocode_addr($(input_selector).val());
};

activate_tab = function() {
  return $("#fieldTabs a[href='#" + active_tab + "']").tab('show');
};

gov_selector.on_selected = function(evt, data, name) {
  $('#details').html(templates.get_html(0, data));
  activate_tab();
  get_record("inc_id:" + data["inc_id"]);
};

get_record = function(query) {
  return $.ajax({
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={" + query + "}&f={_id:0}&l=1&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y",
    dataType: 'json',
    cache: true,
    success: function(data) {
      if (data.length) {
        $('#details').html(templates.get_html(0, data[0]));
        activate_tab();
        $('#maparea').css('visibility', 'visible');
        govmap.geocode(data[0]);
      }
    },
    error: function(e) {
      return console.log(e);
    }
  });
};

$('#maparea').css('visibility', 'hidden');

templates.load_template("tabs", "config/tablayout.json");

build_selector = function(container, text, url, where_to_store_value) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(data) {
        build_select_element(container, text, data.sort(), where_to_store_value);
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

build_select_element = function(container, text, arr, where_to_store_value) {
  var i, len, s, select, v;
  s = "<select class='form-control'><option value=''>" + text + "</option>";
  for (i = 0, len = arr.length; i < len; i++) {
    v = arr[i];
    s += "<option value='" + v + "'>" + v + "</option>";
  }
  s += "</select>";
  select = $(s);
  $(container).append(select);
  return select.change(function(e) {
    var el;
    el = $(e.target);
    return window.GOVWIKI[where_to_store_value] = el.val();
  });
};

build_selector('.state-container', 'State..', 'data/state.json', 'state_filter');

build_selector('.gov-type-container', 'type of government..', 'data/gov_type.json', 'gov_type_filter');



},{"./govmap.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govmap.coffee","./govselector.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/govselector.coffee","./jquery.govselector.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/jquery.govselector.coffee","./templates2.coffee":"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/templates2.coffee"}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/querymatcher.coffee":[function(require,module,exports){
var QueryMather, full_trim, get_words, get_words_regs, select_text, strip, strongify;

QueryMather = function(docs, num_items) {
  if (num_items == null) {
    num_items = 5;
  }
  return function(q, cb) {
    var d, j, len, matches, ref, regs, test_string, words;
    test_string = function(s, regs) {
      var j, len, r;
      for (j = 0, len = regs.length; j < len; j++) {
        r = regs[j];
        if (!r.test(s)) {
          return false;
        }
      }
      return true;
    };
    ref = get_words_regs(q), words = ref[0], regs = ref[1];
    matches = [];
    for (j = 0, len = docs.length; j < len; j++) {
      d = docs[j];
      if (matches.length >= num_items) {
        break;
      }
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      if (test_string(d.gov_name, regs)) {
        matches.push($.extend({}, d));
      }
    }
    select_text(matches, words, regs);
    cb(matches);
  };
};

select_text = function(clones, words, regs) {
  var d, j, len;
  for (j = 0, len = clones.length; j < len; j++) {
    d = clones[j];
    d.gov_name = strongify(d.gov_name, words, regs);
  }
  return clones;
};

strongify = function(s, words, regs) {
  regs.forEach(function(r, i) {
    return s = s.replace(r, "<b>" + words[i] + "</b>");
  });
  return s;
};

strip = function(s) {
  return s.replace(/<[^<>]*>/g, '');
};

full_trim = function(s) {
  var ss;
  ss = s.trim('' + s);
  return ss = ss.replace(/ +/g, ' ');
};

get_words = function(str) {
  return full_trim(str).split(' ');
};

get_words_regs = function(str) {
  var regs, words;
  words = get_words(str);
  regs = words.map(function(w) {
    return new RegExp("" + w, 'ig');
  });
  return [words, regs];
};

module.exports = QueryMather;



},{}],"/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/templates2.coffee":[function(require,module,exports){

/*
 * file: templates2.coffee ----------------------------------------------------------------------
#
 * Class to manage templates and render data on html page.
#
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */
var Templates2, add_other_tab_to_layout, fieldNames, get_layout_fields, get_record_fields, get_unmentioned_fields, load_field_names, render_field, render_field_name, render_field_value, render_fields, render_tabs, under;

fieldNames = {};

load_field_names = function(url) {
  return $.ajax({
    url: url,
    dataType: 'json',
    cache: true,
    success: (function(_this) {
      return function(fieldnames_json) {
        fieldNames = fieldnames_json;
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

load_field_names("config/fieldnames.json");

render_field_value = function(n, data) {
  var v;
  v = data[n];
  if (n === "web_site") {
    return "<a target='_blank' href='" + v + "'>" + v + "</a>";
  } else {
    return v;
  }
};

render_field_name = function(fName) {
  var s;
  if (fieldNames[fName] != null) {
    return fieldNames[fName];
  }
  s = fName.replace(/_/g, " ");
  s = s.charAt(0).toUpperCase() + s.substring(1);
  return s;
};

render_field = function(fName, data) {
  var fValue;
  if (!(fValue = data[fName])) {
    return '';
  }
  return "<div>\n    <span class='f-nam'>" + (render_field_name(fName)) + "</span>\n    <span class='f-val'>" + (render_field_value(fName, data)) + "</span>\n</div>";
};

render_fields = function(fields, data) {
  var f;
  return ((function() {
    var j, len, results;
    results = [];
    for (j = 0, len = fields.length; j < len; j++) {
      f = fields[j];
      results.push(render_field(f, data));
    }
    return results;
  })()).join('');
};

under = function(s) {
  return s.replace(/ /g, '_');
};

render_tabs = function(initial_layout, data) {
  var active, h, i, j, k, layout, len, len1, tab;
  layout = add_other_tab_to_layout(initial_layout, data);
  h = '<div role="tabpanel" >';
  h += '<ul id="fieldTabs" class="nav nav-tabs" role="tablist">';
  for (i = j = 0, len = layout.length; j < len; i = ++j) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<li role=\"presentation\" class=\"" + active + "\" onclick=\"remember_tab('" + (under(tab.name)) + "')\">\n  <a href=\"#" + (under(tab.name)) + "\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">\n  " + tab.name + "\n  </a>\n</li>";
  }
  h += '</ul>';
  h += '<div class="tab-content">';
  for (i = k = 0, len1 = layout.length; k < len1; i = ++k) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<div role=\"tabpanel\" class=\"tab-pane " + active + "\" id=\"" + (under(tab.name)) + "\" style=\"padding-top: 40px;\">\n    " + (render_fields(tab.fields, data)) + "\n</div>";
  }
  h += '</div>';
  h += '</div>';
  return h;
};

get_layout_fields = function(la) {
  var f, field, j, k, len, len1, ref, t;
  f = {};
  for (j = 0, len = la.length; j < len; j++) {
    t = la[j];
    ref = t.fields;
    for (k = 0, len1 = ref.length; k < len1; k++) {
      field = ref[k];
      f[field] = 1;
    }
  }
  return f;
};

get_record_fields = function(r) {
  var f, field_name;
  f = {};
  for (field_name in r) {
    f[field_name] = 1;
  }
  return f;
};

get_unmentioned_fields = function(la, r) {
  var f, layout_fields, record_fields, unmentioned_fields;
  layout_fields = get_layout_fields(la);
  record_fields = get_record_fields(r);
  unmentioned_fields = [];
  for (f in record_fields) {
    if (!layout_fields[f]) {
      unmentioned_fields.push(f);
    }
  }
  return unmentioned_fields;
};

add_other_tab_to_layout = function(layout, data) {
  var l, t;
  if (layout == null) {
    layout = [];
  }
  l = $.extend(true, [], layout);
  t = {
    name: "Other",
    fields: get_unmentioned_fields(l, data)
  };
  l.push(t);
  return l;
};

Templates2 = (function() {
  Templates2.list = void 0;

  function Templates2() {
    this.list = [];
  }

  Templates2.prototype.add_template = function(layout_name, layout_json) {
    return this.list.push({
      name: layout_name,
      render: function(dat) {
        return render_tabs(layout_json, dat);
      }
    });
  };

  Templates2.prototype.load_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          _this.add_template(template_name, template_json);
        };
      })(this)
    });
  };

  Templates2.prototype.get_names = function() {
    var j, len, ref, results, t;
    ref = this.list;
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      t = ref[j];
      results.push(t.name);
    }
    return results;
  };

  Templates2.prototype.get_index_by_name = function(name) {
    var i, j, len, ref, t;
    ref = this.list;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      t = ref[i];
      if (t.name === name) {
        return i;
      }
    }
    return -1;
  };

  Templates2.prototype.get_html = function(ind, data) {
    if (ind === -1) {
      return "";
    }
    if (this.list[ind]) {
      return this.list[ind].render(data);
    } else {
      return "";
    }
  };

  return Templates2;

})();

module.exports = Templates2;



},{}]},{},["/Users/vadimivlev/Projects/_projects/govwiki.us/coffee/main.coffee"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvanF1ZXJ5LmdvdnNlbGVjdG9yLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9tYWluLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9xdWVyeW1hdGNoZXIuY29mZmVlIiwiL1VzZXJzL3ZhZGltaXZsZXYvUHJvamVjdHMvX3Byb2plY3RzL2dvdndpa2kudXMvY29mZmVlL3RlbXBsYXRlczIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsSUFBQSwyQ0FBQTs7QUFBQSxRQUFBLEdBQWUsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQWIsQ0FDYiwrRUFEYSxFQUVULElBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFiLENBQW1CLEVBQW5CLEVBQXVCLEVBQXZCLENBRlMsRUFHVCxJQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBYixDQUFvQixDQUFwQixFQUF1QixDQUF2QixDQUhTLEVBSVQsSUFBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQWIsQ0FBb0IsRUFBcEIsRUFBd0IsRUFBeEIsQ0FKUyxDQUFmLENBQUE7O0FBQUEs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QUEsQ0FBQSxDQUFBLElBQUEsQ0FIVDtLQURGLEVBRFk7RUFBQSxDQVpkLENBQUE7O0FBQUEsdUJBc0JBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLHVCQUFBO0FBQUM7QUFBQTtTQUFBLHFDQUFBO2lCQUFBO0FBQUEsbUJBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtBQUFBO21CQURRO0VBQUEsQ0F0QlgsQ0FBQTs7QUFBQSx1QkF5QkEsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsUUFBQSxpQkFBQTtBQUFBO0FBQUEsU0FBQSw2Q0FBQTtpQkFBQTtBQUNFLE1BQUEsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7QUFDRSxlQUFPLENBQVAsQ0FERjtPQURGO0FBQUEsS0FBQTtBQUdDLFdBQU8sQ0FBQSxDQUFQLENBSmdCO0VBQUEsQ0F6Qm5CLENBQUE7O0FBQUEsdUJBK0JBLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDUixJQUFBLElBQUksR0FBQSxLQUFPLENBQUEsQ0FBWDtBQUFvQixhQUFRLEVBQVIsQ0FBcEI7S0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDtBQUNFLGFBQU8sSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFYLENBQWtCLElBQWxCLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxhQUFPLEVBQVAsQ0FIRjtLQUhRO0VBQUEsQ0EvQlYsQ0FBQTs7b0JBQUE7O0lBcEpGLENBQUE7O0FBQUEsTUE2TE0sQ0FBQyxPQUFQLEdBQWlCLFVBN0xqQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXG4gICdodHRwOi8vY2hhcnQuYXBpcy5nb29nbGUuY29tL2NoYXJ0P2Noc3Q9ZF9tYXBfcGluX2xldHRlciZjaGxkPVp8Nzc3N0JCfEZGRkZGRicgLFxuICBuZXcgKGdvb2dsZS5tYXBzLlNpemUpKDIxLCAzNCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgxMCwgMzQpXG4gIClcblxuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IC0xMi4wNDMzMzNcbiAgbG5nOiAtNzcuMDI4MzMzXG4gIHpvb206MTRcblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgICAgbGF0OiBkYXRhLmxhdGl0dWRlXG4gICAgICAgICAgICBsbmc6IGRhdGEubG9uZ2l0dWRlXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgICBjb2xvcjogJ2JsdWUnXG4gICAgICAgICAgICBpY29uOiBwaW5JbWFnZVxuICAgICAgICAgICAgdGl0bGU6ICBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgICAgY29udGVudDogXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIFxuICAgICAgICAkKCcuZ292bWFwLWZvdW5kJykuaHRtbCBcIjxzdHJvbmc+Rk9VTkQ6IDwvc3Ryb25nPiN7cmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc31cIlxuICAgICAgcmV0dXJuXG5cbmNsZWFyPShzKS0+XG4gIHJldHVybiBpZiBzLm1hdGNoKC8gYm94IC9pKSB0aGVuICcnIGVsc2Ugc1xuXG5cblxuZ2VvY29kZSA9IChkYXRhKSAtPlxuICBhZGRyID0gXCIje2NsZWFyKGRhdGEuYWRkcmVzczEpfSAje2NsZWFyKGRhdGEuYWRkcmVzczIpfSwgI3tkYXRhLmNpdHl9LCAje2RhdGEuc3RhdGV9ICN7ZGF0YS56aXB9LCBVU0FcIlxuICAkKCcjZ292YWRkcmVzcycpLnZhbChhZGRyKVxuICBnZW9jb2RlX2FkZHIgYWRkciwgZGF0YVxuXG5cIjEgRG9jdG9yIENhcmx0b24gQiBHb29kbGV0dCBQbGFjZSwgU2FuIEZyYW5jaXNjbywgQ0EgOTQxMDIsIFVTQVwiXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2VvY29kZTogZ2VvY29kZVxuICBnb2NvZGVfYWRkcjogZ2VvY29kZV9hZGRyXG5cbiIsIlxucXVlcnlfbWF0Y2hlciA9IHJlcXVpcmUoJy4vcXVlcnltYXRjaGVyLmNvZmZlZScpXG5cbmNsYXNzIEdvdlNlbGVjdG9yXG4gIFxuICAjIHN0dWIgb2YgYSBjYWxsYmFjayB0byBlbnZva2Ugd2hlbiB0aGUgdXNlciBzZWxlY3RzIHNvbWV0aGluZ1xuICBvbl9zZWxlY3RlZDogKGV2dCwgZGF0YSwgbmFtZSkgLT5cblxuXG4gIGNvbnN0cnVjdG9yOiAoQGh0bWxfc2VsZWN0b3IsIGRvY3NfdXJsLCBAbnVtX2l0ZW1zKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiBkb2NzX3VybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6IEBzdGFydFN1Z2dlc3Rpb25cbiAgICAgIFxuXG5cblxuICBzdWdnZXN0aW9uVGVtcGxhdGUgOiBIYW5kbGViYXJzLmNvbXBpbGUoXCJcIlwiXG4gICAgPGRpdiBjbGFzcz1cInN1Z2ctYm94XCI+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1zdGF0ZVwiPnt7e3N0YXRlfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy1uYW1lXCI+e3t7Z292X25hbWV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXR5cGVcIj57e3tnb3ZfdHlwZX19fTwvZGl2PlxuICAgIDwvZGl2PlwiXCJcIilcblxuXG5cbiAgZW50ZXJlZF92YWx1ZSA9IFwiXCJcblxuICBcblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICBcbiAgICAkKCcudHlwZWFoZWFkJykua2V5dXAgKGV2ZW50KSA9PlxuICAgICAgQGVudGVyZWRfdmFsdWUgPSAkKGV2ZW50LnRhcmdldCkudmFsKClcbiAgICBcbiAgICAkKEBodG1sX3NlbGVjdG9yKS5hdHRyICdwbGFjZWhvbGRlcicsICdHT1ZFUk5NRU5UIE5BTUUnXG4gICAgJChAaHRtbF9zZWxlY3RvcikudHlwZWFoZWFkKFxuICAgICAgICBoaW50OiBmYWxzZVxuICAgICAgICBoaWdobGlnaHQ6IGZhbHNlXG4gICAgICAgIG1pbkxlbmd0aDogMVxuICAgICAgLFxuICAgICAgICBuYW1lOiAnZ292X25hbWUnXG4gICAgICAgIGRpc3BsYXlLZXk6ICdnb3ZfbmFtZSdcbiAgICAgICAgc291cmNlOiBxdWVyeV9tYXRjaGVyKGdvdnMsIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIigoJCkgLT5cblxuICAkLmdvdnNlbGVjdG9yID0gKGVsLCBvcHRpb25zKSAtPlxuXG4gICAgIyBUbyBhdm9pZCBzY29wZSBpc3N1ZXMsIHVzZSAnYmFzZScgaW5zdGVhZCBvZiAndGhpcydcbiAgICAjIHRvIHJlZmVyZW5jZSB0aGlzIGNsYXNzIGZyb20gaW50ZXJuYWwgZXZlbnRzIGFuZCBmdW5jdGlvbnMuXG4gICAgYmFzZSA9IHRoaXNcbiAgICBcbiAgICBcbiAgICAjIEFjY2VzcyB0byBqUXVlcnkgYW5kIERPTSB2ZXJzaW9ucyBvZiBlbGVtZW50XG4gICAgYmFzZS4kZWwgPSAkKGVsKVxuICAgIGJhc2UuZWwgPSBlbFxuICAgIFxuICAgIFxuICAgICMgQWRkIGEgcmV2ZXJzZSByZWZlcmVuY2UgdG8gdGhlIERPTSBvYmplY3RcbiAgICBiYXNlLiRlbC5kYXRhICdnb3ZzZWxlY3RvcicsIGJhc2VcblxuICAgICMgZGVsYXkgdXNhZ2VcbiAgICAjJCgnaW5wdXQnKS5rZXl1cCAtPlxuICAgICMgIGRlbGF5ICgtPiBhbGVydCAnVGltZSBlbGFwc2VkISc7IHJldHVybiksIDEwMDBcbiAgICAjICByZXR1cm5cbiAgICAgIFxuICAgIGRlbGF5ID0gZG8gLT5cbiAgICAgIHRpbWVyID0gMFxuICAgICAgKGNhbGxiYWNrLCBtcykgLT5cbiAgICAgICAgY2xlYXJUaW1lb3V0IHRpbWVyXG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChjYWxsYmFjaywgbXMpXG4gICAgICAgIHJldHVyblxuICAgIFxuICAgIG9ua2V5dXAgPSAoZXZlbnQpIC0+XG4gICAgICBzd2l0Y2ggIGV2ZW50LndoaWNoXG4gICAgICAgICMgRW50ZXJcbiAgICAgICAgd2hlbiAxM1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICd2YWwnLCBiYXNlLiRlbC52YWwoKVxuICAgICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ29wZW4nXG4gICAgICAgICMgRXNjXG4gICAgICAgIHdoZW4gMjdcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdjbG9zZSdcbiAgICAgICAgIyBVcFxuICAgICAgICB3aGVuIDM4IHRoZW5cbiAgICAgICAgIyBEb3duXG4gICAgICAgIHdoZW4gNDAgdGhlblxuICAgICAgICBlbHNlXG4gICAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgYmFzZS4kZWwudmFsKClcbiAgICAgICAgICAkKCcudHlwZWFoZWFkJykudHlwZWFoZWFkICdvcGVuJ1xuICAgICAgI2V2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGNvbnNvbGUubG9nIGV2ZW50LndoaWNoXG4gICAgICByZXR1cm5cblxuICAgIGJsdXIgPSAoZXZlbnQpIC0+XG4gICAgICBjb25zb2xlLmxvZyAnYmx1cidcbiAgICBcbiAgICBiYXNlLmluaXQgPSAtPlxuICAgICAgYmFzZS5vcHRpb25zID0gJC5leHRlbmQoe30sICQuZ292c2VsZWN0b3IuZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpXG4gICAgICAjIFB1dCB5b3VyIGluaXRpYWxpemF0aW9uIGNvZGUgaGVyZVxuICAgICAgYmFzZS4kZWwuY3NzICdiYWNrZ3JvdW5kLWNvbG9yJywgJ3doaXRlJ1xuICAgICAgYmFzZS4kZWwua2V5dXAgb25rZXl1cFxuICAgICAgYmFzZS4kZWwuYmx1ciBvbmJsdXJcblxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgICAjIFNhbXBsZSBGdW5jdGlvbiwgVW5jb21tZW50IHRvIHVzZVxuICAgICMgYmFzZS5mdW5jdGlvbk5hbWUgPSBmdW5jdGlvbihwYXJhbWF0ZXJzKXtcbiAgICAjXG4gICAgIyB9O1xuICAgIFxuICAgIFxuICAgICMgUnVuIGluaXRpYWxpemVyXG4gICAgYmFzZS5pbml0KClcbiAgICByZXR1cm5cblxuICAgIFxuICAkLmdvdnNlbGVjdG9yLmRlZmF1bHRPcHRpb25zID1cbiAgICByb3dzOiA1XG4gICAgdGVtcGxhdGU6ICd7e319J1xuXG4gICAgXG4gICQuZm4uZ292c2VsZWN0b3IgPSAob3B0aW9ucykgLT5cbiAgICBAZWFjaCAtPlxuICAgICAgbmV3ICgkLmdvdnNlbGVjdG9yKSh0aGlzLCBvcHRpb25zKVxuICAgICAgcmV0dXJuXG5cbiAgICBcbiAgIyBUaGlzIGZ1bmN0aW9uIGJyZWFrcyB0aGUgY2hhaW4sIGJ1dCByZXR1cm5zXG4gICMgdGhlIGdvdnNlbGVjdG9yIGlmIGl0IGhhcyBiZWVuIGF0dGFjaGVkIHRvIHRoZSBvYmplY3QuXG4gICQuZm4uZ2V0Z292c2VsZWN0b3IgPSAtPlxuICAgIEBkYXRhICdnb3ZzZWxlY3RvcidcbiAgICByZXR1cm5cblxuICAgIFxuICByZXR1cm5cbikgalF1ZXJ5XG4iLCIjIyNcbmZpbGU6IG1haW4uY29mZmUgLS0gVGhlIGVudHJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIDpcbmdvdl9maW5kZXIgPSBuZXcgR292RmluZGVyXG5nb3ZfZGV0YWlscyA9IG5ldyBHb3ZEZXRhaWxzXG5nb3ZfZmluZGVyLm9uX3NlbGVjdCA9IGdvdl9kZXRhaWxzLnNob3dcbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuR292U2VsZWN0b3IgPSByZXF1aXJlICcuL2dvdnNlbGVjdG9yLmNvZmZlZSdcbl9qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbmdvdm1hcCAgICAgID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuXG53aW5kb3cuR09WV0lLSSA9XG4gIHN0YXRlX2ZpbHRlciA6ICcnXG4gIGdvdl90eXBlX2ZpbHRlciA6ICcnXG5cblxuXG5cblxuXG5nb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnZGF0YS9oX3R5cGVzLmpzb24nLCA3XG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYj1cIlwiXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPShuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbndpbmRvdy5nZW9jb2RlX2FkZHIgPSAoaW5wdXRfc2VsZWN0b3IpLT4gZ292bWFwLmdvY29kZV9hZGRyICQoaW5wdXRfc2VsZWN0b3IpLnZhbCgpXG5cbmFjdGl2YXRlX3RhYiA9KCkgLT5cbiAgJChcIiNmaWVsZFRhYnMgYVtocmVmPScjI3thY3RpdmVfdGFifSddXCIpLnRhYignc2hvdycpXG5cblxuZ292X3NlbGVjdG9yLm9uX3NlbGVjdGVkID0gKGV2dCwgZGF0YSwgbmFtZSkgLT5cbiAgI3JlbmRlckRhdGEgJyNkZXRhaWxzJywgZGF0YVxuICAkKCcjZGV0YWlscycpLmh0bWwgdGVtcGxhdGVzLmdldF9odG1sKDAsIGRhdGEpXG4gIGFjdGl2YXRlX3RhYigpXG4gIGdldF9yZWNvcmQgXCJpbmNfaWQ6I3tkYXRhW1wiaW5jX2lkXCJdfVwiXG4gIHJldHVyblxuXG5cbmdldF9yZWNvcmQgPSAocXVlcnkpIC0+XG4gICQuYWpheFxuICAgIHVybDogXCJodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvY29sbGVjdGlvbnMvZ292cy8/cT17I3txdWVyeX19JmY9e19pZDowfSZsPTEmYXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEubGVuZ3RoXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YVswXSlcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgJCgnI21hcGFyZWEnKS5jc3MoJ3Zpc2liaWxpdHknLCd2aXNpYmxlJylcbiAgICAgICAgZ292bWFwLmdlb2NvZGUgZGF0YVswXVxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuXG5cblxuJCgnI21hcGFyZWEnKS5jc3MoJ3Zpc2liaWxpdHknLCdoaWRkZW4nKVxuXG5cbnRlbXBsYXRlcy5sb2FkX3RlbXBsYXRlIFwidGFic1wiLCBcImNvbmZpZy90YWJsYXlvdXQuanNvblwiXG5cblxuYnVpbGRfc2VsZWN0b3IgPSAoY29udGFpbmVyLCB0ZXh0LCB1cmwsIHdoZXJlX3RvX3N0b3JlX3ZhbHVlICkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiB1cmxcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICNhPSQuZXh0ZW5kIHRydWUgW10sZGF0YVxuICAgICAgYnVpbGRfc2VsZWN0X2VsZW1lbnQgY29udGFpbmVyLCB0ZXh0LCBkYXRhLnNvcnQoKSwgd2hlcmVfdG9fc3RvcmVfdmFsdWVcbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmJ1aWxkX3NlbGVjdF9lbGVtZW50ID0gKGNvbnRhaW5lciwgdGV4dCwgYXJyLCB3aGVyZV90b19zdG9yZV92YWx1ZSApIC0+XG4gIHMgID0gXCI8c2VsZWN0IGNsYXNzPSdmb3JtLWNvbnRyb2wnPjxvcHRpb24gdmFsdWU9Jyc+I3t0ZXh0fTwvb3B0aW9uPlwiXG4gIHMgKz0gXCI8b3B0aW9uIHZhbHVlPScje3Z9Jz4je3Z9PC9vcHRpb24+XCIgZm9yIHYgaW4gYXJyXG4gIHMgKz0gXCI8L3NlbGVjdD5cIlxuICBzZWxlY3QgPSAkKHMpXG4gICQoY29udGFpbmVyKS5hcHBlbmQoc2VsZWN0KVxuICBzZWxlY3QuY2hhbmdlIChlKSAtPlxuICAgIGVsID0gJChlLnRhcmdldClcbiAgICB3aW5kb3cuR09WV0lLSVt3aGVyZV90b19zdG9yZV92YWx1ZV0gPSBlbC52YWwoKVxuXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJ1xuICAsICdTdGF0ZS4uJ1xuICAsICdkYXRhL3N0YXRlLmpzb24nXG4gICwgJ3N0YXRlX2ZpbHRlcicpXG5cbmJ1aWxkX3NlbGVjdG9yKCcuZ292LXR5cGUtY29udGFpbmVyJ1xuICAsICd0eXBlIG9mIGdvdmVybm1lbnQuLidcbiAgLCAnZGF0YS9nb3ZfdHlwZS5qc29uJ1xuICAsICdnb3ZfdHlwZV9maWx0ZXInKVxuXG5cblxuXG5cblxuIiwiXG5cblxuIyBUYWtlcyBhbiBhcnJheSBvZiBkb2NzIHRvIHNlYXJjaCBpbi5cbiMgUmV0dXJucyBhIGZ1bmN0aW9ucyB0aGF0IHRha2VzIDIgcGFyYW1zIFxuIyBxIC0gcXVlcnkgc3RyaW5nIGFuZCBcbiMgY2IgLSBjYWxsYmFjayB0aGF0IHdpbGwgYmUgY2FsbGVkIHdoZW4gdGhlIHNlYXJjaCBpcyBkb25lLlxuIyBjYiByZXR1cm5zIGFuIGFycmF5IG9mIG1hdGNoaW5nIGRvY3VtZW50cy5cbiMgbXVtX2l0ZW1zIC0gbWF4IG51bWJlciBvZiBmb3VuZCBpdGVtcyB0byBzaG93XG5RdWVyeU1hdGhlciA9IChkb2NzLCBudW1faXRlbXM9NSkgLT5cbiAgKHEsIGNiKSAtPlxuICAgIHRlc3Rfc3RyaW5nID0ocywgcmVncykgLT5cbiAgICAgIChpZiBub3Qgci50ZXN0KHMpIHRoZW4gcmV0dXJuIGZhbHNlKSAgZm9yIHIgaW4gcmVnc1xuICAgICAgcmV0dXJuIHRydWVcblxuICAgIFt3b3JkcyxyZWdzXSA9IGdldF93b3Jkc19yZWdzIHFcbiAgICBtYXRjaGVzID0gW11cbiAgICAjIGl0ZXJhdGUgdGhyb3VnaCB0aGUgcG9vbCBvZiBkb2NzIGFuZCBmb3IgYW55IHN0cmluZyB0aGF0XG4gICAgIyBjb250YWlucyB0aGUgc3Vic3RyaW5nIGBxYCwgYWRkIGl0IHRvIHRoZSBgbWF0Y2hlc2AgYXJyYXlcblxuICAgIGZvciBkIGluIGRvY3NcbiAgICAgIGlmIG1hdGNoZXMubGVuZ3RoID49IG51bV9pdGVtcyB0aGVuIGJyZWFrXG4gICAgICBpZiBHT1ZXSUtJLnN0YXRlX2ZpbHRlciBhbmQgZC5zdGF0ZSBpc250IEdPVldJS0kuc3RhdGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGlmIEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIGFuZCBkLmdvdl90eXBlIGlzbnQgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuXG4gICAgICBpZiB0ZXN0X3N0cmluZyhkLmdvdl9uYW1lLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICAgICNpZiB0ZXN0X3N0cmluZyhcIiN7ZC5nb3ZfbmFtZX0gI3tkLnN0YXRlfSAje2QuZ292X3R5cGV9ICN7ZC5pbmNfaWR9XCIsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgIFxuICAgIHNlbGVjdF90ZXh0IG1hdGNoZXMsIHdvcmRzLCByZWdzXG4gICAgY2IgbWF0Y2hlc1xuICAgIHJldHVyblxuIFxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlIGluIGFycmF5XG5zZWxlY3RfdGV4dCA9IChjbG9uZXMsd29yZHMscmVncykgLT5cbiAgZm9yIGQgaW4gY2xvbmVzXG4gICAgZC5nb3ZfbmFtZT1zdHJvbmdpZnkoZC5nb3ZfbmFtZSwgd29yZHMsIHJlZ3MpXG4gICAgI2Quc3RhdGU9c3Ryb25naWZ5KGQuc3RhdGUsIHdvcmRzLCByZWdzKVxuICAgICNkLmdvdl90eXBlPXN0cm9uZ2lmeShkLmdvdl90eXBlLCB3b3JkcywgcmVncylcbiAgXG4gIHJldHVybiBjbG9uZXNcblxuXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2VcbnN0cm9uZ2lmeSA9IChzLCB3b3JkcywgcmVncykgLT5cbiAgcmVncy5mb3JFYWNoIChyLGkpIC0+XG4gICAgcyA9IHMucmVwbGFjZSByLCBcIjxiPiN7d29yZHNbaV19PC9iPlwiXG4gIHJldHVybiBzXG5cbiMgcmVtb3ZlcyA8PiB0YWdzIGZyb20gYSBzdHJpbmdcbnN0cmlwID0gKHMpIC0+XG4gIHMucmVwbGFjZSgvPFtePD5dKj4vZywnJylcblxuXG4jIGFsbCB0aXJtcyBzcGFjZXMgZnJvbSBib3RoIHNpZGVzIGFuZCBtYWtlIGNvbnRyYWN0cyBzZXF1ZW5jZXMgb2Ygc3BhY2VzIHRvIDFcbmZ1bGxfdHJpbSA9IChzKSAtPlxuICBzcz1zLnRyaW0oJycrcylcbiAgc3M9c3MucmVwbGFjZSgvICsvZywnICcpXG5cbiMgcmV0dXJucyBhbiBhcnJheSBvZiB3b3JkcyBpbiBhIHN0cmluZ1xuZ2V0X3dvcmRzID0gKHN0cikgLT5cbiAgZnVsbF90cmltKHN0cikuc3BsaXQoJyAnKVxuXG5cbmdldF93b3Jkc19yZWdzID0gKHN0cikgLT5cbiAgd29yZHMgPSBnZXRfd29yZHMgc3RyXG4gIHJlZ3MgPSB3b3Jkcy5tYXAgKHcpLT4gbmV3IFJlZ0V4cChcIiN7d31cIiwnaWcnKVxuICBbd29yZHMscmVnc11cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5TWF0aGVyXG5cbiIsIlxuIyMjXG4jIGZpbGU6IHRlbXBsYXRlczIuY29mZmVlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiNcbiMgQ2xhc3MgdG8gbWFuYWdlIHRlbXBsYXRlcyBhbmQgcmVuZGVyIGRhdGEgb24gaHRtbCBwYWdlLlxuI1xuIyBUaGUgbWFpbiBtZXRob2QgOiByZW5kZXIoZGF0YSksIGdldF9odG1sKGRhdGEpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cblxuXG4jIExPQUQgRklFTEQgTkFNRVMgXG5maWVsZE5hbWVzID0ge31cblxubG9hZF9maWVsZF9uYW1lcyA9ICh1cmwpIC0+XG4gICQuYWpheFxuICAgIHVybDogdXJsXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGZpZWxkbmFtZXNfanNvbikgPT5cbiAgICAgIGZpZWxkTmFtZXMgPSBmaWVsZG5hbWVzX2pzb25cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKS0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxubG9hZF9maWVsZF9uYW1lcyhcImNvbmZpZy9maWVsZG5hbWVzLmpzb25cIilcblxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9KG4sZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIHJldHVybiB2XG4gIFxuICBcblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICByZXR1cm4gJycgIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICBcIlwiXCJcbiAgPGRpdj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbSc+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgPC9kaXY+XG4gIFwiXCJcIlxuXG5cblxuICBcbnJlbmRlcl9maWVsZHMgPSggZmllbGRzLCBkYXRhKSAtPlxuICAoIHJlbmRlcl9maWVsZChmLCBkYXRhKSBmb3IgZiBpbiBmaWVsZHMpLmpvaW4oJycpXG5cblxuXG5cbiAgXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoLyAvZywgJ18nKVxuXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhKSAtPlxuICBsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICAjcmVuZGVyIGhlYWRlclxuICBoID0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgPidcblxuICAjcmVuZGVyIHRhYnNcbiAgaCArPSc8dWwgaWQ9XCJmaWVsZFRhYnNcIiBjbGFzcz1cIm5hdiBuYXYtdGFic1wiIHJvbGU9XCJ0YWJsaXN0XCI+J1xuICBcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgICA8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiIGNsYXNzPVwiI3thY3RpdmV9XCIgb25jbGljaz1cInJlbWVtYmVyX3RhYignI3t1bmRlcih0YWIubmFtZSl9JylcIj5cbiAgICAgICAgPGEgaHJlZj1cIiMje3VuZGVyKHRhYi5uYW1lKX1cIiBhcmlhLWNvbnRyb2xzPVwiaG9tZVwiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiPlxuICAgICAgICAje3RhYi5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIFwiXCJcIlxuXG4gIGggKz0gJzwvdWw+J1xuICBoICs9ICc8ZGl2IGNsYXNzPVwidGFiLWNvbnRlbnRcIj4nXG5cbiAgI3JlbmRlciB0YWJzIGNvbnRlbnRcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cInRhYi1wYW5lICN7YWN0aXZlfVwiIGlkPVwiI3t1bmRlcih0YWIubmFtZSl9XCIgc3R5bGU9XCJwYWRkaW5nLXRvcDogNDBweDtcIj5cbiAgICAgICAgI3tyZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGF9XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIFxuICAjcmVuZGVyIGZvb3RlclxuICBoICs9JzwvZGl2PidcbiAgaCArPSc8L2Rpdj4nXG4gIHJldHVybiBoXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIFxuICAjZm9yIGYgb2YgcmVjb3JkX2ZpZWxkc1xuICAjICBpZiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICAjICAgIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoIGZcbiAgXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0KVxuXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuICAgICAgICByZXR1cm5cblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZVxuICAgICAgICByZXR1cm4gaVxuICAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuICAgIFxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiJdfQ==
