(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, clear, create_info_window, geocode, geocode_addr, get_icon, get_records, map, on_bounds_changed, on_bounds_changed_later, pinImage;

bounds_timeout = void 0;

map = new GMaps({
  el: '#govmap',
  lat: 37.3789008,
  lng: -117.1916283,
  zoom: 6,
  bounds_changed: function() {
    return on_bounds_changed_later(200);
  }
});

on_bounds_changed_later = function(msec) {
  clearTimeout(bounds_timeout);
  return bounds_timeout = setTimeout(on_bounds_changed, msec);
};

on_bounds_changed = function(e) {
  var b, ne, ne_lat, ne_lng, q, st, sw, sw_lat, sw_lng, ty, url_value;
  console.log("bounds_changed");
  b = map.getBounds();
  url_value = b.toUrlValue();
  ne = b.getNorthEast();
  sw = b.getSouthWest();
  ne_lat = ne.lat();
  ne_lng = ne.lng();
  sw_lat = sw.lat();
  sw_lng = sw.lng();
  st = GOVWIKI.state_filter;
  ty = GOVWIKI.gov_type_filter;
  q = " \"latitude\":{\"$lt\":" + ne_lat + ",\"$gt\":" + sw_lat + "},\"longitude\":{\"$lt\":" + ne_lng + ",\"$gt\":" + sw_lng + "}";
  if (st) {
    q += ",\"state\":\"" + st + "\" ";
  }
  if (ty) {
    q += ",\"gov_type\":\"" + ty + "\" ";
  }
  return get_records(q, 200, function(data) {
    var i, len, rec;
    map.removeMarkers();
    for (i = 0, len = data.length; i < len; i++) {
      rec = data[i];
      add_marker(rec);
    }
  });
};

get_icon = function(gov_type) {
  var _circle;
  _circle = function(color) {
    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillOpacity: 0.5,
      fillColor: color,
      strokeWeight: 1,
      strokeColor: 'white',
      scale: 6
    };
  };
  switch (gov_type) {
    case 'General Purpose':
      return _circle('#03C');
    case 'Cemeteries':
      return _circle('#000');
    case 'Hospitals':
      return _circle('#0C0');
    default:
      return _circle('#D20');
  }
};

add_marker = function(rec) {
  map.addMarker({
    lat: rec.latitude,
    lng: rec.longitude,
    icon: get_icon(rec.gov_type),
    title: rec.gov_name + ", " + rec.gov_type + " (" + rec.latitude + ", " + rec.longitude + ")",
    infoWindow: {
      content: create_info_window(rec)
    },
    click: function(e) {
      return window.GOVWIKI.show_record(rec);
    }
  });
};

create_info_window = function(r) {
  var w;
  w = $('<div></div>').append($("<a href='#'><strong>" + r.gov_name + "</strong></a>").click(function(e) {
    e.preventDefault();
    console.log(r);
    return window.GOVWIKI.show_record(r);
  })).append($("<div> " + r.gov_type + "  " + r.city + " " + r.zip + " " + r.state + "</div>"));
  return w[0];
};

get_records = function(query, limit, onsuccess) {
  return $.ajax({
    url: "https://api.mongolab.com/api/1/databases/govwiki/collections/govs/?q={" + query + "}&f={_id:0}&l=" + limit + "&s={rand:1}&apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y",
    dataType: 'json',
    cache: true,
    success: onsuccess,
    error: function(e) {
      return console.log(e);
    }
  });
};

pinImage = new google.maps.MarkerImage('http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=Z|7777BB|FFFFFF', new google.maps.Size(21, 34), new google.maps.Point(0, 0), new google.maps.Point(10, 34));

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

module.exports = {
  geocode: geocode,
  gocode_addr: geocode_addr,
  on_bounds_changed: on_bounds_changed,
  on_bounds_changed_later: on_bounds_changed_later
};



},{}],2:[function(require,module,exports){
var GovSelector, query_matcher,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

query_matcher = require('./querymatcher.coffee');

GovSelector = (function() {
  var entered_value, govs_array;

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

  govs_array = [];

  GovSelector.prototype.count_govs = function() {
    var count, d, i, len, ref;
    count = 0;
    ref = this.govs_array;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      if (GOVWIKI.state_filter && d.state !== GOVWIKI.state_filter) {
        continue;
      }
      if (GOVWIKI.gov_type_filter && d.gov_type !== GOVWIKI.gov_type_filter) {
        continue;
      }
      count++;
    }
    return count;
  };

  GovSelector.prototype.startSuggestion = function(govs) {
    this.govs_array = govs;
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
    $('.gov-counter').text(this.count_govs());
  };

  return GovSelector;

})();

module.exports = GovSelector;



},{"./querymatcher.coffee":4}],3:[function(require,module,exports){

/*
file: main.coffe -- The entry -----------------------------------------------------------------------------------
  :
gov_finder = new GovFinder
gov_details = new GovDetails
gov_finder.on_select = gov_details.show
-----------------------------------------------------------------------------------------------------------------
 */
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, build_select_element, build_selector, focus_search_field, get_record, gov_selector, govmap, livereload, start_adjusting_typeahead_width, templates;

GovSelector = require('./govselector.coffee');

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

activate_tab = function() {
  return $("#fieldTabs a[href='#" + active_tab + "']").tab('show');
};

gov_selector.on_selected = function(evt, data, name) {
  $('#details').html(templates.get_html(0, data));
  activate_tab();
  get_record("inc_id:" + data["inc_id"]);
  $(window).scrollTo('#pBackToSearch', 600);
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
      }
    },
    error: function(e) {
      return console.log(e);
    }
  });
};

window.GOVWIKI.show_record = (function(_this) {
  return function(rec) {
    $('#details').html(templates.get_html(0, rec));
    activate_tab();
    return $(window).scrollTo('#pBackToSearch', 600);
  };
})(this);


/*
window.show_rec = (rec)->
  $('#details').html templates.get_html(0, rec)
  activate_tab()
 */

build_selector = function(container, text, command, where_to_store_value) {
  return $.ajax({
    url: 'https://api.mongolab.com/api/1/databases/govwiki/runCommand?apiKey=0Y5X_Qk2uOJRdHJWJKSRWk6l6JqVTS2y',
    type: 'POST',
    contentType: "application/json",
    dataType: 'json',
    data: command,
    cache: true,
    success: (function(_this) {
      return function(data) {
        var values;
        values = data.values;
        build_select_element(container, text, values.sort(), where_to_store_value);
      };
    })(this),
    error: function(e) {
      return console.log(e);
    }
  });
};

build_select_element = function(container, text, arr, where_to_store_value) {
  var i, len, s, select, v;
  s = "<select class='form-control' style='maxwidth:160px;'><option value=''>" + text + "</option>";
  for (i = 0, len = arr.length; i < len; i++) {
    v = arr[i];
    if (v) {
      s += "<option value='" + v + "'>" + v + "</option>";
    }
  }
  s += "</select>";
  select = $(s);
  $(container).append(select);
  if (text === 'State..') {
    select.val('CA');
    window.GOVWIKI.state_filter = 'CA';
    govmap.on_bounds_changed_later();
  }
  return select.change(function(e) {
    var el;
    el = $(e.target);
    window.GOVWIKI[where_to_store_value] = el.val();
    $('.gov-counter').text(gov_selector.count_govs());
    return govmap.on_bounds_changed();
  });
};

adjust_typeahead_width = function() {
  var inp, par;
  inp = $('#myinput');
  par = $('#typeahed-container');
  return inp.width(par.width());
};

start_adjusting_typeahead_width = function() {
  return $(window).resize(function() {
    return adjust_typeahead_width();
  });
};

livereload = function(port) {
  var url;
  url = window.location.origin.replace(/:[^:]*$/, "");
  return $.getScript(url + ":" + port, (function(_this) {
    return function() {
      return $('body').append("<div style='position:absolute;z-index:1000;\nwidth:100%; top:0;color:red; text-align: center; \npadding:1px;font-size:10px;line-height:1'>live</div>");
    };
  })(this));
};

focus_search_field = function(msec) {
  return setTimeout((function() {
    return $('#myinput').focus();
  }), msec);
};

templates.load_fusion_template("tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA");

build_selector('.state-container', 'State..', '{"distinct": "govs","key":"state"}', 'state_filter');

build_selector('.gov-type-container', 'type of government..', '{"distinct": "govs","key":"gov_type"}', 'gov_type_filter');

adjust_typeahead_width();

start_adjusting_typeahead_width();

$('#btnBackToSearch').click(function(e) {
  e.preventDefault();
  $(window).scrollTo('0px', 500);
  return focus_search_field(500);
});

livereload("9090");



},{"./govmap.coffee":1,"./govselector.coffee":2,"./templates2.coffee":5}],4:[function(require,module,exports){
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



},{}],5:[function(require,module,exports){

/*
 * file: templates2.coffee ----------------------------------------------------------------------
#
 * Class to manage templates and render data on html page.
#
 * The main method : render(data), get_html(data)
#-------------------------------------------------------------------------------------------------
 */
var Templates2, add_other_tab_to_layout, convert_fusion_template, fieldNames, get_layout_fields, get_record_fields, get_unmentioned_fields, render_field, render_field_name, render_field_value, render_fields, render_tabs, under;

fieldNames = {};

render_field_value = function(n, data) {
  var v;
  v = data[n];
  if (!data[n]) {
    return '';
  }
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
  var active, h, i, j, layout, len, len1, m, tab;
  layout = add_other_tab_to_layout(initial_layout, data);
  h = "<h3>" + data.gov_name + "</h3>";
  h += '<div role="tabpanel" >';
  h += '<ul id="fieldTabs" class="nav nav-pills" role="tablist">';
  for (i = j = 0, len = layout.length; j < len; i = ++j) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<li role=\"presentation\" class=\"" + active + "\"  onclick=\"remember_tab('" + (under(tab.name)) + "')\">\n  <a href=\"#tab" + (under(tab.name)) + "\" aria-controls=\"home\" role=\"tab\" data-toggle=\"tab\">\n  " + tab.name + "\n  </a>\n</li>";
  }
  h += '</ul>';
  h += '<div id="tabsContent" class="tab-content">';
  for (i = m = 0, len1 = layout.length; m < len1; i = ++m) {
    tab = layout[i];
    active = i > 0 ? '' : 'active';
    h += "<div role=\"tabpanel\" class=\"tab-pane " + active + " one-tab\" id=\"tab" + (under(tab.name)) + "\" style=\"padding-top: 20px;\">\n    <h4>" + tab.name + "</h4>\n    <br>\n    " + (render_fields(tab.fields, data)) + "\n</div>";
  }
  h += '</div>';
  h += '</div>';
  return h;
};

get_layout_fields = function(la) {
  var f, field, j, len, len1, m, ref, t;
  f = {};
  for (j = 0, len = la.length; j < len; j++) {
    t = la[j];
    ref = t.fields;
    for (m = 0, len1 = ref.length; m < len1; m++) {
      field = ref[m];
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

convert_fusion_template = function(templ) {
  var category, col_hash, get_col_hash, hash_to_array, i, j, len, ref, row, tab_hash, tabs, val;
  tab_hash = {};
  tabs = [];
  get_col_hash = function(columns) {
    var col_hash, col_name, i, j, len, ref;
    col_hash = {};
    ref = templ.columns;
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      col_name = ref[i];
      col_hash[col_name] = i;
    }
    return col_hash;
  };
  val = function(field_name, fields, col_hush) {
    return fields[col_hash[field_name]];
  };
  hash_to_array = function(hash) {
    var a, k, tab;
    a = [];
    for (k in hash) {
      tab = {};
      tab.name = k;
      tab.fields = hash[k];
      a.push(tab);
    }
    return a;
  };
  col_hash = get_col_hash(templ.col_hash);
  ref = templ.rows;
  for (i = j = 0, len = ref.length; j < len; i = ++j) {
    row = ref[i];
    category = val('general_category', row, col_hash);
    fieldNames[val('field_name', row, col_hash)] = val('description', row, col_hash);
    if (category) {
      if (tab_hash[category] == null) {
        tab_hash[category] = [];
      }
      tab_hash[category].push(val('field_name', row, col_hash));
    }
  }
  tabs = hash_to_array(tab_hash);
  return tabs;
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

  Templates2.prototype.load_fusion_template = function(template_name, url) {
    return $.ajax({
      url: url,
      dataType: 'json',
      cache: true,
      success: (function(_this) {
        return function(template_json) {
          var t;
          t = convert_fusion_template(template_json);
          console.log(t);
          _this.add_template(template_name, t);
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



},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsOEpBQUE7O0FBQUEsY0FBQSxHQUFlLE1BQWYsQ0FBQTs7QUFBQSxHQUdBLEdBQVUsSUFBQSxLQUFBLENBQ1I7QUFBQSxFQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsRUFDQSxHQUFBLEVBQUssVUFETDtBQUFBLEVBRUEsR0FBQSxFQUFLLENBQUEsV0FGTDtBQUFBLEVBR0EsSUFBQSxFQUFLLENBSEw7QUFBQSxFQUlBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO1dBQ2QsdUJBQUEsQ0FBd0IsR0FBeEIsRUFEYztFQUFBLENBSmhCO0NBRFEsQ0FIVixDQUFBOztBQUFBLHVCQVlBLEdBQTJCLFNBQUMsSUFBRCxHQUFBO0FBQ3pCLEVBQUEsWUFBQSxDQUFhLGNBQWIsQ0FBQSxDQUFBO1NBQ0EsY0FBQSxHQUFpQixVQUFBLENBQVcsaUJBQVgsRUFBOEIsSUFBOUIsRUFGUTtBQUFBLENBWjNCLENBQUE7O0FBQUEsaUJBaUJBLEdBQW1C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O0FBQUEsVUFFQSxLQUFDLENBQUEsWUFBRCxDQUFjLGFBQWQsRUFBNkIsQ0FBN0IsQ0FGQSxDQURPO1FBQUEsRUFBQTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FIVDtLQURGLEVBRG1CO0VBQUEsQ0FyQnJCLENBQUE7O0FBQUEsdUJBaUNBLFNBQUEsR0FBVyxTQUFBLEdBQUE7QUFDVCxRQUFBLHVCQUFBO0FBQUM7QUFBQTtTQUFBLHFDQUFBO2lCQUFBO0FBQUEsbUJBQUEsQ0FBQyxDQUFDLEtBQUYsQ0FBQTtBQUFBO21CQURRO0VBQUEsQ0FqQ1gsQ0FBQTs7QUFBQSx1QkFvQ0EsaUJBQUEsR0FBbUIsU0FBQyxJQUFELEdBQUE7QUFDakIsUUFBQSxpQkFBQTtBQUFBO0FBQUEsU0FBQSw2Q0FBQTtpQkFBQTtBQUNFLE1BQUEsSUFBRyxDQUFDLENBQUMsSUFBRixLQUFVLElBQWI7QUFDRSxlQUFPLENBQVAsQ0FERjtPQURGO0FBQUEsS0FBQTtBQUdDLFdBQU8sQ0FBQSxDQUFQLENBSmdCO0VBQUEsQ0FwQ25CLENBQUE7O0FBQUEsdUJBMENBLFFBQUEsR0FBVSxTQUFDLEdBQUQsRUFBTSxJQUFOLEdBQUE7QUFDUixJQUFBLElBQUksR0FBQSxLQUFPLENBQUEsQ0FBWDtBQUFvQixhQUFRLEVBQVIsQ0FBcEI7S0FBQTtBQUVBLElBQUEsSUFBRyxJQUFDLENBQUEsSUFBSyxDQUFBLEdBQUEsQ0FBVDtBQUNFLGFBQU8sSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQUksQ0FBQyxNQUFYLENBQWtCLElBQWxCLENBQVAsQ0FERjtLQUFBLE1BQUE7QUFHRSxhQUFPLEVBQVAsQ0FIRjtLQUhRO0VBQUEsQ0ExQ1YsQ0FBQTs7b0JBQUE7O0lBMUtGLENBQUE7O0FBQUEsTUE4Tk0sQ0FBQyxPQUFQLEdBQWlCLFVBOU5qQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzcuMzc4OTAwOFxuICBsbmc6IC0xMTcuMTkxNjI4M1xuICB6b29tOjZcbiAgYm91bmRzX2NoYW5nZWQ6IC0+XG4gICAgb25fYm91bmRzX2NoYW5nZWRfbGF0ZXIgMjAwXG5cblxub25fYm91bmRzX2NoYW5nZWRfbGF0ZXIgID0gKG1zZWMpICAtPlxuICBjbGVhclRpbWVvdXQgYm91bmRzX3RpbWVvdXRcbiAgYm91bmRzX3RpbWVvdXQgPSBzZXRUaW1lb3V0IG9uX2JvdW5kc19jaGFuZ2VkLCBtc2VjXG5cbiAgICBcbm9uX2JvdW5kc19jaGFuZ2VkID0oZSkgLT5cbiAgY29uc29sZS5sb2cgXCJib3VuZHNfY2hhbmdlZFwiXG4gIGI9bWFwLmdldEJvdW5kcygpXG4gIHVybF92YWx1ZT1iLnRvVXJsVmFsdWUoKVxuICBuZT1iLmdldE5vcnRoRWFzdCgpXG4gIHN3PWIuZ2V0U291dGhXZXN0KClcbiAgbmVfbGF0PW5lLmxhdCgpXG4gIG5lX2xuZz1uZS5sbmcoKVxuICBzd19sYXQ9c3cubGF0KClcbiAgc3dfbG5nPXN3LmxuZygpXG4gIHN0ID0gR09WV0lLSS5zdGF0ZV9maWx0ZXJcbiAgdHkgPSBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlclxuICBcbiAgIyBCdWlsZCB0aGUgcXVlcnkuXG4gIHE9XCJcIlwiIFwibGF0aXR1ZGVcIjp7XCIkbHRcIjoje25lX2xhdH0sXCIkZ3RcIjoje3N3X2xhdH19LFwibG9uZ2l0dWRlXCI6e1wiJGx0XCI6I3tuZV9sbmd9LFwiJGd0XCI6I3tzd19sbmd9fVwiXCJcIlxuICAjIEFkZCBmaWx0ZXJzIGlmIHRoZXkgZXhpc3RcbiAgcSs9XCJcIlwiLFwic3RhdGVcIjpcIiN7c3R9XCIgXCJcIlwiIGlmIHN0XG4gIHErPVwiXCJcIixcImdvdl90eXBlXCI6XCIje3R5fVwiIFwiXCJcIiBpZiB0eVxuXG5cbiAgZ2V0X3JlY29yZHMgcSwgMjAwLCAgKGRhdGEpIC0+XG4gICAgI2NvbnNvbGUubG9nIFwibGVuZ3RoPSN7ZGF0YS5sZW5ndGh9XCJcbiAgICAjY29uc29sZS5sb2cgXCJsYXQ6ICN7bmVfbGF0fSwje3N3X2xhdH0gbG5nOiAje25lX2xuZ30sICN7c3dfbG5nfVwiXG4gICAgbWFwLnJlbW92ZU1hcmtlcnMoKVxuICAgIGFkZF9tYXJrZXIocmVjKSBmb3IgcmVjIGluIGRhdGFcbiAgICByZXR1cm5cblxuXG5cbmdldF9pY29uID0oZ292X3R5cGUpIC0+XG4gIFxuICBfY2lyY2xlID0oY29sb3IpLT5cbiAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRVxuICAgIGZpbGxPcGFjaXR5OiAwLjVcbiAgICBmaWxsQ29sb3I6Y29sb3JcbiAgICBzdHJva2VXZWlnaHQ6IDFcbiAgICBzdHJva2VDb2xvcjond2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6NlxuXG4gIHN3aXRjaCBnb3ZfdHlwZVxuICAgIHdoZW4gJ0dlbmVyYWwgUHVycG9zZScgdGhlbiByZXR1cm4gX2NpcmNsZSAnIzAzQydcbiAgICB3aGVuICdDZW1ldGVyaWVzJyAgICAgIHRoZW4gcmV0dXJuIF9jaXJjbGUgJyMwMDAnXG4gICAgd2hlbiAnSG9zcGl0YWxzJyAgICAgICB0aGVuIHJldHVybiBfY2lyY2xlICcjMEMwJ1xuICAgIGVsc2UgcmV0dXJuIF9jaXJjbGUgJyNEMjAnXG5cblxuXG5cbmFkZF9tYXJrZXIgPShyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIG1hcC5hZGRNYXJrZXJcbiAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuICAgIGxuZzogcmVjLmxvbmdpdHVkZVxuICAgIGljb246IGdldF9pY29uKHJlYy5nb3ZfdHlwZSlcbiAgICB0aXRsZTogIFwiI3tyZWMuZ292X25hbWV9LCAje3JlYy5nb3ZfdHlwZX0gKCN7cmVjLmxhdGl0dWRlfSwgI3tyZWMubG9uZ2l0dWRlfSlcIlxuICAgIGluZm9XaW5kb3c6XG4gICAgICBjb250ZW50OiBjcmVhdGVfaW5mb193aW5kb3cgcmVjXG4gICAgY2xpY2s6IChlKS0+XG4gICAgICB3aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCByZWNcbiAgXG4gIHJldHVyblxuXG5cbmNyZWF0ZV9pbmZvX3dpbmRvdyA9KHIpIC0+XG4gIHcgPSAkKCc8ZGl2PjwvZGl2PicpXG4gIC5hcHBlbmQgJChcIjxhIGhyZWY9JyMnPjxzdHJvbmc+I3tyLmdvdl9uYW1lfTwvc3Ryb25nPjwvYT5cIikuY2xpY2sgKGUpLT5cbiAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICBjb25zb2xlLmxvZyByXG4gICAgd2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQgclxuXG4gIC5hcHBlbmQgJChcIjxkaXY+ICN7ci5nb3ZfdHlwZX0gICN7ci5jaXR5fSAje3IuemlwfSAje3Iuc3RhdGV9PC9kaXY+XCIpXG4gIHJldHVybiB3WzBdXG5cblxuXG5cbmdldF9yZWNvcmRzID0gKHF1ZXJ5LCBsaW1pdCwgb25zdWNjZXNzKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IFwiaHR0cHM6Ly9hcGkubW9uZ29sYWIuY29tL2FwaS8xL2RhdGFiYXNlcy9nb3Z3aWtpL2NvbGxlY3Rpb25zL2dvdnMvP3E9eyN7cXVlcnl9fSZmPXtfaWQ6MH0mbD0je2xpbWl0fSZzPXtyYW5kOjF9JmFwaUtleT0wWTVYX1FrMnVPSlJkSEpXSktTUldrNmw2SnFWVFMyeVwiXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2Vzczogb25zdWNjZXNzXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuXG5cbiMgR0VPQ09ESU5HID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cblxucGluSW1hZ2UgPSBuZXcgKGdvb2dsZS5tYXBzLk1hcmtlckltYWdlKShcbiAgJ2h0dHA6Ly9jaGFydC5hcGlzLmdvb2dsZS5jb20vY2hhcnQ/Y2hzdD1kX21hcF9waW5fbGV0dGVyJmNobGQ9Wnw3Nzc3QkJ8RkZGRkZGJyAsXG4gIG5ldyAoZ29vZ2xlLm1hcHMuU2l6ZSkoMjEsIDM0KSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMCwgMCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDEwLCAzNClcbiAgKVxuXG5cbmdlb2NvZGVfYWRkciA9IChhZGRyLGRhdGEpIC0+XG4gIEdNYXBzLmdlb2NvZGVcbiAgICBhZGRyZXNzOiBhZGRyXG4gICAgY2FsbGJhY2s6IChyZXN1bHRzLCBzdGF0dXMpIC0+XG4gICAgICBpZiBzdGF0dXMgPT0gJ09LJ1xuICAgICAgICBsYXRsbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uXG4gICAgICAgIG1hcC5zZXRDZW50ZXIgbGF0bG5nLmxhdCgpLCBsYXRsbmcubG5nKClcbiAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgIGxhdDogbGF0bG5nLmxhdCgpXG4gICAgICAgICAgbG5nOiBsYXRsbmcubG5nKClcbiAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgdGl0bGU6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgY29udGVudDogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICBcbiAgICAgICAgaWYgZGF0YVxuICAgICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICAgIGxhdDogZGF0YS5sYXRpdHVkZVxuICAgICAgICAgICAgbG5nOiBkYXRhLmxvbmdpdHVkZVxuICAgICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgICAgY29sb3I6ICdibHVlJ1xuICAgICAgICAgICAgaWNvbjogcGluSW1hZ2VcbiAgICAgICAgICAgIHRpdGxlOiAgXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICAgIGNvbnRlbnQ6IFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBcbiAgICAgICAgJCgnLmdvdm1hcC1mb3VuZCcpLmh0bWwgXCI8c3Ryb25nPkZPVU5EOiA8L3N0cm9uZz4je3Jlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3N9XCJcbiAgICAgIHJldHVyblxuXG5cbmNsZWFyPShzKS0+XG4gIHJldHVybiBpZiBzLm1hdGNoKC8gYm94IC9pKSB0aGVuICcnIGVsc2Ugc1xuXG5nZW9jb2RlID0gKGRhdGEpIC0+XG4gIGFkZHIgPSBcIiN7Y2xlYXIoZGF0YS5hZGRyZXNzMSl9ICN7Y2xlYXIoZGF0YS5hZGRyZXNzMil9LCAje2RhdGEuY2l0eX0sICN7ZGF0YS5zdGF0ZX0gI3tkYXRhLnppcH0sIFVTQVwiXG4gICQoJyNnb3ZhZGRyZXNzJykudmFsKGFkZHIpXG4gIGdlb2NvZGVfYWRkciBhZGRyLCBkYXRhXG5cblxubW9kdWxlLmV4cG9ydHMgPVxuICBnZW9jb2RlOiBnZW9jb2RlXG4gIGdvY29kZV9hZGRyOiBnZW9jb2RlX2FkZHJcbiAgb25fYm91bmRzX2NoYW5nZWQ6IG9uX2JvdW5kc19jaGFuZ2VkXG4gIG9uX2JvdW5kc19jaGFuZ2VkX2xhdGVyOiBvbl9ib3VuZHNfY2hhbmdlZF9sYXRlclxuXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgIEBnb3ZzX2FycmF5ID0gZ292c1xuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuICAgIFxuICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoZ292cywgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IEBjb3VudF9nb3ZzKClcbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cblxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG4jX2pxZ3MgICAgICAgPSByZXF1aXJlICcuL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5UZW1wbGF0ZXMyICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xuZ292bWFwICAgICAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4jc2Nyb2xsdG8gPSByZXF1aXJlICcuLi9ib3dlcl9jb21wb25lbnRzL2pxdWVyeS5zY3JvbGxUby9qcXVlcnkuc2Nyb2xsVG8uanMnXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgc3RhdGVfZmlsdGVyIDogJydcbiAgZ292X3R5cGVfZmlsdGVyIDogJydcblxuXG5cblxuXG5nb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnZGF0YS9oX3R5cGVzLmpzb24nLCA3XG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYj1cIlwiXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPShuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiN3aW5kb3cuZ2VvY29kZV9hZGRyID0gKGlucHV0X3NlbGVjdG9yKS0+IGdvdm1hcC5nb2NvZGVfYWRkciAkKGlucHV0X3NlbGVjdG9yKS52YWwoKVxuXG5hY3RpdmF0ZV90YWIgPSgpIC0+XG4gICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nIyN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICNyZW5kZXJEYXRhICcjZGV0YWlscycsIGRhdGFcbiAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICBhY3RpdmF0ZV90YWIoKVxuICBnZXRfcmVjb3JkIFwiaW5jX2lkOiN7ZGF0YVtcImluY19pZFwiXX1cIlxuICAkKHdpbmRvdykuc2Nyb2xsVG8oJyNwQmFja1RvU2VhcmNoJyw2MDApXG4gIHJldHVyblxuXG5cbmdldF9yZWNvcmQgPSAocXVlcnkpIC0+XG4gICQuYWpheFxuICAgIHVybDogXCJodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvY29sbGVjdGlvbnMvZ292cy8/cT17I3txdWVyeX19JmY9e19pZDowfSZsPTEmYXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEubGVuZ3RoXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YVswXSlcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgI2dvdm1hcC5nZW9jb2RlIGRhdGFbMF1cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0ocmVjKT0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuICAkKHdpbmRvdykuc2Nyb2xsVG8oJyNwQmFja1RvU2VhcmNoJyw2MDApXG5cbiAgICAgIFxuIyMjXG53aW5kb3cuc2hvd19yZWMgPSAocmVjKS0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuIyMjXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6ICdodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvcnVuQ29tbWFuZD9hcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnknXG4gICAgdHlwZTogJ1BPU1QnXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICNhPSQuZXh0ZW5kIHRydWUgW10sZGF0YVxuICAgICAgdmFsdWVzPWRhdGEudmFsdWVzXG4gICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIHZhbHVlcy5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICBzICA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgcyArPSBcIjwvc2VsZWN0PlwiXG4gIHNlbGVjdCA9ICQocylcbiAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG4gIFxuICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgaWYgdGV4dCBpcyAnU3RhdGUuLidcbiAgICBzZWxlY3QudmFsICdDQSdcbiAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXI9J0NBJ1xuICAgIGdvdm1hcC5vbl9ib3VuZHNfY2hhbmdlZF9sYXRlcigpXG5cbiAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgd2luZG93LkdPVldJS0lbd2hlcmVfdG9fc3RvcmVfdmFsdWVdID0gZWwudmFsKClcbiAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcbiAgICBnb3ZtYXAub25fYm91bmRzX2NoYW5nZWQoKVxuXG5cbmFkanVzdF90eXBlYWhlYWRfd2lkdGggPSgpIC0+XG4gIGlucCA9ICQoJyNteWlucHV0JylcbiAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9KCkgLT5cbiAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuXG5cbiMgYWRkIGxpdmUgcmVsb2FkIHRvIHRoZSBzaXRlLiBGb3IgZGV2ZWxvcG1lbnQgb25seS5cbmxpdmVyZWxvYWQgPSAocG9ydCkgLT5cbiAgdXJsPXdpbmRvdy5sb2NhdGlvbi5vcmlnaW4ucmVwbGFjZSAvOlteOl0qJC8sIFwiXCJcbiAgJC5nZXRTY3JpcHQgdXJsICsgXCI6XCIgKyBwb3J0LCA9PlxuICAgICQoJ2JvZHknKS5hcHBlbmQgXCJcIlwiXG4gICAgPGRpdiBzdHlsZT0ncG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoxMDAwO1xuICAgIHdpZHRoOjEwMCU7IHRvcDowO2NvbG9yOnJlZDsgdGV4dC1hbGlnbjogY2VudGVyOyBcbiAgICBwYWRkaW5nOjFweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxJz5saXZlPC9kaXY+XG4gICAgXCJcIlwiXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICBzZXRUaW1lb3V0ICgtPiAkKCcjbXlpbnB1dCcpLmZvY3VzKCkpICxtc2VjXG5cblxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4jdGVtcGxhdGVzLmxvYWRfdGVtcGxhdGUgXCJ0YWJzXCIsIFwiY29uZmlnL3RhYmxheW91dC5qc29uXCJcbnRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJyAsICdTdGF0ZS4uJyAsICd7XCJkaXN0aW5jdFwiOiBcImdvdnNcIixcImtleVwiOlwic3RhdGVcIn0nICwgJ3N0YXRlX2ZpbHRlcicpXG5idWlsZF9zZWxlY3RvcignLmdvdi10eXBlLWNvbnRhaW5lcicgLCAndHlwZSBvZiBnb3Zlcm5tZW50Li4nICwgJ3tcImRpc3RpbmN0XCI6IFwiZ292c1wiLFwia2V5XCI6XCJnb3ZfdHlwZVwifScgLCAnZ292X3R5cGVfZmlsdGVyJylcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5zdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gIGUucHJldmVudERlZmF1bHQoKVxuICAkKHdpbmRvdykuc2Nyb2xsVG8oJzBweCcsNTAwKVxuICBmb2N1c19zZWFyY2hfZmllbGQgNTAwXG5cblxuI2ZvY3VzX3NlYXJjaF9maWVsZCA1MDBcblxuICBcblxubGl2ZXJlbG9hZCBcIjkwOTBcIlxuXG4iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpZycpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FUyBcbmZpZWxkTmFtZXMgPSB7fVxuXG5cbnJlbmRlcl9maWVsZF92YWx1ZSA9KG4sZGF0YSkgLT5cbiAgdj1kYXRhW25dXG4gIGlmIG5vdCBkYXRhW25dXG4gICAgcmV0dXJuICcnXG5cbiAgaWYgbiA9PSBcIndlYl9zaXRlXCJcbiAgICByZXR1cm4gXCI8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nI3t2fSc+I3t2fTwvYT5cIlxuICBlbHNlXG4gICAgcmV0dXJuIHZcbiAgXG4gIFxuXG5yZW5kZXJfZmllbGRfbmFtZSA9IChmTmFtZSkgLT5cbiAgaWYgZmllbGROYW1lc1tmTmFtZV0/XG4gICAgcmV0dXJuIGZpZWxkTmFtZXNbZk5hbWVdXG5cbiAgcyA9IGZOYW1lLnJlcGxhY2UoL18vZyxcIiBcIilcbiAgcyA9IHMuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBzLnN1YnN0cmluZygxKVxuICByZXR1cm4gc1xuXG5cbnJlbmRlcl9maWVsZCA9IChmTmFtZSxkYXRhKS0+XG4gICNyZXR1cm4gJycgIHVubGVzcyBmVmFsdWUgPSBkYXRhW2ZOYW1lXVxuICBcIlwiXCJcbiAgPGRpdj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLW5hbSc+I3tyZW5kZXJfZmllbGRfbmFtZSBmTmFtZX08L3NwYW4+XG4gICAgICA8c3BhbiBjbGFzcz0nZi12YWwnPiN7cmVuZGVyX2ZpZWxkX3ZhbHVlKGZOYW1lLGRhdGEpfTwvc3Bhbj5cbiAgPC9kaXY+XG4gIFwiXCJcIlxuXG4gIFxucmVuZGVyX2ZpZWxkcyA9KCBmaWVsZHMsIGRhdGEpIC0+XG4gICggcmVuZGVyX2ZpZWxkKGYsIGRhdGEpIGZvciBmIGluIGZpZWxkcykuam9pbignJylcblxuXG4gIFxudW5kZXIgPSAocykgLT4gcy5yZXBsYWNlKC8gL2csICdfJylcblxuXG5yZW5kZXJfdGFicyA9IChpbml0aWFsX2xheW91dCwgZGF0YSkgLT5cbiAgbGF5b3V0ID0gYWRkX290aGVyX3RhYl90b19sYXlvdXQgaW5pdGlhbF9sYXlvdXQsIGRhdGFcbiAgXG4gICMgVGl0bGVcbiAgaCA9IFwiPGgzPiN7ZGF0YS5nb3ZfbmFtZX08L2gzPlwiXG4gIFxuICAjcmVuZGVyIGhlYWRlclxuICBoICs9ICc8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiID4nXG5cbiAgI3JlbmRlciB0YWJzXG4gIGggKz0nPHVsIGlkPVwiZmllbGRUYWJzXCIgY2xhc3M9XCJuYXYgbmF2LXBpbGxzXCIgcm9sZT1cInRhYmxpc3RcIj4nXG4gIFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICAgIDxsaSByb2xlPVwicHJlc2VudGF0aW9uXCIgY2xhc3M9XCIje2FjdGl2ZX1cIiAgb25jbGljaz1cInJlbWVtYmVyX3RhYignI3t1bmRlcih0YWIubmFtZSl9JylcIj5cbiAgICAgICAgPGEgaHJlZj1cIiN0YWIje3VuZGVyKHRhYi5uYW1lKX1cIiBhcmlhLWNvbnRyb2xzPVwiaG9tZVwiIHJvbGU9XCJ0YWJcIiBkYXRhLXRvZ2dsZT1cInRhYlwiPlxuICAgICAgICAje3RhYi5uYW1lfVxuICAgICAgICA8L2E+XG4gICAgICA8L2xpPlxuICAgIFwiXCJcIlxuXG4gIGggKz0gJzwvdWw+J1xuICBoICs9ICc8ZGl2IGlkPVwidGFic0NvbnRlbnRcIiBjbGFzcz1cInRhYi1jb250ZW50XCI+J1xuXG4gICNyZW5kZXIgdGFicyBjb250ZW50XG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBhY3RpdmUgPSBpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnXG4gICAgaCArPVwiXCJcIlxuICAgIDxkaXYgcm9sZT1cInRhYnBhbmVsXCIgY2xhc3M9XCJ0YWItcGFuZSAje2FjdGl2ZX0gb25lLXRhYlwiIGlkPVwidGFiI3t1bmRlcih0YWIubmFtZSl9XCIgc3R5bGU9XCJwYWRkaW5nLXRvcDogMjBweDtcIj5cbiAgICAgICAgPGg0PiN7dGFiLm5hbWV9PC9oND5cbiAgICAgICAgPGJyPlxuICAgICAgICAje3JlbmRlcl9maWVsZHMgdGFiLmZpZWxkcywgZGF0YX1cbiAgICA8L2Rpdj5cbiAgICBcIlwiXCJcbiAgXG4gICNyZW5kZXIgZm9vdGVyXG4gIGggKz0nPC9kaXY+J1xuICBoICs9JzwvZGl2PidcbiAgcmV0dXJuIGhcblxuXG5nZXRfbGF5b3V0X2ZpZWxkcyA9IChsYSkgLT5cbiAgZiA9IHt9XG4gIGZvciB0IGluIGxhXG4gICAgZm9yIGZpZWxkIGluIHQuZmllbGRzXG4gICAgICBmW2ZpZWxkXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3JlY29yZF9maWVsZHMgPSAocikgLT5cbiAgZiA9IHt9XG4gIGZvciBmaWVsZF9uYW1lIG9mIHJcbiAgICBmW2ZpZWxkX25hbWVdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfdW5tZW50aW9uZWRfZmllbGRzID0gKGxhLCByKSAtPlxuICBsYXlvdXRfZmllbGRzID0gZ2V0X2xheW91dF9maWVsZHMgbGFcbiAgcmVjb3JkX2ZpZWxkcyA9IGdldF9yZWNvcmRfZmllbGRzIHJcbiAgdW5tZW50aW9uZWRfZmllbGRzID0gW11cbiAgdW5tZW50aW9uZWRfZmllbGRzLnB1c2goZikgZm9yIGYgb2YgcmVjb3JkX2ZpZWxkcyB3aGVuIG5vdCBsYXlvdXRfZmllbGRzW2ZdXG4gIHJldHVybiB1bm1lbnRpb25lZF9maWVsZHNcblxuXG5hZGRfb3RoZXJfdGFiX3RvX2xheW91dCA9IChsYXlvdXQ9W10sIGRhdGEpIC0+XG4gICNjbG9uZSB0aGUgbGF5b3V0XG4gIGwgPSAkLmV4dGVuZCB0cnVlLCBbXSwgbGF5b3V0XG4gIHQgPVxuICAgIG5hbWU6IFwiT3RoZXJcIlxuICAgIGZpZWxkczogZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyBsLCBkYXRhXG5cbiAgbC5wdXNoIHRcbiAgcmV0dXJuIGxcblxuXG4jIGNvbnZlcnRzIHRhYiB0ZW1wbGF0ZSBkZXNjcmliZWQgaW4gZ29vZ2xlIGZ1c2lvbiB0YWJsZSB0byBcbiMgdGFiIHRlbXBsYXRlXG5jb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZT0odGVtcGwpIC0+XG4gIHRhYl9oYXNoPXt9XG4gIHRhYnM9W11cbiAgIyByZXR1cm5zIGhhc2ggb2YgZmllbGQgbmFtZXMgYW5kIHRoZWlyIHBvc2l0aW9ucyBpbiBhcnJheSBvZiBmaWVsZCBuYW1lc1xuICBnZXRfY29sX2hhc2ggPSAoY29sdW1ucykgLT5cbiAgICBjb2xfaGFzaCA9e31cbiAgICBjb2xfaGFzaFtjb2xfbmFtZV09aSBmb3IgY29sX25hbWUsaSBpbiB0ZW1wbC5jb2x1bW5zXG4gICAgcmV0dXJuIGNvbF9oYXNoXG4gIFxuICAjIHJldHVybnMgZmVpbGQgdmFsdWUgYnkgaXRzIG5hbWUsIGFycmF5IG9mIGZpZWxkcywgYW5kIGhhc2ggb2YgZmllbGRzXG4gIHZhbCA9IChmaWVsZF9uYW1lLCBmaWVsZHMsIGNvbF9odXNoKSAtPlxuICAgIGZpZWxkc1tjb2xfaGFzaFtmaWVsZF9uYW1lXV1cbiAgXG4gICMgY29udmVydHMgaGFzaCB0byBhbiBhcnJheSB0ZW1wbGF0ZVxuICBoYXNoX3RvX2FycmF5ID0oaGFzaCkgLT5cbiAgICBhID0gW11cbiAgICBmb3IgayBvZiBoYXNoXG4gICAgICB0YWIgPSB7fVxuICAgICAgdGFiLm5hbWU9a1xuICAgICAgdGFiLmZpZWxkcz1oYXNoW2tdXG4gICAgICBhLnB1c2ggdGFiXG4gICAgcmV0dXJuIGFcblxuICAgIFxuICBjb2xfaGFzaCA9IGdldF9jb2xfaGFzaCh0ZW1wbC5jb2xfaGFzaClcbiAgXG4gIGZvciByb3csaSBpbiB0ZW1wbC5yb3dzXG4gICAgY2F0ZWdvcnkgPSB2YWwgJ2dlbmVyYWxfY2F0ZWdvcnknLCByb3csIGNvbF9oYXNoXG4gICAgI3RhYl9oYXNoW2NhdGVnb3J5XT1bXSB1bmxlc3MgdGFiX2hhc2hbY2F0ZWdvcnldXG4gICAgZmllbGROYW1lc1t2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXT12YWwgJ2Rlc2NyaXB0aW9uJywgcm93LCBjb2xfaGFzaFxuICAgIGlmIGNhdGVnb3J5XG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0/PVtdXG4gICAgICB0YWJfaGFzaFtjYXRlZ29yeV0ucHVzaCB2YWwgJ2ZpZWxkX25hbWUnLCByb3csIGNvbF9oYXNoXG5cbiAgdGFicyA9IGhhc2hfdG9fYXJyYXkodGFiX2hhc2gpXG4gIHJldHVybiB0YWJzXG5cblxuY2xhc3MgVGVtcGxhdGVzMlxuXG4gIEBsaXN0ID0gdW5kZWZpbmVkXG5cbiAgY29uc3RydWN0b3I6KCkgLT5cbiAgICBAbGlzdCA9IFtdXG5cbiAgYWRkX3RlbXBsYXRlOiAobGF5b3V0X25hbWUsIGxheW91dF9qc29uKSAtPlxuICAgIEBsaXN0LnB1c2hcbiAgICAgIG5hbWU6bGF5b3V0X25hbWVcbiAgICAgIHJlbmRlcjooZGF0KSAtPlxuICAgICAgICByZW5kZXJfdGFicyhsYXlvdXRfanNvbiwgZGF0KVxuXG5cbiAgbG9hZF90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0ZW1wbGF0ZV9qc29uKVxuICAgICAgICByZXR1cm5cblxuICBsb2FkX2Z1c2lvbl90ZW1wbGF0ZToodGVtcGxhdGVfbmFtZSwgdXJsKSAtPlxuICAgICQuYWpheFxuICAgICAgdXJsOiB1cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiAodGVtcGxhdGVfanNvbikgPT5cbiAgICAgICAgdCA9IGNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlIHRlbXBsYXRlX2pzb25cbiAgICAgICAgY29uc29sZS5sb2cgdFxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHQpXG4gICAgICAgIHJldHVyblxuXG5cbiAgZ2V0X25hbWVzOiAtPlxuICAgICh0Lm5hbWUgZm9yIHQgaW4gQGxpc3QpXG5cbiAgZ2V0X2luZGV4X2J5X25hbWU6IChuYW1lKSAtPlxuICAgIGZvciB0LGkgaW4gQGxpc3RcbiAgICAgIGlmIHQubmFtZSBpcyBuYW1lXG4gICAgICAgIHJldHVybiBpXG4gICAgIHJldHVybiAtMVxuXG4gIGdldF9odG1sOiAoaW5kLCBkYXRhKSAtPlxuICAgIGlmIChpbmQgaXMgLTEpIHRoZW4gcmV0dXJuICBcIlwiXG4gICAgXG4gICAgaWYgQGxpc3RbaW5kXVxuICAgICAgcmV0dXJuIEBsaXN0W2luZF0ucmVuZGVyKGRhdGEpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFwiXCJcblxuXG5cbm1vZHVsZS5leHBvcnRzID0gVGVtcGxhdGVzMlxuIl19
