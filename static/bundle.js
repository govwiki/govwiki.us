(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, clear, create_info_window, geocode, geocode_addr, get_icon, get_records, map, on_bounds_changed, pinImage;

bounds_timeout = void 0;

map = new GMaps({
  el: '#govmap',
  lat: 38.1355146,
  lng: -111.2349786,
  zoom: 5,
  bounds_changed: function() {
    clearTimeout(bounds_timeout);
    return bounds_timeout = setTimeout(on_bounds_changed, 300);
  }
});

on_bounds_changed = function(e) {
  var b, ne, ne_lat, ne_lng, q, sw, sw_lat, sw_lng, url_value;
  console.log("bounds_changed");
  b = map.getBounds();
  url_value = b.toUrlValue();
  ne = b.getNorthEast();
  sw = b.getSouthWest();
  ne_lat = ne.lat();
  ne_lng = ne.lng();
  sw_lat = sw.lat();
  sw_lng = sw.lng();
  q = " \"latitude\":{\"$lt\":" + ne_lat + ",\"$gt\":" + sw_lat + "},\"longitude\":{\"$lt\":" + ne_lng + ",\"$gt\":" + sw_lng + "}";
  return get_records(q, 200, function(data) {
    var i, len, rec;
    console.log("length=" + data.length);
    console.log("lat: " + ne_lat + "," + sw_lat + " lng: " + ne_lng + ", " + sw_lng);
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
  gocode_addr: geocode_addr
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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, build_select_element, build_selector, get_record, gov_selector, govmap, livereload, start_adjusting_typeahead_width, templates;

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
  return select.change(function(e) {
    var el;
    el = $(e.target);
    window.GOVWIKI[where_to_store_value] = el.val();
    return $('.gov-counter').text(gov_selector.count_govs());
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

templates.load_fusion_template("tabs", "https://www.googleapis.com/fusiontables/v2/query?sql=SELECT%20*%20FROM%201z2oXQEYQ3p2OoMI8V5gKgHWB5Tz990BrQ1xc1tVo&key=AIzaSyCXDQyMDpGA2g3Qjuv4CDv7zRj-ix4IQJA");

build_selector('.state-container', 'State..', '{"distinct": "govs","key":"state"}', 'state_filter');

build_selector('.gov-type-container', 'type of government..', '{"distinct": "govs","key":"gov_type"}', 'gov_type_filter');

adjust_typeahead_width();

start_adjusting_typeahead_width();

$('#btnBackToSearch').click(function(e) {
  e.preventDefault();
  $(window).scrollTo('0px', 500);
  return setTimeout(function() {
    return $('#myinput').focus();
  }, 500);
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


/*
load_field_names = (url) ->
  $.ajax
    url: url
    dataType: 'json'
    cache: true
    success: (fieldnames_json) =>
      fieldNames = fieldnames_json
      return
    error:(e)->
      console.log e


load_field_names("config/fieldnames.json")
 */

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
  h = '<div role="tabpanel" >';
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
    h += "<div role=\"tabpanel\" class=\"tab-pane " + active + " one-tab\" id=\"tab" + (under(tab.name)) + "\" style=\"padding-top: 20px;\">\n    <h3>" + tab.name + "</h3>\n    <br>\n    " + (render_fields(tab.fields, data)) + "\n</div>";
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEscUlBQUE7O0FBQUEsY0FBQSxHQUFlLE1BQWYsQ0FBQTs7QUFBQSxHQUdBLEdBQVUsSUFBQSxLQUFBLENBQ1I7QUFBQSxFQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsRUFDQSxHQUFBLEVBQUssVUFETDtBQUFBLEVBRUEsR0FBQSxFQUFLLENBQUEsV0FGTDtBQUFBLEVBR0EsSUFBQSxFQUFLLENBSEw7QUFBQSxFQUlBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO0FBQ2QsSUFBQSxZQUFBLENBQWEsY0FBYixDQUFBLENBQUE7V0FDQSxjQUFBLEdBQWlCLFVBQUEsQ0FBVyxpQkFBWCxFQUE4QixHQUE5QixFQUZIO0VBQUEsQ0FKaEI7Q0FEUSxDQUhWLENBQUE7O0FBQUEsaUJBYUEsR0FBbUIsU0FBQyxDQUFELEdBQUE7QUFDakIsTUFBQSx1REFBQTtBQUFBLEVBQUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxnQkFBWixDQUFBLENBQUE7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S0FBTyxDQUFBLENBQVg7QUFBb0IsYUFBUSxFQUFSLENBQXBCO0tBQUE7QUFFQSxJQUFBLElBQUcsSUFBQyxDQUFBLElBQUssQ0FBQSxHQUFBLENBQVQ7QUFDRSxhQUFPLElBQUMsQ0FBQSxJQUFLLENBQUEsR0FBQSxDQUFJLENBQUMsTUFBWCxDQUFrQixJQUFsQixDQUFQLENBREY7S0FBQSxNQUFBO0FBR0UsYUFBTyxFQUFQLENBSEY7S0FIUTtFQUFBLENBMUNWLENBQUE7O29CQUFBOztJQXRMRixDQUFBOztBQUFBLE1BME9NLENBQUMsT0FBUCxHQUFpQixVQTFPakIsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJib3VuZHNfdGltZW91dD11bmRlZmluZWRcblxuXG5tYXAgPSBuZXcgR01hcHNcbiAgZWw6ICcjZ292bWFwJ1xuICBsYXQ6IDM4LjEzNTUxNDZcbiAgbG5nOiAtMTExLjIzNDk3ODZcbiAgem9vbTo1XG4gIGJvdW5kc19jaGFuZ2VkOiAtPlxuICAgIGNsZWFyVGltZW91dCBib3VuZHNfdGltZW91dFxuICAgIGJvdW5kc190aW1lb3V0ID0gc2V0VGltZW91dCBvbl9ib3VuZHNfY2hhbmdlZCwgMzAwXG5cblxub25fYm91bmRzX2NoYW5nZWQgPShlKSAtPlxuICBjb25zb2xlLmxvZyBcImJvdW5kc19jaGFuZ2VkXCJcbiAgYj1tYXAuZ2V0Qm91bmRzKClcbiAgdXJsX3ZhbHVlPWIudG9VcmxWYWx1ZSgpXG4gIG5lPWIuZ2V0Tm9ydGhFYXN0KClcbiAgc3c9Yi5nZXRTb3V0aFdlc3QoKVxuICBuZV9sYXQ9bmUubGF0KClcbiAgbmVfbG5nPW5lLmxuZygpXG4gIHN3X2xhdD1zdy5sYXQoKVxuICBzd19sbmc9c3cubG5nKClcbiAgcT1cIlwiXCIgXCJsYXRpdHVkZVwiOntcIiRsdFwiOiN7bmVfbGF0fSxcIiRndFwiOiN7c3dfbGF0fX0sXCJsb25naXR1ZGVcIjp7XCIkbHRcIjoje25lX2xuZ30sXCIkZ3RcIjoje3N3X2xuZ319XCJcIlwiXG4gIGdldF9yZWNvcmRzIHEsIDIwMCwgIChkYXRhKSAtPlxuICAgIGNvbnNvbGUubG9nIFwibGVuZ3RoPSN7ZGF0YS5sZW5ndGh9XCJcbiAgICBjb25zb2xlLmxvZyBcImxhdDogI3tuZV9sYXR9LCN7c3dfbGF0fSBsbmc6ICN7bmVfbG5nfSwgI3tzd19sbmd9XCJcbiAgICBtYXAucmVtb3ZlTWFya2VycygpXG4gICAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gZGF0YVxuICAgIHJldHVyblxuXG5cblxuZ2V0X2ljb24gPShnb3ZfdHlwZSkgLT5cbiAgXG4gIF9jaXJjbGUgPShjb2xvciktPlxuICAgIHBhdGg6IGdvb2dsZS5tYXBzLlN5bWJvbFBhdGguQ0lSQ0xFXG4gICAgZmlsbE9wYWNpdHk6IDAuNVxuICAgIGZpbGxDb2xvcjpjb2xvclxuICAgIHN0cm9rZVdlaWdodDogMVxuICAgIHN0cm9rZUNvbG9yOid3aGl0ZSdcbiAgICAjc3Ryb2tlUG9zaXRpb246IGdvb2dsZS5tYXBzLlN0cm9rZVBvc2l0aW9uLk9VVFNJREVcbiAgICBzY2FsZTo2XG5cbiAgc3dpdGNoIGdvdl90eXBlXG4gICAgd2hlbiAnR2VuZXJhbCBQdXJwb3NlJyB0aGVuIHJldHVybiBfY2lyY2xlICcjMDNDJ1xuICAgIHdoZW4gJ0NlbWV0ZXJpZXMnICAgICAgdGhlbiByZXR1cm4gX2NpcmNsZSAnIzAwMCdcbiAgICB3aGVuICdIb3NwaXRhbHMnICAgICAgIHRoZW4gcmV0dXJuIF9jaXJjbGUgJyMwQzAnXG4gICAgZWxzZSByZXR1cm4gX2NpcmNsZSAnI0QyMCdcblxuXG5cblxuYWRkX21hcmtlciA9KHJlYyktPlxuICAjY29uc29sZS5sb2cgXCIje3JlYy5yYW5kfSAje3JlYy5pbmNfaWR9ICN7cmVjLnppcH0gI3tyZWMubGF0aXR1ZGV9ICN7cmVjLmxvbmdpdHVkZX0gI3tyZWMuZ292X25hbWV9XCJcbiAgbWFwLmFkZE1hcmtlclxuICAgIGxhdDogcmVjLmxhdGl0dWRlXG4gICAgbG5nOiByZWMubG9uZ2l0dWRlXG4gICAgaWNvbjogZ2V0X2ljb24ocmVjLmdvdl90eXBlKVxuICAgIHRpdGxlOiAgXCIje3JlYy5nb3ZfbmFtZX0sICN7cmVjLmdvdl90eXBlfSAoI3tyZWMubGF0aXR1ZGV9LCAje3JlYy5sb25naXR1ZGV9KVwiXG4gICAgaW5mb1dpbmRvdzpcbiAgICAgIGNvbnRlbnQ6IGNyZWF0ZV9pbmZvX3dpbmRvdyByZWNcbiAgICBjbGljazogKGUpLT5cbiAgICAgIHdpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkIHJlY1xuICBcbiAgcmV0dXJuXG5cblxuY3JlYXRlX2luZm9fd2luZG93ID0ocikgLT5cbiAgdyA9ICQoJzxkaXY+PC9kaXY+JylcbiAgLmFwcGVuZCAkKFwiPGEgaHJlZj0nIyc+PHN0cm9uZz4je3IuZ292X25hbWV9PC9zdHJvbmc+PC9hPlwiKS5jbGljayAoZSktPlxuICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgIGNvbnNvbGUubG9nIHJcbiAgICB3aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCByXG5cbiAgLmFwcGVuZCAkKFwiPGRpdj4gI3tyLmdvdl90eXBlfSAgI3tyLmNpdHl9ICN7ci56aXB9ICN7ci5zdGF0ZX08L2Rpdj5cIilcbiAgcmV0dXJuIHdbMF1cblxuXG5cblxuZ2V0X3JlY29yZHMgPSAocXVlcnksIGxpbWl0LCBvbnN1Y2Nlc3MpIC0+XG4gICQuYWpheFxuICAgIHVybDogXCJodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvY29sbGVjdGlvbnMvZ292cy8/cT17I3txdWVyeX19JmY9e19pZDowfSZsPSN7bGltaXR9JnM9e3JhbmQ6MX0mYXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5cblxuIyBHRU9DT0RJTkcgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG5waW5JbWFnZSA9IG5ldyAoZ29vZ2xlLm1hcHMuTWFya2VySW1hZ2UpKFxuICAnaHR0cDovL2NoYXJ0LmFwaXMuZ29vZ2xlLmNvbS9jaGFydD9jaHN0PWRfbWFwX3Bpbl9sZXR0ZXImY2hsZD1afDc3NzdCQnxGRkZGRkYnICxcbiAgbmV3IChnb29nbGUubWFwcy5TaXplKSgyMSwgMzQpLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgwLCAwKSxcbiAgbmV3IChnb29nbGUubWFwcy5Qb2ludCkoMTAsIDM0KVxuICApXG5cblxuZ2VvY29kZV9hZGRyID0gKGFkZHIsZGF0YSkgLT5cbiAgR01hcHMuZ2VvY29kZVxuICAgIGFkZHJlc3M6IGFkZHJcbiAgICBjYWxsYmFjazogKHJlc3VsdHMsIHN0YXR1cykgLT5cbiAgICAgIGlmIHN0YXR1cyA9PSAnT0snXG4gICAgICAgIGxhdGxuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb25cbiAgICAgICAgbWFwLnNldENlbnRlciBsYXRsbmcubGF0KCksIGxhdGxuZy5sbmcoKVxuICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgbGF0OiBsYXRsbmcubGF0KClcbiAgICAgICAgICBsbmc6IGxhdGxuZy5sbmcoKVxuICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICB0aXRsZTogcmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc1xuICAgICAgICAgIGluZm9XaW5kb3c6XG4gICAgICAgICAgICBjb250ZW50OiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgIFxuICAgICAgICBpZiBkYXRhXG4gICAgICAgICAgbWFwLmFkZE1hcmtlclxuICAgICAgICAgICAgbGF0OiBkYXRhLmxhdGl0dWRlXG4gICAgICAgICAgICBsbmc6IGRhdGEubG9uZ2l0dWRlXG4gICAgICAgICAgICBzaXplOiAnc21hbGwnXG4gICAgICAgICAgICBjb2xvcjogJ2JsdWUnXG4gICAgICAgICAgICBpY29uOiBwaW5JbWFnZVxuICAgICAgICAgICAgdGl0bGU6ICBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgICAgY29udGVudDogXCIje2RhdGEubGF0aXR1ZGV9ICN7ZGF0YS5sb25naXR1ZGV9XCJcbiAgICAgICAgICAgIFxuICAgICAgICAkKCcuZ292bWFwLWZvdW5kJykuaHRtbCBcIjxzdHJvbmc+Rk9VTkQ6IDwvc3Ryb25nPiN7cmVzdWx0c1swXS5mb3JtYXR0ZWRfYWRkcmVzc31cIlxuICAgICAgcmV0dXJuXG5cblxuY2xlYXI9KHMpLT5cbiAgcmV0dXJuIGlmIHMubWF0Y2goLyBib3ggL2kpIHRoZW4gJycgZWxzZSBzXG5cbmdlb2NvZGUgPSAoZGF0YSkgLT5cbiAgYWRkciA9IFwiI3tjbGVhcihkYXRhLmFkZHJlc3MxKX0gI3tjbGVhcihkYXRhLmFkZHJlc3MyKX0sICN7ZGF0YS5jaXR5fSwgI3tkYXRhLnN0YXRlfSAje2RhdGEuemlwfSwgVVNBXCJcbiAgJCgnI2dvdmFkZHJlc3MnKS52YWwoYWRkcilcbiAgZ2VvY29kZV9hZGRyIGFkZHIsIGRhdGFcblxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdlb2NvZGU6IGdlb2NvZGVcbiAgZ29jb2RlX2FkZHI6IGdlb2NvZGVfYWRkclxuXG4iLCJcbnF1ZXJ5X21hdGNoZXIgPSByZXF1aXJlKCcuL3F1ZXJ5bWF0Y2hlci5jb2ZmZWUnKVxuXG5jbGFzcyBHb3ZTZWxlY3RvclxuICBcbiAgIyBzdHViIG9mIGEgY2FsbGJhY2sgdG8gZW52b2tlIHdoZW4gdGhlIHVzZXIgc2VsZWN0cyBzb21ldGhpbmdcbiAgb25fc2VsZWN0ZWQ6IChldnQsIGRhdGEsIG5hbWUpIC0+XG5cblxuICBjb25zdHJ1Y3RvcjogKEBodG1sX3NlbGVjdG9yLCBkb2NzX3VybCwgQG51bV9pdGVtcykgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogZG9jc191cmxcbiAgICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICAgIGNhY2hlOiB0cnVlXG4gICAgICBzdWNjZXNzOiBAc3RhcnRTdWdnZXN0aW9uXG4gICAgICBcblxuXG5cbiAgc3VnZ2VzdGlvblRlbXBsYXRlIDogSGFuZGxlYmFycy5jb21waWxlKFwiXCJcIlxuICAgIDxkaXYgY2xhc3M9XCJzdWdnLWJveFwiPlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctc3RhdGVcIj57e3tzdGF0ZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctbmFtZVwiPnt7e2dvdl9uYW1lfX19PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic3VnZy10eXBlXCI+e3t7Z292X3R5cGV9fX08L2Rpdj5cbiAgICA8L2Rpdj5cIlwiXCIpXG5cblxuXG4gIGVudGVyZWRfdmFsdWUgPSBcIlwiXG5cbiAgZ292c19hcnJheSA9IFtdXG5cbiAgY291bnRfZ292cyA6ICgpIC0+XG4gICAgY291bnQgPTBcbiAgICBmb3IgZCBpbiBAZ292c19hcnJheVxuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcbiAgICAgIGNvdW50KytcbiAgICByZXR1cm4gY291bnRcblxuXG4gIHN0YXJ0U3VnZ2VzdGlvbiA6IChnb3ZzKSA9PlxuICAgIEBnb3ZzX2FycmF5ID0gZ292c1xuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuICAgIFxuICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoZ292cywgQG51bV9pdGVtcylcbiAgICAgICAgI3NvdXJjZTogYmxvb2Rob3VuZC50dEFkYXB0ZXIoKVxuICAgICAgICB0ZW1wbGF0ZXM6IHN1Z2dlc3Rpb246IEBzdWdnZXN0aW9uVGVtcGxhdGVcbiAgICApXG4gICAgLm9uICd0eXBlYWhlYWQ6c2VsZWN0ZWQnLCAgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnR5cGVhaGVhZCAndmFsJywgQGVudGVyZWRfdmFsdWVcbiAgICAgICAgQG9uX3NlbGVjdGVkKGV2dCwgZGF0YSwgbmFtZSlcbiAgIFxuICAgIC5vbiAndHlwZWFoZWFkOmN1cnNvcmNoYW5nZWQnLCAoZXZ0LCBkYXRhLCBuYW1lKSA9PlxuICAgICAgICAkKCcudHlwZWFoZWFkJykudmFsIEBlbnRlcmVkX3ZhbHVlXG4gICAgXG5cbiAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IEBjb3VudF9nb3ZzKClcbiAgICByZXR1cm5cblxuXG5cblxuXG5tb2R1bGUuZXhwb3J0cz1Hb3ZTZWxlY3RvclxuXG5cblxuIiwiIyMjXG5maWxlOiBtYWluLmNvZmZlIC0tIFRoZSBlbnRyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICA6XG5nb3ZfZmluZGVyID0gbmV3IEdvdkZpbmRlclxuZ292X2RldGFpbHMgPSBuZXcgR292RGV0YWlsc1xuZ292X2ZpbmRlci5vbl9zZWxlY3QgPSBnb3ZfZGV0YWlscy5zaG93XG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjXG5cbkdvdlNlbGVjdG9yID0gcmVxdWlyZSAnLi9nb3ZzZWxlY3Rvci5jb2ZmZWUnXG4jX2pxZ3MgICAgICAgPSByZXF1aXJlICcuL2pxdWVyeS5nb3ZzZWxlY3Rvci5jb2ZmZWUnXG5UZW1wbGF0ZXMyICAgICAgPSByZXF1aXJlICcuL3RlbXBsYXRlczIuY29mZmVlJ1xuZ292bWFwICAgICAgPSByZXF1aXJlICcuL2dvdm1hcC5jb2ZmZWUnXG4jc2Nyb2xsdG8gPSByZXF1aXJlICcuLi9ib3dlcl9jb21wb25lbnRzL2pxdWVyeS5zY3JvbGxUby9qcXVlcnkuc2Nyb2xsVG8uanMnXG5cbndpbmRvdy5HT1ZXSUtJID1cbiAgc3RhdGVfZmlsdGVyIDogJydcbiAgZ292X3R5cGVfZmlsdGVyIDogJydcblxuXG5cblxuXG5nb3Zfc2VsZWN0b3IgPSBuZXcgR292U2VsZWN0b3IgJy50eXBlYWhlYWQnLCAnZGF0YS9oX3R5cGVzLmpzb24nLCA3XG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYj1cIlwiXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPShuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiN3aW5kb3cuZ2VvY29kZV9hZGRyID0gKGlucHV0X3NlbGVjdG9yKS0+IGdvdm1hcC5nb2NvZGVfYWRkciAkKGlucHV0X3NlbGVjdG9yKS52YWwoKVxuXG5hY3RpdmF0ZV90YWIgPSgpIC0+XG4gICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nIyN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICNyZW5kZXJEYXRhICcjZGV0YWlscycsIGRhdGFcbiAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICBhY3RpdmF0ZV90YWIoKVxuICBnZXRfcmVjb3JkIFwiaW5jX2lkOiN7ZGF0YVtcImluY19pZFwiXX1cIlxuICAkKHdpbmRvdykuc2Nyb2xsVG8oJyNwQmFja1RvU2VhcmNoJyw2MDApXG4gIHJldHVyblxuXG5cbmdldF9yZWNvcmQgPSAocXVlcnkpIC0+XG4gICQuYWpheFxuICAgIHVybDogXCJodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvY29sbGVjdGlvbnMvZ292cy8/cT17I3txdWVyeX19JmY9e19pZDowfSZsPTEmYXBpS2V5PTBZNVhfUWsydU9KUmRISldKS1NSV2s2bDZKcVZUUzJ5XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgLT5cbiAgICAgIGlmIGRhdGEubGVuZ3RoXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YVswXSlcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgI2dvdm1hcC5nZW9jb2RlIGRhdGFbMF1cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0ocmVjKT0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuICAkKHdpbmRvdykuc2Nyb2xsVG8oJyNwQmFja1RvU2VhcmNoJyw2MDApXG5cbiAgICAgIFxuIyMjXG53aW5kb3cuc2hvd19yZWMgPSAocmVjKS0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuIyMjXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6ICdodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvcnVuQ29tbWFuZD9hcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnknXG4gICAgdHlwZTogJ1BPU1QnXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICNhPSQuZXh0ZW5kIHRydWUgW10sZGF0YVxuICAgICAgdmFsdWVzPWRhdGEudmFsdWVzXG4gICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIHZhbHVlcy5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICBzICA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgcyArPSBcIjwvc2VsZWN0PlwiXG4gIHNlbGVjdCA9ICQocylcbiAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG4gIHNlbGVjdC5jaGFuZ2UgKGUpIC0+XG4gICAgZWwgPSAkKGUudGFyZ2V0KVxuICAgIHdpbmRvdy5HT1ZXSUtJW3doZXJlX3RvX3N0b3JlX3ZhbHVlXSA9IGVsLnZhbCgpXG4gICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBnb3Zfc2VsZWN0b3IuY291bnRfZ292cygpXG5cblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCA9KCkgLT5cbiAgaW5wID0gJCgnI215aW5wdXQnKVxuICBwYXIgPSAkKCcjdHlwZWFoZWQtY29udGFpbmVyJylcbiAgaW5wLndpZHRoIHBhci53aWR0aCgpXG5cblxuXG5zdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoID0oKSAtPlxuICAkKHdpbmRvdykucmVzaXplIC0+XG4gICAgYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5cblxuIyBhZGQgbGl2ZSByZWxvYWQgdG8gdGhlIHNpdGUuIEZvciBkZXZlbG9wbWVudCBvbmx5LlxubGl2ZXJlbG9hZCA9IChwb3J0KSAtPlxuICB1cmw9d2luZG93LmxvY2F0aW9uLm9yaWdpbi5yZXBsYWNlIC86W146XSokLywgXCJcIlxuICAkLmdldFNjcmlwdCB1cmwgKyBcIjpcIiArIHBvcnQsID0+XG4gICAgJCgnYm9keScpLmFwcGVuZCBcIlwiXCJcbiAgICA8ZGl2IHN0eWxlPSdwb3NpdGlvbjphYnNvbHV0ZTt6LWluZGV4OjEwMDA7XG4gICAgd2lkdGg6MTAwJTsgdG9wOjA7Y29sb3I6cmVkOyB0ZXh0LWFsaWduOiBjZW50ZXI7IFxuICAgIHBhZGRpbmc6MXB4O2ZvbnQtc2l6ZToxMHB4O2xpbmUtaGVpZ2h0OjEnPmxpdmU8L2Rpdj5cbiAgICBcIlwiXCJcblxuXG4gICAgXG4jdGVtcGxhdGVzLmxvYWRfdGVtcGxhdGUgXCJ0YWJzXCIsIFwiY29uZmlnL3RhYmxheW91dC5qc29uXCJcbnRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG5cbiNidWlsZF9zZWxlY3RvcignLnN0YXRlLWNvbnRhaW5lcicgLCAnU3RhdGUuLicgLCAnZGF0YS9zdGF0ZS5qc29uJyAsICdzdGF0ZV9maWx0ZXInKVxuI2J1aWxkX3NlbGVjdG9yKCcuZ292LXR5cGUtY29udGFpbmVyJyAsICd0eXBlIG9mIGdvdmVybm1lbnQuLicgLCAnZGF0YS9nb3ZfdHlwZS5qc29uJyAsICdnb3ZfdHlwZV9maWx0ZXInKVxuXG5idWlsZF9zZWxlY3RvcignLnN0YXRlLWNvbnRhaW5lcicgLCAnU3RhdGUuLicgLCAne1wiZGlzdGluY3RcIjogXCJnb3ZzXCIsXCJrZXlcIjpcInN0YXRlXCJ9JyAsICdzdGF0ZV9maWx0ZXInKVxuYnVpbGRfc2VsZWN0b3IoJy5nb3YtdHlwZS1jb250YWluZXInICwgJ3R5cGUgb2YgZ292ZXJubWVudC4uJyAsICd7XCJkaXN0aW5jdFwiOiBcImdvdnNcIixcImtleVwiOlwiZ292X3R5cGVcIn0nICwgJ2dvdl90eXBlX2ZpbHRlcicpXG5cbmFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCgpXG5cbiQoJyNidG5CYWNrVG9TZWFyY2gnKS5jbGljayAoZSktPlxuICBlLnByZXZlbnREZWZhdWx0KClcbiAgJCh3aW5kb3cpLnNjcm9sbFRvKCcwcHgnLDUwMClcbiAgc2V0VGltZW91dCAtPlxuICAgICQoJyNteWlucHV0JykuZm9jdXMoKVxuICAsNTAwXG5cblxubGl2ZXJlbG9hZCBcIjkwOTBcIlxuXG4iLCJcblxuXG4jIFRha2VzIGFuIGFycmF5IG9mIGRvY3MgdG8gc2VhcmNoIGluLlxuIyBSZXR1cm5zIGEgZnVuY3Rpb25zIHRoYXQgdGFrZXMgMiBwYXJhbXMgXG4jIHEgLSBxdWVyeSBzdHJpbmcgYW5kIFxuIyBjYiAtIGNhbGxiYWNrIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgc2VhcmNoIGlzIGRvbmUuXG4jIGNiIHJldHVybnMgYW4gYXJyYXkgb2YgbWF0Y2hpbmcgZG9jdW1lbnRzLlxuIyBtdW1faXRlbXMgLSBtYXggbnVtYmVyIG9mIGZvdW5kIGl0ZW1zIHRvIHNob3dcblF1ZXJ5TWF0aGVyID0gKGRvY3MsIG51bV9pdGVtcz01KSAtPlxuICAocSwgY2IpIC0+XG4gICAgdGVzdF9zdHJpbmcgPShzLCByZWdzKSAtPlxuICAgICAgKGlmIG5vdCByLnRlc3QocykgdGhlbiByZXR1cm4gZmFsc2UpICBmb3IgciBpbiByZWdzXG4gICAgICByZXR1cm4gdHJ1ZVxuXG4gICAgW3dvcmRzLHJlZ3NdID0gZ2V0X3dvcmRzX3JlZ3MgcVxuICAgIG1hdGNoZXMgPSBbXVxuICAgICMgaXRlcmF0ZSB0aHJvdWdoIHRoZSBwb29sIG9mIGRvY3MgYW5kIGZvciBhbnkgc3RyaW5nIHRoYXRcbiAgICAjIGNvbnRhaW5zIHRoZSBzdWJzdHJpbmcgYHFgLCBhZGQgaXQgdG8gdGhlIGBtYXRjaGVzYCBhcnJheVxuXG4gICAgZm9yIGQgaW4gZG9jc1xuICAgICAgaWYgbWF0Y2hlcy5sZW5ndGggPj0gbnVtX2l0ZW1zIHRoZW4gYnJlYWtcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG5cbiAgICAgIGlmIHRlc3Rfc3RyaW5nKGQuZ292X25hbWUsIHJlZ3MpIHRoZW4gbWF0Y2hlcy5wdXNoICQuZXh0ZW5kKHt9LCBkKVxuICAgICAgI2lmIHRlc3Rfc3RyaW5nKFwiI3tkLmdvdl9uYW1lfSAje2Quc3RhdGV9ICN7ZC5nb3ZfdHlwZX0gI3tkLmluY19pZH1cIiwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgXG4gICAgc2VsZWN0X3RleHQgbWF0Y2hlcywgd29yZHMsIHJlZ3NcbiAgICBjYiBtYXRjaGVzXG4gICAgcmV0dXJuXG4gXG5cbiMgaW5zZXJ0cyA8c3Ryb25nPiBlbGVtZW50c2UgaW4gYXJyYXlcbnNlbGVjdF90ZXh0ID0gKGNsb25lcyx3b3JkcyxyZWdzKSAtPlxuICBmb3IgZCBpbiBjbG9uZXNcbiAgICBkLmdvdl9uYW1lPXN0cm9uZ2lmeShkLmdvdl9uYW1lLCB3b3JkcywgcmVncylcbiAgICAjZC5zdGF0ZT1zdHJvbmdpZnkoZC5zdGF0ZSwgd29yZHMsIHJlZ3MpXG4gICAgI2QuZ292X3R5cGU9c3Ryb25naWZ5KGQuZ292X3R5cGUsIHdvcmRzLCByZWdzKVxuICBcbiAgcmV0dXJuIGNsb25lc1xuXG5cblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZVxuc3Ryb25naWZ5ID0gKHMsIHdvcmRzLCByZWdzKSAtPlxuICByZWdzLmZvckVhY2ggKHIsaSkgLT5cbiAgICBzID0gcy5yZXBsYWNlIHIsIFwiPGI+I3t3b3Jkc1tpXX08L2I+XCJcbiAgcmV0dXJuIHNcblxuIyByZW1vdmVzIDw+IHRhZ3MgZnJvbSBhIHN0cmluZ1xuc3RyaXAgPSAocykgLT5cbiAgcy5yZXBsYWNlKC88W148Pl0qPi9nLCcnKVxuXG5cbiMgYWxsIHRpcm1zIHNwYWNlcyBmcm9tIGJvdGggc2lkZXMgYW5kIG1ha2UgY29udHJhY3RzIHNlcXVlbmNlcyBvZiBzcGFjZXMgdG8gMVxuZnVsbF90cmltID0gKHMpIC0+XG4gIHNzPXMudHJpbSgnJytzKVxuICBzcz1zcy5yZXBsYWNlKC8gKy9nLCcgJylcblxuIyByZXR1cm5zIGFuIGFycmF5IG9mIHdvcmRzIGluIGEgc3RyaW5nXG5nZXRfd29yZHMgPSAoc3RyKSAtPlxuICBmdWxsX3RyaW0oc3RyKS5zcGxpdCgnICcpXG5cblxuZ2V0X3dvcmRzX3JlZ3MgPSAoc3RyKSAtPlxuICB3b3JkcyA9IGdldF93b3JkcyBzdHJcbiAgcmVncyA9IHdvcmRzLm1hcCAodyktPiBuZXcgUmVnRXhwKFwiI3t3fVwiLCdpZycpXG4gIFt3b3JkcyxyZWdzXVxuXG5cbm1vZHVsZS5leHBvcnRzID0gUXVlcnlNYXRoZXJcblxuIiwiXG4jIyNcbiMgZmlsZTogdGVtcGxhdGVzMi5jb2ZmZWUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuI1xuIyBDbGFzcyB0byBtYW5hZ2UgdGVtcGxhdGVzIGFuZCByZW5kZXIgZGF0YSBvbiBodG1sIHBhZ2UuXG4jXG4jIFRoZSBtYWluIG1ldGhvZCA6IHJlbmRlcihkYXRhKSwgZ2V0X2h0bWwoZGF0YSlcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyNcblxuXG5cbiMgTE9BRCBGSUVMRCBOQU1FUyBcbmZpZWxkTmFtZXMgPSB7fVxuXG4jIyNcbmxvYWRfZmllbGRfbmFtZXMgPSAodXJsKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6IHVybFxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChmaWVsZG5hbWVzX2pzb24pID0+XG4gICAgICBmaWVsZE5hbWVzID0gZmllbGRuYW1lc19qc29uXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSktPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmxvYWRfZmllbGRfbmFtZXMoXCJjb25maWcvZmllbGRuYW1lcy5qc29uXCIpXG4jIyNcblxuXG5yZW5kZXJfZmllbGRfdmFsdWUgPShuLGRhdGEpIC0+XG4gIHY9ZGF0YVtuXVxuICBpZiBub3QgZGF0YVtuXVxuICAgIHJldHVybiAnJ1xuXG4gIGlmIG4gPT0gXCJ3ZWJfc2l0ZVwiXG4gICAgcmV0dXJuIFwiPGEgdGFyZ2V0PSdfYmxhbmsnIGhyZWY9JyN7dn0nPiN7dn08L2E+XCJcbiAgZWxzZVxuICAgIHJldHVybiB2XG4gIFxuICBcblxucmVuZGVyX2ZpZWxkX25hbWUgPSAoZk5hbWUpIC0+XG4gIGlmIGZpZWxkTmFtZXNbZk5hbWVdP1xuICAgIHJldHVybiBmaWVsZE5hbWVzW2ZOYW1lXVxuXG4gIHMgPSBmTmFtZS5yZXBsYWNlKC9fL2csXCIgXCIpXG4gIHMgPSBzLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcy5zdWJzdHJpbmcoMSlcbiAgcmV0dXJuIHNcblxuXG5yZW5kZXJfZmllbGQgPSAoZk5hbWUsZGF0YSktPlxuICAjcmV0dXJuICcnICB1bmxlc3MgZlZhbHVlID0gZGF0YVtmTmFtZV1cbiAgXCJcIlwiXG4gIDxkaXY+XG4gICAgICA8c3BhbiBjbGFzcz0nZi1uYW0nPiN7cmVuZGVyX2ZpZWxkX25hbWUgZk5hbWV9PC9zcGFuPlxuICAgICAgPHNwYW4gY2xhc3M9J2YtdmFsJz4je3JlbmRlcl9maWVsZF92YWx1ZShmTmFtZSxkYXRhKX08L3NwYW4+XG4gIDwvZGl2PlxuICBcIlwiXCJcblxuICBcbnJlbmRlcl9maWVsZHMgPSggZmllbGRzLCBkYXRhKSAtPlxuICAoIHJlbmRlcl9maWVsZChmLCBkYXRhKSBmb3IgZiBpbiBmaWVsZHMpLmpvaW4oJycpXG5cblxuICBcbnVuZGVyID0gKHMpIC0+IHMucmVwbGFjZSgvIC9nLCAnXycpXG5cblxucmVuZGVyX3RhYnMgPSAoaW5pdGlhbF9sYXlvdXQsIGRhdGEpIC0+XG4gIGxheW91dCA9IGFkZF9vdGhlcl90YWJfdG9fbGF5b3V0IGluaXRpYWxfbGF5b3V0LCBkYXRhXG4gICNyZW5kZXIgaGVhZGVyXG4gIGggPSAnPGRpdiByb2xlPVwidGFicGFuZWxcIiA+J1xuXG4gICNyZW5kZXIgdGFic1xuICBoICs9Jzx1bCBpZD1cImZpZWxkVGFic1wiIGNsYXNzPVwibmF2IG5hdi1waWxsc1wiIHJvbGU9XCJ0YWJsaXN0XCI+J1xuICBcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgICA8bGkgcm9sZT1cInByZXNlbnRhdGlvblwiIGNsYXNzPVwiI3thY3RpdmV9XCIgIG9uY2xpY2s9XCJyZW1lbWJlcl90YWIoJyN7dW5kZXIodGFiLm5hbWUpfScpXCI+XG4gICAgICAgIDxhIGhyZWY9XCIjdGFiI3t1bmRlcih0YWIubmFtZSl9XCIgYXJpYS1jb250cm9scz1cImhvbWVcIiByb2xlPVwidGFiXCIgZGF0YS10b2dnbGU9XCJ0YWJcIj5cbiAgICAgICAgI3t0YWIubmFtZX1cbiAgICAgICAgPC9hPlxuICAgICAgPC9saT5cbiAgICBcIlwiXCJcblxuICBoICs9ICc8L3VsPidcbiAgaCArPSAnPGRpdiBpZD1cInRhYnNDb250ZW50XCIgY2xhc3M9XCJ0YWItY29udGVudFwiPidcblxuICAjcmVuZGVyIHRhYnMgY29udGVudFxuICBmb3IgdGFiLGkgaW4gbGF5b3V0XG4gICAgYWN0aXZlID0gaWYgaT4wIHRoZW4gJycgZWxzZSAnYWN0aXZlJ1xuICAgIGggKz1cIlwiXCJcbiAgICA8ZGl2IHJvbGU9XCJ0YWJwYW5lbFwiIGNsYXNzPVwidGFiLXBhbmUgI3thY3RpdmV9IG9uZS10YWJcIiBpZD1cInRhYiN7dW5kZXIodGFiLm5hbWUpfVwiIHN0eWxlPVwicGFkZGluZy10b3A6IDIwcHg7XCI+XG4gICAgICAgIDxoMz4je3RhYi5uYW1lfTwvaDM+XG4gICAgICAgIDxicj5cbiAgICAgICAgI3tyZW5kZXJfZmllbGRzIHRhYi5maWVsZHMsIGRhdGF9XG4gICAgPC9kaXY+XG4gICAgXCJcIlwiXG4gIFxuICAjcmVuZGVyIGZvb3RlclxuICBoICs9JzwvZGl2PidcbiAgaCArPSc8L2Rpdj4nXG4gIHJldHVybiBoXG5cblxuZ2V0X2xheW91dF9maWVsZHMgPSAobGEpIC0+XG4gIGYgPSB7fVxuICBmb3IgdCBpbiBsYVxuICAgIGZvciBmaWVsZCBpbiB0LmZpZWxkc1xuICAgICAgZltmaWVsZF0gPSAxXG4gIHJldHVybiBmXG5cbmdldF9yZWNvcmRfZmllbGRzID0gKHIpIC0+XG4gIGYgPSB7fVxuICBmb3IgZmllbGRfbmFtZSBvZiByXG4gICAgZltmaWVsZF9uYW1lXSA9IDFcbiAgcmV0dXJuIGZcblxuZ2V0X3VubWVudGlvbmVkX2ZpZWxkcyA9IChsYSwgcikgLT5cbiAgbGF5b3V0X2ZpZWxkcyA9IGdldF9sYXlvdXRfZmllbGRzIGxhXG4gIHJlY29yZF9maWVsZHMgPSBnZXRfcmVjb3JkX2ZpZWxkcyByXG4gIHVubWVudGlvbmVkX2ZpZWxkcyA9IFtdXG4gIHVubWVudGlvbmVkX2ZpZWxkcy5wdXNoKGYpIGZvciBmIG9mIHJlY29yZF9maWVsZHMgd2hlbiBub3QgbGF5b3V0X2ZpZWxkc1tmXVxuICByZXR1cm4gdW5tZW50aW9uZWRfZmllbGRzXG5cblxuYWRkX290aGVyX3RhYl90b19sYXlvdXQgPSAobGF5b3V0PVtdLCBkYXRhKSAtPlxuICAjY2xvbmUgdGhlIGxheW91dFxuICBsID0gJC5leHRlbmQgdHJ1ZSwgW10sIGxheW91dFxuICB0ID1cbiAgICBuYW1lOiBcIk90aGVyXCJcbiAgICBmaWVsZHM6IGdldF91bm1lbnRpb25lZF9maWVsZHMgbCwgZGF0YVxuXG4gIGwucHVzaCB0XG4gIHJldHVybiBsXG5cblxuIyBjb252ZXJ0cyB0YWIgdGVtcGxhdGUgZGVzY3JpYmVkIGluIGdvb2dsZSBmdXNpb24gdGFibGUgdG8gXG4jIHRhYiB0ZW1wbGF0ZVxuY29udmVydF9mdXNpb25fdGVtcGxhdGU9KHRlbXBsKSAtPlxuICB0YWJfaGFzaD17fVxuICB0YWJzPVtdXG4gICMgcmV0dXJucyBoYXNoIG9mIGZpZWxkIG5hbWVzIGFuZCB0aGVpciBwb3NpdGlvbnMgaW4gYXJyYXkgb2YgZmllbGQgbmFtZXNcbiAgZ2V0X2NvbF9oYXNoID0gKGNvbHVtbnMpIC0+XG4gICAgY29sX2hhc2ggPXt9XG4gICAgY29sX2hhc2hbY29sX25hbWVdPWkgZm9yIGNvbF9uYW1lLGkgaW4gdGVtcGwuY29sdW1uc1xuICAgIHJldHVybiBjb2xfaGFzaFxuICBcbiAgIyByZXR1cm5zIGZlaWxkIHZhbHVlIGJ5IGl0cyBuYW1lLCBhcnJheSBvZiBmaWVsZHMsIGFuZCBoYXNoIG9mIGZpZWxkc1xuICB2YWwgPSAoZmllbGRfbmFtZSwgZmllbGRzLCBjb2xfaHVzaCkgLT5cbiAgICBmaWVsZHNbY29sX2hhc2hbZmllbGRfbmFtZV1dXG4gIFxuICAjIGNvbnZlcnRzIGhhc2ggdG8gYW4gYXJyYXkgdGVtcGxhdGVcbiAgaGFzaF90b19hcnJheSA9KGhhc2gpIC0+XG4gICAgYSA9IFtdXG4gICAgZm9yIGsgb2YgaGFzaFxuICAgICAgdGFiID0ge31cbiAgICAgIHRhYi5uYW1lPWtcbiAgICAgIHRhYi5maWVsZHM9aGFzaFtrXVxuICAgICAgYS5wdXNoIHRhYlxuICAgIHJldHVybiBhXG5cbiAgICBcbiAgY29sX2hhc2ggPSBnZXRfY29sX2hhc2godGVtcGwuY29sX2hhc2gpXG4gIFxuICBmb3Igcm93LGkgaW4gdGVtcGwucm93c1xuICAgIGNhdGVnb3J5ID0gdmFsICdnZW5lcmFsX2NhdGVnb3J5Jywgcm93LCBjb2xfaGFzaFxuICAgICN0YWJfaGFzaFtjYXRlZ29yeV09W10gdW5sZXNzIHRhYl9oYXNoW2NhdGVnb3J5XVxuICAgIGZpZWxkTmFtZXNbdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaF09dmFsICdkZXNjcmlwdGlvbicsIHJvdywgY29sX2hhc2hcbiAgICBpZiBjYXRlZ29yeVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldPz1bXVxuICAgICAgdGFiX2hhc2hbY2F0ZWdvcnldLnB1c2ggdmFsICdmaWVsZF9uYW1lJywgcm93LCBjb2xfaGFzaFxuXG4gIHRhYnMgPSBoYXNoX3RvX2FycmF5KHRhYl9oYXNoKVxuICByZXR1cm4gdGFic1xuXG5cbmNsYXNzIFRlbXBsYXRlczJcblxuICBAbGlzdCA9IHVuZGVmaW5lZFxuXG4gIGNvbnN0cnVjdG9yOigpIC0+XG4gICAgQGxpc3QgPSBbXVxuXG4gIGFkZF90ZW1wbGF0ZTogKGxheW91dF9uYW1lLCBsYXlvdXRfanNvbikgLT5cbiAgICBAbGlzdC5wdXNoXG4gICAgICBuYW1lOmxheW91dF9uYW1lXG4gICAgICByZW5kZXI6KGRhdCkgLT5cbiAgICAgICAgcmVuZGVyX3RhYnMobGF5b3V0X2pzb24sIGRhdClcblxuXG4gIGxvYWRfdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdGVtcGxhdGVfanNvbilcbiAgICAgICAgcmV0dXJuXG5cbiAgbG9hZF9mdXNpb25fdGVtcGxhdGU6KHRlbXBsYXRlX25hbWUsIHVybCkgLT5cbiAgICAkLmFqYXhcbiAgICAgIHVybDogdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogKHRlbXBsYXRlX2pzb24pID0+XG4gICAgICAgIHQgPSBjb252ZXJ0X2Z1c2lvbl90ZW1wbGF0ZSB0ZW1wbGF0ZV9qc29uXG4gICAgICAgIGNvbnNvbGUubG9nIHRcbiAgICAgICAgQGFkZF90ZW1wbGF0ZSh0ZW1wbGF0ZV9uYW1lLCB0KVxuICAgICAgICByZXR1cm5cblxuXG4gIGdldF9uYW1lczogLT5cbiAgICAodC5uYW1lIGZvciB0IGluIEBsaXN0KVxuXG4gIGdldF9pbmRleF9ieV9uYW1lOiAobmFtZSkgLT5cbiAgICBmb3IgdCxpIGluIEBsaXN0XG4gICAgICBpZiB0Lm5hbWUgaXMgbmFtZVxuICAgICAgICByZXR1cm4gaVxuICAgICByZXR1cm4gLTFcblxuICBnZXRfaHRtbDogKGluZCwgZGF0YSkgLT5cbiAgICBpZiAoaW5kIGlzIC0xKSB0aGVuIHJldHVybiAgXCJcIlxuICAgIFxuICAgIGlmIEBsaXN0W2luZF1cbiAgICAgIHJldHVybiBAbGlzdFtpbmRdLnJlbmRlcihkYXRhKVxuICAgIGVsc2VcbiAgICAgIHJldHVybiBcIlwiXG5cblxuXG5tb2R1bGUuZXhwb3J0cyA9IFRlbXBsYXRlczJcbiJdfQ==
