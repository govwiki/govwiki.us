(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var add_marker, bounds_timeout, clear, create_info_window, geocode, geocode_addr, get_icon, get_records, get_records2, map, on_bounds_changed, on_bounds_changed_later, pinImage;

bounds_timeout = void 0;

map = new GMaps({
  el: '#govmap',
  lat: 37.3789008,
  lng: -117.1916283,
  zoom: 6,
  scrollwheel: false,
  panControl: false,
  zoomControl: true,
  zoomControlOptions: {
    style: google.maps.ZoomControlStyle.SMALL
  },
  bounds_changed: function() {
    return on_bounds_changed_later(200);
  }
});

on_bounds_changed_later = function(msec) {
  clearTimeout(bounds_timeout);
  return bounds_timeout = setTimeout(on_bounds_changed, msec);
};

on_bounds_changed = function(e) {
  var b, ne, ne_lat, ne_lng, q2, st, sw, sw_lat, sw_lng, ty, url_value;
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

  /*
   * Build the query.
  q=""" "latitude":{"$lt":#{ne_lat},"$gt":#{sw_lat}},"longitude":{"$lt":#{ne_lng},"$gt":#{sw_lng}}"""
   * Add filters if they exist
  q+=""","state":"#{st}" """ if st
  q+=""","gov_type":"#{ty}" """ if ty
  
  
  get_records q, 200,  (data) ->
    #console.log "length=#{data.length}"
    #console.log "lat: #{ne_lat},#{sw_lat} lng: #{ne_lng}, #{sw_lng}"
    map.removeMarkers()
    add_marker(rec) for rec in data
    return
   */
  q2 = " latitude<" + ne_lat + " AND latitude>" + sw_lat + " AND longitude<" + ne_lng + " AND longitude>" + sw_lng + " ";
  if (st) {
    q2 += " AND state=\"" + st + "\" ";
  }
  if (ty) {
    q2 += " AND gov_type=\"" + ty + "\" ";
  }
  return get_records2(q2, 200, function(data) {
    var i, len, rec, ref;
    map.removeMarkers();
    ref = data.record;
    for (i = 0, len = ref.length; i < len; i++) {
      rec = ref[i];
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
      return window.GOVWIKI.show_record2(rec);
    }
  });
};

create_info_window = function(r) {
  var w;
  w = $('<div></div>').append($("<a href='#'><strong>" + r.gov_name + "</strong></a>").click(function(e) {
    e.preventDefault();
    console.log(r);
    return window.GOVWIKI.show_record2(r);
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

get_records2 = function(query, limit, onsuccess) {
  return $.ajax({
    url: "http://46.101.3.79:80/rest/db/govs",
    data: {
      filter: query,
      fields: "_id,inc_id,gov_name,gov_type,city,zip,state,latitude,longitude",
      app_name: "govwiki",
      order: "rand",
      limit: limit
    },
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
    this.govs_array = govs.record;
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
      source: query_matcher(this.govs_array, this.num_items),
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
var GovSelector, Templates2, activate_tab, active_tab, adjust_typeahead_width, build_select_element, build_selector, focus_search_field, get_record, get_record2, gov_selector, govmap, livereload, start_adjusting_typeahead_width, templates;

GovSelector = require('./govselector.coffee');

Templates2 = require('./templates2.coffee');

govmap = require('./govmap.coffee');

window.GOVWIKI = {
  state_filter: '',
  gov_type_filter: '',
  show_search_page: function() {
    $(window).scrollTo('0px', 10);
    $('#dataContainer').hide();
    $('#searchIcon').hide();
    $('#searchContainer').fadeIn(300);
    return focus_search_field(500);
  },
  show_data_page: function() {
    $(window).scrollTo('0px', 10);
    $('#searchIcon').show();
    $('#dataContainer').fadeIn(300);
    return $('#searchContainer').hide();
  }
};

gov_selector = new GovSelector('.typeahead', 'data/h_types_ca.json', 7);

templates = new Templates2;

active_tab = "";

window.remember_tab = function(name) {
  return active_tab = name;
};

activate_tab = function() {
  return $("#fieldTabs a[href='#tab" + active_tab + "']").tab('show');
};

gov_selector.on_selected = function(evt, data, name) {
  $('#details').html(templates.get_html(0, data));
  get_record2(data["_id"]);
  activate_tab();
  GOVWIKI.show_data_page();
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

get_record2 = function(recid) {
  return $.ajax({
    url: "http://46.101.3.79:80/rest/db/govs/" + recid,
    dataType: 'json',
    headers: {
      "X-DreamFactory-Application-Name": "govwiki"
    },
    cache: true,
    success: function(data) {
      if (data) {
        $('#details').html(templates.get_html(0, data));
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
    return GOVWIKI.show_data_page();
  };
})(this);

window.GOVWIKI.show_record2 = (function(_this) {
  return function(rec) {
    $('#details').html(templates.get_html(0, rec));
    get_record2(rec._id);
    activate_tab();
    return GOVWIKI.show_data_page();
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
  return GOVWIKI.show_search_page();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvZ292bWFwLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS9nb3ZzZWxlY3Rvci5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvbWFpbi5jb2ZmZWUiLCIvVXNlcnMvdmFkaW1pdmxldi9Qcm9qZWN0cy9fcHJvamVjdHMvZ292d2lraS51cy9jb2ZmZWUvcXVlcnltYXRjaGVyLmNvZmZlZSIsIi9Vc2Vycy92YWRpbWl2bGV2L1Byb2plY3RzL19wcm9qZWN0cy9nb3Z3aWtpLnVzL2NvZmZlZS90ZW1wbGF0ZXMyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLElBQUEsNEtBQUE7O0FBQUEsY0FBQSxHQUFlLE1BQWYsQ0FBQTs7QUFBQSxHQUdBLEdBQVUsSUFBQSxLQUFBLENBQ1I7QUFBQSxFQUFBLEVBQUEsRUFBSSxTQUFKO0FBQUEsRUFDQSxHQUFBLEVBQUssVUFETDtBQUFBLEVBRUEsR0FBQSxFQUFLLENBQUEsV0FGTDtBQUFBLEVBR0EsSUFBQSxFQUFLLENBSEw7QUFBQSxFQUlBLFdBQUEsRUFBYSxLQUpiO0FBQUEsRUFLQSxVQUFBLEVBQVksS0FMWjtBQUFBLEVBTUEsV0FBQSxFQUFhLElBTmI7QUFBQSxFQU9BLGtCQUFBLEVBQ0U7QUFBQSxJQUFBLEtBQUEsRUFBTyxNQUFNLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEtBQXBDO0dBUkY7QUFBQSxFQVNBLGNBQUEsRUFBZ0IsU0FBQSxHQUFBO1dBQ2QsdUJBQUEsQ0FBd0IsR0FBeEIsRUFEYztFQUFBLENBVGhCO0NBRFEsQ0FI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b0JBQUE7O0lBMUtGLENBQUE7O0FBQUEsTUE4Tk0sQ0FBQyxPQUFQLEdBQWlCLFVBOU5qQixDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImJvdW5kc190aW1lb3V0PXVuZGVmaW5lZFxuXG5cbm1hcCA9IG5ldyBHTWFwc1xuICBlbDogJyNnb3ZtYXAnXG4gIGxhdDogMzcuMzc4OTAwOFxuICBsbmc6IC0xMTcuMTkxNjI4M1xuICB6b29tOjZcbiAgc2Nyb2xsd2hlZWw6IGZhbHNlXG4gIHBhbkNvbnRyb2w6IGZhbHNlXG4gIHpvb21Db250cm9sOiB0cnVlXG4gIHpvb21Db250cm9sT3B0aW9uczpcbiAgICBzdHlsZTogZ29vZ2xlLm1hcHMuWm9vbUNvbnRyb2xTdHlsZS5TTUFMTFxuICBib3VuZHNfY2hhbmdlZDogLT5cbiAgICBvbl9ib3VuZHNfY2hhbmdlZF9sYXRlciAyMDBcblxuXG5vbl9ib3VuZHNfY2hhbmdlZF9sYXRlciAgPSAobXNlYykgIC0+XG4gIGNsZWFyVGltZW91dCBib3VuZHNfdGltZW91dFxuICBib3VuZHNfdGltZW91dCA9IHNldFRpbWVvdXQgb25fYm91bmRzX2NoYW5nZWQsIG1zZWNcblxuICAgIFxub25fYm91bmRzX2NoYW5nZWQgPShlKSAtPlxuICBjb25zb2xlLmxvZyBcImJvdW5kc19jaGFuZ2VkXCJcbiAgYj1tYXAuZ2V0Qm91bmRzKClcbiAgdXJsX3ZhbHVlPWIudG9VcmxWYWx1ZSgpXG4gIG5lPWIuZ2V0Tm9ydGhFYXN0KClcbiAgc3c9Yi5nZXRTb3V0aFdlc3QoKVxuICBuZV9sYXQ9bmUubGF0KClcbiAgbmVfbG5nPW5lLmxuZygpXG4gIHN3X2xhdD1zdy5sYXQoKVxuICBzd19sbmc9c3cubG5nKClcbiAgc3QgPSBHT1ZXSUtJLnN0YXRlX2ZpbHRlclxuICB0eSA9IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyXG5cbiAgIyMjXG4gICMgQnVpbGQgdGhlIHF1ZXJ5LlxuICBxPVwiXCJcIiBcImxhdGl0dWRlXCI6e1wiJGx0XCI6I3tuZV9sYXR9LFwiJGd0XCI6I3tzd19sYXR9fSxcImxvbmdpdHVkZVwiOntcIiRsdFwiOiN7bmVfbG5nfSxcIiRndFwiOiN7c3dfbG5nfX1cIlwiXCJcbiAgIyBBZGQgZmlsdGVycyBpZiB0aGV5IGV4aXN0XG4gIHErPVwiXCJcIixcInN0YXRlXCI6XCIje3N0fVwiIFwiXCJcIiBpZiBzdFxuICBxKz1cIlwiXCIsXCJnb3ZfdHlwZVwiOlwiI3t0eX1cIiBcIlwiXCIgaWYgdHlcblxuXG4gIGdldF9yZWNvcmRzIHEsIDIwMCwgIChkYXRhKSAtPlxuICAgICNjb25zb2xlLmxvZyBcImxlbmd0aD0je2RhdGEubGVuZ3RofVwiXG4gICAgI2NvbnNvbGUubG9nIFwibGF0OiAje25lX2xhdH0sI3tzd19sYXR9IGxuZzogI3tuZV9sbmd9LCAje3N3X2xuZ31cIlxuICAgIG1hcC5yZW1vdmVNYXJrZXJzKClcbiAgICBhZGRfbWFya2VyKHJlYykgZm9yIHJlYyBpbiBkYXRhXG4gICAgcmV0dXJuXG4gICMjI1xuXG4gICMgQnVpbGQgdGhlIHF1ZXJ5IDIuXG4gIHEyPVwiXCJcIiBsYXRpdHVkZTwje25lX2xhdH0gQU5EIGxhdGl0dWRlPiN7c3dfbGF0fSBBTkQgbG9uZ2l0dWRlPCN7bmVfbG5nfSBBTkQgbG9uZ2l0dWRlPiN7c3dfbG5nfSBcIlwiXCJcbiAgIyBBZGQgZmlsdGVycyBpZiB0aGV5IGV4aXN0XG4gIHEyKz1cIlwiXCIgQU5EIHN0YXRlPVwiI3tzdH1cIiBcIlwiXCIgaWYgc3RcbiAgcTIrPVwiXCJcIiBBTkQgZ292X3R5cGU9XCIje3R5fVwiIFwiXCJcIiBpZiB0eVxuXG5cbiAgZ2V0X3JlY29yZHMyIHEyLCAyMDAsICAoZGF0YSkgLT5cbiAgICAjY29uc29sZS5sb2cgXCJsZW5ndGg9I3tkYXRhLmxlbmd0aH1cIlxuICAgICNjb25zb2xlLmxvZyBcImxhdDogI3tuZV9sYXR9LCN7c3dfbGF0fSBsbmc6ICN7bmVfbG5nfSwgI3tzd19sbmd9XCJcbiAgICBtYXAucmVtb3ZlTWFya2VycygpXG4gICAgYWRkX21hcmtlcihyZWMpIGZvciByZWMgaW4gZGF0YS5yZWNvcmRcbiAgICByZXR1cm5cblxuXG5cbmdldF9pY29uID0oZ292X3R5cGUpIC0+XG4gIFxuICBfY2lyY2xlID0oY29sb3IpLT5cbiAgICBwYXRoOiBnb29nbGUubWFwcy5TeW1ib2xQYXRoLkNJUkNMRVxuICAgIGZpbGxPcGFjaXR5OiAwLjVcbiAgICBmaWxsQ29sb3I6Y29sb3JcbiAgICBzdHJva2VXZWlnaHQ6IDFcbiAgICBzdHJva2VDb2xvcjond2hpdGUnXG4gICAgI3N0cm9rZVBvc2l0aW9uOiBnb29nbGUubWFwcy5TdHJva2VQb3NpdGlvbi5PVVRTSURFXG4gICAgc2NhbGU6NlxuXG4gIHN3aXRjaCBnb3ZfdHlwZVxuICAgIHdoZW4gJ0dlbmVyYWwgUHVycG9zZScgdGhlbiByZXR1cm4gX2NpcmNsZSAnIzAzQydcbiAgICB3aGVuICdDZW1ldGVyaWVzJyAgICAgIHRoZW4gcmV0dXJuIF9jaXJjbGUgJyMwMDAnXG4gICAgd2hlbiAnSG9zcGl0YWxzJyAgICAgICB0aGVuIHJldHVybiBfY2lyY2xlICcjMEMwJ1xuICAgIGVsc2UgcmV0dXJuIF9jaXJjbGUgJyNEMjAnXG5cblxuXG5cbmFkZF9tYXJrZXIgPShyZWMpLT5cbiAgI2NvbnNvbGUubG9nIFwiI3tyZWMucmFuZH0gI3tyZWMuaW5jX2lkfSAje3JlYy56aXB9ICN7cmVjLmxhdGl0dWRlfSAje3JlYy5sb25naXR1ZGV9ICN7cmVjLmdvdl9uYW1lfVwiXG4gIG1hcC5hZGRNYXJrZXJcbiAgICBsYXQ6IHJlYy5sYXRpdHVkZVxuICAgIGxuZzogcmVjLmxvbmdpdHVkZVxuICAgIGljb246IGdldF9pY29uKHJlYy5nb3ZfdHlwZSlcbiAgICB0aXRsZTogIFwiI3tyZWMuZ292X25hbWV9LCAje3JlYy5nb3ZfdHlwZX0gKCN7cmVjLmxhdGl0dWRlfSwgI3tyZWMubG9uZ2l0dWRlfSlcIlxuICAgIGluZm9XaW5kb3c6XG4gICAgICBjb250ZW50OiBjcmVhdGVfaW5mb193aW5kb3cgcmVjXG4gICAgY2xpY2s6IChlKS0+XG4gICAgICAjd2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQgcmVjXG4gICAgICB3aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZDIgcmVjXG4gIFxuICByZXR1cm5cblxuXG5jcmVhdGVfaW5mb193aW5kb3cgPShyKSAtPlxuICB3ID0gJCgnPGRpdj48L2Rpdj4nKVxuICAuYXBwZW5kICQoXCI8YSBocmVmPScjJz48c3Ryb25nPiN7ci5nb3ZfbmFtZX08L3N0cm9uZz48L2E+XCIpLmNsaWNrIChlKS0+XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgY29uc29sZS5sb2cgclxuICAgICN3aW5kb3cuR09WV0lLSS5zaG93X3JlY29yZCByXG4gICAgd2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyIHJcblxuICAuYXBwZW5kICQoXCI8ZGl2PiAje3IuZ292X3R5cGV9ICAje3IuY2l0eX0gI3tyLnppcH0gI3tyLnN0YXRlfTwvZGl2PlwiKVxuICByZXR1cm4gd1swXVxuXG5cblxuXG5nZXRfcmVjb3JkcyA9IChxdWVyeSwgbGltaXQsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9I3tsaW1pdH0mcz17cmFuZDoxfSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IG9uc3VjY2Vzc1xuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbmdldF9yZWNvcmRzMiA9IChxdWVyeSwgbGltaXQsIG9uc3VjY2VzcykgLT5cbiAgJC5hamF4XG4gICAgdXJsOlwiaHR0cDovLzQ2LjEwMS4zLjc5OjgwL3Jlc3QvZGIvZ292c1wiXG4gICAgZGF0YTpcbiAgICAgICNmaWx0ZXI6XCJsYXRpdHVkZT4zMiBBTkQgbGF0aXR1ZGU8MzQgQU5EIGxvbmdpdHVkZT4tODcgQU5EIGxvbmdpdHVkZTwtODZcIlxuICAgICAgZmlsdGVyOnF1ZXJ5XG4gICAgICBmaWVsZHM6XCJfaWQsaW5jX2lkLGdvdl9uYW1lLGdvdl90eXBlLGNpdHksemlwLHN0YXRlLGxhdGl0dWRlLGxvbmdpdHVkZVwiXG4gICAgICBhcHBfbmFtZTpcImdvdndpa2lcIlxuICAgICAgb3JkZXI6XCJyYW5kXCJcbiAgICAgIGxpbWl0OmxpbWl0XG5cbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiBvbnN1Y2Nlc3NcbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG4jIEdFT0NPRElORyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbnBpbkltYWdlID0gbmV3IChnb29nbGUubWFwcy5NYXJrZXJJbWFnZSkoXG4gICdodHRwOi8vY2hhcnQuYXBpcy5nb29nbGUuY29tL2NoYXJ0P2Noc3Q9ZF9tYXBfcGluX2xldHRlciZjaGxkPVp8Nzc3N0JCfEZGRkZGRicgLFxuICBuZXcgKGdvb2dsZS5tYXBzLlNpemUpKDIxLCAzNCksXG4gIG5ldyAoZ29vZ2xlLm1hcHMuUG9pbnQpKDAsIDApLFxuICBuZXcgKGdvb2dsZS5tYXBzLlBvaW50KSgxMCwgMzQpXG4gIClcblxuXG5nZW9jb2RlX2FkZHIgPSAoYWRkcixkYXRhKSAtPlxuICBHTWFwcy5nZW9jb2RlXG4gICAgYWRkcmVzczogYWRkclxuICAgIGNhbGxiYWNrOiAocmVzdWx0cywgc3RhdHVzKSAtPlxuICAgICAgaWYgc3RhdHVzID09ICdPSydcbiAgICAgICAgbGF0bG5nID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvblxuICAgICAgICBtYXAuc2V0Q2VudGVyIGxhdGxuZy5sYXQoKSwgbGF0bG5nLmxuZygpXG4gICAgICAgIG1hcC5hZGRNYXJrZXJcbiAgICAgICAgICBsYXQ6IGxhdGxuZy5sYXQoKVxuICAgICAgICAgIGxuZzogbGF0bG5nLmxuZygpXG4gICAgICAgICAgc2l6ZTogJ3NtYWxsJ1xuICAgICAgICAgIHRpdGxlOiByZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzXG4gICAgICAgICAgaW5mb1dpbmRvdzpcbiAgICAgICAgICAgIGNvbnRlbnQ6IHJlc3VsdHNbMF0uZm9ybWF0dGVkX2FkZHJlc3NcbiAgICAgICAgXG4gICAgICAgIGlmIGRhdGFcbiAgICAgICAgICBtYXAuYWRkTWFya2VyXG4gICAgICAgICAgICBsYXQ6IGRhdGEubGF0aXR1ZGVcbiAgICAgICAgICAgIGxuZzogZGF0YS5sb25naXR1ZGVcbiAgICAgICAgICAgIHNpemU6ICdzbWFsbCdcbiAgICAgICAgICAgIGNvbG9yOiAnYmx1ZSdcbiAgICAgICAgICAgIGljb246IHBpbkltYWdlXG4gICAgICAgICAgICB0aXRsZTogIFwiI3tkYXRhLmxhdGl0dWRlfSAje2RhdGEubG9uZ2l0dWRlfVwiXG4gICAgICAgICAgICBpbmZvV2luZG93OlxuICAgICAgICAgICAgICBjb250ZW50OiBcIiN7ZGF0YS5sYXRpdHVkZX0gI3tkYXRhLmxvbmdpdHVkZX1cIlxuICAgICAgICAgICAgXG4gICAgICAgICQoJy5nb3ZtYXAtZm91bmQnKS5odG1sIFwiPHN0cm9uZz5GT1VORDogPC9zdHJvbmc+I3tyZXN1bHRzWzBdLmZvcm1hdHRlZF9hZGRyZXNzfVwiXG4gICAgICByZXR1cm5cblxuXG5jbGVhcj0ocyktPlxuICByZXR1cm4gaWYgcy5tYXRjaCgvIGJveCAvaSkgdGhlbiAnJyBlbHNlIHNcblxuZ2VvY29kZSA9IChkYXRhKSAtPlxuICBhZGRyID0gXCIje2NsZWFyKGRhdGEuYWRkcmVzczEpfSAje2NsZWFyKGRhdGEuYWRkcmVzczIpfSwgI3tkYXRhLmNpdHl9LCAje2RhdGEuc3RhdGV9ICN7ZGF0YS56aXB9LCBVU0FcIlxuICAkKCcjZ292YWRkcmVzcycpLnZhbChhZGRyKVxuICBnZW9jb2RlX2FkZHIgYWRkciwgZGF0YVxuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2VvY29kZTogZ2VvY29kZVxuICBnb2NvZGVfYWRkcjogZ2VvY29kZV9hZGRyXG4gIG9uX2JvdW5kc19jaGFuZ2VkOiBvbl9ib3VuZHNfY2hhbmdlZFxuICBvbl9ib3VuZHNfY2hhbmdlZF9sYXRlcjogb25fYm91bmRzX2NoYW5nZWRfbGF0ZXJcblxuIiwiXG5xdWVyeV9tYXRjaGVyID0gcmVxdWlyZSgnLi9xdWVyeW1hdGNoZXIuY29mZmVlJylcblxuY2xhc3MgR292U2VsZWN0b3JcbiAgXG4gICMgc3R1YiBvZiBhIGNhbGxiYWNrIHRvIGVudm9rZSB3aGVuIHRoZSB1c2VyIHNlbGVjdHMgc29tZXRoaW5nXG4gIG9uX3NlbGVjdGVkOiAoZXZ0LCBkYXRhLCBuYW1lKSAtPlxuXG5cbiAgY29uc3RydWN0b3I6IChAaHRtbF9zZWxlY3RvciwgZG9jc191cmwsIEBudW1faXRlbXMpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IGRvY3NfdXJsXG4gICAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgICBjYWNoZTogdHJ1ZVxuICAgICAgc3VjY2VzczogQHN0YXJ0U3VnZ2VzdGlvblxuICAgICAgXG5cblxuXG4gIHN1Z2dlc3Rpb25UZW1wbGF0ZSA6IEhhbmRsZWJhcnMuY29tcGlsZShcIlwiXCJcbiAgICA8ZGl2IGNsYXNzPVwic3VnZy1ib3hcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLXN0YXRlXCI+e3t7c3RhdGV9fX08L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzdWdnLW5hbWVcIj57e3tnb3ZfbmFtZX19fTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInN1Z2ctdHlwZVwiPnt7e2dvdl90eXBlfX19PC9kaXY+XG4gICAgPC9kaXY+XCJcIlwiKVxuXG5cblxuICBlbnRlcmVkX3ZhbHVlID0gXCJcIlxuXG4gIGdvdnNfYXJyYXkgPSBbXVxuXG4gIGNvdW50X2dvdnMgOiAoKSAtPlxuICAgIGNvdW50ID0wXG4gICAgZm9yIGQgaW4gQGdvdnNfYXJyYXlcbiAgICAgIGlmIEdPVldJS0kuc3RhdGVfZmlsdGVyIGFuZCBkLnN0YXRlIGlzbnQgR09WV0lLSS5zdGF0ZV9maWx0ZXIgdGhlbiBjb250aW51ZVxuICAgICAgaWYgR09WV0lLSS5nb3ZfdHlwZV9maWx0ZXIgYW5kIGQuZ292X3R5cGUgaXNudCBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBjb3VudCsrXG4gICAgcmV0dXJuIGNvdW50XG5cblxuICBzdGFydFN1Z2dlc3Rpb24gOiAoZ292cykgPT5cbiAgICAjQGdvdnNfYXJyYXkgPSBnb3ZzXG4gICAgQGdvdnNfYXJyYXkgPSBnb3ZzLnJlY29yZFxuICAgICQoJy50eXBlYWhlYWQnKS5rZXl1cCAoZXZlbnQpID0+XG4gICAgICBAZW50ZXJlZF92YWx1ZSA9ICQoZXZlbnQudGFyZ2V0KS52YWwoKVxuICAgIFxuICAgICQoQGh0bWxfc2VsZWN0b3IpLmF0dHIgJ3BsYWNlaG9sZGVyJywgJ0dPVkVSTk1FTlQgTkFNRSdcbiAgICAkKEBodG1sX3NlbGVjdG9yKS50eXBlYWhlYWQoXG4gICAgICAgIGhpbnQ6IGZhbHNlXG4gICAgICAgIGhpZ2hsaWdodDogZmFsc2VcbiAgICAgICAgbWluTGVuZ3RoOiAxXG4gICAgICAsXG4gICAgICAgIG5hbWU6ICdnb3ZfbmFtZSdcbiAgICAgICAgZGlzcGxheUtleTogJ2dvdl9uYW1lJ1xuICAgICAgICBzb3VyY2U6IHF1ZXJ5X21hdGNoZXIoQGdvdnNfYXJyYXksIEBudW1faXRlbXMpXG4gICAgICAgICNzb3VyY2U6IGJsb29kaG91bmQudHRBZGFwdGVyKClcbiAgICAgICAgdGVtcGxhdGVzOiBzdWdnZXN0aW9uOiBAc3VnZ2VzdGlvblRlbXBsYXRlXG4gICAgKVxuICAgIC5vbiAndHlwZWFoZWFkOnNlbGVjdGVkJywgIChldnQsIGRhdGEsIG5hbWUpID0+XG4gICAgICAgICQoJy50eXBlYWhlYWQnKS50eXBlYWhlYWQgJ3ZhbCcsIEBlbnRlcmVkX3ZhbHVlXG4gICAgICAgIEBvbl9zZWxlY3RlZChldnQsIGRhdGEsIG5hbWUpXG4gICBcbiAgICAub24gJ3R5cGVhaGVhZDpjdXJzb3JjaGFuZ2VkJywgKGV2dCwgZGF0YSwgbmFtZSkgPT5cbiAgICAgICAgJCgnLnR5cGVhaGVhZCcpLnZhbCBAZW50ZXJlZF92YWx1ZVxuICAgIFxuXG4gICAgJCgnLmdvdi1jb3VudGVyJykudGV4dCBAY291bnRfZ292cygpXG4gICAgcmV0dXJuXG5cblxuXG5cblxubW9kdWxlLmV4cG9ydHM9R292U2VsZWN0b3JcblxuXG5cbiIsIiMjI1xuZmlsZTogbWFpbi5jb2ZmZSAtLSBUaGUgZW50cnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgOlxuZ292X2ZpbmRlciA9IG5ldyBHb3ZGaW5kZXJcbmdvdl9kZXRhaWxzID0gbmV3IEdvdkRldGFpbHNcbmdvdl9maW5kZXIub25fc2VsZWN0ID0gZ292X2RldGFpbHMuc2hvd1xuLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5Hb3ZTZWxlY3RvciA9IHJlcXVpcmUgJy4vZ292c2VsZWN0b3IuY29mZmVlJ1xuI19qcWdzICAgICAgID0gcmVxdWlyZSAnLi9qcXVlcnkuZ292c2VsZWN0b3IuY29mZmVlJ1xuVGVtcGxhdGVzMiAgICAgID0gcmVxdWlyZSAnLi90ZW1wbGF0ZXMyLmNvZmZlZSdcbmdvdm1hcCAgICAgID0gcmVxdWlyZSAnLi9nb3ZtYXAuY29mZmVlJ1xuI3Njcm9sbHRvID0gcmVxdWlyZSAnLi4vYm93ZXJfY29tcG9uZW50cy9qcXVlcnkuc2Nyb2xsVG8vanF1ZXJ5LnNjcm9sbFRvLmpzJ1xuXG53aW5kb3cuR09WV0lLSSA9XG4gIHN0YXRlX2ZpbHRlciA6ICcnXG4gIGdvdl90eXBlX2ZpbHRlciA6ICcnXG5cbiAgc2hvd19zZWFyY2hfcGFnZTogKCkgLT5cbiAgICAkKHdpbmRvdykuc2Nyb2xsVG8oJzBweCcsMTApXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5oaWRlKClcbiAgICAkKCcjc2VhcmNoSWNvbicpLmhpZGUoKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgIGZvY3VzX3NlYXJjaF9maWVsZCA1MDBcbiAgICBcbiAgc2hvd19kYXRhX3BhZ2U6ICgpIC0+XG4gICAgJCh3aW5kb3cpLnNjcm9sbFRvKCcwcHgnLDEwKVxuICAgICQoJyNzZWFyY2hJY29uJykuc2hvdygpXG4gICAgJCgnI2RhdGFDb250YWluZXInKS5mYWRlSW4oMzAwKVxuICAgICQoJyNzZWFyY2hDb250YWluZXInKS5oaWRlKClcbiAgICAjJCh3aW5kb3cpLnNjcm9sbFRvKCcjcEJhY2tUb1NlYXJjaCcsNjAwKVxuXG5cblxuXG4jZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJ2RhdGEvaF90eXBlcy5qc29uJywgN1xuZ292X3NlbGVjdG9yID0gbmV3IEdvdlNlbGVjdG9yICcudHlwZWFoZWFkJywgJ2RhdGEvaF90eXBlc19jYS5qc29uJywgN1xuI2dvdl9zZWxlY3RvciA9IG5ldyBHb3ZTZWxlY3RvciAnLnR5cGVhaGVhZCcsICdodHRwOi8vNDYuMTAxLjMuNzkvcmVzdC9kYi9nb3ZzP2ZpbHRlcj1zdGF0ZT0lMjJDQSUyMiZhcHBfbmFtZT1nb3Z3aWtpJmZpZWxkcz1faWQsZ292X25hbWUsZ292X3R5cGUsc3RhdGUnLCA3XG50ZW1wbGF0ZXMgPSBuZXcgVGVtcGxhdGVzMlxuYWN0aXZlX3RhYj1cIlwiXG5cbndpbmRvdy5yZW1lbWJlcl90YWIgPShuYW1lKS0+IGFjdGl2ZV90YWIgPSBuYW1lXG5cbiN3aW5kb3cuZ2VvY29kZV9hZGRyID0gKGlucHV0X3NlbGVjdG9yKS0+IGdvdm1hcC5nb2NvZGVfYWRkciAkKGlucHV0X3NlbGVjdG9yKS52YWwoKVxuXG5hY3RpdmF0ZV90YWIgPSgpIC0+XG4gICQoXCIjZmllbGRUYWJzIGFbaHJlZj0nI3RhYiN7YWN0aXZlX3RhYn0nXVwiKS50YWIoJ3Nob3cnKVxuXG5cbmdvdl9zZWxlY3Rvci5vbl9zZWxlY3RlZCA9IChldnQsIGRhdGEsIG5hbWUpIC0+XG4gICNyZW5kZXJEYXRhICcjZGV0YWlscycsIGRhdGFcbiAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhKVxuICAjZ2V0X3JlY29yZCBcImluY19pZDoje2RhdGFbXCJpbmNfaWRcIl19XCJcbiAgZ2V0X3JlY29yZDIgZGF0YVtcIl9pZFwiXVxuICBhY3RpdmF0ZV90YWIoKVxuICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgcmV0dXJuXG5cblxuZ2V0X3JlY29yZCA9IChxdWVyeSkgLT5cbiAgJC5hamF4XG4gICAgdXJsOiBcImh0dHBzOi8vYXBpLm1vbmdvbGFiLmNvbS9hcGkvMS9kYXRhYmFzZXMvZ292d2lraS9jb2xsZWN0aW9ucy9nb3ZzLz9xPXsje3F1ZXJ5fX0mZj17X2lkOjB9Jmw9MSZhcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnlcIlxuICAgIGRhdGFUeXBlOiAnanNvbidcbiAgICBjYWNoZTogdHJ1ZVxuICAgIHN1Y2Nlc3M6IChkYXRhKSAtPlxuICAgICAgaWYgZGF0YS5sZW5ndGhcbiAgICAgICAgJCgnI2RldGFpbHMnKS5odG1sIHRlbXBsYXRlcy5nZXRfaHRtbCgwLCBkYXRhWzBdKVxuICAgICAgICBhY3RpdmF0ZV90YWIoKVxuICAgICAgICAjZ292bWFwLmdlb2NvZGUgZGF0YVswXVxuICAgICAgcmV0dXJuXG4gICAgZXJyb3I6KGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyBlXG5cblxuZ2V0X3JlY29yZDIgPSAocmVjaWQpIC0+XG4gICQuYWpheFxuICAgICN1cmw6IFwiaHR0cHM6Ly9kc3AtZ292d2lraS5jbG91ZC5kcmVhbWZhY3RvcnkuY29tOjQ0My9yZXN0L2dvdndpa2lfYXBpL2dvdnMvI3tyZWNpZH1cIlxuICAgIHVybDogXCJodHRwOi8vNDYuMTAxLjMuNzk6ODAvcmVzdC9kYi9nb3ZzLyN7cmVjaWR9XCJcbiAgICBkYXRhVHlwZTogJ2pzb24nXG4gICAgaGVhZGVyczoge1wiWC1EcmVhbUZhY3RvcnktQXBwbGljYXRpb24tTmFtZVwiOlwiZ292d2lraVwifVxuICAgIGNhY2hlOiB0cnVlXG4gICAgc3VjY2VzczogKGRhdGEpIC0+XG4gICAgICBpZiBkYXRhXG4gICAgICAgICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgZGF0YSlcbiAgICAgICAgYWN0aXZhdGVfdGFiKClcbiAgICAgICAgI2dvdm1hcC5nZW9jb2RlIGRhdGFbMF1cbiAgICAgIHJldHVyblxuICAgIGVycm9yOihlKSAtPlxuICAgICAgY29uc29sZS5sb2cgZVxuXG5cbndpbmRvdy5HT1ZXSUtJLnNob3dfcmVjb3JkID0ocmVjKT0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuICBHT1ZXSUtJLnNob3dfZGF0YV9wYWdlKClcbiAgICAgIFxud2luZG93LkdPVldJS0kuc2hvd19yZWNvcmQyID0ocmVjKT0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBnZXRfcmVjb3JkMiByZWMuX2lkXG4gIGFjdGl2YXRlX3RhYigpXG4gIEdPVldJS0kuc2hvd19kYXRhX3BhZ2UoKVxuXG5cblxuIyMjXG53aW5kb3cuc2hvd19yZWMgPSAocmVjKS0+XG4gICQoJyNkZXRhaWxzJykuaHRtbCB0ZW1wbGF0ZXMuZ2V0X2h0bWwoMCwgcmVjKVxuICBhY3RpdmF0ZV90YWIoKVxuIyMjXG5cbmJ1aWxkX3NlbGVjdG9yID0gKGNvbnRhaW5lciwgdGV4dCwgY29tbWFuZCwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICAkLmFqYXhcbiAgICB1cmw6ICdodHRwczovL2FwaS5tb25nb2xhYi5jb20vYXBpLzEvZGF0YWJhc2VzL2dvdndpa2kvcnVuQ29tbWFuZD9hcGlLZXk9MFk1WF9RazJ1T0pSZEhKV0pLU1JXazZsNkpxVlRTMnknXG4gICAgdHlwZTogJ1BPU1QnXG4gICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiXG4gICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgIGRhdGE6IGNvbW1hbmQgI0pTT04uc3RyaW5naWZ5KGNvbW1hbmQpXG4gICAgY2FjaGU6IHRydWVcbiAgICBzdWNjZXNzOiAoZGF0YSkgPT5cbiAgICAgICNhPSQuZXh0ZW5kIHRydWUgW10sZGF0YVxuICAgICAgdmFsdWVzPWRhdGEudmFsdWVzXG4gICAgICBidWlsZF9zZWxlY3RfZWxlbWVudCBjb250YWluZXIsIHRleHQsIHZhbHVlcy5zb3J0KCksIHdoZXJlX3RvX3N0b3JlX3ZhbHVlXG4gICAgICByZXR1cm5cbiAgICBlcnJvcjooZSkgLT5cbiAgICAgIGNvbnNvbGUubG9nIGVcblxuXG5idWlsZF9zZWxlY3RfZWxlbWVudCA9IChjb250YWluZXIsIHRleHQsIGFyciwgd2hlcmVfdG9fc3RvcmVfdmFsdWUgKSAtPlxuICBzICA9IFwiPHNlbGVjdCBjbGFzcz0nZm9ybS1jb250cm9sJyBzdHlsZT0nbWF4d2lkdGg6MTYwcHg7Jz48b3B0aW9uIHZhbHVlPScnPiN7dGV4dH08L29wdGlvbj5cIlxuICBzICs9IFwiPG9wdGlvbiB2YWx1ZT0nI3t2fSc+I3t2fTwvb3B0aW9uPlwiIGZvciB2IGluIGFyciB3aGVuIHZcbiAgcyArPSBcIjwvc2VsZWN0PlwiXG4gIHNlbGVjdCA9ICQocylcbiAgJChjb250YWluZXIpLmFwcGVuZChzZWxlY3QpXG4gIFxuICAjIHNldCBkZWZhdWx0ICdDQSdcbiAgaWYgdGV4dCBpcyAnU3RhdGUuLidcbiAgICBzZWxlY3QudmFsICdDQSdcbiAgICB3aW5kb3cuR09WV0lLSS5zdGF0ZV9maWx0ZXI9J0NBJ1xuICAgIGdvdm1hcC5vbl9ib3VuZHNfY2hhbmdlZF9sYXRlcigpXG5cbiAgc2VsZWN0LmNoYW5nZSAoZSkgLT5cbiAgICBlbCA9ICQoZS50YXJnZXQpXG4gICAgd2luZG93LkdPVldJS0lbd2hlcmVfdG9fc3RvcmVfdmFsdWVdID0gZWwudmFsKClcbiAgICAkKCcuZ292LWNvdW50ZXInKS50ZXh0IGdvdl9zZWxlY3Rvci5jb3VudF9nb3ZzKClcbiAgICBnb3ZtYXAub25fYm91bmRzX2NoYW5nZWQoKVxuXG5cbmFkanVzdF90eXBlYWhlYWRfd2lkdGggPSgpIC0+XG4gIGlucCA9ICQoJyNteWlucHV0JylcbiAgcGFyID0gJCgnI3R5cGVhaGVkLWNvbnRhaW5lcicpXG4gIGlucC53aWR0aCBwYXIud2lkdGgoKVxuXG5cblxuc3RhcnRfYWRqdXN0aW5nX3R5cGVhaGVhZF93aWR0aCA9KCkgLT5cbiAgJCh3aW5kb3cpLnJlc2l6ZSAtPlxuICAgIGFkanVzdF90eXBlYWhlYWRfd2lkdGgoKVxuXG5cbiMgYWRkIGxpdmUgcmVsb2FkIHRvIHRoZSBzaXRlLiBGb3IgZGV2ZWxvcG1lbnQgb25seS5cbmxpdmVyZWxvYWQgPSAocG9ydCkgLT5cbiAgdXJsPXdpbmRvdy5sb2NhdGlvbi5vcmlnaW4ucmVwbGFjZSAvOlteOl0qJC8sIFwiXCJcbiAgJC5nZXRTY3JpcHQgdXJsICsgXCI6XCIgKyBwb3J0LCA9PlxuICAgICQoJ2JvZHknKS5hcHBlbmQgXCJcIlwiXG4gICAgPGRpdiBzdHlsZT0ncG9zaXRpb246YWJzb2x1dGU7ei1pbmRleDoxMDAwO1xuICAgIHdpZHRoOjEwMCU7IHRvcDowO2NvbG9yOnJlZDsgdGV4dC1hbGlnbjogY2VudGVyOyBcbiAgICBwYWRkaW5nOjFweDtmb250LXNpemU6MTBweDtsaW5lLWhlaWdodDoxJz5saXZlPC9kaXY+XG4gICAgXCJcIlwiXG5cbmZvY3VzX3NlYXJjaF9maWVsZCA9IChtc2VjKSAtPlxuICBzZXRUaW1lb3V0ICgtPiAkKCcjbXlpbnB1dCcpLmZvY3VzKCkpICxtc2VjXG5cblxuICBcblxuXG4jID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4jdGVtcGxhdGVzLmxvYWRfdGVtcGxhdGUgXCJ0YWJzXCIsIFwiY29uZmlnL3RhYmxheW91dC5qc29uXCJcbnRlbXBsYXRlcy5sb2FkX2Z1c2lvbl90ZW1wbGF0ZSBcInRhYnNcIiwgXCJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9mdXNpb250YWJsZXMvdjIvcXVlcnk/c3FsPVNFTEVDVCUyMColMjBGUk9NJTIwMXoyb1hRRVlRM3AyT29NSThWNWdLZ0hXQjVUejk5MEJyUTF4YzF0Vm8ma2V5PUFJemFTeUNYRFF5TURwR0EyZzNRanV2NENEdjd6UmotaXg0SVFKQVwiXG5cbmJ1aWxkX3NlbGVjdG9yKCcuc3RhdGUtY29udGFpbmVyJyAsICdTdGF0ZS4uJyAsICd7XCJkaXN0aW5jdFwiOiBcImdvdnNcIixcImtleVwiOlwic3RhdGVcIn0nICwgJ3N0YXRlX2ZpbHRlcicpXG5idWlsZF9zZWxlY3RvcignLmdvdi10eXBlLWNvbnRhaW5lcicgLCAndHlwZSBvZiBnb3Zlcm5tZW50Li4nICwgJ3tcImRpc3RpbmN0XCI6IFwiZ292c1wiLFwia2V5XCI6XCJnb3ZfdHlwZVwifScgLCAnZ292X3R5cGVfZmlsdGVyJylcblxuYWRqdXN0X3R5cGVhaGVhZF93aWR0aCgpXG5zdGFydF9hZGp1c3RpbmdfdHlwZWFoZWFkX3dpZHRoKClcblxuJCgnI2J0bkJhY2tUb1NlYXJjaCcpLmNsaWNrIChlKS0+XG4gIGUucHJldmVudERlZmF1bHQoKVxuICBHT1ZXSUtJLnNob3dfc2VhcmNoX3BhZ2UoKVxuXG4jZm9jdXNfc2VhcmNoX2ZpZWxkIDUwMFxuXG4gIFxuXG5saXZlcmVsb2FkIFwiOTA5MFwiXG5cbiIsIlxuXG5cbiMgVGFrZXMgYW4gYXJyYXkgb2YgZG9jcyB0byBzZWFyY2ggaW4uXG4jIFJldHVybnMgYSBmdW5jdGlvbnMgdGhhdCB0YWtlcyAyIHBhcmFtcyBcbiMgcSAtIHF1ZXJ5IHN0cmluZyBhbmQgXG4jIGNiIC0gY2FsbGJhY2sgdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSBzZWFyY2ggaXMgZG9uZS5cbiMgY2IgcmV0dXJucyBhbiBhcnJheSBvZiBtYXRjaGluZyBkb2N1bWVudHMuXG4jIG11bV9pdGVtcyAtIG1heCBudW1iZXIgb2YgZm91bmQgaXRlbXMgdG8gc2hvd1xuUXVlcnlNYXRoZXIgPSAoZG9jcywgbnVtX2l0ZW1zPTUpIC0+XG4gIChxLCBjYikgLT5cbiAgICB0ZXN0X3N0cmluZyA9KHMsIHJlZ3MpIC0+XG4gICAgICAoaWYgbm90IHIudGVzdChzKSB0aGVuIHJldHVybiBmYWxzZSkgIGZvciByIGluIHJlZ3NcbiAgICAgIHJldHVybiB0cnVlXG5cbiAgICBbd29yZHMscmVnc10gPSBnZXRfd29yZHNfcmVncyBxXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgIyBpdGVyYXRlIHRocm91Z2ggdGhlIHBvb2wgb2YgZG9jcyBhbmQgZm9yIGFueSBzdHJpbmcgdGhhdFxuICAgICMgY29udGFpbnMgdGhlIHN1YnN0cmluZyBgcWAsIGFkZCBpdCB0byB0aGUgYG1hdGNoZXNgIGFycmF5XG5cbiAgICBmb3IgZCBpbiBkb2NzXG4gICAgICBpZiBtYXRjaGVzLmxlbmd0aCA+PSBudW1faXRlbXMgdGhlbiBicmVha1xuICAgICAgaWYgR09WV0lLSS5zdGF0ZV9maWx0ZXIgYW5kIGQuc3RhdGUgaXNudCBHT1ZXSUtJLnN0YXRlX2ZpbHRlciB0aGVuIGNvbnRpbnVlXG4gICAgICBpZiBHT1ZXSUtJLmdvdl90eXBlX2ZpbHRlciBhbmQgZC5nb3ZfdHlwZSBpc250IEdPVldJS0kuZ292X3R5cGVfZmlsdGVyIHRoZW4gY29udGludWVcblxuICAgICAgaWYgdGVzdF9zdHJpbmcoZC5nb3ZfbmFtZSwgcmVncykgdGhlbiBtYXRjaGVzLnB1c2ggJC5leHRlbmQoe30sIGQpXG4gICAgICAjaWYgdGVzdF9zdHJpbmcoXCIje2QuZ292X25hbWV9ICN7ZC5zdGF0ZX0gI3tkLmdvdl90eXBlfSAje2QuaW5jX2lkfVwiLCByZWdzKSB0aGVuIG1hdGNoZXMucHVzaCAkLmV4dGVuZCh7fSwgZClcbiAgICBcbiAgICBzZWxlY3RfdGV4dCBtYXRjaGVzLCB3b3JkcywgcmVnc1xuICAgIGNiIG1hdGNoZXNcbiAgICByZXR1cm5cbiBcblxuIyBpbnNlcnRzIDxzdHJvbmc+IGVsZW1lbnRzZSBpbiBhcnJheVxuc2VsZWN0X3RleHQgPSAoY2xvbmVzLHdvcmRzLHJlZ3MpIC0+XG4gIGZvciBkIGluIGNsb25lc1xuICAgIGQuZ292X25hbWU9c3Ryb25naWZ5KGQuZ292X25hbWUsIHdvcmRzLCByZWdzKVxuICAgICNkLnN0YXRlPXN0cm9uZ2lmeShkLnN0YXRlLCB3b3JkcywgcmVncylcbiAgICAjZC5nb3ZfdHlwZT1zdHJvbmdpZnkoZC5nb3ZfdHlwZSwgd29yZHMsIHJlZ3MpXG4gIFxuICByZXR1cm4gY2xvbmVzXG5cblxuXG4jIGluc2VydHMgPHN0cm9uZz4gZWxlbWVudHNlXG5zdHJvbmdpZnkgPSAocywgd29yZHMsIHJlZ3MpIC0+XG4gIHJlZ3MuZm9yRWFjaCAocixpKSAtPlxuICAgIHMgPSBzLnJlcGxhY2UgciwgXCI8Yj4je3dvcmRzW2ldfTwvYj5cIlxuICByZXR1cm4gc1xuXG4jIHJlbW92ZXMgPD4gdGFncyBmcm9tIGEgc3RyaW5nXG5zdHJpcCA9IChzKSAtPlxuICBzLnJlcGxhY2UoLzxbXjw+XSo+L2csJycpXG5cblxuIyBhbGwgdGlybXMgc3BhY2VzIGZyb20gYm90aCBzaWRlcyBhbmQgbWFrZSBjb250cmFjdHMgc2VxdWVuY2VzIG9mIHNwYWNlcyB0byAxXG5mdWxsX3RyaW0gPSAocykgLT5cbiAgc3M9cy50cmltKCcnK3MpXG4gIHNzPXNzLnJlcGxhY2UoLyArL2csJyAnKVxuXG4jIHJldHVybnMgYW4gYXJyYXkgb2Ygd29yZHMgaW4gYSBzdHJpbmdcbmdldF93b3JkcyA9IChzdHIpIC0+XG4gIGZ1bGxfdHJpbShzdHIpLnNwbGl0KCcgJylcblxuXG5nZXRfd29yZHNfcmVncyA9IChzdHIpIC0+XG4gIHdvcmRzID0gZ2V0X3dvcmRzIHN0clxuICByZWdzID0gd29yZHMubWFwICh3KS0+IG5ldyBSZWdFeHAoXCIje3d9XCIsJ2lnJylcbiAgW3dvcmRzLHJlZ3NdXG5cblxubW9kdWxlLmV4cG9ydHMgPSBRdWVyeU1hdGhlclxuXG4iLCJcbiMjI1xuIyBmaWxlOiB0ZW1wbGF0ZXMyLmNvZmZlZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jXG4jIENsYXNzIHRvIG1hbmFnZSB0ZW1wbGF0ZXMgYW5kIHJlbmRlciBkYXRhIG9uIGh0bWwgcGFnZS5cbiNcbiMgVGhlIG1haW4gbWV0aG9kIDogcmVuZGVyKGRhdGEpLCBnZXRfaHRtbChkYXRhKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjI1xuXG5cblxuIyBMT0FEIEZJRUxEIE5BTUVTIFxuZmllbGROYW1lcyA9IHt9XG5cblxucmVuZGVyX2ZpZWxkX3ZhbHVlID0obixkYXRhKSAtPlxuICB2PWRhdGFbbl1cbiAgaWYgbm90IGRhdGFbbl1cbiAgICByZXR1cm4gJydcblxuICBpZiBuID09IFwid2ViX3NpdGVcIlxuICAgIHJldHVybiBcIjxhIHRhcmdldD0nX2JsYW5rJyBocmVmPScje3Z9Jz4je3Z9PC9hPlwiXG4gIGVsc2VcbiAgICByZXR1cm4gdlxuICBcbiAgXG5cbnJlbmRlcl9maWVsZF9uYW1lID0gKGZOYW1lKSAtPlxuICBpZiBmaWVsZE5hbWVzW2ZOYW1lXT9cbiAgICByZXR1cm4gZmllbGROYW1lc1tmTmFtZV1cblxuICBzID0gZk5hbWUucmVwbGFjZSgvXy9nLFwiIFwiKVxuICBzID0gcy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHMuc3Vic3RyaW5nKDEpXG4gIHJldHVybiBzXG5cblxucmVuZGVyX2ZpZWxkID0gKGZOYW1lLGRhdGEpLT5cbiAgI3JldHVybiAnJyAgdW5sZXNzIGZWYWx1ZSA9IGRhdGFbZk5hbWVdXG4gIFwiXCJcIlxuICA8ZGl2PlxuICAgICAgPHNwYW4gY2xhc3M9J2YtbmFtJz4je3JlbmRlcl9maWVsZF9uYW1lIGZOYW1lfTwvc3Bhbj5cbiAgICAgIDxzcGFuIGNsYXNzPSdmLXZhbCc+I3tyZW5kZXJfZmllbGRfdmFsdWUoZk5hbWUsZGF0YSl9PC9zcGFuPlxuICA8L2Rpdj5cbiAgXCJcIlwiXG5cbiAgXG5yZW5kZXJfZmllbGRzID0oIGZpZWxkcywgZGF0YSkgLT5cbiAgKCByZW5kZXJfZmllbGQoZiwgZGF0YSkgZm9yIGYgaW4gZmllbGRzKS5qb2luKCcnKVxuXG5cbiAgXG51bmRlciA9IChzKSAtPiBzLnJlcGxhY2UoLyAvZywgJ18nKVxuXG5cbnJlbmRlcl90YWJzID0gKGluaXRpYWxfbGF5b3V0LCBkYXRhKSAtPlxuICBsYXlvdXQgPSBhZGRfb3RoZXJfdGFiX3RvX2xheW91dCBpbml0aWFsX2xheW91dCwgZGF0YVxuICBcbiAgIyBUaXRsZVxuICBoID0gXCI8aDM+I3tkYXRhLmdvdl9uYW1lfTwvaDM+XCJcbiAgXG4gICNyZW5kZXIgaGVhZGVyXG4gIGggKz0gJzxkaXYgcm9sZT1cInRhYnBhbmVsXCIgPidcblxuICAjcmVuZGVyIHRhYnNcbiAgaCArPSc8dWwgaWQ9XCJmaWVsZFRhYnNcIiBjbGFzcz1cIm5hdiBuYXYtcGlsbHNcIiByb2xlPVwidGFibGlzdFwiPidcbiAgXG4gIGZvciB0YWIsaSBpbiBsYXlvdXRcbiAgICBhY3RpdmUgPSBpZiBpPjAgdGhlbiAnJyBlbHNlICdhY3RpdmUnXG4gICAgaCArPVwiXCJcIlxuICAgICAgPGxpIHJvbGU9XCJwcmVzZW50YXRpb25cIiBjbGFzcz1cIiN7YWN0aXZlfVwiICBvbmNsaWNrPVwicmVtZW1iZXJfdGFiKCcje3VuZGVyKHRhYi5uYW1lKX0nKVwiPlxuICAgICAgICA8YSBocmVmPVwiI3RhYiN7dW5kZXIodGFiLm5hbWUpfVwiIGFyaWEtY29udHJvbHM9XCJob21lXCIgcm9sZT1cInRhYlwiIGRhdGEtdG9nZ2xlPVwidGFiXCI+XG4gICAgICAgICN7dGFiLm5hbWV9XG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgXCJcIlwiXG5cbiAgaCArPSAnPC91bD4nXG4gIGggKz0gJzxkaXYgaWQ9XCJ0YWJzQ29udGVudFwiIGNsYXNzPVwidGFiLWNvbnRlbnRcIj4nXG5cbiAgI3JlbmRlciB0YWJzIGNvbnRlbnRcbiAgZm9yIHRhYixpIGluIGxheW91dFxuICAgIGFjdGl2ZSA9IGlmIGk+MCB0aGVuICcnIGVsc2UgJ2FjdGl2ZSdcbiAgICBoICs9XCJcIlwiXG4gICAgPGRpdiByb2xlPVwidGFicGFuZWxcIiBjbGFzcz1cInRhYi1wYW5lICN7YWN0aXZlfSBvbmUtdGFiXCIgaWQ9XCJ0YWIje3VuZGVyKHRhYi5uYW1lKX1cIiBzdHlsZT1cInBhZGRpbmctdG9wOiAyMHB4O1wiPlxuICAgICAgICA8aDQ+I3t0YWIubmFtZX08L2g0PlxuICAgICAgICA8YnI+XG4gICAgICAgICN7cmVuZGVyX2ZpZWxkcyB0YWIuZmllbGRzLCBkYXRhfVxuICAgIDwvZGl2PlxuICAgIFwiXCJcIlxuICBcbiAgI3JlbmRlciBmb290ZXJcbiAgaCArPSc8L2Rpdj4nXG4gIGggKz0nPC9kaXY+J1xuICByZXR1cm4gaFxuXG5cbmdldF9sYXlvdXRfZmllbGRzID0gKGxhKSAtPlxuICBmID0ge31cbiAgZm9yIHQgaW4gbGFcbiAgICBmb3IgZmllbGQgaW4gdC5maWVsZHNcbiAgICAgIGZbZmllbGRdID0gMVxuICByZXR1cm4gZlxuXG5nZXRfcmVjb3JkX2ZpZWxkcyA9IChyKSAtPlxuICBmID0ge31cbiAgZm9yIGZpZWxkX25hbWUgb2YgclxuICAgIGZbZmllbGRfbmFtZV0gPSAxXG4gIHJldHVybiBmXG5cbmdldF91bm1lbnRpb25lZF9maWVsZHMgPSAobGEsIHIpIC0+XG4gIGxheW91dF9maWVsZHMgPSBnZXRfbGF5b3V0X2ZpZWxkcyBsYVxuICByZWNvcmRfZmllbGRzID0gZ2V0X3JlY29yZF9maWVsZHMgclxuICB1bm1lbnRpb25lZF9maWVsZHMgPSBbXVxuICB1bm1lbnRpb25lZF9maWVsZHMucHVzaChmKSBmb3IgZiBvZiByZWNvcmRfZmllbGRzIHdoZW4gbm90IGxheW91dF9maWVsZHNbZl1cbiAgcmV0dXJuIHVubWVudGlvbmVkX2ZpZWxkc1xuXG5cbmFkZF9vdGhlcl90YWJfdG9fbGF5b3V0ID0gKGxheW91dD1bXSwgZGF0YSkgLT5cbiAgI2Nsb25lIHRoZSBsYXlvdXRcbiAgbCA9ICQuZXh0ZW5kIHRydWUsIFtdLCBsYXlvdXRcbiAgdCA9XG4gICAgbmFtZTogXCJPdGhlclwiXG4gICAgZmllbGRzOiBnZXRfdW5tZW50aW9uZWRfZmllbGRzIGwsIGRhdGFcblxuICBsLnB1c2ggdFxuICByZXR1cm4gbFxuXG5cbiMgY29udmVydHMgdGFiIHRlbXBsYXRlIGRlc2NyaWJlZCBpbiBnb29nbGUgZnVzaW9uIHRhYmxlIHRvIFxuIyB0YWIgdGVtcGxhdGVcbmNvbnZlcnRfZnVzaW9uX3RlbXBsYXRlPSh0ZW1wbCkgLT5cbiAgdGFiX2hhc2g9e31cbiAgdGFicz1bXVxuICAjIHJldHVybnMgaGFzaCBvZiBmaWVsZCBuYW1lcyBhbmQgdGhlaXIgcG9zaXRpb25zIGluIGFycmF5IG9mIGZpZWxkIG5hbWVzXG4gIGdldF9jb2xfaGFzaCA9IChjb2x1bW5zKSAtPlxuICAgIGNvbF9oYXNoID17fVxuICAgIGNvbF9oYXNoW2NvbF9uYW1lXT1pIGZvciBjb2xfbmFtZSxpIGluIHRlbXBsLmNvbHVtbnNcbiAgICByZXR1cm4gY29sX2hhc2hcbiAgXG4gICMgcmV0dXJucyBmZWlsZCB2YWx1ZSBieSBpdHMgbmFtZSwgYXJyYXkgb2YgZmllbGRzLCBhbmQgaGFzaCBvZiBmaWVsZHNcbiAgdmFsID0gKGZpZWxkX25hbWUsIGZpZWxkcywgY29sX2h1c2gpIC0+XG4gICAgZmllbGRzW2NvbF9oYXNoW2ZpZWxkX25hbWVdXVxuICBcbiAgIyBjb252ZXJ0cyBoYXNoIHRvIGFuIGFycmF5IHRlbXBsYXRlXG4gIGhhc2hfdG9fYXJyYXkgPShoYXNoKSAtPlxuICAgIGEgPSBbXVxuICAgIGZvciBrIG9mIGhhc2hcbiAgICAgIHRhYiA9IHt9XG4gICAgICB0YWIubmFtZT1rXG4gICAgICB0YWIuZmllbGRzPWhhc2hba11cbiAgICAgIGEucHVzaCB0YWJcbiAgICByZXR1cm4gYVxuXG4gICAgXG4gIGNvbF9oYXNoID0gZ2V0X2NvbF9oYXNoKHRlbXBsLmNvbF9oYXNoKVxuICBcbiAgZm9yIHJvdyxpIGluIHRlbXBsLnJvd3NcbiAgICBjYXRlZ29yeSA9IHZhbCAnZ2VuZXJhbF9jYXRlZ29yeScsIHJvdywgY29sX2hhc2hcbiAgICAjdGFiX2hhc2hbY2F0ZWdvcnldPVtdIHVubGVzcyB0YWJfaGFzaFtjYXRlZ29yeV1cbiAgICBmaWVsZE5hbWVzW3ZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hdPXZhbCAnZGVzY3JpcHRpb24nLCByb3csIGNvbF9oYXNoXG4gICAgaWYgY2F0ZWdvcnlcbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XT89W11cbiAgICAgIHRhYl9oYXNoW2NhdGVnb3J5XS5wdXNoIHZhbCAnZmllbGRfbmFtZScsIHJvdywgY29sX2hhc2hcblxuICB0YWJzID0gaGFzaF90b19hcnJheSh0YWJfaGFzaClcbiAgcmV0dXJuIHRhYnNcblxuXG5jbGFzcyBUZW1wbGF0ZXMyXG5cbiAgQGxpc3QgPSB1bmRlZmluZWRcblxuICBjb25zdHJ1Y3RvcjooKSAtPlxuICAgIEBsaXN0ID0gW11cblxuICBhZGRfdGVtcGxhdGU6IChsYXlvdXRfbmFtZSwgbGF5b3V0X2pzb24pIC0+XG4gICAgQGxpc3QucHVzaFxuICAgICAgbmFtZTpsYXlvdXRfbmFtZVxuICAgICAgcmVuZGVyOihkYXQpIC0+XG4gICAgICAgIHJlbmRlcl90YWJzKGxheW91dF9qc29uLCBkYXQpXG5cblxuICBsb2FkX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICBAYWRkX3RlbXBsYXRlKHRlbXBsYXRlX25hbWUsIHRlbXBsYXRlX2pzb24pXG4gICAgICAgIHJldHVyblxuXG4gIGxvYWRfZnVzaW9uX3RlbXBsYXRlOih0ZW1wbGF0ZV9uYW1lLCB1cmwpIC0+XG4gICAgJC5hamF4XG4gICAgICB1cmw6IHVybFxuICAgICAgZGF0YVR5cGU6ICdqc29uJ1xuICAgICAgY2FjaGU6IHRydWVcbiAgICAgIHN1Y2Nlc3M6ICh0ZW1wbGF0ZV9qc29uKSA9PlxuICAgICAgICB0ID0gY29udmVydF9mdXNpb25fdGVtcGxhdGUgdGVtcGxhdGVfanNvblxuICAgICAgICBjb25zb2xlLmxvZyB0XG4gICAgICAgIEBhZGRfdGVtcGxhdGUodGVtcGxhdGVfbmFtZSwgdClcbiAgICAgICAgcmV0dXJuXG5cblxuICBnZXRfbmFtZXM6IC0+XG4gICAgKHQubmFtZSBmb3IgdCBpbiBAbGlzdClcblxuICBnZXRfaW5kZXhfYnlfbmFtZTogKG5hbWUpIC0+XG4gICAgZm9yIHQsaSBpbiBAbGlzdFxuICAgICAgaWYgdC5uYW1lIGlzIG5hbWVcbiAgICAgICAgcmV0dXJuIGlcbiAgICAgcmV0dXJuIC0xXG5cbiAgZ2V0X2h0bWw6IChpbmQsIGRhdGEpIC0+XG4gICAgaWYgKGluZCBpcyAtMSkgdGhlbiByZXR1cm4gIFwiXCJcbiAgICBcbiAgICBpZiBAbGlzdFtpbmRdXG4gICAgICByZXR1cm4gQGxpc3RbaW5kXS5yZW5kZXIoZGF0YSlcbiAgICBlbHNlXG4gICAgICByZXR1cm4gXCJcIlxuXG5cblxubW9kdWxlLmV4cG9ydHMgPSBUZW1wbGF0ZXMyXG4iXX0=
